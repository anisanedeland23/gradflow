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
    sm: "p-4",
    md: "p-8",
  };

  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center ${sizeStyle[size]}`}
    >
      <p className="text-sm font-semibold text-slate-600">{title}</p>

      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}
    </div>
  );
}
