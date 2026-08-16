// helpers/pongo2.js — Pongo2 模板预处理 + 路径解析工具
//
// 与 ejs-port-tests 不同，本工具的 27 项断言全部是源码文本断言
// （fs.readFileSync + 正则），不加载、也不需要任何 Pongo2 渲染引擎——
// 真正的 Pongo2 解析由 pongo2check（Gridea Pro 真机同款 Go 解析器）承担，
// npm 上也不存在官方 pongo2 绑定。本文件只提供：
//   1. SanitizingLoader 预处理复刻（标签内换行清理 + loop.* → forloop.* 映射）
//      —— 与 pongo2check / Gridea Pro 真机管线一致，供需要预处理的扩展场景使用
//   2. 模板路径解析（tests/ 复制模式）

const fs = require('fs');
const path = require('path');

// ---- SanitizingLoader（复刻 Gridea Pro jinja2_loader.go）----

const reTagBlock = /(\{\{[\s\S]+?\}\}|\{%[\s\S]+?%\}|\{#[\s\S]+?#\})/g;

const reLoopIndex0 = /\bloop\.index0\b/g;
const reLoopRevIndex0 = /\bloop\.revindex0\b/g;
const reLoopIndex = /\bloop\.index\b/g;
const reLoopRevIndex = /\bloop\.revindex\b/g;
const reLoopFirst = /\bloop\.first\b/g;
const reLoopLast = /\bloop\.last\b/g;

function sanitizeTemplate(content) {
  return content.replace(reTagBlock, (match) => {
    let c = match.replace(/[\n\r\t]/g, ' ');
    return c;
  });
}

function mapLoopVars(content) {
  // 替换顺序必须最长优先，避免截断
  let c = content;
  c = c.replace(reLoopIndex0, 'forloop.Counter0');
  c = c.replace(reLoopRevIndex0, 'forloop.Revcounter0');
  c = c.replace(reLoopIndex, 'forloop.Counter');
  c = c.replace(reLoopRevIndex, 'forloop.Revcounter');
  c = c.replace(reLoopFirst, 'forloop.First');
  c = c.replace(reLoopLast, 'forloop.Last');
  return c;
}

/**
 * 对模板源码进行 SanitizingLoader 预处理
 * 与 pongo2check / Gridea Pro 真机管线一致
 */
function preprocess(source) {
  let c = sanitizeTemplate(source);
  c = mapLoopVars(c);
  return c;
}

// ---- 工具函数 ----

/**
 * 读取模板文件并预处理
 */
function readTemplate(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  return preprocess(source);
}

// ---- 路径解析 ----
// 复制模式：本文件被复制到 <theme>/tests/helpers/ 下，
// __dirname 上溯两级即主题根目录。
function getTemplatesDir() {
  return path.join(__dirname, '..', '..', 'templates');
}

function getThemeRootDir() {
  return path.join(__dirname, '..', '..');
}

function readRawTemplate(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

module.exports = {
  preprocess,
  readTemplate,
  readRawTemplate,
  sanitizeTemplate,
  mapLoopVars,
  getTemplatesDir,
  getThemeRootDir,
};
