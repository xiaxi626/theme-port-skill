const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const templates = path.join(__dirname, '..', 'templates');
const partials = path.join(templates, 'partials');

// 断言分级（详见 tools/ejs-port-tests/README.md）：
//   L1 通用断言 —— 适用于所有 EJS 目标迁移，失败即主题缺陷
//   L2 主题专有断言 —— 绑定源主题 indigo，迁移其他主题前须按 README 调整
// 本文件：[L1] tag.link / tag.count / baseUrl 等 Gridea 变量用法
//         [L2] 原版 paginator HTML 结构（page-number/current/space 类名、
//              「上一页/下一页」文案，源自 indigo 原版 Hexo 主题）

test('paginator.ejs 分页部分存在且使用原版 HTML 结构', () => {
  const paginatorSource = fs.readFileSync(path.join(partials, 'paginator.ejs'), 'utf8');
  assert.match(paginatorSource, /extend prev/, '上一页按钮类名');
  assert.match(paginatorSource, /extend next/, '下一页按钮类名');
  assert.match(paginatorSource, /page-number/, '数字页按钮类名');
  assert.match(paginatorSource, /span class="current"/, '当前页类名');
  assert.match(paginatorSource, /span class="space"/, '省略号类名');
  assert.match(paginatorSource, /上一页/, '上一页文案');
  assert.match(paginatorSource, /下一页/, '下一页文案');
  assert.doesNotMatch(paginatorSource, /&laquo;|&raquo;/, '不应包含旧版箭头字符');
});

test('index.ejs 使用 paginator 部分且传入 baseUrl', () => {
  const source = fs.readFileSync(path.join(templates, 'index.ejs'), 'utf8');
  assert.match(source, /include\(['"]partials\/paginator['"]/, 'index.ejs 应 include paginator');
  assert.match(source, /baseUrl:/, 'index.ejs 应定义 baseUrl 属性');
  assert.doesNotMatch(source, /id="page-nav"/, 'index.ejs 不应内联定义 page-nav（已迁移到 paginator）');
});

test('category.ejs 使用 paginator 部分', () => {
  const source = fs.readFileSync(path.join(templates, 'category.ejs'), 'utf8');
  assert.match(source, /include\(['"]partials\/paginator['"]/, 'category.ejs 应 include paginator');
  assert.doesNotMatch(source, /id="page-nav"/, 'category.ejs 不应内联定义 page-nav');
});

test('tag.ejs 使用 paginator 部分', () => {
  const source = fs.readFileSync(path.join(templates, 'tag.ejs'), 'utf8');
  assert.match(source, /include\(['"]partials\/paginator['"]/, 'tag.ejs 应 include paginator');
  assert.match(source, /baseUrl:\s*tag\.link/, 'tag.ejs 数字页码应使用后端提供的标签规范链接');
  assert.match(source, /<%=\s*tag\.count\s*%>\s*篇文章/, 'tag.ejs 应显示标签下的文章总数');
  assert.doesNotMatch(source, /<%=\s*posts\.length\s*%>\s*篇文章/, 'tag.ejs 不应把当前页文章数显示为总数');
  assert.doesNotMatch(source, /['"]\/tags\/['"]\s*\+\s*tag\.name/, 'tag.ejs 不应使用显示名拼接标签详情 URL');
  assert.doesNotMatch(source, /id="page-nav"/, 'tag.ejs 不应内联定义 page-nav');
});
