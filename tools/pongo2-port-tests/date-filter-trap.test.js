const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { readRawTemplate, getTemplatesDir } = require('./helpers/pongo2');
const templates = getTemplatesDir();

// 禁止 |date filter —— Pongo2 致命陷阱
// 来源：hexo-port-mappings-pongo2.md 陷阱记录
//   - "date filter 不可用" — post.date 在 Pongo2 中是 RFC3339 字符串，|date 报错整页降级
//   - 正确做法：展示用 post.dateFormat，datetime 属性用 post.date，归档 MM-DD 用 post.date|slice:"5:10"

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

test('全局禁止对 post.date 使用 |date filter', () => {
  const allFiles = walkHtml(templates);
  const violations = [];

  for (const file of allFiles) {
    const source = readRawTemplate(file);
    const rel = path.relative(templates, file);
    // 匹配 post.date|date 或 post.date |date（带空格）
    if (/post\.date\s*\|\s*date/.test(source)) {
      violations.push(rel);
    }
  }

  assert.equal(
    violations.length,
    0,
    `以下文件对 post.date 使用了 |date filter（会报错整页降级）：\n${violations.join('\n')}\n` +
      '正确做法：展示用 post.dateFormat，datetime 属性用 post.date，MM-DD 用 post.date|slice:"5:10"'
  );
});

test('日期展示使用 post.dateFormat（非 post.date|date）', () => {
  // 至少在 post.html 或 post-card.html 中应出现 dateFormat
  const candidates = [
    path.join(templates, 'post.html'),
    path.join(templates, 'partials', 'post-card.html'),
    path.join(templates, 'partials', 'post-meta.html'),
  ];

  let foundDateFormat = false;
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const source = readRawTemplate(file);
    if (/post\.dateFormat/.test(source)) {
      foundDateFormat = true;
      break;
    }
  }

  if (candidates.some((f) => fs.existsSync(f))) {
    assert.ok(
      foundDateFormat,
      '应使用 post.dateFormat 展示日期（非 post.date|date）'
    );
  }
});

test('datetime 属性使用 post.date（原始 RFC3339，非 dateFormat）', () => {
  // 检查 <time datetime="{{ post.date }}"> 模式
  const candidates = [
    path.join(templates, 'post.html'),
    path.join(templates, 'partials', 'post-card.html'),
    path.join(templates, 'partials', 'post-meta.html'),
  ];

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const source = readRawTemplate(file);
    // 如果有 datetime 属性，应使用 post.date
    if (/datetime=/.test(source)) {
      assert.match(
        source,
        /datetime=["']\{\{\s*post\.date/,
        `${path.relative(templates, file)}: datetime 属性应使用 post.date（RFC3339 原始值）`
      );
    }
  }
});
