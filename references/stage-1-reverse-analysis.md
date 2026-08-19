# 阶段一：逆向分析源主题（详细操作）

> 本文件是 `SKILL.md` 阶段一的执行细节。目标不是翻译模板，而是产出一套**可核对的逆向工程契约**。
> 所有完整产物写入 `_port/{THEME_NAME}/`，对话中只输出摘要与待用户决策项。
> 产物模板见 `references/port-artifacts.md`。

## 1.0 源引擎自动检测（优先执行）

| 文件扩展名 | 源引擎 | 典型目录 | 本项目缩写 |
|-----------|--------|---------|-----------|
| `.pug` | Pug | `layout/` | `pug` |
| `.swig` | Swig | `layout/` | `swig` |
| `.njk` | Nunjucks | `layout/` | `njk` |
| `.ejs` | EJS | `layout/` | `ejs` |

输出：`检测到源引擎：{引擎名}（扩展名：{ext}）`，并写入 `01-source-inventory.md`。

## 1.1 文件级目录扫描

遍历源主题完整目录结构，输出**文件级**清单（禁止 `source/js/*` 这类通配）。按以下分类：

| 分类 | 源文件 | 功能描述 | 对应目标 |
|------|--------|----------|---------|
| 布局 | `layout/layout.pug` | 全局 HTML 骨架 | `templates/base.html` |
| 页面 | `index.pug` / `post.pug` / `archive.pug` 等 | 各页面 | 对应固定模板名 |
| 局部 | `_partial/*` / `includes/*` | 可复用组件 | `templates/partials/*` |
| 组件 | mixin / macro / function / include | 组件复用 | include 或内联 |
| 样式源文件 | 每个 CSS/SCSS/LESS/字体文件 | 样式 | 见 1.5 资源映射 |
| 脚本源文件 | 每个 JS/TS 文件及构建配置 | 行为 | 见 1.6 功能矩阵 |
| 图片/字体/媒体 | 逐文件 | 资源 | 见 1.5 |
| 平台脚本 | `scripts/*.js`（Hexo helper/filter/generator/injector） | 平台能力 | 见 1.6 |
| 配置 | `_config.yml` | 主题配置 | `config.json` customConfig |

## 1.2 页面-组件依赖图

对每个页面模板画出依赖树，包含 extends/include/mixin/macro/partial 调用：

```
index.pug
  extends layout.pug
    include _partial/head.pug
    include _partial/header.pug
    block content
      include _mixins/post-card.pug
      include _partial/pagination.pug
    include _partial/footer.pug
    include _partial/scripts.pug
```

## 1.3 模板关键逻辑提取

对每个源模板记录：

- **条件分支**：if/else 控制的 UI 块及配置来源
- **循环逻辑**：循环生成的元素
- **变量使用清单**：`page.xxx` / `config.xxx` / `theme.xxx` / `site.xxx` / Helper，标注位置和语义。这是阶段二输入
- **组件复用调用**：Pug mixin 参数、Swig/Nunjucks macro 签名、EJS include/function 签名

## 1.4 设计语言提取

从源 CSS/SCSS 提取（不猜测，写证据位置）：

色板、字体栈、间距系统、布局参数、断点、圆角、阴影、过渡时长与缓动。

## 1.5 静态资源清单与引用闭包（P0 重点）

**目标：让“静态资源引用问题”在阶段三之前就无处藏身。**

### 1.5.1 全量枚举

遍历源主题所有静态资源，**逐文件**记录：源文件路径、类型、源最终 URL、Gridea assets 路径、输出 URL、迁移策略。

### 1.5.2 三处引用全量抽取

| 位置 | 抽取内容 |
|------|---------|
| 模板 | `href`、`src`、`srcset`、`poster`、`data-src`、`data-bg`、内联 `style="background..."`、`url_for()`、`theme.xxx` 拼接路径 |
| CSS | `@import`、`url()`、`@font-face src`、`image-set()` |
| JS/TS | 字符串路径、`fetch/XHR`、动态创建 `script/link/img`、`import/require`、构建产物固定路径 |

### 1.5.3 递归求闭包

二级依赖必须入表，例如：

```text
main.css → font-awesome.min.css → webfonts/fa-solid.woff2
app.js   → /api/search.json（Gridea 引擎产物，白名单）
```

