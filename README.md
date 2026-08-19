## 是什么

Gridea Pro 专属的 **Hexo → Gridea Pro 主题迁移 Skill**。将本 Skill 与 `gridea-theme-builder` Skill 一起加载到支持 Skill 规范的 AI 客户端（Claude Code / Claude Desktop / Cursor / Cline / Trae 等）后，你用自然语言描述要迁移的 Hexo 主题，AI 就会按七阶段工作流自动完成迁移。

目前支持 `Pug / Swig / Nunjucks / EJS` 四种 Hexo 源模板引擎，目标支持 **Pongo2 (Jinja2)** 和 **EJS** 两种 Gridea Pro 引擎。

> **原始出处**：本项目的核心 Prompt 文件和部分规则内容源自 [Gridea-Pro/theme-builder-skill](https://github.com/Gridea-Pro/theme-builder-skill)（GPLv3）。theme-builder-skill 是 Gridea Pro 官方主题开发 Skill，提供了完整的模板变量参考、引擎指南、脚手架脚本和渲染测试工具。theme-port-skill 将迁移工作流独立为单独 Skill，映射积累文件存放于本项目 `references/` 目录下。

## 前置要求

### 安装工具链

使用本项目前，请先装好以下工具（Windows / macOS / Linux 通用）：

| 工具 | 用途 |
|------|------|
| Node.js（含 npm，建议 18+） | 运行 ejs2check、ejs-port-tests、pongo2-port-tests |
| Go（建议 1.23+） | 运行 pongo2check（真 Pongo2 语法校验） |
| Python（含 pip） | 依赖的 gridea-theme-builder 工具链（仅需 jinja2） |

### 克隆与安装依赖

```bash
# 克隆本仓库
git clone https://github.com/xiaxi626/theme-port-skill.git
cd theme-port-skill

# 安装 ejs2check 依赖（ejs@3.1.10，与 Gridea Pro 前端版本一致）
cd tools/ejs2check && npm install && cd ../..

# ejs-port-tests 运行时需在目标主题目录单独安装同版本 ejs（Node 模块解析不会命中 ejs2check 的 node_modules）
cd <theme-root> && npm i ejs@3.1.10

# pongo2check 通过 go run 自动拉取依赖；pongo2-port-tests 零依赖（Node 内置模块）
```

> **关于 gridea-pro 仓库**：本项目各工具在**运行时不需要**克隆 gridea-pro。ejs / pongo2 的版本结论已固化在 `tools/ejs2check/package-lock.json`（ejs 3.1.10）与 `tools/pongo2check/go.mod`（flosch/pongo2/v6 v6.0.0）中，`npm install` / `go run` 会自动拉取正确版本。仅当维护者需重新核实 Gridea Pro 前端依赖版本时，才需克隆 <https://github.com/Gridea-Pro/gridea-pro> 作参考。

## 架构

```
theme-port-skill/              ← 本 Skill：迁移工作流 + 映射积累 + 验证工具
  ├── SKILL.md                 ← Skill 入口（迁移全流程 Prompt）
  ├── references/
  │   ├── hexo-port-mappings-pongo2.md  ← Pongo2 目标引擎映射积累
  │   └── hexo-port-mappings-ejs.md      ← EJS 目标引擎映射积累
  ├── tools/
  │   ├── pongo2check/        ← 真 Pongo2 语法校验（Go，真机同款解析器）
  │   ├── pongo2-port-tests/  ← Pongo2 目标引擎内容验证（Node.js 测试运行器）
  │   ├── ejs2check/          ← 真 EJS 语法校验（Node.js，EJS 官方解析器）
  │   └── ejs-port-tests/     ← EJS 目标引擎内容验证（Node.js 测试运行器）
  └── extras/                  ← 辅助材料

theme-builder-skill/           ← 依赖 Skill：工具链 + 参考文档
  ├── scripts/                 ← 脚手架生成、语法校验、渲染测试
  │   ├── scaffold_theme.py
  │   ├── validate_syntax.py
  │   └── render_test.py
  └── references/              ← 模板变量参考、引擎指南、架构文档
      ├── template-variables.md
      ├── jinja2-guide.md
      ├── theme-architecture.md
      └── ...
```

theme-port-skill **依赖** gridea-theme-builder 的 `scripts/`（脚手架、校验、渲染）和 `references/`（模板变量参考等），但**映射积累结果写入本项目**的 `references/` 目录（按目标引擎分文件），不再放入 gridea-theme-builder。


### 工作流文档拆分与中间产物

- `SKILL.md`：主流程与门禁契约；详细操作见 `references/stage-1-reverse-analysis.md`、`references/stage-5-parity-verification.md`。
- `references/port-artifacts.md`：定义 `_port/{THEME_NAME}/` 中间产物模板。`_port/` 在迁移执行时动态创建，不属于仓库提交内容。
- `tools/audit_static.py`：theme-port-skill 自有静态资源闭合审计工具，不修改/依赖 gridea-theme-builder；在阶段五 5.5 使用。


## 怎么用

### 1. 准备工作

完成上面「前置要求」的工具链安装与 theme-port-skill 克隆后，再克隆依赖仓库 theme-builder-skill：

```bash
cd ..  # 回到 theme-port-skill 的上级目录
git clone https://github.com/Gridea-Pro/theme-builder-skill.git
cd theme-builder-skill
pip install -r requirements.txt  # 仅需 jinja2
```

### 2. 加载 Skill

在 AI 客户端中同时加载两个 Skill：

1. 加载 `gridea-theme-builder` skill（提供工具链和参考文档）
2. 加载 `theme-port-skill`（即本 Skill，提供迁移工作流）

### 3. 开始迁移

按 SKILL.md 中「使用方式」的指示，向 AI 发送自然语言指令即可。两种模式：

**完整迁移模式**（从零开始迁移一个 Hexo 主题）：

```
加载 gridea-theme-builder skill 和 theme-port-skill。

请严格按照 theme-port-skill 中的流程，
将 Hexo 主题 /path/to/hexo-theme 迁移为 Gridea Pro Pongo2 主题，目标主题名 my-theme。
```

**仅积累映射模式**（对已有迁移主题进行事后交叉比对）：

```
加载 gridea-theme-builder skill 和 theme-port-skill。

请严格按照 theme-port-skill 中阶段七的流程，
对以下源主题和迁移后的主题执行交叉比对，将映射结果追加到 theme-port-skill 的 references/hexo-port-mappings-pongo2.md。

源 Hexo 主题：/path/to/hexo-theme
迁移后的 Gridea Pongo2 主题：/path/to/gridea-theme
来源名称：my-theme
```

## 真 Pongo2 语法校验 (pongo2check)

本项目自带一个权威语法校验工具 `tools/pongo2check/`,直接使用 **Gridea Pro 真机同款解析器** (`github.com/flosch/pongo2/v6 v6.0.0`) 编译全部模板,完整复刻了 Gridea Pro 的 SanitizingLoader(标签换行清理 + loop→forloop 变量映射)和 9 个自定义 filter。**pongo2check 通过的模板,Gridea Pro 真机一定能编译;它报错的,真机也一定编译不过。零假阳性。**

### 为什么需要它

gridea-theme-builder 的 `validate_syntax.py` 是**正则启发式**校验,不做真实编译,已知会放过:嵌套顺序错误、未注册 filter、HTML 破损等。pongo2check 用真解析器补上了这些盲区。

### 用法

```bash
# 需要有 Go 环境
go run ./tools/pongo2check <theme-dir>

# 或编译后直接运行
cd tools/pongo2check && go build -o pongo2check && ./pongo2check <theme-dir>
```

### CI 集成

```yaml
- uses: actions/setup-go@v5
  with: { go-version: '1.23' }
- run: go run ./tools/pongo2check ./themes/my-theme
```

## Pongo2 内容验证 (pongo2-port-tests)

本项目自带一个 Pongo2 主题迁移的内容验证工具 `tools/pongo2-port-tests/`，基于 **Node.js 内置测试运行器** (`node --test`)。与 ejs-port-tests 对称，适用于目标引擎为 Pongo2 (Jinja2) 的 Hexo → Gridea Pro 迁移。

### 与 pongo2check 的关系

| 工具 | 定位 | 说明 |
|------|------|------|
| pongo2check | **强制语法质量门禁** | 真 Pongo2 解析器批量编译，零假阳性，CI 必须通过 |
| pongo2-port-tests | 内容验证 | 源码文本断言，检查变量名/字段名/陷阱模式，补充语法检查不覆盖的语义验证 |

两者互补：pongo2check 确保语法正确，pongo2-port-tests 确保内容正确。

### 用法

```bash
# 复制到主题目录 tests/ 下运行
cp -r tools/pongo2-port-tests/* <theme-dir>/tests/
cd <theme-dir>
node --test "tests/*.test.js"
```

### 测试覆盖

27 项断言，覆盖 7 个维度（全部为 L1 通用断言，源自 `references/hexo-port-mappings-pongo2.md` 的陷阱记录；对合法风格差异已内置双兼容，如 `loop.*` vs `forloop.*`）：

| 测试文件 | 覆盖点 |
|----------|--------|
| `archives-group-keys.test.js` | `group.Year`/`group.Posts` 大写键名 + `post.date\|slice` 日期截取 + 客户端 JS 分组兼容 |
| `pagination-fields.test.js` | 分页器变量名（双名称兼容：`hasPrev/hasNext` vs `prev/next`） |
| `post-content-safe.test.js` | `post.content`/`abstract`/`toc` 必须 `\|safe` |
| `date-filter-trap.test.js` | 禁止 `\|date` filter，必须用 `dateFormat` 或 `\|slice` |
| `loop-forloop.test.js` | `loop.*/forloop.*` 循环变量 + `to_int` 数字比较 |
| `theme-config-toggle.test.js` | toggle 字符串值判断 + config.json 字段一致性 |
| `tags-links-fields.test.js` | 标签/分类/友链/菜单字段名验证 |

已在 anatolo、anubis2、typography 三个主题上验证全部通过。详见 `tools/pongo2-port-tests/README.md`。

## 真 EJS 语法校验 (ejs2check)

本项目自带一个权威语法校验工具 `tools/ejs2check/`，直接使用 **Gridea Pro 前端同款 EJS 解析器**（`ejs` npm 包 v3.1.10，与 Gridea Pro `package.json` 依赖版本一致）编译全部 `.ejs` 模板。**ejs2check 通过的模板，Gridea Pro 真机一定能编译；它报错的，真机也一定编译不过。零假阳性。**

### 为什么需要它

gridea-theme-builder 的 `validate_syntax.py` 是**正则启发式**校验，不做真实编译，对 EJS 引擎无法使用。ejs-port-tests 虽然能验证 EJS 编译，但它是内容级断言，不是强制语法质量门禁。ejs2check 填补了 EJS 引擎没有真解析器校验的空白。

**关于 Gridea Pro EJS 的技术说明：** Gridea Pro 前端使用标准 EJS npm 包，无自定义 filter 或预处理。因此官方 `ejs.compile()` 的结果与 Gridea Pro 真机完全一致，无需复刻任何 Gridea Pro 特有逻辑。这使得 ejs2check 比 pongo2check 实现更简洁，同时保持零假阳性。

### 用法

```bash
# 首次使用：安装依赖（node_modules/ 不随仓库分发，克隆后需先执行）
cd tools/ejs2check && npm install

# 快速语法检查（仅验证 compile，不解析 include 链）
node tools/ejs2check/main.js <theme-dir>

# 完整 include 链解析（更彻底，能检测 include 路径错误；include 断链记 FAIL，
# 数据相关运行时错误记 WARN 不误报）
node tools/ejs2check/main.js <theme-dir> --render
```

`package-lock.json` 已锁定 ejs 3.1.10，与 Gridea Pro 前端依赖一致。仓库自带 `tools/ejs2check/test-theme/` 夹具（含一个故意断链的 include）可用于自测：`node main.js test-theme --render` 应报出该断链。

**两种模式的区别：**

| 模式 | 命令 | 说明 |
|------|------|------|
| compile（默认） | `node main.js <dir>` | 快速语法检查，不解析 include 链 |
| renderFile | `node main.js <dir> --render` | 完整 include 解析，能检测 include 路径错误 |

### CI 集成

```yaml
- uses: actions/setup-node@v4
  with: { node-version: '20' }
- run: cd tools/ejs2check && npm install
- run: node tools/ejs2check/main.js ./themes/my-theme
```

## EJS 内容验证 (ejs-port-tests)

本项目自带一个 EJS 主题迁移的内容验证工具 `tools/ejs-port-tests/`，基于 **Node.js 内置测试运行器** (`node --test`)。适用于目标引擎为 EJS 的 Hexo → Gridea Pro 迁移。

### 与 ejs2check 的关系

| 工具 | 定位 | 说明 |
|------|------|------|
| ejs2check | **强制语法质量门禁** | 真 EJS 解析器批量编译，零假阳性，CI 必须通过 |
| ejs-port-tests | 内容验证 | 运行时 mock 数据 + DOM/文案断言，补充语法检查不覆盖的语义验证 |

两者互补：ejs2check 确保语法正确，ejs-port-tests 确保内容正确。

### 用法

```bash
# 将工具文件复制到目标主题的 tests/ 文件夹
cp -r tools/ejs-port-tests/ <theme-dir>/tests/

# 运行测试
cd <theme-dir>
node --test "tests/*.test.js"
```

### 依赖

测试通过 `tests/helpers/ejs.js` 加载 ejs 模块，复制到主题目录后执行 `npm i ejs@3.1.10`（与 ejs2check 同版本）。详见 `tools/ejs-port-tests/README.md`。

### 断言分级（L1/L2）

`tools/ejs-port-tests/` 的断言分两级：**L1 通用断言**（Gridea EJS 引擎通用规则，适用于所有 EJS 目标迁移，失败即主题缺陷）与 **L2 主题专有断言**（绑定源主题 indigo 的配置键/命名空间/模板名，迁移其他主题前必须按 README 调整，不得视为通用规范）。AI 使用本 Skill 时必须遵守 SKILL.md 5.0-EJS.2 的分级处理规则。

详见 `tools/ejs-port-tests/README.md`。

## 搭配前端设计 Skill 效果更好

搭配前端设计 Skill 能最大化地使用本项目的 Skill 能力，推荐以下 Trae 插件：

test-driven-development、writing-plans、shadcn、frontend-skill、web-design-guidelines、brainstorming、security-best-practices、frontend-design

但请特别注意，不要一股脑地全部使用，请根据实际需求进行搭配，否则可能使流程变得繁琐，大幅降低 Agent 输出速度。

请注意在迁移工作中，搭配不同的 Skill 和 Prompt 是必要的。本项目的 Prompt 经多次测试能大幅提升迁移能力，由于其逻辑较为详尽，其初始应用已经能够达到非常好的预览效果，但仍需搭配其他技能使其输出保持规范和稳定。

## 许可证

本项目基于 [Gridea-Pro/theme-builder-skill](https://github.com/Gridea-Pro/theme-builder-skill) 的 GPLv3 许可内容衍生，因此同样使用 [GPLv3](LICENSE) 许可证。
