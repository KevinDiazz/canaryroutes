// SEO copy per category, language and island
export type SeoCopy = { h1: string; description: string };
export const CATEGORY_SEO: Record<string, Record<string, Record<string, SeoCopy>>> = {
  playas: {
    es: {
      'gran-canaria': { h1: 'Playas de Gran Canaria', description: 'Descubre las mejores playas de Gran Canaria: desde las dunas de Maspalomas hasta las calas escondidas del norte. Planifica tu ruta costera con CanaryRoutes.' },
      tenerife: { h1: 'Playas de Tenerife', description: 'Explora las playas mas bonitas de Tenerife, con arenas negras volcanicas y aguas cristalinas. Crea tu itinerario playero con CanaryRoutes.' },
    },
    en: {
      'gran-canaria': { h1: 'Beaches of Gran Canaria', description: 'Discover the best beaches in Gran Canaria: from the Maspalomas dunes to hidden coves in the north. Plan your coastal route with CanaryRoutes.' },
      tenerife: { h1: 'Beaches of Tenerife', description: 'Explore the most beautiful beaches in Tenerife, with black volcanic sands and crystal-clear waters. Build your beach itinerary with CanaryRoutes.' },
    },
    de: {
      'gran-canaria': { h1: 'Straende auf Gran Canaria', description: 'Entdecke die schoensten Straende Gran Canarias: von den Duenen von Maspalomas bis zu versteckten Buchten im Norden. Plane deine Kuestenroute mit CanaryRoutes.' },
      tenerife: { h1: 'Straende auf Teneriffa', description: 'Erkunde die schoensten Straende Teneriffas mit schwarzem Vulkansand und kristallklarem Wasser. Erstelle deine Strand-Route mit CanaryRoutes.' },
    },
  },
  senderos: {
    es: {
      'gran-canaria': { h1: 'Senderos de Gran Canaria', description: 'Rutas de senderismo en Gran Canaria: barrancos, cumbres y paisajes unicos. Planifica tu trekking con CanaryRoutes.' },
      tenerife: { h1: 'Senderos de Tenerife', description: 'Senderismo en Tenerife: desde el Teide hasta los bosques de laurisilva. Descubre las mejores rutas con CanaryRoutes.' },
    },
    en: {
      'gran-canaria': { h1: 'Hiking trails in Gran Canaria', description: 'Hiking routes in Gran Canaria: ravines, mountain peaks and unique landscapes. Plan your trekking with CanaryRoutes.' },
      tenerife: { h1: 'Hiking trails in Tenerife', description: 'Hiking in Tenerife: from Mount Teide to laurel forests. Discover the best trails with CanaryRoutes.' },
    },
    de: {
      'gran-canaria': { h1: 'Wanderwege auf Gran Canaria', description: 'Wanderrouten auf Gran Canaria: Schluchten, Berggipfel und einzigartige Landschaften. Plane deine Trekkingtour mit CanaryRoutes.' },
      tenerife: { h1: 'Wanderwege auf Teneriffa', description: 'Wandern auf Teneriffa: vom Teide bis zu den Lorbeerwaeldern. Entdecke die besten Routen mit CanaryRoutes.' },
    },
  },
  cultura: {
    es: {
      'gran-canaria': { h1: 'Cultura en Gran Canaria', description: 'Museos, cascos historicos y patrimonio cultural de Gran Canaria. Disena tu ruta cultural con CanaryRoutes.' },
      tenerife: { h1: 'Cultura en Tenerife', description: 'Arte, historia y tradiciones de Tenerife. Explora el patrimonio de la isla con CanaryRoutes.' },
    },
    en: {
      'gran-canaria': { h1: 'Culture in Gran Canaria', description: 'Museums, historic centers and cultural heritage of Gran Canaria. Design your cultural route with CanaryRoutes.' },
      tenerife: { h1: 'Culture in Tenerife', description: 'Art, history and traditions of Tenerife. Explore the island heritage with CanaryRoutes.' },
    },
    de: {
      'gran-canaria': { h1: 'Kultur auf Gran Canaria', description: 'Museen, historische Altstaedte und kulturelles Erbe Gran Canarias. Gestalte deine Kulturroute mit CanaryRoutes.' },
      tenerife: { h1: 'Kultur auf Teneriffa', description: 'Kunst, Geschichte und Traditionen Teneriffas. Entdecke das Kulturerbe der Insel mit CanaryRoutes.' },
    },
  },
  naturaleza: {
    es: {
      'gran-canaria': { h1: 'Naturaleza en Gran Canaria', description: 'Reservas naturales, dunas, bosques y espacios protegidos de Gran Canaria. Conectate con la naturaleza con CanaryRoutes.' },
      tenerife: { h1: 'Naturaleza en Tenerife', description: 'Parques naturales, volcanes y biodiversidad unica de Tenerife. Explora la naturaleza canaria con CanaryRoutes.' },
    },
    en: {
      'gran-canaria': { h1: 'Nature in Gran Canaria', description: 'Nature reserves, dunes, forests and protected areas of Gran Canaria. Connect with nature using CanaryRoutes.' },
      tenerife: { h1: 'Nature in Tenerife', description: 'Natural parks, volcanoes and unique biodiversity of Tenerife. Explore Canarian nature with CanaryRoutes.' },
    },
    de: {
      'gran-canaria': { h1: 'Natur auf Gran Canaria', description: 'Naturschutzgebiete, Duenen, Waelder und geschuetzte Bereiche Gran Canarias. Erlebe die Natur mit CanaryRoutes.' },
      tenerife: { h1: 'Natur auf Teneriffa', description: 'Naturparks, Vulkane und einzigartige Artenvielfalt Teneriffas. Entdecke die kanarische Natur mit CanaryRoutes.' },
    },
  },
  actividades: {
    es: {
      'gran-canaria': { h1: 'Actividades en Gran Canaria', description: 'Miradores, gastronomia y actividades al aire libre en Gran Canaria. Organiza tu aventura con CanaryRoutes.' },
      tenerife: { h1: 'Actividades en Tenerife', description: 'Gastronomia local, miradores y experiencias unicas en Tenerife. Planifica tu viaje con CanaryRoutes.' },
    },
    en: {
      'gran-canaria': { h1: 'Activities in Gran Canaria', description: 'Viewpoints, gastronomy and outdoor activities in Gran Canaria. Organise your adventure with CanaryRoutes.' },
      tenerife: { h1: 'Activities in Tenerife', description: 'Local gastronomy, viewpoints and unique experiences in Tenerife. Plan your trip with CanaryRoutes.' },
    },
    de: {
      'gran-canaria': { h1: 'Aktivitaeten auf Gran Canaria', description: 'Aussichtspunkte, Gastronomie und Outdoor-Aktivitaeten auf Gran Canaria. Organisiere dein Abenteuer mit CanaryRoutes.' },
      tenerife: { h1: 'Aktivitaeten auf Teneriffa', description: 'Lokale Gastronomie, Aussichtspunkte und einzigartige Erlebnisse auf Teneriffa. Plane deine Reise mit CanaryRoutes.' },
    },
  },
  transporte: {
    es: {
      'gran-canaria': { h1: 'Cómo moverse por Gran Canaria', description: 'Guaguas, ferries, alquiler de coche y tranvía en Gran Canaria. Todo lo que necesitas para moverte por la isla con CanaryRoutes.' },
      tenerife: { h1: 'Cómo moverse por Tenerife', description: 'Tranvía, guaguas TITSA, ferries y alquiler de coche en Tenerife. Descubre la mejor forma de explorar la isla con CanaryRoutes.' },
    },
    en: {
      'gran-canaria': { h1: 'Getting around Gran Canaria', description: 'Buses, ferries, car rental and tram in Gran Canaria. Everything you need to get around the island with CanaryRoutes.' },
      tenerife: { h1: 'Getting around Tenerife', description: 'Tram, TITSA buses, ferries and car rental in Tenerife. Find the best way to explore the island with CanaryRoutes.' },
    },
    de: {
      'gran-canaria': { h1: 'Fortbewegung auf Gran Canaria', description: 'Busse, Faehren, Mietwagen und Strassenbahn auf Gran Canaria. Alles, was du brauchst, um die Insel zu erkunden — mit CanaryRoutes.' },
      tenerife: { h1: 'Fortbewegung auf Teneriffa', description: 'Strassenbahn, TITSA-Busse, Faehren und Mietwagen auf Teneriffa. Entdecke die beste Art, die Insel zu erkunden — mit CanaryRoutes.' },
    },
  },
  top: {
    es: {
      'gran-canaria': { h1: 'Lo mejor de Gran Canaria', description: 'Los lugares imprescindibles de Gran Canaria seleccionados por CanaryRoutes. No te pierdas ninguno.' },
      tenerife: { h1: 'Lo mejor de Tenerife', description: 'Los rincones imprescindibles de Tenerife segun CanaryRoutes. Crea tu lista de favoritos.' },
    },
    en: {
      'gran-canaria': { h1: 'Best of Gran Canaria', description: 'The must-see places in Gran Canaria selected by CanaryRoutes. Do not miss a single one.' },
      tenerife: { h1: 'Best of Tenerife', description: 'The must-see spots in Tenerife according to CanaryRoutes. Build your favourites list.' },
    },
    de: {
      'gran-canaria': { h1: 'Das Beste von Gran Canaria', description: 'Die Highlights Gran Canarias, ausgewaehlt von CanaryRoutes. Verpasse keinen einzigen.' },
      tenerife: { h1: 'Das Beste von Teneriffa', description: 'Die Highlights Teneriffas laut CanaryRoutes. Erstelle deine Favoritenliste.' },
    },
  },
};
