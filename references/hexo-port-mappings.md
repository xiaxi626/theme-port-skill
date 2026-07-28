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
| config.root | / | 
av.pug → header.html | 根路径直接写 |
| config.archive_dir | /archives/ | 
av.pug → header.html | 硬编码路径 |
| config.category_dir | /categories/ | 
av.pug → header.html | 硬编码路径 |
| config.tag_dir | /tags/ | 
av.pug → header.html | 硬编码路径 |
| theme.xxx | theme_config.xxx | 多处 | 通用规则 |
| theme.author | config.author | head.pug → head.html | 用于 meta author 标签 |
| theme.author | site.customConfig.customCopyrightName / config.siteName | footer.pug → footer.html | 多级回退：customCopyrightName → siteName |
| theme.github | theme_config.socialGithub | 
av.pug → header.html | 字段名不同 |
| theme.twitter | theme_config.socialTwitter | 
av.pug → header.html | 字段名不同 |
| theme.instagram | theme_config.socialInstagram | 
av.pug → header.html | 字段名不同 |
| theme.weibo | theme_config.socialWeibo | 
av.pug → header.html | 字段名不同 |
| theme.rss | theme_config.rssEnabled | 
av.pug → header.html | 布尔值而非路径 |
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
| site.categories | categories | 
av.pug → header.html | 数组结构相同 |
| site.tags | tags | 
av.pug → tags.html | 数组结构相同 |
| site.pages | menus | mixins.pug → header.html | 结构不同，使用菜单系统 |

### Helper 函数映射

| Hexo Helper | Gridea 替代 | 发现位置 | 备注 |
|-------------|------------|---------|------|
| url_for(path) | 直接写相对路径 | layout.pug → base.html | 无等价 helper |
| date(date, format) | post.dateFormat | mixins.pug → post-card.html | **禁止 \|date filter** |
| date(item.date, 'MM-DD')（归档页） | post.date\|slice:"5:10" | mixins.pug → archives.html | 截取 RFC3339 字符串第 5-10 位得到 MM-DD |
| strip_html(str) | \|striptags | mixins.pug → post-card.html | Pongo2 filter |
| truncate(str, {length: n}) | \|truncatechars:N / post.summary | mixins.pug → index.html | 冒号语法或使用 summary |
| __('key') | 硬编码字符串 | 
av.pug → header.html | 无多语言机制 |
| partial('path', data) | {% include "path" %} | layout.pug → index.html | 不传参，用上下文 |
| is_home() | current_page == "index" | 
av.pug → header.html | 页面类型判断 |
| is_archive() | current_page == "archives" | 
av.pug → header.html | 页面类型判断 |
| is_current('path') | current_page == "xxx" | 
av.pug → header.html | 页面类型判断 |
| 
ew Date().getYear() + 1900 | 
ow\|date:"2006" | footer.pug → footer.html | 获取当前年份 |

### 陷阱记录

| 陷阱 | 描述 | 发现位置 |
|------|------|---------|
| prev/next 方向反转 | Hexo 的 page.prev = 更早；Gridea 的 post.prevPost = 更新 | post.pug → post-nav.html |
| date filter 不可用 | post.date 在 Pongo2 中是 RFC3339 字符串，\|date 报错 | mixins.pug → post-card.html |
| url_for 无等价物 | Hexo 的 url_for() 需改为直接写相对路径 | layout.pug → index.html |
| __('key') 多语言丢失 | Hexo 的多语言系统无法迁移，需硬编码字符串 | 
av.pug → header.html |
| site.pages → menus | Hexo 的页面列表需通过 Gridea 菜单系统配置 | mixins.pug → header.html |
| theme.rss 是路径 | Gridea 使用布尔值 
ssEnabled 而非 RSS 文件路径 | 
av.pug → header.html |
| 归档页年份分组丢失 | Hexo postList() mixin 按年份分组显示，Gridea archives.html 平铺展示无年份头 | mixins.pug → archives.html |
| Gridea 特有页面 | blog.html, about.html, links.html, memos.html, 404.html 为 Gridea 新增，无 Hexo 对应 | - |

---

## 来源：hexo-theme-anatolo（迁移日期：2026-07-22）[L1-高置信度]

