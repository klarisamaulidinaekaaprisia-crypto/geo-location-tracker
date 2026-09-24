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

const appleFont =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

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
      style={{ fontFamily: appleFont }}
    >
      {/* Header */}
      <header className="sticky top-0 z-[1100] border-b border-black/5 bg-[#f5f5f7]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-[#0a84ff] to-[#0066cc] shadow-[0_2px_8px_rgba(10,132,255,0.35)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4.5 w-4.5"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h1 className="text-[15px] font-semibold leading-tight tracking-tight">
                Peta Sensor
              </h1>
              <p className="text-[11px] leading-tight text-neutral-500">
                Pemantauan lokasi real-time
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 py-1 pl-2.5 pr-3 text-[12px] font-medium text-emerald-600 ring-1 ring-emerald-600/15">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:gap-5">
        {/* Panel sensor */}
        <aside className="order-2 flex w-full flex-col gap-3 lg:order-1 lg:w-[340px] lg:shrink-0">
          {/* Kartu ringkasan sensor terpilih */}
          {selected && (
            <div
              key={selected.id}
              className="animate-scale-in rounded-3xl bg-gradient-to-b from-[#1d1d1f] to-[#2c2c2e] p-5 text-white shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-white/60">Sensor Terpilih</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  {selected.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
              <h2 className="mt-1.5 text-[17px] font-semibold tracking-tight">{selected.name}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                    Latitude
                  </div>
                  <div className="mt-0.5 font-mono text-[15px] tabular-nums transition-all duration-300">
                    {selected.latitude.toFixed(6)}
                  </div>
                </div>
                <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
                  <div className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                    Longitude
                  </div>
                  <div className="mt-0.5 font-mono text-[15px] tabular-nums transition-all duration-300">
                    {selected.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-[12px] text-white/60">
                <span>
                  {selected.temperature}&deg;C &middot; {selected.humidity}% RH
                </span>
                <span>
                  {new Date(selected.updatedAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Daftar sensor: geser horizontal di mobile, kolom di desktop */}
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
            {sensors.map((sensor, i) => (
              <button
                key={sensor.id}
                onClick={() => setSelectedId(sensor.id)}
                style={{ animationDelay: `${i * 80}ms` }}
                className={`animate-fade-in w-[260px] shrink-0 snap-start rounded-2xl bg-white p-4 text-left ring-1 transition-all duration-200 ease-out lg:w-full ${
                  sensor.id === selected?.id
                    ? "shadow-[0_4px_20px_rgba(10,132,255,0.12)] ring-2 ring-[#0a84ff]"
                    : "shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-black/5 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold tracking-tight">{sensor.name}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      sensor.status === "online" ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">
                      Latitude
                    </div>
                    <div className="font-mono text-[12px] tabular-nums text-neutral-700">
                      {sensor.latitude.toFixed(6)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-medium uppercase tracking-wider text-neutral-400">
                      Longitude
                    </div>
                    <div className="font-mono text-[12px] tabular-nums text-neutral-700">
                      {sensor.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1 flex-1 rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-[width] duration-700 ease-out"
                      style={{ width: `${sensor.battery}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium tabular-nums text-neutral-400">
                    {sensor.battery}%
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p className="px-1 text-[11px] leading-relaxed text-neutral-400">
            Data saat ini adalah simulasi. Hubungkan sensor fisik asli Anda untuk menampilkan data
            langsung di peta ini.
          </p>
        </aside>

        {/* Peta */}
        <section className="animate-fade-in relative order-1 h-[46vh] min-h-[320px] flex-1 overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-black/5 sm:h-[52vh] lg:order-2 lg:h-auto lg:min-h-[560px]">
          <ClientOnly
            fallback={
              <div className="flex h-full items-center justify-center text-[13px] text-neutral-400">
                Memuat peta…
              </div>
            }
          >
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-[13px] text-neutral-400">
                  Memuat peta…
                </div>
              }
            >
              <SensorMap sensors={sensors} selectedId={selected?.id ?? null} onSelect={handleSelect} />
            </Suspense>
          </ClientOnly>
          {selected && (
            <div className="absolute bottom-4 left-4 right-4 z-[1000] flex items-center justify-between rounded-2xl bg-white/85 px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] ring-1 ring-black/5 backdrop-blur-xl sm:right-auto">
              <div>
                <div className="text-[12px] font-semibold tracking-tight text-neutral-900">
                  {selected.name}
                </div>
                <div className="mt-0.5 font-mono text-[12px] tabular-nums text-neutral-500">
                  {selected.latitude.toFixed(6)}, {selected.longitude.toFixed(6)}
                </div>
              </div>
              <span className="ml-4 hidden rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 sm:inline">
                Online
              </span>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
