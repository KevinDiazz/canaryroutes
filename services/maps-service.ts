/**
 * Servicio para generar URLs de Google Maps con waypoints
 * Obtiene la ubicación actual del usuario como origen
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Obtiene la ubicación actual del usuario
 */
export function getCurrentLocation(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation no está disponible en este navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        reject(new Error(`Error de ubicación: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Genera una URL de Google Maps con waypoints cargados
 */
export function generateMapsUrl(items: LatLng[], userLocation: LatLng | null = null): string | null {
  if (!items || items.length === 0) {
    return null;
  }

  const origin = userLocation || items[0];
  const destination = items[items.length - 1];
  const waypoints = items.slice(0, -1);

  let url = 'https://www.google.com/maps/dir/?api=1';
  url += `&origin=${origin.lat},${origin.lng}`;
  url += `&destination=${destination.lat},${destination.lng}`;

  if (waypoints.length > 0) {
    const waypointStr = waypoints.map((wp) => `${wp.lat},${wp.lng}`).join('|');
    url += `&waypoints=${waypointStr}`;
  }

  url += '&travelmode=driving';
  return url;
}

/**
 * Abre Google Maps con la ubicación actual del usuario
 */
export async function openMapsFromCurrentLocation(items: LatLng[]): Promise<void> {
  if (!items || items.length === 0) {
    throw new Error('No hay POIs para mostrar en Maps');
  }

  let userLocation: LatLng | null = null;

  try {
    userLocation = await getCurrentLocation();
  } catch (geoError) {
    console.warn('Geolocation no disponible:', geoError);
  }

  const url = generateMapsUrl(items, userLocation);
  if (!url) {
    throw new Error('No se pudo generar URL de Maps');
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Copia la URL al portapapeles
 */
export async function copyUrlToClipboard(url: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (err) {
    console.error('Error copiando al portapapeles:', err);
    return false;
  }
}

/**
 * Abre Google Maps en una nueva pestaña
 */
export function openMapsInNewTab(items: LatLng[]): void {
  const url = generateMapsUrl(items);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