### 排除的组件
- templates/blog.html（源主题不存在独立博客列表页，仅有首页）
- templates/memos.html（源主题不存在）
- templates/partials/comments.html（源主题评论系统依赖 Hexo 配置+JS，简化迁移为纯静态注释占位，后续需手动接入第三方评论系统）
- 分类列表页 categories.pug → 不迁移（源主题仅使用 list_categories() helper 做占位，Gridea 无全局分类列表变量）

### 全局变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| theme.defaultTheme | theme_config.defaultTheme | layout.pug → base.html | default/light/dark 三值，对应 html[theme] CSS 选择器 |
| theme.avatar | config.avatar | 
av.pug → header.html | Gridea 内置字段；**anatolo 特殊处理**：模板中硬编码 /images/logo.webp 作为默认回退（不使用 Gridea 默认 avatar.png） |
| theme.favicon | 直接写 /images/favicon.webp | head.pug → head.html | 静态资源路径，anatolo 默认使用原主题 /images/favicon.webp |
| theme.logo_dir | config.logo | sidebar.pug → sidebar.html | Gridea 内置字段；**anatolo 特殊处理**：模板中硬编码 /images/logo@2x.webp 作为默认回退（不使用空 config.logo） |
| theme.logo_style | theme_config.logoStyle | sidebar.pug → sidebar.html | CSS inline style 字符串 |
| theme.menu (对象 
ame: link) | menus 全局变量 (数组 [{name,link}]) | 
av.pug → header.html | 结构不同：对象 → 数组 |
| theme.rightbtn.back | theme_config.rightbtnBack | 
av.pug → header.html | toggle 字段 |
| theme.rightbtn.search | theme_config.rightbtnSearch | 
av.pug → header.html | toggle 字段 |
| theme.rightbtn.avatar | theme_config.rightbtnAvatar | 
av.pug → header.html | toggle 字段 |
| theme.rightbtn.darkLightToggle | theme_config.rightbtnDarkLightToggle | 
av.pug → header.html | toggle 字段 |
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

### 文章变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| page.toc | post.toc\|safe | toc.pug → toc.html | **需 \|safe** |
| page.excerpt | post.abstract\|safe | mixins.pug → post-card.html | **需 \|safe** |
| page.summary | post.abstract\|safe | mixins.pug → post-card.html | 同 excerpt，优先使用 abstract |
| page.friends | links 全局变量 | page.pug → links.html | frontmatter JSON → 内置友链系统 |
| page.author | 删除（不用） | mixins.pug → post-card.html | Gridea 无文章级作者字段 |

### 归档变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| page.posts.data（循环按年份分组） | archives 数组，group.Year/group.Posts | mixins.pug → archives.html | 需大写键名，年份标题直接使用 group.Year |

### 友链变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| page.friends (JSON frontmatter) | links[].siteName / links[].siteLink / links[].avatar / links[].description | page.pug → links.html | frontmatter 手动维护 → 内置友链管理 |

### 分页变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|-------|--------|----------------------|------|
| page.prev / page.next（布尔） | pagination.hasPrev / pagination.hasNext | mixins.pug → index.html | 布尔换名 |
| page.prev_link / page.next_link | pagination.prevURL / pagination.nextURL | mixins.pug → index.html | L1 已确认 |

### Helper 函数映射

| Hexo Helper | Gridea 替代 | 发现位置 | 备注 |
|-------------|------------|---------|------|
| toc(content, opts) | post.toc\|safe | toc.pug → toc.html | **需 \|safe**，不支持 max_depth 参数配置 |
| word_count(content) | post.wordCount | mixins.pug → post-card.html | 不再是 filter，是对象字段 |
| duration(sec, "seconds") / time(sec, "m") / time(sec, "s") | post.readingTime | mixins.pug → post-card.html | 单位分钟，不再需要手动计算 |
| is_current(path) | current_page == "xxx" | 
av.pug → header.html | 页面类型判断；**anatolo 特殊处理**：Gridea 的 current_page 仅区分 index/archives/tags 等大类，无法精确定位 /about 等自定义路径。anatolo 改用 JS 前端 window.location.pathname 精确匹配并给菜单 <a> 加 class="current" |
| is_post() | post 变量是否存在 | 
av.pug → header.html | 当前模板上下文判断；**anatolo 特殊处理**：为避免首页/列表页 post 变量误触发返回按钮显示，额外通过 body.post-detail class + CSS 辅助隐藏 |
| tagcloud() | JS 客户端 canvas（TagCanvas 2.9） | tags.pug → tags.html | 删除服务端 tagcloud 渲染，改为前端 JS 动态生成 |
| alphabet_tag_list(site.tags, opts) | 直接循环 tags | tags.pug → tags.html | 不保留字母分组 |
| list_categories(site.categories) | 无等价，已删除 | categories.pug → 不迁移 | Gridea 无全局 categories 列表 |
| list_tags(site.tags, opts) | 直接循环 tags | tags.pug → tags.html | 直接 for 循环，不保留 options 定制 |

