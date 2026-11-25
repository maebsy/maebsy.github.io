import { describe, expect, test } from 'bun:test';
import { PROJECTS, FEATURED } from '../../src/data/projects';
import { SKILLS } from '../../src/data/skills';
import { PERSON, TIMELINE } from '../../src/data/profile';
import { isVisible, factVisible } from '../../src/data/site';
import { LOCALES } from '../../src/i18n/locales';

describe('publication gate', () => {
  test('production shows only published content and verified facts', () => {
    expect(isVisible('published', 'production')).toBe(true);
    expect(isVisible('review', 'production')).toBe(false);
    expect(isVisible('draft', 'production')).toBe(false);
    expect(factVisible(false, 'production')).toBe(false);
  });
  test('preview adds review content and unverified facts, never drafts', () => {
    expect(isVisible('review', 'preview')).toBe(true);
    expect(isVisible('draft', 'preview')).toBe(false);
    expect(factVisible(false, 'preview')).toBe(true);
  });
});

describe('project facts', () => {
  test('ids are unique', () => {
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(PROJECTS.length);
  });
  test('2 to 4 featured projects', () => {
    expect(FEATURED.length).toBeGreaterThanOrEqual(2);
    expect(FEATURED.length).toBeLessThanOrEqual(4);
  });
  test.each(PROJECTS.map((p) => [p.id, p]))('%s points at a public maebsy repository with a short SHA', (_id, p) => {
    expect(p.repo).toMatch(/^https:\/\/github\.com\/maebsy\/[\w.-]+$/);
    expect(p.revision).toMatch(/^[0-9a-f]{7}$/);
    expect(p.period.start <= p.period.end).toBe(true);
    for (const l of LOCALES) expect(p.oneLiner[l].length).toBeGreaterThan(10);
  });
  test('verification entries record command, date and environment', () => {
    for (const p of PROJECTS) {
      for (const v of p.verification) {
        expect(v.command.length).toBeGreaterThan(3);
        expect(v.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(v.environment.length).toBeGreaterThan(2);
      }
    }
  });
});

describe('skills', () => {
  test('every skill links at least one piece of public evidence', () => {
    for (const s of SKILLS) {
      expect(s.evidence.length, s.id).toBeGreaterThan(0);
      for (const e of s.evidence) expect(e.url).toMatch(/^https:\/\/github\.com\/maebsy\//);
    }
  });
  test('no skill claims tools that no public repository uses yet', () => {
    const names = SKILLS.map((s) => s.name.en.toLowerCase()).join(' ');
    for (const unclaimed of ['airflow', 'dbt', 'spark', 'kafka', 'snowflake', 'bigquery']) {
      expect(names).not.toContain(unclaimed);
    }
  });
});

describe('profile', () => {
  test('verified facts have a source; unverified ones say what is missing', () => {
    for (const i of TIMELINE) {
      if (i.verified) expect(i.source, i.id).toBeTruthy();
      else expect(i.todo, i.id).toBeTruthy();
    }
  });
  test('only verified links are rendered and none are mailto', () => {
    for (const l of PERSON.links) expect(l.url.startsWith('mailto:')).toBe(false);
  });
});
