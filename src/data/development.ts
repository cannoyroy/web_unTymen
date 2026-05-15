export interface TimelineEntry {
  date: string;
  title: string;
  tag: string;
  summary: string;
  details: string[];
}

// ============ 备份：原始项目数据（https://github.com/elonwoo-02/elon-kernel） ============

const _upstream_androidTimeline: TimelineEntry[] = [
  {
    date: '2026-02-17',
    title: '接入移动端导航组件',
    tag: 'Android',
    summary: '为移动端补齐导航基础交互。',
    details: ['新增 Dock、Drawer 和 FabFlower 组件。'],
  },
  {
    date: '2026-02-18',
    title: '优化移动端交互节奏',
    tag: 'Mobile',
    summary: '打磨触控场景下的浮层与入口行为。',
    details: [
      '优化 Drawer 开合与遮罩响应。',
      '调整移动端 Dock 按钮布局与可触达性。',
    ],
  },
  {
    date: '2026-02-21',
    title: '补充移动端安装引导',
    tag: 'PWA',
    summary: '在移动端覆盖安装提示与降级指引。',
    details: [
      '支持 beforeinstallprompt 安装提示。',
      'iOS 场景提供“添加到主屏幕”引导。',
    ],
  },
];

const _upstream_markdownPostLayoutTimeline: TimelineEntry[] = [
  {
    date: '2026-02-18',
    title: '拆分文章布局组件壳',
    tag: 'Post',
    summary: '将文章页拆分为 PostShell 与内容子组件。',
    details: [
      '抽离 PostShell、PostHeader、PostContent。',
      '明确桌面主栏与侧栏目录结构。',
    ],
  },
  {
    date: '2026-02-21',
    title: '优化文章基础布局与宽度对齐',
    tag: 'Post',
    summary: '文章页主内容宽度与 BaseLayout 保持一致，修复展示混乱。',
    details: [
      '文章页面容器统一继承站点主容器宽度策略。',
      '修复文章布局错位与构建失败相关问题。',
      '优化内容阅读节奏与版面稳定性。',
    ],
  },
  {
    date: '2026-02-21',
    title: '加入章节导航与阅读辅助',
    tag: 'Post',
    summary: '文章页支持章节目录导航与阅读进度反馈。',
    details: [
      '桌面端展示右侧 TOC，移动端提供折叠目录。',
      '目录高亮与滚动定位联动。',
      '长文场景下阅读进度条可用。',
    ],
  },
];

