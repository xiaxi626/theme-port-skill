---
name: theme-port-skill
description: 专用于 Hexo 主题到 Gridea Pro 迁移的工作流，支持 Pongo2 (Jinja2) 和 EJS 两种目标引擎。支持 Pug/Swig/Nunjucks/EJS 四种源模板引擎。需配合 gridea-theme-builder skill 使用——后者提供脚手架生成、语法校验、渲染测试脚本及模板变量参考文档。
---

# Hexo 主题 → Gridea Pro 迁移全流程 Prompt（主干）

> 本文件是 theme-port-skill 的**主干流程与门禁契约**。详细操作按阶段阅读 `references/` 下的对应文档。
> 核心原则：**先逆向分析成可核对契约，再实施迁移，最后做复刻差异审计。** 支持 Pug / Swig / Nunjucks / EJS 四种源引擎，目标为 Gridea Pro Pongo2 或 EJS。

---

## 角色设定

你是一位资深前端工程师和 Gridea Pro 主题开发专家。工作标准是 **100% 视觉与功能还原**：源主题可见的页面、组件、交互、CSS/JS 排版样式都必须在目标主题中有可验证的对应实现。

---

## 使用方式

加载以下两个 Skill：

- `gridea-theme-builder`：提供脚手架、`validate_syntax.py`、`render_test.py`、模板变量与架构文档。
- `theme-port-skill`：提供本迁移工作流、映射积累、`pongo2check` / `ejs2check` / `audit_static.py` 等专项工具。

**完整迁移模式：**

```
加载 gridea-theme-builder skill 和 theme-port-skill。

请严格按照 theme-port-skill 中的流程，
将 Hexo 主题 {HEXO_THEME_PATH} 迁移为 Gridea Pro 主题，目标主题名 {THEME_NAME}，目标引擎 {pongo2|ejs}。
```

**仅积累映射模式：** 直接跳转阶段七（见阶段七）。

AI 每阶段结束后汇报摘要并等待用户确认，再进入下一阶段。

---

## 强制知识加载

| 来源 | 文件 | 时机 |
|------|------|------|
| gridea-theme-builder | `SKILL.md`、`references/template-variables.md`、`references/theme-architecture.md`、`references/theme-config-schema.md`、目标引擎 guide、`references/quality-checklist.md` | 迁移开始前 |
| theme-port-skill | `references/port-artifacts.md` | 阶段一开始前 |
| theme-port-skill | `references/stage-1-reverse-analysis.md` | 执行阶段一时 |
| theme-port-skill | `references/stage-5-parity-verification.md` | 执行阶段五时 |
| theme-port-skill | `references/syntax-conversion-tables.md` | 执行阶段三/四时 |
| theme-port-skill | `references/completion-and-appendices.md` | 阶段六/七、功能补全时 |
| theme-port-skill | 目标引擎对应的 `references/hexo-port-mappings-*.md` | 阶段二与阶段七 |
| theme-port-skill | `references/mapping-governance.md` | 阶段二与阶段七 |

---

## 七阶段总览与门禁

| 阶段 | 目标 | 关键产物 | 通过门禁 |
|------|------|---------|---------|
| 一 | 逆向分析源主题 | `_port/{THEME_NAME}/` 下的 01/03/04/05 | 四文件齐全，裁剪项用户确认 |
| 二 | 推导变量映射 | `02-variable-map.md` | 映射表用户确认 |
| 三 | 脚手架 + 模板/资源/功能重写 | 目标主题 | 逐模板 `validate_syntax.py` 零新增错误 |
| 四 | CSS 忠实复刻 | `assets/**` | 4.2 清单通过 |
| 五 | 自动化验证 + 内容核查 + 复刻差异审计 | `static-audit.json`、`parity-audit.md` | 语法/渲染零 FAIL；`audit_static.py` 零 P0；差异审计 P0 清零 |
| 六 | 真机验证 | 输出站抽查 | 无 `fallback-banner`，逐页通过 |
| 七 | 映射积累 | 追加映射文件 | 编码校验通过 |

每阶段结束必须汇报摘要并等待用户确认，再进入下一阶段。

---

## 阶段一：逆向分析源主题（理解而非翻译）

> 执行细节：`references/stage-1-reverse-analysis.md`；产物模板：`references/port-artifacts.md`

执行 1.0~1.7，并在 `_port/{THEME_NAME}/` 落盘：

- `01-source-inventory.md`：文件级清单、页面-组件依赖图、模板逻辑、设计语言
- `03-static-map.md`：静态资源全量清单 + 引用闭包 + 路径换算
- `04-feature-matrix.md`：功能行为清单 + 五态迁移决策（直接复刻/等价替代/引擎原生/不可复刻/有意裁剪）
- `05-dom-contract.md`：主题 DOM 类名、状态类、JS 事件、动画时序、全局 html/body 契约

硬规则：

1. 资源必须从模板 `href/src/srcset/poster/data-*`、CSS `url()/@import/@font-face`、JS 路径字符串三处抽取，并递归求闭包。
2. 功能必须从模板、JS/TS、Hexo scripts/helper、`_config.yml`、CSS 状态五层提取，并回答：入口在哪、逻辑在哪、操作什么 DOM 状态、由谁初始化。
3. 所有“不可复刻/有意裁剪”项必须经用户确认后才能进入阶段二。

