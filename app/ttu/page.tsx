"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import AppButton from "@/components/AppButton";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import type {
  TtuProfile,
  TtuChapter,
  TtuRevision,
  TtuGuidanceNote,
  TtuDeadline,
} from "@/types/gradflow";

const defaultChapters: TtuChapter[] = [
  {
    id: 1,
    title: "Bab 1 — Pendahuluan",
    status: "Not Started",
  },
  {
    id: 2,
    title: "Bab 2 — Landasan Teori",
    status: "Not Started",
  },
  {
    id: 3,
    title: "Bab 3 — Metodologi Penelitian",
    status: "Not Started",
  },
  {
    id: 4,
    title: "Bab 4 — Hasil dan Pembahasan",
    status: "Not Started",
  },
  {
    id: 5,
    title: "Bab 5 — Kesimpulan dan Saran",
    status: "Not Started",
  },
];

export default function TtuPage() {
  // ===============================
  // TTU PROFILE STATES
  // ===============================
  const [documentLink, setDocumentLink] = useState("");
  const [status, setStatus] = useState<TtuProfile["status"]>("Planning");
  const [nextAction, setNextAction] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  // ===============================
  // TTU CHAPTER STATES
  // ===============================
  const [chapters, setChapters] = useState<TtuChapter[]>(defaultChapters);

  // ===============================
  // TTU REVISION STATES
  // ===============================
  const [revisions, setRevisions] = useState<TtuRevision[]>([]);
  const [revisionText, setRevisionText] = useState("");
  const [revisionError, setRevisionError] = useState("");
  const [revisionToDelete, setRevisionToDelete] = useState<TtuRevision | null>(
    null,
  );

  // ===============================
  // TTU GUIDANCE NOTE STATES
  // ===============================
  const [guidanceNotes, setGuidanceNotes] = useState<TtuGuidanceNote[]>([]);
  const [guidanceDate, setGuidanceDate] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [guidanceNoteText, setGuidanceNoteText] = useState("");
  const [guidanceError, setGuidanceError] = useState("");
  const [guidanceToDelete, setGuidanceToDelete] =
    useState<TtuGuidanceNote | null>(null);

  // ===============================
  // TTU DEADLINE STATES
  // ===============================
  const [deadlines, setDeadlines] = useState<TtuDeadline[]>([]);
  const [deadlineTitle, setDeadlineTitle] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineType, setDeadlineType] =
    useState<TtuDeadline["type"]>("Submission");
  const [deadlineError, setDeadlineError] = useState("");
  const [deadlineToDelete, setDeadlineToDelete] = useState<TtuDeadline | null>(
    null,
  );

  // ===============================
  // LOAD TTU DATA
  // ===============================
  useEffect(() => {
    const savedProfile = localStorage.getItem(STORAGE_KEYS.ttuProfile);

    if (savedProfile) {
      const parsedProfile: TtuProfile = JSON.parse(savedProfile);

      setDocumentLink(parsedProfile.documentLink);
      setStatus(parsedProfile.status);
      setNextAction(parsedProfile.nextAction);
    }

    const savedChapters = localStorage.getItem(STORAGE_KEYS.ttuChapters);

    if (savedChapters) {
      const parsedChapters: TtuChapter[] = JSON.parse(savedChapters);

      setChapters(parsedChapters);
    } else {
      localStorage.setItem(
        STORAGE_KEYS.ttuChapters,
        JSON.stringify(defaultChapters),
      );
    }

    const savedRevisions = localStorage.getItem(STORAGE_KEYS.ttuRevisions);

    if (savedRevisions) {
      const parsedRevisions: TtuRevision[] = JSON.parse(savedRevisions);

      setRevisions(parsedRevisions);
    }

    const savedGuidanceNotes = localStorage.getItem(
      STORAGE_KEYS.ttuGuidanceNotes,
    );

    if (savedGuidanceNotes) {
      const parsedGuidanceNotes: TtuGuidanceNote[] =
        JSON.parse(savedGuidanceNotes);

      setGuidanceNotes(parsedGuidanceNotes);
    }

    const savedDeadlines = localStorage.getItem(STORAGE_KEYS.ttuDeadlines);

    if (savedDeadlines) {
      const parsedDeadlines: TtuDeadline[] = JSON.parse(savedDeadlines);

      setDeadlines(parsedDeadlines);
    }
  }, []);

  // ===============================
  // SAVE TTU PROFILE
  // ===============================
  const saveTtuProfile = () => {
    const newProfile: TtuProfile = {
      documentLink,
      status,
      nextAction,
      updatedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.ttuProfile, JSON.stringify(newProfile));

    setProfileMessage("TTU profile saved.");
  };

  // ===============================
  // OPEN DOCUMENT
  // ===============================
  const openDocument = () => {
    if (documentLink.trim() === "") {
      setProfileMessage("Add your Google Docs link first.");
      return;
    }

    window.open(documentLink, "_blank", "noopener,noreferrer");
  };

  // ===============================
  // UPDATE CHAPTER STATUS
  // ===============================
  const updateChapterStatus = (
    chapterId: number,
    newStatus: TtuChapter["status"],
  ) => {
    const updatedChapters = chapters.map((chapter) => {
      if (chapter.id === chapterId) {
        return {
          ...chapter,
          status: newStatus,
        };
      }

      return chapter;
    });

    setChapters(updatedChapters);

    localStorage.setItem(
      STORAGE_KEYS.ttuChapters,
      JSON.stringify(updatedChapters),
    );
  };

  // ===============================
  // CHAPTER SUMMARY
  // ===============================
  const doneChapters = chapters.filter(
    (chapter) => chapter.status === "Done",
  ).length;

  // ===============================
  // SAVE REVISIONS HELPER
  // ===============================
  const saveRevisions = (updatedRevisions: TtuRevision[]) => {
    setRevisions(updatedRevisions);

    localStorage.setItem(
      STORAGE_KEYS.ttuRevisions,
      JSON.stringify(updatedRevisions),
    );
  };

  // ===============================
  // ADD REVISION
  // ===============================
  const addRevision = () => {
    if (revisionText.trim() === "") {
      setRevisionError("Revision task is required.");
      return;
    }

    const newRevision: TtuRevision = {
      id: Date.now(),
      text: revisionText,
      completed: false,
      createdAt: Date.now(),
    };

    const updatedRevisions = [newRevision, ...revisions];

    saveRevisions(updatedRevisions);

    setRevisionText("");
    setRevisionError("");
  };

  // ===============================
  // TOGGLE REVISION
  // ===============================
  const toggleRevision = (id: number) => {
    const updatedRevisions = revisions.map((revision) => {
      if (revision.id === id) {
        return {
          ...revision,
          completed: !revision.completed,
        };
      }

      return revision;
    });

    saveRevisions(updatedRevisions);
  };

  // ===============================
  // DELETE REVISION
  // ===============================
  const deleteRevision = (id: number) => {
    const updatedRevisions = revisions.filter((revision) => revision.id !== id);

    saveRevisions(updatedRevisions);
    setRevisionToDelete(null);
  };

  // ===============================
  // REVISION SUMMARY
  // ===============================
  const pendingRevisions = revisions.filter(
    (revision) => !revision.completed,
  ).length;

  // ===============================
  // SAVE GUIDANCE NOTES HELPER
  // ===============================
  const saveGuidanceNotes = (updatedGuidanceNotes: TtuGuidanceNote[]) => {
    setGuidanceNotes(updatedGuidanceNotes);

    localStorage.setItem(
      STORAGE_KEYS.ttuGuidanceNotes,
      JSON.stringify(updatedGuidanceNotes),
    );
  };

  // ===============================
  // ADD GUIDANCE NOTE
  // ===============================
  const addGuidanceNote = () => {
    if (guidanceDate.trim() === "") {
      setGuidanceError("Guidance date is required.");
      return;
    }

    if (lecturer.trim() === "") {
      setGuidanceError("Lecturer name is required.");
      return;
    }

    if (guidanceNoteText.trim() === "") {
      setGuidanceError("Guidance note is required.");
      return;
    }

    const newGuidanceNote: TtuGuidanceNote = {
      id: Date.now(),
      date: guidanceDate,
      lecturer,
      note: guidanceNoteText,
      createdAt: Date.now(),
    };

    const updatedGuidanceNotes = [newGuidanceNote, ...guidanceNotes];

    saveGuidanceNotes(updatedGuidanceNotes);

    setGuidanceDate("");
    setLecturer("");
    setGuidanceNoteText("");
    setGuidanceError("");
  };

  // ===============================
  // DELETE GUIDANCE NOTE
  // ===============================
  const deleteGuidanceNote = (id: number) => {
    const updatedGuidanceNotes = guidanceNotes.filter(
      (guidanceNote) => guidanceNote.id !== id,
    );

    saveGuidanceNotes(updatedGuidanceNotes);
    setGuidanceToDelete(null);
  };

  // ===============================
  // SAVE DEADLINES HELPER
  // ===============================
  const saveDeadlines = (updatedDeadlines: TtuDeadline[]) => {
    setDeadlines(updatedDeadlines);

    localStorage.setItem(
      STORAGE_KEYS.ttuDeadlines,
      JSON.stringify(updatedDeadlines),
    );
  };

  // ===============================
  // ADD DEADLINE
  // ===============================
  const addDeadline = () => {
    if (deadlineTitle.trim() === "") {
      setDeadlineError("Deadline title is required.");
      return;
    }

    if (deadlineDate.trim() === "") {
      setDeadlineError("Deadline date is required.");
      return;
    }

    const newDeadline: TtuDeadline = {
      id: Date.now(),
      title: deadlineTitle,
      date: deadlineDate,
      type: deadlineType,
      createdAt: Date.now(),
    };

    const updatedDeadlines = [newDeadline, ...deadlines].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    saveDeadlines(updatedDeadlines);

    setDeadlineTitle("");
    setDeadlineDate("");
    setDeadlineType("Submission");
    setDeadlineError("");
  };

  // ===============================
  // DELETE DEADLINE
  // ===============================
  const deleteDeadline = (id: number) => {
    const updatedDeadlines = deadlines.filter((deadline) => deadline.id !== id);

    saveDeadlines(updatedDeadlines);
    setDeadlineToDelete(null);
  };

  // ===============================
  // UI HELPERS
  // ===============================
  const getChapterStatusStyle = (chapterStatus: TtuChapter["status"]) => {
    switch (chapterStatus) {
      case "Not Started":
        return {
          background: "var(--gf-surface)",
          color: "var(--gf-muted)",
        };

      case "Drafting":
        return {
          background: "var(--gf-sky)",
          color: "var(--gf-link)",
        };

      case "Review":
        return {
          background: "var(--gf-yellow-soft)",
          color: "var(--gf-warning)",
        };

      case "Revision":
        return {
          background: "var(--gf-danger-soft)",
          color: "var(--gf-danger)",
        };

      case "Done":
        return {
          background: "var(--gf-success-soft)",
          color: "var(--gf-success)",
        };

      default:
        return {
          background: "var(--gf-surface)",
          color: "var(--gf-muted)",
        };
    }
  };

  const getDeadlineTypeStyle = (type: TtuDeadline["type"]) => {
    switch (type) {
      case "Guidance":
        return {
          background: "var(--gf-mint)",
          color: "var(--gf-success)",
        };

      case "Submission":
        return {
          background: "var(--gf-sky)",
          color: "var(--gf-link)",
        };

      case "Seminar":
        return {
          background: "var(--gf-lavender)",
          color: "var(--gf-primary)",
        };

      case "Defense":
        return {
          background: "var(--gf-danger-soft)",
          color: "var(--gf-danger)",
        };

      case "Revision":
        return {
          background: "var(--gf-yellow-soft)",
          color: "var(--gf-warning)",
        };

      default:
        return {
          background: "var(--gf-surface)",
          color: "var(--gf-muted)",
        };
    }
  };

  return (
    <main className="gf-page">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <section className="min-h-screen p-3 pt-20 sm:p-4 sm:pt-20 lg:ml-72 lg:p-5">
        {/* PAGE HEADER */}
        <div className="gf-panel p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                TTU / Skripsi
              </p>

              <h1
                className="mt-2 text-3xl font-semibold tracking-tight"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                Skripsi control center
              </h1>

              <p
                className="mt-2 max-w-3xl text-sm"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Control center for your final project document, revisions,
                guidance notes, chapter progress, and important deadlines.
              </p>
            </div>

            <div
              className="w-fit rounded-2xl px-4 py-3 text-sm font-bold"
              style={{
                background: "var(--gf-lavender)",
                color: "var(--gf-primary)",
              }}
            >
              Academic Thesis
            </div>
          </div>
        </div>

        {/* TOP CONTROL GRID */}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* MAIN DOCUMENT LINK */}
          <div className="gf-card p-6 xl:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Main Document
                </p>

                <h2
                  className="mt-2 text-xl font-semibold tracking-tight"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  TTU Google Docs
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Save your main TTU / Skripsi document link here so it is easy
                  to access.
                </p>
              </div>

              <div
                className="rounded-xl px-3 py-2 text-xs font-semibold"
                style={{
                  background:
                    documentLink.trim() !== ""
                      ? "var(--gf-success-soft)"
                      : "var(--gf-surface)",
                  color:
                    documentLink.trim() !== ""
                      ? "var(--gf-success)"
                      : "var(--gf-muted)",
                }}
              >
                {documentLink.trim() !== "" ? "Linked" : "Not linked yet"}
              </div>
            </div>

            <div
              className="mt-6 rounded-3xl border border-dashed p-5"
              style={{
                background: "var(--gf-card-soft)",
                borderColor: "var(--gf-border)",
              }}
            >
              <label
                className="text-sm font-medium"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                Google Docs Link
              </label>

              <input
                type="url"
                placeholder="Paste your TTU Google Docs link here..."
                value={documentLink}
                onChange={(event) => {
                  setDocumentLink(event.target.value);
                  setProfileMessage("");
                }}
                className="gf-input mt-2"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <AppButton variant="primary" size="lg" onClick={saveTtuProfile}>
                  Save Link
                </AppButton>

                <AppButton
                  variant="secondary"
                  size="lg"
                  onClick={openDocument}
                  disabled={documentLink.trim() === ""}
                >
                  Open Document
                </AppButton>
              </div>
            </div>
          </div>

          {/* STATUS + NEXT ACTION */}
          <div className="gf-card p-6">
            <p
              className="text-xs font-bold uppercase tracking-wide"
              style={{
                color: "var(--gf-muted)",
              }}
            >
              Current Focus
            </p>

            <h2
              className="mt-2 text-xl font-semibold tracking-tight"
              style={{
                color: "var(--gf-ink)",
              }}
            >
              Status & Next Action
            </h2>

            <div className="mt-5 flex flex-col gap-4">
              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  TTU Status
                </label>

                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as TtuProfile["status"]);
                    setProfileMessage("");
                  }}
                  className="gf-input mt-2"
                >
                  <option value="Planning">Planning</option>
                  <option value="Drafting">Drafting</option>
                  <option value="Revision">Revision</option>
                  <option value="Ready for Review">Ready for Review</option>
                  <option value="Submitted">Submitted</option>
                </select>
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Next Action
                </label>

                <textarea
                  placeholder="Example: Revisi rumusan masalah dan kirim ke dosen pembimbing..."
                  value={nextAction}
                  onChange={(event) => {
                    setNextAction(event.target.value);
                    setProfileMessage("");
                  }}
                  className="gf-input mt-2 min-h-28 resize-none"
                />
              </div>

              <AppButton variant="primary" size="lg" onClick={saveTtuProfile}>
                Save Status
              </AppButton>

              {profileMessage && (
                <p
                  className="rounded-xl px-4 py-3 text-sm font-medium"
                  style={{
                    background: profileMessage.includes("saved")
                      ? "var(--gf-success-soft)"
                      : "var(--gf-danger-soft)",
                    color: profileMessage.includes("saved")
                      ? "var(--gf-success)"
                      : "var(--gf-danger)",
                  }}
                >
                  {profileMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* MIDDLE GRID */}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* CHAPTER PROGRESS */}
          <div className="gf-card p-6 xl:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Chapter Progress
                </p>

                <h2
                  className="mt-2 text-xl font-semibold tracking-tight"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Skripsi Chapters
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Track the status of each chapter from planning to done.
                </p>
              </div>

              <div
                className="rounded-xl px-3 py-2 text-xs font-bold"
                style={{
                  background: "var(--gf-success-soft)",
                  color: "var(--gf-success)",
                }}
              >
                {doneChapters}/{chapters.length} Done
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {chapters.map((chapter) => {
                const statusStyle = getChapterStatusStyle(chapter.status);

                return (
                  <div
                    key={chapter.id}
                    className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    style={{
                      background: "var(--gf-card-soft)",
                      borderColor: "var(--gf-border)",
                      boxShadow: "var(--gf-shadow-sm)",
                    }}
                  >
                    <div>
                      <h3
                        className="font-semibold"
                        style={{
                          color: "var(--gf-ink)",
                        }}
                      >
                        {chapter.title}
                      </h3>

                      <p
                        className="mt-1 text-xs"
                        style={{
                          color: "var(--gf-muted)",
                        }}
                      >
                        Update this chapter status as your writing progresses.
                      </p>

                      <span
                        className="gf-badge mt-2 inline-flex"
                        style={{
                          background: statusStyle.background,
                          color: statusStyle.color,
                        }}
                      >
                        {chapter.status}
                      </span>
                    </div>

                    <select
                      value={chapter.status}
                      onChange={(event) =>
                        updateChapterStatus(
                          chapter.id,
                          event.target.value as TtuChapter["status"],
                        )
                      }
                      className="gf-input w-full sm:w-44"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Drafting">Drafting</option>
                      <option value="Review">Review</option>
                      <option value="Revision">Revision</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* IMPORTANT DEADLINES */}
          <div className="gf-card p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Important Dates
                </p>

                <h2
                  className="mt-2 text-xl font-semibold tracking-tight"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  TTU Deadlines
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Keep your critical academic dates visible.
                </p>
              </div>

              <div
                className="rounded-xl px-3 py-2 text-xs font-semibold"
                style={{
                  background: "var(--gf-surface)",
                  color: "var(--gf-muted)",
                }}
              >
                {deadlines.length}
              </div>
            </div>

            {/* ADD DEADLINE FORM */}
            <div
              className="mt-6 rounded-3xl border border-dashed p-5"
              style={{
                background: "var(--gf-card-soft)",
                borderColor: "var(--gf-border)",
              }}
            >
              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Deadline Title
                </label>

                <input
                  type="text"
                  placeholder="Example: Submit Bab 1-3"
                  value={deadlineTitle}
                  onChange={(event) => {
                    setDeadlineTitle(event.target.value);
                    setDeadlineError("");
                  }}
                  className="gf-input mt-2"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <label
                    className="text-sm font-medium"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    Date
                  </label>

                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(event) => {
                      setDeadlineDate(event.target.value);
                      setDeadlineError("");
                    }}
                    className="gf-input mt-2"
                  />
                </div>

                <div>
                  <label
                    className="text-sm font-medium"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    Type
                  </label>

                  <select
                    value={deadlineType}
                    onChange={(event) => {
                      setDeadlineType(
                        event.target.value as TtuDeadline["type"],
                      );
                      setDeadlineError("");
                    }}
                    className="gf-input mt-2"
                  >
                    <option value="Guidance">Guidance</option>
                    <option value="Submission">Submission</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Defense">Defense</option>
                    <option value="Revision">Revision</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <AppButton
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={addDeadline}
                >
                  + Add Deadline
                </AppButton>
              </div>

              {deadlineError && (
                <p
                  className="mt-3 rounded-xl px-4 py-3 text-sm font-medium"
                  style={{
                    background: "var(--gf-danger-soft)",
                    color: "var(--gf-danger)",
                  }}
                >
                  {deadlineError}
                </p>
              )}
            </div>

            {/* DEADLINE LIST */}
            {deadlines.length === 0 && (
              <div className="mt-6">
                <div
                  className="rounded-2xl border border-dashed p-5 text-center"
                  style={{
                    background: "var(--gf-card-soft)",
                    borderColor: "var(--gf-border)",
                  }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    No deadline yet.
                  </p>

                  <p
                    className="mt-1 text-xs"
                    style={{
                      color: "var(--gf-muted)",
                    }}
                  >
                    Add seminar, submission, guidance, or revision dates.
                  </p>
                </div>
              </div>
            )}

            {deadlines.length > 0 && (
              <div className="mt-6 flex flex-col gap-3">
                {deadlines.map((deadline) => {
                  const deadlineStyle = getDeadlineTypeStyle(deadline.type);

                  return (
                    <div
                      key={deadline.id}
                      className="rounded-2xl border p-4"
                      style={{
                        background: "var(--gf-card-soft)",
                        borderColor: "var(--gf-border)",
                        boxShadow: "var(--gf-shadow-sm)",
                      }}
                    >
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
                                background: "var(--gf-surface)",
                                color: "var(--gf-muted)",
                              }}
                            >
                              {deadline.date}
                            </span>

                            <span
                              className="gf-badge"
                              style={{
                                background: deadlineStyle.background,
                                color: deadlineStyle.color,
                              }}
                            >
                              {deadline.type}
                            </span>
                          </div>
                        </div>

                        <AppButton
                          variant="danger"
                          size="icon"
                          onClick={() => setDeadlineToDelete(deadline)}
                        >
                          🗑
                        </AppButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* LOWER GRID */}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* REVISION CHECKLIST */}
          <div className="gf-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Revision Checklist
                </p>

                <h2
                  className="mt-2 text-xl font-semibold tracking-tight"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Action Items
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Turn guidance feedback into clear revision tasks.
                </p>
              </div>

              <div
                className="rounded-xl px-3 py-2 text-xs font-bold"
                style={{
                  background: "var(--gf-yellow-soft)",
                  color: "var(--gf-warning)",
                }}
              >
                {pendingRevisions} Pending
              </div>
            </div>

            {revisions.length === 0 && (
              <div className="mt-6">
                <div
                  className="rounded-2xl border border-dashed p-5 text-center"
                  style={{
                    background: "var(--gf-card-soft)",
                    borderColor: "var(--gf-border)",
                  }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    No revision tasks yet.
                  </p>

                  <p
                    className="mt-1 text-xs"
                    style={{
                      color: "var(--gf-muted)",
                    }}
                  >
                    Add tasks like “perbaiki latar belakang” or “tambahkan
                    jurnal”.
                  </p>
                </div>
              </div>
            )}

            {revisions.length > 0 && (
              <div className="mt-6 flex flex-col gap-3">
                {revisions.map((revision) => (
                  <div
                    key={revision.id}
                    className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                    style={{
                      background: "var(--gf-card-soft)",
                      borderColor: "var(--gf-border)",
                      boxShadow: "var(--gf-shadow-sm)",
                    }}
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={revision.completed}
                        onChange={() => toggleRevision(revision.id)}
                        className="mt-1 h-4 w-4 accent-[var(--gf-primary)]"
                      />

                      <span
                        className={`text-sm font-medium ${
                          revision.completed ? "line-through" : ""
                        }`}
                        style={{
                          color: revision.completed
                            ? "var(--gf-muted)"
                            : "var(--gf-ink)",
                        }}
                      >
                        {revision.text}
                      </span>
                    </label>

                    <AppButton
                      variant="danger"
                      size="icon"
                      onClick={() => setRevisionToDelete(revision)}
                    >
                      🗑
                    </AppButton>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                placeholder="Add revision task..."
                value={revisionText}
                onChange={(event) => {
                  setRevisionText(event.target.value);
                  setRevisionError("");
                }}
                className="gf-input w-full"
              />

              <AppButton variant="primary" size="lg" onClick={addRevision}>
                Add
              </AppButton>
            </div>

            {revisionError && (
              <p
                className="mt-3 rounded-xl px-4 py-3 text-sm font-medium"
                style={{
                  background: "var(--gf-danger-soft)",
                  color: "var(--gf-danger)",
                }}
              >
                {revisionError}
              </p>
            )}
          </div>

          {/* GUIDANCE NOTES */}
          <div className="gf-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Guidance Notes
                </p>

                <h2
                  className="mt-2 text-xl font-semibold tracking-tight"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Bimbingan Log
                </h2>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "var(--gf-muted)",
                  }}
                >
                  Record feedback and notes from your thesis advisor.
                </p>
              </div>

              <div
                className="rounded-xl px-3 py-2 text-xs font-bold"
                style={{
                  background: "var(--gf-lavender)",
                  color: "var(--gf-primary)",
                }}
              >
                {guidanceNotes.length} Notes
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Guidance Date
                </label>

                <input
                  type="date"
                  value={guidanceDate}
                  onChange={(event) => {
                    setGuidanceDate(event.target.value);
                    setGuidanceError("");
                  }}
                  className="gf-input mt-2"
                />
              </div>

              <div>
                <label
                  className="text-sm font-medium"
                  style={{
                    color: "var(--gf-ink)",
                  }}
                >
                  Lecturer
                </label>

                <input
                  type="text"
                  placeholder="Advisor name..."
                  value={lecturer}
                  onChange={(event) => {
                    setLecturer(event.target.value);
                    setGuidanceError("");
                  }}
                  className="gf-input mt-2"
                />
              </div>
            </div>

            <div className="mt-4">
              <label
                className="text-sm font-medium"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                Notes
              </label>

              <textarea
                placeholder="Write guidance notes or feedback..."
                value={guidanceNoteText}
                onChange={(event) => {
                  setGuidanceNoteText(event.target.value);
                  setGuidanceError("");
                }}
                className="gf-input mt-2 min-h-28 resize-none"
              />
            </div>

            <div className="mt-4">
              <AppButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={addGuidanceNote}
              >
                Save Guidance Note
              </AppButton>

              {guidanceError && (
                <p
                  className="mt-3 rounded-xl px-4 py-3 text-sm font-medium"
                  style={{
                    background: "var(--gf-danger-soft)",
                    color: "var(--gf-danger)",
                  }}
                >
                  {guidanceError}
                </p>
              )}
            </div>

            {guidanceNotes.length === 0 && (
              <div className="mt-6">
                <div
                  className="rounded-2xl border border-dashed p-5 text-center"
                  style={{
                    background: "var(--gf-card-soft)",
                    borderColor: "var(--gf-border)",
                  }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "var(--gf-ink)",
                    }}
                  >
                    No guidance notes yet.
                  </p>

                  <p
                    className="mt-1 text-xs"
                    style={{
                      color: "var(--gf-muted)",
                    }}
                  >
                    Save feedback from your advisor after each guidance session.
                  </p>
                </div>
              </div>
            )}

            {guidanceNotes.length > 0 && (
              <div className="mt-6 flex flex-col gap-3">
                {guidanceNotes.map((guidanceNote) => (
                  <div
                    key={guidanceNote.id}
                    className="rounded-2xl border p-4"
                    style={{
                      background: "var(--gf-card-soft)",
                      borderColor: "var(--gf-border)",
                      boxShadow: "var(--gf-shadow-sm)",
                    }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="gf-badge"
                            style={{
                              background: "var(--gf-lavender)",
                              color: "var(--gf-primary)",
                            }}
                          >
                            {guidanceNote.date}
                          </span>

                          <span
                            className="gf-badge"
                            style={{
                              background: "var(--gf-surface)",
                              color: "var(--gf-muted)",
                            }}
                          >
                            {guidanceNote.lecturer}
                          </span>
                        </div>

                        <p
                          className="mt-3 whitespace-pre-line text-sm"
                          style={{
                            color: "var(--gf-ink)",
                          }}
                        >
                          {guidanceNote.note}
                        </p>
                      </div>

                      <AppButton
                        variant="danger"
                        size="icon"
                        onClick={() => setGuidanceToDelete(guidanceNote)}
                      >
                        🗑
                      </AppButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <ConfirmDeleteModal
        isOpen={!!revisionToDelete}
        title="Delete Revision Task?"
        description="This action will permanently remove this revision task."
        itemName={revisionToDelete?.text}
        onCancel={() => setRevisionToDelete(null)}
        onConfirm={() => {
          if (revisionToDelete) {
            deleteRevision(revisionToDelete.id);
          }
        }}
      />

      <ConfirmDeleteModal
        isOpen={!!guidanceToDelete}
        title="Delete Guidance Note?"
        description="This action will permanently remove this guidance note."
        itemName={guidanceToDelete?.lecturer}
        itemDetail={guidanceToDelete?.date}
        onCancel={() => setGuidanceToDelete(null)}
        onConfirm={() => {
          if (guidanceToDelete) {
            deleteGuidanceNote(guidanceToDelete.id);
          }
        }}
      />

      <ConfirmDeleteModal
        isOpen={!!deadlineToDelete}
        title="Delete Deadline?"
        description="This action will permanently remove this deadline."
        itemName={deadlineToDelete?.title}
        itemDetail={
          deadlineToDelete
            ? `${deadlineToDelete.type} • ${deadlineToDelete.date}`
            : undefined
        }
        onCancel={() => setDeadlineToDelete(null)}
        onConfirm={() => {
          if (deadlineToDelete) {
            deleteDeadline(deadlineToDelete.id);
          }
        }}
      />
    </main>
  );
}
