# Hexo → Gridea Pro 变量映射积累

> 本文件由阶段七交叉比对生成（需用户确认排除范围），累积所有已确认的跨系统变量映射关系。
> 后续迁移时，阶段二优先查阅本文件作为先验知识；如有冲突，以 template-variables.md 为准。

---

## 来源：hexo-theme-Typography（迁移日期：2025-07-18）[L1-高置信度]

### 排除的组件
- templates/partials/comments.html（写得不好，后续可能大改）
- gridea-pro-theme-typography/templates/category.html（实现不完整）

### 全局变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| config.title | config.siteName | head.pug → head.html | 字段名不同 |
| config.url | config.domain | footer.pug → footer.html | 含协议头 |
| config.description | config.siteDescription | head.pug → head.html | 字段名不同 |
| config.keywords | theme_config.siteKeywords | head.pug → head.html | 优先主题配置 |
| config.root | / | nav.pug → header.html | 根路径直接写 |
| config.archive_dir | /archives/ | nav.pug → header.html | 硬编码路径 |
| config.category_dir | /categories/ | nav.pug → header.html | 硬编码路径 |
| config.tag_dir | /tags/ | nav.pug → header.html | 硬编码路径 |
| theme.xxx | theme_config.xxx | 多处 | 通用规则 |
| theme.author | config.author | head.pug → head.html | 用于 meta author 标签 |
| theme.author | site.customConfig.customCopyrightName / config.siteName | footer.pug → footer.html | 多级回退：customCopyrightName → siteName |
| theme.github | theme_config.socialGithub | nav.pug → header.html | 字段名不同 |
| theme.twitter | theme_config.socialTwitter | nav.pug → header.html | 字段名不同 |
| theme.instagram | theme_config.socialInstagram | nav.pug → header.html | 字段名不同 |
| theme.weibo | theme_config.socialWeibo | nav.pug → header.html | 字段名不同 |
| theme.rss | theme_config.rssEnabled | nav.pug → header.html | 布尔值而非路径 |
| theme.keywords | theme_config.siteKeywords | head.pug → head.html | keywords 回退链第三级 |
| theme.themeStyle | theme_config.themeStyle | head.pug → head.html | 通用规则 |
| theme.title_primary | theme_config.title_primary | sidebar.pug → sidebar.html | 需在 customConfig 中声明 |
| theme.title_secondary | theme_config.title_secondary | sidebar.pug → sidebar.html | 需在 customConfig 中声明 |
| theme.showCategories | theme_config.showCategories | mixins.pug → post-card.html | 字段名不同 |
| theme.showTags | theme_config.showTags | mixins.pug → post-card.html | 字段名不同 |
| theme.showPageCount | theme_config.showPageCount | mixins.pug → pagination.html | 字段名不同 |
| theme.duoshuo / theme.disqus / theme.livere | theme_config.showComments | mixins.pug → post-card.html | 三种评论系统合并为单一开关 |

### 文章变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| page.title | post.title | post.pug → post.html | 字段名不同 |
| page.content | post.content\|safe | mixins.pug → post-card.html | 需 \|safe |
| page.date | post.dateFormat | mixins.pug → post-card.html | **禁止 \|date filter** |
| page.desc | post.description | post.pug → post.html | 字段名不同 |
| page.path | post.link | mixins.pug → index.html | 字段名不同 |
| page.categories | post.categories | mixins.pug → post-card.html | 数组结构相同 |
| page.tags | post.tags | mixins.pug → post-card.html | 数组结构相同 |
| page.keywords | post.tagsString | head.pug → head.html | 逗号分隔字符串 |
| page.prev | post.prevPost | post.pug → post-nav.html | **方向相反** |
| page.next | post.nextPost | post.pug → post-nav.html | **方向相反** |
| page.excerpt | post.summary | mixins.pug → index.html | 字段名不同 |

