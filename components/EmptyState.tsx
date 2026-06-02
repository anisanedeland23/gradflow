type EmptyStateProps = {
  title: string;
  description?: string;
  size?: "sm" | "md";
};

export default function EmptyState({
  title,
  description,
  size = "md",
}: EmptyStateProps) {
  const sizeStyle = {
    sm: {
      wrapper: "p-4",
      icon: "h-9 w-9 text-sm",
      title: "text-sm",
      description: "text-xs",
    },
    md: {
      wrapper: "p-8",
      icon: "h-12 w-12 text-lg",
      title: "text-sm",
      description: "text-xs",
    },
  }[size];

  return (
    <div
      className={`rounded-2xl border border-dashed text-center ${sizeStyle.wrapper}`}
      style={{
        background: "var(--gf-card-soft)",
        borderColor: "var(--gf-border)",
      }}
    >
      <div
        className={`mx-auto flex items-center justify-center rounded-2xl ${sizeStyle.icon}`}
        style={{
          background: "var(--gf-lavender)",
          color: "var(--gf-primary)",
        }}
      >
        ✦
      </div>

      <p
        className={`mt-3 font-semibold ${sizeStyle.title}`}
        style={{
          color: "var(--gf-ink)",
        }}
      >
        {title}
      </p>

      {description && (
        <p
          className={`mx-auto mt-1 max-w-sm leading-relaxed ${sizeStyle.description}`}
          style={{
            color: "var(--gf-muted)",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}
