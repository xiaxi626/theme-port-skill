# Hexo → Gridea Pro (EJS) 变量映射积累

> 本文件由阶段七交叉比对生成（需用户确认排除范围），累积所有已确认的跨系统变量映射关系。
> 后续迁移时，阶段二优先查阅本文件作为先验知识；如有冲突，以 template-variables.md 为准。

本文件仅包含 EJS 目标引擎的映射。Pongo2 (Jinja2) 目标引擎映射见 hexo-port-mappings-pongo2.md。

---

## 来源：hexo-theme-indigo（迁移日期：2026-08-06，目标引擎：EJS）[L1-高置信度]

> **本条目为 EJS → EJS 迁移**（源 Hexo EJS 模板 → Gridea Pro EJS 引擎），与上述 Pongo2 目标条目并存。EJS 引擎差异（与 Pongo2 条目对照）：
> - `post.date` 可直接用于 `datetime` 属性，**无 Pongo2 的 `|date` 禁忌**（EJS 无 filter 语法）。
> - HTML 输出用 `<%- %>`（不转义）而非 Pongo2 的 `|safe` filter；纯文本用 `<%= %>`。
> - 逻辑直接写 JS（`forEach` / `&&` / `||` / `typeof`），而非 Pongo2 的 `for`/`and`/`or`。
> - 自定义配置访问路径为 `site.customConfig.xxx`（Gridea Pro EJS 引擎实际变量），而非 Pongo2 的 `theme_config.xxx`。
> - 自定义配置 toggle 值由 GUI 传入字符串，需 `String(site.customConfig.showXxx) !== 'false'` 或 `=== 'true'` 判断。

### 排除的组件
- 无（用户未声明排除，全部文件参与比对）

### 架构差异总览（先验）

- **模板组织**：源用 Hexo `partial('_partial/xxx')` + `layout.ejs` 包裹 `<%- body %>`；目标用 EJS `include('partials/xxx')` 组装，**每个页面模板均为完整 `<!DOCTYPE html>` 文档**，直接 `include('partials/head'/'header'/'footer')`。`templates/base.ejs` 仅作骨架参考，实际未被 extends（EJS 引擎未使用模板继承，采用 include 组装模式）。
- **变量前缀迁移**：`config.*` → `site.*` / `site.customConfig.*`；`theme.*` → `site.customConfig.*`；`page.*` → `post.*`（详情页）或列表项 `post`；`site.tags` / `site.categories` → 顶层 `tags` / `categories`；`page.posts` → 顶层 `posts`。
- **助手普遍内联化**：`url_for` / `date_xml` / `full_date` / `list_categories` / `list_tags` / `toc` / `truncate` / `strip_html` / `image_tag` / `paginator` / `open_graph` / `favicon_tag` / `is_home` / `is_post` / `is_archive` / `is_tag` / `is_category` / `is_year` / `is_month` / `__` / `qrcode` 全部移除，改为预构建字段、手写 HTML/JS 或硬编码中文。

