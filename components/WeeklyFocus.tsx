"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import EmptyState from "@/components/EmptyState";

import type {
  Task,
  Internship,
  Goal,
  Event as CalendarEvent,
} from "@/types/gradflow";

type WeeklyFocusProps = {
  tasks: Task[];
  internships: Internship[];
  goals: Goal[];
};

type FocusTone = "sky" | "danger" | "lavender" | "mint" | "peach";

type FocusItem = {
  id: string;
  label: string;
  type: string;
  note: string;
  icon: string;
  tone: FocusTone;
};

export default function WeeklyFocus({
  tasks,
  internships,
  goals,
}: WeeklyFocusProps) {
  // ===============================
  // EVENTS STATE
  // ===============================
  // events menyimpan data dari Calendar.
  // Data ini berasal dari localStorage dengan key STORAGE_KEYS.events.
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // ===============================
  // LOAD EVENTS
  // ===============================
  // WeeklyFocus perlu membaca event dari Calendar
  // supaya bisa menampilkan event yang terjadi dalam 7 hari ke depan.
  useEffect(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEYS.events);

    if (savedEvents) {
      const parsedEvents: CalendarEvent[] = JSON.parse(savedEvents);

      setEvents(parsedEvents);
    }
  }, []);

  // ===============================
  // DATE HELPER
  // ===============================
  // Mengecek apakah sebuah tanggal berada dalam rentang hari ini
  // sampai 7 hari ke depan.
  const isThisWeek = (dateString: string) => {
    if (!dateString) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextSevenDays = new Date(today);
    nextSevenDays.setDate(today.getDate() + 7);

    const targetDate = new Date(`${dateString}T00:00:00`);

    return targetDate >= today && targetDate <= nextSevenDays;
  };

  // ===============================
  // TASK FOCUS
  // ===============================
  // Ambil task yang belum selesai.
  // Maksimal 2 supaya card tidak terlalu penuh.
  const pendingTasks = tasks.filter((task) => !task.completed).slice(0, 2);

  // ===============================
  // EVENT FOCUS
  // ===============================
  // Ambil event calendar yang terjadi dalam 7 hari ke depan.
  // Bisa berupa assignment, quiz, test, meeting, guidance, atau event.
  const thisWeekEvents = events
    .filter((event) => isThisWeek(event.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 2);

  // ===============================
  // INTERNSHIP FOCUS
  // ===============================
  // Ambil internship yang masih aktif.
  // Accepted dan Rejected tidak masuk karena sudah selesai.
  const activeInternships = internships
    .filter(
      (internship) =>
        internship.status === "Wishlist" ||
        internship.status === "Applied" ||
        internship.status === "Interview",
    )
    .slice(0, 1);

  // ===============================
  // GOALS FOCUS
  // ===============================
  // Ambil goal yang belum completed.
  const activeGoals = goals
    .filter((goal) => goal.status !== "Completed")
    .slice(0, 1);

  const toneStyles: Record<
    FocusTone,
    {
      background: string;
      color: string;
    }
  > = {
    sky: {
      background: "var(--gf-sky)",
      color: "var(--gf-link)",
    },
    danger: {
      background: "var(--gf-danger-soft)",
      color: "var(--gf-danger)",
    },
    lavender: {
      background: "var(--gf-lavender)",
      color: "var(--gf-primary)",
    },
    mint: {
      background: "var(--gf-mint)",
      color: "var(--gf-success)",
    },
    peach: {
      background: "var(--gf-peach)",
      color: "var(--gf-warning)",
    },
  };

  // ===============================
  // COMBINE FOCUS ITEMS
  // ===============================
  // Semua data focus digabung menjadi satu array
  // supaya UI bisa dirender dengan .map().
  const focusItems: FocusItem[] = [
    ...pendingTasks.map((task) => ({
      id: `task-${task.id}`,
      label: task.text,
      type: "Task",
      note: task.deadline ? `Deadline: ${task.deadline}` : "No deadline",
      icon: "✓",
      tone: "sky" as FocusTone,
    })),

    ...thisWeekEvents.map((event) => {
      const isDeadline =
        event.type === "assignment" ||
        event.type === "quiz" ||
        event.type === "test";

      return {
        id: `event-${event.id}`,
        label: event.title,
        type: event.type,
        note: `Date: ${event.date}`,
        icon: isDeadline ? "⏰" : "▣",
        tone: isDeadline ? ("danger" as FocusTone) : ("lavender" as FocusTone),
      };
    }),

    ...activeInternships.map((internship) => ({
      id: `internship-${internship.id}`,
      label: internship.company,
      type: "Internship",
      note: `${internship.role} • ${internship.status}`,
      icon: "◇",
      tone: "mint" as FocusTone,
    })),

    ...activeGoals.map((goal) => ({
      id: `goal-${goal.id}`,
      label: goal.title,
      type: "Goal",
      note: `${goal.progress}/${goal.target} progress`,
      icon: "◎",
      tone: "peach" as FocusTone,
    })),
  ];

  return (
    <section className="gf-card p-5">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-wide"
            style={{
              color: "var(--gf-muted)",
            }}
          >
            Weekly Focus
          </p>

          <h2
            className="mt-2 text-xl font-semibold tracking-tight"
            style={{
              color: "var(--gf-ink)",
            }}
          >
            This week&apos;s attention list
          </h2>

          <p
            className="mt-1 text-sm"
            style={{
              color: "var(--gf-muted)",
            }}
          >
            Tasks, calendar items, applications, and goals that need care.
          </p>
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold"
          style={{
            background: "var(--gf-lavender)",
            color: "var(--gf-primary)",
          }}
        >
          {focusItems.length}
        </div>
      </div>

      {/* EMPTY STATE */}
      {focusItems.length === 0 && (
        <div className="mt-5">
          <EmptyState
            title="No focus items this week."
            description="Tasks, events, internships, and goals will appear here."
            size="sm"
          />
        </div>
      )}

      {/* FOCUS LIST */}
      {focusItems.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          {focusItems.map((item) => {
            const tone = toneStyles[item.tone];

            return (
              <div
                key={item.id}
                className="rounded-2xl border p-4 transition hover:-translate-y-0.5"
                style={{
                  background: "var(--gf-card-soft)",
                  borderColor: "var(--gf-border)",
                  boxShadow: "var(--gf-shadow-sm)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base"
                    style={{
                      background: tone.background,
                      color: tone.color,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3
                          className="truncate text-sm font-semibold"
                          style={{
                            color: "var(--gf-ink)",
                          }}
                        >
                          {item.label}
                        </h3>

                        <p
                          className="mt-1 text-xs"
                          style={{
                            color: "var(--gf-muted)",
                          }}
                        >
                          {item.note}
                        </p>
                      </div>

                      <span
                        className="gf-badge w-fit shrink-0"
                        style={{
                          background: tone.background,
                          color: tone.color,
                        }}
                      >
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
