type ModalCloseButtonProps = {
  onClick: () => void;
};

export default function ModalCloseButton({ onClick }: ModalCloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close modal"
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold transition hover:-translate-y-0.5"
      style={{
        background: "var(--gf-card-soft)",
        borderColor: "var(--gf-border)",
        color: "var(--gf-muted)",
        boxShadow: "var(--gf-shadow-sm)",
      }}
    >
      ✕
    </button>
  );
}