### 全局变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| `config.title` | `site.customConfig.siteName`（回退链 themeConfig.siteName → site.siteName → 'Gridea Blog'） | head.ejs → head.ejs | 字段名不同；多级回退 |
| `config.subtitle` | `site.customConfig.indexSubtitle`（受 `showIndexSubtitle` 开关控制） | header.ejs → header.ejs / index.ejs | 首页副标题专用字段，非通用 subtitle |
| `config.url` | `site.domain` | share.ejs / copyright.ejs → footer.ejs / post.ejs | 含协议头，用于绝对 URL 拼接 |
| `config.author` | `site.customConfig.author`（回退 site.siteName / 'Blog'） | copyright.ejs / page.ejs → footer.ejs / header.ejs / post.ejs | 多处使用 |
| `config.description` | `site.siteDescription` / `site.customConfig.siteDescription` | head.ejs → head.ejs | 字段名不同 |
| `config.keywords` | `post.tags`（每篇动态生成） | head.ejs → head.ejs | Hexo 全局 keywords → 文章级 tags |
| `config.feed.path` | （移除，Gridea 自动生成 RSS） | head.ejs / footer.ejs → head.ejs | 无 footer RSS 链接 |
| `config.date_format` | `post.dateFormat`（预格式化字段） | 多处 → 各列表页 | 助手 `.format()` 废弃 |
| `theme.color` | `site.customConfig.primaryColor`（默认 #3f51b5） | head.ejs → head.ejs | meta theme-color |
| `theme.favicon` | 硬编码 `/media/images/favicon.png` | head.ejs → head.ejs | favicon_tag 助手移除，直接静态路径 |
| `theme.avatar` | `site.customConfig.avatar`（回退 /media/images/avatar.jpg） | page.ejs / copyright.ejs → about.ejs / post.ejs | image_tag 助手 → 原始 `<img>` |
| `theme.brand` | `site.customConfig.brand` / `brandImage`（回退 /media/images/brand.jpg） | menu.ejs → header.ejs | 侧栏背景图 |
| `theme.email` | `site.customConfig.email`（若空则从 `authorIntroduce` 自动识别邮箱） | menu.ejs → header.ejs | 兜底识别逻辑 |
| `theme.author`（侧栏昵称） | `site.customConfig.author` | menu.ejs → header.ejs | 侧栏 introduce 第一行 |
| `theme.about` | `site.customConfig.about` | page.ejs → about.ejs | textarea 字段 |
| `theme.since_year` | `site.customConfig.sinceYear` | footer.ejs → footer.ejs | 版权起始年份 |
| `theme.ICP_license` | `site.customConfig.icpLicense` | footer.ejs → footer.ejs | 备案号 |
| `theme.search` | `site.customConfig.showSearch` | header.ejs → header.ejs | 布尔开关，控制搜索 UI + 数据加载 |
| `theme.share` | `site.customConfig.showShare` | header.ejs / share-fab.ejs → header.ejs / post.ejs / about.ejs | 重命名 |
| `theme.hideMenu` | `site.customConfig.hideMenu`（+ `hideMenuOnLoad` 变量） | header.ejs → header.ejs / post.ejs / about.ejs | 文章页/关于页设 hideMenuOnLoad=true |
| `theme.mathjax` | `site.customConfig.mathjax` | after-footer.ejs → footer.ejs | 底部脚本注入 |
| `theme.title_change.normal` / `leave` | `site.customConfig.dynamicTitleNormal` / `dynamicTitleLeave`（+ `dynamicTitle` 开关） | main.js → footer.ejs | visibilitychange 动态标题 |
| `theme.reward.title` / `wechat` / `alipay` | `site.customConfig.rewardTitle` / `rewardWechat` / `rewardAlipay`（+ `showReward` 开关） | reward.ejs → post.ejs | 打赏弹窗 |
| `theme.postMessage` | `site.customConfig.postMessage` | copyright.ejs → post.ejs | 版权声明自定义文字 |
| `theme.show_last_updated` | `site.customConfig.showLastUpdated` | updated.ejs → post.ejs | 文章最后更新开关 |
| `theme.toc` / `theme.toc.list_number` | `site.customConfig.showToc` | toc.ejs → post.ejs + footer.ejs | toc 助手 → 客户端 JS |
| `theme.archives_title` / `tags_title` / `categories_title` | 硬编码 '归档' / '标签' / '分类' | archive.ejs / tags.ejs → archives.ejs / tags.ejs | 移除 i18n |
| `theme.visit_counter.site_uv` / `site_pv` | `site.customConfig.visitUvText` / `visitPvUnit` / `visitPvText` / `visitPvUnit`（+ `showVisitCounter` 开关） | plugins/site-visit.ejs → footer.ejs | busuanzi 标签拆为文字+单位 |
| `theme.baidu_tongji` / `google_analytics` / `tajs` / `cnzz` | `site.customConfig.baiduTongji` / `gaCode`（统一为头部/底部注入） | head.ejs / plugins → head.ejs / footer.ejs | 统计平台简化为两个注入字段 |
| `theme.menu`（对象 `{icon: {text, url, target}}`） | `menus`（数组 `[{id,name,link,openType}]`，**无 icon 字段**） | menu.ejs → header.ejs | 结构不同；图标经 `_getMenuIcon(link)` 路径推断 |
| `theme.excerpt_render` | `site.customConfig.excerptRender` | index-item.ejs → post-summary.ejs | toggle |
| `theme.excerpt_length` | `site.customConfig.excerptLength`（默认 200） | index-item.ejs → post-summary.ejs | 字段名不同 |
| `theme.excerpt_link` / `__('post.continue_reading')` | `site.customConfig.excerptLink`（回退 '阅读全文'） | index-item.ejs → index.ejs | i18n → 配置字段 |

### 文章变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| `page.title`（详情页） | `post.title` | post.ejs → post.ejs | 字段名不同；同时设 `pageTitle` |
| `page.content` | `post.content`（`<%- %>` 不转义输出） | post.ejs / index-item.ejs → post.ejs / post-summary.ejs | EJS 用 `<%-`，无 `|safe` filter |
| `page.excerpt` | `post.abstract` | index-item.ejs → post-summary.ejs | **字段名不同**；摘要逻辑移至 post-summary.ejs |
| `page.path` | `post.link`（预构建，含 /post/<slug>/） | index-item.ejs / title.ejs → index.ejs / post.ejs | `url_for(path)` → `post.link` |
| `page.layout` / `page.slug`（article id） | （移除） | index-item.ejs → index.ejs | 固定 class `article-type-post` |
| `page.date`（moment 对象） | `post.date`（RFC3339 字符串，用于 datetime 属性）+ `post.dateFormat`（展示） | post/date.ejs → 各页 `<time>` | **EJS 无 `|date` 禁忌**，直接用 `post.date` |
| `page.tags` | `post.tags`（`[{name, link}]`） | post/tag.ejs → index.ejs / post.ejs | `list_tags` 助手 → 手写 forEach |
| `page.categories` | `post.categories`（`[{name, link}]`） | post/category.ejs → post-category.ejs | `list_categories` 助手 → 手写 ul/li |
| `page.prev` | `post.prevPost`（**方向相反**：Hexo prev=更早，Gridea prevPost=更新） | post/nav.ejs → post.ejs | 标签文案"上一篇/下一篇"对应不变，但变量语义反转 |
| `page.next` | `post.nextPost`（**方向相反**） | post/nav.ejs → post.ejs | 同上 |
| `post.updated`（updated.ejs） | `post.updatedAt`（回退 post.updated / post.updateDate） | post/updated.ejs → post.ejs | **Gridea Pro 实际字段名为 `updatedAt`**，非 `updated` |
| `post.updated`（格式化） | `post.updatedAtFormat`（回退 post.updatedFormat / post.updateDateFormat） | post/updated.ejs → post.ejs | 多级回退链 |
| `page.reward` | `site.customConfig.showReward`（全局开关） | post.ejs / reward.ejs → post.ejs | per-post 开关 → 全局开关 |
| `page.permalink` | `post.link` | post-card / share.ejs → post.ejs | 字段名不同 |
| `page.photos`（share sPic） | （移除） | share.ejs → post.ejs | 分享缩略图未迁移 |
| `post.comments` | `commentSetting.showComment`（全局） | post/comment.ejs → comments.ejs | per-post → 全局；见评论系统映射 |

