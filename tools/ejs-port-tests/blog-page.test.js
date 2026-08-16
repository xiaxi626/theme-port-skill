const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('./helpers/ejs');

// 断言分级（详见 tools/ejs-port-tests/README.md）：
//   L1 通用断言 —— 适用于所有 EJS 目标迁移，失败即主题缺陷
//   L2 主题专有断言 —— 绑定源主题 indigo，迁移其他主题前须按 README 调整
// 本文件：全部为 L2（indigo 专有：blog.ejs 页面、post-summary partial、
//         index-header 样式、分页 baseUrl /post/）

const templates = path.join(__dirname, '..', 'templates');

test('blog.ejs 与首页一致的列表结构，仅头部与分页 baseUrl 不同', () => {
  const raw = fs.readFileSync(path.join(templates, 'blog.ejs'), 'utf8');
  // 剥离 EJS 注释，避免注释中的说明文字（如「不用 indexTitle」）干扰代码断言
  const source = raw.replace(/<%#[\s\S]*?%>/g, '');

  // 头部差异：title 固定「博客」、无首页副标题、菜单激活 /post
  assert.match(source, /<h1 class="title">博客<\/h1>/, 'title 应为「博客」');
  assert.match(source, /<h5 class="subtitle"><\/h5>/, 'subtitle 应为空');
  assert.doesNotMatch(source, /indexSubtitle|showIndexSubtitle|indexTitle/, '不应引用首页标题/副标题配置');
  assert.match(source, /include\(['"]partials\/header['"],\s*\{\s*activeMenuLink:\s*['"]\/post['"]\s*\}\)/, '菜单激活 /post');
  assert.match(source, /class="content-header index-header"/, '保留 index-header 样式');

  // 列表结构与首页一致（itemprop、摘要、阅读全文、标签、分页）
  assert.match(source, /itemprop="blogPost"/, '文章卡 itemprop');
  assert.match(source, /include\(['"]partials\/post-summary['"]/, '摘要 partial');
  assert.match(source, /post-more waves-effect waves-button/, '阅读全文按钮');
  assert.match(source, /baseUrl:\s*['"]\/post\/['"]/, '分页 baseUrl 应为 /post/');
});

test('blog.ejs EJS 编译无语法错误', () => {
  const filename = path.join(templates, 'blog.ejs');
  const source = fs.readFileSync(filename, 'utf8');
  assert.doesNotThrow(() => ejs.compile(source, { filename }));
});
