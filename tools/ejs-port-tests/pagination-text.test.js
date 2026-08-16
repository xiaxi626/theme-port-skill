const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const templates = path.join(__dirname, '..', 'templates');
const partials = path.join(templates, 'partials');

// 断言分级（详见 tools/ejs-port-tests/README.md）：
//   L1 通用断言 —— 适用于所有 EJS 目标迁移，失败即主题缺陷
//   L2 主题专有断言 —— 绑定源主题 indigo，迁移其他主题前须按 README 调整
// 本文件：全部为 L2（indigo 专有：分页文案「上一页/下一页」、
//         列表页清单 index/blog/category/tag.ejs 中的 blog.ejs）

test('分页按钮使用原版上一页和下一页文案', () => {
  const source = fs.readFileSync(path.join(partials, 'paginator.ejs'), 'utf8');
  assert.match(source, /class="extend prev".*">上一页<\/a>/, 'paginator.ejs');
  assert.match(source, /class="extend next".*">下一页<\/a>/, 'paginator.ejs');
  assert.doesNotMatch(source, /&laquo;|&raquo;/, 'paginator.ejs 不应包含箭头字符');
});

test('所有模板文件 include paginator 部分', () => {
  ['index.ejs', 'blog.ejs', 'category.ejs', 'tag.ejs'].forEach((file) => {
    const source = fs.readFileSync(path.join(templates, file), 'utf8');
    assert.match(source, /include\(['"]partials\/paginator['"]/, file + ' 应 include paginator');
  });
});
