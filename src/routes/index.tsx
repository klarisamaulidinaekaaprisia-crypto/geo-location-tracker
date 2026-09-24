import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { generateReadings, type SensorReading } from "@/lib/sensors";

const SensorMap = lazy(() => import("@/components/SensorMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "peta sensor - kelompok" },
      {
        name: "description",
        content:
          "Peta interaktif yang menampilkan posisi latitude dan longitude sensor fisik secara real-time.",
      },
      { property: "og:title", content: "peta sensor - kelompok" },
      {
        property: "og:description",
        content:
          "Pantau posisi latitude dan longitude sensor fisik secara langsung di peta interaktif.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

async function fetchSensorsFromAPI(): Promise<SensorReading[]> {
  try {
    const res = await fetch("/api/devices/latest");
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        return json.data.map((item: any) => ({
          id: item.device_id,
          name: item.device_id,
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
          speed: item.speed,
          altitude: item.altitude,
          battery: 100,
          status: "online" as const,
          updatedAt: item.created_at || new Date().toISOString(),
        }));
      }
    }

    const resAll = await fetch("/api/locations?limit=20");
    if (resAll.ok) {
      const jsonAll = await resAll.json();
      if (jsonAll.data && Array.isArray(jsonAll.data) && jsonAll.data.length > 0) {
        const map = new Map<string, any>();
        for (const item of jsonAll.data) {
          if (!map.has(item.device_id)) {
            map.set(item.device_id, item);
          }
        }
        return Array.from(map.values()).map((item: any) => ({
          id: item.device_id,
          name: item.device_id,
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
          speed: item.speed,
          altitude: item.altitude,
          battery: 100,
          status: "online" as const,
          updatedAt: item.created_at || new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.error("Gagal mengambil data dari database:", err);
  }
  return [];
}

function Index() {
  const [sensors, setSensors] = useState<SensorReading[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);

  const loadData = useCallback(async () => {
    const data = await fetchSensorsFromAPI();
    if (data.length > 0) {
      setSensors(data);
      setSelectedId((prev) => (prev && data.some((s) => s.id === prev) ? prev : data[0].id));
      setHasData(true);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSelect = useCallback((id: string) => setSelectedId(id), []);
  const selected = sensors.find((s) => s.id === selectedId) ?? sensors[0];

  return (
    <div
      className="flex min-h-screen flex-col bg-[#f5f5f7] text-neutral-900 antialiased"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <header className="sticky top-0 z-[1100] border-b border-black/5 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-[17px] font-semibold tracking-tight">Peta Sensor - Kelompok</h1>
            <p className="text-[12px] text-neutral-500">
              Lokasi sensor fisik, diperbarui otomatis secara real-time dari database MySQL
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-600 ring-1 ring-emerald-600/10">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            {hasData ? "Database Connected" : "Connecting..."}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-5 lg:flex-row">
        <aside className="flex w-full flex-col gap-3 lg:w-[340px]">
          {sensors.length === 0 ? (
            <div className="rounded-2xl bg-white p-5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/5">
              <span className="text-[14px] font-semibold tracking-tight text-neutral-700">
                Menunggu Data Sensor...
              </span>
              <p className="mt-2 text-[12px] text-neutral-400">
                Belum ada data di database MySQL atau server sedang memuat.
              </p>
            </div>
          ) : (
            sensors.map((sensor) => (
              <button
                key={sensor.id}
                onClick={() => setSelectedId(sensor.id)}
                className={`rounded-2xl bg-white p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 transition-all duration-200 ${
                  sensor.id === selected?.id
                    ? "ring-2 ring-blue-500"
                    : "ring-black/5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold tracking-tight">{sensor.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      sensor.status === "online"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {sensor.status === "online" ? "Online" : "Offline"}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                      Latitude
                    </div>
                    <div className="font-mono text-[14px] font-medium tabular-nums text-neutral-800">
                      {sensor.latitude.toFixed(6)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                      Longitude
                    </div>
                    <div className="font-mono text-[14px] font-medium tabular-nums text-neutral-800">
                      {sensor.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3 text-[11px] text-neutral-500">
                  <span>Kecepatan: {sensor.speed ?? 0} km/j</span>
                  <span>{new Date(sensor.updatedAt).toLocaleTimeString("id-ID")}</span>
                </div>
              </button>
            ))
          )}
          <p className="px-2 text-[11px] leading-relaxed text-neutral-400">
            Data diambil langsung dari backend Golang & database MySQL setiap 2 detik.
          </p>
        </aside>

        <section className="relative min-h-[480px] flex-1 overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/5">
          <ClientOnly
            fallback={
              <div className="flex h-full min-h-[480px] items-center justify-center text-[13px] text-neutral-400">
                Memuat peta…
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="flex h-full min-h-[480px] items-center justify-center text-[13px] text-neutral-400">
                  Memuat peta…
                </div>
              }
            >
              <SensorMap sensors={sensors} selectedId={selected?.id ?? null} onSelect={handleSelect} />
            </Suspense>
          </ClientOnly>
          {selected && (
            <div className="absolute bottom-5 left-5 z-[1000] rounded-2xl bg-white/85 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-black/5 backdrop-blur-xl">
              <div className="text-[12px] font-semibold tracking-tight text-neutral-900">
                {selected.name}
              </div>
              <div className="mt-0.5 font-mono text-[12px] tabular-nums text-neutral-500">
                {selected.latitude.toFixed(6)}, {selected.longitude.toFixed(6)}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

