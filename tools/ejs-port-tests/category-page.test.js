const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('./helpers/ejs');

// 断言分级（详见 tools/ejs-port-tests/README.md）：
//   L1 通用断言 —— 适用于所有 EJS 目标迁移，失败即主题缺陷
//   L2 主题专有断言 —— 绑定源主题 indigo，迁移其他主题前须按 README 调整
// 本文件：[L1] category.name/count、posts.forEach、pagination.* 变量名断言
//         [L2] 两个测试的文件清单（post-card/post-category 等 indigo 模板名）

const templates = path.join(__dirname, '..', 'templates');

test('category.ejs 使用分类数据和正式分页字段', () => {
  const filename = path.join(templates, 'category.ejs');
  const source = fs.readFileSync(filename, 'utf8');

  assert.doesNotThrow(() => ejs.compile(source, { filename }));
  assert.match(source, /category\.name/);
  assert.match(source, /category\.count/);
  assert.match(source, /posts\.forEach/);
  assert.match(source, /pagination\.currentPage/);
  assert.match(source, /pagination\.prevURL/);
  assert.match(source, /pagination\.nextURL/);
});

test('所有文章分类链接均不再手工拼接 categories 路径', () => {
  const files = [
    'index.ejs',
    'tag.ejs',
    'tags.ejs',
    'archives.ejs',
    'post.ejs',
    'category.ejs',
    path.join('partials', 'post-card.ejs'),
    path.join('partials', 'post-category.ejs')
  ];

  files.forEach((file) => {
    const source = fs.readFileSync(path.join(templates, file), 'utf8');
    assert.doesNotMatch(source, /\/categories\/<%=\s*cat\.name\s*%>\//, file);
  });
});
