# Gridea Pro Pongo2 主题迁移测试工具

> **工具定位**：Gridea Pro Pongo2 主题迁移的内容级验证工具（与 ejs-port-tests 对称）
> **适用范围**：所有目标引擎为 Pongo2 (Jinja2) 的 Hexo → Gridea 迁移
> **对应映射**：见 `references/hexo-port-mappings-pongo2.md`

## 背景

Gridea Pro 主题开发 Skill 提供的 `pongo2check` 是**权威语法门**（真 Pongo2 编译，零假阳性），但它只检查语法可编译，不检查变量名、字段名、陷阱模式等**内容正确性**。本工具补上这一层——基于源码文本断言，验证迁移后的模板是否正确使用了 Gridea Pro 的变量名和 Pongo2 语法模式。

**与 pongo2check 的关系：**

| 工具 | 定位 | 说明 |
|------|------|------|
| pongo2check | **权威语法门** | 真 Pongo2 解析器批量编译，零假阳性，CI 必须通过 |
| pongo2-port-tests | 内容验证 | 源码文本断言，检查变量名/字段名/陷阱模式，补充语法检查不覆盖的语义验证 |

两者互补：pongo2check 确保语法正确，pongo2-port-tests 确保内容正确。

## 目录结构

```
pongo2-port-tests/
├── README.md                          # 本文件
├── helpers/
│   └── pongo2.js                      # SanitizingLoader 预处理 + 路径解析工具
├── archives-group-keys.test.js        # 归档页 group.Year/group.Posts 大写键名 + post.date|slice
├── pagination-fields.test.js          # 分页器变量名（hasPrev/hasNext/prevURL/nextURL）
├── post-content-safe.test.js          # post.content/abstract/toc 必须 |safe
├── date-filter-trap.test.js           # 禁止 |date filter，必须用 dateFormat 或 |slice
├── loop-forloop.test.js              # loop.*/forloop.* 循环变量 + to_int 数字比较
├── theme-config-toggle.test.js        # toggle 字符串值判断 + config.json 字段一致性
└── tags-links-fields.test.js          # 标签/分类/友链/菜单字段名验证
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
    │   └── pongo2.js
    ├── archives-group-keys.test.js
    ├── ...
    └── tags-links-fields.test.js
```

### 2. 运行测试

```bash
# 在主题根目录下运行
node --test "tests/*.test.js"
```

> **无需额外依赖**：本工具的 27 项断言全部为源码文本断言（`fs.readFileSync` + 正则），不加载任何 Pongo2 渲染引擎——真正的 Pongo2 解析由 pongo2check（Gridea Pro 真机同款 Go 解析器）承担，npm 上也不存在官方 pongo2 绑定。helpers/pongo2.js 中的 SanitizingLoader 预处理复刻了 pongo2check 的逻辑，供未来需要预处理的扩展场景使用。

## 断言分级（L1 / L2）

### L1 通用断言（适用于所有 Pongo2 主题迁移）

以下断言基于 `hexo-port-mappings-pongo2.md` 的陷阱记录，是所有 Pongo2 迁移都必须遵守的硬性规则：

| 测试文件 | 通用断言 | 关联映射陷阱 |
|----------|---------|-------------|
| `archives-group-keys.test.js` | `group.Year`/`group.Posts` 大写、`post.date\|slice` | 归档分组键大写、date filter 不可用 |
| `pagination-fields.test.js` | 使用 `pagination.*` 而非 `page.prev_link` | 分页变量映射 |
| `post-content-safe.test.js` | `post.content\|safe`、`post.abstract\|safe` | HTML 内容必须 safe |
| `date-filter-trap.test.js` | 禁止 `post.date\|date`，用 `dateFormat` | date filter 不可用 |
| `tags-links-fields.test.js` | `tag.link`/`cat.link`/`link.siteName` | 字段名映射 |

### L2 主题专有/兼容性调整项（需根据目标主题调整）

以下断言可能需要根据目标主题的实际情况调整：

- **循环变量**：`loop.first/last`（anatolo 风格）vs `forloop.Counter`（anubis2 风格）——两者都能通过真机，但测试中的正则可能需要调整
- **分页器变量名**：`pagination.hasPrev/hasNext`（标准）vs `pagination.prev/next`（anubis2 简写）——测试已兼容两种
- **TOC 实现**：`post.toc|safe`（服务端）vs 客户端 JS 重建——测试仅在有 `post.toc` 引用时检查
- **菜单高亮**：`current_page == "xxx"`（Gridea 内置）vs JS pathname 匹配（anatolo 风格）——测试仅检查 `menus` 遍历

> **L2 处理规则**（与 ejs-port-tests 一致）：L2 调整项失败时先调整断言而非主题；仅凭 L2 调整项得出的"映射"不得作为映射文件的高置信度（L1）证据。

## 为新主题调整测试的步骤指南

1. **复制文件**：将本工具目录下所有文件复制到目标主题的 `tests/` 文件夹
2. **检查模板路径**：确认测试中引用的模板文件名（如 `archives.html`、`partials/pagination.html`）在目标主题的 `templates/` 目录下存在
3. **调整分页器文件名**：测试兼容 `pagination.html` 和 `paginator.html`，如目标主题用其他名字需修改 `pagination-fields.test.js`
4. **运行测试**：执行 `node --test "tests/*.test.js"` 并根据报错调整
5. **新增主题专有测试**：如果目标主题有独特的功能，可在 `tests/` 下新增对应的 `.test.js` 文件

## 与映射文件的联动

每条测试断言对应 `hexo-port-mappings-pongo2.md` 中的一条映射或陷阱，确保映射与验证双向可追溯。建议在测试文件头部注释中标注对应的映射条目。

## 测试覆盖范围

| 测试文件 | 覆盖点 | 关联陷阱/映射 |
|----------|--------|-------------|
| `archives-group-keys.test.js` | `group.Year`/`group.Posts` 大写、`post.date\|slice:"5:10"`、`post.link` | 归档分组键大写、date filter 禁用 |
| `pagination-fields.test.js` | `pagination.hasPrev/hasNext/prevURL/nextURL`、列表页 include 分页器 | 分页变量映射 |
| `post-content-safe.test.js` | `post.content\|safe`、`post.abstract\|safe`、`post.toc\|safe` | HTML 内容必须 safe |
| `date-filter-trap.test.js` | 禁止 `post.date\|date`、用 `dateFormat`、datetime 用 `post.date` | date filter 不可用 |
| `loop-forloop.test.js` | `loop.first/last`、`forloop.Counter`、`theme_config\|to_int` | SanitizingLoader loop→forloop 映射 |
| `theme-config-toggle.test.js` | toggle 非"false"判断、config.json 字段一致性 | toggle 字符串值陷阱 |
| `tags-links-fields.test.js` | `tag.link`/`tag.count`、`cat.link`、`link.siteName`/`siteLink`、`menus` | 字段名映射 |

## 编写原则

1. 优先用**源码文本断言**（`fs.readFileSync` + 正则）——无需 pongo2 依赖，跨平台
2. 用 `assert.doesNotMatch` 守住"禁止回退到旧实现"的回归项（如 `|date` filter、手工拼接 URL）
3. 文件不存在时优雅跳过（`if (!fs.existsSync(filePath)) return`）——兼容主题不实现所有页面
4. 兼容多种合法写法（如 `pagination.hasPrev` vs `pagination.prev`）
5. 命名约定：`<功能>-<维度>.test.js`（如 `archives-group-keys`、`date-filter-trap`）
