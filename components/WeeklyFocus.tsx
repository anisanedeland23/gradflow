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

  // ===============================
  // COMBINE FOCUS ITEMS
  // ===============================
  // Semua data focus digabung menjadi satu array
  // supaya UI bisa dirender dengan .map().
  const focusItems = [
    ...pendingTasks.map((task) => ({
      id: `task-${task.id}`,
      label: task.text,
      type: "Task",
      note: task.deadline ? `Deadline: ${task.deadline}` : "No deadline",
      color: "bg-blue-100 text-blue-700",
    })),

    ...thisWeekEvents.map((event) => ({
      id: `event-${event.id}`,
      label: event.title,
      type: event.type,
      note: `Date: ${event.date}`,
      color:
        event.type === "assignment" ||
        event.type === "quiz" ||
        event.type === "test"
          ? "bg-red-100 text-red-700"
          : "bg-purple-100 text-purple-700",
    })),

    ...activeInternships.map((internship) => ({
      id: `internship-${internship.id}`,
      label: internship.company,
      type: "Internship",
      note: `${internship.role} • ${internship.status}`,
      color: "bg-green-100 text-green-700",
    })),

    ...activeGoals.map((goal) => ({
      id: `goal-${goal.id}`,
      label: goal.title,
      type: "Goal",
      note: `${goal.progress}/${goal.target} progress`,
      color: "bg-orange-100 text-orange-700",
    })),
  ];

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Weekly Focus</h2>

          <p className="mt-1 text-sm text-slate-500">
            What needs your attention this week
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600">
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
      <div className="mt-5 flex flex-col gap-3">
        {focusItems.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  {item.label}
                </h3>

                <p className="mt-1 text-xs text-slate-500">{item.note}</p>
              </div>

              <span
                className={`rounded-xl px-3 py-2 text-xs font-semibold ${item.color}`}
              >
                {item.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
