# 阶段五：自动化验证 + 内容核查 + 复刻差异审计（详细操作）

> 本文件是 `SKILL.md` 阶段五的执行细节。原则：**渲染成功 ≠ 内容正确，自动化通过 ≠ 复刻完整。**

## 验证路径选择

- **Pongo2 目标**：5.0（真 Pongo2 语法验证）→ 5.1（补充正则校验）→ 5.2（渲染测试）→ 5.3（内容核查）→ 5.4（问题速查）→ **5.5（静态资源闭合审计）→ 5.6（原版/迁移版差异审计）**
- **EJS 目标**：5.0-EJS（真 EJS 语法验证 + 内容验证）→ 5.3 → 5.4 → **5.5 → 5.6**

---

## 5.0 Pongo2：真语法验证（强制语法质量门禁）

```bash
# 在 theme-port-skill 仓库根目录执行
go run ./tools/pongo2check <THEME_DIR>
```

**目标：零 FAIL。** 无 Go 环境时降级到 5.1，但必须注明可能漏检。

## 5.0-EJS EJS：真语法验证与内容验证

```bash
cd tools/ejs2check && npm install
node tools/ejs2check/main.js <THEME_DIR>            # 快速编译检查
node tools/ejs2check/main.js <THEME_DIR> --render   # 完整 include 链
```

随后复制 `tools/ejs-port-tests/` 到主题 `tests/`，在主题根目录安装 ejs 依赖（与 ejs2check 同版本），再执行测试：

```bash
cd <THEME_DIR> && npm i ejs@3.1.10
node --test "tests/*.test.js"
```

L1 失败为主题缺陷；L2 只允许调整断言，禁止迁就断言改写主题。

## 5.1 补充正则校验

在 **gridea-theme-builder 仓库根目录**执行：

```bash
python scripts/validate_syntax.py <THEME_DIR>
```

**目标：零 ERROR、零 WARN。** 该工具是正则启发式，不是真编译。

## 5.2 渲染测试

在 **gridea-theme-builder 仓库根目录**执行：

```bash
python scripts/render_test.py <THEME_DIR> --output-dir ./test-output
```

**目标：所有页面渲染成功，无残留模板标签。**

## 5.3 内容级核查

逐页抽查 `test-output`：列表非空、分页、标签云、文章内容、上下篇、归档年份（`group.Year` 大写）、友链字段、空文章边界。

## 5.4 常见内容级问题速查

| 症状 | 可能原因 | 修复 |
|------|---------|------|
| 整页空白 | `{% extends %}` 不是第一个标签 | 移到第一行 |
| if 块消失 | `not x == y` 静默失效 | 改 `!=` |
| 归档年份不显示 | `group.year` 小写 | 改 `group.Year` |
| HTML 显示为文本 | 缺 `|safe` | 补 `|safe` |
| 日期为空 | 对字符串用 `|date` | 改 `dateFormat` |
| 循环体空 | 变量名写错 | 对照 `02-variable-map.md` |
| 分页不显示 | 用 `pagination.prev` 判断 | 用 `pagination.hasPrev` |
| 暗色无效 | 暗色 CSS 变量缺失 | 检查 CSS |

## 5.5 静态资源闭合审计（theme-port-skill 自有工具）

> 本步骤**不修改也不依赖** gridea-theme-builder。工具直接审计目标主题目录，原理是 Gridea 资源路径规则确定：`assets/x → /x`。

在 **theme-port-skill 仓库根目录**执行：

```bash
python tools/audit_static.py <THEME_DIR> --report _port/{THEME_NAME}/static-audit.json
```

**通过条件：零 P0。WARN 逐项人工确认后记录。**

审计内容：

- 模板 `href/src/srcset/poster/data-*` 字面量本地引用
- CSS `@import` / `url()` / `@font-face` 依赖闭包
- JS 中路径特征明显的静态字符串
- `/assets/` 前缀、相对路径、Hexo `source/` 残留
- `.less → .css` 编译产物识别
- 动态变量引用（`config.avatar` / `post.feature` 等）输出为 WARN，必须对照 `03-static-map.md` 确认

## 5.6 原版/迁移版差异审计（复刻审计模式，强制）

> 把你发现问题的对比提示词内建为固定阶段。此阶段把迁移后的主题当作**第三方提交**审查，不允许用“已经按流程迁移”代替证据。

### 固定执行提示词

```text
加载 gridea-theme-builder skill 和 theme-port-skill。

现在进入复刻审计模式。请把迁移后的 Gridea 主题当作第三方提交进行审查：
1. 功能：逐一比对原主题与当前主题，列出未复刻的功能、逻辑有差异的功能；
2. 样式：比对 CSS/JS 排版样式差异，包括选择器、类名契约、状态类、动画时序、响应式断点；
3. 资源：核对静态资源引用是否完整、路径是否正确、依赖闭包是否闭合；
4. 输出差异清单，逐项标注：未复刻 / 逻辑差异 / 样式差异 / 资源差异 / 有意裁剪；
5. 对每个差异：修复并重新验证，或明确给出“有意裁剪”理由并记录到映射文件。
```

### 差异判定原则（防止把源主题当标准答案）

**“源主题有、目标没有”不自动等于缺陷。** 5.6 必须结合 `02-variable-map.md` 和已有 L1/L2 映射，先判断差异属于哪一类：

| 差异类型 | 判定依据 | 处置 |
|---|---|---|
| 未记录的功能缺失 | `02`/`04` 无任何决策，目标也没有实现 | P0 |
| 等价替代 | 源功能在目标侧以 Gridea 原生能力实现，且 `02`/`04` 已记录 | 通过，不改判缺陷 |
| 有意裁剪 | 用户已确认，排除清单已记录 | 通过，不重复报 P0 |
| 已记录但实现错误 | `02`/`04` 有决策，但目标实现违反决策或违反目标侧权威规则 | P0/P1 |
| 源主题特有且目标侧无能力 | Gridea 官方文档明确不支持 | 记录为不可复刻，由用户确认 |

目标侧唯一权威仍是 gridea-theme-builder 文档；`_port` 只能作为源侧证据，不能推翻 `template-variables.md` / `theme-architecture.md` / 引擎 guide。

### 审计纪律（防幻觉）

1. 每个“未复刻”结论必须给出**源文件路径 + 行号/片段**。
2. 每个“目标没有”结论必须给出**目标主题搜索范围与搜索结果**。
3. 差异证据分两级：
   - **代码/资源级差异**：可静态证实，作为 P0/P1；
   - **视觉/排版差异**：静态对比只能列为“疑似差异”，有浏览器/截图条件时确认，否则人工确认。
4. 疑似视觉差异不能直接判失败，但必须进入待确认清单。

### 差异分级

| 级别 | 定义 | 处置 |
|------|------|------|
| P0 | 可见功能失效、资源断链、JS 命名空间失效 | 修复，全部清零 |
| P1 | 局部功能/样式差异 | 修复或用户确认 |
| P2 | 细节偏差 | 记录，可后续处理 |

### 产出物

写入 `_port/{THEME_NAME}/parity-audit.md`，并回写 `04-feature-matrix.md`、`03-static-map.md`、`05-dom-contract.md` 的处置状态。P0 未清零不得进入阶段六。

---

## 阶段五完成门槛

- 对应引擎强制语法质量门禁：零 FAIL
- `validate_syntax.py`：零 ERROR / 零 WARN
- `render_test.py`：零 FAIL
- `audit_static.py`：零 P0
- 差异审计：P0 清零，P1/P2 均有处置记录
- `_port/{THEME_NAME}/static-audit.json`、`parity-audit.md` 已生成
