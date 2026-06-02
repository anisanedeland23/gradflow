"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storageKeys";

type EventType = {
  id: number;
  title: string;
  type: string;
  date: string;
};

export default function DeadlineSection() {
  const [deadlines, setDeadlines] = useState<EventType[]>([]);

  // LOAD EVENTS
  useEffect(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEYS.events);

    if (savedEvents) {
      const parsedEvents: EventType[] = JSON.parse(savedEvents);

      // FILTER DEADLINE ONLY
      const filteredDeadlines = parsedEvents.filter(
        (event) =>
          event.type === "assignment" ||
          event.type === "quiz" ||
          event.type === "test",
      );

      // SORT BY DATE
      filteredDeadlines.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      setDeadlines(filteredDeadlines);
    }
  }, []);

  const getDeadlineLabel = (type: string) => {
    if (type === "assignment") return "Assignment";
    if (type === "quiz") return "Quiz";
    if (type === "test") return "Test";

    return type;
  };

  const getDeadlineTone = (type: string) => {
    if (type === "assignment") {
      return {
        icon: "📝",
        background: "var(--gf-yellow-soft)",
        color: "var(--gf-warning)",
      };
    }

    if (type === "quiz") {
      return {
        icon: "❔",
        background: "var(--gf-lavender)",
        color: "var(--gf-primary)",
      };
    }

    if (type === "test") {
      return {
        icon: "⚠️",
        background: "var(--gf-danger-soft)",
        color: "var(--gf-danger)",
      };
    }

    return {
      icon: "📌",
      background: "var(--gf-surface)",
      color: "var(--gf-muted)",
    };
  };

  const isOverdue = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineDate = new Date(`${date}T00:00:00`);

    return deadlineDate < today;
  };

  return (
    <section className="gf-card p-5">
      {/* TOP */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-wide"
            style={{
              color: "var(--gf-muted)",
            }}
          >
            Upcoming Deadlines
          </p>

          <h2
            className="mt-2 text-xl font-semibold tracking-tight"
            style={{
              color: "var(--gf-ink)",
            }}
          >
            Academic due dates
          </h2>

          <p
            className="mt-1 text-sm"
            style={{
              color: "var(--gf-muted)",
            }}
          >
            Tasks from your calendar that need attention.
          </p>
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold"
          style={{
            background: "var(--gf-danger-soft)",
            color: "var(--gf-danger)",
          }}
        >
          {deadlines.length}
        </div>
      </div>

      {/* EMPTY */}
      {deadlines.length === 0 && (
        <div
          className="mt-6 rounded-2xl border border-dashed p-6 text-center"
          style={{
            background: "var(--gf-card-soft)",
            borderColor: "var(--gf-border)",
          }}
        >
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
            style={{
              background: "var(--gf-mint)",
              color: "var(--gf-success)",
            }}
          >
            ✓
          </div>

          <p
            className="mt-3 text-sm font-semibold"
            style={{
              color: "var(--gf-ink)",
            }}
          >
            No upcoming deadlines.
          </p>

          <p
            className="mt-1 text-xs"
            style={{
              color: "var(--gf-muted)",
            }}
          >
            Your deadline list will appear here after you add assignment, quiz,
            or test events in Calendar.
          </p>
        </div>
      )}

      {/* DEADLINE LIST */}
      {deadlines.length > 0 && (
        <div className="mt-5 flex flex-col gap-3">
          {deadlines.slice(0, 5).map((deadline) => {
            const tone = getDeadlineTone(deadline.type);
            const overdue = isOverdue(deadline.date);

            return (
              <div
                key={deadline.id}
                className="rounded-2xl border p-4 transition hover:-translate-y-0.5"
                style={{
                  background: overdue
                    ? "var(--gf-danger-soft)"
                    : "var(--gf-card-soft)",
                  borderColor: overdue
                    ? "var(--gf-danger)"
                    : "var(--gf-border)",
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
                    {tone.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3
                          className="font-semibold"
                          style={{
                            color: "var(--gf-ink)",
                          }}
                        >
                          {deadline.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className="gf-badge"
                            style={{
                              background: tone.background,
                              color: tone.color,
                            }}
                          >
                            {getDeadlineLabel(deadline.type)}
                          </span>

                          <span
                            className="gf-badge"
                            style={{
                              background: "var(--gf-surface)",
                              color: "var(--gf-muted)",
                            }}
                          >
                            {deadline.date}
                          </span>

                          {overdue && (
                            <span
                              className="gf-badge"
                              style={{
                                background: "var(--gf-danger-soft)",
                                color: "var(--gf-danger)",
                              }}
                            >
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>

                      <div
                        className="w-fit rounded-xl px-3 py-2 text-xs font-bold"
                        style={{
                          background: overdue
                            ? "var(--gf-danger)"
                            : "var(--gf-yellow)",
                          color: overdue ? "#ffffff" : "var(--gf-warning)",
                        }}
                      >
                        {overdue ? "OVERDUE" : "DUE"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deadlines.length > 5 && (
        <p
          className="mt-4 text-xs"
          style={{
            color: "var(--gf-muted)",
          }}
        >
          Showing 5 nearest deadlines from your calendar.
        </p>
      )}
    </section>
  );
}
