# Gridea Pro EJS 主题迁移测试工具

> **工具定位**：Gridea Pro EJS 主题迁移的 Node.js 内置测试运行器验证工具
> **适用范围**：所有目标引擎为 EJS 的 Hexo → Gridea 迁移
> **对应映射**：见 `references/hexo-port-mappings-ejs.md`

## 背景

Gridea Pro 主题开发 Skill 提供的 `pongo2check` / `validate_syntax.py` / `render_test.py` 三件套均为 **Pongo2 专用**，不适用于 EJS 引擎。本工具提供 EJS 主题迁移的替代验证方案——基于 **Node.js 内置测试运行器**（`node --test`）的模板渲染/语法验证，是 EJS 迁移阶段六（验证）的标准做法。

## 断言分级（L1 / L2）

测试中的断言分为两级，迁移时必须先做分级判断（SKILL.md 5.0-EJS.2 为强制执行规则）：

| 级别 | 含义 | 失败时的处理 |
|------|------|-------------|
| **L1 通用断言** | Gridea EJS 引擎通用规则：官方变量名（`category.name`/`tag.count`/`pagination.*` 等）、include 组装模式、Gridea 字段用法。适用于**所有** EJS 目标迁移 | 主题缺陷，必须修复主题 |
| **L2 主题专有断言** | 绑定源主题 indigo 的实现细节：配置键（`enableLightbox`/`showTabsBar`/`avatar` 等）、JS 命名空间（`window.INDIGO`/`BLOG`）、模板名（`post-summary.ejs`/`post-category.ejs`/`blog.ejs`/`tags-bar.ejs` 等）、原版 HTML 结构 | **先怀疑断言而非主题**：按「为新主题调整测试的步骤指南」把断言适配到目标主题（需用户确认），不得为迁就断言改写主题 |

> **联动规则**：阶段七映射积累时，仅凭 L2 专有断言（单一主题的配置键/模板名）得出的映射只能标记 `[L2]`，不得作为 L1 高置信度映射写入。

各测试文件头部的分级注释标明了本文件的断言构成。

## 目录结构

```
ejs-port-tests/
├── README.md                     # 本文件
├── helpers/
│   └── ejs.js                    # 通用 EJS 模块加载器
├── blog-page.test.js             # [L2] indigo blog 页：列表结构、标题、分页 baseUrl
├── category-page.test.js         # [L1+L2] 分类页变量名(L1) + indigo 模板清单(L2)
├── config-image-defaults.test.js # [L2] indigo 图片配置项默认值与模板兜底
├── index-partials.test.js        # [L2] indigo 摘要四分支逻辑、分类平坦 DOM
├── lightbox.test.js              # [L2] indigo lightbox：window.INDIGO、enableLightbox
├── loading-toc.test.js           # [L1+L2] base.ejs 无 loading-bar(L1) + main.js TOC 保护(L2)
├── pagination-text.test.js       # [L2] indigo 分页按钮文案、列表页 include 清单
├── paginator.test.js             # [L1+L2] 分页变量(L1) + 原版 paginator 结构(L2)
└── tags-bar.test.js              # [L2] indigo tabs-bar：tags-bar.ejs、showTabsBar
```

## 如何使用

### 1. 复制到主题目录

将本目录下所有文件复制到目标主题根目录的 `tests/` 文件夹：

```
<theme-root>/
├── templates/
├── assets/
├── config.json
└── tests/
    ├── helpers/
    │   └── ejs.js
    ├── blog-page.test.js
    ├── ...
    └── tags-bar.test.js
```

### 2. 安装 ejs 依赖

测试通过 `tests/helpers/ejs.js` 加载 ejs 模块，需在主题目录安装 ejs（与 ejs2check 同版本）：

```bash
cd <theme-root>
npm i ejs@3.1.10
```

### 3. 运行测试

```bash
# 在主题根目录下运行
node --test "tests/*.test.js"
```

## 为新主题调整测试的步骤指南

（迁移源主题不是 indigo 时，必须先执行本步骤再运行测试）

