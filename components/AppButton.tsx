import type { ButtonHTMLAttributes, ReactNode } from "react";

type AppButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "warning"
  | "ghost";

type AppButtonSize = "icon" | "sm" | "md" | "lg";

type AppButtonProps = {
  children: ReactNode;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function AppButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: AppButtonProps) {
  // Base style dipakai oleh semua button.
  // Ini supaya semua tombol punya bentuk, font, dan transisi yang konsisten.
  const baseStyle =
    "rounded-xl font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

  // Variant menentukan warna dan fungsi visual button.
  // primary   = aksi utama
  // secondary = aksi netral / cancel
  // danger    = aksi hapus
  // warning   = aksi edit
  // ghost     = tombol ringan tanpa background kuat
  const variantStyle = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    warning: "bg-yellow-400 text-slate-900 hover:bg-yellow-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  };

  // Size menentukan padding dan ukuran teks.
  const sizeStyle = {
    icon: "px-3 py-2 text-xs",
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-sm",
  };
  // fullWidth membuat tombol memenuhi lebar parent.
  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyle} ${variantStyle[variant]} ${sizeStyle[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
