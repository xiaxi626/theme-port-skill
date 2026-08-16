const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { readRawTemplate, getTemplatesDir } = require('./helpers/pongo2');
const templates = getTemplatesDir();

// 归档页：group.Year / group.Posts 大写键名 + post.date|slice 日期截取
// 来源：hexo-port-mappings-pongo2.md 陷阱记录
//   - "归档页年份分组丢失" / "group.Year/group.Posts 大写键名"
//   - "post.date|slice:"5:10" 用于归档页 MM-DD"

test('archives.html 使用 archives 数组按年分组，或用客户端 JS 重建分组', () => {
  const filePath = path.join(templates, 'archives.html');
  if (!fs.existsSync(filePath)) return; // 主题无归档页则跳过
  const source = readRawTemplate(filePath);

  // 兼容两种归档实现：
  //   1. 服务端分组：{% for group in archives %}（anatolo/typography 风格）
  //   2. 客户端 JS 重建：遍历 posts + JS 提取年份（anubis2 风格）
  // 注意：Jinja2 trim 标记 {%- -%} 中 - 可在 % 两侧，正则用 [%-]* 兼容
  const tagOpen = '%[\\-]?';
  const tagClose = '[\\-]?%';
  const hasServerGroup = new RegExp(`\\{${tagOpen}\\s*for\\s+group\\s+in\\s+archives\\s*${tagClose}\\}`).test(source);
  const hasClientGroup = new RegExp(`\\{${tagOpen}\\s*for\\s+post\\s+in\\s+posts`).test(source) &&
    /data-year|archive-year|年份/.test(source);
  assert.ok(
    hasServerGroup || hasClientGroup,
    '应使用 archives 数组按年分组，或遍历 posts + 客户端 JS 重建分组'
  );
});

test('archives.html 若用服务端分组，则使用大写 group.Year 键名', () => {
  const filePath = path.join(templates, 'archives.html');
  if (!fs.existsSync(filePath)) return;
  const source = readRawTemplate(filePath);

  // 仅在采用服务端分组时检查
  if (!/\{%[-]?\s*for\s+group\s+in\s+archives/.test(source)) return;

  assert.match(source, /group\.Year/, '应使用大写 group.Year');
  assert.doesNotMatch(
    source,
    /group\.year(?!s)/,
    '不应使用小写 group.year（Pongo2 静默取空，循环体不输出）'
  );
});

test('archives.html 若用服务端分组，则使用大写 group.Posts 键名', () => {
  const filePath = path.join(templates, 'archives.html');
  if (!fs.existsSync(filePath)) return;
  const source = readRawTemplate(filePath);

  // 兼容 {%- for group in archives -%} 的 trim 标记
  if (!/\{%[-]?\s*for\s+group\s+in\s+archives/.test(source)) return;

  assert.match(source, /group\.Posts/, '应使用大写 group.Posts');
  assert.doesNotMatch(
    source,
    /group\.posts/,
    '不应使用小写 group.posts（Pongo2 静默取空，循环体不输出）'
  );
});

test('archives.html 若展示 MM-DD，则使用 post.date|slice:"5:10"（非 |date filter）', () => {
  const filePath = path.join(templates, 'archives.html');
  if (!fs.existsSync(filePath)) return;
  const source = readRawTemplate(filePath);

  // 仅在模板中有 post.date 引用时检查 slice 用法
  if (!/post\.date/.test(source)) return;

  // 禁止对 post.date 使用 |date filter（post.date 是 RFC3339 字符串，|date 会报错）
  assert.doesNotMatch(
    source,
    /post\.date\|date/,
    '禁止 post.date|date（post.date 是字符串，|date filter 会报错整页降级）'
  );
  // 如果有 slice 用法，检查是 5:10（MM-DD）
  if (/post\.date\|slice/.test(source)) {
    assert.match(
      source,
      /post\.date\|slice:"5:10"/,
      '应使用 post.date|slice:"5:10" 截取 MM-DD'
    );
  }
});

test('archives.html 文章链接使用 post.link（非 url_for helper）', () => {
  const filePath = path.join(templates, 'archives.html');
  if (!fs.existsSync(filePath)) return;
  const source = readRawTemplate(filePath);

  assert.match(source, /post\.link/, '应使用 post.link 作为文章链接');
  assert.doesNotMatch(source, /url_for\s*\(/, '不应使用 url_for() helper');
});
