import type { Locale } from './types';

type UiStringGroup = Record<string, string>;

interface UiStrings {
  chips: UiStringGroup;
  sheet: UiStringGroup;
  cart: UiStringGroup;
  credits: UiStringGroup;
}

const strings: Record<Locale, UiStrings> = {
  es: {
    chips: {
      beach:       'Playas',
      hiking:      'Senderos',
      culture:     'Cultura',
      activities:  'Actividades',
      nature:      'Naturaleza',
      transport:   'Transporte',
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
      tapToOpen:   'Toca una parada para abrir en Maps',
    },
    credits: {
      title:        '📷 Créditos fotográficos',
      images:        'Imágenes',
      work:          'Obra',
      author:        'Autor',
      source:        'Fuente',
      sourceLink:    'Fuente original',
      license:       'Licencia',
      licenseLink:   'Licencia',
      modificationsLabel: 'Modificaciones',
      modifications: 'Imagen optimizada para web',
      ownNotice:     'Imagen propia de CanaryRoutes',
    },
  },
  en: {
    chips: {
      beach:       'Beaches',
      hiking:      'Trails',
      culture:     'Culture',
      activities:  'Activities',
      nature:      'Nature',
      transport:   'Transport',
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
      tapToOpen:   'Tap a stop to open in Maps',
    },
    credits: {
      title:        '📷 Photo credits',
      images:        'Images',
      work:          'Work',
      author:        'Author',
      source:        'Source',
      sourceLink:    'Original source',
      license:       'License',
      licenseLink:   'License',
      modificationsLabel: 'Modifications',
      modifications: 'Image optimized for web',
      ownNotice:     'Original CanaryRoutes photo',
    },
  },
  de: {
    chips: {
      beach:       'Strände',
      hiking:      'Wanderwege',
      culture:     'Kultur',
      activities:  'Aktivitäten',
      nature:      'Natur',
      transport:   'Transport',
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
      tapToOpen:   'Halte antippen, um Maps zu öffnen',
    },
    credits: {
      title:        '📷 Bildnachweise',
      images:        'Bilder',
      work:          'Werk',
      author:        'Autor',
      source:        'Quelle',
      sourceLink:    'Originalquelle',
      license:       'Lizenz',
      licenseLink:   'Lizenz',
      modificationsLabel: 'Änderungen',
      modifications: 'Für das Web optimiertes Bild',
      ownNotice:     'Eigenes Foto von CanaryRoutes',
    },
  },
};

export function useUiStrings(locale: Locale) {
  return strings[locale] ?? strings['en'];
}