const _upstream_baseLayoutTimeline: TimelineEntry[] = [
  {
    date: '2026-02-10',
    title: '重构 Terminal 模态框组件',
    tag: 'Refactor',
    summary: '统一终端结构并提升交互稳定性。',
    details: [
      '使用 Tailwind 重写组件。',
      '将结构、样式与逻辑拆分到 terminal 目录。',
      '拖拽和缩放统一为 Pointer 事件并做 raf 节流。',
    ],
  },
  {
    date: '2026-02-11',
    title: '优化全局快捷键系统',
    tag: 'BaseLayout',
    summary: '统一快捷键入口并提升可配置性。',
    details: ['实现全局快捷键逻辑。', '将快捷键重构为可配置映射。'],
  },
  {
    date: '2026-02-12',
    title: '设计 PlayBot 组件',
    tag: 'Style',
    summary: '为桌面端补充 3D 形象入口。',
    details: [
      '使用 Rodin + Spline 生成嵌入式 3D 展示。',
      '移动端默认隐藏，桌面端支持快捷键 P 显隐。',
    ],
  },
  {
    date: '2026-02-21',
    title: '确认站点颜色方案',
    tag: 'BaseLayout',
    summary: '确认全站采用统一配色基调，确保页面视觉一致性。',
    details: [
      '确认采用“云舞白”作为站点背景主色方向。',
      '站点主色策略统一由全局主题变量驱动。',
    ],
  },
  {
    date: '2026-02-18',
    title: 'AI 聊天终端接入 LangGraph',
    tag: 'AI',
    summary: '在终端中接入 AI 聊天命令与服务端图编排。',
    details: [
      '新增 /api/ai/chat 路由并接入 LangGraph。',
      '支持 ai ask / ai history / ai reset / ai help。',
      '会话历史持久化到 localStorage。',
    ],
  },
  {
    date: '2026-02-19',
    title: '修复开发环境 API 兼容',
    tag: 'AI',
    summary: '解决 static 开发模式下接口调用问题。',
    details: ['开发环境补充 GET 兜底路径。', '统一本地与函数路由行为。'],
  },
  {
    date: '2026-02-20',
    title: '适配模型参数约束',
    tag: 'AI',
    summary: '兼容 gpt-4o-mini-search-preview 请求参数。',
    details: ['移除不兼容的 temperature 参数。', '继续读取 .env 中 OPENAI_MODEL 配置。'],
  },
  {
    date: '2026-02-20',
    title: '增强流式输出稳定性',
    tag: 'AI',
    summary: '降低不同运行时下流式失败率。',
    details: ['流式失败时自动降级为完整返回。', '统一本地与 Cloudflare Functions 逻辑。'],
  },
  {
    date: '2026-02-21',
    title: '统一页面宽度控制入口',
    tag: 'Layout',
    summary: '移除页面内部宽度覆盖，统一由 BaseLayout 控制。',
    details: [
      'About 页面移除 .site-content 的 max-width 覆盖。',
      'Experience/Test/Timeline 移除局部 max-w 约束。',
      '各页面内容宽度策略一致化。',
    ],
  },
  {
    date: '2026-02-21',
    title: '全站默认宽度收窄至 6xl',
    tag: 'BaseLayout',
    summary: '默认内容宽度由 7xl 调整为 6xl，并同步 Footer 对齐。',
    details: [
      'BaseLayout 默认 contentWidth: 7xl -> 6xl。',
      'fallback 宽度同步改为 max-w-6xl。',
      'Footer 容器宽度与主容器一致。',
    ],
  },
  {
    date: '2026-02-21',
    title: '重写全站主题切换系统',
    tag: 'Theme',
    summary: '统一 light/dark/auto 主题入口并提升主题切换后文本可读性。',
    details: [
      '新增 themeManager，统一 Dock/快捷键/Terminal 的主题切换逻辑。',
      'BaseLayout 在首屏渲染前注入主题初始化，减少主题闪烁。',
      'global.css 引入主题语义色变量，统一背景与文字对比度策略。',
    ],
  },
  {
    date: '2026-02-21',
    title: '新增灵动岛消息组件',
    tag: 'UI',
    summary: '仿 iPhone 灵动岛形态实现全站消息入口。',
    details: [
      '新增顶部固定胶囊组件，支持收起与展开交互。',
      '使用 Astro 群岛架构挂载为独立交互岛屿。',
      '抽离消息总线，支持后续扩展系统消息与更新提醒。',
    ],
  },
  {
    date: '2026-02-21',
    title: '接入安装提示链路',
    tag: 'PWA',
    summary: '首次访问提示将网页安装为应用并支持安装状态感知。',
    details: [
      '接入 beforeinstallprompt 与 appinstalled 事件。',
      '首次访问提示一次，关闭后记忆不重复打扰。',
      'iOS 场景降级为“添加到主屏幕”引导。',
    ],
  },
  {
    date: '2026-02-21',
    title: '迁移 Dock 与 Icon 到 shared',
    tag: 'Refactor',
    summary: '统一共享组件目录并降低跨页面耦合。',
    details: [
      '将 dock 模块迁移到 src/components/shared/dock。',
      '将图标迁移到 src/components/shared/icons。',
      '全项目更新引用路径。',
    ],
  },
  {
    date: '2026-02-21',
    title: '增加兼容层保障升级无感',
    tag: 'Refactor',
    summary: '为历史路径补充 re-export，避免重构引发功能回退。',
    details: ['保留 legacy 入口并转发至新 shared 目录。', '确保旧引用场景仍可正常工作。'],
  },
];

const _upstream_indexTimeline: TimelineEntry[] = [
  {
    date: '2026-02-12',
    title: '搭建首页开发时间轴',
    tag: 'Index',
    summary: '首页接入按模块展示的开发里程碑。',
    details: ['新增时间轴展示。', '抽离 TimelineSection.astro 与 development.ts。'],
  },
  {
    date: '2026-02-14',
    title: '完成 Hero 首屏设计',
    tag: 'Hero',
    summary: '首页首屏建立身份展示与视觉锚点。',
    details: ['新增 Hero 组件展示头像与标签。', '统一首页首屏信息层级。'],
  },
  {
    date: '2026-02-21',
    title: '首页可见全站消息入口',
    tag: 'UI',
    summary: '首页接入灵动岛消息能力，展示安装与系统提示。',
    details: ['顶部固定消息入口与交互态统一。', '支持首次访问安装引导提示。'],
  },
];

