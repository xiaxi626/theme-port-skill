#!/usr/bin/env node
// ejs2check — Gridea Pro 真 EJS 语法校验器
//
// 使用 Gridea Pro 真机同款 EJS 解析器编译主题全部 .ejs 模板，零假阳性。
// Gridea Pro 前端 package.json 依赖 ejs ^3.1.10，与本工具依赖一致。
// EJS 在 Gridea Pro 中无自定义 filter/预处理，因此官方 ejs.compile 即可等价。
//
// 用法:
//   node main.js <theme-directory>            # 语法编译（快速）
//   node main.js <theme-directory> --render   # + 完整 renderFile 集成（检查 include 链）
//   npm install -g . && ejs2check <theme-directory>

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// ---- 参数解析 ----
const args = process.argv.slice(2);
let themeDir = null;
let renderMode = false;
for (const a of args) {
  if (a === '--render') renderMode = true;
  else if (a === '--help' || a === '-h') {
    console.log('Usage: ejs2check <theme-directory> [--render]');
    console.log('');
    console.log('Options:');
    console.log('  --render    Use ejs.renderFile() instead of ejs.compile()');
    console.log('              This fully resolves include() chains (slower but more thorough).');
    console.log('              Required for detecting include path issues.');
    console.log('  -h, --help  Show this help message');
    process.exit(0);
  } else if (!a.startsWith('-')) {
    themeDir = a;
  }
}
if (!themeDir) {
  console.error('Usage: ejs2check <theme-directory> [--render]');
  console.error('');
  console.error('  --render    Use ejs.renderFile() to fully resolve include chains');
  process.exit(2);
}

// ---- 静态 include 引用检查 ----
// EJS include 语法: <%- include('partials/xxx', {data}) %>
// 支持: 单引号/双引号/无引号
const reInclude = /<%-?\s*include\s*\(\s*['"]?([^'")\s]+)['"]?/g;

function resolveIncludePath(baseDir, ref, viewsDir) {
  // EJS include 解析优先级:
  // 1. 绝对路径: ref 本身就是绝对路径
  // 2. 相对路径: ref 相对于当前文件的目录
  // 3. root/views: ref 相对于 views 目录
  // 4. 自动追加扩展名: .ejs (默认), .html (备选)
  const candidates = [];

  if (path.isAbsolute(ref)) {
    candidates.push(ref);
  } else {
    // 相对当前文件目录
    candidates.push(path.resolve(baseDir, ref));
  }

  // 如果没有扩展名，追加 .ejs / .html
  if (!path.extname(ref)) {
    const extraCandidates = [];
    for (const c of [...candidates]) {
      extraCandidates.push(c + '.ejs');
      extraCandidates.push(c + '.html');
    }
    candidates.push(...extraCandidates);
  }

  // 相对于 viewsDir (templates root)
  // 对于 include('partials/header') 这种写法
  const refAsRelative = ref.startsWith('/') ? ref.slice(1) : ref;
  if (!path.extname(refAsRelative)) {
    candidates.push(
      path.join(viewsDir, refAsRelative + '.ejs'),
      path.join(viewsDir, refAsRelative + '.html')
    );
  } else {
    candidates.push(path.join(viewsDir, refAsRelative));
  }

  return candidates;
}

function checkStaticRefs(templatesDir, filePath, content) {
  const warns = [];
  let m;
  while ((m = reInclude.exec(content)) !== null) {
    const ref = m[1];
    const fileDir = path.dirname(filePath);
    const candidates = resolveIncludePath(fileDir, ref, templatesDir);
    let found = candidates.some(p => fs.existsSync(p));

    if (!found) {
      const rel = path.relative(templatesDir, filePath);
      warns.push(`templates/${rel} → referenced file not found: ${ref}`);
    }
  }
  return warns;
}

// ---- 引擎检测 ----
function detectEngine(themeDir) {
  const configPath = path.join(themeDir, 'config.json');
  try {
    // 剥离 BOM：Windows 编辑器/工具写出的 UTF-8 常带 \uFEFF，会令 JSON.parse 失败
    const data = fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, '');
    const cfg = JSON.parse(data);
    const engine = (cfg.engine || '').toLowerCase();
    console.log(`config.json engine: ${engine || 'default'}`);
    return engine;
  } catch {
    console.log('warn: config.json not found or invalid, assuming ejs');
    return '';
  }
}

// ---- 安全数据（--render 模式专用）----
// 递归代理：任意属性访问/函数调用都返回可继续链式的代理自身；
// 数字上下文为 0、字符串上下文为空串、迭代为空。
// 模板引用任何真实数据（site.customConfig.xxx、post.tags 等）时都不会
// 因 undefined 抛错——--render 只验证 include 链与模板结构，零假阳性。
//
// ejs 编译出的函数形如 function(locals, escapeFn, include, rethrow) {
//   with (locals) { ... } }，with 作用域优先于函数作用域，因此 has 陷阱
// 必须对 ejs 内部标识符放行（返回 false），否则 include/escapeFn/__append
// 会被劫持到代理上：include 报错被吞、输出静默丢失。
const EJS_RESERVED = new Set([
  '__append', '__output', '__line', '__lines', '__filename',
  'escapeFn', 'include', 'rethrow', 'locals',
]);

