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
  // Data utama TTU/Skripsi:
  // link Google Docs, status pengerjaan, dan next action.
  const [documentLink, setDocumentLink] = useState("");
  const [status, setStatus] = useState<TtuProfile["status"]>("Planning");
  const [nextAction, setNextAction] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  // ===============================
  // TTU CHAPTER STATES
  // ===============================
  // chapters menyimpan status setiap bab TTU/Skripsi.
  const [chapters, setChapters] = useState<TtuChapter[]>(defaultChapters);

  // ===============================
  // TTU REVISION STATES
  // ===============================
  // revisions menyimpan checklist revisi khusus TTU/Skripsi.
  const [revisions, setRevisions] = useState<TtuRevision[]>([]);
  const [revisionText, setRevisionText] = useState("");
  const [revisionError, setRevisionError] = useState("");
  const [revisionToDelete, setRevisionToDelete] = useState<TtuRevision | null>(
    null,
  );

  // ===============================
  // TTU GUIDANCE NOTE STATES
  // ===============================
  // guidanceNotes menyimpan catatan bimbingan TTU/Skripsi.
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
  // deadlines menyimpan tanggal penting TTU/Skripsi.
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
    // LOAD PROFILE
    const savedProfile = localStorage.getItem(STORAGE_KEYS.ttuProfile);

    if (savedProfile) {
      const parsedProfile: TtuProfile = JSON.parse(savedProfile);

      setDocumentLink(parsedProfile.documentLink);
      setStatus(parsedProfile.status);
      setNextAction(parsedProfile.nextAction);
    }

    // LOAD CHAPTERS
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

    // LOAD REVISIONS
    const savedRevisions = localStorage.getItem(STORAGE_KEYS.ttuRevisions);

    if (savedRevisions) {
      const parsedRevisions: TtuRevision[] = JSON.parse(savedRevisions);

      setRevisions(parsedRevisions);
    }

    // LOAD GUIDANCE NOTES
    const savedGuidanceNotes = localStorage.getItem(
      STORAGE_KEYS.ttuGuidanceNotes,
    );

    if (savedGuidanceNotes) {
      const parsedGuidanceNotes: TtuGuidanceNote[] =
        JSON.parse(savedGuidanceNotes);

      setGuidanceNotes(parsedGuidanceNotes);
    }

    // LOAD DEADLINES
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
  // Mengubah status chapter dan langsung menyimpannya ke localStorage.
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

  return (
    <main className="gf-page">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <section className="min-h-screen p-3 pt-20 sm:p-4 sm:pt-20 lg:ml-72 lg:p-5">
        {/* PAGE HEADER */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                TTU / Skripsi
              </h1>

              <p className="mt-2 text-slate-500">
                Control center for your final project document, revisions,
                guidance notes, and important deadlines.
              </p>
            </div>

            <div className="w-fit rounded-2xl bg-blue-100 px-4 py-3 text-sm font-bold text-blue-700">
              Skripsi Control Center
            </div>
          </div>
        </div>

        {/* TOP CONTROL GRID */}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* MAIN DOCUMENT LINK */}
          <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Main Document
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-800">
                  TTU Google Docs
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Save your main TTU / Skripsi document link here so it is easy
                  to access.
                </p>
              </div>

              <div
                className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                  documentLink.trim() !== ""
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {documentLink.trim() !== "" ? "Linked" : "Not linked yet"}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <label className="text-sm font-medium text-slate-700">
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
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
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
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Current Focus
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-800">
              Status & Next Action
            </h2>

            <div className="mt-5 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  TTU Status
                </label>

                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as TtuProfile["status"]);
                    setProfileMessage("");
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                >
                  <option value="Planning">Planning</option>
                  <option value="Drafting">Drafting</option>
                  <option value="Revision">Revision</option>
                  <option value="Ready for Review">Ready for Review</option>
                  <option value="Submitted">Submitted</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Next Action
                </label>

                <textarea
                  placeholder="Example: Revisi rumusan masalah dan kirim ke dosen pembimbing..."
                  value={nextAction}
                  onChange={(event) => {
                    setNextAction(event.target.value);
                    setProfileMessage("");
                  }}
                  className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              <AppButton variant="primary" size="lg" onClick={saveTtuProfile}>
                Save Status
              </AppButton>

              {profileMessage && (
                <p
                  className={`rounded-xl px-4 py-3 text-sm font-medium ${
                    profileMessage.includes("saved")
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}
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
          <div className="rounded-3xl bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Chapter Progress
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-800">
                  Skripsi Chapters
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track the status of each chapter from planning to done.
                </p>
              </div>

              <div className="rounded-xl bg-green-100 px-3 py-2 text-xs font-bold text-green-700">
                {doneChapters}/{chapters.length} Done
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {chapter.title}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Update this chapter status as your writing progresses.
                    </p>
                  </div>

                  <select
                    value={chapter.status}
                    onChange={(event) =>
                      updateChapterStatus(
                        chapter.id,
                        event.target.value as TtuChapter["status"],
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 sm:w-44"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Drafting">Drafting</option>
                    <option value="Review">Review</option>
                    <option value="Revision">Revision</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* IMPORTANT DEADLINES */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Important Dates
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-800">
                  TTU Deadlines
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Keep your critical academic dates visible.
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                {deadlines.length}
              </div>
            </div>

            {/* ADD DEADLINE FORM */}
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <div>
                <label className="text-sm font-medium text-slate-700">
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Date
                  </label>

                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(event) => {
                      setDeadlineDate(event.target.value);
                      setDeadlineError("");
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
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
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
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
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {deadlineError}
                </p>
              )}
            </div>

            {/* DEADLINE LIST */}
            {deadlines.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No deadline yet.
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Add seminar, submission, guidance, or revision dates.
                </p>
              </div>
            )}

            {deadlines.length > 0 && (
              <div className="mt-6 flex flex-col gap-3">
                {deadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {deadline.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            {deadline.date}
                          </span>

                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
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
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LOWER GRID */}
        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* REVISION CHECKLIST */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Revision Checklist
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-800">
                  Action Items
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Turn guidance feedback into clear revision tasks.
                </p>
              </div>

              <div className="rounded-xl bg-orange-100 px-3 py-2 text-xs font-bold text-orange-700">
                {pendingRevisions} Pending
              </div>
            </div>

            {revisions.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No revision tasks yet.
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Add tasks like “perbaiki latar belakang” or “tambahkan
                  jurnal”.
                </p>
              </div>
            )}

            {revisions.length > 0 && (
              <div className="mt-6 flex flex-col gap-3">
                {revisions.map((revision) => (
                  <div
                    key={revision.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={revision.completed}
                        onChange={() => toggleRevision(revision.id)}
                        className="mt-1 h-4 w-4 accent-blue-600"
                      />

                      <span
                        className={`text-sm font-medium ${
                          revision.completed
                            ? "text-slate-400 line-through"
                            : "text-slate-700"
                        }`}
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
              />

              <AppButton variant="primary" size="lg" onClick={addRevision}>
                Add
              </AppButton>
            </div>

            {revisionError && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {revisionError}
              </p>
            )}
          </div>

          {/* GUIDANCE NOTES */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Guidance Notes
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-800">
                  Bimbingan Log
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Record feedback and notes from your thesis advisor.
                </p>
              </div>

              <div className="rounded-xl bg-purple-100 px-3 py-2 text-xs font-bold text-purple-700">
                {guidanceNotes.length} Notes
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Guidance Date
                </label>

                <input
                  type="date"
                  value={guidanceDate}
                  onChange={(event) => {
                    setGuidanceDate(event.target.value);
                    setGuidanceError("");
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700">
                Notes
              </label>

              <textarea
                placeholder="Write guidance notes or feedback..."
                value={guidanceNoteText}
                onChange={(event) => {
                  setGuidanceNoteText(event.target.value);
                  setGuidanceError("");
                }}
                className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500"
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
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {guidanceError}
                </p>
              )}
            </div>

            {guidanceNotes.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <p className="text-sm font-semibold text-slate-700">
                  No guidance notes yet.
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Save feedback from your advisor after each guidance session.
                </p>
              </div>
            )}

            {guidanceNotes.length > 0 && (
              <div className="mt-6 flex flex-col gap-3">
                {guidanceNotes.map((guidanceNote) => (
                  <div
                    key={guidanceNote.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                            {guidanceNote.date}
                          </span>

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                            {guidanceNote.lecturer}
                          </span>
                        </div>

                        <p className="mt-3 whitespace-pre-line text-sm text-slate-700">
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
