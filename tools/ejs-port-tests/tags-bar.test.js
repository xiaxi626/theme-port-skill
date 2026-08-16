const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('./helpers/ejs');

const templates = path.join(__dirname, '..', 'templates');
const partials = path.join(templates, 'partials');
const tagsBarFile = path.join(partials, 'tags-bar.ejs');

// 断言分级（详见 tools/ejs-port-tests/README.md）：
//   L1 通用断言 —— 适用于所有 EJS 目标迁移，失败即主题缺陷
//   L2 主题专有断言 —— 绑定源主题 indigo，迁移其他主题前须按 README 调整
// 本文件：全部为 L2（indigo 专有：tags-bar.ejs 模板、showTabsBar 配置键、
//         BLOG.tabBar 交互钩子、tabs-bar 结构与 order 旋转算法）

const mockTags = [
  { name: 'JavaScript', link: '/tag/js/', count: 3 },
  { name: 'CSS', link: '/tag/css/', count: 2 },
  { name: 'Empty', link: '/tag/empty/', count: 0 },
  { name: 'Life', link: '/tag/life/', count: 1 }
];

function renderBar(activeLink) {
  const source = fs.readFileSync(tagsBarFile, 'utf8');
  return ejs.render(source, { tags: mockTags, activeLink }, { filename: tagsBarFile });
}

test('tags-bar.ejs 保留原版 HTML 结构与交互钩子', () => {
  const source = fs.readFileSync(tagsBarFile, 'utf8');
  assert.match(source, /class="tabs-bar container"/, 'tabs-bar 容器');
  assert.match(source, /class="tags-list"/, 'tags-list 导航');
  assert.match(source, /tags-list-item waves-effect waves-button waves-light/, '条目类名');
  assert.match(source, /class="tags-list-more"/, '更多按钮容器');
  assert.match(source, /onclick="BLOG\.tabBar\(this\)"/, '展开交互');
  assert.match(source, /icon icon-ellipsis-h/, '省略号图标');
  assert.match(source, /-webkit-order:-1;order:-1/, '全部按钮固定最前');
  assert.match(source, />全部</, '全部文案（替代原版 __(\'tag.all\')）');
  assert.match(source, /t\.count > 0/, '过滤无文章标签（原版 o.posts.length）');
});

test('tags.ejs / tag.ejs 按 showTabsBar 开关条件引入 tags-bar 并加条件类，category.ejs 不引入', () => {
  const tagsSource = fs.readFileSync(path.join(templates, 'tags.ejs'), 'utf8');
  assert.match(tagsSource, /_showTabsBar = String\(site\.customConfig\.showTabsBar\) !== 'false'/, 'tags.ejs 开关默认开启');
  assert.match(tagsSource, /if \(_showTabsBar\) \{ %><%- include\(['"]partials\/tags-bar['"],\s*\{\s*activeLink:\s*['"]\/tags\/['"]\s*\}\)/, 'tags.ejs 条件引入并传入 /tags/');
  assert.match(tagsSource, /class="content-header tags-header<% if \(_showTabsBar\) \{ %> has-tabs-bar<% \} %>"/, 'tags.ejs header 条件类');

  const tagSource = fs.readFileSync(path.join(templates, 'tag.ejs'), 'utf8');
  assert.match(tagSource, /_showTabsBar = String\(site\.customConfig\.showTabsBar\) !== 'false'/, 'tag.ejs 开关默认开启');
  assert.match(tagSource, /if \(_showTabsBar\) \{ %><%- include\(['"]partials\/tags-bar['"],\s*\{\s*activeLink:\s*tag\.link\s*\}\)/, 'tag.ejs 条件引入并传入 tag.link');
  assert.match(tagSource, /class="content-header tags-header<% if \(_showTabsBar\) \{ %> has-tabs-bar<% \} %>"/, 'tag.ejs header 条件类');

  const categorySource = fs.readFileSync(path.join(templates, 'category.ejs'), 'utf8');
  assert.doesNotMatch(categorySource, /tags-bar|showTabsBar/, 'category.ejs 无全局分类数据源，不渲染 tabs-bar、不引用开关');
});

test('config.json 声明 showTabsBar 开关（toggle，默认开启）', () => {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8'));
  const item = (config.customConfig || []).find((c) => c.name === 'showTabsBar');
  assert.ok(item, 'showTabsBar 应声明在 customConfig 中');
  assert.equal(item.type, 'toggle', '类型应为 toggle');
  assert.equal(item.value, true, '默认值应为 true（保持原版恒显示行为）');
});

test('标签索引页：全部高亮，无文章标签被过滤，自然排序', () => {
  const html = renderBar('/tags/');
  assert.match(html, /href="\/tags\/" style="-webkit-order:-1;order:-1" class="[^"]*\bactive\b/, '全部应高亮');
  assert.ok(html.includes('href="/tag/js/"'), '有文章的标签应渲染');
  assert.ok(!html.includes('Empty'), 'count=0 的标签不应渲染');
  assert.ok(!/href="\/tag\/js\/"[^>]*\bactive\b/.test(html), '索引页不应有标签高亮');
  // 无激活项（_index=-1 <= 1）→ 自然顺序
  assert.match(html, /href="\/tag\/js\/" style="-webkit-order:0;order:0"/, '首项 order 0');
  assert.match(html, /href="\/tag\/css\/" style="-webkit-order:1;order:1"/, '次项 order 1');
  assert.match(html, /href="\/tag\/life\/" style="-webkit-order:2;order:2"/, '末项 order 2');
});

test('标签详情页：当前标签高亮（去尾部斜杠归一化比较）', () => {
  const html = renderBar('/tag/css/');
  assert.match(html, /href="\/tag\/css\/" style="[^"]*" class="[^"]*\bactive\b/, '当前标签应高亮');
  assert.ok(!/href="\/tags\/"[^>]*\bactive\b/.test(html), '全部不应高亮');
  // 激活下标 1 <= 1 → 自然顺序
  assert.match(html, /href="\/tag\/css\/" style="-webkit-order:1;order:1"/, '激活项为第 2 项时保持自然顺序');
});

test('标签详情页：激活下标 > 1 时按原版算法旋转 order', () => {
  // life 下标 2（len=3）：i=0 → 2，i=1 → 0，i=2 → 1（激活项前一位移到行首）
  const html = renderBar('/tag/life/');
  assert.match(html, /href="\/tag\/css\/" style="-webkit-order:0;order:0"/, '激活项前一位 order 0');
  assert.match(html, /href="\/tag\/life\/" style="-webkit-order:1;order:1" class="[^"]*\bactive\b/, '激活项 order 1 且高亮');
  assert.match(html, /href="\/tag\/js\/" style="-webkit-order:2;order:2"/, '原首项移到末尾');
});

test('main.css：padding-bottom: 0 仅按 has-tabs-bar 条件类命中，.categories-header 恒不命中', () => {
  // 先剥离块注释，避免注释中的说明文字干扰规则匹配
  const css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'styles', 'main.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /\.tags-header\.has-tabs-bar\s*\{\s*padding-bottom:\s*0 !important;\s*\}/, '规则应收窄为 .tags-header.has-tabs-bar');
  assert.doesNotMatch(css, /\.tags-header\s*\{\s*padding-bottom:\s*0/, '裸 .tags-header 不应直接启用该规则');
  assert.doesNotMatch(css, /\.categories-header\s*\{[^}]*padding-bottom:\s*0/, '.categories-header 不应启用该规则');
});
