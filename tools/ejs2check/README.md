# ejs2check — Gridea Pro 真 EJS 语法校验器

使用 **Gridea Pro 真机同款 EJS 解析器**（`ejs` npm 包 v3.1.10，与 Gridea Pro 前端 `package.json` 依赖版本一致）编译主题全部 `.ejs` 模板，零假阳性。

## 为什么需要它

`gridea-theme-builder` 的 `validate_syntax.py` 是**正则启发式**校验，不做真实编译。`pongo2check` 虽用真解析器，但仅支持 Pongo2。ejs2check 用 EJS 官方解析器补上了 EJS 引擎的空白，是 EJS 目标引擎的**权威语法门**。

**与 pongo2check 的关键区别：**

| | pongo2check | ejs2check |
|---|---|---|
| 解析器 | `flosch/pongo2/v6` + 9 个自定义 filter | `ejs` npm 包 v3.1.10（标准版） |
| 预处理 | SanitizingLoader（换行清理 + loop 映射） | 无需（EJS 无自定义 filter/loader） |
| 实现语言 | Go | Node.js |
| 零假阳性 | ✅ 复刻 Gridea Pro 全部特改 | ✅ EJS 标准引擎，天然一致 |

## 用法

```bash
# 首次使用：安装依赖
cd tools/ejs2check && npm install

# 直接运行（需要 Node.js 环境）
node tools/ejs2check/main.js <theme-directory>

# 完整 include 链解析（更彻底）
node tools/ejs2check/main.js <theme-directory> --render

# 查看帮助
node tools/ejs2check/main.js --help
```

> **依赖安装**：`node_modules/` 不随仓库分发（已 gitignore）。克隆后首次使用前执行 `cd tools/ejs2check && npm install`，`package-lock.json` 已锁定 ejs 3.1.10（与 Gridea Pro 前端依赖一致）。
>
> **自测夹具**：仓库自带 `tools/ejs2check/test-theme/`（含一个故意断链的 include）。`node main.js test-theme` 应输出 1 条 WARN；`node main.js test-theme --render` 应把 `broken.ejs` 报为 FAIL（验证断链检测真实生效）。

## 两种模式

| 模式 | 命令 | 说明 |
|------|------|------|
| compile（默认） | `node main.js <dir>` | 快速语法检查，仅验证 `ejs.compile()`，不解析 include 链 |
| renderFile | `node main.js <dir> --render` | 完整 include 解析，使用 `ejs.renderFile()` 递归解析 include 链，能检测 include 路径错误 |

`--render` 模式更彻底（真实解析嵌套 include 链，能检测 include 路径错误）。渲染数据使用内置的「安全数据」代理——任意变量访问/函数调用都返回可继续链式的占位值，因此模板引用真实数据（`site.customConfig.xxx`、`post.tags` 等）时不会因 undefined 误报，保持零假阳性。错误分级：include 断链与编译错误记 **FAIL**；ejs 对嵌套 include 的局部数据做浅拷贝（空对象），由此产生的数据相关运行时错误（ReferenceError/TypeError 等）记 **WARN**——真机注入真实数据后通常不存在，不影响语法门判定。推荐在 CI 中使用 compile 模式作为快速检查，在本地开发时使用 `--render` 模式进行深度检查。

## 输出格式

```
config.json engine: ejs
Found 6 .ejs template file(s)
Mode: compile-only (fast, --render for include resolution)

PASS  templates/index.ejs
PASS  templates/post.ejs
FAIL  templates/category.ejs  SyntaxError: Unexpected token '}'
WARN  templates/tag.ejs → referenced file not found: partials/missing.ejs

============================================
  PASS: 5  FAIL: 1  WARN: 1
============================================
```

## CI 集成

```yaml
- uses: actions/setup-node@v4
  with: { node-version: '20' }
- run: cd tools/ejs2check && npm install
- run: node tools/ejs2check/main.js ./themes/my-theme
```

## 与 ejs-port-tests 的关系

| 工具 | 定位 | 说明 |
|------|------|------|
| ejs2check | **权威语法门** | 真 EJS 解析器批量编译，零假阳性，CI 必须通过 |
| ejs-port-tests | 内容验证 | 运行时 mock 数据 + DOM/文案断言，补充语法检查不覆盖的语义验证 |

两者互补：ejs2check 确保语法正确，ejs-port-tests 确保内容正确。

## 设计说明

### Gridea Pro EJS 后端研究结论

通过研究 Gridea Pro 仓库（`Gridea-Pro/gridea-pro`），发现：

1. **Gridea Pro 前端 `package.json` 依赖 `ejs@^3.1.10`**，与本工具完全一致
2. **EJS 在 Gridea Pro 中无自定义 filter 或预处理**——Gridea Pro 使用标准 EJS API 编译和渲染模板
3. 官方 `ejs.compile()` 的结果与 Gridea Pro 真机完全一致，无需复刻任何 Gridea Pro 特有逻辑

### include 路径解析

EJS 的 `include()` 函数按以下优先级查找文件：

1. **绝对路径**：如果 ref 是绝对路径，直接使用
2. **相对路径**：相对于当前模板文件所在目录
3. **views root**：相对于 `views` 配置目录（`templates/` 和 `templates/partials/`）
4. **自动追加扩展名**：如果 ref 没有扩展名，依次尝试 `.ejs` 和 `.html`

本工具的 `checkStaticRefs()` 函数完整复刻了这一逻辑，能在编译前静态检测 include 引用错误。

因此 ejs2check 天然零假阳性——通过的模板一定能在 Gridea Pro 真机编译。
