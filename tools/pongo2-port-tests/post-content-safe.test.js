const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { readRawTemplate, getTemplatesDir } = require('./helpers/pongo2');
const templates = getTemplatesDir();

// post.content / post.abstract / post.toc 必须 |safe 输出
// 来源：hexo-port-mappings-pongo2.md 陷阱记录
//   - "post.content|safe" — HTML 内容必须 safe，否则标签被转义为纯文本
//   - "post.abstract|safe" / "post.toc|safe"

test('post.html 或 post-card.html 使用 post.content|safe 输出正文', () => {
  // 部分主题（如 typography）将正文渲染放在 post-card.html partial 中
  const candidates = [
    path.join(templates, 'post.html'),
    path.join(templates, 'partials', 'post-card.html'),
  ];

  let foundUnsafe = false;
  let foundSafe = false;

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const source = readRawTemplate(filePath);

    if (/post\.content\|safe/.test(source)) {
      foundSafe = true;
    }
    // 检查不带 |safe 的 post.content（会转义）
    if (/\{\{\s*post\.content\s*\}\}/.test(source)) {
      foundUnsafe = true;
    }
  }

  assert.ok(foundSafe, 'post.html 或 post-card.html 应使用 post.content|safe 输出正文');
  assert.ok(!foundUnsafe, '不应使用 {{ post.content }}（缺 |safe 会转义 HTML 标签）');
});

test('post-card.html 摘要使用 post.abstract|safe 或 striptags 处理', () => {
  const candidates = [
    path.join(templates, 'partials', 'post-card.html'),
    path.join(templates, 'partials', 'post-summary.html'),
  ];
  const filePath = candidates.find((p) => fs.existsSync(p));
  if (!filePath) return;
  const source = readRawTemplate(filePath);

  // 如果使用 abstract，必须 |safe
  if (/post\.abstract/.test(source)) {
    assert.match(
      source,
      /post\.abstract\|safe/,
      'post.abstract 必须 |safe 输出（HTML 内容）'
    );
    assert.doesNotMatch(
      source,
      /\{\{\s*post\.abstract\s*\}\}/,
      '不应使用 {{ post.abstract }}（缺 |safe 会转义）'
    );
  }
});

test('post.toc 输出使用 |safe（如主题含 TOC 功能）', () => {
  // 搜索所有模板中的 post.toc 引用
  function walk(dir) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) results.push(...walk(full));
      else if (entry.name.endsWith('.html')) results.push(full);
    }
    return results;
  }

  const allFiles = walk(templates);
  for (const file of allFiles) {
    const source = readRawTemplate(file);
    if (/post\.toc/.test(source)) {
      assert.match(
        source,
        /post\.toc\|safe/,
        `${path.relative(templates, file)}: post.toc 必须 |safe 输出`
      );
      assert.doesNotMatch(
        source,
        /\{\{\s*post\.toc\s*\}\}/,
        `${path.relative(templates, file)}: 不应使用 {{ post.toc }}（缺 |safe）`
      );
    }
  }
});
