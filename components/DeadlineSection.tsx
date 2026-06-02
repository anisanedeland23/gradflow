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

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Upcoming Deadlines
          </h2>

          <p className="text-sm text-slate-500">Tasks from your calendar.</p>
        </div>

        <div className="rounded-xl bg-red-100 px-3 py-2 text-sm font-semibold text-red-600">
          {deadlines.length}
        </div>
      </div>

      {/* EMPTY */}
      {deadlines.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center">
          <p className="text-sm text-slate-500">No upcoming deadlines.</p>
        </div>
      )}

      {/* DEADLINE LIST */}
      <div className="mt-4 flex flex-col gap-3">
        {deadlines.slice(0, 5).map((deadline) => (
          <div
            key={deadline.id}
            className="rounded-2xl border border-red-100 bg-red-50 p-4 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">
                  {deadline.title}
                </h3>

                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-red-500">
                    {deadline.type}
                  </span>

                  <span className="text-sm text-slate-500">
                    {deadline.date}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-red-500 px-3 py-2 text-xs font-bold text-white">
                DEADLINE
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
