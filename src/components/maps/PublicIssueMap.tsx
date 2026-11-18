"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  List,
  Search,
  RotateCcw,
  BarChart3,
  PlusCircle,
  Clock,
  Compass,
} from "lucide-react";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "@/components/ui/Table";
import { getCitizenIssues } from "@/lib/services/issue.service";
import { getAllDemoWards } from "@/lib/services/ward.service";
import type { Issue, IssueStatus } from "@/types/database.types";

export type MapLayerType =
  | "google_streets"
  | "google_satellite"
  | "google_hybrid"
  | "google_terrain"
  | "osm";

interface MapLayerConfig {
  id: MapLayerType;
  name: string;
  shortName: string;
  url: string;
  attribution: string;
  subdomains: string[];
  maxZoom: number;
}

const MAP_LAYERS: Record<MapLayerType, MapLayerConfig> = {
  google_streets: {
    id: "google_streets",
    name: "Google Maps (Roads)",
    shortName: "Google Road",
    url: "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>',
    subdomains: ["0", "1", "2", "3"],
    maxZoom: 20,
  },
  google_satellite: {
    id: "google_satellite",
    name: "Google Maps (Satellite)",
    shortName: "Satellite",
    url: "https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>',
    subdomains: ["0", "1", "2", "3"],
    maxZoom: 20,
  },
  google_hybrid: {
    id: "google_hybrid",
    name: "Google Maps (Hybrid)",
    shortName: "Hybrid",
    url: "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>',
    subdomains: ["0", "1", "2", "3"],
    maxZoom: 20,
  },
  google_terrain: {
    id: "google_terrain",
    name: "Google Maps (Terrain)",
    shortName: "Terrain",
    url: "https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    attribution: '&copy; <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">Google Maps</a>',
    subdomains: ["0", "1", "2", "3"],
    maxZoom: 20,
  },
  osm: {
    id: "osm",
    name: "OpenStreetMap",
    shortName: "OSM",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    subdomains: ["a", "b", "c"],
    maxZoom: 19,
  },
};

const LANDMARK_PRESETS: Record<string, [number, number]> = {
  cbd: [12.9716, 77.5946],
  mg: [12.9716, 77.5946],
  indiranagar: [12.9784, 77.6408],
  koramangala: [12.9352, 77.6245],
  whitefield: [12.9698, 77.7500],
  jayanagar: [12.9308, 77.5838],
  malleshwaram: [13.0031, 77.5643],
  hebbal: [13.0358, 77.5970],
  yelahanka: [13.1007, 77.5963],
};