1. **复制文件**：将本工具目录下所有文件复制到目标主题的 `tests/` 文件夹
2. **读分级注释**：通读各测试文件头部的 L1/L2 注释，确认哪些断言是 L2 专有断言
3. **调整 L2 断言**：
   - JS 命名空间：`lightbox.test.js` 中 `window.INDIGO` 替换为目标主题的实际命名空间
   - 配置项名称：`enableLightbox`/`showTabsBar`/图片类配置键与目标主题 `config.json` 对齐
   - 模板文件名：`post-summary.ejs`/`post-category.ejs`/`blog.ejs`/`tags-bar.ejs` 等改为目标主题实际文件名
4. **L1 断言保持不动**：Gridea 官方变量名/字段断言不得修改
5. **新增主题专有测试**：目标主题独特功能（特效、动画等）可在 `tests/` 下新增 `.test.js`
6. **运行测试**：`node --test "tests/*.test.js"` 并根据报错调整

> **禁止事项**：不得为了让 L2 断言通过而修改目标主题（改名配置键/命名空间/模板名以匹配 indigo）。L2 断言失败一律先调整断言。

## 与映射文件的联动

每条测试断言应对应 `references/hexo-port-mappings-ejs.md` 中的一条映射或陷阱，确保映射与验证双向可追溯（建议在测试文件头部注释中标注对应映射条目编号）。其中：L1 断言对应可复用的引擎级映射（L1 置信度）；L2 断言只服务 indigo 源主题，不得反向写入映射文件的高置信度条目。

## 测试覆盖范围

| 测试文件 | 分级 | 覆盖点 | 关联模板 |
|----------|------|--------|----------|
| `blog-page.test.js` | L2 | blog 页与首页一致的列表结构、标题固定「博客」、菜单激活 /post、分页 baseUrl /post/ | blog.ejs、post-summary.ejs |
| `category-page.test.js` | L1+L2 | L1：`category.name`/`category.count`/`posts.forEach`/`pagination.*` 字段、禁止手工拼接 `/categories/<cat.name>/`；L2：文件清单中的 indigo 模板名 | category.ejs、post-card.ejs、post-category.ejs 等 |
| `config-image-defaults.test.js` | L2 | 图片类配置项（picture-upload 类型 + 非空默认值）与模板层 `\|\|` 兜底 | config.json、header.ejs、post.ejs |
| `index-partials.test.js` | L2 | 摘要四分支（纯文本/显式摘要/实体语义/200 字截断）、KaTeX 保留与 katex-error 清理、分类平坦 DOM | post-summary.ejs、post-category.ejs |
| `lightbox.test.js` | L2 | `Blog.lightbox`/`LightBox` 类、图片包装结构、`window.INDIGO.enableLightbox`、跳过代码块/已包装图片 | footer.ejs、config.json |
| `loading-toc.test.js` | L1+L2 | L1：base.ejs 不输出 loading-bar；L2：main.js `if (!titles.length)` 空数组保护先于首次访问 | base.ejs、main.js |
| `pagination-text.test.js` | L2 | 分页按钮文案「上一页/下一页」、不含箭头字符、列表页 include paginator | paginator.ejs、index/blog/category/tag.ejs |
| `paginator.test.js` | L1+L2 | L1：`tag.link`+`tag.count`、baseUrl 传入；L2：原版 paginator HTML 结构（page-number/current/space 类名） | paginator.ejs、index/category/tag.ejs |
| `tags-bar.test.js` | L2 | tabs-bar 结构与交互钩子（BLOG.tabBar）、showTabsBar 开关、order 旋转算法 | tags-bar.ejs、tags/tag/category.ejs、main.css |

## 编写原则

1. 优先用 `ejs.compile(source, {filename})` 验证语法不抛错
2. 用 `ejs.render` + mock data 验证渲染输出（正则匹配关键 DOM/文案）
3. 用 `assert.doesNotMatch` 守住「禁止回退到旧实现」的回归项（如手工拼接 URL）
4. 源文件文本断言（`fs.readFileSync` + 正则）适合无法渲染的脚本片段（main.js）
5. 命名约定：`<功能>-<维度>.test.js`（如 `pagination-text`、`paginator` 分开关注点）
6. 文件头部标注断言分级（L1/L2），L2 断言注明绑定的源主题
