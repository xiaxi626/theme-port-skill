const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const ejs = require('./helpers/ejs');

// 断言分级（详见 tools/ejs-port-tests/README.md）：
//   L1 通用断言 —— 适用于所有 EJS 目标迁移，失败即主题缺陷
//   L2 主题专有断言 —— 绑定源主题 indigo，迁移其他主题前须按 README 调整
// 本文件：全部为 L2（indigo 专有：window.INDIGO 命名空间、enableLightbox 配置、
//         Blog.lightbox / LightBox 实现、image-bubble/img-lightbox 包装结构）

const templates = path.join(__dirname, '..', 'templates');
const partials = path.join(templates, 'partials');

test('footer.ejs 包含 Blog.lightbox 方法定义', () => {
  const source = fs.readFileSync(path.join(partials, 'footer.ejs'), 'utf8');
  assert.match(source, /lightbox:\s*function/, '应定义 Blog.lightbox 方法');
});

test('footer.ejs 包含 LightBox 类定义', () => {
  const source = fs.readFileSync(path.join(partials, 'footer.ejs'), 'utf8');
  assert.match(source, /function LightBox\(element\)/, '应定义 LightBox 类');
  assert.match(source, /this\.zoomIn/, '应包含 zoomIn 方法');
  assert.match(source, /this\.zoomOut/, '应包含 zoomOut 方法');
  assert.match(source, /this\.calcRect/, '应包含 calcRect 方法');
});

test('footer.ejs 包含图片包装逻辑（renderImage 等效）', () => {
  const source = fs.readFileSync(path.join(partials, 'footer.ejs'), 'utf8');
  assert.match(source, /image-bubble/, '应创建 .image-bubble figure');
  assert.match(source, /img-lightbox/, '应创建 .img-lightbox div');
  assert.match(source, /<div class="overlay"><\/div>/, '应创建 .overlay div');
  assert.match(source, /image-caption/, '应创建 .image-caption div');
});

test('footer.ejs 将 enableLightbox 加入 window.INDIGO', () => {
  const source = fs.readFileSync(path.join(partials, 'footer.ejs'), 'utf8');
  assert.match(source, /enableLightbox/, '应引用 enableLightbox 配置');
  assert.match(source, /if \(window\.INDIGO\.enableLightbox\)/, '应根据配置调用 Blog.lightbox()');
});

test('footer.ejs 跳过代码块内的图片', () => {
  const source = fs.readFileSync(path.join(partials, 'footer.ejs'), 'utf8');
  assert.match(source, /closest\(['"]pre, code, \.highlight['"]\)/, '应跳过 pre/code/.highlight 内的图片');
});

test('footer.ejs 跳过已在 lightbox 内的图片', () => {
  const source = fs.readFileSync(path.join(partials, 'footer.ejs'), 'utf8');
  assert.match(source, /closest\(['"]\.img-lightbox['"]\)/, '应跳过已在 .img-lightbox 内的图片');
});

test('config.json 包含 enableLightbox 配置项', () => {
  const configPath = path.join(__dirname, '..', 'config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const lightboxConfig = config.customConfig.find(c => c.name === 'enableLightbox');
  assert.ok(lightboxConfig, '应存在 enableLightbox 配置项');
  assert.equal(lightboxConfig.type, 'toggle');
  assert.equal(lightboxConfig.value, true);
  assert.equal(lightboxConfig.group, '文章');
});

test('footer.ejs EJS 编译无语法错误', () => {
  const source = fs.readFileSync(path.join(partials, 'footer.ejs'), 'utf8');
  assert.doesNotThrow(() => {
    ejs.compile(source, { filename: path.join(partials, 'footer.ejs') });
  }, 'footer.ejs 应编译无错');
});

test('footer.ejs 在 enableLightbox=true 时渲染调用代码', async () => {
  const source = fs.readFileSync(path.join(partials, 'footer.ejs'), 'utf8');
  const compiled = ejs.compile(source, { filename: path.join(partials, 'footer.ejs') });
  const output = compiled({
    site: { customConfig: { enableLightbox: true }, domain: '/' },
    post: null
  });
  assert.match(output, /enableLightbox:\s*true/, '应渲染 enableLightbox: true');
  assert.match(output, /if \(window\.INDIGO\.enableLightbox\)\s*\{\s*Blog\.lightbox\(\)/, '应调用 Blog.lightbox()');
});

test('footer.ejs 在 enableLightbox=false 时不调用 lightbox', async () => {
  const source = fs.readFileSync(path.join(partials, 'footer.ejs'), 'utf8');
  const compiled = ejs.compile(source, { filename: path.join(partials, 'footer.ejs') });
  const output = compiled({
    site: { customConfig: { enableLightbox: false }, domain: '/' },
    post: null
  });
  assert.match(output, /enableLightbox:\s*false/, '应渲染 enableLightbox: false');
  // Blog.lightbox() 定义仍存在，但运行时不会调用
  assert.match(output, /if \(window\.INDIGO\.enableLightbox\)\s*\{\s*Blog\.lightbox\(\)/, '条件调用代码应存在');
});
