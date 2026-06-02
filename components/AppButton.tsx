import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type AppButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "warning";

type AppButtonSize = "sm" | "md" | "lg" | "icon";

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  className?: string;
};

export default function AppButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  type = "button",
  style,
  ...props
}: AppButtonProps) {
  const baseClass =
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border font-medium leading-none shadow-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

  const sizeClass: Record<AppButtonSize, string> = {
    sm: "min-h-9 px-3 text-xs",
    md: "min-h-10 px-4 text-sm",
    lg: "min-h-11 px-5 text-sm",
    icon: "h-10 w-10 px-0 text-base",
  };

  const variantStyle: Record<AppButtonVariant, CSSProperties> = {
    primary: {
      backgroundColor: "var(--gf-primary)",
      borderColor: "var(--gf-primary)",
      color: "#ffffff",
    },

    secondary: {
      backgroundColor: "var(--gf-card)",
      borderColor: "var(--gf-border-strong)",
      color: "var(--gf-ink)",
    },

    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      color: "currentColor",
      boxShadow: "none",
    },

    danger: {
      backgroundColor: "var(--gf-danger-soft)",
      borderColor: "var(--gf-danger-soft)",
      color: "var(--gf-danger)",
    },

    warning: {
      backgroundColor: "var(--gf-warning-soft)",
      borderColor: "var(--gf-warning-soft)",
      color: "var(--gf-warning)",
    },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClass} ${sizeClass[size]} ${className}`}
      style={{
        ...variantStyle[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
