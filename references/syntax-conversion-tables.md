# 语法转换表、Pongo2 致命规则与重写顺序

> 本文件收录阶段三模板重写所需的三类核心参考：源引擎→目标引擎语法转换表、Pongo2 致命规则、模板重写顺序与 CSS 移植清单。
> 源自原始 SKILL.md 的 §3.2~§3.4 和 §4.1~§4.2，拆分后保留全文。

## 语法转换表

根据阶段一 1.0 检测到的源引擎和目标引擎，使用对应的转换表。

### 表 A：Pug → Pongo2

| Pug 语法 | 等价 Pongo2 写法 |
|----------|-----------------|
| `extends layout.pug` | `{% extends "base.html" %}` |
| `block content` | `{% block content %}` |
| `include partials/head.pug` | `{% include "partials/head.html" %}` |
| `if condition` (缩进) | `{% if condition %}...{% endif %}` |
| `else if condition` | `{% elif condition %}` |
| `each item in items` | `{% for item in items %}...{% endfor %}` |
| `+mixinName(arg1, arg2)` | 用 `{% include "partials/xxx.html" %}` 替代（数据通过上下文传，见附录 A） |
| `= variable`（输出） | `{{ variable }}` 或 `{{ variable|safe }}` |
| `!= variable`（不转义） | `{{ variable|safe }}` |
| `// 注释` | `{# 注释 #}` |
| `case page.type` | `{% if %}{% elif %}` 链 |
| `a(href=url) Text` | `<a href="{{ url }}">Text</a>` |
| `div.class#id` | `<div class="class" id="id">` |

### 表 B：EJS → Pongo2

| EJS 语法 | 等价 Pongo2 写法 |
|----------|-----------------|
| `<% code %>` | `{% code %}` |
| `<%= value %>` | `{{ value }}` |
| `<%- value %>` | `{{ value|safe }}` |
| `<% include('partials/x') %>` | `{% include "partials/x.html" %}` |
| `if (condition) { }` | `{% if condition %}...{% endif %}` |
| `} else if (condition) {` | `{% elif condition %}` |
| `arr.forEach(function(item){ ... })` | `{% for item in arr %}...{% endfor %}` |
| `a && b` / `a \|\| b` | `a and b` / `a or b` |
| `!condition` | `not condition` |
| `arr.length` | `arr|length` |
| `var x = value` | `{% set x = value %}` |
| `a ? b : c` | `{% if a %}{{ b }}{% else %}{{ c }}{% endif %}` |
| `typeof x !== 'undefined'` | `{% if x %}` |
| `<%# 注释 %>` | `{# 注释 #}` |

### 表 C：Swig → Pongo2

| Swig 语法 | 等价 Pongo2 写法 | 差异说明 |
|----------|-----------------|---------|
| `{% extends "layout" %}` | `{% extends "base.html" %}` | 添加 `.html` 后缀 |
| `{% block content %}` | `{% block content %}` | 完全相同 |
| `{% include "partial" %}` | `{% include "partials/xxx.html" %}` | 路径添加后缀，相对于 `templates/` 根 |
| `{% for item in items %}` | `{% for item in items %}` | 完全相同 |
| `{% if condition %}` | `{% if condition %}` | 完全相同 |
| `{% elseif condition %}` | `{% elif condition %}` | Swig 用 `elseif`，Pongo2 用 `elif` |
| `{{ value }}` | `{{ value }}` | 完全相同 |
| `{{ value|safe }}` | `{{ value|safe }}` | 完全相同 |
| `{% macro name(args) %}` | `{% include "partials/xxx.html" %}` | Pongo2 不支持 macro，改用 include（见附录 A） |
| `{% set x = value %}` | `{% set x = value %}` | 完全相同 |
| `{% filter name %}...{% endfilter %}` | 使用 Pongo2 filter 管道：`{{ value|filtername }}` | filter 语法不同 |
| `{# 注释 #}` | `{# 注释 #}` | 完全相同 |

