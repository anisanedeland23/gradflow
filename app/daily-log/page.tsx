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
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);

  // ===============================
  // DAILY REFLECTION STATES
  // ===============================
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
  useEffect(() => {
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
      ? {
          background: "var(--gf-sky)",
          color: "var(--gf-link)",
        }
      : {
          background: "var(--gf-yellow-soft)",
          color: "var(--gf-warning)",
        };

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

  const getContributionStyle = (minutes: number) => {
    if (minutes === 0) {
      return {
        background: "var(--gf-surface)",
        borderColor: "var(--gf-border)",
      };
    }

    if (minutes < 25) {
      return {
        background: "var(--gf-mint)",
        borderColor: "var(--gf-border)",
      };
    }

    if (minutes < 50) {
      return {
        background: "var(--gf-success-soft)",
        borderColor: "var(--gf-success)",
      };
    }

    if (minutes < 100) {
      return {
        background: "var(--gf-success)",
        borderColor: "var(--gf-success)",
      };
    }

    return {
      background: "var(--gf-primary)",
      borderColor: "var(--gf-primary)",
    };
  };

  // ===============================
  // WEEKLY EVALUATION DATA
  // ===============================
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
        background: "var(--gf-surface)",
        color: "var(--gf-muted)",
      };
    }

    if (weeklyDifference > 0) {
      return {
        title: "Improving flight path 🚀",
        description: `Your focus time increased by ${weeklyTrendPercentage}% compared to last week.`,
        background: "var(--gf-success-soft)",
        color: "var(--gf-success)",
      };
    }

    if (weeklyDifference < 0) {
      return {
        title: "Recovery flight needed 🌧️",
        description: `Your focus time dropped by ${Math.abs(
          weeklyTrendPercentage,
        )}% compared to last week. Refuel gently and restart.`,
        background: "var(--gf-yellow-soft)",
        color: "var(--gf-warning)",
      };
    }

    return {
      title: "Stable flight path ☁️",
      description:
        "Your focus time is similar to last week. Keep the rhythm steady.",
      background: "var(--gf-sky)",
      color: "var(--gf-link)",
    };
  };

  const weeklyStatus = getWeeklyStatus();

  // ===============================
  // SAVE DAILY REFLECTION
  // ===============================
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
    <main className="gf-page">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <section className="min-h-screen p-3 pt-20 sm:p-4 sm:pt-20 lg:ml-72 lg:p-5">
        {/* PAGE HEADER */}
        <div className="gf-panel p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Daily Log
              </p>

              <h1
                className="mt-2 text-3xl font-semibold tracking-tight"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                Focus Flight journal
              </h1>

              <p
                className="mt-2 max-w-3xl text-sm"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Track your focus flights, daily reflections, focus streak,
                contribution map, and learning rhythm.
              </p>
            </div>

            <div
              className="w-fit rounded-2xl px-4 py-3 text-sm font-bold"
              style={{
                background: "var(--gf-sky)",
                color: "var(--gf-link)",
              }}
            >
              Focus Flight Control ✈️
            </div>
          </div>
        </div>

        {/* HERO DAILY LOG GRID */}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
          {/* LEFT: FOCUS FLIGHT */}
          <div className="xl:col-span-8">
            <div className="gf-card p-6">
              {/* SECTION HEADER */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{
                      color: "var(--gf-muted)",
                    }}
                  >
                    Focus Flight
                  </p>

                  <h2
                    className="mt-2 text-xl font-semibold tracking-tight"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    Mission timer
                  </h2>

                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: "var(--gf-muted)",
                    }}
                  >
                    Plan your mission, fly with focus, refuel during transit,
                    and continue the journey.
                  </p>
                </div>

                <div
                  className="w-fit rounded-xl px-3 py-2 text-sm font-semibold"
                  style={modeBadgeStyle}
                >
                  {modeLabel}
                </div>
              </div>

              {/* FOCUS FLIGHT BODY */}
              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
                {/* MISSION SETUP */}
                <div
                  className="rounded-3xl border p-5 lg:col-span-2"
                  style={{
                    background: "var(--gf-card-soft)",
                    borderColor: "var(--gf-border)",
                  }}
                >
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-wide"
                      style={{
                        color: "var(--gf-muted)",
                      }}
                    >
                      Pre-Flight Setup
                    </p>

                    <h3
                      className="mt-2 text-lg font-semibold"
                      style={{
                        color: "var(--gf-ink)",
                      }}
                    >
                      Today&apos;s Mission
                    </h3>

                    <p
                      className="mt-1 text-sm"
                      style={{
                        color: "var(--gf-muted)",
                      }}
                    >
                      Decide where your focus flight is heading.
                    </p>
                  </div>

                  <div className="mt-5 flex flex-col gap-4">
                    <div>
                      <label
                        className="text-sm font-medium"
                        style={{
                          color: "var(--gf-ink)",
                        }}
                      >
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
                        className="gf-input mt-2 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label
                        className="text-sm font-medium"
                        style={{
                          color: "var(--gf-ink)",
                        }}
                      >
                        Flight Route
                      </label>

                      <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        disabled={hasStarted}
                        className="gf-input mt-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="Coding">Coding</option>
                        <option value="Skripsi">Skripsi</option>
                        <option value="Kuliah">Kuliah</option>
                        <option value="Career">Career</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
                      <div
                        className="rounded-2xl border p-4"
                        style={{
                          background: "var(--gf-card)",
                          borderColor: "var(--gf-border)",
                        }}
                      >
                        <label
                          className="text-xs font-medium"
                          style={{
                            color: "var(--gf-muted)",
                          }}
                        >
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
                            className="gf-input w-full disabled:cursor-not-allowed disabled:opacity-60"
                          />

                          <span
                            className="text-xs font-semibold"
                            style={{
                              color: "var(--gf-muted)",
                            }}
                          >
                            min
                          </span>
                        </div>
                      </div>

                      <div
                        className="rounded-2xl border p-4"
                        style={{
                          background: "var(--gf-card)",
                          borderColor: "var(--gf-border)",
                        }}
                      >
                        <label
                          className="text-xs font-medium"
                          style={{
                            color: "var(--gf-muted)",
                          }}
                        >
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
                            className="gf-input w-full disabled:cursor-not-allowed disabled:opacity-60"
                          />

                          <span
                            className="text-xs font-semibold"
                            style={{
                              color: "var(--gf-muted)",
                            }}
                          >
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

                    <h3 className="mt-4 text-6xl font-bold tracking-tight sm:text-7xl">
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
              <div
                className="mt-4 rounded-3xl border border-dashed p-5"
                style={{
                  background: "var(--gf-yellow-soft)",
                  borderColor: "var(--gf-warning)",
                  color: "var(--gf-warning)",
                }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold">
                      Transit / Refuel Reminder ⛽
                    </h3>

                    <p className="mt-1 text-sm">
                      Break time is not wasted time. It is your plane refueling
                      before the next flight.
                    </p>
                  </div>

                  <div
                    className="w-fit rounded-xl px-3 py-2 text-xs font-semibold"
                    style={{
                      background: "var(--gf-card)",
                      color: "var(--gf-warning)",
                    }}
                  >
                    Rest = part of progress
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SUMMARY + STREAK */}
          <div className="flex flex-col gap-4 xl:col-span-4">
            {/* TODAY SUMMARY COMPACT */}
            <div className="gf-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{
                      color: "var(--gf-muted)",
                    }}
                  >
                    Today Summary
                  </p>

                  <h2
                    className="mt-2 text-xl font-semibold tracking-tight"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    Flight Progress
                  </h2>
                </div>

                <div
                  className="rounded-xl px-3 py-2 text-xs font-bold"
                  style={{
                    background: "var(--gf-sky)",
                    color: "var(--gf-link)",
                  }}
                >
                  Today
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Focus Time",
                    value: `${focusTimeToday} min`,
                  },
                  {
                    label: "Completed Flights",
                    value: completedFlightsToday,
                  },
                  {
                    label: "Streak",
                    value: `${dailyFocusStreak} days`,
                  },
                  {
                    label: "Longest",
                    value: `${longestFlightToday} min`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border p-4"
                    style={{
                      background: "var(--gf-card-soft)",
                      borderColor: "var(--gf-border)",
                    }}
                  >
                    <p
                      className="text-xs font-medium"
                      style={{
                        color: "var(--gf-muted)",
                      }}
                    >
                      {item.label}
                    </p>

                    <h3
                      className="mt-1 text-xl font-semibold tracking-tight"
                      style={{
                        color: "var(--gf-ink)",
                      }}
                    >
                      {item.value}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            {/* DAILY FOCUS STREAK COMPACT */}
            <div className="gf-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{
                      color: "var(--gf-muted)",
                    }}
                  >
                    Daily Streak
                  </p>

                  <h2
                    className="mt-2 text-2xl font-semibold tracking-tight"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
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
                        className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition"
                        style={{
                          background: isActive
                            ? "var(--gf-success)"
                            : isCurrentDay
                              ? "var(--gf-sky)"
                              : "var(--gf-surface)",
                          borderColor: isActive
                            ? "var(--gf-success)"
                            : isCurrentDay
                              ? "var(--gf-link)"
                              : "var(--gf-border)",
                          color: isActive
                            ? "#ffffff"
                            : isCurrentDay
                              ? "var(--gf-link)"
                              : "var(--gf-muted)",
                        }}
                      >
                        {isActive ? "✓" : day.dayNumber}
                      </div>

                      <p
                        className="mt-2 text-[10px] font-semibold"
                        style={{
                          color: isCurrentDay
                            ? "var(--gf-link)"
                            : "var(--gf-muted)",
                        }}
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
          <div className="gf-card p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Focus Level
                </p>

                <h2
                  className="mt-2 text-3xl font-semibold tracking-tight"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Level {currentLevel} — {getLevelTitle(currentLevel)}
                </h2>

                <p
                  className="mt-2 text-sm"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Earn XP from every completed focus flight. Keep flying to
                  level up.
                </p>
              </div>

              <div
                className="w-fit rounded-2xl px-4 py-3 text-sm font-bold"
                style={{
                  background: "var(--gf-lavender)",
                  color: "var(--gf-primary)",
                }}
              >
                {currentLevelXp}/{XP_PER_LEVEL} XP
              </div>
            </div>

            <div className="mt-6">
              <div
                className="flex items-center justify-between text-xs font-semibold"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                <span>Progress to next level</span>
                <span>{levelProgress}%</span>
              </div>

              <div
                className="mt-2 h-4 overflow-hidden rounded-full"
                style={{
                  background: "var(--gf-surface)",
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${levelProgress}%`,
                    background: "var(--gf-primary)",
                  }}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  label: "Lifetime Focus",
                  value: `${totalFocusMinutes} min`,
                },
                {
                  label: "Current XP",
                  value: `${currentLevelXp} XP`,
                },
                {
                  label: "Next Level Target",
                  value: `${XP_PER_LEVEL - currentLevelXp} XP left`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border p-4"
                  style={{
                    background: "var(--gf-card-soft)",
                    borderColor: "var(--gf-border)",
                  }}
                >
                  <p
                    className="text-xs font-medium"
                    style={{
                      color: "var(--gf-muted)",
                    }}
                  >
                    {item.label}
                  </p>

                  <p
                    className="mt-1 text-lg font-semibold"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* FOCUS CONTRIBUTION GRID */}
          <div className="gf-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Focus Contribution
                </p>

                <h2
                  className="mt-2 text-2xl font-semibold tracking-tight"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Last 35 Days
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  A small map of your focus consistency. Every square is one
                  day.
                </p>
              </div>

              <div
                className="w-fit rounded-2xl px-4 py-3 text-sm font-bold"
                style={{
                  background: "var(--gf-mint)",
                  color: "var(--gf-success)",
                }}
              >
                {totalFocusMinutes} lifetime XP
              </div>
            </div>

            <div className="mt-6 overflow-x-auto pb-2">
              <div className="grid w-max grid-flow-col grid-rows-7 gap-2">
                {contributionDays.map((day) => {
                  const contributionStyle = getContributionStyle(
                    day.totalMinutes,
                  );

                  return (
                    <div
                      key={day.dateString}
                      title={`${day.dateString} • ${day.totalMinutes} min`}
                      className="h-5 w-5 rounded-md border transition hover:scale-110"
                      style={{
                        background: contributionStyle.background,
                        borderColor: contributionStyle.borderColor,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p
                className="text-xs"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Darker squares mean more focus minutes on that day.
              </p>

              <div className="flex items-center gap-2">
                <span
                  className="text-xs"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Less
                </span>

                {[0, 15, 35, 75, 120].map((minutes) => {
                  const contributionStyle = getContributionStyle(minutes);

                  return (
                    <div
                      key={minutes}
                      className="h-4 w-4 rounded border"
                      style={{
                        background: contributionStyle.background,
                        borderColor: contributionStyle.borderColor,
                      }}
                    />
                  );
                })}

                <span
                  className="text-xs"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  More
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LOWER GRID */}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* WEEKLY EVALUATION */}
          <div className="gf-card p-6">
            <p
              className="text-xs font-bold uppercase tracking-wide"
              style={{
                color: "var(--gf-muted)",
              }}
            >
              Weekly Evaluation
            </p>

            <h2
              className="mt-2 text-xl font-semibold tracking-tight"
              style={{
                color: "var(--gf-ink)",
              }}
            >
              Focus comparison
            </h2>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--gf-muted)",
              }}
            >
              Compare your last 7 days with the previous 7 days.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <div
                className="rounded-2xl border p-4"
                style={{
                  background: "var(--gf-card-soft)",
                  borderColor: "var(--gf-border)",
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Last 7 Days
                </p>

                <h3
                  className="mt-2 text-2xl font-semibold tracking-tight"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  {thisWeekFocusMinutes} min
                </h3>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  {getDateString(thisWeekStart)} — {getDateString(thisWeekEnd)}
                </p>
              </div>

              <div
                className="rounded-2xl border p-4"
                style={{
                  background: "var(--gf-card-soft)",
                  borderColor: "var(--gf-border)",
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Previous 7 Days
                </p>

                <h3
                  className="mt-2 text-2xl font-semibold tracking-tight"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  {lastWeekFocusMinutes} min
                </h3>

                <p
                  className="mt-1 text-xs"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  {getDateString(lastWeekStart)} — {getDateString(lastWeekEnd)}
                </p>
              </div>

              <div
                className="rounded-2xl p-4"
                style={{
                  background: weeklyStatus.background,
                  color: weeklyStatus.color,
                }}
              >
                <p className="text-sm font-bold">{weeklyStatus.title}</p>

                <p className="mt-1 text-xs">{weeklyStatus.description}</p>

                <div
                  className="mt-3 rounded-xl px-3 py-2 text-xs font-bold"
                  style={{
                    background: "var(--gf-card)",
                    color: weeklyStatus.color,
                  }}
                >
                  {weeklyDifference > 0
                    ? `+${weeklyDifference} min`
                    : `${weeklyDifference} min`}
                </div>
              </div>
            </div>
          </div>

          {/* DAILY REFLECTION */}
          <div className="gf-card p-6 xl:col-span-2">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Daily Reflection
              </p>

              <h2
                className="mt-2 text-xl font-semibold tracking-tight"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                Review today, prepare tomorrow
              </h2>

              <p
                className="mt-1 text-sm"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Capture what you learned today and what to continue tomorrow.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  What did I work on today?
                </label>

                <textarea
                  placeholder="Write your learning summary..."
                  value={dailySummary}
                  onChange={(event) => {
                    setDailySummary(event.target.value);
                    setReflectionMessage("");
                  }}
                  className="gf-input mt-2 min-h-32 resize-none"
                />
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Tomorrow priority
                </label>

                <textarea
                  placeholder="What should I continue tomorrow?"
                  value={tomorrowPriority}
                  onChange={(event) => {
                    setTomorrowPriority(event.target.value);
                    setReflectionMessage("");
                  }}
                  className="gf-input mt-2 min-h-32 resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {reflectionMessage ? (
                <p
                  className="rounded-xl px-4 py-3 text-sm font-medium"
                  style={{
                    background: reflectionMessage.includes("saved")
                      ? "var(--gf-success-soft)"
                      : "var(--gf-danger-soft)",
                    color: reflectionMessage.includes("saved")
                      ? "var(--gf-success)"
                      : "var(--gf-danger)",
                  }}
                >
                  {reflectionMessage}
                </p>
              ) : (
                <p
                  className="text-sm"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Save today&apos;s reflection so you can review your learning
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
    </main>
  );
}
