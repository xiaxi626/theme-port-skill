const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

// 断言分级（详见 tools/ejs-port-tests/README.md）：
//   L1 通用断言 —— 适用于所有 EJS 目标迁移，失败即主题缺陷
//   L2 主题专有断言 —— 绑定源主题 indigo，迁移其他主题前须按 README 调整
// 本文件：[L1] base.ejs 不输出 loading-bar（通用回归项）
//         [L2] main.js 的 $('#post-content') TOC 空数组保护（indigo 实现细节）

const root = path.join(__dirname, '..');

test('base.ejs 不输出未接入现有加载机制的 loading-bar 元素', () => {
  const source = fs.readFileSync(path.join(root, 'templates', 'base.ejs'), 'utf8');

  assert.doesNotMatch(source, /id=["']loading-bar(?:-wrapper)?["']/);
});

test('main.js 在 TOC 标题为空时返回空操作', () => {
  const source = fs.readFileSync(path.join(root, 'assets', 'scripts', 'main.js'), 'utf8');
  const titlesDeclaration = source.indexOf("titles = $('#post-content').querySelectorAll('h1, h2, h3, h4, h5, h6');");
  const firstTitleAccess = source.indexOf('titles[0]', titlesDeclaration);
  const emptyGuard = source.indexOf('if (!titles.length)', titlesDeclaration);

  assert.notEqual(titlesDeclaration, -1);
  assert.notEqual(emptyGuard, -1);
  assert.ok(emptyGuard < firstTitleAccess, '空数组保护必须位于首次 titles[0] 访问之前');
});
