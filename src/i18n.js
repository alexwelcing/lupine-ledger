// Lupine Library — i18n module
// Provides translation function and language utilities for the SPA.

export const DEFAULT_LANG = 'en';
export const SUPPORTED_LANGS = ['en', 'zh'];

const STRINGS = {
  en: {
    'brand.title': 'Lupine Library',
    'meta.title': 'Lupine Library — Lupine Science Research',
    'meta.description': 'Mobile-first reader for Lupine Science research: UQ, benchmarking, MLIPs, and computational materials theory.',

    'home.loading': 'Loading library…',
    'home.hero': 'Lupine Science <em>Library</em>',
    'home.hero.sub': 'Mobile-first reader for cutting-edge atomistic prediction research.',
    'home.stats.reports': 'reports',
    'home.stats.words': 'words',
    'home.stats.minutes': 'min of reading',
    'home.preprint.badge': 'Working paper',
    'home.preprint.title': 'The Causal Geometry of Prediction Errors in Interatomic Potentials',
    'home.preprint.sub': 'A hyper-ribbon manifold analysis of cross-potential error. Working paper, in preparation.',
    'home.continue': 'Continue Reading',
    'home.error': 'Could not load the library. Please check your connection and try again.',
    'home.fallbackNotice': 'This article is not yet available in {lang}. Showing the English version.',
    'home.journeys.title': 'Start Here',
    'home.featured.title': 'Featured',
    'home.featured.role.anchor': 'Anchor Result',
    'home.featured.role.newest': 'Newest Evidence',
    'home.featured.role.counter': 'Self-Correction',
    'home.featured.role.replication': 'Paper & replication kit',
    'home.featured.role.default': 'Featured',

    'group.hypotheses': 'Hypothesis ledger',
    'group.mlip-flywheel': 'MLIP Flywheel arc',
    'group.extraction': 'Extraction provenance',
    'group.savings-stack': 'Compute savings stack',

    'tags.title': 'Browse the library',
    'tags.subtitle': 'Combine facets, open any tag, and share the exact view.',
    'tags.index': 'All tags',
    'tags.results.one': '1 article',
    'tags.results': '{count} articles',
    'tags.clear': 'Clear filters',
    'tags.facet.status': 'Status',
    'tags.facet.category': 'Category',
    'tags.facet.group': 'Group',
    'tags.facet.tag': 'Tag',
    'tags.sort.label': 'Sort by',
    'tags.sort.title': 'Title A–Z',
    'tags.sort.words': 'Word count: high to low',
    'tags.sort.readMinutes': 'Reading time: long to short',
    'tags.all': 'All',
    'tags.empty': 'No articles match these filters.',

    'reader.loading': 'Loading article…',
    'reader.meta.read': 'min read',
    'reader.nav.prev': '← Previous',
    'reader.nav.next': 'Next →',
    'reader.nav.start': 'Start of library',
    'reader.nav.end': 'End of library',
    'reader.error.offline': 'Could not load this article. You may be offline, or the article may have moved.',

    'search.placeholder': 'Search the library…',
    'search.results.one': '1 result found.',
    'search.results.many': '{count} results found.',
    'search.all': 'All articles — type to filter.',

    'settings.title': 'Reader',
    'settings.lang': 'Language',
    'settings.textSize': 'Text size',
    'settings.theme': 'Theme',
    'settings.lineWidth': 'Line width',
    'settings.offline': 'Offline',
    'settings.saveOffline': 'Save entire library for offline',
    'settings.done': 'Done',
    'settings.saving': 'Saving…',
    'settings.saved': 'Saved ✓',
    'settings.saveFailed': 'Save failed — try again.',

    'aria.back': 'Back to library',
    'aria.graph': 'Knowledge Graph',
    'aria.search': 'Search',
    'aria.settings': 'Reader settings',
    'aria.closeSearch': 'Close search',
    'aria.closeGraph': 'Close graph',

    'graph.loading': 'Mapping library graph…',
    'graph.error': 'The knowledge graph could not be loaded.',
    'graph.title': 'Knowledge Graph',
    'graph.subtitle': 'A deterministic map of articles, program areas, tags, lifecycle states, and explicit corpus relationships.',
    'graph.freshness.atlas': 'Atlas {date}',
    'graph.freshness.next': 'Next re-verification {date}',
    'graph.freshness.proofPack': 'Proof Pack {status} {date}',
    'graph.search.placeholder': 'Focus MLIP, Lean, funding, topology...',
    'graph.search.aria': 'Search graph nodes',
    'graph.mode.aria': 'Graph mode',
    'graph.mode.overview': 'Overview',
    'graph.mode.topics': 'Topics',
    'graph.mode.lifecycle': 'Lifecycle',
    'graph.mode.ontology': 'Ontology',
    'graph.mode.local': 'Local',
    'graph.relationFilters.aria': 'Relation filters',
    'graph.relation.program': 'Programs',
    'graph.relation.contains': 'Contains',
    'graph.relation.tagged': 'Tags',
    'graph.relation.lifecycle': 'Lifecycle',
    'graph.relation.grouped': 'Groups',
    'graph.relation.related': 'Related',
    'graph.relation.co-topic': 'Co-topics',
    'graph.relation.isA': 'Is a',
    'graph.relation.partOf': 'Part of',
    'graph.relation.inheritsErrorFrom': 'Inherits error from',
    'graph.relation.readinessJudgedBy': 'Readiness judged by',
    'graph.relation.chain.gatedBy': 'Chain gated by',
    'graph.relation.markedAs': 'Marked as',
    'graph.relation.show': 'Show {relation} relations',
    'graph.relation.hide': 'Hide {relation} relations',
    'graph.canvas.aria': 'Knowledge graph map',
    'graph.legend.article': 'Article',
    'graph.legend.tag': 'Tag',
    'graph.legend.area': 'Area',
    'graph.legend.status': 'Status',
    'graph.stats.nodes': 'nodes',
    'graph.stats.links': 'links',
    'graph.stats.articles': 'articles',
    'graph.stats.visible': 'visible',
    'graph.meta.items': 'items',
    'graph.meta.words': 'words',
    'graph.inspector.selected': 'Selected',
    'graph.epistemic.aria': 'Epistemic status',
    'graph.epistemic.marker': 'Marker',
    'graph.epistemic.readiness': 'Readiness',
    'graph.epistemic.confidence': 'Confidence',
    'graph.epistemic.asOf': 'As of',
    'graph.readArticle': 'Read article',
    'graph.relations': 'Relations',
    'graph.relations.empty': 'No explicit relations yet.',
    'graph.matches': 'Matches',
    'graph.scope': 'Graph Scope',
    'graph.scope.description': 'This map is generated from catalog metadata, tags, lifecycle labels, groups, and high-confidence overlap. It avoids hidden NLP claims until the extraction layer is ready.',
  },

  zh: {
    'brand.title': 'Lupine 图书馆',
    'meta.title': 'Lupine 图书馆 — Lupine Science 研究',
    'meta.description': '面向移动端的 Lupine Science 研究阅读器：不确定性量化、基准测试、MLIP 和计算材料理论。',

    'home.loading': '正在加载图书馆…',
    'home.hero': 'Lupine Science <em>研究</em>图书馆',
    'home.hero.sub': '面向前沿材料科学研究的移动优先阅读器。',
    'home.stats.reports': '篇报告',
    'home.stats.words': '字',
    'home.stats.minutes': '分钟阅读',
    'home.preprint.badge': '工作论文',
    'home.preprint.title': '原子间势预测误差的因果几何',
    'home.preprint.sub': '跨势函数误差的超带流形分析。工作论文，撰写中。',
    'home.continue': '继续阅读',
    'home.error': '无法加载图书馆，请检查网络连接后重试。',
    'home.fallbackNotice': '本文暂无{lang}版本，显示英文版。',
    'home.journeys.title': '从这里开始',
    'home.featured.title': '精选',
    'home.featured.role.anchor': '核心成果',
    'home.featured.role.newest': '最新证据',
    'home.featured.role.counter': '自我纠正',
    'home.featured.role.replication': '复现套件',
    'home.featured.role.default': '精选',

    'group.hypotheses': '假设账本',
    'group.mlip-flywheel': 'MLIP 飞轮弧线',
    'group.extraction': '提取来源',
    'group.savings-stack': '计算节省体系',

    'tags.title': '浏览图书馆',
    'tags.subtitle': '组合筛选条件，打开任意标签，并分享当前视图。',
    'tags.index': '全部标签',
    'tags.results.one': '1 篇文章',
    'tags.results': '{count} 篇文章',
    'tags.clear': '清除筛选',
    'tags.facet.status': '状态',
    'tags.facet.category': '类别',
    'tags.facet.group': '分组',
    'tags.facet.tag': '标签',
    'tags.sort.label': '排序',
    'tags.sort.title': '标题 A–Z',
    'tags.sort.words': '字数：从多到少',
    'tags.sort.readMinutes': '阅读时间：从长到短',
    'tags.all': '全部',
    'tags.empty': '没有文章符合这些筛选条件。',

    'reader.loading': '正在加载文章…',
    'reader.meta.read': '分钟阅读',
    'reader.nav.prev': '← 上一篇',
    'reader.nav.next': '下一篇 →',
    'reader.nav.start': '已是第一篇',
    'reader.nav.end': '已是最后一篇',
    'reader.error.offline': '无法加载此文章，您可能处于离线状态或文章已移动。',

    'search.placeholder': '搜索图书馆…',
    'search.results.one': '找到 1 条结果。',
    'search.results.many': '找到 {count} 条结果。',
    'search.all': '全部文章 — 输入以筛选。',

    'settings.title': '阅读设置',
    'settings.lang': '语言',
    'settings.textSize': '字体大小',
    'settings.theme': '主题',
    'settings.lineWidth': '行宽',
    'settings.offline': '离线',
    'settings.saveOffline': '保存全部内容以供离线阅读',
    'settings.done': '完成',
    'settings.saving': '保存中…',
    'settings.saved': '已保存 ✓',
    'settings.saveFailed': '保存失败，请重试。',

    'aria.back': '返回图书馆',
    'aria.graph': '知识图谱',
    'aria.search': '搜索',
    'aria.settings': '阅读设置',
    'aria.closeSearch': '关闭搜索',
    'aria.closeGraph': '关闭图谱',

    'graph.loading': '正在绘制图书馆图谱…',
    'graph.error': '无法加载知识图谱。',
    'graph.title': '知识图谱',
    'graph.subtitle': '由文章、项目领域、标签、生命周期状态和明确语料关系构成的确定性地图。',
    'graph.freshness.atlas': '图谱日期 {date}',
    'graph.freshness.next': '下次复核 {date}',
    'graph.freshness.proofPack': '证据包 {status} {date}',
    'graph.search.placeholder': '聚焦 MLIP、Lean、资助、拓扑…',
    'graph.search.aria': '搜索图谱节点',
    'graph.mode.aria': '图谱模式',
    'graph.mode.overview': '概览',
    'graph.mode.topics': '主题',
    'graph.mode.lifecycle': '生命周期',
    'graph.mode.ontology': '本体',
    'graph.mode.local': '局部',
    'graph.relationFilters.aria': '关系筛选',
    'graph.relation.program': '项目',
    'graph.relation.contains': '包含',
    'graph.relation.tagged': '标签',
    'graph.relation.lifecycle': '生命周期',
    'graph.relation.grouped': '分组',
    'graph.relation.related': '相关',
    'graph.relation.co-topic': '共同主题',
    'graph.relation.isA': '属于',
    'graph.relation.partOf': '组成部分',
    'graph.relation.inheritsErrorFrom': '继承误差',
    'graph.relation.readinessJudgedBy': '就绪度判据',
    'graph.relation.chain.gatedBy': '链式门控',
    'graph.relation.markedAs': '标记为',
    'graph.relation.show': '显示{relation}关系',
    'graph.relation.hide': '隐藏{relation}关系',
    'graph.canvas.aria': '知识图谱地图',
    'graph.legend.article': '文章',
    'graph.legend.tag': '标签',
    'graph.legend.area': '领域',
    'graph.legend.status': '状态',
    'graph.stats.nodes': '节点',
    'graph.stats.links': '连接',
    'graph.stats.articles': '文章',
    'graph.stats.visible': '可见',
    'graph.meta.items': '项',
    'graph.meta.words': '字',
    'graph.inspector.selected': '已选择',
    'graph.epistemic.aria': '认识状态',
    'graph.epistemic.marker': '标记',
    'graph.epistemic.readiness': '就绪度',
    'graph.epistemic.confidence': '置信度',
    'graph.epistemic.asOf': '截至',
    'graph.readArticle': '阅读文章',
    'graph.relations': '关系',
    'graph.relations.empty': '暂无明确关系。',
    'graph.matches': '匹配项',
    'graph.scope': '图谱范围',
    'graph.scope.description': '此地图由目录元数据、标签、生命周期标记、分组和高置信度重叠生成。在提取层准备就绪前，不作隐藏的自然语言处理推断。',
  },
};

/**
 * Translate a key to the requested language, with optional variable substitution.
 * Falls back to English if the key is not available in the requested language.
 * @param {string} key
 * @param {string} [lang]
 * @param {Record<string, string|number>} [vars]
 * @returns {string}
 */
export function t(key, lang = DEFAULT_LANG, vars) {
  const l = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
  if (key && typeof key === 'object') {
    let str = key[l] || key[DEFAULT_LANG] || '';
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, String(v));
      }
    }
    return str;
  }
  let str = STRINGS[l]?.[key] || STRINGS[DEFAULT_LANG]?.[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, String(v));
    }
  }
  return str;
}

/**
 * Detect the user's preferred language from localStorage or navigator.
 * @returns {string}
 */
export function detectLang() {
  try {
    const saved = localStorage.getItem('ll.lang');
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;
  } catch { /* ignore */ }
  const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
  if (nav.startsWith('zh')) return 'zh';
  return DEFAULT_LANG;
}

/**
 * Persist the user's language choice.
 * @param {string} lang
 */
export function saveLang(lang) {
  try {
    localStorage.setItem('ll.lang', lang);
  } catch { /* ignore */ }
}