const _upstream_aboutTimeline: TimelineEntry[] = [
  {
    date: '2026-02-12',
    title: '头像升级为 3D 悬浮效果',
    tag: 'About',
    summary: 'About 页头像引入立体悬浮交互。',
    details: ['将 About 页头像升级为 3D 组件。'],
  },
  {
    date: '2026-02-16',
    title: '补充简历多语言切换',
    tag: 'About',
    summary: '支持 Python / Go / 中文三种展示视图。',
    details: ['新增语言切换器与状态持久化。', '侧栏与主内容联动切换。'],
  },
  {
    date: '2026-02-20',
    title: '优化代码风简历布局',
    tag: 'Layout',
    summary: '强化编辑器风格排版与响应式表现。',
    details: ['完善左右栏网格与移动端断点。', '提升履历信息层级与可读性。'],
  },
  {
    date: '2026-02-22',
    title: '重构 About 为 JetBrains 风工作区',
    tag: 'About',
    summary: '完成窄侧栏+主代码区布局，并升级为 token 级代码高亮。',
    details: [
      '左侧栏收窄并固定头像模块，主阅读区聚焦代码内容。',
      '代码块支持关键字/类型/字符串/注释等 token 级着色。',
      '补充分词与数据契约测试，确保语言切换与显示稳定。',
    ],
  },
  {
    date: '2026-02-22',
    title: '修复 About 双栏滚动与刷新缓存异常',
    tag: 'About',
    summary: '左右栏改为同步滚动，移动端维持双栏，并修复普通刷新样式回退问题。',
    details: [
      '移除侧栏独立滚动容器，页面改为统一文档流滚动。',
      '手机端保持双栏结构，仅缩小字体与间距提升可读性。',
      'Service Worker 升级为 v5，HTML 与 _astro 资源采用 network-first。',
    ],
  },
];

const _upstream_blogTimeline: TimelineEntry[] = [
  {
    date: '2026-02-12',
    title: '接入博客热力图模块',
    tag: 'Blog',
    summary: '在博客页加入 GitHub 风格热力图。',
    details: ['绘制 7x53 活动格子。', '与文章列表并列展示。'],
  },
  {
    date: '2026-02-14',
    title: '实现三视图内容系统',
    tag: 'Blog',
    summary: '博客支持 Article / Moment / Note 三视图切换。',
    details: ['抽离 ArticleView、MomentView 与 NoteView。', '接入视图切换岛屿组件。'],
  },
  {
    date: '2026-02-16',
    title: '补充 Note 视图筛选能力',
    tag: 'Blog',
    summary: 'Note 视图支持标签筛选与空状态反馈。',
    details: ['支持标签路径匹配与一键清除过滤。', '补充无结果空状态提示。'],
  },
  {
    date: '2026-02-15',
    title: '完善 Drawer 侧栏能力',
    tag: 'Sidebar',
    summary: '侧栏整合统计、标签和导航入口。',
    details: ['新增博客统计信息展示。', '补充标签筛选与入口按钮。'],
  },
  {
    date: '2026-02-19',
    title: '修复移动端展示与抽屉交互',
    tag: 'Responsive',
    summary: '解决小屏场景下的抽屉和内容区错位问题。',
    details: ['优化移动端 Drawer 显隐行为。', '调整内容区宽度与滚动表现。'],
  },
  {
    date: '2026-02-22',
    title: '重构博客热力图为真实活动追踪',
    tag: 'Blog',
    summary: '热力图改为 12x7 真实数据聚合，并修复颜色层级与样式生效问题。',
    details: [
      '活动数据从伪随机改为 Article/Note/Moment 按日聚合。',
      '热力图布局调整为 12x7，点击日期可查看当天明细。',
      '修复 Astro 样式作用域导致的颜色失效，0 级改为中性灰块。',
    ],
  },
  {
    date: '2026-02-22',
    title: '博客品牌更名为 Elon Kernel',
    tag: 'Blog',
    summary: '统一站内入口、RSS 与导航文案，完成博客品牌升级。',
    details: [
      'Blog 页面标题更新为 Elon Kernel | Blog。',
      'RSS 与搜索入口品牌文案同步替换。',
      'Dock、移动端导航与终端帮助统一新名称。',
    ],
  },
];