### 表 D：Nunjucks → Pongo2

| Nunjucks 语法 | 等价 Pongo2 写法 | 差异说明 |
|--------------|-----------------|---------|
| `{% extends "layout" %}` | `{% extends "base.html" %}` | 添加 `.html` 后缀 |
| `{% block content %}` | `{% block content %}` | 完全相同 |
| `{% include "partial" %}` | `{% include "partials/xxx.html" %}` | 路径添加后缀，相对于 `templates/` 根 |
| `{% for item in items %}` | `{% for item in items %}` | 完全相同 |
| `{% if condition %}` | `{% if condition %}` | 完全相同 |
| `{% elif condition %}` | `{% elif condition %}` | 完全相同 |
| `{{ value }}` | `{{ value }}` | 完全相同 |
| `{{ value\|safe }}` | `{{ value\|safe }}` | 完全相同 |
| `{% macro name(args) %}` | `{% include "partials/xxx.html" %}` | Pongo2 不支持 macro，改用 include（见附录 A） |
| `{% set x = value %}` | `{% set x = value %}` | 完全相同 |
| `a and b` / `a or b` / `not a` | `a and b` / `a or b` / `not a` | 完全相同 |
| `{# 注释 #}` | `{# 注释 #}` | 完全相同 |

> **Swig/Nunjucks 主题的迁移成本远低于 Pug 和 EJS。** 这两种引擎与 Pongo2 共享 90% 的语法，主要差异仅在于文件后缀、路径约定和 macro 转 include。

### 表 E：Hexo EJS → Gridea EJS（目标引擎为 EJS）

| Hexo EJS | Gridea EJS | 差异说明 |
|----------|-----------|---------|
| `<% config.title %>` | `<%= site.customConfig.siteName %>` | 变量前缀 `config.*` → `site.*` / `site.customConfig.*` |
| `<% theme.xxx %>` | `<%= site.customConfig.xxx %>` | `theme.*` → `site.customConfig.*` |
| `<% page.title %>` | `<%= post.title %>` | `page.*` → `post.*`（详情页） |
| `<% page.prev %>` | `<%= post.prevPost %>` | **方向相反**：Hexo prev=更早，Gridea prevPost=更新 |
| `<% page.next %>` | `<%= post.nextPost %>` | 同上 |
| `<% page.date %>`（moment） | `<%= post.date %>`（RFC3339）+ `<%= post.dateFormat %>` | **EJS 无 `|date` 禁忌**，`post.date` 可直接用于 `datetime` 属性 |
| `<% page.content %>` | `<%- post.content %>` | `page.*` → `post.*`，用 `<%-` 不转义输出 |
| `<% partial('path', {data}) %>` | `<%- include('partials/path', {data}) %>` | Hexo `partial()` → EJS `include()`，路径加 `partials/` 前缀 |
| `<% url_for(path) %>` | 直接写相对路径 / `<%= post.link %>` | 无等价 helper |
| `<% date_xml(date) %>` | `<%= post.date %>` | RFC3339 即合法 datetime |
| `<% full_date(date) %>` | `<%= post.dateFormat %>` | 服务端 format → 预构建字段 |
| `<% strip_html(str) %>` | 手写正则 `.replace(/<[^>]*>/g, '')` | helper → 手写 JS |
| `<% truncate(str, {length}) %>` | `Array.from(str).slice(0,N).join('')+'...'` | 用 `Array.from` 处理 unicode |
| `<% list_tags(tags) %>` | 手写 `<ul>` + `forEach` | helper → 手写 |
| `<% list_categories(cats) %>` | 手写 `<ul>` + `forEach` | helper → 手写 |
| `<% toc(content, opts) %>` | 客户端 JS `buildToc()` | 服务端 → 客户端 |
| `<% __('key') %>` | 硬编码中文 | 无多语言机制 |
| `<% is_home() %>` / `<% is_post() %>` | 路由隐式决定 + `post` 是否存在 | `is_*()` helper 移除 |
| `<% paginator({opts}) %>` | `<%- include('partials/paginator', {paginator}) %>` | helper → 手写 partial + 算法 |
| toggle 布尔值判断 | `String(site.customConfig.showXxx) !== 'false'` | GUI 传入字符串，需显式转换 |
| `theme.menu`（对象） | `menus`（数组） | 结构完全不同 |
| `site.tags` / `site.categories` | `tags` / `categories`（顶层变量） | 变量位置变化 |
| `tag.length` | `tag.count` | 字段名不同 |
| `page.posts` | `posts`（顶层变量） | Query `.each` → 数组 `.forEach` |

