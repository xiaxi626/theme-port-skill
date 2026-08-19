# 功能补全模式、附录与最终交付规范

> 本文件是 SKILL.md 的扩展内容，按需阅读，不占用主流程上下文。

## 速查卡片：Pongo2 最容易踩的 5 个坑

| # | 坑 | 错误 | 正确 |
|---|-----|------|------|
| 1 | Filter 冒号 | `default("x")` | `default:"x"` |
| 2 | date filter | `post.date|date:"2006-01-02"` | `post.dateFormat` |
| 3 | not == 陷阱 | `not x == y` | `x != y` |
| 4 | 长度 | `.length` | `|length` |
| 5 | safe | `post.content` | `post.content|safe` |

---

## 附录 A：源主题组件模式 → Pongo2 转换策略

不同源引擎的组件复用机制各不相同，但目标统一为 Pongo2 的 `{% include %}` 模式（Pongo2 不支持 `macro`）。

### A.1 Pug Mixin → Pongo2

Pug 的 `mixin` 是带参数的函数式组件。转换策略：

**策略 1：转为 `include` 组件 + `set` 变量**

```pug
// 源: _mixins/post-card.pug
mixin postCard(post, index)
  .post-card
    h2= post.title
    time= post.date
```

```html
<!-- 目标: templates/partials/post-card.html -->
<!-- 在调用前通过 {% set %} 设置变量，然后在循环中 include -->
{% set post = currentPost %}
<article class="post-card">
  <h2>{{ post.title }}</h2>
  <time>{{ post.dateFormat }}</time>
</article>
```

```html
<!-- 调用处 -->
{% for post in posts %}
  {% include "partials/post-card.html" %}
{% endfor %}
```

**策略 2：直接内联** — 如果 mixin 逻辑简单（< 5 行），直接内联到调用处。

**策略 3：用 `if` 条件分支替代 `case`**

```pug
// 源: 用 case 区分页面类型
case page.type
  when 'tags'
    include includes/tags.pug
```

```html
<!-- 目标: 不同页面类型已经是独立模板文件，不需要 case -->
{% if page_type == "tags" %}
  ...
{% endif %}
```

### A.2 EJS Function/Include → Pongo2

EJS 的组件复用通过 `include()` 或内联 JS 函数实现。

**策略 1：`<% include('path') %>` → `{% include "path" %}`**

```ejs
<!-- 源: <% include('_partial/post-card') %> -->
<!-- 目标: -->
{% include "partials/post-card.html" %}
```

**策略 2：内联辅助函数 → `{% include %}`**

```ejs
<!-- 源: 内联函数在 forEach 中调用 -->
<% posts.forEach(function(post) { %>
  <div class="card">
    <h2><%= post.title %></h2>
  </div>
<% }); %>
```

```html
<!-- 目标: 抽成独立组件 + for 循环 -->
{% for post in posts %}
  {% include "partials/post-card.html" %}
{% endfor %}
```

### A.3 Swig / Nunjucks Macro → Pongo2

Swig 和 Nunjucks 的 `macro` 与 Pug mixin 类似，但用 `{% %}` 语法。

```swig
{# 源: Swig macro #}
{% macro postCard(post) %}
  <div class="card">
    <h2>{{ post.title }}</h2>
  </div>
{% endmacro %}
```

```html
<!-- 目标: Pongo2 partial + for 循环 -->
{% for post in posts %}
  {% include "partials/post-card.html" %}
{% endfor %}
```

> **注意**：Swig/Nunjucks 的 macro 被调用的上下文变量（如 `post`）在执行 `{% include %}` 时自动可用，**不需要**像 Pug mixin 那样通过 `{% set %}` 显式传递。这是因为 Swig/Nunjucks macro 内部已经使用 `{{ post.title }}` 访问外部变量，而 Pongo2 的 `include` 同样继承了父级上下文——两者行为一致。

---

## 附录 B：发布前最终检查清单

参照 gridea-theme-builder 的 `references/quality-checklist.md` 的 P0 级别逐项确认：

