## 是什么

Gridea Pro 专属的 **Hexo → Gridea Pro 主题迁移 Skill**。将本 Skill 与 `gridea-theme-builder` Skill 一起加载到支持 Skill 规范的 AI 客户端（Claude Code / Claude Desktop / Cursor / Cline / Trae 等）后，你用自然语言描述要迁移的 Hexo 主题，AI 就会按七阶段工作流自动完成迁移。

目前支持 `Pug / Swig / Nunjucks / EJS` 四种 Hexo 源模板引擎，目标统一为 Gridea Pro 的 Pongo2 (Jinja2) 引擎。

> **原始出处**：本项目的核心 Prompt 文件和部分规则内容源自 [Gridea-Pro/theme-builder-skill](https://github.com/Gridea-Pro/theme-builder-skill)（GPLv3）。theme-builder-skill 是 Gridea Pro 官方主题开发 Skill，提供了完整的模板变量参考、引擎指南、脚手架脚本和渲染测试工具。theme-port-skill 将迁移工作流独立为单独 Skill，映射积累文件存放于本项目 `references/` 目录下。

## 架构

```
theme-port-skill/              ← 本 Skill：迁移工作流 + 映射积累 + pongo2check
  ├── SKILL.md                 ← Skill 入口（迁移全流程 Prompt）
  ├── references/
  │   └── hexo-port-mappings.md  ← 变量映射积累（每次迁移后持续更新）
  ├── tools/pongo2check/       ← 真 Pongo2 语法校验（Go，真机同款解析器）
  └── ...

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

theme-port-skill **依赖** gridea-theme-builder 的 `scripts/`（脚手架、校验、渲染）和 `references/`（模板变量参考等），但**映射积累结果写入本项目**的 `references/hexo-port-mappings.md`，不再放入 gridea-theme-builder。

## 怎么用

### 1. 准备工作

```bash
# 克隆本仓库
git clone https://github.com/Gridea-Pro/theme-port-skill.git
cd theme-port-skill

# 克隆依赖仓库 theme-builder-skill
cd ..
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
对以下源主题和迁移后的主题执行交叉比对，将映射结果追加到 theme-port-skill 的 references/hexo-port-mappings.md。

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

## 搭配前端设计 Skill 效果更好

搭配前端设计 Skill 能最大化地使用本项目的 Skill 能力，推荐以下 Trae 插件：

test-driven-development、writing-plans、shadcn、frontend-skill、web-design-guidelines、brainstorming、security-best-practices、frontend-design

但请特别注意，不要一股脑地全部使用，请根据实际需求进行搭配，否则可能使流程变得繁琐，大幅降低 Agent 输出速度。

请注意在迁移工作中，搭配不同的 Skill 和 Prompt 是必要的。本项目的 Prompt 经多次测试能大幅提升迁移能力，由于其逻辑较为详尽，其初始应用已经能够达到非常好的预览效果，但仍需搭配其他技能使其输出保持规范和稳定。

## 许可证

本项目基于 [Gridea-Pro/theme-builder-skill](https://github.com/Gridea-Pro/theme-builder-skill) 的 GPLv3 许可内容衍生，因此同样使用 [GPLv3](LICENSE) 许可证。
