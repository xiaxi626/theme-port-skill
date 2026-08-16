const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const ejs = require('./helpers/ejs');

// 断言分级（详见 tools/ejs-port-tests/README.md）：
//   L1 通用断言 —— 适用于所有 EJS 目标迁移，失败即主题缺陷
//   L2 主题专有断言 —— 绑定源主题 indigo，迁移其他主题前须按 README 调整
// 本文件：全部为 L2（indigo 专有：post-summary.ejs / post-category.ejs 模板名
//         与 indigo 摘要算法：200 字截断、KaTeX 保留、katex-error 清理）

const partials = path.join(__dirname, '..', 'templates', 'partials');

function render(name, data) {
  return ejs.renderFile(path.join(partials, name), data);
}

test('统一摘要输出纯文本、删除图片并完整保留 KaTeX HTML', async () => {
  const katex = '<span class="katex"><span class="katex-mathml"><math><semantics><mrow><mi>E</mi></mrow><annotation encoding="application/x-tex">E=mc^2</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="mord">E</span></span></span></span>';
  const output = await render('post-summary.ejs', {
    post: {
      abstract: '<h2>建模方法</h2><p>正文<img src="cover.jpg" alt="封面说明">' + katex + '继续</p>',
      content: ''
    }
  });

  assert.match(output, /建模方法/);
  assert.match(output, /正文/);
  assert.match(output, /继续/);
  assert.doesNotMatch(output, /<h2|<p|<img/i);
  assert.doesNotMatch(output, /cover\.jpg|封面说明/);
  assert.equal((output.match(/class="katex"/g) || []).length, 1);
  assert.match(output, new RegExp(katex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('显式摘要不会按固定长度二次截断', async () => {
  const output = await render('post-summary.ejs', {
    post: { abstract: '<p>' + '字'.repeat(250) + '</p>', content: '' }
  });

  assert.match(output, new RegExp('字'.repeat(250)));
  assert.doesNotMatch(output, /\.\.\./);
});

test('纯文本摘要保留 HTML 实体的原始显示语义', async () => {
  const output = await render('post-summary.ejs', {
    post: { abstract: '<p>A &amp; B</p>', content: '' }
  });

  assert.match(output, /A &amp; B/);
  assert.doesNotMatch(output, /&amp;amp;/);
});

test('无显式摘要时按固定 200 字截断且不截断 KaTeX HTML', async () => {
  const katex = '<span class="katex"><span class="katex-html" aria-hidden="true"><span class="base">x</span></span></span>';
  const output = await render('post-summary.ejs', {
    post: { abstract: '', content: '<p>' + '字'.repeat(199) + katex + '尾巴<img src="skip.jpg" alt="跳过"></p>' }
  });

  assert.match(output, new RegExp('字'.repeat(199)));
  assert.match(output, /class="katex"/);
  assert.match(output, /尾\.\.\./);
  assert.doesNotMatch(output, /skip\.jpg|跳过|<img/i);
});

test('统一摘要删除行内和块级 KaTeX 错误占位', async () => {
  const output = await render('post-summary.ejs', {
    post: { abstract: '<p>前文<span class="katex-error" title="KaTeX render failed">bad inline</span>中间</p><div class="katex-error" title="KaTeX render failed">bad block</div><p>后文</p>', content: '' }
  });

  assert.match(output, /前文中间后文/);
  assert.doesNotMatch(output, /katex-error|bad inline|bad block/);
});

test('分类使用原版平坦 DOM 和 Gridea 分类链接', async () => {
  const output = await render('post-category.ejs', {
    categories: [
      { name: '技术', link: '/category/technology/' },
      { name: '生活', link: '/category/life/' }
    ]
  });

  assert.match(output, /<ul class="article-category-list">/);
  assert.equal((output.match(/class="article-category-list-item"/g) || []).length, 2);
  assert.match(output, /href="\/category\/technology\/"/);
  assert.match(output, /href="\/category\/life\/"/);
  assert.doesNotMatch(output, /\/categories\/技术\//);
});
