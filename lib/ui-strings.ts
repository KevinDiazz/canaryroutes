import type { Locale } from './types';

const strings = {
  es: {
    chips: {
      beach:       'Playas',
      hiking:      'Senderos',
      culture:     'Cultura',
      activities:  'Actividades',
      nature:      'Naturaleza',
      municipios:  'Municipios',
      top:         'Top',
    },
    sheet: {
      read:        'LEER',
      close:       'CERRAR',
      openMaps:    'Abrir Maps',
      inRoute:     '✓ En tu ruta',
      addRoute:    'Mi Ruta',
      viewTrail:   'VER RECORRIDO',
      bookExperience: 'Reserva esta experiencia',
      book:        'RESERVAR',
    },
    cart: {
      title:       'Mi Ruta',
      empty:       'Tu ruta está vacía',
      emptyHint:   'Toca un punto en el mapa\npara añadirlo aquí',
      loading:     'Cargando...',
      openMaps:    'Abrir en Google Maps',
      stop:        'parada',
      stops:       'paradas',
    },
  },
  en: {
    chips: {
      beach:       'Beaches',
      hiking:      'Trails',
      culture:     'Culture',
      activities:  'Activities',
      nature:      'Nature',
      municipios:  'Towns',
      top:         'Top',
    },
    sheet: {
      read:        'READ',
      close:       'CLOSE',
      openMaps:    'Open Maps',
      inRoute:     '✓ In your route',
      addRoute:    'My Route',
      viewTrail:   'VIEW TRAIL',
      bookExperience: 'Book this experience',
      book:        'BOOK NOW',
    },
    cart: {
      title:       'My Route',
      empty:       'Your route is empty',
      emptyHint:   'Tap a point on the map\nto add it here',
      loading:     'Loading...',
      openMaps:    'Open in Google Maps',
      stop:        'stop',
      stops:       'stops',
    },
  },
  de: {
    chips: {
      beach:       'Strände',
      hiking:      'Wanderwege',
      culture:     'Kultur',
      activities:  'Aktivitäten',
      nature:      'Natur',
      municipios:  'Gemeinden',
      top:         'Top',
    },
    sheet: {
      read:        'LESEN',
      close:       'SCHLIESSEN',
      openMaps:    'Maps öffnen',
      inRoute:     '✓ In deiner Route',
      addRoute:    'Meine Route',
      viewTrail:   'STRECKE',
      bookExperience: 'Dieses Erlebnis buchen',
      book:        'JETZT BUCHEN',
    },
    cart: {
      title:       'Meine Route',
      empty:       'Deine Route ist leer',
      emptyHint:   'Tippe einen Punkt auf der Karte\num ihn hinzuzufügen',
      loading:     'Lädt...',
      openMaps:    'In Google Maps öffnen',
      stop:        'Halt',
      stops:       'Halte',
    },
  },
} satisfies Record<Locale, typeof strings['es']>;

export function useUiStrings(locale: Locale) {
  return strings[locale] ?? strings['en'];
}
