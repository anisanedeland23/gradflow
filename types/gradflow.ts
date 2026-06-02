// ===============================
// GRADFLOW GLOBAL TYPES
// ===============================
// File ini adalah pusat definisi type data GradFlow.
// Tujuannya supaya type tidak ditulis ulang di banyak file.

// ===============================
// TASK
// ===============================
// Dipakai untuk Today Focus dan dashboard stats.
export type Task = {
  id: number;
  text: string;
  completed: boolean;
  deadline: string;
  createdAt: number;
};

// ===============================
// EVENT
// ===============================
// Dipakai untuk Calendar, Upcoming Deadlines, ReminderNotes, dan WeeklyFocus.
export type Event = {
  id: number;
  title: string;
  type: string;
  date: string;
};

// ===============================
// INTERNSHIP
// ===============================
// Dipakai untuk halaman Magang, Stats, ProgressOverview, dan ProductivitySnapshot.
export type Internship = {
  id: number;
  company: string;
  role: string;
  status: string;
  deadline: string;
  link: string;
  createdAt: number;
};

// ===============================
// GOAL
// ===============================
// Dipakai untuk halaman Goals, Stats, ProgressOverview, dan WeeklyFocus.
export type Goal = {
  id: number;
  title: string;
  category: string;
  progress: number;
  target: number;
  deadline: string;
  status: string;
  createdAt: number;
};

// ===============================
// NOTE
// ===============================
// Dipakai untuk Quick Notes di ReminderNotes.
export type Note = {
  id: number;
  text: string;
  createdAt: number;
};

// ===============================
// ACTIVITY LOG
// ===============================
// Dipakai untuk mencatat aktivitas penting user.
// Contoh: task selesai, event ditambahkan, goal dibuat, dll.
export type ActivityLog = {
  id: number;
  type:
    | "task_added"
    | "task_completed"
    | "task_deleted"
    | "event_added"
    | "event_deleted"
    | "internship_added"
    | "internship_deleted"
    | "goal_added"
    | "goal_deleted"
    | "note_added"
    | "note_deleted"
    | "focus_session_completed"
    | "daily_log_saved";
  title: string;
  description?: string;
  date: string;
  createdAt: number;
};

// ===============================
// FOCUS SESSION
// ===============================
// Dipakai untuk menyimpan data sesi focus flight
// focus session adalah data utama dari timer belajar.
// Data ini nanti dipakai untuk today summary cards,
// weekly evalution, dan daily focus streaak.
export type FocusSession = {
  id: number;

  // judul sesi focus.
  // contoh: "belajar react hooks", "revisi bab 2", "kerjakan web service", dll.
  title: string;

  // kategori sesi focus.
  // contoh: coding, skripsi, kuliah, career, other.
  category: string;

  // durasi focus mode dalam menir.
  // contoh: 25, 50, 90, dll.
  focusMinutes: number;

  // durasi break / transit mode dalam menit.
  // contoh: 5, 10, 15, dll.
  breakMinutes: number;

  // jumlah cycle focus + break yang berhasul diselesaikan.
  // MVP awal bisa 1 dulu.
  completedCycles: number;

  // total menit fokus yang benar benar dihitung
  totalFocusMinutes: number;

  // tanggal session dalam format YYYY-MM-DD, contoh: 2024-05-01.
  date: string;

  // waktu session dimulai dalam timestamp.
  startedAt: number;

  // waktu session selesai/ disimpan dalam timestamp.
  completedAt: number;
};

// ===============================
// DAILY LOG
// ===============================
// dipakai untuk menyimpan refleksi harian user.
// ini berbeda dari focussession
// focussession = data timer belajar.
// dailyLog = catatan/refleksi harian.
export type DailyLog = {
  id: number;

  // tanggal log dalam format YYYY-MM-DD, contoh: 2024-05-01.
  date: string;

  // ringkasan apa yang dikerjakan hari ini
  summary: string;

  // hal yang menghambat hari ini.
  blockers: string;

  // prioritas untuk besok
  tomorrowPriority: string;

  // mood atau energy level sederhana
  // mvp awal boleh pakai string agar fleksibel
  mood: string;

  // timestamp saat log dibuat.
  createdAt: number;

  // timestamp saat log terakhir diubah
  updatedAt: number;
};

// ===============================
// TTU / SKRIPSI
// ===============================
// TtuProfile menyimpan informasi utama TTU/Skripsi,
// seperti link Google Docs, status pengerjaan, dan next action.
export type TtuProfile = {
  documentLink: string;
  status:
    | "Planning"
    | "Drafting"
    | "Revision"
    | "Ready for Review"
    | "Submitted";
  nextAction: string;
  updatedAt: number;
};

// TtuChapter menyimpan progress setiap bab skripsi.
// MVP awal memakai status, bukan persentase,
// supaya lebih mudah dipakai dan tidak terlalu ribet.
export type TtuChapter = {
  id: number;
  title: string;
  status: "Not Started" | "Drafting" | "Review" | "Revision" | "Done";
};

// TtuRevision menyimpan checklist revisi skripsi.
// Ini mirip task list, tapi khusus untuk TTU/Skripsi.
export type TtuRevision = {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
};

// TtuGuidanceNote menyimpan catatan bimbingan.
// Contoh: tanggal bimbingan, dosen pembimbing, dan catatan revisi.
export type TtuGuidanceNote = {
  id: number;
  date: string;
  lecturer: string;
  note: string;
  createdAt: number;
};

// TtuDeadline menyimpan deadline penting TTU/Skripsi.
// Contoh: seminar proposal, submit revisi, sidang, bimbingan.
export type TtuDeadline = {
  id: number;
  title: string;
  date: string;
  type:
    | "Guidance"
    | "Submission"
    | "Seminar"
    | "Defense"
    | "Revision"
    | "Other";
  createdAt: number;
};

// ===============================
// ASSETS / RESOURCE LIBRARY
// ===============================
// AssetCategory dipakai untuk mengelompokkan resource berdasarkan konteks.
// Contoh: Skripsi, Project, Career, Course.
export type AssetCategory =
  | "Skripsi"
  | "Project"
  | "Career"
  | "Course"
  | "Personal"
  | "Other";

// AssetType dipakai untuk menjelaskan bentuk resource.
// Contoh: Document, Design, Code, Dataset, Reference.
export type AssetType =
  | "Document"
  | "Design"
  | "Code"
  | "Dataset"
  | "Reference"
  | "Template"
  | "Video"
  | "Link"
  | "Other";

// AssetItem adalah data utama untuk setiap resource/link penting
// yang disimpan di Assets Page.
export type AssetItem = {
  id: number;

  // Nama resource.
  // Contoh: "Figma GradFlow Design", "GitHub Repo", "Jurnal MediaPipe".
  title: string;

  // Link resource.
  // Contoh: Google Docs, Figma, GitHub, jurnal, dataset, video tutorial.
  url: string;

  // Kategori besar asset.
  category: AssetCategory;

  // Jenis asset.
  type: AssetType;

  // Catatan singkat tentang asset.
  description: string;

  // Timestamp saat asset dibuat.
  createdAt: number;
};
