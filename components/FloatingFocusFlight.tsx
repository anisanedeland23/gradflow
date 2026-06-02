"use client";

import { usePathname } from "next/navigation";
import AppButton from "@/components/AppButton";
import { useFocusFlight } from "@/components/FocusFlightProvider";

export default function FloatingFocusFlight() {
  const pathname = usePathname();

  const {
    mode,
    timerStatus,
    timeLeft,
    sessionTitle,
    category,
    completedCycles,

    isRunning,
    isPaused,
    hasStarted,

    startTimer,
    pauseTimer,
    resetTimer,

    formatTimer,
  } = useFocusFlight();

  // Jangan tampilkan widget kalau user sedang berada di Daily Log,
  // karena panel utama Focus Flight sudah terlihat di halaman itu.
  if (pathname === "/daily-log") {
    return null;
  }

  // Jangan tampilkan widget kalau belum ada flight yang berjalan.
  if (!hasStarted) {
    return null;
  }

  const modeLabel = mode === "focus" ? "Flight Mode" : "Transit Mode";

  const modeIcon = mode === "focus" ? "✈️" : "⛽";

  const modeStyle =
    mode === "focus"
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-700";

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[320px] max-w-[calc(100vw-2rem)] rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{modeIcon}</span>

            <h3 className="text-sm font-bold text-slate-800">Focus Flight</h3>
          </div>

          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
            {sessionTitle || "Untitled mission"}
          </p>
        </div>

        <div
          className={`rounded-xl px-2 py-1 text-[10px] font-bold ${modeStyle}`}
        >
          {modeLabel}
        </div>
      </div>

      {/* TIMER */}
      <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-center text-white">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {timerStatus}
        </p>

        <h2 className="mt-1 text-3xl font-bold tracking-tight">
          {formatTimer(timeLeft)}
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          {mode === "focus"
            ? "Stay in the air."
            : "Refuel before the next flight."}
        </p>
      </div>

      {/* MINI STATS */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[11px] text-slate-500">Route</p>

          <p className="mt-1 truncate text-xs font-bold text-slate-700">
            {category}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[11px] text-slate-500">Flights</p>

          <p className="mt-1 text-xs font-bold text-slate-700">
            {completedCycles}
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {isRunning ? (
          <AppButton variant="secondary" size="sm" onClick={pauseTimer}>
            Pause
          </AppButton>
        ) : (
          <AppButton variant="primary" size="sm" onClick={startTimer}>
            {isPaused ? "Resume" : "Start"}
          </AppButton>
        )}

        <AppButton variant="ghost" size="sm" onClick={resetTimer}>
          Reset
        </AppButton>
      </div>
    </div>
  );
}
