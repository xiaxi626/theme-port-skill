## 是什么

Gridea Pro 专属的主题构建 AI Agent Skill。将该系列 Skill 加载到支持 Skill 规范的 AI 客户端（Claude Code / Claude Desktop / Cursor / Cline / Trae 等）后，你用自然语言描述风格和需求，AI 就会产出一个完整的 Gridea Pro 主题目录，可直接复制到 `themes/` 下使用。

Gridea Pro 推荐 Jinja2 (Pongo2) 引擎。目前项目仅完整地支持 `Pug / Swig / Nunjucks / EJS` 四种 `Hexo` 源模板引擎迁移至 `Jinja2`。

> **原始出处**：本项目的核心 Prompt 文件和部分规则内容源自 [Gridea-Pro/theme-builder-skill](https://github.com/Gridea-Pro/theme-builder-skill)（GPLv3）。theme-builder-skill 是 Gridea Pro 官方主题开发 Skill，提供了完整的模板变量参考、引擎指南、脚手架脚本和渲染测试工具。本项目将其中的知识整合为一份自包含的迁移工作流 Prompt，便于独立分发和使用。

## 怎么用

将本项目的 Skill 文件复制到 Gridea Pro 官方项目 `theme-builder-skill` 的根目录下，阅读 Skill 文件的内容，按照文中提示文本输入自然语言指令。

> **注意**：本 Prompt 依赖 `theme-builder-skill` 仓库中的 `scripts/`（脚手架生成、语法验证、渲染测试）和 `references/`（模板变量参考、引擎指南等），请确保已克隆官方仓库并安装依赖。

## 搭配前端设计 Skill 效果更好

搭配前端设计 Skill 能最大化地使用本项目的 Skill 能力，推荐以下 Trae 插件：

test-driven-development、writing-plans、shadcn、frontend-skill、web-design-guidelines、brainstorming、security-best-practices、frontend-design

但请特别注意，不要一股脑地全部使用，请根据实际需求进行搭配，否则可能使流程变得繁琐，大幅降低 Agent 输出速度。

请注意在迁移工作中，搭配不同的 Skill 和 Prompt 是必要的。本项目的 Prompt 经多次测试能大幅提升迁移能力，由于其逻辑较为详尽，其初始应用已经能够达到非常好的预览效果，但仍需搭配其他技能使其输出保持规范和稳定。

## 开发环境

必要的仓库：`https://github.com/Gridea-Pro/theme-builder-skill`

```bash
git clone https://github.com/Gridea-Pro/theme-builder-skill.git
cd theme-builder-skill
pip install -r requirements.txt  # 仅需 jinja2
```

然后将本项目的 Prompt 文件放入 `theme-builder-skill/` 根目录，按 Prompt 中的使用方式执行。

## 许可证

本项目基于 [Gridea-Pro/theme-builder-skill](https://github.com/Gridea-Pro/theme-builder-skill) 的 GPLv3 许可内容衍生，因此同样使用 [GPLv3](LICENSE) 许可证。