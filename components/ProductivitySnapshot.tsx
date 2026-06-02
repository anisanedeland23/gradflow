"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import type {
  Task,
  Internship,
  Goal,
  Event as CalendarEvent,
} from "@/types/gradflow";

type ProductivitySnapshotProps = {
  tasks: Task[];
  internships: Internship[];
  goals: Goal[];
};

export default function ProductivitySnapshot({
  tasks,
  internships,
  goals,
}: ProductivitySnapshotProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEYS.events);

    if (savedEvents) {
      const parsedEvents: CalendarEvent[] = JSON.parse(savedEvents);

      setEvents(parsedEvents);
    }
  }, []);

  // Fungsi untuk cek apakah sebuah tanggal masuk 7 hari ke depan.
  // Ini dipakai untuk menghitung "This Week Events".
  const isThisWeek = (dateString: string) => {
    if (!dateString) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextSevenDays = new Date(today);
    nextSevenDays.setDate(today.getDate() + 7);

    const targetDate = new Date(`${dateString}T00:00:00`);

    return targetDate >= today && targetDate <= nextSevenDays;
  };

  // Hitung task yang belum selesai.
  // Ini menunjukkan beban kerja task yang masih perlu dikerjakan.
  const pendingTasks = tasks.filter((task) => !task.completed).length;

  // Hitung event calendar dalam 7 hari ke depan.
  // Bisa berupa assignment, quiz, test, meeting, guidance, atau event.
  const thisWeekEvents = events.filter((event) =>
    isThisWeek(event.date),
  ).length;

  // Hitung goals yang masih aktif.
  // Goal yang Completed tidak dihitung sebagai active goal.
  const activeGoals = goals.filter(
    (goal) => goal.status !== "Completed",
  ).length;

  // Hitung internship yang masih perlu ditindaklanjuti.
  // Rejected dan Accepted tidak dihitung sebagai follow-up aktif.
  const internshipFollowUps = internships.filter(
    (internship) =>
      internship.status === "Wishlist" ||
      internship.status === "Applied" ||
      internship.status === "Interview",
  ).length;

  // Semua data snapshot digabung ke array
  // supaya UI bisa dirender dengan .map().
  const snapshotItems = [
    {
      title: "Pending Tasks",
      value: pendingTasks,
      description: "Tasks still need action",
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "This Week Events",
      value: thisWeekEvents,
      description: "Calendar items in 7 days",
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Active Goals",
      value: activeGoals,
      description: "Goals still in progress",
      color: "bg-orange-100 text-orange-700",
    },
    {
      title: "Internship Follow-ups",
      value: internshipFollowUps,
      description: "Applications to monitor",
      color: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-bold text-slate-800">
          Productivity Snapshot
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Quick overview of your current workload
        </p>
      </div>

      {/* SNAPSHOT LIST */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {snapshotItems.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-md"
          >
            <div
              className={`inline-flex rounded-xl px-3 py-2 text-sm font-bold ${item.color}`}
            >
              {item.value}
            </div>

            <h3 className="mt-3 text-sm font-semibold text-slate-800">
              {item.title}
            </h3>

            <p className="mt-1 text-xs text-slate-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
