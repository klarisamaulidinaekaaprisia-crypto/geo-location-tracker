import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { generateReadings, type SensorReading } from "@/lib/sensors";

const SensorMap = lazy(() => import("@/components/SensorMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Peta Sensor — Pemantauan Lokasi Real-time" },
      {
        name: "description",
        content:
          "Peta interaktif yang menampilkan posisi latitude dan longitude sensor fisik secara real-time, lengkap dengan suhu, kelembapan, dan status baterai.",
      },
      { property: "og:title", content: "Peta Sensor — Pemantauan Lokasi Real-time" },
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
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Peta Pemantauan Sensor</h1>
          <p className="text-xs text-slate-400">
            Lokasi latitude &amp; longitude sensor fisik, diperbarui setiap 3 detik
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Live
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
        <aside className="flex w-full flex-col gap-3 lg:w-80">
          {sensors.map((sensor) => (
            <button
              key={sensor.id}
              onClick={() => setSelectedId(sensor.id)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                sensor.id === selected?.id
                  ? "border-sky-500/60 bg-sky-500/10"
                  : "border-slate-800 bg-slate-900 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{sensor.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    sensor.status === "online"
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-rose-500/15 text-rose-300"
                  }`}
                >
                  {sensor.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs text-slate-300">
                <div>
                  <div className="text-[10px] uppercase text-slate-500">Latitude</div>
                  {sensor.latitude.toFixed(6)}
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500">Longitude</div>
                  {sensor.longitude.toFixed(6)}
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500">Suhu</div>
                  {sensor.temperature}&deg;C
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-500">Kelembapan</div>
                  {sensor.humidity}%
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Baterai</span>
                  <span>{sensor.battery}%</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${sensor.battery}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
          <p className="px-1 text-[11px] leading-relaxed text-slate-500">
            Data saat ini adalah simulasi. Untuk menghubungkan sensor fisik asli (misalnya
            perangkat GPS/IoT), data dapat dikirim ke server lalu ditampilkan di peta ini.
          </p>
        </aside>

        <section className="relative min-h-[420px] flex-1 overflow-hidden rounded-xl border border-slate-800">
          <ClientOnly
            fallback={
              <div className="flex h-full min-h-[420px] items-center justify-center bg-slate-900 text-sm text-slate-400">
                Memuat peta…
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="flex h-full min-h-[420px] items-center justify-center bg-slate-900 text-sm text-slate-400">
                  Memuat peta…
                </div>
              }
            >
              <SensorMap sensors={sensors} selectedId={selected?.id ?? null} onSelect={handleSelect} />
            </Suspense>
          </ClientOnly>
          {selected && (
            <div className="absolute bottom-4 left-4 z-[1000] rounded-lg border border-slate-700 bg-slate-900/90 px-4 py-2 font-mono text-xs text-slate-200 shadow-lg backdrop-blur">
              <span className="text-slate-400">{selected.name}</span>
              <br />
              {selected.latitude.toFixed(6)}, {selected.longitude.toFixed(6)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
