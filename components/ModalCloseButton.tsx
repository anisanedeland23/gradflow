type ModalCloseButtonProps = {
  onClick: () => void;
};

export default function ModalCloseButton({ onClick }: ModalCloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Close modal"
      className="rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
    >
      ✕
    </button>
  );
}