### 列表/标签/分类/归档变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| `page.posts.each`（Warehouse Query） | `posts.forEach` | index.ejs / archive.ejs → index.ejs / archives.ejs | Query `.each` → 数组 `.forEach` |
| `site.posts` | `posts` | index.ejs → index.ejs | 顶层变量 |
| `site.tags` | `tags`（`[{name, link, count}]`） | tags.ejs → tags.ejs | 顶层变量；无 `posts` 字段 |
| `site.categories` | `categories`（顶层，但无独立列表页） | tags-bar.ejs / categories.ejs → （无 categories 列表页） | Gridea 无 categories 列表路由 |
| `page.tag` | `tag.name`（+ `tag.count`） | tag.ejs → tag.ejs | 字段名不同 |
| `tag.length`（= 文章数） | `tag.count` | tags.ejs → tag.ejs / tags.ejs | **字段名不同** |
| `tag.posts.each`（预过滤文章） | `posts.forEach` + `post.tags.some(t => t.name === tag.name)` | tags.ejs → tags.ejs | **关键差异**：Gridea 无 `tag.posts`，O(n×m) 客户端按 tag.name 过滤 |
| `tag.path`（助手内部） | `tag.link` | list_tags 内部 → tags.ejs | `url_for(tag.path)` → `tag.link` |
| `page.category` | `category.name`（+ `category.count`） | category.ejs → category.ejs | 字段名不同 |
| `cate.posts.each`（预过滤） | `posts.forEach`（单分类页由路由提供已过滤 posts） | categories.ejs → category.ejs | Gridea 单分类页 `posts` 已按分类过滤 |
| `post.date.year()` / `.month()`（moment） | `new Date(post.date).getFullYear()` | archive.ejs → archives.ejs | moment → 原生 Date |
| `_.orderBy(posts,['date'],['desc'])`（lodash） | `Object.keys(groups).sort((a,b)=>b-a)` | archive.ejs → archives.ejs | lodash → 原生 sort（作用于年份 key） |
| `post.date.month()` + `dt.format('MMMM, YYYY')` | （移除，仅按年分组） | archive.ejs → archives.ejs | **目标仅按年分组，不按月**；标题 "August, 2026" → "2026" |
| `is_home()` / `is_post()` / `is_archive()` / `is_tag()` / `is_category()` / `is_year()` / `is_month()` | 路由隐式决定（单文件单路由）+ `pageTitle` 变量 + `post` 是否存在 | head.ejs / header.ejs → 各页 | `is_*()` 助手移除，页面类型由模板文件决定 |
| `is_current(path)`（菜单高亮） | EJS 最长路径匹配 `_bestMatchLink`（`_normalizeMenuPath` + `menus.forEach`） | tags-bar.ejs / menu.ejs → header.ejs | JS 后置 → EJS 服务端推导 |

### 分页变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| `page.total` | `pagination.totalPages` | paginator.ejs → 各列表页构造 paginator 对象 | 字段名不同 |
| `page.current` | `pagination.currentPage \|\| pagination.current` | paginator.ejs → 各列表页 | **双名称兼容**（currentPage 优先，回退 current） |
| `page.prev` / `page.next`（布尔） | `pagination.hasPrev` / `pagination.hasNext` | paginator.ejs → 各列表页 | 布尔换名 |
| `page.prev_link` / `page.next_link` | `pagination.prevURL` / `pagination.nextURL` | paginator.ejs → 各列表页 | 字段名不同 |
| `paginator({prev_text, next_text})`（助手） | `include('partials/paginator', {paginator})`（手写分页算法） | paginator.ejs → paginator.ejs | Hexo 助手 → 手写 startPages/midSize/endPages + 省略号 |
| （助手内部 URL） | `pageUrl(p)` = `cleanBaseUrl + '/page/' + p + '/'` | paginator.ejs → paginator.ejs | **必须 cleanBaseUrl 剥离已有 `/page/N` 后缀**，避免嵌套路径 |
| （助手内部 baseUrl） | `pagination.baseUrl` 或从 `category.name` / `tag.link` 构造 | — → category.ejs / tag.ejs | 显式 baseUrl |
| `site.posts.length`（总文章数） | `posts.length`（当前页） | footer.ejs → archives.ejs | 注意：Gridea `posts` 是当前分页后的数组，非全量 |

### Helper 函数映射

