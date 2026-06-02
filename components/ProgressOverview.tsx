type ProgressOverviewProps = {
  // Progress dari task Today Focus
  // Contoh: kalau 2 dari 4 task selesai, nilainya 50
  progressPercentage: number;

  // Progress dari data Magang
  // Contoh: kalau sebagian aplikasi sudah Applied/Interview/Accepted
  internshipProgress: number;

  // Progress rata-rata dari semua goals
  // Contoh: goal 1 = 40%, goal 2 = 80%, rata-rata = 60%
  goalsProgress: number;
};

export default function ProgressOverview({
  progressPercentage,
  internshipProgress,
  goalsProgress,
}: ProgressOverviewProps) {
  // safeTaskProgress dipakai supaya kalau data error / kosong,
  // tampilan tidak menjadi NaN%.
  // Kalau progressPercentage bernilai NaN, undefined, atau 0,
  // maka fallback-nya adalah 0.
  const safeTaskProgress = progressPercentage || 0;

  // safeInternshipProgress juga dibuat aman.
  // Jadi progress bar internship tidak akan rusak walaupun belum ada data magang.
  const safeInternshipProgress = internshipProgress || 0;

  // safeGoalsProgress juga aman dari NaN.
  // Kalau belum ada goals, tampilannya akan 0%.
  const safeGoalsProgress = goalsProgress || 0;

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      {/* Judul utama card */}
      <h2 className="text-lg font-bold text-slate-800">Progress Overview</h2>

      {/* Deskripsi kecil di bawah judul */}
      <p className="mt-1 text-sm text-gray-500">
        Track your academic and career growth
      </p>

      {/* Wrapper untuk semua progress item */}
      <div className="mt-5 flex flex-col gap-4">
        {/* ========================= */}
        {/* 1. TODAY FOCUS PROGRESS */}
        {/* ========================= */}

        <div>
          {/* Header kecil: nama progress + persen */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-700">Today Focus Progress</h3>

            <span className="text-sm font-semibold text-blue-600">
              {Math.round(safeTaskProgress)}%
            </span>
          </div>

          {/* Background progress bar */}
          <div className="mt-2 h-3 rounded-full bg-slate-200">
            {/* Isi progress bar */}
            {/* Width berubah sesuai nilai safeTaskProgress */}
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{
                width: `${safeTaskProgress}%`,
              }}
            />
          </div>
        </div>

        {/* ========================= */}
        {/* 2. INTERNSHIP PROGRESS */}
        {/* ========================= */}

        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-700">Internship Progress</h3>

            <span className="text-sm font-semibold text-green-600">
              {Math.round(safeInternshipProgress)}%
            </span>
          </div>

          <div className="mt-2 h-3 rounded-full bg-slate-200">
            {/* Warna hijau karena ini berkaitan dengan career/magang */}
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{
                width: `${safeInternshipProgress}%`,
              }}
            />
          </div>
        </div>

        {/* ========================= */}
        {/* 3. GOALS PROGRESS */}
        {/* ========================= */}

        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-700">Goals Progress</h3>

            <span className="text-sm font-semibold text-purple-600">
              {Math.round(safeGoalsProgress)}%
            </span>
          </div>

          <div className="mt-2 h-3 rounded-full bg-slate-200">
            {/* Warna ungu karena ini mewakili goal besar / long-term target */}
            <div
              className="h-full rounded-full bg-purple-500 transition-all duration-500"
              style={{
                width: `${safeGoalsProgress}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
