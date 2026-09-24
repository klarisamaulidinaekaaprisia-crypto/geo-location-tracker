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

function Index() {
  const [sensors, setSensors] = useState<SensorReading[]>(() => generateReadings());
  const [selectedId, setSelectedId] = useState<string | null>("sensor-01");

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(generateReadings());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
              Lokasi sensor fisik, diperbarui setiap 3 detik
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-medium text-emerald-600 ring-1 ring-emerald-600/10">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-5 p-5 lg:flex-row">
        <aside className="flex w-full flex-col gap-3 lg:w-[340px]">
          {sensors.map((sensor) => (
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
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-medium text-neutral-400">
                  <span>Baterai</span>
                  <span>{sensor.battery}%</span>
                </div>
                <div className="mt-1.5 h-1 rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${sensor.battery}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
          <p className="px-2 text-[11px] leading-relaxed text-neutral-400">
            Data saat ini adalah simulasi. Hubungkan sensor fisik asli Anda untuk menampilkan data
            langsung di peta ini.
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