| Hexo Helper | Gridea 替代 | 发现位置 | 备注 |
|-------------|------------|---------|------|
| `partial('path', {data})` | `include('partials/path', {data})` | layout.ejs → 各页 | 不传参时用上下文；EJS include 支持第二参数传 data |
| `url_for(path)` | 直接写相对路径 / 预构建 `*.link` 字段 | 多处 | 无等价 helper |
| `date_xml(date)` | `post.date`（原始 RFC3339） | post/date.ejs → 各页 | RFC3339 即合法 datetime |
| `full_date(date)` / `date(date, fmt)` | `post.dateFormat`（预格式化） | post/date.ejs → 各页 | 服务端 format → 预构建字段 |
| `strip_html(str)` | `_source.replace(/<[^>]*>/g, '')`（手写正则） | share.ejs → post-summary.ejs | 助手 → 手写 JS |
| `truncate(str, {length})` | `Array.from(_plain).slice(0,N).join('')+'...'` | share.ejs → post-summary.ejs | **用 Array.from 处理 unicode**（避免按字节截断中文） |
| `list_categories(cats, opts)` | 手写 `<ul class="article-category-list">` + `forEach` | post/category.ejs → post-category.ejs | **类名保留**（article-category-list-item/link）以兼容 CSS |
| `list_tags(tags, opts)` | 手写 `<ul class="article-tag-list">` + `forEach` | post/tag.ejs → 各页 | 类名保留 |
| `toc(content, opts)` | 客户端 JS `buildToc()` 扫描 `#post-content` h1-h6 | toc.ejs → post.ejs + footer.ejs | 服务端 helper → 客户端 JS |
| `paginator(opts)` | `include('partials/paginator')` + 手写算法 | paginator.ejs → paginator.ejs | 见分页映射 |
| `open_graph({opts})` | 手写 OG meta 标签（og:type/title/url/site_name/description/article:published_time/article:tag） | head.ejs → head.ejs | 助手 → 手写 |
| `favicon_tag(path)` | 硬编码 `<link rel="shortcut icon" href="/media/images/favicon.png">` | head.ejs → head.ejs | 助手移除 |
| `image_tag(path)` | 原始 `<img src="...">` | page.ejs → about.ejs | 助手移除 |
| `theme_css(path, cache)` | 直接 `/styles/main.css`（Gridea asset 路径） | head.ejs → head.ejs | LESS → CSS；assets/ 前缀去除 |
| `__('key')` | 硬编码中文 | languages/*.yml → 各页 | 无多语言机制 |
| `is_current(path)` / `is_*()` | 路由隐式 / EJS 路径匹配 | tags-bar.ejs / menu.ejs → header.ejs | 见列表映射 |
| `qrcode(url)` | `//api.qrserver.com/v1/create-qr-code/?data=...`（客户端） | share.ejs → footer.ejs | 服务端 qrcode → 第三方 API |
| `_.template(str)(locals)` | 直接 `<%- site.customConfig.postMessage %>` | copyright.ejs → post.ejs | lodash 模板 → 直接输出 |

### 评论系统映射（Gridea 特有补全）

> 源 Hexo 主题 `_partial/post/comment.ejs` 含 6 个评论插件 partial（disqus/uyan/gitment/valine/hyper-comments/gitalk），由 `post.comments` 控制，各插件内部自判 `theme.xxx` 开关。目标补全为 Gridea Pro 标准评论系统：统一分发器 + 7 平台 partial。

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|------|--------|----------------------|------|
| `post.comments`（per-post） | `commentSetting.showComment`（全局） | post/comment.ejs → comments.ejs | per-post → 全局开关 |
| 6 插件全部包含、各插件自判 | `commentSetting.commentPlatform` if/else 链严格互斥分发 | post/comment.ejs → comments.ejs | **新增分发器**，每次只渲染一个平台 |
| `theme.disqus_shortname` | `commentSetting` (Disqus: shortname/api/apiKey) | plugins/disqus → comments/disqus.ejs | |
| `theme.valine.*` | `commentSetting` (Valine: appId/appKey/serverURLs) | plugins/valine → comments/valine.ejs | |
| `theme.gitalk` | `commentSetting` (Gitalk: clientId/clientSecret/repo/owner/admin) | plugins/gitalk → comments/gitalk.ejs | clientSecret 进静态 HTML（OAuth 公开客户端约束） |
| （无） | `commentSetting` (Waline: serverURLs) | — → comments/waline.ejs | **新增**现代平台 |
| （无） | `commentSetting` (Twikoo: envId) | — → comments/twikoo.ejs | **新增** |
| （无） | `commentSetting` (Giscus: repo/repoId/category/categoryId) | — → comments/giscus.ejs | **新增** |
| （无） | `commentSetting` (Cusdis: appId/host) | — → comments/cusdis.ejs | **新增** |
| `theme.uyan_uid` | （移除） | plugins/uyan → 无 | legacy 插件，Gridea Pro 不支持 |
| `theme.gitment` | （移除） | plugins/gitment → 无 | legacy 插件 |
| `theme.hyper_id` | （移除） | plugins/hyper-comments → 无 | legacy 插件 |

平台值严格使用：`Valine` / `Waline` / `Twikoo` / `Gitalk` / `Giscus` / `Disqus` / `Cusdis`。配置值通过 JSON 序列化进入脚本（避免引号注入）。Gitalk 页面标识用 `post.id`。

### 静态资源映射

> Gridea 静态资源规则：`assets/` 目录下文件在构建输出时去掉 `assets/` 前缀。`assets/styles/main.css` → `/styles/main.css`；`assets/media/images/*` → `/media/images/*`；`assets/scripts/*` → `/scripts/*`。

| Hexo source/ 路径 | Gridea assets/ 路径 | 输出 URL | 引用位置 | 备注 |
|---|---|---|---|---|
| `source/css/style.less` | `assets/styles/main.css` | `/styles/main.css` | head.ejs | LESS → CSS；FontAwesome 4.6.3 字体与图标类内嵌，**禁用 CDN** |
| `source/img/avatar.jpg` | `assets/media/images/avatar.jpg` | `/media/images/avatar.jpg` | header.ejs / about.ejs | 头像默认回退 |
| `source/img/brand.jpg` | `assets/media/images/brand.jpg` | `/media/images/brand.jpg` | header.ejs | 侧栏背景默认回退 |
| `source/img/wechat.jpg` / `alipay.jpg` | `assets/media/images/wechat.jpg` / `alipay.jpg` | 同左 | post.ejs | 打赏二维码 |
| `source/img/cc.png` | `assets/media/images/cc.png` | 同左 | footer.ejs | CC 协议图标（现用 footerLicense 文字链接替代） |
| `source/img/img-err.png` / `img-loading.png` | `assets/media/images/*` | 同左 | （图片占位） | 保留 |
| —（新增 favicon） | `assets/media/images/favicon.png` | `/media/images/favicon.png` | head.ejs | 源用 `/favicon.ico`，目标用主题内 png |
| `source/js/main.js` | `assets/scripts/main.js` | `/scripts/main.js` | （逻辑内联至 footer.ejs） | main.js 逻辑整体内联到 footer.ejs `<script>` |
| `source/js/search.js` | `assets/scripts/search.js` | （逻辑内联至 footer.ejs） | footer.ejs | search.js 逻辑内联，数据改由 XHR 加载 `/api/search.json` |
| `scripts/plugins.js`（renderImage 灯箱） | （客户端 JS 内联至 footer.ejs `Blog.lightbox`） | — | footer.ejs | Hexo before_post_render filter → 客户端图片包装 |

### 搜索数据映射（XHR 加载）

| Hexo（search.js 内嵌数据） | Gridea（`/api/search.json` XHR 字段） | 备注 |
|---|---|---|
| `post.path` | `post.link` | **字段名不同** |
| `post.text` | `post.content` | **字段名不同** |
| `post.tags`（对象数组 `{name}`） | `post.tags`（**字符串数组**，需 `typeof tag === 'string' ? tag : tag.name`） | 兼容两种结构 |
| `post.title` / `post.date` | `post.title` / `post.date` | 同名 |

### 陷阱记录

| 陷阱 | 描述 | 发现位置 |
|------|------|---------|
| prev/next 方向反转 | Hexo `page.prev` = 更早文章；Gridea `post.prevPost` = 更新文章。标签文案"上一篇/下一篇"不变，但变量语义反转 | post/nav.ejs → post.ejs |
| `post.updatedAt` 字段名 | Gridea Pro 实际字段名为 `post.updatedAt`（非 `post.updated`），需多级回退 `updatedAt \|\| updated \|\| updateDate` | post/updated.ejs → post.ejs |
| EJS toggle 值为字符串 | GUI 保存的 toggle 传入字符串，需 `String(site.customConfig.showXxx) !== 'false'` 或 `=== 'true'` 判断，直接 `if(showXxx)` 对字符串 'false' 仍为真 | config.json toggle 字段 |
| 菜单无 icon 字段 | `config/menus.json` 仅含 `id/name/link/openType`，无 `icon`；需 `_getMenuIcon(link)` 按 path/domain 推断图标名 | menu.ejs → header.ejs |
| FontAwesome 必须 CDN 外本地 | 源用本地 `font-awesome.min.css` + webfonts；改 CDN 会因网络/版本/离线导致图标异常，**必须本地引入** main.css | head.ejs |
| Footer 底部必须显示 Gridea Pro | "Power by Hexo" → "Power by [Gridea Pro](https://www.gridea.pro/)"，链接不可移除 | footer.ejs |
| 版权年份格式 | `sinceYear < new Date().getFullYear()` 时显示 "2015 - 2026"，否则仅当前年 | footer.ejs |
| 搜索数据嵌入模板有作用域问题 | 不可在 EJS 模板内嵌搜索 JSON，必须 XHR 加载 `/api/search.json`；字段用 Gridea 实际名 `link`/`content` | footer.ejs |
| 分页 baseUrl 含 `/page/N` | Gridea 在非首页时 `pagination.baseUrl` 可能含已有 `/page/N` 后缀，必须 `cleanBaseUrl` 剥离，否则生成嵌套路径 `/tags/Tech/page/2/page/3` | paginator.ejs |
| 首页分页变量名不一致 | Gridea Pro 首页用 `pagination.current`，其他页用 `pagination.currentPage`；必须 `pagination.currentPage \|\| pagination.current` 兼容 | index.ejs |
| `tag.posts` 不存在 | Gridea `tags` 对象有 `name/link/count` 但**无 `posts` 字段**，全标签页必须遍历全局 `posts` + `post.tags.some(t => t.name === tag.name)` O(n×m) 过滤 | tags.ejs |
| 归档仅按年分组 | 源按年+月分组（`post.date.month()` + `dt.format('MMMM, YYYY')`）；目标仅按年（`getFullYear()`），标题格式 "August, 2026" → "2026" | archive.ejs → archives.ejs |
| `base.ejs` 未被 extends | EJS 引擎未用模板继承，各页面模板为完整 HTML 文档直接 include partials；`base.ejs` 仅骨架参考，非 layout | base.ejs |
| 列表卡片 `itemprop="blogPost"` 为新增 | 源 `_partial/archive.ejs` 的 article **无** itemprop，目标在 archives/category/tag/tags 列表卡片统一补齐 `blogPost`/`datePublished`/`name`/`url` 以对齐详情页 SEO 语义 | _partial/archive.ejs → 各列表页 |
| `datePublished` 用 `post.date` 非格式化 | EJS 中 `post.date` 是 RFC3339 字符串，可直接用于 `<time datetime>`（无 Pongo2 `|date` 禁忌）；展示用 `post.dateFormat` | post/date.ejs → 各页 |
| `excerpt_length` 默认值变化 | 源 share.ejs 用 80，post-summary.ejs 默认 200；截断用 `Array.from` 处理 unicode 避免中文截断乱码 | post-summary.ejs |
| 颜色用 HSL `lighten()` 非 RGB | 源 LESS `lighten(#c5cae9, 12%)` 是 HSL 明度计算（= #f1f3fa），误用 RGB 加法会偏色；post-copyright/page-share-fab 等需精确 HSL | main.css |
| 分享面板用 `.global-share` 非 modal | 必须用原版 `.global-share` CSS 类（右上角浮动面板），不可改为 `.page-modal.share-lay`，否则定位/尺寸/动画错位 | footer.ejs |
| `this.$overlay` 死代码 | main.js:303 的 `this.$overlay` 赋值是遗留死代码（原版 plugins.js renderImage 创建 .overlay，迁移未移植该插件导致元素不存在），应删除 | footer.ejs（main.js 逻辑） |
| lightbox 图片包装缺失 | 源用 Hexo before_post_render filter（plugins.js renderImage）包装图片为 `<figure class="image-bubble">`；Gridea 无此 filter，必须客户端 JS 扫描 `#post-content img` 包装 | footer.ejs `Blog.lightbox` |
| about 页可能无 post | Gridea 关于页 `post` 变量可能不存在，需 `typeof post !== 'undefined' && post` 防御；回退到 `site.customConfig.about` | about.ejs |
| about 页评论/打赏移除 | 源 page.ejs 含 reward-btn/comment/reward modal；目标 about.ejs **移除**评论与打赏（仅 post.ejs 保留） | page.ejs → about.ejs |
| `tags-bar.ejs` 整功能移除 | 源 `_partial/tags-bar.ejs`（标签切换 tabs 导航 + 循环居中算法）未迁移，`BLOG.tabBar()` 调用失效 | tags-bar.ejs → 无 |
| `categories.ejs` 列表页无对应 | 源有全分类列表页（`site.categories` 遍历）；Gridea 无 categories 列表路由，仅保留单分类详情页 `category.ejs` | categories.ejs → 无 |
| 短代码正则转换移除 | 源 page.ejs 的 `page.content.replace(/<p>}<\/p>/g,'</div>')` 短代码转换未迁移，直接输出 `post.content` | page.ejs → about.ejs |

### Gridea 特有补充

以下内容在源 Hexo 主题中不存在或不同，为迁移时适配 Gridea Pro 而新增/调整。

**新增自定义配置字段（config.json customConfig）：**

| 字段 | 类型 | 说明 | 对应原 Hexo |
|------|------|------|------|
| `indexTitle` / `indexSubtitle` / `showIndexSubtitle` | input/toggle | 首页 content-header 大标题/副标题 | `config.title` / `config.subtitle` |
| `subtitle` / `showAboutCardSubtitle` | input/toggle | 关于页卡片副标题 | （新增） |
| `author` / `authorIntroduce` / `showAuthorIntroduce` | input/toggle | 作者名/介绍/显示开关 | `theme.author` / `theme.email` |
| `primaryColor` / `accentColor` | input | 主色/强调色 | `theme.color` |
| `searchPlaceholder` | input | 搜索框 placeholder | `__('global.search_input_hint')` |
| `excerptLink` | input | 阅读全文文案 | `__('post.continue_reading')` / `theme.excerpt_link` |
| `excerptRender` / `excerptLength` | toggle/input | 摘要渲染开关/截断长度 | `theme.excerpt_render` / `theme.excerpt_length` |
| `dynamicTitle` / `dynamicTitleLeave` / `dynamicTitleNormal` | toggle/input/input | 动态标题开关/离开/回来文案 | `theme.title_change` |
| `visitUvText` / `visitUvUnit` / `visitPvText` / `visitPvUnit` / `showVisitCounter` | input/toggle | busuanzi 标签拆分 | `theme.visit_counter` |
| `footerLicense` | textarea | footer 版权声明（支持 HTML） | `__('footer.license')` |
| `gaCode` / `baiduTongji` | input | 统计代码注入 | `theme.google_analytics` / `theme.baidu_tongji` |
| `customCSS` / `customJS` | textarea | 自定义 CSS/JS 注入 | （新增） |
| `enableLightbox` | toggle | 灯箱开关 | `theme.lightbox` |

**模板架构：**

| 维度 | Hexo (EJS) | Gridea (EJS) | 说明 |
|------|-----------|--------------|------|
| 布局包裹 | `layout.ejs` + `<%- body %>` + `partial()` | 各页面完整 HTML + `include()` | 无 layout 包裹，include 组装 |
| `base.ejs` | — | 仅骨架参考（未被 extends） | EJS 引擎未用模板继承 |
| 菜单图标 | `theme.menu` 对象 key 作图标名 | `_getMenuIcon(link)` 路径/域推断 | menus.json 无 icon 字段 |
| 菜单高亮 | `is_current()` + tags-bar tabs | EJS 最长路径匹配 `_bestMatchLink` | 服务端推导，无 DOM 依赖 |
| 分页 | `paginator()` 助手 | `partials/paginator.ejs` 手写算法 | 统一 partial，支持数字页/省略号/当前页高亮 |
| TOC | `toc()` 服务端 helper | 客户端 JS `buildToc()` | 无 max_depth 参数限制 |
| Lightbox | plugins.js `renderImage` filter | 客户端 JS `Blog.lightbox` | 无 Hexo filter，运行时包装图片 |
| 搜索 | search.js + 内嵌 site.json | XHR `/api/search.json` | 字段名 link/content |
| 评论 | 6 插件各 partial 自判 | 分发器 + 7 平台 partial | commentSetting 全局配置 |

### 设计文档与实施计划参考

> 以下为源主题迁移期间产出的设计/计划文档所记录的关键架构决策摘要（原文档已随主题删除，内容已吸收并入本文件），补充了上述映射未展开的实施约束，供后续 EJS 迁移复用。

**1. 评论系统补全设计**

| 决策 | 约束 | 备注 |
|------|------|------|
| 评论容器位置 | `post.ejs` 文章导航之后、`article.post-article` 结束之前 | 仅普通文章页显示评论；首页/归档/标签/关于/404 不含评论 |
| 统一外层 `.comments` | 所有平台共用一个 `.comments` 外层，避免原版多服务同时启用时产生多个 `id="comments"` | 服务专属节点使用唯一 ID |
| 平台严格互斥 | 分发器先检查 `commentSetting.showComment`，再按 `commentPlatform` if/else 链严格分发，每次只渲染一个平台 | 未知平台不输出 SDK，仅显示不支持提示 |
| 配置安全 | 配置值通过 JSON 序列化进入脚本（`JSON.stringify`），避免引号注入破坏脚本 | Gitalk `clientSecret` 进静态 HTML 是 OAuth 公开客户端既有约束 |
| 加载策略 | HTTPS + 锁定可用版本；动态 SDK 异步加载；初始化前验证必需字段；配置缺失/资源失败显示降级提示 `.comment-message` | 不阻塞文章主体解析 |
| 平台挂载点 | Valine→`#vcomments` / Waline→`#waline` / Twikoo→`#tcomment` / Gitalk→`#gitalk-container`（页面标识用 `post.id`）/ Giscus→仓库分类映射 / Disqus→官方 embed / Cusdis→`#cusdis_thread` | — |
| 移除的 legacy 插件 | 友言（uyan）/ Gitment / HyperComments 三种不再接入 | Gridea Pro 当前接口不支持 |

**2. 首页摘要与分类修复**

| 决策 | 约束 | 备注 |
|------|------|------|
| 摘要四分支逻辑 | ① 显式摘要优先（不二次截断）→ ② 无显式摘要按 `excerptLength` 截断纯文本 → ③ `excerptRender=true` 保留 HTML 与图片 → ④ 默认去图片再剥离 HTML | 摘要逻辑移至 `partials/post-summary.ejs` 局部模板 |
| 纯文本分支顺序 | 先移除 `<img>`（含 src/alt），再剥离剩余 HTML 标签 | 避免 img 属性泄漏进摘要 |
| 截断长度回退 | 无效/非正数 `excerptLength` 回退为 200 | 字段名由 `excerpt_length` → `excerptLength` |
| 截断用 `Array.from` | 用 `Array.from(_plain).slice(0,N).join('')+'...'` 处理 unicode，避免按字节截断中文乱码 | 替代 `truncate()` 助手 |
| 分类平坦结构 | 仅用后端已确认的 `name`/`link` 字段输出原版 `ul.article-category-list > li.article-category-list-item > a` | **不实现父子分类**（数据模型不支持，不猜测 `children`/`parent`） |
| 分类链接 | 使用 `cat.link` 预构建字段，禁止手工拼接 `/categories/<cat.name>/` | 类名保留以兼容原版 CSS |
| 布局不变 | 不改变卡片 CSS、摘要容器、阅读全文、标签栏的位置及类名 | 仅替换硬编码分支为局部模板 |

### 验证机制（EJS 移植测试）

> **本主题采用 Node.js 内置测试运行器（`node --test`）作为渲染/语法验证**，替代 Pongo2 的 `pongo2check` / `validate_syntax.py` / `render_test.py`（三者均为 Pongo2 专用，不适用于 EJS）。测试位于主题 `tests/` 目录，通过 `tests/helpers/ejs.js` 加载 ejs 模块（优先 `require('ejs')`，回退 Gridea Pro 宿主 node_modules）。

测试套件（26 项全部通过）覆盖：
- `category.ejs`：分类数据、平坦 DOM、Gridea 分类链接、paginator 集成
- `post-summary.ejs`：纯文本摘要跳过图片、显式摘要不二次截断、HTML 实体语义、excerptLength 截断、HTML 渲染模式
- `post-category.ejs`：原版平坦 `ul > li > a` 结构、`cat.link` 字段
- `footer.ejs`：Lightbox 类定义、图片包装逻辑（renderImage 等效）、跳过代码块/已包装图片、`enableLightbox` 配置、EJS 编译无语法错误、条件渲染
- `config.json`：`enableLightbox` 配置项存在
- `base.ejs`：不输出未接入的 loading-bar 元素
- `main.js`：TOC 标题为空时返回空操作
- `paginator.ejs`：原版上一页/下一页文案、HTML 结构、所有列表页 include 集成、baseUrl 传入

> 完整测试套件已归档至 theme-port-skill `tools/ejs-port-tests/`（EJS 移植 tests），供后续 EJS 迁移参考。2026-08-08 已同步最新版（含 blog-page / config-image-defaults / tags-bar 三项新增测试）。

---

## 来源：indigo（补充比对日期：2026-08-08，目标引擎：EJS）[L1-高置信度]

> 本块是对「来源：hexo-theme-indigo（2026-08-06，EJS）」条目的**二次比对补充**（模式 B 独立积累）。该主题在 2026-08-06 之后补迁移了 tags-bar、blog 列表页、MathJax 条件加载等功能，旧条目部分记录已过时；**冲突处以本块为准**（覆盖自 L1-indigo-2026-08-06，依据 7.4 冲突规则 2）。

### 排除的组件
- 无（用户未声明排除，全部文件参与比对）

### 前置预检结果（7.0）

| 检查项 | 结果 | 说明 |
|--------|------|------|
| ejs2check（真 EJS 解析器，compile-only） | 26/26 PASS | EJS 目标的权威语法校验，地位等同 Pongo2 的 pongo2check |
| render_test.py | 26/26 PASS | 输出 test-output/ 抽查无残留模板标签 |
| node --test（主题自带回归测试） | 37/37 PASS | 含 tags-bar 旋转算法、showTabsBar 开关、分页、摘要、灯箱等 |
| validate_syntax.py | 9 项 ERROR（**已知误报，不阻断**） | 见下方工具陷阱记录 |
| 结构完整性 | 通过 | 空标签/空文章有空状态文案；各页 `<title>` 独立 |

结论：允许进入交叉比对。

### 更正 2026-08-06 条目的过时记录

| 旧记录（2026-08-06） | 新结论（2026-08-08） | 发现位置（源 → 目标） | 备注 |
|----------------------|----------------------|----------------------|------|
| `tags-bar.ejs` 整功能移除、`BLOG.tabBar()` 调用失效 | **已补迁移**：`templates/partials/tags-bar.ejs` + footer.ejs 内联 tabBar 交互 | `_partial/tags-bar.ejs` → `partials/tags-bar.ejs` | 覆盖自 L1-indigo-2026-08-06；仅迁移 tags 分支，categories 分支因 Gridea 无全局 `categories` 仍未迁移 |
| `is_current(path)` 菜单高亮仅记入 header | tags-bar 高亮同为 EJS 服务端推导：去尾斜杠归一化后字符串相等比较 | `tags-bar.ejs is_current(o.path)` → `partials/tags-bar.ejs` | 汇总页高亮「全部」，详情页高亮当前标签 |
| 测试套件 26 项 | 测试套件 37 项（新增 tags-bar 算法/开关、blog 页、图片配置默认值） | 主题 `tests/` → 已归档 `tools/ejs-port-tests/` | 更新归档说明 |

### 新增变量映射（tags-bar 相关）

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| `(type === 'tags' ? site.tags : site.categories).each(fn)` + `o.posts.length` 过滤 | `tags.filter(t => t.count > 0).forEach(...)` | `_partial/tags-bar.ejs` → `partials/tags-bar.ejs` | **关键**：Hexo 用 `o.posts.length` 判空，Gridea 无 `tag.posts`，改用预构建 `tag.count` |
| `_.findIndex(options, o => is_current(o.path))` | `options.findIndex(t => normalize(t.link) === normalize(currentTagLink))` | 同上 | lodash → 原生 findIndex；比较前统一去尾斜杠 |
| order 旋转算法（`index<=1` 自然序，否则 `i<index-1` 时 `order=len-(index-1)+i`，否则 `order=i-(index-1)`） | 同一算法原样保留为 EJS 内联 JS | 同上 | **逐行保留**，使激活标签循环居中；回归测试锁定行为 |
| `url_for('/' + type)` + `path === type + '/index.html'` 判「全部」高亮 | 硬编码 `/tags/` + 汇总页传 `isTagsIndex=true` | 同上 | categories 分支无对应路由 |
| `__('tag.all')` | 硬编码 `'全部'` | 同上 | 无多语言机制 |
| `BLOG.tabBar(this)`（PC 端省略号展开/收起） | footer.ejs 内联同名交互 + 移动端 CSS 横向滚动替代 | 同上 → `footer.ejs` + `main.css` | 桌面端「更多」按钮、移动端滚动，媒体查询分流 |
| （无） | `site.customConfig.showTabsBar`（toggle，默认 true） | — → `config.json` + `tags.ejs`/`tag.ejs` | **新增开关**；开启时 `.tags-header` 加 `has-tabs-bar` 类使 `padding-bottom:0` 仅条件命中，分类详情页恒不引入 |
| （无） | `site.customConfig.showTagsSubtitle` / `showTagSubtitle`（toggle，默认 false） | — → `config.json` + `tags.ejs`/`tag.ejs` | **新增开关**：汇总页「N 个标签」/ 详情页「N 篇文章」（取 `tag.count` 总数，非当前分页数） |

### 新增 Helper/功能映射

| Hexo | Gridea | 发现位置 | 备注 |
|------|--------|---------|------|
| `theme.mathjax: true` 时全站无条件同步加载 MathJax 2.7 | 仅当页面含 `.post-content`、内容未被 KaTeX 预渲染且仍含原始公式定界符时才异步注入；入口固定 HTTPS | `_partial/after-footer.ejs` → `footer.ejs` | 调试实测：旧 CDN 请求链曾致 window load 长尾约 4.6s（debug-theme-preview-slow-load.md）；Gridea 服务端已 KaTeX 预渲染，MathJax 只是兜底 |
| 字体 `@font-face` 无 font-display（LESS 编译） | Roboto 五字重 `font-display: swap`；FontAwesome `font-display: block` | `source/css/style.less` → `assets/styles/main.css` | swap 降慢网文本等待；block 防图标字体回退成方框 |
| `source/css/fonts/`（robocopy 复制） | `assets/styles/fonts/` → 输出 `/styles/fonts/` | copy-resources.bat 证据 | Gridea 构建去除 `assets/` 前缀 |
| `source/img/`（robocopy 复制） | `assets/media/images/` → 输出 `/media/images/` | copy-resources.bat 证据 | 一次性迁移脚本，资源就位后即可弃用 |
| （无 Hexo 对应页面） | `templates/blog.ejs`：`/post/` 根文章列表 | — → `blog.ejs` | **Gridea 特有**；结构复制首页，仅 content-header 与分页 baseUrl（`/post/`）不同 |

### 配置字段规范确认

| 项 | 结论 | 备注 |
|----|------|------|
| 引擎声明字段 | 标准字段为 `"templateEngine": "ejs"`（可选 `jinja2`/`ejs`/`go`，缺省默认 ejs） | indigo config.json 曾用非标准 `"engine"`；现为兼容两字段并存，新主题应只写 `templateEngine` |

### 陷阱记录（新增）

| 陷阱 | 描述 | 发现位置 |
|------|------|---------|
| validate_syntax.py 对 EJS 主题误报 | ① `REQUIRED_TEMPLATES` 硬编码 `index.html`/`post.html`，不区分引擎扩展名；② include 检查不解析无扩展名路径（`include('comments/valine')` → 实际 `comments/valine.ejs`）。EJS 主题以 ejs2check + render_test.py + node --test 为准 | 2026-08-08 预检 |
| `tag.posts` 判空写法不可移植 | Hexo `o.posts.length > 0` 在 Gridea 必须用 `tag.count > 0`（无 posts 字段）；同理标签汇总关联用 `post.tags.some(t => t.name === tag.name)` | `tags-bar.ejs` / `tags.ejs` |
| 标签关联按 name 非 slug | indigo tags.ejs 用 `t.name === tag.name` 匹配，重名（不同 slug）标签会被合并；后续主题建议改 `slug` 比较 | `tags.ejs`（L2 风险提示） |
| 分类分页 fallback 手拼显示名 | indigo category.ejs 在 `pagination.baseUrl` 缺失时 fallback `'/categories/' + category.name + '/'`，使用显示名而非 `category.slug`/`category.link`，含中文/空格时 URL 不正确；正常渲染走 baseUrl 不触发 | `category.ejs`（L2 风险提示） |
| test-output/ 是构建产物 | render_test.py 默认输出 `<主题>/test-output/`，属可再生产物，不应入版本/发布包 | render_test.py |