export const PublicIssueMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersLayerRef = useRef<unknown>(null);
  const currentTileLayerRef = useRef<unknown>(null);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [mapLayer, setMapLayer] = useState<MapLayerType>("google_streets");
  const [searchQuery, setSearchQuery] = useState("");
  const [jumpQuery, setJumpQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedWard, setSelectedWard] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [mapReady, setMapReady] = useState(false);

  // Memoize wards to avoid trigger cycles
  const wards = useMemo(() => getAllDemoWards(), []);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const data = await getCitizenIssues();
      if (isMounted) setIssues(data);
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter issues based on criteria
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (selectedCategory !== "all" && issue.category !== selectedCategory) return false;
      if (selectedStatus !== "all" && issue.status !== selectedStatus) return false;
      if (selectedWard !== "all" && issue.ward_id && issue.ward_id !== selectedWard) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = issue.reference_number.toLowerCase().includes(q);
        const matchesTitle = issue.title.toLowerCase().includes(q);
        const matchesDesc = (issue.description || "").toLowerCase().includes(q);
        const matchesLoc = (issue.location_description || "").toLowerCase().includes(q);
        if (!matchesRef && !matchesTitle && !matchesDesc && !matchesLoc) return false;
      }
      return true;
    });
  }, [issues, selectedCategory, selectedStatus, selectedWard, searchQuery]);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;
    let fallbackTimer: NodeJS.Timeout | null = null;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current || viewMode !== "map") return;

      const L = (await import("leaflet")).default;

      // Fix default Leaflet icon assets
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Avoid double initialization in StrictMode
      if (mapInstanceRef.current) {
        if (isMounted) setMapReady(true);
        return;
      }

      // Clear any existing leaflet ID on container
      if (mapContainerRef.current) {
        delete (mapContainerRef.current as unknown as { _leaflet_id?: unknown })._leaflet_id;
      }

      if (mapContainerRef.current) {
        try {
          const map = L.map(mapContainerRef.current, {
            center: [12.9716, 77.5946],
            zoom: 12,
          });

          // Add Google Maps or selected tile layer
          const layerConfig = MAP_LAYERS[mapLayer];
          const tileLayer = L.tileLayer(layerConfig.url, {
            attribution: layerConfig.attribution,
            subdomains: layerConfig.subdomains,
            maxZoom: layerConfig.maxZoom,
          }).addTo(map);

          currentTileLayerRef.current = tileLayer;

          // Render Ward boundary polygons
          for (const ward of wards) {
            L.polygon(ward.polygon, {
              color: "#2563eb",
              weight: 2,
              dashArray: "4, 4",
              fillColor: "#3b82f6",
              fillOpacity: 0.12,
            })
              .addTo(map)
              .bindTooltip(
                `<div style="font-weight: 700; font-size: 11px; padding: 2px 4px; color: #0f172a;">${ward.wardNumber}: ${ward.name}</div>`,
                { sticky: true }
              );
          }

          const markersLayer = L.layerGroup().addTo(map);
          markersLayerRef.current = markersLayer;
          mapInstanceRef.current = map;

          map.whenReady(() => {
            if (isMounted) setMapReady(true);
          });

          fallbackTimer = setTimeout(() => {
            if (isMounted) setMapReady(true);
          }, 150);
        } catch (err) {
          console.error("Map initialization exception:", err);
          if (isMounted) setMapReady(true);
        }
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
        markersLayerRef.current = null;
        currentTileLayerRef.current = null;
      }
      if (mapContainerRef.current) {
        delete (mapContainerRef.current as unknown as { _leaflet_id?: unknown })._leaflet_id;
      }
      setMapReady(false);
    };
  }, [viewMode, wards]);

  // Dynamic layer switcher
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

      const layerConfig = MAP_LAYERS[mapLayer];
      const newTileLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        subdomains: layerConfig.subdomains,
        maxZoom: layerConfig.maxZoom,
      });

      map.addLayer(newTileLayer);
      if ("bringToBack" in newTileLayer && typeof (newTileLayer as { bringToBack: () => void }).bringToBack === "function") {
        (newTileLayer as { bringToBack: () => void }).bringToBack();
      }

      currentTileLayerRef.current = newTileLayer;
    }

    if (mapReady) {
      switchLayer();
    }
  }, [mapLayer, mapReady]);

  // Update map markers when filteredIssues changes
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      const L = (await import("leaflet")).default;
      const markersLayer = markersLayerRef.current as {
        clearLayers: () => void;
        addLayer: (layer: unknown) => void;
      };

      markersLayer.clearLayers();

      filteredIssues.forEach((issue) => {
        const marker = L.marker([issue.latitude, issue.longitude]);

        const statusColor =
          issue.status === "resolved"
            ? "#059669"
            : issue.status === "in_progress"
            ? "#2563eb"
            : issue.status === "escalated"
            ? "#dc2626"
            : "#475569";

        const popupContent = `
          <div style="font-family: inherit; font-size: 12px; max-width: 260px; padding: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-weight: 800; font-family: monospace; color: #1e293b; font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">
                ${issue.reference_number}
              </span>
              <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; background: ${statusColor}18; color: ${statusColor}; text-transform: uppercase;">
                ${issue.status.replace("_", " ")}
              </span>
            </div>
            <div style="font-weight: 700; color: #0f172a; margin-bottom: 4px; font-size: 13px; line-height: 1.3;">
              ${issue.title}
            </div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px; line-height: 1.4;">
              ${issue.location_description || "Municipal Coordinate"}
            </div>
            <div style="color: #475569; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px; display: flex; justify-content: space-between;">
              <span style="font-weight: 600;">SLA Window:</span>
              <span style="font-weight: 700; color: #1e293b;">${issue.category.replace("_", " ").toUpperCase()}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersLayer.addLayer(marker);
      });
    }

    if (viewMode === "map" && mapReady) {
      updateMarkers();
    }
  }, [filteredIssues, viewMode, mapReady]);

  // Jump to landmark handler
  const handleJump = () => {
    if (!jumpQuery.trim() || !mapInstanceRef.current) return;
    const q = jumpQuery.trim().toLowerCase();

    // Check presets
    for (const [key, coords] of Object.entries(LANDMARK_PRESETS)) {
      if (q.includes(key)) {
        const map = mapInstanceRef.current as { setView: (coords: [number, number], zoom: number) => void };
        map.setView(coords, 14);
        return;
      }
    }

    // Default pan to CBD
    const map = mapInstanceRef.current as { setView: (coords: [number, number], zoom: number) => void };
    map.setView([12.9716, 77.5946], 14);
  };

  const handleReset = () => {
    setSearchQuery("");
    setJumpQuery("");
    setSelectedCategory("all");
    setSelectedWard("all");
    setSelectedStatus("all");
    if (mapInstanceRef.current) {
      const map = mapInstanceRef.current as { setView: (coords: [number, number], zoom: number) => void };
      map.setView([12.9716, 77.5946], 12);
    }
  };

  const getStatusBadge = (status: IssueStatus): BadgeVariant => {
    switch (status) {
      case "submitted":
        return "submitted";
      case "assigned":
        return "assigned";
      case "in_progress":
        return "in_progress";
      case "escalated":
        return "escalated";
      case "resolved":
        return "resolved";
      default:
        return "slate";
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header (Matches Screenshot) */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Public Incident Explorer & Map
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              OPEN DATA
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Real-time public transparency map powered by OpenStreetMap and Leaflet. Track neighborhood issues,
            filter by ward, and inspect resolution progress without logging in.
          </p>
        </div>

        {/* 3 Top Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/public/performance">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Performance & SLA</span>
            </button>
          </Link>

          <Link href="/citizen/dashboard">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span>Track by Ticket ID</span>
            </button>
          </Link>

          <Link href="/report">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-white font-bold px-4 py-2 text-xs shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Report an Issue</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Filter & Control Card (Matches Screenshot) */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
        {/* Row 1: Search, Jump to address, and View Mode Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket ID, title, or address..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Jump to address / landmark */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={jumpQuery}
                onChange={(e) => setJumpQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJump()}
                placeholder="Jump to address / landmark..."
                className="w-48 sm:w-56 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleJump}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Jump
              </button>
            </div>

            {/* View Mode Toggle: Map View vs List View */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === "map"
                    ? "bg-slate-950 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-slate-950 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                title="Reset Filters"
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category, Ward Boundary, Status Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              CATEGORY
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="pothole">Potholes & Roads</option>
              <option value="garbage">Garbage & Sanitation</option>
              <option value="broken_streetlight">Broken Streetlights</option>
              <option value="water_leakage">Water Leakage</option>
              <option value="other">Other Civic</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              WARD BOUNDARY
            </label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All City Wards</option>
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.wardNumber}: {w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              STATUS
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Row 3: Count and Engine Metadata */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-900 font-bold">{filteredIssues.length}</strong> active public incidents
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Google Maps Engine • PostGIS Geolocation
          </div>
        </div>
      </div>

      {/* Main Display: Map or List */}
      {viewMode === "map" ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-slate-100">
          <link
            rel="stylesheet"
            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          />
          <div
            ref={mapContainerRef}
            className="w-full z-0"
            style={{ height: "620px" }}
          />

          {/* Floating Map Layer Switcher on Top-Right (Matches Screenshot) */}
          <div className="absolute top-3 right-3 z-1000 bg-white/95 border border-slate-200 rounded-lg p-1 shadow-md flex items-center gap-1 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5">
              Map Layer:
            </span>
            {(["google_streets", "google_satellite", "google_hybrid", "google_terrain", "osm"] as MapLayerType[]).map(
              (layerKey) => (
                <button
                  key={layerKey}
                  type="button"
                  onClick={() => setMapLayer(layerKey)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                    mapLayer === layerKey
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {MAP_LAYERS[layerKey].shortName}
                </button>
              )
            )}
          </div>

          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 text-xs text-white z-1000">
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2.5 shadow-lg">
                <Compass className="w-5 h-5 animate-spin text-blue-400" />
                <span className="font-medium">Fetching Google Maps & PostGIS boundaries...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <CardTitle className="text-base font-bold text-slate-900">
              Public Incident Ledger & Spatial Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-100/80">
                <TableRow>
                  <TableHead className="font-bold">Reference</TableHead>
                  <TableHead className="font-bold">Category & Title</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Coordinates</TableHead>
                  <TableHead className="font-bold">SLA Policy</TableHead>
                  <TableHead className="font-bold text-right">Lodged At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.length === 0 ? (
                  <TableEmpty
                    message={
                      selectedCategory !== "all" || selectedStatus !== "all" || selectedWard !== "all" || searchQuery
                        ? "No incidents matching selected filters"
                        : "No public civic incidents reported yet. All municipal wards currently clear."
                    }
                    colSpan={6}
                  />
                ) : (
                  filteredIssues.map((issue) => (
                    <TableRow key={issue.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-slate-900">
                        {issue.reference_number}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {issue.category.replace("_", " ")}
                          </span>
                          <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                            {issue.title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(issue.status)} size="sm">
                          {issue.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">
                        {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Active SLA</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-500 font-mono">
                        {new Date(issue.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
