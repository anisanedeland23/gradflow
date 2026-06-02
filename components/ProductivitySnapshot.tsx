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

type SnapshotTone = "sky" | "lavender" | "peach" | "mint";

type SnapshotItem = {
  title: string;
  value: number;
  description: string;
  icon: string;
  tone: SnapshotTone;
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

  const toneStyles: Record<
    SnapshotTone,
    {
      background: string;
      color: string;
    }
  > = {
    sky: {
      background: "var(--gf-sky)",
      color: "var(--gf-link)",
    },
    lavender: {
      background: "var(--gf-lavender)",
      color: "var(--gf-primary)",
    },
    peach: {
      background: "var(--gf-peach)",
      color: "var(--gf-warning)",
    },
    mint: {
      background: "var(--gf-mint)",
      color: "var(--gf-success)",
    },
  };

  // Semua data snapshot digabung ke array
  // supaya UI bisa dirender dengan .map().
  const snapshotItems: SnapshotItem[] = [
    {
      title: "Pending Tasks",
      value: pendingTasks,
      description: "Tasks still need action",
      icon: "✓",
      tone: "sky",
    },
    {
      title: "This Week Events",
      value: thisWeekEvents,
      description: "Calendar items in 7 days",
      icon: "▣",
      tone: "lavender",
    },
    {
      title: "Active Goals",
      value: activeGoals,
      description: "Goals still in progress",
      icon: "◎",
      tone: "peach",
    },
    {
      title: "Internship Follow-ups",
      value: internshipFollowUps,
      description: "Applications to monitor",
      icon: "◇",
      tone: "mint",
    },
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
            Productivity Snapshot
          </p>

          <h2
            className="mt-2 text-xl font-semibold tracking-tight"
            style={{
              color: "var(--gf-ink)",
            }}
          >
            Current workload
          </h2>

          <p
            className="mt-1 text-sm"
            style={{
              color: "var(--gf-muted)",
            }}
          >
            Quick overview of what needs your attention.
          </p>
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
          style={{
            background: "var(--gf-yellow-soft)",
            color: "var(--gf-warning)",
          }}
        >
          ⚡
        </div>
      </div>

      {/* SNAPSHOT LIST */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {snapshotItems.map((item) => {
          const tone = toneStyles[item.tone];

          return (
            <div
              key={item.title}
              className="rounded-2xl border p-4 transition hover:-translate-y-0.5"
              style={{
                background: "var(--gf-card-soft)",
                borderColor: "var(--gf-border)",
                boxShadow: "var(--gf-shadow-sm)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base"
                  style={{
                    background: tone.background,
                    color: tone.color,
                  }}
                >
                  {item.icon}
                </div>

                <div
                  className="rounded-xl px-3 py-2 text-sm font-bold"
                  style={{
                    background: tone.background,
                    color: tone.color,
                  }}
                >
                  {item.value}
                </div>
              </div>

              <h3
                className="mt-4 text-sm font-semibold"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                {item.title}
              </h3>

              <p
                className="mt-1 text-xs leading-relaxed"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
