export interface SensorReading {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  battery: number;
  status: "online" | "offline";
  updatedAt: string;
}

// Posisi awal sensor (contoh: area Yogyakarta). Ganti dengan posisi asli sensor Anda.
const BASE_SENSORS: SensorReading[] = [
  {
    id: "sensor-01",
    name: "Sensor 01 — Stasiun Utara",
    latitude: -7.7829,
    longitude: 110.3671,
    battery: 92,
    status: "online",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sensor-02",
    name: "Sensor 02 — Stasiun Timur",
    latitude: -7.7956,
    longitude: 110.3895,
    battery: 81,
    status: "online",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sensor-03",
    name: "Sensor 03 — Stasiun Selatan",
    latitude: -7.8102,
    longitude: 110.3625,
    battery: 55,
    status: "online",
    updatedAt: new Date().toISOString(),
  },
];

// Simulasi gerakan kecil sensor agar peta terlihat hidup.
// Nanti ganti fungsi ini dengan pengambilan data dari sensor fisik Anda.
export function generateReadings(): SensorReading[] {
  return BASE_SENSORS.map((s) => {
    const drift = 0.0008;
    return {
      ...s,
      latitude: s.latitude + (Math.random() - 0.5) * drift,
      longitude: s.longitude + (Math.random() - 0.5) * drift,
      battery: Math.max(5, s.battery - Math.round(Math.random() * 0.4)),
      updatedAt: new Date().toISOString(),
    };
  });
}