- [ ] 对应引擎强制语法质量门禁零 FAIL
- [ ] `validate_syntax.py` 零错误零警告
- [ ] `render_test.py` 所有页面渲染成功
- [ ] 输出 HTML 无残留模板标签
- [ ] `audit_static.py` 零 P0
- [ ] 差异审计 P0 清零
- [ ] 0 篇文章边界情况不崩溃
- [ ] 无封面图文章不崩溃
- [ ] 无标签文章不崩溃
- [ ] 特殊字符标题正确转义
- [ ] 真机验证无 `fallback-banner`
- [ ] 暗色模式所有元素可读
- [ ] 375px 移动端无水平滚动
- [ ] 每页有唯一 `<title>`
- [ ] 语义化 HTML 标签正确使用
- [ ] 所有 `<img>` 有 `alt` 属性

---

## 输出交付要求

迁移完成后按顺序输出：

1. 源主题结构分析摘要
2. 完整文件目录树
3. 映射表摘要（完整表在 `_port/{THEME_NAME}/02-variable-map.md`）
4. 验证结果：语法、渲染、静态审计、差异审计
5. 真机验证结果
6. 所有代码文件

---

## 功能补全模式（按需触发）

仅在用户显式请求时触发，例如“加暗色模式”“补全移动端”“缺友链页”。

### 页面完整性清单

| 页面 | 模板文件 | 备注 |
|------|---------|------|
| 首页 | `templates/index.html` | 文章列表 + 分页 |
| 博客列表页 | `templates/blog.html` | 结构同 index |
| 文章详情页 | `templates/post.html` | 完整文章内容 + 上下篇 |
| 归档页 | `templates/archives.html` | 按年份分组 |
| 标签列表页 | `templates/tags.html` | 标签云汇总 |
| 标签详情页 | `templates/tag.html` | 单标签文章列表 |
| 分类详情页 | `templates/tag.html` 或 `category.html` | Gridea 无全局分类索引 |
| 友链页 | `templates/links.html` | 友链卡片 |
| 关于页 | `templates/about.html` | 自定义内容 |
| 闪念页 | `templates/memos.html` | 简短内容流 |
| 404 | `templates/404.html` | 自定义 404 |

### 组件完整性清单

| 组件 | 目标位置 | 备注 |
|------|---------|------|
| 搜索 | `partials/search.html` | 优先接入 `/api/search.json` |
| 分页 | `partials/pagination.html` | 上一页/下一页 |
| 上下篇 | 内嵌 `post.html` | 注意 prev/next 方向 |
| 文章卡片 | `partials/post-card.html` | 列表摘要卡片 |
| memos 热力图 | 内嵌 `memos.html` | 客户端聚合 |
| 评论 | `partials/comments.html` | 保留 UI，接入 Gridea 评论 |

### 补全规则

1. 基于源主题设计参数保持一致；
2. 先完成七阶段复刻再补全；
3. 每次只补全一个维度。

---

## 关键安全规则：映射文件编码保护

两个映射文件均适用：

- `references/hexo-port-mappings-pongo2.md`
- `references/hexo-port-mappings-ejs.md`

规则：

1. 禁止用 Python 字符串拼接（`"""..."""`、`'\n'.join([...])`）写入映射文件；`\t`、`\n`、`\r`、`\a`、`\f`、`\b` 会污染 `template` / `theme` / `footer` 等高频词。
2. 必须先写临时文件，用控制字符校验脚本检查后，再用文件级复制覆盖。
3. 无法确保编码安全时，暂停并报告用户。
4. 修改后运行校验：

```python
import re
for fname in ['hexo-port-mappings-pongo2.md', 'hexo-port-mappings-ejs.md']:
    content = open(fname, encoding='utf-8').read()
    bad = re.findall(r'[\x07\x08\x0c\x0d]', content)
    assert not bad, f"{fname} 发现 {len(bad)} 个控制字符"
    for w in ['template', 'theme', 'footer', 'nav', 'archive', 'base', 'tags', 'toc']:
        assert content.count(w) > 0, f"{fname} 关键词 '{w}' 丢失"
```