### 陷阱记录

| 陷阱 | 描述 | 发现位置 |
|------|------|---------|
| \|default:expr 链式传参不可用 | Pongo2 中 \|default:post.content\|truncatechars:150 语法错误，需用 {% set %} 预计算 | post.html → {% set desc = ... %} |
| {% block %} 定义在 {% include %} 的 partial 内不被继承覆盖 | 块必须定义在 base.html 直接层级，不能在 include 的 partial 内 | head.html → 重命名为 head_title/head_description 移到 base.html |
| word_count 和 
eading_time 不是 Pongo2 filter | Gridea 的 word count 是 post.wordCount (对象字段)，阅读时间是 post.readingTime | mixins.pug → post-card.html |
| excerpt filter 不存在 | 不存在 \|excerpt:N filter，需用 \|striptags\|truncatechars:N 或 post.abstract | mixins.pug → post-card.html |
| theme.social 对象结构需拆分为独立字段 | Hexo 的 theme.social = { icon: link, ... } 在 Gridea 中需拆为 theme_config.socialGithub 等独立 toggle/input | social_links.pug → social_links.html |
| theme.menu 对象 → menus 数组 | 结构完全不同：Hexo 是 { "Home": "/" }，Gridea 是 [{ name: "首页", link: "/" }] | 
av.pug → header.html |
| config.highlight.line_number 不可移植 | 代码行号显示由 Hexo 渲染器控制，Gridea 由 Markdown 引擎内置 | layout.pug → base.html（删除 body class disable-line-number） |
| __('key') 文案硬编码为中文 | 源主题 lang="zh-CN" + 中文语言文件，所有 __() 调用的输出硬编码为中文 | 全部模板文件 |
| post.date\|slice:"5:10" 用于归档页 MM-DD | RFC3339 字符串格式为 YYYY-MM-DDTHH:mm:ss，[5:10] 位恰好是 MM-DD | mixins.pug → archives.html |

### 静态资源映射（2026-07-23 补充）

> Gridea 静态资源规则：assets/ 目录下文件在构建输出时去掉 assets/ 前缀。例如 assets/images/favicon.webp → 输出 URL /images/favicon.webp。