### 页面变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| page.title | page.title | page.pug → page.html | 变量名相同 |
| page.content | page.content\|safe | page.pug → page.html | 需 \|safe |
| page.desc | page.description | page.pug → page.html | 字段名不同 |

### 标签变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| page.tag | current_tag.name | tag.pug → tag.html | 字段名不同 |
| tag.name | tag.name | mixins.pug → tags.html | 变量名相同 |
| tag.path | tag.link | mixins.pug → tags.html | 字段名不同 |
| tag.posts.length | tag.count | mixins.pug → tags.html | 字段名不同 |

### 分类变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| page.category | current_category.name | category.pug → category.html | 字段名不同 |
| category.name | category.name | mixins.pug → category.html | 变量名相同 |
| category.path | category.link | mixins.pug → category.html | 字段名不同 |
| category.posts.length | category.count | mixins.pug → category.html | 字段名不同 |

### 分页变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| page.prev | pagination.hasPrev | mixins.pug → pagination.html | 布尔值判断 |
| page.next | pagination.hasNext | mixins.pug → pagination.html | 布尔值判断 |
| page.prev_link | pagination.prevURL | mixins.pug → pagination.html | 字段名不同 |
| page.next_link | pagination.nextURL | mixins.pug → pagination.html | 字段名不同 |
| page.current | pagination.currentPage | mixins.pug → pagination.html | 字段名不同 |
| page.total | pagination.totalPages | mixins.pug → pagination.html | 字段名不同 |
| site.posts.length | pagination.totalPosts | archive.pug → archives.html | 字段名不同 |

### 归档变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| postList() mixin 按 page.posts 年份分组 | archives 数组，group.Year / group.Posts | mixins.pug → archives.html | 需大写键名 Year、Posts |

### 站点变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| site.posts | posts | index.pug → index.html | 数组结构相同 |
| site.categories | categories | nav.pug → header.html | 数组结构相同 |
| site.tags | tags | nav.pug → tags.html | 数组结构相同 |
| site.pages | menus | mixins.pug → header.html | 结构不同，使用菜单系统 |

### Helper 函数映射

| Hexo Helper | Gridea 替代 | 发现位置 | 备注 |
|-------------|------------|---------|------|
| url_for(path) | 直接写相对路径 | layout.pug → base.html | 无等价 helper |
| date(date, format) | post.dateFormat | mixins.pug → post-card.html | **禁止 \|date filter** |
| date(item.date, 'MM-DD')（归档页） | post.date\|slice:"5:10" | mixins.pug → archives.html | 截取 RFC3339 字符串第 5-10 位得到 MM-DD |
| strip_html(str) | \|striptags | mixins.pug → post-card.html | Pongo2 filter |
| truncate(str, {length: n}) | \|truncatechars:N / post.summary | mixins.pug → index.html | 冒号语法或使用 summary |
| __('key') | 硬编码字符串 | nav.pug → header.html | 无多语言机制 |
| partial('path', data) | {% include "path" %} | layout.pug → index.html | 不传参，用上下文 |
| is_home() | current_page == "index" | nav.pug → header.html | 页面类型判断 |
| is_archive() | current_page == "archives" | nav.pug → header.html | 页面类型判断 |
| is_current('path') | current_page == "xxx" | nav.pug → header.html | 页面类型判断 |
| new Date().getYear() + 1900 | now\|date:"2006" | footer.pug → footer.html | 获取当前年份 |

### 陷阱记录

