"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { addActivityLog } from "@/lib/activityLog";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import AppButton from "@/components/AppButton";
import EmptyState from "@/components/EmptyState";

import type { Event as CalendarEvent, Note } from "@/types/gradflow";

export default function ReminderNotes() {
  // ===============================
  // REMINDER STATE
  // ===============================
  // reminders menyimpan data reminder dari Calendar.
  // Reminder berasal dari event type: meeting, event, guidance.
  const [reminders, setReminders] = useState<CalendarEvent[]>([]);

  // ===============================
  // NOTES STATE
  // ===============================
  // notes menyimpan quick notes yang user tulis langsung dari dashboard.
  const [notes, setNotes] = useState<Note[]>([]);

  // noteToDelete menyimpan note yang sedang menunggu konfirmasi delete.
  // Kalau null, berarti delete modal tidak tampil.
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  // isLoaded dipakai agar notes tidak langsung menimpa localStorage
  // sebelum data lama selesai dibaca.
  const [isLoaded, setIsLoaded] = useState(false);

  // inputNote menyimpan teks sementara dari input.
  // Setelah user klik Add, teks ini akan masuk ke array notes.
  const [inputNote, setInputNote] = useState("");

  // ===============================
  // LOAD REMINDERS FROM CALENDAR
  // ===============================
  // Ambil semua event dari Calendar, lalu filter hanya event
  // yang sifatnya reminder, bukan deadline.
  useEffect(() => {
    const savedEvents = localStorage.getItem(STORAGE_KEYS.events);

    if (savedEvents) {
      const parsedEvents: CalendarEvent[] = JSON.parse(savedEvents);

      const filteredReminders = parsedEvents.filter(
        (event) =>
          event.type === "meeting" ||
          event.type === "event" ||
          event.type === "guidance",
      );

      filteredReminders.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      setReminders(filteredReminders);
    }
  }, []);

  // ===============================
  // LOAD NOTES
  // ===============================
  // Ambil quick notes dari localStorage saat component pertama kali muncul.
  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEYS.notes);

    if (savedNotes) {
      const parsedNotes: Note[] = JSON.parse(savedNotes);

      setNotes(parsedNotes);
    }

    setIsLoaded(true);
  }, []);

  // ===============================
  // SAVE NOTES
  // ===============================
  // Simpan notes ke localStorage setiap kali notes berubah.
  // Guard isLoaded mencegah localStorage lama ketimpa array kosong.
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
  }, [notes, isLoaded]);

  // ===============================
  // ADD NOTE
  // ===============================
  // Menambahkan note baru dari input Quick Note.
  const addNote = () => {
    if (inputNote.trim() === "") {
      return;
    }

    const newNote: Note = {
      id: Date.now(),
      text: inputNote,
      createdAt: Date.now(),
    };

    setNotes([newNote, ...notes]);

    addActivityLog({
      type: "note_added",
      title: "Added quick note",
      description: newNote.text,
    });

    setInputNote("");
  };

  // ===============================
  // DELETE NOTE
  // ===============================
  // Menghapus note setelah user klik Delete di ConfirmDeleteModal.
  const deleteNote = (id: number) => {
    const deletedNote = notes.find((note) => note.id === id);

    const filteredNotes = notes.filter((note) => note.id !== id);

    setNotes(filteredNotes);

    if (deletedNote) {
      addActivityLog({
        type: "note_deleted",
        title: "Deleted quick note",
        description: deletedNote.text,
      });
    }

    setNoteToDelete(null);
  };

  // ===============================
  // REMINDER COLOR
  // ===============================
  // Warna badge berdasarkan type reminder.
  const getReminderColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-700";

      case "guidance":
        return "bg-emerald-100 text-emerald-700";

      case "event":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      {/* HEADER */}
      <div>
        <h2 className="text-lg font-bold text-slate-800">Reminder & Notes</h2>

        <p className="mt-1 text-sm text-slate-500">
          Reminders from calendar and quick personal notes
        </p>
      </div>

      {/* QUICK NOTE INPUT */}
      <div className="mt-5 rounded-2xl bg-slate-50 p-3">
        <label className="text-sm font-semibold text-slate-700">
          Quick Note
        </label>

        <div className="mt-2 flex gap-2">
          <input
            type="text"
            placeholder="Write a quick note..."
            value={inputNote}
            onChange={(e) => setInputNote(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
          />

          <AppButton variant="primary" size="md" onClick={addNote}>
            Add
          </AppButton>
        </div>
      </div>

      {/* REMINDERS SECTION */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Upcoming Reminders
          </h3>

          <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {reminders.length}
          </span>
        </div>

        {reminders.length === 0 && (
          <div className="mt-3">
            <EmptyState
              title="No reminders yet."
              description="Calendar reminders will appear here."
              size="sm"
            />
          </div>
        )}

        <div className="mt-3 flex flex-col gap-2">
          {reminders.slice(0, 3).map((reminder) => (
            <div
              key={reminder.id}
              className="rounded-2xl border border-slate-200 bg-white p-3 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    {reminder.title}
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">{reminder.date}</p>
                </div>

                <span
                  className={`rounded-xl px-2 py-1 text-[10px] font-semibold ${getReminderColor(
                    reminder.type,
                  )}`}
                >
                  {reminder.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NOTES SECTION */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Quick Notes</h3>

          <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {notes.length}
          </span>
        </div>

        {notes.length === 0 && (
          <div className="mt-3">
            <EmptyState
              title="No quick notes yet."
              description="Write a quick note to keep important thoughts visible."
              size="sm"
            />
          </div>
        )}

        <div className="mt-3 flex flex-col gap-2">
          {notes.slice(0, 3).map((note) => (
            <div
              key={note.id}
              className="flex items-start justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 transition hover:shadow-md"
            >
              <p className="text-sm text-slate-700">{note.text}</p>

              <AppButton
                variant="ghost"
                size="icon"
                onClick={() => setNoteToDelete(note)}
                className="text-red-500 hover:text-red-700"
              >
                🗑
              </AppButton>
            </div>
          ))}
        </div>
      </div>

      {/* DELETE NOTE MODAL */}
      <ConfirmDeleteModal
        isOpen={!!noteToDelete}
        title="Delete Note?"
        description="This action will permanently remove this quick note."
        itemName={noteToDelete?.text}
        itemDetail={
          noteToDelete
            ? `Created: ${new Date(
                noteToDelete.createdAt,
              ).toLocaleDateString()}`
            : undefined
        }
        onCancel={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            deleteNote(noteToDelete.id);
          }
        }}
      />
    </div>
  );
}
