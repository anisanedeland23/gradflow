"use client";

import Sidebar from "@/components/Sidebar";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import AppButton from "@/components/AppButton";
import ModalCloseButton from "@/components/ModalCloseButton";
import EmptyState from "@/components/EmptyState";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { addActivityLog } from "@/lib/activityLog";
import type { Event as CalendarEvent } from "@/types/gradflow";
import { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";

export default function CalendarPage() {
  // ===============================
  // MAIN STATES
  // ===============================
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ===============================
  // MODAL STATES
  // ===============================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  // ===============================
  // FORM STATES
  // ===============================
  const [title, setTitle] = useState("");
  const [type, setType] = useState("assignment");
  const [date, setDate] = useState("");
  const [eventError, setEventError] = useState("");

  // ===============================
  // CALENDAR UI STATES
  // ===============================
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(
    null,
  );

  // ===============================
  // CALENDAR DATE LOGIC
  // ===============================
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const daysInMonth = eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  });

  const startDay = getDay(monthStart);
  const emptyDays = Array.from({ length: startDay });

  const selectedDateEvents = selectedDate
    ? events.filter(
        (event) => event.date === format(selectedDate, "yyyy-MM-dd"),
      )
    : [];

  // ===============================
  // LOAD EVENTS
  // ===============================
  useEffect(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEYS.events);

    if (savedEvents) {
      const parsedEvents: CalendarEvent[] = JSON.parse(savedEvents);

      setEvents(parsedEvents);
    }

    setIsLoaded(true);
  }, []);

  // ===============================
  // SAVE EVENTS
  // ===============================
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
  }, [events, isLoaded]);

  // ===============================
  // FORM HELPERS
  // ===============================
  const resetForm = () => {
    setTitle("");
    setType("assignment");
    setDate("");
    setEventError("");
    setEditingEvent(null);
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setEventError("");

    if (!editingEvent) {
      setTitle("");
      setType("assignment");
      setDate("");
    }

    setEditingEvent(null);
  };

  const closeDateModal = () => {
    setSelectedDate(null);
    setIsDateModalOpen(false);
  };

  // ===============================
  // ADD / SAVE EVENT
  // ===============================
  const addEvent = () => {
    if (title.trim() === "") {
      setEventError("Event title is required.");
      return;
    }

    if (date.trim() === "") {
      setEventError("Date is required.");
      return;
    }

    if (editingEvent) {
      const updatedEvents = events.map((event) => {
        if (event.id === editingEvent.id) {
          return {
            ...event,
            title,
            type,
            date,
          };
        }

        return event;
      });

      setEvents(updatedEvents);
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now(),
        title,
        type,
        date,
      };

      setEvents([...events, newEvent]);

      addActivityLog({
        type: "event_added",
        title: "Added event",
        description: `${newEvent.title} on ${newEvent.date}`,
      });
    }

    resetForm();
    setIsModalOpen(false);
    setSelectedDate(null);
    setIsDateModalOpen(false);
  };

  // ===============================
  // DELETE EVENT
  // ===============================
  const deleteEvent = (id: number) => {
    const deletedEvent = events.find((event) => event.id === id);

    const filteredEvents = events.filter((event) => event.id !== id);

    setEvents(filteredEvents);

    if (deletedEvent) {
      addActivityLog({
        type: "event_deleted",
        title: "Deleted event",
        description: `${deletedEvent.title} • ${deletedEvent.date}`,
      });
    }

    setEventToDelete(null);
  };

  // ===============================
  // OPEN MODALS
  // ===============================
  const openAddModal = () => {
    resetForm();

    setSelectedDate(null);
    setIsDateModalOpen(false);
    setIsModalOpen(true);
  };

  const openAddModalFromDate = (day: Date) => {
    resetForm();

    setDate(format(day, "yyyy-MM-dd"));
    setSelectedDate(day);
    setIsDateModalOpen(false);
    setIsModalOpen(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);

    setTitle(event.title);
    setType(event.type);
    setDate(event.date);
    setEventError("");

    setIsModalOpen(true);
    setIsDateModalOpen(false);
  };

  return (
    <main className="gf-page">
      <Sidebar />

      <section className="min-h-screen p-3 pt-20 sm:p-4 sm:pt-20 lg:ml-72 lg:p-5">
        {/* PAGE HEADER */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800">Calendar</h1>

          <p className="mt-2 text-slate-500">
            Manage your academic and career schedule.
          </p>

          {/* ACTION BAR */}
          <div className="mt-6 flex flex-col gap-4 rounded-3xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Event Manager
              </h2>

              <p className="text-sm text-slate-500">
                Create and manage your schedule.
              </p>
            </div>

            <AppButton variant="primary" size="lg" onClick={openAddModal}>
              + Add Event
            </AppButton>
          </div>
        </div>

        {/* CALENDAR UI */}
        <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
          {/* TOP BAR */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Monthly Calendar
              </h2>

              <p className="text-sm text-slate-500">Visualize your schedule</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <AppButton
                variant="secondary"
                size="md"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                ←
              </AppButton>

              <div className="rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-700">
                {format(currentMonth, "MMMM yyyy")}
              </div>

              <AppButton
                variant="secondary"
                size="md"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                →
              </AppButton>
            </div>
          </div>

          {/* CALENDAR GRID */}
          <div className="mt-6 overflow-x-auto pb-2">
            <div className="grid min-w-[720px] grid-cols-7 gap-2">
              {/* DAY LABELS */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="rounded-xl bg-slate-100 py-3 text-center text-sm font-semibold text-slate-600"
                >
                  {day}
                </div>
              ))}

              {/* EMPTY CELLS BEFORE DATE 1 */}
              {emptyDays.map((_, index) => (
                <div key={index} className="h-28 rounded-2xl bg-transparent" />
              ))}

              {/* DAYS */}
              {daysInMonth.map((day) => {
                const dayEvents = events.filter(
                  (event) => event.date === format(day, "yyyy-MM-dd"),
                );

                return (
                  <div
                    key={day.toString()}
                    onClick={() => {
                      const hasEvents = dayEvents.length > 0;

                      if (hasEvents) {
                        setSelectedDate(day);
                        setIsDateModalOpen(true);
                        return;
                      }

                      openAddModalFromDate(day);
                    }}
                    className={`h-28 cursor-pointer rounded-2xl border p-2 transition hover:scale-[1.02] hover:shadow-md ${
                      isToday(day)
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-semibold ${
                          isToday(day) ? "text-blue-600" : "text-slate-700"
                        }`}
                      >
                        {format(day, "d")}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-col gap-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((event) => {
                        const isDeadline =
                          event.type === "assignment" ||
                          event.type === "quiz" ||
                          event.type === "test";

                        return (
                          <div
                            key={event.id}
                            className={`truncate rounded-lg px-2 py-1 text-[10px] font-medium text-white ${
                              isDeadline ? "bg-red-500" : "bg-blue-500"
                            }`}
                          >
                            {event.title}
                          </div>
                        );
                      })}

                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-slate-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* EVENT LIST */}
        <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Upcoming Events
              </h2>

              <p className="text-sm text-slate-500">
                Your scheduled activities and deadlines.
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
              {events.length} Events
            </div>
          </div>

          {events.length === 0 && (
            <div className="mt-6">
              <EmptyState
                title="No events yet."
                description="Add your first event to organize your schedule."
              />
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3">
            {[...events]
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
              )
              .map((event) => {
                const isDeadline =
                  event.type === "assignment" ||
                  event.type === "quiz" ||
                  event.type === "test";

                return (
                  <div
                    key={event.id}
                    className={`flex flex-col gap-4 rounded-2xl border p-4 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
                      isDeadline
                        ? "border-red-200 bg-red-50"
                        : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {event.title}
                      </h3>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-600">
                          {event.type}
                        </span>

                        <span className="text-sm text-slate-500">
                          {event.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                          isDeadline
                            ? "bg-red-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {isDeadline ? "DEADLINE" : "REMINDER"}
                      </div>

                      <AppButton
                        variant="warning"
                        size="icon"
                        onClick={() => openEditEvent(event)}
                      >
                        ✏️
                      </AppButton>

                      <AppButton
                        variant="danger"
                        size="icon"
                        onClick={() => setEventToDelete(event)}
                      >
                        🗑
                      </AppButton>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* ADD / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="my-6 w-full max-w-md scale-100 rounded-3xl bg-white p-6 shadow-2xl transition-all duration-300 animate-in zoom-in-95">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingEvent
                    ? "Edit Event"
                    : selectedDate
                      ? `Add Event • ${format(selectedDate, "MMM d")}`
                      : "Add New Event"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Organize your important schedule
                </p>
              </div>

              <ModalCloseButton onClick={closeEventModal} />
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Event Title
                </label>

                <input
                  type="text"
                  placeholder="Enter event..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Event Type
                </label>

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                >
                  <option value="assignment">Assignment</option>
                  <option value="quiz">Quiz</option>
                  <option value="test">Test</option>
                  <option value="event">Event</option>
                  <option value="guidance">Guidance</option>
                  <option value="meeting">Meeting</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>

              {eventError && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {eventError}
                </p>
              )}

              <AppButton
                variant="primary"
                size="lg"
                onClick={addEvent}
                className="mt-2"
              >
                {editingEvent ? "Save Changes" : "Save Event"}
              </AppButton>
            </div>
          </div>
        </div>
      )}

      {/* DATE EVENTS MODAL */}
      {selectedDate && isDateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="absolute inset-0" onClick={closeDateModal} />

          <div className="relative z-10 my-6 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {format(selectedDate, "MMMM d, yyyy")}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Events on this day
                </p>

                <AppButton
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setIsDateModalOpen(false);
                    setDate(format(selectedDate, "yyyy-MM-dd"));
                    setEditingEvent(null);
                    setTitle("");
                    setType("assignment");
                    setEventError("");
                    setIsModalOpen(true);
                  }}
                  className="mt-3"
                >
                  + Add Event
                </AppButton>
              </div>

              <ModalCloseButton onClick={closeDateModal} />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {selectedDateEvents.length === 0 && (
                <EmptyState
                  title="No events on this date."
                  description="Add an event for this date from the button above."
                />
              )}

              {selectedDateEvents.map((event) => {
                const isDeadline =
                  event.type === "assignment" ||
                  event.type === "quiz" ||
                  event.type === "test";

                return (
                  <div
                    key={event.id}
                    className={`rounded-2xl border p-4 ${
                      isDeadline
                        ? "border-red-200 bg-red-50"
                        : "border-blue-200 bg-blue-50"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {event.title}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {event.type}
                        </p>
                      </div>

                      <div
                        className={`w-fit rounded-xl px-3 py-2 text-xs font-semibold text-white ${
                          isDeadline ? "bg-red-500" : "bg-blue-500"
                        }`}
                      >
                        {isDeadline ? "DEADLINE" : "REMINDER"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DELETE EVENT MODAL */}
      <ConfirmDeleteModal
        isOpen={!!eventToDelete}
        title="Delete Event?"
        description="This action will permanently remove this event from your calendar."
        itemName={eventToDelete?.title}
        itemDetail={
          eventToDelete
            ? `${eventToDelete.type} • ${eventToDelete.date}`
            : undefined
        }
        onCancel={() => setEventToDelete(null)}
        onConfirm={() => {
          if (eventToDelete) {
            deleteEvent(eventToDelete.id);
          }
        }}
      />
    </main>
  );
}
