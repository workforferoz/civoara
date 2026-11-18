import { createClient } from "@/lib/supabase/client";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface WardBoundary {
  id: string;
  wardNumber: string;
  name: string;
  city: string;
  center: GeoPoint;
  polygon: [number, number][]; // [lat, lng] array forming closed polygon
}

/**
 * Standard Demo Municipal Wards (Bengaluru)
 * Defined as closed boundary polygons [lat, lng]
 */
export const DEMO_WARDS: WardBoundary[] = [
  {
    id: "a1010000-0000-0000-0000-000000000101",
    wardNumber: "WARD-101",
    name: "Central Business District",
    city: "Bengaluru",
    center: { lat: 12.9716, lng: 77.5946 },
    polygon: [
      [12.965, 77.585],
      [12.98, 77.585],
      [12.98, 77.605],
      [12.965, 77.605],
      [12.965, 77.585],
    ],
  },
  {
    id: "a1020000-0000-0000-0000-000000000102",
    wardNumber: "WARD-102",
    name: "Indiranagar",
    city: "Bengaluru",
    center: { lat: 12.9784, lng: 77.6408 },
    polygon: [
      [12.968, 77.625],
      [12.988, 77.625],
      [12.988, 77.655],
      [12.968, 77.655],
      [12.968, 77.625],
    ],
  },
  {
    id: "a1030000-0000-0000-0000-000000000103",
    wardNumber: "WARD-103",
    name: "Koramangala",
    city: "Bengaluru",
    center: { lat: 12.9352, lng: 77.6245 },
    polygon: [
      [12.92, 77.61],
      [12.945, 77.61],
      [12.945, 77.64],
      [12.92, 77.64],
      [12.92, 77.61],
    ],
  },
  {
    id: "a1040000-0000-0000-0000-000000000104",
    wardNumber: "WARD-104",
    name: "Whitefield",
    city: "Bengaluru",
    center: { lat: 12.9698, lng: 77.75 },
    polygon: [
      [12.95, 77.73],
      [12.99, 77.73],
      [12.99, 77.77],
      [12.95, 77.77],
      [12.95, 77.73],
    ],
  },
  {
    id: "a1050000-0000-0000-0000-000000000105",
    wardNumber: "WARD-105",
    name: "Malleshwaram",
    city: "Bengaluru",
    center: { lat: 13.0031, lng: 77.5643 },
    polygon: [
      [12.99, 77.55],
      [13.02, 77.55],
      [13.02, 77.58],
      [12.99, 77.58],
      [12.99, 77.55],
    ],
  },
];

/**
 * Deterministic Point-in-Polygon (Ray-Casting Algorithm)
 * Tests if point (lat, lng) is strictly within polygon boundary
 */
export function isPointInPolygon(point: GeoPoint, vs: [number, number][]): boolean {
  const x = point.lat;
  const y = point.lng;

  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Identifies the responsible municipal ward from submitted coordinates.
 * If coordinates fall outside all configured wards, returns null
 * so the issue is routed to the administrative review queue.
 */
export async function identifyWardByCoordinates(
  lat: number,
  lng: number
): Promise<WardBoundary | null> {
  // First attempt PostGIS query via Supabase if connected
  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("find_ward_by_point", {
      p_lat: lat,
      p_lng: lng,
    });
    if (!error && data) {
      return data as WardBoundary;
    }
  } catch {
    // Fallback to client-side polygon resolution
  }

  const point: GeoPoint = { lat, lng };

  for (const ward of DEMO_WARDS) {
    if (isPointInPolygon(point, ward.polygon)) {
      return ward;
    }
  }

  return null; // Point outside all municipal wards -> Administrative Review Queue
}

export function getAllDemoWards(): WardBoundary[] {
  return DEMO_WARDS;
}
