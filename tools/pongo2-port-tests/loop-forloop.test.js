const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { readRawTemplate, getTemplatesDir } = require('./helpers/pongo2');
const templates = getTemplatesDir();

// loop.* / forloop.* 循环变量验证
// 来源：pongo2check main.go SanitizingLoader
//   - Gridea Pro 真机将 Jinja2 loop.* 映射为 Pongo2 forloop.*
//   - loop.index0 → forloop.Counter0
//   - loop.index → forloop.Counter
//   - loop.first → forloop.First
//   - loop.last → forloop.Last
//
// 注意：模板中写 loop.* 或 forloop.* 都能通过真机（SanitizingLoader 会映射）
// 但测试验证的是迁移者是否正确使用了循环变量

function walkHtml(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkHtml(full));
    else if (entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

test('循环变量使用 loop.* 或 forloop.*（Gridea 真机会映射 loop→forloop）', () => {
  const allFiles = walkHtml(templates);
  let usedLoopVars = false;

  for (const file of allFiles) {
    const source = readRawTemplate(file);
    // 检查是否使用了循环变量
    if (/\bloop\.(index|index0|first|last|revindex|revindex0)\b/.test(source) ||
        /\bforloop\.(Counter|Counter0|First|Last|Revcounter|Revcounter0)\b/.test(source)) {
      usedLoopVars = true;
      break;
    }
  }

  // 这是一个信息性测试，不强制要求（部分主题可能不用循环变量）
  if (!usedLoopVars) {
    console.log('  (info) 未检测到 loop.*/forloop.* 循环变量使用');
  }
});

test('tag.html 循环分组使用 loop.first/loop.last 控制边界（如存在）', () => {
  const filePath = path.join(templates, 'tag.html');
  if (!fs.existsSync(filePath)) return;
  const source = readRawTemplate(filePath);

  // anatolo 风格的 tag.html 用 loop.first/last 控制年份分组边界
  if (/post\.date\|slice:"0:4"/.test(source)) {
    // 使用了年份截取，应配合 loop.first/last
    assert.match(
      source,
      /loop\.(first|last)/,
      'tag.html 按年份分组应使用 loop.first/loop.last 控制分组边界'
    );
  }
});

test('相关文章使用 forloop.Counter 限制数量（如存在）', () => {
  // anubis2 风格：{% if forloop.Counter <= theme_config.readNextPosts %}
  const filePath = path.join(templates, 'post.html');
  if (!fs.existsSync(filePath)) return;
  const source = readRawTemplate(filePath);

  // 如果有相关文章逻辑（readNextPosts 配置），检查 forloop.Counter 使用
  if (/readNextPosts|related.?post/i.test(source)) {
    assert.match(
      source,
      /forloop\.Counter/,
      '相关文章限制数量应使用 forloop.Counter（Gridea Pro 映射后变量）'
    );
  }
});

test('theme_config 数字比较前需 |to_int（如存在数字配置比较）', () => {
  const allFiles = walkHtml(templates);
  const violations = [];

  for (const file of allFiles) {
    const source = readRawTemplate(file);
    const rel = path.relative(templates, file);

    // 检查 theme_config.xxx 与数字直接比较（未 to_int）
    // 匹配：theme_config.count > 8 或 theme_config.count <= 5 等
    // 但排除已 to_int 的：theme_config.count|to_int > 8
    const lines = source.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 查找 theme_config.xxx 后跟比较运算符和数字
      const match = line.match(/theme_config\.\w+\s*(>|<|>=|<=|==|!=)\s*\d/);
      if (match && !/theme_config\.\w+\|to_int/.test(line)) {
        violations.push(`${rel}:${i + 1} ${line.trim()}`);
      }
    }
  }

  if (violations.length > 0) {
    console.log('  (warn) theme_config 数字比较未使用 |to_int：');
    violations.forEach((v) => console.log('    ' + v));
    console.log('  Gridea Pro 中 theme_config 值可能为字符串，比较前需 |to_int');
  }
});
