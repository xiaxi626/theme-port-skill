const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { readRawTemplate, getTemplatesDir } = require('./helpers/pongo2');
const templates = getTemplatesDir();

// 分页器变量名验证
// 来源：hexo-port-mappings-pongo2.md 分页变量映射
//   - page.prev → pagination.hasPrev（布尔值判断）
//   - page.next → pagination.hasNext
//   - page.prev_link → pagination.prevURL
//   - page.next_link → pagination.nextURL
//   - page.current → pagination.currentPage
//   - page.total → pagination.totalPages
//
// 注意：部分主题（如 anubis2）使用简写形式 pagination.prev/next/current/total
// 本测试兼容两种命名

test('分页器模板存在（独立 partial 或内联在列表页中）', () => {
  const candidates = [
    path.join(templates, 'partials', 'pagination.html'),
    path.join(templates, 'partials', 'paginator.html'),
  ];
  const hasPartial = candidates.some((p) => fs.existsSync(p));

  // 部分主题（如 anatolo）将分页器内联在 archives.html/tag.html/index.html 中
  // 检查列表页是否有内联分页逻辑
  const listPages = ['index.html', 'tag.html', 'archives.html'];
  let hasInline = false;
  for (const page of listPages) {
    const filePath = path.join(templates, page);
    if (!fs.existsSync(filePath)) continue;
    const source = readRawTemplate(filePath);
    if (/pagination\.(hasPrev|hasNext|prev|next|currentPage|totalPages)/.test(source)) {
      hasInline = true;
      break;
    }
  }

  assert.ok(
    hasPartial || hasInline,
    '应存在分页器模板（partials/pagination.html）或在列表页内联分页逻辑'
  );
});

test('分页器使用 pagination 对象（非 page.prev_link 等 Hexo 变量）', () => {
  const candidates = [
    path.join(templates, 'partials', 'pagination.html'),
    path.join(templates, 'partials', 'paginator.html'),
  ];
  const filePath = candidates.find((p) => fs.existsSync(p));
  if (!filePath) return;
  const source = readRawTemplate(filePath);

  assert.match(source, /pagination\./, '应使用 pagination.* 变量');
  // 禁止使用 Hexo 的 page.prev_link / page.next_link
  assert.doesNotMatch(
    source,
    /page\.prev_link|page\.next_link/,
    '不应使用 Hexo 的 page.prev_link/next_link'
  );
});

test('分页器使用 hasPrev/hasNext 或 prev/next 布尔判断', () => {
  const candidates = [
    path.join(templates, 'partials', 'pagination.html'),
    path.join(templates, 'partials', 'paginator.html'),
  ];
  const filePath = candidates.find((p) => fs.existsSync(p));
  if (!filePath) return;
  const source = readRawTemplate(filePath);

  // 兼容两种命名：hasPrev/hasNext（标准）或 prev/next（简写）
  const hasStandard = /pagination\.hasPrev|pagination\.hasNext/.test(source);
  const hasShorthand = /pagination\.prev(?!URL)|pagination\.next(?!URL)/.test(source);
  assert.ok(
    hasStandard || hasShorthand,
    '应使用 pagination.hasPrev/hasNext 或 pagination.prev/next'
  );
});

test('分页器使用 prevURL/nextURL 或 prev/next 作为链接', () => {
  const candidates = [
    path.join(templates, 'partials', 'pagination.html'),
    path.join(templates, 'partials', 'paginator.html'),
  ];
  const filePath = candidates.find((p) => fs.existsSync(p));
  if (!filePath) return;
  const source = readRawTemplate(filePath);

  // 兼容两种命名：prevURL/nextURL（标准）或 prev/next（简写，anubis2 风格）
  const hasStandard = /pagination\.prevURL|pagination\.nextURL/.test(source);
  const hasShorthand = /pagination\.prev(?!L)|pagination\.next/.test(source);
  assert.ok(
    hasStandard || hasShorthand,
    '应使用 pagination.prevURL/nextURL 或 pagination.prev/next 作为链接'
  );
});

test('所有列表页 include 分页器 partial', () => {
  const listPages = ['index.html', 'tag.html', 'archives.html'];
  for (const page of listPages) {
    const filePath = path.join(templates, page);
    if (!fs.existsSync(filePath)) continue;
    const source = readRawTemplate(filePath);

    // 列表页应 include 分页器（除非有内联分页）
    const hasInclude = /include\s+["']partials\/(pagination|paginator)/.test(source);
    const hasInline = /pagination\.(hasPrev|hasNext|prev|next)/.test(source);
    assert.ok(
      hasInclude || hasInline,
      `${page} 应 include 分页器或内联分页逻辑`
    );
  }
});