### 1.5.4 路径换算（禁止“直觉上应该一样”）

同时给出四列：`源文件路径 → assets 路径 → 模板引用 URL → 预期输出 URL`。

规则：

1. Gridea 的 `assets/` 前缀在输出中去除：`assets/css/main.css` 输出为 `/css/main.css`。
2. 模板引用永远写输出 URL，不写 `assets/`。
3. 默认尽量保留源主题最终 URL，但必须显式换算 Hexo `config.root` 和 Gridea 去前缀规则。
4. 只有主动重映射时才允许换目录，且必须全量更新所有引用点。
5. 本地字体/图标默认本地化；CDN 转本地或本地转 CDN 都需说明理由。
6. data URI 和外部 CDN 单独登记。

### 1.5.5 产出物

写入 `03-static-map.md`，形成阶段三资源落地和阶段五 5.5 审计的基线。

## 1.6 功能行为清单与迁移决策（P0 重点）

**目标：让“原版功能遗漏”在阶段三之前就有清单可追。**

### 1.6.1 四层源码中提取功能

1. 模板层：条件 UI、组件、内联 `<script>`、`onclick="Namespace.foo()"`
2. 主题 JS/TS 层：`source/js`、`src/**`、构建产物、事件监听、`localStorage`
3. Hexo 平台层：`scripts/*.js` 的 helper/filter/injector/generator
4. 配置与 CSS 层：`_config.yml` 开关；CSS 状态类、hover/focus、动画、滚动行为

### 1.6.2 功能记录格式

| ID | 功能 | 源证据(文件:行) | 入口/触发 | 行为序列 | DOM/状态契约 | 数据来源 | 页面范围 | 迁移决策 |
|---|---|---|---|---|---|---|---|---|

### 1.6.3 迁移决策五态

| 状态 | 含义 | 后续动作 |
|---|---|---|
| 直接复刻 | 模板/静态 JS 可完整移植 | 阶段三实现 |
| 等价替代 | Gridea 有原生等价物 | 改用 Gridea 能力 |
| 引擎原生 | `/api/search.json`、评论等 Gridea 自动产物 | 直接接入 |
| 不可复刻 | 依赖 Hexo 后端机制 | **用户确认后记录** |
| 有意裁剪 | 明确不迁移 | **用户确认并写入排除清单** |

### 1.6.4 三类静默失效必查

1. **命名空间失效**：模板 `onclick="ThemeNS.xxx()"` 存在，但目标没有 `window.ThemeNS` 定义。
2. **选择器失配**：JS 监听 `.old-class`，模板迁移时改成了 `.new-class`。
3. **状态类契约丢失**：JS 添加 `.show/.expanded/.fadeIn`，CSS 只认这些类；缺任一端都表现为功能未复刻。

每个功能迁移后必须能回答：入口在哪、逻辑在哪、它操作的 DOM/CSS 状态是什么、由谁初始化。

产出物：`04-feature-matrix.md`。

## 1.7 DOM/类名/状态/样式契约（P0 重点）

CSS 复刻不只等于色板和断点，还要锁定选择器契约。分类处理：

| DOM 来源 | 策略 |
|---|---|
| 主题模板自有类名 | 默认原样保留，JS/CSS 依赖它们 |
| Hexo 渲染器生成结构 | 映射到 Gridea Markdown 输出结构，做 CSS/JS 适配 |
| Gridea 引擎生成结构 | 以 Gridea 为准，CSS 做兼容适配 |

记录内容：

- 组件类名 / ID / `data-*`
- JS 操作的状态类
- 动画/过渡时序数值（从源码读取，不凭感觉写）
- `html` 属性、`body class` 等全局契约
- 断点

产出物：`05-dom-contract.md`。

## 阶段一完成门槛

只有以下文件全部生成且“不可复刻/有意裁剪”项经用户确认后，才能进入阶段二：

```text
_port/{THEME_NAME}/01-source-inventory.md
_port/{THEME_NAME}/03-static-map.md
_port/{THEME_NAME}/04-feature-matrix.md
_port/{THEME_NAME}/05-dom-contract.md
```

对话中输出简短摘要：源引擎、资源数量、功能数量、需要用户决策的裁剪项。
