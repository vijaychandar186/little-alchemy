import v1Json from '@/data/combinations_v1.json';
import v2Json from '@/data/combinations_v2.json';
import iconMapJson from '@/data/iconMap.json';
import type { Combos, Version } from './types';

export const v1Data = v1Json as Combos;
export const v2Data = v2Json as Combos;
const icons = iconMapJson as Record<string, number>;

export function normalize(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export function getIconNum(name: string) {
  return icons[normalize(name)] ?? null;
}

export function getStarters(data: Combos): string[] {
  const explicit = Object.keys(data).filter((k) => data[k].length === 0);
  const allKeys = new Set(Object.keys(data).map((k) => k.toLowerCase()));
  const ingredients = new Set<string>();
  for (const recipes of Object.values(data))
    for (const [a, b] of recipes) {
      ingredients.add(a.toLowerCase());
      ingredients.add(b.toLowerCase());
    }
  const implicit = [...ingredients]
    .filter((i) => !allKeys.has(i))
    .map((i) => i.charAt(0).toUpperCase() + i.slice(1));
  return [...explicit, ...implicit].sort((a, b) => a.localeCompare(b));
}

export function buildLookup(data: Combos) {
  const map = new Map<string, string>();
  for (const [result, recipes] of Object.entries(data))
    for (const [a, b] of recipes) {
      const key = [a.toLowerCase(), b.toLowerCase()].sort().join('|');
      if (!map.has(key)) map.set(key, result);
    }
  return map;
}

const STORAGE_KEY = 'la_state_v2';

export function loadState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? (JSON.parse(raw) as { version: Version; v1: string[]; v2: string[] })
      : null;
  } catch {
    return null;
  }
}

export function saveState(version: Version, v1: string[], v2: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version, v1, v2 }));
  } catch {}
}