| 陷阱 | 描述 | 发现位置 |
|------|------|---------|
| prev/next 方向反转 | Hexo 的 page.prev = 更早；Gridea 的 post.prevPost = 更新 | post.pug → post-nav.html |
| date filter 不可用 | post.date 在 Pongo2 中是 RFC3339 字符串，\|date 报错 | mixins.pug → post-card.html |
| url_for 无等价物 | Hexo 的 url_for() 需改为直接写相对路径 | layout.pug → index.html |
| __('key') 多语言丢失 | Hexo 的多语言系统无法迁移，需硬编码字符串 | nav.pug → header.html |
| site.pages → menus | Hexo 的页面列表需通过 Gridea 菜单系统配置 | mixins.pug → header.html |
| theme.rss 是路径 | Gridea 使用布尔值 rssEnabled 而非 RSS 文件路径 | nav.pug → header.html |
| 归档页年份分组丢失 | Hexo postList() mixin 按年份分组显示，Gridea archives.html 平铺展示无年份头 | mixins.pug → archives.html |
| Gridea 特有页面 | blog.html, about.html, links.html, memos.html, 404.html 为 Gridea 新增，无 Hexo 对应 | - |

---

## 来源：hexo-theme-anatolo（迁移日期：2026-07-22 / 补充：2026-07-26 / 补充：2026-07-31）[L1-高置信度]

### 排除的组件
- templates/blog.html（源主题不存在独立博客列表页，仅有首页）
- templates/memos.html（源主题不存在）
- templates/partials/comments.html（源主题评论系统依赖 Hexo 配置+JS，简化迁移为纯静态注释占位，后续需手动接入第三方评论系统）
- 分类列表页 categories.pug → 不迁移（源主题仅使用 list_categories() helper 做占位，Gridea 无全局分类列表变量）

### 全局变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| theme.defaultTheme | theme_config.defaultTheme | layout.pug → base.html | default/light/dark 三值，对应 html[theme] CSS 选择器 |
| theme.avatar | config.avatar | nav.pug → header.html | Gridea 内置字段；anatolo 模板中硬编码 /images/logo.webp 作为默认回退 |
| theme.favicon | 直接写 /images/favicon.webp | head.pug → head.html | 静态资源路径，anatolo 默认使用原主题 /images/favicon.webp |
| theme.logo_dir | config.logo | sidebar.pug → sidebar.html | Gridea 内置字段；anatolo 模板中硬编码 /images/logo@2x.webp 作为默认回退 |
| theme.logo_style | theme_config.logoStyle | sidebar.pug → sidebar.html | CSS inline style 字符串 |
| theme.menu (对象 name: link) | menus 全局变量 (数组 [{name,link}]) | nav.pug → header.html | 结构不同：对象 → 数组 |
| theme.rightbtn.back | theme_config.rightbtnBack | nav.pug → header.html | toggle 字段 |
| theme.rightbtn.search | theme_config.rightbtnSearch | nav.pug → header.html | toggle 字段 |
| theme.rightbtn.avatar | theme_config.rightbtnAvatar | nav.pug → header.html | toggle 字段 |
| theme.rightbtn.darkLightToggle | theme_config.rightbtnDarkLightToggle | nav.pug → header.html | toggle 字段 |
| theme.useSummary | theme_config.useSummary | mixins.pug → post-card.html | toggle 字段 |
| theme.useTagCloud | theme_config.useTagCloud | tags.pug → tags.html | toggle 字段 |
| theme.tocMaxDepth | theme_config.tocMaxDepth | toc.pug → toc.html | select 字段，值 0-6 |
| theme.always_enable_comments | theme_config.alwaysEnableComments | post.pug → post.html | toggle 字段 |
| theme.copyright.show | theme_config.copyrightShow | post.pug → post.html | toggle 字段 |
| theme.copyright.default | theme_config.copyrightDefault | post.pug → post.html | textarea 字段 |
| theme.copyright.show_author | theme_config.copyrightShowAuthor | post.pug → post.html | toggle 字段 |
| theme.footbar.copyright | theme_config.footbarCopyright | footer.pug → footer.html | input 字段 |
| theme.footbar.beian | theme_config.footbarBeian | footer.pug → footer.html | input 字段 |
| theme.footbar.gongan | theme_config.footbarGongan | footer.pug → footer.html | input 字段 |
| theme.social (对象 icon: link) | 多个 theme_config.social* (独立字段) | social_links.pug → social_links.html | 对象拆为独立字段 |
| theme.social.github | theme_config.socialGithub | social_links.pug → social_links.html | 字段名不同 |
| theme.social.zhihu | theme_config.socialZhihu | social_links.pug → social_links.html | 新增字段 |
| theme.social.mail | theme_config.socialMail | social_links.pug → social_links.html | mailto: 协议 |
| theme.social.qq | theme_config.socialQq | social_links.pug → social_links.html | 需拼接 QQ 跳转 URL |
| theme.Baidutongji | theme_config.headerScript | head.pug → head.html | 通用头部注入，不再独立字段 |
| config.url | config.domain（用于构建绝对 URL） | post.pug → post.html | `config.domain + post.link` 拼接方式替代 Hexo `url_for()` |

