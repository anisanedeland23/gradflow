"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { addActivityLog } from "@/lib/activityLog";
import type { FocusSession } from "@/types/gradflow";

// ===============================
// DEFAULT TIMER CONFIG
// ===============================
// Default awal tetap Pomodoro style.
// User bisa mengubah dari UI Daily Log.
const DEFAULT_FOCUS_DURATION = 25 * 60;
const DEFAULT_BREAK_DURATION = 5 * 60;

type TimerMode = "focus" | "break";
type TimerStatus = "idle" | "running" | "paused";

type FocusFlightContextType = {
  mode: TimerMode;
  timerStatus: TimerStatus;
  timeLeft: number;
  completedCycles: number;
  sessionTitle: string;
  category: string;
  sessionError: string;

  isRunning: boolean;
  isPaused: boolean;
  hasStarted: boolean;

  focusDuration: number;
  breakDuration: number;
  focusDurationMinutes: number;
  breakDurationMinutes: number;

  showPlaneMotivation: boolean;
  hidePlaneMotivation: () => void;

  setSessionTitle: (value: string) => void;
  setCategory: (value: string) => void;
  setFocusDurationMinutes: (value: number) => void;
  setBreakDurationMinutes: (value: number) => void;

  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;

  formatTimer: (seconds: number) => string;
};

type FocusFlightProviderProps = {
  children: ReactNode;
};

type PersistedTimerState = {
  mode: TimerMode;
  timerStatus: TimerStatus;
  timeLeft: number;
  completedCycles: number;
  sessionTitle: string;
  category: string;
  focusStartedAt: number | null;
  targetEndTime: number | null;
  focusDuration?: number;
  breakDuration?: number;
};

const FocusFlightContext = createContext<FocusFlightContextType | null>(null);

// ===============================
// LOCAL STORAGE KEY
// ===============================
const FOCUS_FLIGHT_TIMER_KEY = "gradflow-focus-flight-timer";

// ===============================
// DATE HELPER
// ===============================
const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

// ===============================
// FORMAT TIME HELPER
// ===============================
const formatTimerValue = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
};

// ===============================
// NUMBER HELPER
// ===============================
// Menjaga input durasi agar tetap masuk akal.
const clampNumber = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;

  return Math.min(Math.max(value, min), max);
};