> **EJS 目标引擎关键规则：**
> 1. HTML 输出用 `<%- %>`（不转义），纯文本用 `<%= %>`
> 2. 自定义配置通过 `site.customConfig.xxx` 访问，**不是** Pongo2 的 `theme_config.xxx`
> 3. toggle 配置值为字符串，必须显式判断 `=== 'true'` 或 `!== 'false'`
> 4. EJS 无 filter 语法，逻辑直接写 JS（`forEach` / `&&` / `||` / `typeof`）
> 5. 无模板继承（`extends`），各页面模板为完整 `<!DOCTYPE html>` 文档，通过 `include()` 组装
> 6. `post.date` 可直接用于 `datetime` 属性，**无 Pongo2 的 `|date` 禁忌**

---

## Pongo2 致命规则（每次写模板前回顾）

编写任何 Pongo2 模板时，必须遵守以下规则，**每修改完一个模板就自查一遍**：

1. **Filter 参数用冒号不用括号**：`{{ value|default:"x" }}`（正确）/ `{{ value|default("x") }}`（错误）
2. **`post.date` 是字符串，禁用 `|date` filter**：用 `post.dateFormat` 展示，`post.date` 用于 `datetime` 属性
3. **`post.content` 必须 `|safe`**：`{{ post.content|safe }}`
4. **逻辑运算符用英文单词**：`and` / `or` / `not`，不能用 `&&` / `||` / `!`
5. **不等判断用 `!=`**：`{% if x != y %}`（正确）/ `{% if not x == y %}`（错误，静默失效！）
6. **长度用 `|length`**：`{% if posts|length > 0 %}`（正确）/ `{% if posts.length > 0 %}`（错误）
7. **不支持三元表达式**：用 `{% if %}...{% else %}...{% endif %}` 替代
8. **不支持 `~` 拼接**：在 `{{ }}` 中直接相邻输出 `{{ a }} | {{ b }}`
9. **否定包含用 `not "a" in b`**：不用 `"a" not in b`
10. **`include` 路径相对 `templates/` 根**：`{% include "partials/header.html" %}`
11. **标签内不可换行**：所有 `{% %}` 和 `{{ }}` 保持单行
12. **archives 分组键大写**：`{{ group.Year }}` / `{% for post in group.Posts %}`
13. **`theme_config` 数字比较前 `|to_int`**：`{% if loop.index <= theme_config.count|default:8|to_int %}`
14. **不支持 `macro`**：用 `{% include %}` 替代

---

## 模板重写顺序（按依赖关系）

**必须严格按以下顺序重写，确保每个阶段都能跑通验证：**