### 文章变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| page.toc | post.toc\|safe | toc.pug → toc.html | **需 \|safe** |
| page.excerpt | post.abstract\|safe | mixins.pug → post-card.html | **需 \|safe** |
| page.summary | post.abstract\|safe | mixins.pug → post-card.html | 同 excerpt，优先使用 abstract |
| page.friends | links 全局变量 | page.pug → links.html | frontmatter JSON → 内置友链系统 |
| page.author | 删除（不用） | mixins.pug → post-card.html | Gridea 无文章级作者字段 |
| page.copyright (frontmatter) | 删除（有意简化） | mixins.pug → post.html | 源主题支持 per-post copyright（含 disabled 值关闭），目标仅用 theme_config.copyrightDefault 全局配置 |

### 归档变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| page.posts.data（循环按年份分组） | archives 数组，group.Year/group.Posts | mixins.pug → archives.html | 需大写键名，年份标题直接使用 group.Year |

### 友链变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| page.friends (JSON frontmatter) | links[].siteName / links[].siteLink / links[].avatar / links[].description | page.pug → links.html | frontmatter 手动维护 → 内置友链管理 |
| 客户端 TSX DOM 替换 | Pongo2 直接输出最终 DOM | friend-link.tsx → links.html | 不照搬运行时转换，模板阶段直接输出最终 HTML 结构 |

Gridea 友链变量：

| 变量 | 说明 | 备注 |
|------|------|------|
| `links` | 友链数据数组 | Gridea 内置友链系统 |
| `link.siteName` | 站点名称 | 必需字段 |
| `link.siteLink` | 站点链接 | 必需字段 |
| `link.description` | 站点描述 | 可选字段 |
| `link.avatar` | 头像 URL | 可选字段；为空时不输出头像节点 |

### 分页变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| page.prev / page.next（布尔） | pagination.hasPrev / pagination.hasNext | mixins.pug → index.html | 布尔换名 |
| page.prev_link / page.next_link | pagination.prevURL / pagination.nextURL | mixins.pug → index.html | L1 已确认 |

### 标签变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| `tagcloud()` helper + `alphabet_tag_list()` helper | JS 客户端 canvas（TagCanvas 2.9）+ 直接循环 `tags` | tags.pug → tags.html | 删除服务端渲染，改为前端 JS 动态生成；不保留字母分组 |
| `list_tags(site.tags, opts)` | 直接 `for` 循环 `tags` | tags.pug → tags.html | 不保留 options 定制 |
| tags 页读取 data-count 属性 | 模板内 JS 从 canvas 读取 data-count 属性计算字号 | tags.pug → tags.html | TagCanvas 初始化入口在 tagcanvas.js 末尾 `addLoadEvent` 中，链接来源为 canvas 内部 `<a>` 元素 |
| `theme_config.useTagCloud` | toggle 布尔开关 | tags.pug → tags.html | true 时渲染 Canvas 标签云，false 时渲染普通列表 |

### 闪念页变量映射

