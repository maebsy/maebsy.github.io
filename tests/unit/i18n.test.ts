import { describe, expect, test } from 'bun:test';
import { UI, t } from '../../src/i18n/ui';
import { LOCALES, localizePath, splitLocale, langParam, localeFromParam, formatDate, formatMonth } from '../../src/i18n/locales';

describe('UI dictionary', () => {
  const enKeys = Object.keys(UI.en).sort();

  test.each(LOCALES.map((l) => [l]))('%s has exactly the English keys', (locale) => {
    expect(Object.keys(UI[locale]).sort()).toEqual(enKeys);
  });

  test.each(LOCALES.map((l) => [l]))('%s has no empty strings', (locale) => {
    for (const [k, v] of Object.entries(UI[locale])) expect(v.trim(), k).not.toBe('');
  });

  test('placeholders are kept in every locale', () => {
    for (const [k, v] of Object.entries(UI.en)) {
      const vars = v.match(/\{\w+\}/g) ?? [];
      for (const l of LOCALES) for (const p of vars) expect(UI[l][k as keyof typeof UI.en], `${l}:${k}`).toContain(p);
    }
  });

  test('Japanese strings use full-width punctuation, not ASCII sentence endings', () => {
    for (const [k, v] of Object.entries(UI.ja)) {
      expect(v, k).not.toMatch(/[ぁ-んァ-ン一-龥]\. /);
      expect(v, k).not.toMatch(/[ぁ-んァ-ン一-龥],/);
    }
  });

  test('t() interpolates', () => {
    expect(t('ja', 'project.teamOf', { n: 5 })).toBe('チーム開発（5名）');
  });
});

describe('locale URLs', () => {
  test('English is unprefixed, others are prefixed, trailing slash always', () => {
    expect(localizePath('en')).toBe('/');
    expect(localizePath('ja')).toBe('/ja/');
    expect(localizePath('en', 'projects/ai-gitgen')).toBe('/projects/ai-gitgen/');
    expect(localizePath('ko', '/projects/ai-gitgen/')).toBe('/ko/projects/ai-gitgen/');
  });

  test('splitLocale is the inverse of localizePath', () => {
    for (const l of LOCALES) {
      for (const p of ['', 'about', 'projects/72hours']) {
        expect(splitLocale(localizePath(l, p))).toEqual({ locale: l, path: p });
      }
    }
  });

  test('rest param mapping', () => {
    expect(langParam('en')).toBeUndefined();
    expect(langParam('ja')).toBe('ja');
    expect(localeFromParam(undefined)).toBe('en');
    expect(localeFromParam('ko')).toBe('ko');
    expect(() => localeFromParam('fr')).toThrow();
  });

  test('date formats', () => {
    const d = new Date('2026-11-25');
    expect(formatDate(d, 'ja')).toBe('2026.11.25');
    expect(formatDate(d, 'ko')).toBe('2026.11.25');
    expect(formatDate(d, 'en')).toBe('Nov 25, 2026');
    expect(formatMonth('2026-10')).toBe('2026.10');
  });
});
