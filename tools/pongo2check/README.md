# pongo2check — Gridea Pro 真 Pongo2 语法校验器

使用 **Gridea Pro 真机同款解析器** (`flosch/pongo2/v6 v6.0.0`) 编译主题全部模板,零假阳性。

## 复刻的 Gridea Pro 管线

此工具完整复刻了 Gridea Pro 真机 (`Gridea-Pro/gridea-pro`) 的 pongo2 渲染管线:

1. **SanitizingLoader** — 标签 `{{ }}` `{% %}` `{# #}` 内换行清理 + Jinja2 `loop.*` → Pongo2 `forloop.*` 变量映射
2. **9 个自定义 filter** — `reading_time` `excerpt` `word_count` `strip_html` `relative` `timeago` `to_json` `group_by` `to_int`
3. **pongo2/v6 v6.0.0** — 与 Gridea Pro go.mod 锁定版本一致

pongo2check 通过的模板,Gridea Pro 真机**一定**能编译。它报错的,真机**一定**编译不过。零假阳性。

## 上游监控点

每次 Gridea Pro 发新版时检查以下文件是否发生变化,如有变化同步更新 main.go:

| Gridea Pro 文件 | 监控内容 | 对应 main.go 位置 |
|---|---|---|
| `backend/internal/render/jinja2_loader.go` | `sanitizeTemplate` 正则、`reLoop*` 映射规则 | `SanitizingLoader.Get()` |
| `backend/internal/render/jinja2_renderer.go` → `registerCustomFilters` | 新增/删除/改名自定义 filter | `registerGrideaFilters()` |
| `go.mod` → `flosch/pongo2/v6` 版本 | pongo2 版本号 | `go.mod` |

## 用法

```bash
# 需要有 Go 环境
go run ./tools/pongo2check <theme-dir>

# 或编译后直接运行
cd tools/pongo2check && go build -o pongo2check && ./pongo2check <theme-dir>
```

输出示例:

```
config.json engine: jinja2
PASS  templates/index.html
PASS  templates/post.html
PASS  templates/partials/header.html
FAIL  templates/tag.html  [Line 8 Col 12] Filter 'nonexistent' does not exist.
WARN  templates/post.html → referenced file not found: partials/ghost.html

============================================
  PASS: 18  FAIL: 1  WARN: 1
============================================
```

## CI 集成

```yaml
jobs:
  pongo2check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.23' }
      - run: go run ./tools/pongo2check ./themes/my-theme
```

## 与官方 validate_syntax.py 的区别

| | pongo2check | validate_syntax.py |
|---|---|---|
| 解析方式 | 真 Pongo2 编译器 | 正则启发式 |
| 嵌套顺序错误 | ✓ 抓住 | ✗ 放过 |
| 未注册 filter | ✓ 抓住 | ✗ 放过 |
| 括号 filter 语法 | ✓ 抓住 | ✓ 抓住 |
| include 文件缺失 | ✓ 抓住(parse + 静态) | ✓ 抓住(静态) |
| HTML 破损 | ✗ 不管 | ✗ 不管 |
| 假阳性 | **零** | 有(macro、某些 filter) |
| 依赖 | Go | 无(Python 标准库) |
