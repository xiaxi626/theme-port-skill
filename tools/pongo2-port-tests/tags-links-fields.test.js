const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { readRawTemplate, getTemplatesDir } = require('./helpers/pongo2');
const templates = getTemplatesDir();

// 标签/分类/友链字段名验证
// 来源：hexo-port-mappings-pongo2.md
//   - tag.path → tag.link（字段名不同）
//   - tag.posts.length → tag.count
//   - category.path → category.link
//   - 友链：link.siteName（非 link.name）、link.siteLink（非 link.url）

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

test('tags.html 使用 tag.link 和 tag.count（非 tag.path/tag.posts.length）', () => {
  const filePath = path.join(templates, 'tags.html');
  if (!fs.existsSync(filePath)) return;
  const source = readRawTemplate(filePath);

  assert.match(source, /tag\.link/, '应使用 tag.link');
  assert.doesNotMatch(
    source,
    /tag\.path/,
    '不应使用 tag.path（Hexo 字段，Gridea 用 tag.link）'
  );

  if (/tag\.count/.test(source) || /tag\.posts\.length/.test(source)) {
    assert.match(source, /tag\.count/, '应使用 tag.count（非 tag.posts.length）');
    assert.doesNotMatch(
      source,
      /tag\.posts\.length/,
      '不应使用 tag.posts.length（Hexo 字段）'
    );
  }
});

test('tag.html（单标签页）使用 current_tag.name 或 tag.name', () => {
  const filePath = path.join(templates, 'tag.html');
  if (!fs.existsSync(filePath)) return;
  const source = readRawTemplate(filePath);

  // 兼容两种命名：current_tag.name（typography 风格）或直接用 posts 循环
  const hasCurrentTag = /current_tag\.name/.test(source);
  const hasPostsLoop = /\{%\s*for\s+post\s+in\s+posts/.test(source);
  assert.ok(
    hasCurrentTag || hasPostsLoop,
    '应使用 current_tag.name 或遍历 posts'
  );
});

test('分类使用 cat.link（非手工拼接 /categories/ 路径）', () => {
  const allFiles = walkHtml(templates);
  const violations = [];

  for (const file of allFiles) {
    const source = readRawTemplate(file);
    const rel = path.relative(templates, file);

    // 禁止手工拼接 /categories/<cat.name>/ 或 /category/<cat.name>/
    if (/\/categor(?:y|ies)\/\{\{.*cat(?:egory)?\.name/.test(source)) {
      violations.push(rel);
    }
  }

  assert.equal(
    violations.length,
    0,
    `以下文件手工拼接了分类路径（应使用 cat.link 预构建字段）：\n${violations.join('\n')}`
  );
});

test('友链使用标准字段 link.siteName/siteLink（或兼容回退 link.name/url）', () => {
  const filePath = path.join(templates, 'links.html');
  if (!fs.existsSync(filePath)) return;
  const source = readRawTemplate(filePath);

  // Gridea Pro 标准友链字段：link.siteName / link.siteLink / link.description / link.avatar
  // 部分主题可能用旧字段名 link.name / link.url / link.desc
  // 标准字段优先，旧字段作为兼容回退可接受但应记录
  const hasStandardName = /link\.siteName/.test(source);
  const hasStandardLink = /link\.siteLink/.test(source);
  const hasLegacyName = /link\.name(?!Item)/.test(source);
  const hasLegacyUrl = /link\.url/.test(source);

  if (hasLegacyName || hasLegacyUrl) {
    console.log('  (warn) 友链使用了非标准字段名：');
    if (hasLegacyName) console.log('    link.name → 建议改为 link.siteName');
    if (hasLegacyUrl) console.log('    link.url → 建议改为 link.siteLink');
    console.log('  Gridea Pro 标准字段：link.siteName / link.siteLink / link.description');
  }

  // 至少要有某种友链名称和链接字段
  assert.ok(
    (hasStandardName || hasLegacyName) && (hasStandardLink || hasLegacyUrl),
    '友链应有名称字段（siteName/name）和链接字段（siteLink/url）'
  );
});

test('菜单使用 menus 数组遍历（非 theme.menu 对象）', () => {
  // 检查 header.html / nav.html（不检查 base.html，避免搜索面板的 menu 类名误触发）
  const candidates = [
    path.join(templates, 'partials', 'header.html'),
    path.join(templates, 'partials', 'nav.html'),
    path.join(templates, 'partials', 'navigation.html'),
  ];

  let foundMenuFile = false;
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const source = readRawTemplate(file);
    foundMenuFile = true;

    // 菜单文件应遍历 menus 数组
    assert.match(
      source,
      /\{%[-]?\s*for\s+menu\s+in\s+menus\s*%[-]?\}/,
      `${path.relative(templates, file)}: 应遍历 menus 数组（非 theme.menu 对象）`
    );
    assert.match(source, /menu\.link/, '应使用 menu.link');
    assert.match(source, /menu\.name/, '应使用 menu.name');
  }

  if (!foundMenuFile) {
    console.log('  (info) 未找到 header.html/nav.html，跳过菜单检查');
  }
});