---

## 阶段二：推导变量映射表

读阶段一变量清单 + `template-variables.md` + 目标引擎映射文件，逐项推导，输出到 `02-variable-map.md` 并请用户确认。禁止硬编码映射。

**知识优先级（冲突时从上到下）：**

1. gridea-theme-builder 目标侧权威：`template-variables.md`、`theme-architecture.md`、目标引擎 guide。
2. 已积累的 L1 映射（人工确认）；L2 映射仅作参考。
3. `_port/01` 中的源主题变量清单——它只证明“源主题用了什么”，不决定“目标必须怎么写”。

`_port` 与目标侧权威冲突时，改 `_port/02-variable-map.md` 的迁移决策，不改目标侧参考。

---

## 阶段三：脚手架生成 + 模板/资源/功能重写

> 语法转换表、Pongo2 致命规则、模板重写顺序：`references/syntax-conversion-tables.md`

按依赖顺序执行：

1. 生成脚手架（gridea-theme-builder `scaffold_theme.py`）
2. 按 `03-static-map.md` 先落地全部静态资源
3. 按 `04-feature-matrix.md` 和 `05-dom-contract.md` 重写模板与 JS
4. 每完成一个模板运行 `validate_syntax.py`

---

## 阶段四：CSS 移植策略

> CSS 移植策略与检查清单：`references/syntax-conversion-tables.md` §CSS 移植策略

按源主题忠实复刻；必须保持 `05-dom-contract.md` 中的类名/状态类/动画时序契约。源主题没有的暗色模式/响应式端不自行添加。

---

## 阶段五：验证与复刻差异审计

> 执行细节：`references/stage-5-parity-verification.md`

按目标引擎执行强制语法质量门禁 + `validate_syntax.py` + `render_test.py`，然后强制执行：

1. **静态资源闭合审计**：`python tools/audit_static.py <THEME_DIR> --report _port/{THEME_NAME}/static-audit.json`，要求零 P0。
2. **原版/迁移版差异审计**（固定触发语）：

```text
现在进入复刻审计模式。请把迁移后的 Gridea 主题当作第三方提交进行审查：
1. 功能：逐一比对原主题与当前主题，列出未复刻的功能、逻辑有差异的功能；
2. 样式：比对 CSS/JS 排版样式差异，包括选择器、类名契约、状态类、动画时序、响应式断点；
3. 资源：核对静态资源引用是否完整、路径是否正确、依赖闭包是否闭合；
4. 输出差异清单，逐项标注：未复刻 / 逻辑差异 / 样式差异 / 资源差异 / 有意裁剪；
5. 对每个差异：修复并重新验证，或明确给出“有意裁剪”理由并记录到映射文件。
```

审计纪律：每个差异结论必须带源文件路径+行号/片段；目标“没有”的结论必须带搜索范围；视觉差异无截图时只列“疑似差异”。P0 必须清零才能进入阶段六。

---

## 阶段六：真机验证

复制主题到 Gridea Pro 数据目录，渲染后 grep `fallback-banner`，逐页抽查首页/文章页/归档/标签/友链/404，并检查暗色模式与 375px 响应式。

---

## 阶段七：映射积累

先读取 `_port/{THEME_NAME}/` 下的 `02-variable-map.md`、`04-feature-matrix.md`、`static-audit.json`、`parity-audit.md` 作为证据源，再对目标主题做前置预检和交叉比对，把结果追加到对应引擎的映射文件。每个来源块必须包含：

- 全局/文章/标签/分页/归档/Helper 变量映射
- **静态资源映射**：源路径 → assets 路径 → 输出 URL → 引用位置
- **JS 功能复刻映射**：源调用/源文件 → 复刻位置 → 逻辑要点
- 陷阱记录

写入规则与置信度 L1/L2 见 `references/mapping-governance.md`；`_port` 只作证据源，不替代该治理规则。

---

## Pongo2 速查卡片

| # | 坑 | 错误 | 正确 |
|---|-----|------|------|
| 1 | Filter 冒号 | `default("x")` | `default:"x"` |
| 2 | date filter | `post.date|date:"2006-01-02"` | `post.dateFormat` |
| 3 | not == 陷阱 | `not x == y` | `x != y` |
| 4 | 长度 | `.length` | `|length` |
| 5 | safe | `post.content` | `post.content|safe` |

---

## 扩展内容索引

- `references/stage-1-reverse-analysis.md`：阶段一 1.0~1.7 完整操作
- `references/stage-5-parity-verification.md`：阶段五全部验证命令与差异审计
- `references/syntax-conversion-tables.md`：语法转换表（表 A-E）、Pongo2 致命规则、模板重写顺序、CSS 移植策略与检查清单
- `references/port-artifacts.md`：`_port/` 产物模板与落盘规范
- `references/completion-and-appendices.md`：组件转换附录、发布清单、功能补全、编码保护
