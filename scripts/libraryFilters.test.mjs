import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { t } from '../src/i18n.js';

import {
  buildTagIndex,
  filterAndSortArticles,
  parseLibraryHash,
  serializeLibraryHash,
} from '../src/libraryFilters.js';

const sourceManifest = JSON.parse(
  fs.readFileSync(new URL('../content/latest/manifest.json', import.meta.url), 'utf8'),
);
const articles = sourceManifest.catalog.entries;
const appSource = fs.readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const stylesSource = fs.readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('buildTagIndex returns all manifest tags with reconciled article counts', () => {
  const index = buildTagIndex(articles);
  const rawMentions = articles.reduce((total, article) => total + (article.tags || []).length, 0);

  assert.equal(index.length, 178);
  assert.equal(index.reduce((total, item) => total + item.count, 0), rawMentions);
  assert.deepEqual(index, [...index].sort((a, b) => a.tag.localeCompare(b.tag)));
  for (const item of index) {
    assert.equal(item.count, articles.filter((article) => article.tags?.includes(item.tag)).length);
  }
});

test('library hash state round-trips compound facets and sort', () => {
  const hash = serializeLibraryHash({
    status: 'supported',
    category: 'validation',
    group: 'mlip-flywheel',
    tag: 'error geometry',
    sort: 'readMinutes',
  });

  assert.equal(
    hash,
    '#/tags?status=supported&category=validation&group=mlip-flywheel&tag=error+geometry&sort=readMinutes',
  );
  assert.deepEqual(parseLibraryHash(hash), {
    status: 'supported',
    category: 'validation',
    group: 'mlip-flywheel',
    tag: 'error geometry',
    sort: 'readMinutes',
  });
});

test('library hash state ignores unsupported parameters and sort values', () => {
  assert.deepEqual(parseLibraryHash('#/tags?sort=newest&unknown=value'), {
    status: '',
    category: '',
    group: '',
    tag: '',
    sort: 'title',
  });
});

test('compound facets intersect status, category, group, and tag', () => {
  const matching = filterAndSortArticles(articles, {
    status: 'supported',
    category: 'conjectures',
    group: 'hypotheses',
    tag: 'hyper-ribbon',
    sort: 'title',
  });

  assert.ok(matching.length > 0);
  assert.ok(matching.every((article) => article.status === 'supported'));
  assert.ok(matching.every((article) => article.category === 'conjectures'));
  assert.ok(matching.every((article) => article.group === 'hypotheses'));
  assert.ok(matching.every((article) => article.tags.includes('hyper-ribbon')));
});

test('article sorting supports localized title, words, and read minutes without mutation', () => {
  const sample = [
    { id: 'c', title: { en: 'Gamma', zh: '阿尔法' }, words: 300, readMinutes: 2 },
    { id: 'a', title: { en: 'Alpha', zh: '伽马' }, words: 100, readMinutes: 3 },
    { id: 'b', title: { en: 'Beta', zh: '贝塔' }, words: 200, readMinutes: 1 },
  ];

  assert.deepEqual(filterAndSortArticles(sample, { sort: 'title' }).map((a) => a.id), ['a', 'b', 'c']);
  assert.deepEqual(filterAndSortArticles(sample, { sort: 'title' }, 'zh').map((a) => a.id), ['c', 'b', 'a']);
  assert.deepEqual(filterAndSortArticles(sample, { sort: 'words' }).map((a) => a.id), ['c', 'b', 'a']);
  assert.deepEqual(filterAndSortArticles(sample, { sort: 'readMinutes' }).map((a) => a.id), ['a', 'c', 'b']);
  assert.deepEqual(sample.map((a) => a.id), ['c', 'a', 'b']);
});

test('tag browser chrome and savings-stack group are translated in English and Chinese', () => {
  const keys = [
    'tags.title',
    'tags.subtitle',
    'tags.index',
    'tags.results.one',
    'tags.results',
    'tags.clear',
    'tags.facet.status',
    'tags.facet.category',
    'tags.facet.group',
    'tags.facet.tag',
    'tags.sort.label',
    'tags.sort.title',
    'tags.sort.words',
    'tags.sort.readMinutes',
    'tags.all',
    'tags.empty',
    'group.savings-stack',
  ];

  for (const lang of ['en', 'zh']) {
    for (const key of keys) assert.notEqual(t(key, lang), key, `${lang} is missing ${key}`);
  }
  assert.equal(t('tags.results.one', 'en'), '1 article');
});

test('SPA wires the tags route to accessible compound controls and responsive tag links', () => {
  assert.match(appSource, /from '.\/libraryFilters\.js'/);
  assert.match(appSource, /path === 'tags'/);
  assert.match(appSource, /class: 'facet-controls'/);
  assert.match(appSource, /class: 'tag-index'/);
  assert.match(appSource, /tags\.results\.one/);
  assert.match(appSource, /serializeLibraryHash/);
  assert.match(stylesSource, /\.facet-controls/);
  assert.match(stylesSource, /\.tag-index/);
  assert.match(stylesSource, /min-width:\s*0/);
});