| Hexo source/ 路径 | Gridea assets/ 路径 | 输出 URL | 引用位置 | 备注 |
|---|---|---|---|---|
| source/images/favicon.webp | assets/images/favicon.webp | /images/favicon.webp | head.html | 网站图标，anatolo 默认使用原主题文件 |
| source/images/gongan.png | assets/images/gongan.png | /images/gongan.png | footer.html | 公安备案图标 |
| source/images/logo.webp | assets/images/logo.webp | /images/logo.webp | header.html（顶部头像默认值） | anatolo 硬编码默认值，不使用 Gridea 默认 avatar.png |
| source/images/logo@2x.webp | assets/images/logo@2x.webp | /images/logo@2x.webp | sidebar.html（侧栏 title image） | anatolo 硬编码默认值，不使用 config.logo |
| source/css/font-awesome.min.css | assets/css/font-awesome.min.css | /css/font-awesome.min.css | head.html | 必须本地引用，不可用 CDN |
| source/webfonts/* | assets/webfonts/* | /webfonts/* | font-awesome 依赖 | 按原主题输出路径存放 |
| source/fonts/* | assets/fonts/* | /fonts/* | font-awesome 依赖 | 按原主题输出路径存放 |
| source/js/tagcanvas.js | assets/media/js/tagcanvas.js | /media/js/tagcanvas.js | tags.html（标签云模式） | TagCanvas 2.9 库 |

### JS 功能复刻映射（2026-07-23 补充）

> 原主题 src/anatolo/ 各 TS 模块编译为 js_complied/bundle.js，挂载 window.Anatolo 和 window.Utils。迁移版不可假设 bundle 存在，必须用内联 JS 复刻在 base.html 中。

| 原主题调用 | 原源文件 | 复刻位置 | 逻辑要点 |
|---|---|---|---|
| Anatolo.darkLightToggle() | src/anatolo/dark-light-toggle.ts | base.html <script> | 读 html[theme] → default 时解析系统偏好 → 翻转 dark/light → localStorage.setItem + setTheme() → 页面加载时 setTheme() 恢复 |
| Anatolo.search.openWindow() | src/components/search.tsx | base.html <script> | 加 .animated.fadeIn.show → focus() → setTimeout(10) 后 setSelectionRange |
| Anatolo.search.closeWindow() | src/components/search.tsx | base.html <script> | if(!searchShowing)return → 加 .fadeOut、去 .fadeIn → blur() → setTimeout(400) 后去 .show |
| Anatolo.share.native() | src/anatolo/anatolo.ts | base.html <script> | 
avigator.share({ url, text: document.title, title: document.title }) |
| Utils.copyToClipboard(text) | src/utils/copy-to-clipboard.ts | base.html <script> | 优先 
avigator.clipboard.writeText → catch 时 textarea + execCommand('copy') 回退 → finally 调 success()（0ms show → 500ms fadeOut → 1000ms 清除） |
| scroll-to-top 显隐 | src/components/float-btn.ts | base.html <script> | scroll 事件：scrollY < 200 加 .hide，否则去 .hide（含 { passive: true } 优化） |
| 移动端更多菜单 | src/components/rightbtn.ts | base.html <script> | 全局 click：点击 .btn-toggle-more（含父级）给 .nav_right_btn 加 .expanded，否则去除 |

### 新增陷阱（2026-07-23 更新）

| 陷阱 | 描述 | 发现位置 |
|------|------|---------|
| html[theme] 缺失导致 CSS 变量失效 | 原主题所有颜色/边框/背景依赖 html[theme='light\|default\|dark'] 选择器对应的 CSS 变量。迁移版最初未输出 theme 属性，导致 page-top 灰线、字体颜色、侧栏分界等视觉大面积偏离原主题。 | layout.pug → base.html |
| Anatolo 命名空间未定义 | 模板中 onclick="Anatolo.xxx" 多处调用，但原主题 bundle.js 未引入，所有功能（搜索/分享/复制/回顶/移动菜单/明暗切换）均静默失效。 | base.html |
| 原主题图片未用作默认值 | 迁移时应优先用原主题资源作为默认回退，而非 Gridea 默认 avatar.png 或空 config.logo。anatolo 中顶部头像默认 /images/logo.webp，侧栏 title image 默认 /images/logo@2x.webp，favicon 默认 /images/favicon.webp。 | header.html / sidebar.html / head.html |
| FontAwesome CDN 引入不稳定 | 原主题使用本地 /css/font-awesome.min.css + /webfonts/*，迁移改为 CDN 后可能因网络/版本/离线预览导致图标异常。应在 assets/css/ 下复刻原始文件。 | head.html |
| 搜索面板动画不完整 | 迁移版仅 toggle show 类，缺少原主题 animated、fadeIn、fadeOut 类的动画链，以及 
extTick 后选文本、关闭前 400ms 延迟等时序控制。 | base.html |
| 分享缺少 text 参数 | 原主题 
avigator.share() 传入 { url, text, title }，迁移版缺少 text 会导致部分 share target 显示异常。 | base.html |
| success() 动画时序偏离 | 原主题 show → 500ms fadeOut → 1000ms 清除，迁移版初始实现为 600/1200ms，已修正。 | base.html |
| 代码块语言标签适配 | Hexo 输出为 figure.highlight table td.code 结构，用 td.code:after 显示语言标签；Gridea 输出为 <pre><code class="language-xxx">，CSS 需同时适配两者，并用 JS 运行时扫描 <pre> 标注 data-code-lang。 | post.html / base.html |
| 当前菜单 class 由 JS 后置注入 | Gridea 仅提供大类 current_page（index/archives/tags），无法精确定位 /about 等自定义路径。anatolo 在 base.html 中用 JS pathname 精确匹配并给 <a> 加 class="current"。注意避免前缀匹配导致 /about 误匹配页面底部链接。 | base.html |
| 浅色/默认主题色阶方向错误 | 原主题 --primary-high 浅色下应为深色文字（mix(, , 75%)），迁移版初始实现反向导致正文颜色过浅、灰线不显。 | main.css CSS 变量 |
| 404 模板上下文限制 | Gridea 渲染 404.html 时仅提供全局 config（如 config.siteName），不存在 post、posts、pagination、page 等变量。引用这些变量会静默输出空值或触发模板降级。 | templates/404.html |
| :focus 伪类在 headless 浏览器中不触发 | Electron/Playwright 等无系统焦点的 headless 环境中，element.focus() 可设置 document.activeElement 但不会激活 CSS :focus 或 :focus-visible 伪类。真实浏览器键盘 Tab 导航时正常生效。迁移验收不应依赖 headless 焦点测试判定失败。 | 404.html → main.css（2026-07-25 实现验证） |

---

## 本次对话移植问题总结（2026-07-23）

本次对话中共发现并修复了以下三类移植问题：

### 一、静态资源缺失
- **缺失的图片文件**：favicon.webp、gongan.png、logo.webp、logo@2x.webp 未从原主题复制到 assets/ 目录
- **缺失的 CSS/字体**：font-awesome.min.css + webfonts/* + fonts/* 被改为 CDN 引入，导致离线环境和网络问题下图标异常
- **缺失的 JS 库**：tagcanvas.js 未复制，导致标签云 3D 渲染无法工作

### 二、JS 功能全部静默失效
- 原主题 bundle.js 编译自 src/anatolo/ 下 7 个 TS 模块，提供搜索、分享、复制、回顶、移动端菜单、明暗切换等核心交互
- 迁移版模板保留了所有 onclick="Anatolo.xxx" 调用，但 window.Anatolo / window.Utils 从未定义
- 经逐行对比原 TS 源码后，7 个功能全部在 base.html 中以内联 JS 复刻，且与原始实现逻辑一致

### 三、模板渲染偏差
- **html[theme] 属性缺失**：CSS 变量体系不生效，导致全局颜色/边框/字体大面积偏离原主题
- **当前菜单高亮**：Gridea 无 is_current() helper，改用 JS pathname 精确匹配 + class="current"，且避免前缀匹配误伤
- **返回按钮误显示**：非文章页也显示 fa-chevron-left，通过 body.post-detail class + CSS 让仅文章页可见
- **头像/logo 默认值**：不使用 Gridea 内置 avatar.png，硬编码原主题资源路径作为默认回退
- **代码块语言标签**：CSS/JS 同时兼容 Hexo figure.highlight 和 Gridea <pre><code> 两种输出结构

---

## 来源：hexo-theme-anatolo（迁移日期：2026-07-26）[L1-高置信度] — 补充

### Gridea Pro 页面文件约定

Gridea Pro 遵循"文件名决定输出路径"的约定。关键文件和对应路由如下：

| 文件名 | 输出 URL | 作用 | 备注 |
|---|---|---|---|
| `templates/index.html` | `/`、`/page/N/` | 首页文章列表 | `body_class` = `home` |
| `templates/blog.html` | `/post/`、`/post/page/N/` | 独立博客文章列表页 | **与 index.html 不是同一个模板**；`body_class` = `blog` |
| `templates/post.html` | `/post/<slug>/` | 单篇文章详情 | `body_class` = `post-detail`，不可用作列表页 |
| `templates/archives.html` | `/archives/` | 文章归档页 | 数据源为 `archives` 数组 |
| `templates/tags.html` | `/tags/` | 标签汇总页 | 支持标签云/列表两种模式 |
| `templates/tag.html` | `/tag/<name>/` | 单个标签下的文章列表 | 变量为 `current_tag` |
| `templates/about.html` | `/about/` | 关于页面 | 独立页面，复用文章详情 `.post-page > .post > .post-content` 结构 |
| `templates/links.html` | `/links/` | 友链页面 | 独立页面，数据源为 `links` 数组 |
| `templates/memos.html` | `/memos/` | 闪念页面 | 独立页面，数据源为 `memos` 数组 |
| `templates/404.html` | `/404/` | 404 页面 | **仅可用 config 全局变量**，无 post/posts/pagination |

**已验证的参考主题确认**（2026-07-26）：`gridea-pro-theme-anubis2`、`gridea-pro-theme-typography`、`flavor-theme` 三个主题均通过 `templates/blog.html` 渲染 `/post/` 博客列表页。Gridea Pro 引擎支持此约定。

### 导航高亮 JS 逻辑

原版 Hexo 使用 `is_current()` helper 精确匹配路径。Gridea 仅提供大类 `current_page`（index/archives/tags），无法精确定位 `/about`、`/links`、`/post` 等自定义路径。当前 anatolo 在 `base.html` 中用 JS `window.location.pathname` 精确匹配：

```javascript
var isCurrent = currentPath === menuPath
  || (menuPath === '/' && currentPath.indexOf('/page/') === 0)
  || (menuPath === '/post' && currentPath.indexOf('/post/page/') === 0);
```

注意避免前缀匹配导致 `/about` 误匹配页面底部链接。**分页路径需单独处理**：首页 `/page/N/` 匹配 `/`，`/post/page/N/` 匹配 `/post`。

### 闪念页 (Memos) 变量映射

| Gridea 变量 | 说明 | 发现位置 | 备注 |
|---|---|---|---|
| `memos` | 闪念数据数组 | memos.html | Gridea 内置闪念系统 |
| `memo.content` | 富文本正文（HTML） | memos.html | **需 `\|safe`** |
| `memo.tags` | 标签字符串数组 | memos.html | 不需 `\|safe` |
| `memo.createdAt` | 已格式化的创建日期 | memos.html | 直接展示 |
| `memo.createdAtISO` | ISO 格式创建日期 | memos.html | 用于 `<time datetime>` 和 JS 聚合 |
| `forloop.Counter0` | 从 0 开始的循环索引 | memos.html | 用于首屏隐藏阈值判断 |

**闪念页架构要点：**
- `templates/memos.html` 继承 `base.html`，`body_class` = `page-memos`
- 所有样式以 `.page-memos` 限定作用域，追加在 `main.css` 末尾
- 热力图使用 53 周 × 7 天 CSS Grid，周日对齐；月份标签、星期标签、五级色阶仿 GitHub Contributions 风格
- 标签去重：正文中整个段落全是当前闪念已知标签时删除，正常语句保留
- 长正文折叠阈值 160px，分页每页 20 条
- 热力图 Grid 最后一列与右下角图例共用右侧基准线，右上角显示最新闪念年份
- 闪念页 `.memos-page` 使用 `width: 100%; padding: 50px 30px 60px;`，与首页、归档页 `30px` 左侧基准线一致

**已验证的误报告警（2026-07-26）：**
- "初始隐藏与分页冲突"：临时移除 `memo-hide` 是为了测量隐藏内容高度，随后同步调用分页恢复，不是 bug。
- "热力图起始日期计算错误"：当前 `startDate.setDate(startDate.getDate() - startDate.getDay() - (52 * 7))` 与建议公式数学等价。
- "TagCanvas 引入顺序错误"：真正初始化在外部脚本的 `window.load` 回调中，不是模板内。
- "TagCanvas HTML 结构无效"：TagCanvas 在未传入第二个参数时默认将 Canvas 自身作为标签来源（`this.source = cid`），`canvas.getElementsByTagName('a')` 正确读取链接。

### 友链页 (Links) 变量映射

| Hexo | Gridea | 发现位置（源 → 目标） | 备注 |
|---|---|---|---|
| `page.friends` (JSON frontmatter) | `links` 全局数组 | page.pug → links.html | frontmatter 手动维护 → Gridea 内置友链系统 |
| 客户端 TSX DOM 替换 | Pongo2 直接输出最终 DOM | friend-link.tsx → links.html | 不照搬运行时转换，模板阶段直接输出最终 HTML 结构 |

| Gridea 变量 | 说明 | 备注 |
|---|---|---|
| `links` | 友链数据数组 | Gridea 内置友链系统 |
| `link.siteName` | 站点名称 | 必需字段 |
| `link.siteLink` | 站点链接 | 必需字段 |
| `link.description` | 站点描述 | 可选字段 |
| `link.avatar` | 头像 URL | 可选字段；为空时不输出头像节点 |

**友链页架构要点：**
- 模板复用文章详情 `.post-page > .post.animated > .post-content` 结构，友链标题使用 `.post-title h3`
- 卡片 DOM：`.friend-link-container > .friend-link-box`（grid: `84px auto`）
- 无头像时添加 `.friend-link-box-no-avatar` 并切换为单列 `grid-template-columns: minmax(0, 1fr)`
- 桌面端保留原版固定 `width: 350px + padding 10px + border 1px = 372px` 可见宽度，`margin: 10px` 后完整占用 `392px`
- 500px 以下使用 `box-sizing: border-box; width: calc(100% - 20px)` 流式适配
- 长标题/描述使用 `overflow-wrap: anywhere` 防止撑宽
- 空头像卡片不保留 84px 空白列

### 关于页 (About) 结构调整

| 版本 | 结构 | 说明 |
|---|---|---|
| 旧版（Gridea 迁移初版） | `.content > .about` | 独立容器，仅 `.about { margin: 30px; }` + `.about h3 { font-size: 22px; }` 两条样式，不与文章正文排版一致 |
| 当前版（2026-07-26） | `.content > .post-page > .post.animated > .post-content` | 复用文章详情页正文结构，继承全部 `.post-content` 标题/链接/颜色规则 |

**关于页数据回退链：**
```
post.content|safe  →  about_post.content|safe  →  config.siteDescription
```

**关于页与文章详情页标题对比：**

| 属性 | 关于页正文 `h1` | 文章顶部 `.post-title h3` |
|---|---|---|
| 字号 | `22px` | `22px` |
| 字重 | `600` | `600` |
| 行高 | `1.2em` | `1` |
| 字间距 | 默认 | `1px` |
| 外边距 | `2rem 0` | `0` |

两者均为 `22px/600`，但字间距和行高不同，视觉观感有差异，这是**原版设计如此**，不是迁移错误。

**正文标题字重（原版设计）：**
- `h1`/`h3`/`h5`：明确 `font-weight: 600`
- `h2`/`h4`/`h6`：未显式设置，采用浏览器标题默认粗体（通常 `bold/700`）
- 原版 Hexo SCSS 与迁移版 CSS 设置一致，未发现迁移偏差

### TagCanvas 标签云行为

- **初始化入口**：`tagcanvas.js` 末尾 `addLoadEvent` 中调用 `TagCanvas.Start('resCanvas')`，见 `tagcanvas.js#L2605`
- **链接来源**：未传入第二个参数时，`this.source = cid`（即 Canvas 自身），通过 `canvas.getElementsByTagName('a')` 读取链接
- **链接放在 Canvas 内是有效结构**：`<canvas>` 内的后备内容在支持 Canvas 的浏览器中被 TagCanvas 用作数据源
- **字号预处理**：模板内 JS 从 Canvas 读取 `data-count` 属性计算字号，在 `tagcanvas.js` 加载前完成
- **配置位置**：所有 TagCanvas 选项（字体、颜色、速度等）在 `tagcanvas.js` 底部的 `addLoadEvent` 中统一设置，模板不应重复声明
- **`theme_config.useTagCloud`**：布尔开关，`true` 时渲染 Canvas 标签云，`false` 时渲染普通列表

### Favicon 静态资源

- 原版路径：`source/images/favicon.webp`
- 当前主题路径：`assets/images/favicon.webp`
- 输出 URL：`/images/favicon.webp`（Gridea 输出时去掉 `assets/` 前缀）
- SHA256：`1309c82b64f8b768212e2354e0d969ba5f8f921ea5c60d6e4c8ab5a4a131e87d`
- 与原版文件完全一致
- 当前主题在模板中硬编码路径，原版通过 `theme.favicon` 配置项可自定义

### 静态资源输出规则补充

> Gridea 构建时，`assets/` 目录下文件在输出时去掉 `assets/` 前缀。`assets/images/favicon.webp` → 输出 URL `/images/favicon.webp`。`assets/media/js/tagcanvas.js` → 输出 URL `/media/js/tagcanvas.js`。模板中引用时直接使用输出 URL。

### 友链页样式补充陷阱

| 陷阱 | 描述 | 发现位置 |
|---|---|---|
| 卡盒模型差异 | 原版 `.friend-link-box` 使用默认 `content-box`，`width: 350px + padding 20px + border 2px = 372px`；误用 `border-box` 会导致卡片实际内容区变窄 | friend-link.tsx |
| 窄屏溢出 | 原版桌面布局在 500px 以下视口出现横向溢出；当前版本在窄屏添加 `box-sizing: border-box` 和流式宽度解决 | main.css |
| 空头像空白列 | 原版即使无头像也保持 `grid-template-columns: 84px auto`，卡片内存在 84px 空白列 | friend-link.tsx |
| Grid 长文本撑宽 | Grid 子项默认 `min-width: auto`，长链接/描述可能撑破列宽；需 `minmax(0, 1fr)` 约束 | main.css |