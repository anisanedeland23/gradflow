export default function Header() {
  return (
    <header className="gf-panel overflow-hidden p-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        {/* LEFT: USER GREETING */}
        <div className="flex items-start gap-4">
          {/* AVATAR */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-2xl shadow-sm"
            style={{
              background: "var(--gf-lavender)",
              borderColor: "var(--gf-border)",
              color: "var(--gf-primary)",
            }}
          >
            🧑🏻‍💻
          </div>

          {/* TEXT */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1
                className="text-2xl font-semibold tracking-tight sm:text-3xl"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                Hi, Anisaaa
              </h1>

              <span className="text-2xl">👋</span>
            </div>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--gf-muted)",
              }}
            >
              Informatics Engineering Student
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="gf-badge"
                style={{
                  background: "var(--gf-primary-soft)",
                  color: "var(--gf-primary)",
                }}
              >
                Target Graduate: April 2027
              </span>

              <span
                className="gf-badge"
                style={{
                  background: "var(--gf-mint)",
                  color: "var(--gf-success)",
                }}
              >
                Academic workspace
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: QUOTE / MOTIVATION */}
        <div
          className="max-w-xl rounded-2xl border p-4"
          style={{
            background: "var(--gf-card-soft)",
            borderColor: "var(--gf-border)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
              style={{
                background: "var(--gf-yellow-soft)",
                color: "var(--gf-warning)",
              }}
            >
              ✨
            </div>

            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wide"
                style={{
                  color: "var(--gf-muted)",
                }}
              >
                Today&apos;s reminder
              </p>

              <p
                className="mt-1 text-sm leading-relaxed"
                style={{
                  color: "var(--gf-ink)",
                }}
              >
                “Small progress every day still matters.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
