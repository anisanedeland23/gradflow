type StatsCardProps = {
  title: string;
  value: string;
  description: string;
  icon?: string;
  tone?: "sky" | "peach" | "mint" | "lavender";
};

export default function StatsCard({
  title,
  value,
  description,
  icon = "•",
  tone = "sky",
}: StatsCardProps) {
  const toneStyle = {
    sky: {
      background: "var(--gf-sky)",
      color: "var(--gf-link)",
    },
    peach: {
      background: "var(--gf-peach)",
      color: "var(--gf-warning)",
    },
    mint: {
      background: "var(--gf-mint)",
      color: "var(--gf-success)",
    },
    lavender: {
      background: "var(--gf-lavender)",
      color: "var(--gf-primary)",
    },
  }[tone];

  return (
    <div
      className="rounded-2xl border p-4 transition hover:-translate-y-0.5"
      style={{
        background: "var(--gf-card-soft)",
        borderColor: "var(--gf-border)",
        boxShadow: "var(--gf-shadow-sm)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p
            className="text-xs font-bold uppercase tracking-wide"
            style={{
              color: "var(--gf-muted)",
            }}
          >
            {title}
          </p>

          <h3
            className="mt-2 text-3xl font-semibold tracking-tight"
            style={{
              color: "var(--gf-ink)",
            }}
          >
            {value}
          </h3>
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-base"
          style={{
            background: toneStyle.background,
            color: toneStyle.color,
          }}
        >
          {icon}
        </div>
      </div>

      <p
        className="mt-3 text-sm leading-relaxed"
        style={{
          color: "var(--gf-muted)",
        }}
      >
        {description}
      </p>
    </div>
  );
}
