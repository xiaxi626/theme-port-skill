const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { readRawTemplate, getTemplatesDir, getThemeRootDir } = require('./helpers/pongo2');
const root = getThemeRootDir();
const templates = getTemplatesDir();

// theme_config toggle 字符串值验证
// 来源：hexo-port-mappings-pongo2.md
//   - theme.xxx → theme_config.xxx
//   - Gridea Pro toggle 值由 GUI 传入字符串 "true"/"false"
//   - 直接 {% if theme_config.showXxx %} 对字符串 "false" 仍为真（非空字符串）
//   - 正确做法：{% if theme_config.showXxx != "false" %} 或显式 === "true"

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

// 收集 config.json 中的 toggle 字段名
function getToggleFields() {
  const configPath = path.join(root, 'config.json');
  if (!fs.existsSync(configPath)) return [];
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return (config.customConfig || [])
      .filter((c) => c.type === 'toggle')
      .map((c) => c.name);
  } catch {
    return [];
  }
}

test('config.json 中的 toggle 字段在模板中应正确判断（非裸 if）', () => {
  const toggleFields = getToggleFields();
  if (toggleFields.length === 0) return;

  const allFiles = walkHtml(templates);
  const warnings = [];

  for (const file of allFiles) {
    const source = readRawTemplate(file);
    const rel = path.relative(templates, file);

    for (const field of toggleFields) {
      // 查找 {% if theme_config.field %} 或 {% if not theme_config.field %}
      // 这种裸判断对字符串 "false" 仍为真
      const bareIf = new RegExp(
        `\{%\\s*if\\s+(not\\s+)?theme_config\\.${field}\\s*%\}`
      );
      if (bareIf.test(source)) {
        warnings.push(`${rel}: theme_config.${field} 使用了裸 if 判断（字符串 "false" 仍为真）`);
      }
    }
  }

  if (warnings.length > 0) {
    console.log('  (warn) toggle 字段裸判断（可能对 "false" 失效）：');
    warnings.forEach((w) => console.log('    ' + w));
    console.log('  正确做法：{% if theme_config.xxx != "false" %} 或 === "true"');
  }
});

test('theme_config 字段名与 config.json customConfig 一致', () => {
  const configPath = path.join(root, 'config.json');
  if (!fs.existsSync(configPath)) return;

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const configFields = (config.customConfig || []).map((c) => c.name);

  const allFiles = walkHtml(templates);
  const referencedFields = new Set();

  for (const file of allFiles) {
    const source = readRawTemplate(file);
    const matches = source.matchAll(/theme_config\.(\w+)/g);
    for (const m of matches) {
      referencedFields.add(m[1]);
    }
  }

  // 检查模板中引用的 theme_config 字段是否在 config.json 中声明
  const undeclared = [...referencedFields].filter(
    (f) => !configFields.includes(f)
  );

  if (undeclared.length > 0) {
    console.log('  (warn) 模板引用了 config.json 未声明的 theme_config 字段：');
    undeclared.forEach((f) => console.log('    ' + f));
  }
});
