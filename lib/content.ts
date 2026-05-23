import { type Locale, type Island, type POI, type Route, type Section, type Municipio } from './types';
import path from 'path';
import fs from 'fs';

const contentDir = path.join(process.cwd(), 'content');

export function getPOIs(locale: Locale, island: Island): POI[] {
  try {
    const filePath = path.join(contentDir, locale, island, 'pois.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw).pois as POI[];
  } catch {
    // Fallback to 'en' if locale file doesn't exist yet
    try {
      const filePath = path.join(contentDir, 'en', island, 'pois.json');
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw).pois as POI[];
    } catch {
      return [];
    }
  }
}

export function getPOI(locale: Locale, island: Island, slug: string): POI | undefined {
  return getPOIs(locale, island).find((p) => p.slug === slug);
}

export function getRoutes(locale: Locale, island: Island): Route[] {
  try {
    const filePath = path.join(contentDir, locale, island, 'routes.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw).routes as Route[];
  } catch {
    try {
      const filePath = path.join(contentDir, 'en', island, 'routes.json');
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw).routes as Route[];
    } catch {
      return [];
    }
  }
}

export function getRoute(locale: Locale, island: Island, slug: string): Route | undefined {
  return getRoutes(locale, island).find((r) => r.slug === slug);
}

export function getAllPOISlugs(island: Island): string[] {
  try {
    const filePath = path.join(contentDir, 'en', island, 'pois.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    return (JSON.parse(raw).pois as POI[]).map((p) => p.slug);
  } catch {
    return [];
  }
}

export function getSections(locale: Locale, island: Island): Section[] {
  try {
    const filePath = path.join(contentDir, locale, island, 'pois.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw).sections as Section[] ?? [];
  } catch {
    try {
      const filePath = path.join(contentDir, 'es', island, 'pois.json');
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw).sections as Section[] ?? [];
    } catch {
      return [];
    }
  }
}

export function getMunicipios(island: Island): Municipio[] {
  try {
    const filePath = path.join(contentDir, 'en', island, 'pois.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw).municipios as Municipio[] ?? [];
  } catch {
    return [];
  }
}

export function getAllRouteSlugs(island: Island): string[] {
  try {
    const filePath = path.join(contentDir, 'en', island, 'routes.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    return (JSON.parse(raw).routes as Route[]).map((r) => r.slug);
  } catch {
    return [];
  }
}