const _upstream_experienceTimeline: TimelineEntry[] = [
  {
    date: '2026-02-19',
    title: '重构 Experience 页面结构',
    tag: 'Experience',
    summary: '整理为 Hero + 分区内容 + 右侧目录的学术化版式。',
    details: ['统一 Research / Projects / Publications 区块节奏。', '优化主栏与 TOC 栅格比例。'],
  },
  {
    date: '2026-02-20',
    title: '优化目录侧栏联动',
    tag: 'TOC',
    summary: '增强右侧目录在阅读过程中的导航作用。',
    details: ['补充吸顶目录组件。', '滚动时高亮当前章节。'],
  },
  {
    date: '2026-02-21',
    title: '移除头像并改造 Hero',
    tag: 'Hero',
    summary: 'Experience Hero 由双栏改为单栏文本并去除照片。',
    details: ['强化姓名与身份信息层级。', '保留研究兴趣卡片与操作按钮组。'],
  },
  {
    date: '2026-02-21',
    title: '首屏占满 Hero',
    tag: 'Layout',
    summary: '未滚动时 Hero 占据主要可视区，增强首屏展示。',
    details: ['移动端采用 svh 最小高度策略。', '通过纵向分布让信息块更均衡。'],
  },
  {
    date: '2026-02-21',
    title: '补充研究兴趣条目',
    tag: 'Content',
    summary: 'Research Interests 新增方向条目。',
    details: ['新增：Model Compression and Inference Optimization。'],
  },
];

// ============ Reid 个人改造记录 ============
// 本网站基于 https://github.com/elonwoo-02/elon-kernel 项目改造

export const myTimeline: TimelineEntry[] = [
  {
    date: '2026-02-18',
    title: 'Fork elon-kernel 主题',
    tag: 'Init',
    summary: 'Clone 自 elonwoo-02/elon-kernel，开始个人改造。',
    details: ['基于原项目搭建个人博客框架。'],
  },
  {
    date: '2026-04-30',
    title: '迁移 55 篇 HEXO 博文',
    tag: 'Content',
    summary: '将 HEXO 博客系统中的全部文章迁移至 Astro，重构分类体系。',
    details: [
      '从 HEXO 的 categories 转换为 Astro 的 tags 体系。',
      '整理 11 个分类目录，保留原文内容完整性。',
      '修复 YAML frontmatter 格式与日期转换。',
    ],
  },
  {
    date: '2026-04-30',
    title: '接入 KaTeX 数学公式渲染',
    tag: 'Feature',
    summary: '为博文支持 LaTeX 行内与块级公式渲染。',
    details: [
      '安装 remark-math + rehype-katex 依赖。',
      '配置 Astro markdown 插件管道。',
      '引入 KaTeX CSS 样式表。',
    ],
  },
  {
    date: '2026-04-30',
    title: '修复 TOC 超出视口',
    tag: 'Fix',
    summary: '章节多的文章中，右侧目录导航超出页面底部。',
    details: [
      '为 sticky TOC 容器添加 max-h 与 overflow-y-auto。',
      '确保长文章的目录项始终可见与可滚动。',
    ],
  },
  {
    date: '2026-05-02',
    title: '强化内容呈现与外链入口',
    tag: 'Feature',
    summary: '补齐图表渲染、修复 RSS 订阅，并在 footer 重整入口与社交链接。',
    details: [
      '集成 Mermaid，在博文中原生渲染时序图、流程图、关系图。',
      '修复 RSS feed 生成，订阅源可被常见阅读器正常解析。',
      'Footer 重设计：补齐社交链接，新增独立 Wiki 入口。',
    ],
  },
  {
    date: '2026-05-02',
    title: '接入百度统计与 giscus 评论',
    tag: 'Integration',
    summary: '为站点引入访问分析与文章评论两套第三方能力。',
    details: [
      '在 BaseLayout 注入百度统计脚本，监听 astro:after-swap 处理 SPA 切换的浏览上报。',
      '博文页接入 giscus（基于 GitHub Discussions），按 og:title 进行讨论映射。',
      'giscus 主题随站点明/暗模式切换实时同步，避免深色背景出现亮白评论框。',
    ],
  },
  {
    date: '2026-05-02',
    title: '深色模式对比度全量审计',
    tag: 'Theme',
    summary: '替换 18 个组件中的硬编码调色板工具类为 daisyUI 语义令牌，修复深色模式下文字对比度过低。',
    details: [
      '统一改用 text-base-content（含 /N 透明度档位）、bg-base-100/200/300、border-base-* 等主题感知令牌。',
      '覆盖博文标题/TOC、experience 卡片、博客列表与侧栏、首页 hero 与 moment 弹窗。',
      'ONLINE 徽章改用 bg-warning/15 text-warning，与 daisyUI 主题色保持一致。',
    ],
  },
];