function makeSafeData() {
  const proxy = new Proxy(function () {}, {
    get(_target, prop) {
      if (prop === Symbol.toPrimitive) {
        return (hint) => (hint === 'number' ? 0 : '');
      }
      if (prop === Symbol.iterator) {
        return function* () {}; // 可迭代但为空（Array.from / for...of 安全）
      }
      if (prop === Symbol.unscopables) return undefined; // 不启用 unscopables 排除
      if (prop === 'length') return 0; // 数组循环安全跳过
      if (prop === 'then') return undefined; // 防止被当作 thenable
      return proxy; // 任意属性均可继续链式访问
    },
    has(_target, prop) {
      // ejs 内部标识符放行给函数自身作用域，其余全部命中本代理
      if (typeof prop !== 'string') return false;
      return !EJS_RESERVED.has(prop);
    },
    apply() {
      return proxy; // 任意调用均可继续链式（如 posts.forEach(...)）
    },
    construct() {
      return proxy;
    },
  });
  return proxy;
}

// ---- 主逻辑 ----
// --render 模式的错误分级：
//   真正断链的 include / 编译错误 → FAIL（真机同样必败）；
//   其余（嵌套 include 的局部数据被 ejs 内部浅拷贝为空对象，导致
//   ReferenceError/TypeError，或 JSON.parse(占位值) 等数据相关运行时
//   错误）→ WARN，避免假阳性——真机注入真实数据后通常不存在。
function isFatalRenderError(err) {
  return /while compiling ejs|Could not find the include file|ENOENT|no such file or directory/i.test(err.message);
}

function main() {
  themeDir = path.resolve(themeDir);

  // 引擎检测
  const engine = detectEngine(themeDir);
  if (engine && engine !== 'ejs') {
    console.log(`skip: engine '${engine}' is not ejs`);
    process.exit(0);
  }

  const templatesDir = path.join(themeDir, 'templates');
  if (!fs.existsSync(templatesDir)) {
    console.error(`FATAL: templates directory not found: ${templatesDir}`);
    process.exit(1);
  }

  // 收集 .ejs 文件
  const tmplFiles = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (path.extname(entry.name).toLowerCase() === '.ejs') {
        tmplFiles.push(fullPath);
      }
    }
  }
  walk(templatesDir);

  if (tmplFiles.length === 0) {
    console.log('SKIP: no .ejs template files found in templates/');
    process.exit(0);
  }

  console.log(`Found ${tmplFiles.length} .ejs template file(s)`);
  if (renderMode) {
    console.log('Mode: renderFile (full include resolution)');
  } else {
    console.log('Mode: compile-only (fast, --render for include resolution)');
  }
  console.log();

  // 逐个编译
  let passed = 0;
  let failed = 0;
  const warns = [];

  for (const file of tmplFiles) {
    const rel = path.relative(templatesDir, file).replace(/\\/g, '/');
    const source = fs.readFileSync(file, 'utf8');

    // 静态 include 检查
    const fileWarns = checkStaticRefs(templatesDir, file, source);
    warns.push(...fileWarns);

    if (renderMode) {
      // renderFile 模式：完整解析 include 链（含嵌套 include）
      // 必须提供回调：ejs.renderFile 无回调时走 Promise 路径，
      // 错误会成为未被捕获的 rejected Promise（try/catch 抓不到，误报 PASS）。
      // 数据用"安全数据"代理（见 makeSafeData）：模板引用真实数据不报错，
      // 保证执行能走到 include 调用点；ejs 内部对嵌套 include 浅拷贝数据
      // （空对象），其中引用数据的运行时错误按 isFatalRenderError 归为 WARN。
      try {
        ejs.renderFile(file, makeSafeData(), {
          views: [templatesDir, path.join(templatesDir, 'partials')],
          async: false
        }, (err) => {
          if (err) throw err;
        });
        console.log(`PASS  templates/${rel}`);
        passed++;
      } catch (err) {
        if (isFatalRenderError(err)) {
          console.log(`FAIL  templates/${rel}  ${err.message}`);
          failed++;
        } else {
          const firstLine = err.message.split('\n')[0];
          warns.push(`templates/${rel} [render] 数据相关运行时错误（真机数据下通常不存在）：${firstLine}`);
        }
      }
    } else {
      // compile 模式：快速语法检查
      try {
        ejs.compile(source, { filename: file, async: false });
        console.log(`PASS  templates/${rel}`);
        passed++;
      } catch (err) {
        console.log(`FAIL  templates/${rel}  ${err.message}`);
        failed++;
      }
    }
  }

  // 警告
  for (const w of warns) {
    console.log(`WARN  ${w}`);
  }
  if (warns.length > 0) {
    console.log();
  }

  // 汇总
  const bar = '='.repeat(44);
  console.log(bar);
  console.log(`  PASS: ${passed}  FAIL: ${failed}  WARN: ${warns.length}`);
  console.log(bar);

  if (failed > 0) {
    console.log('\n  Fix the FAIL items above. The real Gridea Pro EJS parser would also reject them.');
    process.exit(1);
  }
  if (warns.length > 0) {
    console.log('\n  All templates parsed. WARN items are advisory — consider fixing them.');
  } else {
    console.log('\n  All templates pass the real EJS parser.');
  }
}

main();