export function FocusFlightProvider({ children }: FocusFlightProviderProps) {
  // ===============================
  // TIMER STATES
  // ===============================
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");

  const [focusDuration, setFocusDuration] = useState(DEFAULT_FOCUS_DURATION);
  const [breakDuration, setBreakDuration] = useState(DEFAULT_BREAK_DURATION);

  const [timeLeft, setTimeLeft] = useState(DEFAULT_FOCUS_DURATION);
  const [completedCycles, setCompletedCycles] = useState(0);

  const [focusStartedAt, setFocusStartedAt] = useState<number | null>(null);
  const [targetEndTime, setTargetEndTime] = useState<number | null>(null);

  // ===============================
  // SESSION FORM STATES
  // ===============================
  const [sessionTitle, setSessionTitleState] = useState("");
  const [category, setCategoryState] = useState("Coding");
  const [sessionError, setSessionError] = useState("");

  // ===============================
  // MOTIVATION ANIMATION STATE
  // ===============================
  const [showPlaneMotivation, setShowPlaneMotivation] = useState(false);

  // ===============================
  // LOAD PERSISTED TIMER
  // ===============================
  useEffect(() => {
    const savedTimer = localStorage.getItem(FOCUS_FLIGHT_TIMER_KEY);

    if (!savedTimer) return;

    const parsedTimer: PersistedTimerState = JSON.parse(savedTimer);

    const savedFocusDuration =
      parsedTimer.focusDuration ?? DEFAULT_FOCUS_DURATION;

    const savedBreakDuration =
      parsedTimer.breakDuration ?? DEFAULT_BREAK_DURATION;

    setFocusDuration(savedFocusDuration);
    setBreakDuration(savedBreakDuration);

    setMode(parsedTimer.mode);
    setTimerStatus(parsedTimer.timerStatus);
    setCompletedCycles(parsedTimer.completedCycles);
    setSessionTitleState(parsedTimer.sessionTitle);
    setCategoryState(parsedTimer.category);
    setFocusStartedAt(parsedTimer.focusStartedAt);
    setTargetEndTime(parsedTimer.targetEndTime);

    if (parsedTimer.timerStatus === "running" && parsedTimer.targetEndTime) {
      const remainingSeconds = Math.max(
        0,
        Math.ceil((parsedTimer.targetEndTime - Date.now()) / 1000),
      );

      setTimeLeft(remainingSeconds);
      return;
    }

    setTimeLeft(
      parsedTimer.timeLeft ??
        (parsedTimer.mode === "break"
          ? savedBreakDuration
          : savedFocusDuration),
    );
  }, []);

  // ===============================
  // SAVE PERSISTED TIMER
  // ===============================
  useEffect(() => {
    const timerState: PersistedTimerState = {
      mode,
      timerStatus,
      timeLeft,
      completedCycles,
      sessionTitle,
      category,
      focusStartedAt,
      targetEndTime,
      focusDuration,
      breakDuration,
    };

    localStorage.setItem(FOCUS_FLIGHT_TIMER_KEY, JSON.stringify(timerState));
  }, [
    mode,
    timerStatus,
    timeLeft,
    completedCycles,
    sessionTitle,
    category,
    focusStartedAt,
    targetEndTime,
    focusDuration,
    breakDuration,
  ]);

  // ===============================
  // SAVE COMPLETED FOCUS CYCLE
  // ===============================
  const saveCompletedFocusCycle = () => {
    const savedSessions = localStorage.getItem(STORAGE_KEYS.focusSessions);

    const existingSessions: FocusSession[] = savedSessions
      ? JSON.parse(savedSessions)
      : [];

    const now = Date.now();
    const focusMinutes = focusDuration / 60;
    const breakMinutes = breakDuration / 60;

    const newSession: FocusSession = {
      id: now,
      title: sessionTitle.trim(),
      category,
      focusMinutes,
      breakMinutes,
      completedCycles: 1,
      totalFocusMinutes: focusMinutes,
      date: getTodayDate(),
      startedAt: focusStartedAt ?? now,
      completedAt: now,
    };

    const updatedSessions = [newSession, ...existingSessions];

    localStorage.setItem(
      STORAGE_KEYS.focusSessions,
      JSON.stringify(updatedSessions),
    );

    addActivityLog({
      type: "focus_session_completed",
      title: "Completed focus flight",
      description: `${newSession.title} • ${newSession.totalFocusMinutes} min`,
    });
  };

  // ===============================
  // PHASE HANDLERS
  // ===============================
  const moveToBreakMode = () => {
    saveCompletedFocusCycle();

    setShowPlaneMotivation(true);

    setCompletedCycles((previousCycles) => previousCycles + 1);
    setMode("break");
    setTimeLeft(breakDuration);
    setFocusStartedAt(null);
    setTargetEndTime(Date.now() + breakDuration * 1000);
  };

  const moveToFocusMode = () => {
    setMode("focus");
    setTimeLeft(focusDuration);
    setFocusStartedAt(Date.now());
    setTargetEndTime(Date.now() + focusDuration * 1000);
  };

  // ===============================
  // TIMER COUNTDOWN
  // ===============================
  useEffect(() => {
    if (timerStatus !== "running") return;
    if (!targetEndTime) return;

    const interval = setInterval(() => {
      const remainingSeconds = Math.max(
        0,
        Math.ceil((targetEndTime - Date.now()) / 1000),
      );

      setTimeLeft(remainingSeconds);

      if (remainingSeconds > 0) return;

      if (mode === "focus") {
        moveToBreakMode();
        return;
      }

      moveToFocusMode();
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStatus, targetEndTime, mode, focusDuration, breakDuration]);

  // ===============================
  // ACTIONS
  // ===============================
  const startTimer = () => {
    if (sessionTitle.trim() === "") {
      setSessionError("Mission name is required before takeoff.");
      return;
    }

    setSessionError("");

    const now = Date.now();

    if (!focusStartedAt && mode === "focus") {
      setFocusStartedAt(now);
    }

    setTimerStatus("running");
    setTargetEndTime(now + timeLeft * 1000);
  };

  const pauseTimer = () => {
    if (!targetEndTime) {
      setTimerStatus("paused");
      return;
    }

    const remainingSeconds = Math.max(
      0,
      Math.ceil((targetEndTime - Date.now()) / 1000),
    );

    setTimeLeft(remainingSeconds);
    setTimerStatus("paused");
    setTargetEndTime(null);
  };

  const resetTimer = () => {
    setMode("focus");
    setTimerStatus("idle");
    setTimeLeft(focusDuration);
    setCompletedCycles(0);
    setFocusStartedAt(null);
    setTargetEndTime(null);
    setSessionError("");
    setShowPlaneMotivation(false);
  };

  const setSessionTitle = (value: string) => {
    setSessionTitleState(value);
    setSessionError("");
  };

  const setCategory = (value: string) => {
    setCategoryState(value);
  };

  const setFocusDurationMinutes = (value: number) => {
    const safeMinutes = clampNumber(value, 1, 180);
    const newDuration = safeMinutes * 60;

    setFocusDuration(newDuration);

    if (timerStatus === "idle" && mode === "focus") {
      setTimeLeft(newDuration);
    }
  };

  const setBreakDurationMinutes = (value: number) => {
    const safeMinutes = clampNumber(value, 1, 60);
    const newDuration = safeMinutes * 60;

    setBreakDuration(newDuration);

    if (timerStatus === "idle" && mode === "break") {
      setTimeLeft(newDuration);
    }
  };

  const hidePlaneMotivation = () => {
    setShowPlaneMotivation(false);
  };

  // ===============================
  // DERIVED STATES
  // ===============================
  const isRunning = timerStatus === "running";
  const isPaused = timerStatus === "paused";
  const hasStarted = timerStatus !== "idle";

  const focusDurationMinutes = focusDuration / 60;
  const breakDurationMinutes = breakDuration / 60;

  const value = useMemo(
    () => ({
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

      showPlaneMotivation,
      hidePlaneMotivation,

      setSessionTitle,
      setCategory,
      setFocusDurationMinutes,
      setBreakDurationMinutes,

      startTimer,
      pauseTimer,
      resetTimer,

      formatTimer: formatTimerValue,
    }),
    [
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
      showPlaneMotivation,
    ],
  );

  return (
    <FocusFlightContext.Provider value={value}>
      {children}
    </FocusFlightContext.Provider>
  );
}

// ===============================
// HOOK
// ===============================
export function useFocusFlight() {
  const context = useContext(FocusFlightContext);

  if (!context) {
    throw new Error("useFocusFlight must be used inside FocusFlightProvider");
  }

  return context;
}
