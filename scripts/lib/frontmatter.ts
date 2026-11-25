/**
 * Minimal frontmatter reader for validation scripts. Supports the flat
 * `key: value` and `key: [a, b]` forms used in this repository; Astro's own
 * schema validation remains the source of truth at build time.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export interface Doc {
  path: string;
  data: Record<string, string | string[]>;
  body: string;
}

export function parseFrontmatter(text: string): { data: Record<string, string | string[]>; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(text);
  if (!m) return { data: {}, body: text };
  const data: Record<string, string | string[]> = {};
  for (const line of (m[1] ?? '').split(/\r?\n/)) {
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const key = kv[1] as string;
    let value = (kv[2] ?? '').trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      data[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      continue;
    }
    value = value.replace(/^["']|["']$/g, '');
    data[key] = value;
  }
  return { data, body: m[2] ?? '' };
}

export function walk(dir: string, ext = '.md'): string[] {
  const out: string[] = [];
  let names: string[] = [];
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of names) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, ext));
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

export function readDocs(dir: string, root = process.cwd()): Doc[] {
  return walk(dir).map((p) => {
    const { data, body } = parseFrontmatter(readFileSync(p, 'utf8'));
    return { path: relative(root, p).replaceAll('\\', '/'), data, body };
  });
}
