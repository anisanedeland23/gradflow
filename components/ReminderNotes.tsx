"use client";

import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { addActivityLog } from "@/lib/activityLog";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import AppButton from "@/components/AppButton";
import EmptyState from "@/components/EmptyState";

import type { Event as CalendarEvent, Note } from "@/types/gradflow";

type ReminderTone = "sky" | "mint" | "lavender" | "neutral";

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
  // REMINDER TONE
  // ===============================
  const getReminderTone = (type: string): ReminderTone => {
    switch (type) {
      case "meeting":
        return "sky";

      case "guidance":
        return "mint";

      case "event":
        return "lavender";

      default:
        return "neutral";
    }
  };

  const toneStyles: Record<
    ReminderTone,
    {
      background: string;
      color: string;
      icon: string;
    }
  > = {
    sky: {
      background: "var(--gf-sky)",
      color: "var(--gf-link)",
      icon: "▣",
    },
    mint: {
      background: "var(--gf-mint)",
      color: "var(--gf-success)",
      icon: "✎",
    },
    lavender: {
      background: "var(--gf-lavender)",
      color: "var(--gf-primary)",
      icon: "✦",
    },
    neutral: {
      background: "var(--gf-surface)",
      color: "var(--gf-muted)",
      icon: "•",
    },
  };

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
            Reminder & Notes
          </p>

          <h2
            className="mt-2 text-xl font-semibold tracking-tight"
            style={{
              color: "var(--gf-ink)",
            }}
          >
            Keep small things visible
          </h2>

          <p
            className="mt-1 text-sm"
            style={{
              color: "var(--gf-muted)",
            }}
          >
            Calendar reminders and quick personal notes in one place.
          </p>
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
          style={{
            background: "var(--gf-yellow-soft)",
            color: "var(--gf-warning)",
          }}
        >
          📝
        </div>
      </div>

      {/* QUICK NOTE INPUT */}
      <div
        className="mt-6 rounded-2xl border p-4"
        style={{
          background: "var(--gf-card-soft)",
          borderColor: "var(--gf-border)",
        }}
      >
        <label
          className="text-sm font-semibold"
          style={{
            color: "var(--gf-ink)",
          }}
        >
          Quick Note
        </label>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            placeholder="Write a quick note..."
            value={inputNote}
            onChange={(e) => setInputNote(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                addNote();
              }
            }}
            className="gf-input flex-1"
          />

          <AppButton variant="primary" size="md" onClick={addNote}>
            Add
          </AppButton>
        </div>
      </div>

      {/* REMINDERS SECTION */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3
              className="text-sm font-semibold"
              style={{
                color: "var(--gf-ink)",
              }}
            >
              Upcoming Reminders
            </h3>

            <p
              className="mt-1 text-xs"
              style={{
                color: "var(--gf-muted)",
              }}
            >
              Meeting, event, and guidance items from Calendar.
            </p>
          </div>

          <span
            className="gf-badge"
            style={{
              background: "var(--gf-surface)",
              color: "var(--gf-muted)",
            }}
          >
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

        {reminders.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {reminders.slice(0, 3).map((reminder) => {
              const tone = toneStyles[getReminderTone(reminder.type)];

              return (
                <div
                  key={reminder.id}
                  className="rounded-2xl border p-3 transition hover:-translate-y-0.5"
                  style={{
                    background: "var(--gf-card-soft)",
                    borderColor: "var(--gf-border)",
                    boxShadow: "var(--gf-shadow-sm)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm"
                      style={{
                        background: tone.background,
                        color: tone.color,
                      }}
                    >
                      {tone.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h4
                            className="truncate text-sm font-semibold"
                            style={{
                              color: "var(--gf-ink)",
                            }}
                          >
                            {reminder.title}
                          </h4>

                          <p
                            className="mt-1 text-xs"
                            style={{
                              color: "var(--gf-muted)",
                            }}
                          >
                            {reminder.date}
                          </p>
                        </div>

                        <span
                          className="gf-badge w-fit shrink-0"
                          style={{
                            background: tone.background,
                            color: tone.color,
                          }}
                        >
                          {reminder.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NOTES SECTION */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3
              className="text-sm font-semibold"
              style={{
                color: "var(--gf-ink)",
              }}
            >
              Quick Notes
            </h3>

            <p
              className="mt-1 text-xs"
              style={{
                color: "var(--gf-muted)",
              }}
            >
              Small thoughts you do not want to lose.
            </p>
          </div>

          <span
            className="gf-badge"
            style={{
              background: "var(--gf-surface)",
              color: "var(--gf-muted)",
            }}
          >
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

        {notes.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {notes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                className="rounded-2xl border p-3 transition hover:-translate-y-0.5"
                style={{
                  background: "var(--gf-card-soft)",
                  borderColor: "var(--gf-border)",
                  boxShadow: "var(--gf-shadow-sm)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm"
                    style={{
                      background: "var(--gf-lavender)",
                      color: "var(--gf-primary)",
                    }}
                  >
                    ✦
                  </div>

                  <p
                    className="min-w-0 flex-1 text-sm leading-relaxed"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    {note.text}
                  </p>

                  <AppButton
                    variant="danger"
                    size="icon"
                    onClick={() => setNoteToDelete(note)}
                    aria-label="Delete note"
                  >
                    🗑
                  </AppButton>
                </div>
              </div>
            ))}
          </div>
        )}
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
    </section>
  );
}
