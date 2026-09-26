// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - MAPBOX GIS & NAVIGATION SERVICE
// Production Mapbox GL, Raster/Vector Tiles, Static Maps, Geocoding & Routing
// ============================================================================

export const MAPBOX_ACCESS_TOKEN =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env?.VITE_MAPBOX_API_KEY)) ||
  '';

export type MapboxStyleId =
  | 'dark'
  | 'streets'
  | 'satellite'
  | 'satellite-streets'
  | 'light'
  | 'navigation-night'
  | 'navigation-day'
  | 'traffic-day'
  | 'traffic-night';

export const MAPBOX_STYLES: Record<MapboxStyleId, string> = {
  dark: 'mapbox/dark-v11',
  streets: 'mapbox/streets-v12',
  satellite: 'mapbox/satellite-v9',
  'satellite-streets': 'mapbox/satellite-streets-v12',
  light: 'mapbox/light-v11',
  'navigation-night': 'mapbox/navigation-night-v1',
  'navigation-day': 'mapbox/navigation-day-v1',
  'traffic-day': 'mapbox/traffic-day-v2',
  'traffic-night': 'mapbox/traffic-night-v2',
};

/**
 * Generate Mapbox 256x256 / 512x512 Raster Tile URL
 * Compliant with Mapbox Styles API / Raster Tile service
 */
export function getMapboxRasterTileUrl(
  style: MapboxStyleId | string,
  z: number,
  x: number,
  y: number,
  options: { retina?: boolean; token?: string } = {}
): string {
  const token = options.token || MAPBOX_ACCESS_TOKEN;
  const retinaStr = options.retina !== false ? '@2x' : '';
  const fullStyle = (MAPBOX_STYLES as Record<string, string>)[style] || (style.includes('/') ? style : `mapbox/${style}`);

  return `https://api.mapbox.com/styles/v1/${fullStyle}/tiles/256/${z}/${x}/${y}${retinaStr}?access_token=${token}`;
}

/**
 * Generate Mapbox Static Map Image URL
 * Perfect for mobile app trip cards, route previews, and dispatch alerts
 */
export function getMapboxStaticMapUrl(params: {
  lng: number;
  lat: number;
  zoom: number;
  width: number;
  height: number;
  style?: MapboxStyleId;
  bearing?: number;
  pitch?: number;
  retina?: boolean;
  pinColor?: string;
  pinLabel?: string;
}): string {
  const {
    lng,
    lat,
    zoom,
    width,
    height,
    style = 'dark',
    bearing = 0,
    pitch = 0,
    retina = true,
  } = params;

  const fullStyle = MAPBOX_STYLES[style] || 'mapbox/dark-v11';
  const retinaStr = retina ? '@2x' : '';

  // Optional pin marker at target coordinates: pin-s-{label}+{color}({lng},{lat})
  const marker = params.pinColor
    ? `pin-s${params.pinLabel ? `-${params.pinLabel}` : ''}+${params.pinColor.replace('#', '')}(${lng},${lat})/`
    : '';

  return `https://api.mapbox.com/styles/v1/${fullStyle}/static/${marker}${lng},${lat},${zoom},${bearing},${pitch}/${width}x${height}${retinaStr}?access_token=${MAPBOX_ACCESS_TOKEN}`;
}

/**
 * Mapbox Geocoding forward search
 */
export async function searchMapboxAddress(
  query: string,
  proximityLngLat?: [number, number]
): Promise<Array<{ id: string; place_name: string; center: [number, number] }>> {
  try {
    const proximity = proximityLngLat ? `&proximity=${proximityLngLat[0]},${proximityLngLat[1]}` : '&proximity=73.8567,18.5204'; // Default to Pune
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=IN${proximity}&limit=5`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.features.map((f: any) => ({
      id: f.id,
      place_name: f.place_name,
      center: f.center,
    }));
  } catch {
    return [];
  }
}

/**
 * Mapbox Directions API route computation
 */
export async function getMapboxDirections(
  coordinates: Array<[number, number]>, // [[lng, lat], ...]
  profile: 'driving-traffic' | 'driving' = 'driving-traffic'
): Promise<{ distanceKm: number; durationMin: number; geometry?: any } | null> {
  if (coordinates.length < 2) return null;
  try {
    const coordsStr = coordinates.map((c) => `${c[0]},${c[1]}`).join(';');
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordsStr}?access_token=${MAPBOX_ACCESS_TOKEN}&geometries=geojson&overview=full`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.routes || data.routes.length === 0) return null;
    const primary = data.routes[0];
    return {
      distanceKm: Math.round((primary.distance / 1000) * 10) / 10,
      durationMin: Math.round(primary.duration / 60),
      geometry: primary.geometry,
    };
  } catch {
    return null;
  }
}
