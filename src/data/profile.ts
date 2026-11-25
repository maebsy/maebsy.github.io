/**
 * Shared, locale-independent facts about the site owner.
 *
 * Rules (see docs/content-guide.md):
 * - `verified: true` only after the owner confirmed the fact AND a public
 *   source exists (repository, official page) or the owner approved it.
 * - Unverified facts render only in preview builds, marked "Unverified".
 * - Never put private contact details here until the owner approves them.
 */
import type { Locale } from '../i18n/locales';

export type Localized = Record<Locale, string>;

export interface Fact {
  verified: boolean;
  /** Where the fact can be checked. Required when verified. */
  source?: string;
  /** Why it is still unverified (shown only in the private checklist). */
  todo?: string;
}

export interface Person {
  handle: string;
  /** Public display name per locale. Empty until the owner confirms spelling. */
  name: Partial<Localized>;
  nameFact: Fact;
  location: Localized;
  locationFact: Fact;
  links: { label: string; url: string; verified: boolean }[];
}

export const PERSON: Person = {
  handle: 'maebsy',
  name: {},
  nameFact: { verified: false, todo: 'Confirm public name in EN / JA (katakana or kanji) / KO.' },
  location: { en: 'Seoul, South Korea', ja: '韓国・ソウル', ko: '서울' },
  locationFact: { verified: true, source: 'GitHub profile location field' },
  links: [
    { label: 'GitHub', url: 'https://github.com/maebsy', verified: true },
    // { label: 'LinkedIn', url: '', verified: false },  // add after the owner shares the URL
    // { label: 'Zenn', url: 'https://zenn.dev/<id>', verified: false },
  ],
};

export interface TimelineItem extends Fact {
  id: string;
  kind: 'education' | 'activity';
  start?: string; // YYYY-MM, omitted when not yet confirmed
  end?: string; // YYYY-MM, omitted when ongoing or unconfirmed
  title: Localized;
  org: Localized;
  detail?: Localized;
  link?: string;
}

export const TIMELINE: TimelineItem[] = [
  // Education is added here only after the owner confirms official names and dates
  // (kept in the private evidence ledger until then; never commit unverified entries).
  {
    id: 'codyssey-hackathon-2026',
    kind: 'activity',
    start: '2026-10',
    end: '2026-11',
    title: {
      en: 'Codyssey AI Hackathon 2026: built "72hours" with a team of five',
      ja: 'コディセイ AI ハッカソン 2026：5名チームで「72hours」を開発',
      ko: '코디세이 AI 해커톤 2026: 5인 팀으로 「72hours」 개발',
    },
    org: {
      en: 'Innovation Academy (Oct 30 – Nov 2, 2026)',
      ja: 'イノベーションアカデミー（2026年10月30日〜11月2日）',
      ko: '이노베이션아카데미 (2026.10.30 ~ 11.02)',
    },
    link: 'https://github.com/maebsy/YMCA-hackathon-2026',
    verified: true,
    source: 'YMCA-hackathon-2026 README (event name and dates), merged PRs',
  },
];