| 变量 | 说明 | 备注 |
|------|------|------|
| `memos` | 闪念数据数组 | Gridea 内置闪念系统 |
| `memo.content` | 富文本正文（HTML） | **需 `\|safe`** |
| `memo.tags` | 标签字符串数组 | 不需 `\|safe` |
| `memo.createdAt` | 已格式化的创建日期 | 直接展示 |
| `memo.createdAtISO` | ISO 格式创建日期 | 用于 `<time datetime>` 和 JS 聚合 |
| `forloop.Counter0` | 从 0 开始的循环索引 | 用于首屏隐藏阈值判断 |

### 关于页变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| —（无 Hexo 对应） | `about_post` | — → about.html | **Gridea 特有变量**，回退链第二级 |
| — | `post` 变量 | — → about.html | 关于页数据回退链：`post.content\|safe` → `about_post.content\|safe` → `config.siteDescription` |

### Helper 函数映射

| Hexo Helper | Gridea 替代 | 发现位置 | 备注 |
|-------------|------------|---------|------|
| toc(content, opts) | post.toc\|safe | toc.pug → toc.html | **需 \|safe**，不支持 max_depth 参数配置 |
| word_count(content) | post.wordCount | mixins.pug → post-card.html | 不再是 filter，是对象字段 |
| duration(sec, "seconds") / time(sec, "m") / time(sec, "s") | post.readingTime | mixins.pug → post-card.html | 单位分钟，不再需要手动计算 |
| is_current(path) | current_page == "xxx" + JS 客户端 pathname 精确匹配 | nav.pug → header.html | Gridea 仅区分 index/archives/tags 等大类，无法精确定位 /about 等自定义路径；anatolo 改用 JS pathname 精确匹配并给菜单 `<a>` 加 class="current"，注意避免前缀匹配导致 /about 误匹配页面底部链接 |
| is_post() | post 变量是否存在 + body.post-detail class | nav.pug → header.html | 当前模板上下文判断；为避免首页/列表页 post 变量误触发返回按钮显示，额外通过 body.post-detail class + CSS 辅助隐藏 |
| tagcloud() | JS 客户端 canvas（TagCanvas 2.9） | tags.pug → tags.html | 删除服务端 tagcloud 渲染，改为前端 JS 动态生成 |
| alphabet_tag_list(site.tags, opts) | 直接循环 tags | tags.pug → tags.html | 不保留字母分组 |
| list_categories(site.categories) | 无等价，已删除 | categories.pug → 不迁移 | Gridea 无全局 categories 列表 |
| list_tags(site.tags, opts) | 直接循环 tags | tags.pug → tags.html | 直接 for 循环，不保留 options 定制 |

### 陷阱记录

