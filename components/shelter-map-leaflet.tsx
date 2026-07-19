"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { Shelter } from "@/lib/shelters";

// ponytail: hand-drawn pin instead of Leaflet's default marker images —
// those break under webpack/turbopack bundling (classic Leaflet+Next gotcha).
const PIN_PATH =
  "M12 0C7.03 0 3 4.03 3 9c0 6.75 9 15 9 15s9-8.25 9-15c0-4.97-4.03-9-9-9zm0 12a3 3 0 110-6 3 3 0 010 6z";

function pinIcon(selected: boolean) {
  const size = selected ? 38 : 26;
  return L.divIcon({
    html: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="var(--primary)" stroke="white" stroke-width="0.5">
      <path d="${PIN_PATH}" />
    </svg>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

const DEFAULT_ICON = pinIcon(false);
const SELECTED_ICON = pinIcon(true);

function MapController({
  shelters,
  selectedId,
}: {
  shelters: Shelter[];
  selectedId: string | null;
}) {
  const map = useMap();

  useEffect(() => {
    const selected = shelters.find((s) => s.ID === selectedId);
    if (selected) {
      map.flyTo([selected.Lat, selected.Lon], 14);
      return;
    }
    if (shelters.length === 0) return;
    const bounds = L.latLngBounds(shelters.map((s) => [s.Lat, s.Lon]));
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 11 });
  }, [map, shelters, selectedId]);

  return null;
}

export function ShelterMapLeaflet({
  shelters,
  selectedId,
  onSelect,
}: {
  shelters: Shelter[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <MapContainer
      center={[23.7, 121]}
      zoom={7}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {shelters.map((shelter) => (
        <Marker
          key={shelter.ID}
          position={[shelter.Lat, shelter.Lon]}
          icon={shelter.ID === selectedId ? SELECTED_ICON : DEFAULT_ICON}
          eventHandlers={{ click: () => onSelect(shelter.ID) }}
        >
          <Popup>{shelter.ShelterName}</Popup>
        </Marker>
      ))}
      <MapController shelters={shelters} selectedId={selectedId} />
    </MapContainer>
  );
}
