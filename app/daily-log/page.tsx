"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AppButton from "@/components/AppButton";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { useFocusFlight } from "@/components/FocusFlightProvider";
import type { FocusSession, DailyLog } from "@/types/gradflow";
import { ACTIVITY_LOG_UPDATED_EVENT, addActivityLog } from "@/lib/activityLog";

export default function DailyLogPage() {
  // ===============================
  // GLOBAL FOCUS FLIGHT STATE
  // ===============================
  // Semua logic timer sekarang berasal dari FocusFlightProvider.
  // Jadi timer tetap hidup walaupun user pindah halaman.
  const {
    mode,
    timerStatus,
    timeLeft,
    completedCycles,
    sessionTitle,
    category,
    sessionError,

    isRunning,
    isPaused,
    hasStarted,

    focusDuration,
    breakDuration,
    focusDurationMinutes,
    breakDurationMinutes,

    setSessionTitle,
    setCategory,
    setFocusDurationMinutes,
    setBreakDurationMinutes,

    startTimer,
    pauseTimer,
    resetTimer,

    formatTimer,
  } = useFocusFlight();

  // ===============================
  // FOCUS SESSION DATA
  // ===============================
  // focusSessions menyimpan semua sesi Focus Flight yang sudah selesai.
  // Data ini berasal dari localStorage gradflow-focus-sessions.
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);

  // ===============================
  // DAILY REFLECTION STATES
  // ===============================
  // Data ini dipakai untuk menyimpan catatan/refleksi harian user.
  const [dailySummary, setDailySummary] = useState("");
  const [tomorrowPriority, setTomorrowPriority] = useState("");
  const [reflectionMessage, setReflectionMessage] = useState("");

  // ===============================
  // LOAD FOCUS SESSIONS
  // ===============================
  const loadFocusSessions = () => {
    const savedSessions = localStorage.getItem(STORAGE_KEYS.focusSessions);

    if (savedSessions) {
      const parsedSessions: FocusSession[] = JSON.parse(savedSessions);

      setFocusSessions(parsedSessions);
      return;
    }

    setFocusSessions([]);
  };

  // ===============================
  // LOAD TODAY DAILY LOG
  // ===============================
  // Mengambil daily log hari ini dari localStorage.
  // Kalau sudah pernah disimpan, isi textarea akan otomatis muncul lagi.
  const loadTodayDailyLog = () => {
    const savedDailyLogs = localStorage.getItem(STORAGE_KEYS.dailyLogs);

    if (!savedDailyLogs) {
      return;
    }

    const parsedDailyLogs: DailyLog[] = JSON.parse(savedDailyLogs);

    const todayLog = parsedDailyLogs.find((log) => log.date === getTodayDate());

    if (!todayLog) {
      return;
    }

    setDailySummary(todayLog.summary);
    setTomorrowPriority(todayLog.tomorrowPriority);
  };

  // ===============================
  // DATE HELPERS
  // ===============================
  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const subtractDays = (date: Date, days: number) => {
    const copiedDate = new Date(date);

    copiedDate.setDate(copiedDate.getDate() - days);

    return copiedDate;
  };

  const getDateString = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const isDateBetween = (
    dateString: string,
    startDate: Date,
    endDate: Date,
  ) => {
    const targetDate = new Date(`${dateString}T00:00:00`);

    targetDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return targetDate >= startDate && targetDate <= endDate;
  };

  // ===============================
  // WEEK DAYS HELPER
  // ===============================
  // Menghasilkan 7 hari terakhir untuk visual streak.
  // Hari paling kanan adalah hari ini.
  const getLastSevenDays = () => {
    return Array.from({ length: 7 }).map((_, index) => {
      const date = subtractDays(new Date(), 6 - index);
      const dateString = date.toISOString().split("T")[0];

      return {
        date,
        dateString,
        dayLabel: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        dayNumber: date.getDate(),
      };
    });
  };

  // ===============================
  // AUTO REFRESH FOCUS SESSIONS
  // ===============================
  // Saat focus session selesai, addActivityLog akan mengirim event.
  // Event ini kita pakai untuk reload summary cards secara otomatis.
  useEffect(() => {
    // <<<<<< useEffect
    loadFocusSessions();
    loadTodayDailyLog();

    window.addEventListener(ACTIVITY_LOG_UPDATED_EVENT, loadFocusSessions);

    return () => {
      window.removeEventListener(ACTIVITY_LOG_UPDATED_EVENT, loadFocusSessions);
    };
  }, []);

  // ===============================
  // DERIVED UI STATES
  // ===============================
  const modeLabel =
    mode === "focus" ? "Flight Mode ✈️" : "Transit / Refuel Mode ⛽";

  const modeBadgeStyle =
    mode === "focus"
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-700";

  const timerSubtitle =
    mode === "focus"
      ? "Flight Mode — stay focused in the air"
      : "Transit Mode — refuel before the next flight";

  const timerMessage =
    mode === "focus"
      ? "Focus first. Transit break later. Keep flying."
      : "Break time is refuel time. Your next flight is loading.";

  // ===============================
  // TODAY SUMMARY DATA
  // ===============================
  const today = getTodayDate();

  const todaySessions = focusSessions.filter(
    (session) => session.date === today,
  );

  const focusTimeToday = todaySessions.reduce(
    (total, session) => total + session.totalFocusMinutes,
    0,
  );

  const completedFlightsToday = todaySessions.length;

  const longestFlightToday =
    todaySessions.length === 0
      ? 0
      : Math.max(...todaySessions.map((session) => session.totalFocusMinutes));

  // ===============================
  // DAILY FOCUS STREAK
  // ===============================
  // Streak dihitung dari hari berturut-turut yang punya minimal 1 focus session.
  const focusSessionDates = new Set(
    focusSessions.map((session) => session.date),
  );

  let dailyFocusStreak = 0;

  for (let dayOffset = 0; dayOffset < 365; dayOffset += 1) {
    const date = subtractDays(new Date(), dayOffset)
      .toISOString()
      .split("T")[0];

    if (focusSessionDates.has(date)) {
      dailyFocusStreak += 1;
    } else {
      break;
    }
  }

  // ===============================
  // LAST 7 DAYS STREAK DATA
  // ===============================
  const lastSevenDays = getLastSevenDays();

  // ===============================
  // FOCUS LEVEL DATA
  // ===============================
  // 1 menit fokus = 1 XP.
  // Setiap 100 XP, user naik 1 level.
  const totalFocusMinutes = focusSessions.reduce(
    (total, session) => total + session.totalFocusMinutes,
    0,
  );

  const XP_PER_LEVEL = 100;

  const currentLevel = Math.floor(totalFocusMinutes / XP_PER_LEVEL) + 1;

  const currentLevelXp = totalFocusMinutes % XP_PER_LEVEL;

  const levelProgress = Math.round((currentLevelXp / XP_PER_LEVEL) * 100);

  const getLevelTitle = (level: number) => {
    if (level === 1) return "Ground Learner";
    if (level === 2) return "Takeoff Student";
    if (level === 3) return "Sky Explorer";
    if (level === 4) return "Cloud Navigator";
    if (level === 5) return "Focus Pilot";

    return "GradFlow Captain";
  };

  // ===============================
  // FOCUS CONTRIBUTION DATA
  // ===============================
  // Contribution grid menampilkan 35 hari terakhir.
  // Ini mirip GitHub contribution graph, tapi berdasarkan focus minutes.
  const getLastContributionDays = () => {
    return Array.from({ length: 35 }).map((_, index) => {
      const date = subtractDays(new Date(), 34 - index);
      const dateString = date.toISOString().split("T")[0];

      const totalMinutes = focusSessions
        .filter((session) => session.date === dateString)
        .reduce((total, session) => total + session.totalFocusMinutes, 0);

      return {
        dateString,
        dayNumber: date.getDate(),
        totalMinutes,
      };
    });
  };

  const contributionDays = getLastContributionDays();

  const getContributionColor = (minutes: number) => {
    if (minutes === 0) {
      return "bg-slate-100 border-slate-200";
    }

    if (minutes < 25) {
      return "bg-green-100 border-green-200";
    }

    if (minutes < 50) {
      return "bg-green-300 border-green-300";
    }

    if (minutes < 100) {
      return "bg-green-500 border-green-500";
    }

    return "bg-green-700 border-green-700";
  };

  // ===============================
  // WEEKLY EVALUATION DATA
  // ===============================
  // Minggu ini dihitung sebagai 7 hari terakhir termasuk hari ini.
  // Minggu lalu dihitung sebagai 7 hari sebelumnya.
  const todayDate = new Date();

  const thisWeekStart = subtractDays(todayDate, 6);
  const thisWeekEnd = todayDate;

  const lastWeekStart = subtractDays(todayDate, 13);
  const lastWeekEnd = subtractDays(todayDate, 7);

  const thisWeekFocusMinutes = focusSessions
    .filter((session) =>
      isDateBetween(session.date, thisWeekStart, thisWeekEnd),
    )
    .reduce((total, session) => total + session.totalFocusMinutes, 0);

  const lastWeekFocusMinutes = focusSessions
    .filter((session) =>
      isDateBetween(session.date, lastWeekStart, lastWeekEnd),
    )
    .reduce((total, session) => total + session.totalFocusMinutes, 0);

  const weeklyDifference = thisWeekFocusMinutes - lastWeekFocusMinutes;

  const weeklyTrendPercentage =
    lastWeekFocusMinutes === 0
      ? thisWeekFocusMinutes > 0
        ? 100
        : 0
      : Math.round((weeklyDifference / lastWeekFocusMinutes) * 100);

  const getWeeklyStatus = () => {
    if (thisWeekFocusMinutes === 0 && lastWeekFocusMinutes === 0) {
      return {
        title: "Waiting for your first flight ✈️",
        description:
          "Weekly trend will appear after you complete focus sessions.",
        style: "bg-slate-50 text-slate-700",
      };
    }

    if (weeklyDifference > 0) {
      return {
        title: "Improving flight path 🚀",
        description: `Your focus time increased by ${weeklyTrendPercentage}% compared to last week.`,
        style: "bg-green-50 text-green-700",
      };
    }

    if (weeklyDifference < 0) {
      return {
        title: "Recovery flight needed 🌧️",
        description: `Your focus time dropped by ${Math.abs(
          weeklyTrendPercentage,
        )}% compared to last week. Refuel gently and restart.`,
        style: "bg-amber-50 text-amber-700",
      };
    }

    return {
      title: "Stable flight path ☁️",
      description:
        "Your focus time is similar to last week. Keep the rhythm steady.",
      style: "bg-blue-50 text-blue-700",
    };
  };

  const weeklyStatus = getWeeklyStatus();

  // ===============================
  // SAVE DAILY REFLECTION
  // ===============================
  // Menyimpan refleksi harian.
  // Kalau tanggal hari ini sudah punya log, data akan di-update.
  // Kalau belum ada, data baru akan dibuat.
  const saveDailyReflection = () => {
    if (dailySummary.trim() === "" && tomorrowPriority.trim() === "") {
      setReflectionMessage(
        "Write at least one reflection field before saving.",
      );
      return;
    }

    const savedDailyLogs = localStorage.getItem(STORAGE_KEYS.dailyLogs);

    const existingDailyLogs: DailyLog[] = savedDailyLogs
      ? JSON.parse(savedDailyLogs)
      : [];

    const todayDate = getTodayDate();
    const now = Date.now();

    const existingLog = existingDailyLogs.find((log) => log.date === todayDate);

    let updatedDailyLogs: DailyLog[];

    if (existingLog) {
      updatedDailyLogs = existingDailyLogs.map((log) => {
        if (log.date === todayDate) {
          return {
            ...log,
            summary: dailySummary,
            tomorrowPriority,
            updatedAt: now,
          };
        }

        return log;
      });
    } else {
      const newDailyLog: DailyLog = {
        id: now,
        date: todayDate,
        summary: dailySummary,
        blockers: "",
        tomorrowPriority,
        mood: "",
        createdAt: now,
        updatedAt: now,
      };

      updatedDailyLogs = [newDailyLog, ...existingDailyLogs];
    }

    localStorage.setItem(
      STORAGE_KEYS.dailyLogs,
      JSON.stringify(updatedDailyLogs),
    );

    addActivityLog({
      type: "daily_log_saved",
      title: "Saved daily log",
      description:
        dailySummary.trim() !== ""
          ? dailySummary.trim()
          : tomorrowPriority.trim(),
    });

    setReflectionMessage("Daily reflection saved.");
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex flex-col lg:flex-row">
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <section className="flex-1 p-3 sm:p-4 lg:p-5">
          {/* PAGE HEADER */}
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Daily Log</h1>

                <p className="mt-2 text-slate-500">
                  Track your focus flights, daily reflections, and learning
                  rhythm.
                </p>
              </div>

              <div className="w-fit rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600">
                Focus Flight Control ✈️
              </div>
            </div>
          </div>

          {/* HERO DAILY LOG GRID */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
            {/* LEFT: FOCUS FLIGHT */}
            <div className="xl:col-span-8">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                {/* SECTION HEADER */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Focus Flight
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Plan your mission, fly with focus, refuel during transit,
                      and continue the journey.
                    </p>
                  </div>

                  <div
                    className={`w-fit rounded-xl px-3 py-2 text-sm font-semibold ${modeBadgeStyle}`}
                  >
                    {modeLabel}
                  </div>
                </div>

                {/* FOCUS FLIGHT BODY */}
                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
                  {/* MISSION SETUP */}
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 lg:col-span-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Pre-Flight Setup
                      </p>

                      <h3 className="mt-2 text-lg font-bold text-slate-800">
                        Today's Mission
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Decide where your focus flight is heading.
                      </p>
                    </div>

                    <div className="mt-5 flex flex-col gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Mission Name
                        </label>

                        <input
                          type="text"
                          placeholder="Example: Belajar React Hooks"
                          value={sessionTitle}
                          onChange={(event) =>
                            setSessionTitle(event.target.value)
                          }
                          disabled={hasStarted}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Flight Route
                        </label>

                        <select
                          value={category}
                          onChange={(event) => setCategory(event.target.value)}
                          disabled={hasStarted}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                        >
                          <option value="Coding">Coding</option>
                          <option value="Skripsi">Skripsi</option>
                          <option value="Kuliah">Kuliah</option>
                          <option value="Career">Career</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white p-4">
                          <label className="text-xs font-medium text-slate-500">
                            Focus Flight
                          </label>

                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={180}
                              value={focusDurationMinutes}
                              onChange={(event) =>
                                setFocusDurationMinutes(
                                  Number(event.target.value),
                                )
                              }
                              disabled={hasStarted}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                            />

                            <span className="text-xs font-semibold text-slate-400">
                              min
                            </span>
                          </div>
                        </div>

                        <div className="rounded-2xl bg-white p-4">
                          <label className="text-xs font-medium text-slate-500">
                            Transit Break
                          </label>

                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={60}
                              value={breakDurationMinutes}
                              onChange={(event) =>
                                setBreakDurationMinutes(
                                  Number(event.target.value),
                                )
                              }
                              disabled={hasStarted}
                              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-800 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                            />

                            <span className="text-xs font-semibold text-slate-400">
                              min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FLIGHT COCKPIT */}
                  <div className="rounded-3xl bg-slate-950 p-6 text-white lg:col-span-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Flight Cockpit
                        </p>

                        <h3 className="mt-2 text-lg font-bold">
                          {mode === "focus"
                            ? "In the air — stay focused"
                            : "Transit stop — refuel your energy"}
                        </h3>
                      </div>

                      <div className="w-fit rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-slate-300">
                        Status: {timerStatus}
                      </div>
                    </div>

                    <div className="mt-8 text-center">
                      <p className="text-sm font-medium text-slate-400">
                        {timerSubtitle}
                      </p>

                      <h3 className="mt-4 text-7xl font-bold tracking-tight">
                        {formatTimer(timeLeft)}
                      </h3>

                      <p className="mt-4 text-sm text-slate-400">
                        {timerMessage}
                      </p>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white/10 p-4 text-center">
                        <p className="text-xs text-slate-400">
                          Completed Flights
                        </p>

                        <p className="mt-1 text-xl font-bold text-white">
                          {completedCycles}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/10 p-4 text-center">
                        <p className="text-xs text-slate-400">Current Mode</p>

                        <p className="mt-1 text-sm font-bold text-white">
                          {mode === "focus" ? "Flight" : "Transit"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/10 p-4 text-center">
                        <p className="text-xs text-slate-400">Route</p>

                        <p className="mt-1 text-sm font-bold text-white">
                          {category}
                        </p>
                      </div>
                    </div>

                    {sessionError && (
                      <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
                        {sessionError}
                      </p>
                    )}

                    {/* TIMER ACTIONS */}
                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <AppButton
                        variant="primary"
                        size="lg"
                        onClick={startTimer}
                        disabled={isRunning}
                      >
                        {isPaused ? "Resume" : "Start"}
                      </AppButton>

                      <AppButton
                        variant="secondary"
                        size="lg"
                        onClick={pauseTimer}
                        disabled={!isRunning}
                      >
                        Pause
                      </AppButton>

                      <AppButton
                        variant="ghost"
                        size="lg"
                        onClick={resetTimer}
                        disabled={!hasStarted && completedCycles === 0}
                      >
                        Reset
                      </AppButton>
                    </div>
                  </div>
                </div>

                {/* TRANSIT / REFUEL MESSAGE */}
                <div className="mt-4 rounded-3xl border border-dashed border-amber-200 bg-amber-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-amber-700">
                        Transit / Refuel Reminder ⛽
                      </h3>

                      <p className="mt-1 text-sm text-amber-700">
                        Break time is not wasted time. It is your plane
                        refueling before the next flight.
                      </p>
                    </div>

                    <div className="w-fit rounded-xl bg-white px-3 py-2 text-xs font-semibold text-amber-700">
                      Rest = part of progress
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: SUMMARY + STREAK */}
            <div className="flex flex-col gap-4 xl:col-span-4">
              {/* TODAY SUMMARY COMPACT */}
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Today Summary
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-slate-800">
                      Flight Progress
                    </h2>
                  </div>

                  <div className="rounded-xl bg-blue-100 px-3 py-2 text-xs font-bold text-blue-700">
                    Today
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Focus Time
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-slate-800">
                      {focusTimeToday} min
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Completed Flights
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-slate-800">
                      {completedFlightsToday}
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">Streak</p>

                    <h3 className="mt-1 text-xl font-bold text-slate-800">
                      {dailyFocusStreak} days
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Longest
                    </p>

                    <h3 className="mt-1 text-xl font-bold text-slate-800">
                      {longestFlightToday} min
                    </h3>
                  </div>
                </div>
              </div>

              {/* DAILY FOCUS STREAK COMPACT */}
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Daily Streak
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-slate-800">
                      🔥 {dailyFocusStreak} days
                    </h2>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-7 gap-2">
                  {lastSevenDays.map((day) => {
                    const isActive = focusSessionDates.has(day.dateString);
                    const isCurrentDay = day.dateString === today;

                    return (
                      <div key={day.dateString} className="text-center">
                        <div
                          className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition ${
                            isActive
                              ? "border-green-500 bg-green-500 text-white shadow-sm"
                              : isCurrentDay
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-slate-100 text-slate-400"
                          }`}
                        >
                          {isActive ? "✓" : day.dayNumber}
                        </div>

                        <p
                          className={`mt-2 text-[10px] font-semibold ${
                            isCurrentDay ? "text-blue-600" : "text-slate-500"
                          }`}
                        >
                          {day.dayLabel}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* GAMIFICATION GRID */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {/* FOCUS LEVEL */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Focus Level
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    Level {currentLevel} — {getLevelTitle(currentLevel)}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Earn XP from every completed focus flight. Keep flying to
                    level up.
                  </p>
                </div>

                <div className="w-fit rounded-2xl bg-purple-100 px-4 py-3 text-sm font-bold text-purple-700">
                  {currentLevelXp}/{XP_PER_LEVEL} XP
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Progress to next level</span>
                  <span>{levelProgress}%</span>
                </div>

                <div className="mt-2 h-4 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-purple-600 transition-all duration-500"
                    style={{
                      width: `${levelProgress}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Lifetime Focus
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {totalFocusMinutes} min
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Current XP
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {currentLevelXp} XP
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Next Level Target
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {XP_PER_LEVEL - currentLevelXp} XP left
                  </p>
                </div>
              </div>
            </div>

            {/* FOCUS CONTRIBUTION GRID */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Focus Contribution
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-800">
                    Last 35 Days
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    A small map of your focus consistency. Every square is one
                    day.
                  </p>
                </div>

                <div className="w-fit rounded-2xl bg-green-100 px-4 py-3 text-sm font-bold text-green-700">
                  {totalFocusMinutes} lifetime XP
                </div>
              </div>

              <div className="mt-6 overflow-x-auto pb-2">
                <div className="grid w-max grid-flow-col grid-rows-7 gap-2">
                  {contributionDays.map((day) => (
                    <div
                      key={day.dateString}
                      title={`${day.dateString} • ${day.totalMinutes} min`}
                      className={`h-5 w-5 rounded-md border transition hover:scale-110 ${getContributionColor(
                        day.totalMinutes,
                      )}`}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  Darker squares mean more focus minutes on that day.
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Less</span>

                  <div className="h-4 w-4 rounded bg-slate-100 ring-1 ring-slate-200" />
                  <div className="h-4 w-4 rounded bg-green-100 ring-1 ring-green-200" />
                  <div className="h-4 w-4 rounded bg-green-300 ring-1 ring-green-300" />
                  <div className="h-4 w-4 rounded bg-green-500 ring-1 ring-green-500" />
                  <div className="h-4 w-4 rounded bg-green-700 ring-1 ring-green-700" />

                  <span className="text-xs text-slate-400">More</span>
                </div>
              </div>
            </div>
          </div>

          {/* LOWER GRID */}
          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            {/* WEEKLY EVALUATION */}
            {/* WEEKLY EVALUATION */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800">
                Weekly Evaluation
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Compare your last 7 days with the previous 7 days.
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Last 7 Days
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-800">
                    {thisWeekFocusMinutes} min
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {getDateString(thisWeekStart)} —{" "}
                    {getDateString(thisWeekEnd)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-500">
                    Previous 7 Days
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-800">
                    {lastWeekFocusMinutes} min
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {getDateString(lastWeekStart)} —{" "}
                    {getDateString(lastWeekEnd)}
                  </p>
                </div>

                <div className={`rounded-2xl p-4 ${weeklyStatus.style}`}>
                  <p className="text-sm font-bold">{weeklyStatus.title}</p>

                  <p className="mt-1 text-xs">{weeklyStatus.description}</p>

                  <div className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs font-bold">
                    {weeklyDifference > 0
                      ? `+${weeklyDifference} min`
                      : `${weeklyDifference} min`}
                  </div>
                </div>
              </div>
            </div>

            {/* DAILY REFLECTION */}
            <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Daily Reflection
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Capture what you learned today and what to continue tomorrow.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    What did I work on today?
                  </label>

                  <textarea
                    placeholder="Write your learning summary..."
                    value={dailySummary}
                    onChange={(event) => {
                      setDailySummary(event.target.value);
                      setReflectionMessage("");
                    }}
                    className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Tomorrow priority
                  </label>

                  <textarea
                    placeholder="What should I continue tomorrow?"
                    value={tomorrowPriority}
                    onChange={(event) => {
                      setTomorrowPriority(event.target.value);
                      setReflectionMessage("");
                    }}
                    className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {reflectionMessage ? (
                  <p
                    className={`rounded-xl px-4 py-3 text-sm font-medium ${
                      reflectionMessage.includes("saved")
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {reflectionMessage}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    Save today’s reflection so you can review your learning
                    rhythm later.
                  </p>
                )}

                <AppButton
                  variant="primary"
                  size="lg"
                  onClick={saveDailyReflection}
                >
                  Save Daily Log
                </AppButton>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
