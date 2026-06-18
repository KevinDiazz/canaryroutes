// Mapping between URL slugs (Spanish, SEO-friendly) and internal filter IDs
export const CATEGORY_URL_TO_FILTER: Record<string, string> = {
  'playas':      'beach',
  'senderos':    'hiking',
  'cultura':     'culture',
  'naturaleza':  'nature',
  'actividades': 'activities',
  'transporte':  'transport',
  'top':         'top',
};

export const FILTER_TO_CATEGORY_URL: Record<string, string> = {
  'beach':       'playas',
  'hiking':      'senderos',
  'culture':     'cultura',
  'nature':      'naturaleza',
  'activities':  'actividades',
  'transport':   'transporte',
  'top':         'top',
};

export const CATEGORY_LABELS: Record<string, string> = {
  'playas':      'Playas',
  'senderos':    'Senderos',
  'cultura':     'Cultura',
  'naturaleza':  'Naturaleza',
  'actividades': 'Actividades',
  'transporte':  'Transporte',
  'top':         'Top',
};

export const ALL_CATEGORY_SLUGS = Object.keys(CATEGORY_URL_TO_FILTER);

// Maps a POI category to its URL slug (viewpoint/food/other → actividades)
export const POI_CATEGORY_TO_SLUG: Record<string, string> = {
  beach:     'playas',
  hiking:    'senderos',
  culture:   'cultura',
  nature:    'naturaleza',
  viewpoint: 'actividades',
  food:      'actividades',
  other:     'actividades',
  transport: 'transporte',
};