| 陷阱 | 描述 | 发现位置 |
|------|------|---------|
| `\|default:expr` 链式传参不可用 | Pongo2 中 `\|default:post.content\|truncatechars:150` 语法错误，需用 `{% set %}` 预计算 | post.html → {% set desc = ... %} |
| `{% block %}` 在 `{% include %}` 的 partial 内不被继承覆盖 | 块必须定义在 base.html 直接层级，不能在 include 的 partial 内 | head.html → 重命名为 head_title/head_description 移到 base.html |
| word_count 和 reading_time 不是 Pongo2 filter | Gridea 的 word count 是 post.wordCount (对象字段)，阅读时间是 post.readingTime | mixins.pug → post-card.html |
| excerpt filter 不存在 | 不存在 `\|excerpt:N` filter，需用 `\|striptags\|truncatechars:N` 或 post.abstract | mixins.pug → post-card.html |
| theme.social 对象结构需拆分为独立字段 | Hexo 的 theme.social = { icon: link, ... } 在 Gridea 中需拆为 theme_config.socialGithub 等独立 toggle/input | social_links.pug → social_links.html |
| theme.menu 对象 → menus 数组 | 结构完全不同：Hexo 是 { "Home": "/" }，Gridea 是 [{ name: "首页", link: "/" }] | nav.pug → header.html |
| config.highlight.line_number 不可移植 | 代码行号显示由 Hexo 渲染器控制，Gridea 由 Markdown 引擎内置 | layout.pug → base.html（删除 body class disable-line-number） |
| __('key') 文案硬编码为中文 | 源主题 lang="zh-CN" + 中文语言文件，所有 __() 调用的输出硬编码为中文 | 全部模板文件 |
| post.date\|slice:"5:10" 用于归档页 MM-DD | RFC3339 字符串格式为 YYYY-MM-DDTHH:mm:ss，[5:10] 位恰好是 MM-DD | mixins.pug → archives.html |
| html[theme] 缺失导致 CSS 变量失效 | 原主题所有颜色/边框/背景依赖 html[theme='light\|default\|dark'] 选择器对应的 CSS 变量。迁移版最初未输出 theme 属性，导致 page-top 灰线、字体颜色、侧栏分界等视觉大面积偏离原主题 | layout.pug → base.html |
| Anatolo 命名空间未定义 | 模板中 onclick="Anatolo.xxx" 多处调用，但原主题 bundle.js 未引入，所有功能（搜索/分享/复制/回顶/移动菜单/明暗切换）均静默失效 | base.html |
| 原主题图片未用作默认值 | 迁移时应优先用原主题资源作为默认回退，而非 Gridea 默认 avatar.png 或空 config.logo | header.html / sidebar.html / head.html |
| FontAwesome CDN 引入不稳定 | 原主题使用本地 /css/font-awesome.min.css + /webfonts/*，迁移改为 CDN 后可能因网络/版本/离线预览导致图标异常 | head.html |
| 搜索面板动画不完整 | 迁移版仅 toggle show 类，缺少原主题 animated、fadeIn、fadeOut 类的动画链，以及 nextTick 后选文本、关闭前 400ms 延迟等时序控制 | base.html |
| 分享缺少 text 参数 | 原主题 navigator.share() 传入 { url, text, title }，迁移版缺少 text 会导致部分 share target 显示异常 | base.html |
| success() 动画时序偏离 | 原主题 show → 500ms fadeOut → 1000ms 清除，迁移版初始实现为 600/1200ms，已修正 | base.html |
| 代码块语言标签适配 | Hexo 输出为 figure.highlight table td.code 结构；Gridea 输出为 `<pre><code class="language-xxx">`，CSS 需同时适配两者，并用 JS 运行时扫描 `<pre>` 标注 data-code-lang | post.html / base.html |
| 当前菜单 class 由 JS 后置注入 | Gridea 仅提供大类 current_page（index/archives/tags），无法精确定位 /about 等自定义路径。anatolo 改用 JS pathname 精确匹配并给 `<a>` 加 class="current"。注意避免前缀匹配导致 /about 误匹配页面底部链接；分页路径 `/page/N/` → `/`，`/post/page/N/` → `/post` | base.html |
| 浅色/默认主题色阶方向错误 | 原主题 --primary-high 浅色下应为深色文字（mix(, , 75%)），迁移版初始实现反向导致正文颜色过浅、灰线不显 | main.css CSS 变量 |
| 404 模板上下文限制 | Gridea 渲染 404.html 时仅提供全局 config（如 config.siteName），不存在 post、posts、pagination、page 等变量 | templates/404.html |
| :focus 伪类在 headless 浏览器中不触发 | Electron/Playwright 等无系统焦点的 headless 环境中，element.focus() 可设置 document.activeElement 但不会激活 CSS :focus 或 :focus-visible 伪类 | 404.html → main.css |
| 友链卡盒模型差异 | 原版 .friend-link-box 使用默认 content-box，width: 350px + padding 20px + border 2px = 372px；误用 border-box 会导致卡片实际内容区变窄 | friend-link.tsx |
| 友链窄屏溢出 | 原版桌面布局在 500px 以下视口出现横向溢出；当前版本在窄屏添加 box-sizing: border-box 和流式宽度解决 | main.css |
| 友链空头像空白列 | 原版即使无头像也保持 grid-template-columns: 84px auto，卡片内存在 84px 空白列；迁移版无头像时自动切换为单列 | friend-link.tsx |
| Grid 长文本撑宽 | Grid 子项默认 min-width: auto，长链接/描述可能撑破列宽；需 minmax(0, 1fr) 约束 | main.css |
| TOC max_depth 参数无法传入 | 源主题 toc(content, opts) 的 opts.max_depth 参数无法传给 Gridea `post.toc` 过滤器；迁移版改为 JS 客户端动态扫描 `.post-content` h1-h6 重建 TOC | toc.pug → post.html |
| per-post copyright 不支持 | 源主题 frontmatter `copyright` 字段可覆盖全局版权声明（含 disabled 值关闭），Gridea 仅支持 theme_config.copyrightDefault 全局配置 | mixins.pug → post.html |

### 静态资源映射

> Gridea 静态资源规则：assets/ 目录下文件在构建输出时去掉 assets/ 前缀。例如 assets/images/favicon.webp → 输出 URL /images/favicon.webp。模板中引用时直接使用输出 URL。

| Hexo source/ 路径 | Gridea assets/ 路径 | 输出 URL | 引用位置 | 备注 |
|---|---|---|---|---|
| source/images/favicon.webp | assets/images/favicon.webp | /images/favicon.webp | head.html | SHA256: 1309c82b...，与原版完全一致 |
| source/images/gongan.png | assets/images/gongan.png | /images/gongan.png | footer.html | 公安备案图标 |
| source/images/logo.webp | assets/images/logo.webp | /images/logo.webp | header.html（顶部头像默认值） | 硬编码默认值，不使用 Gridea 默认 avatar.png |
| source/images/logo@2x.webp | assets/images/logo@2x.webp | /images/logo@2x.webp | sidebar.html（侧栏 title image） | 硬编码默认值，不使用 config.logo |
| source/css/font-awesome.min.css | assets/css/font-awesome.min.css | /css/font-awesome.min.css | head.html | 必须本地引用，不可用 CDN |
| source/webfonts/* | assets/webfonts/* | /webfonts/* | font-awesome 依赖 | 按原主题输出路径存放 |
| source/fonts/* | assets/fonts/* | /fonts/* | font-awesome 依赖 | 按原主题输出路径存放 |
| source/js/tagcanvas.js | assets/media/js/tagcanvas.js | /media/js/tagcanvas.js | tags.html | TagCanvas 2.9 库 |
| —（Gridea 新增） | assets/scripts/search.js | /scripts/search.js | head.html（条件加载） | 搜索 JS，源主题搜索由 bundle.js 中的 search.tsx + insight.js 提供，不再需要 site_json.js generator |

### JS 功能复刻映射

> 原主题 src/anatolo/ 各 TS 模块编译为 js_complied/bundle.js，挂载 window.Anatolo 和 window.Utils。迁移版不可假设 bundle 存在，必须用内联 JS 复刻在 base.html 中。

| 原主题调用 | 原源文件 | 复刻位置 | 逻辑要点 |
|---|---|---|---|
| Anatolo.darkLightToggle() | src/anatolo/dark-light-toggle.ts | base.html `<script>` | 读 html[theme] → default 时解析系统偏好 → 翻转 dark/light → localStorage.setItem + setTheme() → 页面加载时 setTheme() 恢复 |
| Anatolo.search.openWindow() | src/components/search.tsx | base.html `<script>` | 加 .animated.fadeIn.show → focus() → setTimeout(10) 后 setSelectionRange |
| Anatolo.search.closeWindow() | src/components/search.tsx | base.html `<script>` | if(!searchShowing)return → 加 .fadeOut、去 .fadeIn → blur() → setTimeout(400) 后去 .show |
| Anatolo.share.native() | src/anatolo/anatolo.ts | base.html `<script>` | navigator.share({ url, text: document.title, title: document.title }) |
| Utils.copyToClipboard(text) | src/utils/copy-to-clipboard.ts | base.html `<script>` | 优先 navigator.clipboard.writeText → catch 时 textarea + execCommand('copy') 回退 → finally 调 success()（0ms show → 500ms fadeOut → 1000ms 清除） |
| scroll-to-top 显隐 | src/components/float-btn.ts | base.html `<script>` | scroll 事件：scrollY < 200 加 .hide，否则去 .hide（含 { passive: true } 优化） |
| 移动端更多菜单 | src/components/rightbtn.ts | base.html `<script>` | 全局 click：点击 .btn-toggle-more（含父级）给 .nav_right_btn 加 .expanded，否则去除 |

### 页面文件约定

Gridea Pro 遵循"文件名决定输出路径"的约定：

| 文件名 | 输出 URL | 作用 | body_class |
|---|---|---|---|
| `templates/index.html` | `/`、`/page/N/` | 首页文章列表 | `home` |
| `templates/blog.html` | `/post/`、`/post/page/N/` | 独立博客文章列表页 | `blog` |
| `templates/post.html` | `/post/<slug>/` | 单篇文章详情 | `post-detail` |
| `templates/archives.html` | `/archives/` | 文章归档页 | `archives` |
| `templates/tags.html` | `/tags/` | 标签汇总页 | `tags` |
| `templates/tag.html` | `/tag/<name>/` | 单个标签下的文章列表 | `tag` |
| `templates/about.html` | `/about/` | 关于页面 | `about` |
| `templates/links.html` | `/links/` | 友链页面 | `links` |
| `templates/memos.html` | `/memos/` | 闪念页面 | `page-memos` |
| `templates/404.html` | `/404/` | 404 页面 | `404` |

### Gridea 特有补充

以下内容在源 Hexo 主题中不存在，为迁移时适配 Gridea Pro 功能而新增。

**新增自定义配置字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `searchHint` | input | 搜索框 placeholder 提示文字（源主题硬编码中文） |
| `searchPosts` / `searchPages` / `searchCategories` / `searchTags` | input | 搜索结果分组标题（源主题硬编码英文） |
| `searchUntitled` | input | 无标题文章兜底显示（源主题硬编码英文） |
| `searchNoResult` | input | 空结果提示（源主题硬编码英文） |
| `socialRss` | input | RSS 独立字段（源主题 theme.rss 是路径而非 URL） |
| `socialFacebook` | input | 新增社交平台（源主题无此字段） |
| `customCSS` | textarea | 自定义 CSS 注入 |
| `customJS` | textarea | 自定义 JS 注入（在 body 末尾） |
| `headerScript` | textarea | 头部代码注入（在 </head> 前，替代 theme.Baidutongji） |

**模板架构简化：**

| 维度 | Hexo (Pug) | Gridea (Pongo2) | 说明 |
|------|-----------|-----------------|------|
| Body CSS class | `body(class=classList.join(" "))` 通过 JS 表达式拼接 | `{% block body_class %}page{% endblock %}` 在各页面模板中覆盖 | 从"表达式拼接"变为"块覆盖"模式 |
| 搜索面板 | `include components/search`（独立 Pug 组件） | 内联在 base.html 中，通过 `{% if theme_config.rightbtnSearch %}` 控制 | 搜索数据由服务端 tags/menus/posts 变量直接注入模板 JSON，不再需要 site_json.js generator |
| 浮动按钮 | `include components/float-btn` + `include components/float-indicator` | 全部内联在 base.html `<script>` 中 | 原 3 个独立组件（search + float-btn + float-indicator）合并为 base.html 内联 |
| TOC 侧栏 | `include toc` + `+make_toc(true/false)` mixin 服务端渲染 | 服务端 `post.toc\|safe` + 客户端 JS 从 `.post-content` h1-h6 动态重建 | 解决了 max_depth 参数无法传入的问题 |
| 百度统计 | `js/baidu-tongji.js` 独立文件 | `theme_config.headerScript` 用户自行注入 | 更灵活，不再绑定特定统计平台 |