1. **`config.json`** → 映射 Hexo `_config.yml` 到 GTBS customConfig
2. **`assets/styles/main.css`** → 移植源主题 CSS，使用 GTBS 的 CSS 变量体系
3. **`templates/partials/head.html`** → `<head>` 区域（meta、OG、CSS 引用）
4. **`templates/partials/header.html`** → 导航栏（站点标题、菜单循环）
5. **`templates/partials/footer.html`** → 页脚（版权、社交链接、注入代码）
6. **`templates/partials/post-card.html`** → 文章卡片（封面图、标题、摘要、标签、日期）
7. **`templates/base.html`** → 全局骨架（`<html>` → `<head>` include → `<body>` → header → `{% block content %}` → footer → scripts）
8. **`templates/index.html`** → 首页（extends base，文章列表循环 + 分页）
9. **`templates/post.html`** → 文章详情页（extends base，文章内容 + 上下篇导航）
10. **`templates/archives.html`** → 归档页（年份分组，注意 `group.Year` 大写）
11. **`templates/tag.html`** → 单个标签页
12. **`templates/tags.html`** → 标签汇总页
13. **`templates/links.html`** → 友链页
14. **`templates/about.html`** → 关于页
15. **`templates/blog.html`** → 博客列表页（结构同 index）
16. **`templates/memos.html`** → 闪念页
17. **`templates/404.html`** → 404 页面

每重写完一个模板文件，立即执行：

> **注意：** 以下脚本命令来自 **gridea-theme-builder skill**，请在 gridea-theme-builder 的仓库根目录下执行。

```bash
python scripts/validate_syntax.py ./themes/{THEME_NAME}
```

确保零新增错误。如果验证通过，继续下一个模板。如果失败，**只修当前模板**，不跳到其他文件。

---

## CSS 移植策略

### 核心原则：忠实复刻，不自创

CSS 移植的目标是**完全还原源主题的视觉效果**。源主题有什么就复刻什么，源主题没有的不要自行添加。

源主题的 CSS 可能包含 Hexo 特有类名、源模板引擎生成的特定选择器、以及硬编码的色值。移植策略：

1. **保留 GTBS 脚手架的 CSS 变量体系**（`:root` 中的 `--color-*` 变量）
2. **将源主题的色板完整映射到 CSS 变量**：把源主题的色值填入 `:root` 对应变量，确保主色、背景色、文字色、边框色与源主题完全一致
3. **将源主题的字体栈合并到 `--font-sans`**：确保中文字体在正确位置，字号、行高、字间距与源主题一致
4. **将源主题的布局参数精确映射到变量**：`--content-width`、`--header-height`、间距系统、卡片圆角、阴影参数
5. **逐组件像素级对照迁移**：对每个页面组件，对比源主题的 CSS 选择器和 `references/css-patterns.md` 提供的模式，选择最接近的方案。源主题有特殊动画或交互效果的，必须完整复刻。
6. **暗色模式**：如果源主题有暗色模式，将暗色变量完整填入 `[data-theme="dark"]` 块。如果源主题没有暗色模式，**不自行添加**（后续可按需进入功能补全模式）。
7. **响应式适配**：提取源主题的断点值，完整移植到新主题。如果源主题仅做了单端适配，先完整复刻单端，**不自行补全另一端**（后续可按需进入功能补全模式）。

### 4.2 CSS 移植检查清单

- [ ] `:root` 中所有颜色变量已从源主题提取，色值与源主题一致
- [ ] `--font-sans` 包含源主题的字体声明，字号/行高/字间距一致
- [ ] `--content-width` 与源主题布局一致（像素级）
- [ ] `.post-content` 的 Markdown 元素样式完整（h1-h6、p、a、blockquote、code、pre、table、img、ul、ol、hr）
- [ ] 暗色模式变量完整映射（如果源主题有）
- [ ] 响应式断点与源主题一致
- [ ] 代码块样式移植完成（含语法高亮颜色）
- [ ] 文章卡片样式移植完成（含 hover 效果）
- [ ] 导航栏样式移植完成（含移动端汉堡菜单动画）
- [ ] 分页器样式移植完成
- [ ] 标签云样式移植完成
- [ ] 页脚样式移植完成
- [ ] 所有 hover/active/focus 状态与源主题一致
- [ ] 动画和过渡效果与源主题一致
