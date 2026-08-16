// helpers/ejs.js — 集中加载 ejs 模块，避免在多个测试文件中硬编码绝对路径。
// 复制模式下，测试被复制到主题目录 tests/ 下运行；先在主题目录执行
// npm i ejs@3.1.10，require('ejs') 即可从主题目录的 node_modules 命中。
function resolveEjs() {
  try {
    return require('ejs');
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') throw err;
  }
  throw new Error(
    '无法加载 ejs 模块：请在主题目录执行 npm i ejs@3.1.10（与 ejs2check 同版本），再运行测试。'
  );
}

module.exports = resolveEjs();
