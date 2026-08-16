const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

// 断言分级（详见 tools/ejs-port-tests/README.md）：
//   L1 通用断言 —— 适用于所有 EJS 目标迁移，失败即主题缺陷
//   L2 主题专有断言 —— 绑定源主题 indigo，迁移其他主题前须按 README 调整
// 本文件：全部为 L2（indigo 专有图片配置键：avatar/brandImage/brand/
//         rewardWechat/rewardAlipay 及其硬编码兜底路径）

const themeRoot = path.join(__dirname, '..');
const templates = path.join(themeRoot, 'templates');

// 图片类配置项采用「声明默认值 + 模板兜底」双保险：
// 1. config.json 声明非空默认值 → 新装用户在 GUI 直接看到默认图地址和预览
// 2. 模板层 || 兜底 → 已保存空字符串（Gridea 键级合并不过滤空值）时页面仍正常渲染
const imageItems = [
  { name: 'avatar', fallback: '/media/images/avatar.jpg' },
  { name: 'brandImage', fallback: '/media/images/brand.jpg' },
  { name: 'brand', fallback: '/media/images/brand.jpg' },
  { name: 'rewardWechat', fallback: '/media/images/wechat.jpg' },
  { name: 'rewardAlipay', fallback: '/media/images/alipay.jpg' }
];

test('图片类配置项均声明 picture-upload 类型和非空默认值', () => {
  const config = JSON.parse(fs.readFileSync(path.join(themeRoot, 'config.json'), 'utf8'));
  imageItems.forEach(({ name, fallback }) => {
    const item = (config.customConfig || []).find((c) => c.name === name);
    assert.ok(item, `${name} 应声明在 customConfig 中`);
    assert.equal(item.type, 'picture-upload', `${name} 类型应为 picture-upload`);
    assert.equal(item.value, fallback, `${name} 声明默认值应为 ${fallback}`);
  });
});

test('模板层对图片配置均有硬编码兜底（防空字符串遮蔽）', () => {
  const headerSource = fs.readFileSync(path.join(templates, 'partials', 'header.ejs'), 'utf8');
  assert.match(headerSource, /customConfig\.avatar \|\| '\/media\/images\/avatar\.jpg'/, 'avatar 兜底');
  assert.match(headerSource, /customConfig\.brand \|\| site\.customConfig\.brandImage \|\| '\/media\/images\/brand\.jpg'/, 'brand/brandImage 兜底');

  const postSource = fs.readFileSync(path.join(templates, 'post.ejs'), 'utf8');
  assert.match(postSource, /_rewardImg\(site\.customConfig\.rewardWechat, '\/media\/images\/wechat\.jpg'\)/, 'rewardWechat 兜底');
  assert.match(postSource, /_rewardImg\(site\.customConfig\.rewardAlipay, '\/media\/images\/alipay\.jpg'\)/, 'rewardAlipay 兜底');
});
