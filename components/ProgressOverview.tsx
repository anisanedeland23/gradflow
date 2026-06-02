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

type ProgressItem = {
  label: string;
  description: string;
  value: number;
  icon: string;
  softColor: string;
  accentColor: string;
};

export default function ProgressOverview({
  progressPercentage,
  internshipProgress,
  goalsProgress,
}: ProgressOverviewProps) {
  // safeTaskProgress dipakai supaya kalau data error / kosong,
  // tampilan tidak menjadi NaN%.
  const safeTaskProgress = progressPercentage || 0;

  // safeInternshipProgress juga dibuat aman.
  const safeInternshipProgress = internshipProgress || 0;

  // safeGoalsProgress juga aman dari NaN.
  const safeGoalsProgress = goalsProgress || 0;

  const progressItems: ProgressItem[] = [
    {
      label: "Today Focus",
      description: "Daily academic actions",
      value: safeTaskProgress,
      icon: "✦",
      softColor: "var(--gf-sky)",
      accentColor: "var(--gf-link)",
    },
    {
      label: "Internship",
      description: "Career pipeline progress",
      value: safeInternshipProgress,
      icon: "◇",
      softColor: "var(--gf-peach)",
      accentColor: "var(--gf-warning)",
    },
    {
      label: "Goals",
      description: "Long-term target progress",
      value: safeGoalsProgress,
      icon: "◎",
      softColor: "var(--gf-lavender)",
      accentColor: "var(--gf-primary)",
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
            Progress Overview
          </p>

          <h2
            className="mt-2 text-xl font-semibold tracking-tight"
            style={{
              color: "var(--gf-ink)",
            }}
          >
            Academic & career flow
          </h2>

          <p
            className="mt-1 text-sm"
            style={{
              color: "var(--gf-muted)",
            }}
          >
            Track how today&apos;s actions connect to bigger goals.
          </p>
        </div>

        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
          style={{
            background: "var(--gf-primary-soft)",
            color: "var(--gf-primary)",
          }}
        >
          📊
        </div>
      </div>

      {/* PROGRESS ITEMS */}
      <div className="mt-6 flex flex-col gap-4">
        {progressItems.map((item) => {
          const roundedValue = Math.round(item.value);

          return (
            <div
              key={item.label}
              className="rounded-2xl border p-4"
              style={{
                background: "var(--gf-card-soft)",
                borderColor: "var(--gf-border)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base"
                  style={{
                    background: item.softColor,
                    color: item.accentColor,
                  }}
                >
                  {item.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3
                        className="text-sm font-semibold"
                        style={{
                          color: "var(--gf-ink)",
                        }}
                      >
                        {item.label}
                      </h3>

                      <p
                        className="mt-0.5 text-xs"
                        style={{
                          color: "var(--gf-muted)",
                        }}
                      >
                        {item.description}
                      </p>
                    </div>

                    <span
                      className="text-sm font-bold"
                      style={{
                        color: item.accentColor,
                      }}
                    >
                      {roundedValue}%
                    </span>
                  </div>

                  <div
                    className="mt-3 h-3 overflow-hidden rounded-full"
                    style={{
                      background: "var(--gf-surface)",
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(roundedValue, 100)}%`,
                        background: item.accentColor,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
