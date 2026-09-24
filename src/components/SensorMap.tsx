import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { SensorReading } from "@/lib/sensors";

interface SensorMapProps {
  sensors: SensorReading[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function makeIcon(selected: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width: ${selected ? 22 : 16}px;
      height: ${selected ? 22 : 16}px;
      border-radius: 9999px;
      background: ${selected ? "#007aff" : "#34c759"};
      border: 3px solid #ffffff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [selected ? 22 : 16, selected ? 22 : 16],
    iconAnchor: [selected ? 11 : 8, selected ? 11 : 8],
  });
}

export default function SensorMap({ sensors, selectedId, onSelect }: SensorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [-7.7956, 110.3695],
      zoom: 13,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  const hasCenteredRef = useRef(false);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (sensors.length > 0 && !hasCenteredRef.current) {
      map.setView([sensors[0].latitude, sensors[0].longitude], 14);
      hasCenteredRef.current = true;
    }

    sensors.forEach((sensor) => {
      const latLng: L.LatLngExpression = [sensor.latitude, sensor.longitude];
      const existing = markersRef.current.get(sensor.id);
      const popup = `
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.5;">
          <strong>${sensor.name}</strong><br/>
          Latitude: ${sensor.latitude.toFixed(6)}<br/>
          Longitude: ${sensor.longitude.toFixed(6)}<br/>
          ${sensor.speed !== undefined ? `Kecepatan: ${sensor.speed} km/j<br/>` : ""}
          <span style="color: #666; font-size: 10px;">${new Date(sensor.updatedAt).toLocaleTimeString("id-ID")}</span>
        </div>`;
      if (existing) {
        existing.setLatLng(latLng);
        existing.setIcon(makeIcon(sensor.id === selectedId));
        existing.setPopupContent(popup);
      } else {
        const marker = L.marker(latLng, { icon: makeIcon(sensor.id === selectedId) })
          .addTo(map)
          .bindPopup(popup);
        marker.on("click", () => onSelect(sensor.id));
        markersRef.current.set(sensor.id, marker);
      }
    });

    const selected = sensors.find((s) => s.id === selectedId);
    if (selected) {
      map.panTo([selected.latitude, selected.longitude], { animate: true });
    }
  }, [sensors, selectedId, onSelect]);

  return <div ref={containerRef} className="h-full w-full" />;
}
