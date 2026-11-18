"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Navigation, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface LocationPickerProps {
  latitude: number;
  longitude: number;
  locationDescription: string;
  onCoordinatesChange: (lat: number, lng: number) => void;
  onDescriptionChange: (desc: string) => void;
  error?: string;
}

// Municipal landmark coordinates for location pin alignment
const MUNICIPAL_LANDMARKS = [
  { name: "CBD (MG Road)", lat: 12.9716, lng: 77.5946 },
  { name: "Indiranagar (100ft Rd)", lat: 12.9784, lng: 77.6408 },
  { name: "Koramangala (80ft Rd)", lat: 12.9352, lng: 77.6245 },
  { name: "Whitefield (ITPB)", lat: 12.9698, lng: 77.7500 },
];

type LocationMapLayer = "google_streets" | "google_hybrid" | "google_terrain";

const GOOGLE_LAYERS: Record<LocationMapLayer, { name: string; url: string; maxZoom: number }> = {
  google_streets: {
    name: "Google Roads",
    url: "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    maxZoom: 20,
  },
  google_hybrid: {
    name: "Google Satellite",
    url: "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    maxZoom: 20,
  },
  google_terrain: {
    name: "Google Terrain",
    url: "https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    maxZoom: 20,
  },
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  locationDescription,
  onCoordinatesChange,
  onDescriptionChange,
  error,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const currentTileLayerRef = useRef<unknown>(null);

  const [mapLayer, setMapLayer] = useState<LocationMapLayer>("google_streets");
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Leaflet with Google Maps tiles
  useEffect(() => {
    let isMounted = true;
    let fallbackTimer: NodeJS.Timeout | null = null;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      const L = (await import("leaflet")).default;

      // Fix default Leaflet icon assets
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Guard against double initialization in StrictMode
      if (mapInstanceRef.current) {
        if (isMounted) setMapLoaded(true);
        return;
      }

      // Clear any stale Leaflet ID from DOM container
      if (mapContainerRef.current) {
        delete (mapContainerRef.current as unknown as { _leaflet_id?: unknown })._leaflet_id;
      }

      try {
        const centerLat = latitude && !isNaN(latitude) ? latitude : 12.9716;
        const centerLng = longitude && !isNaN(longitude) ? longitude : 77.5946;

        const map = L.map(mapContainerRef.current!, {
          center: [centerLat, centerLng],
          zoom: 14,
          scrollWheelZoom: false,
        });

        // Add Google Maps Tile Layer
        const cfg = GOOGLE_LAYERS[mapLayer];
        const tileLayer = L.tileLayer(cfg.url, {
          subdomains: ["0", "1", "2", "3"],
          attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>',
          maxZoom: cfg.maxZoom,
        }).addTo(map);

        currentTileLayerRef.current = tileLayer;

        const marker = L.marker([centerLat, centerLng], {
          draggable: true,
        }).addTo(map);

        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          onCoordinatesChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
        });

        map.on("click", (e) => {
          marker.setLatLng(e.latlng);
          onCoordinatesChange(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        map.whenReady(() => {
          if (isMounted) setMapLoaded(true);
        });

        fallbackTimer = setTimeout(() => {
          if (isMounted) setMapLoaded(true);
        }, 100);
      } catch (err) {
        console.error("Leaflet map initialization error:", err);
        if (isMounted) setMapLoaded(true);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (mapInstanceRef.current) {
        try {
          const map = mapInstanceRef.current as { remove: () => void };
          map.remove();
        } catch {}
        mapInstanceRef.current = null;
        markerRef.current = null;
        currentTileLayerRef.current = null;
      }
      if (mapContainerRef.current) {
        delete (mapContainerRef.current as unknown as { _leaflet_id?: unknown })._leaflet_id;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dynamically switch Google Maps layer without recreating the map
  useEffect(() => {
    async function switchLayer() {
      if (!mapInstanceRef.current) return;
      const L = (await import("leaflet")).default;
      const map = mapInstanceRef.current as {
        removeLayer: (layer: unknown) => void;
        addLayer: (layer: unknown) => void;
      };

      if (currentTileLayerRef.current) {
        map.removeLayer(currentTileLayerRef.current);
      }

      const cfg = GOOGLE_LAYERS[mapLayer];
      const newLayer = L.tileLayer(cfg.url, {
        subdomains: ["0", "1", "2", "3"],
        attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>',
        maxZoom: cfg.maxZoom,
      });

      map.addLayer(newLayer);
      if ("bringToBack" in newLayer && typeof (newLayer as { bringToBack: () => void }).bringToBack === "function") {
        (newLayer as { bringToBack: () => void }).bringToBack();
      }

      currentTileLayerRef.current = newLayer;
    }

    if (mapLoaded) {
      switchLayer();
    }
  }, [mapLayer, mapLoaded]);

  // Sync marker position when coordinates change externally
  const updateMapMarker = useCallback((lat: number, lng: number) => {
    if (mapInstanceRef.current && markerRef.current) {
      const map = mapInstanceRef.current as { setView: (coords: [number, number], zoom: number) => void };
      const marker = markerRef.current as { setLatLng: (coords: [number, number]) => void };
      marker.setLatLng([lat, lng]);
      map.setView([lat, lng], 15);
    }
  }, []);

  const handleUseMyLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        onCoordinatesChange(lat, lng);
        updateMapMarker(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location permission denied. You can click on the Google Map to pin the location.");
        } else {
          setGeoError("Unable to retrieve precise location. Please click on the Google Map.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handlePresetSelect = (preset: { name: string; lat: number; lng: number }) => {
    onCoordinatesChange(preset.lat, preset.lng);
    onDescriptionChange(`Near ${preset.name}`);
    updateMapMarker(preset.lat, preset.lng);
  };

  return (
    <div className="space-y-3">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Geographic Location & Map Pin <span className="text-red-500">*</span>
          </label>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Google Maps Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Google Maps Layer Selector */}
          <select
            value={mapLayer}
            onChange={(e) => setMapLayer(e.target.value as LocationMapLayer)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            title="Switch Google Maps Style"
          >
            <option value="google_streets">Google Roads</option>
            <option value="google_hybrid">Google Satellite</option>
            <option value="google_terrain">Google Terrain</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleUseMyLocation}
            isLoading={isLocating}
            leftIcon={<Navigation className="w-3.5 h-3.5 text-blue-600" />}
          >
            Use My GPS Location
          </Button>
        </div>
      </div>

      {/* Preset Landmark Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[11px] font-semibold text-slate-400">City Landmarks:</span>
        {MUNICIPAL_LANDMARKS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => handlePresetSelect(p)}
            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 active:bg-slate-300 font-medium text-slate-700 border border-slate-200 cursor-pointer"
          >
            {p.name}
          </button>
        ))}
      </div>

      {geoError && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map Container */}
      <div className="relative rounded-xl border border-slate-300 overflow-hidden shadow-2xs bg-slate-100">
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <div
          ref={mapContainerRef}
          className="h-64 sm:h-72 w-full z-0"
          style={{ minHeight: "260px" }}
        />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-xs text-slate-500">
            <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
            Fetching Google Maps...
          </div>
        )}
      </div>

      {/* Coordinate & Description Readout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Latitude
          </span>
          <span className="font-mono text-xs font-semibold text-slate-900">
            {latitude ? latitude.toFixed(6) : "12.971600"}
          </span>
        </div>

        <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Longitude
          </span>
          <span className="font-mono text-xs font-semibold text-slate-900">
            {longitude ? longitude.toFixed(6) : "77.594600"}
          </span>
        </div>

        <div className="sm:col-span-1">
          <input
            type="text"
            value={locationDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Landmark / street detail..."
            className="w-full h-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
