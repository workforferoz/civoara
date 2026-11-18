import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "outline-dark"
    | "glass"
    | "ghost"
    | "ghost-dark"
    | "destructive"
    | "gov"
    | "gradient"
    | "white";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Instant, tactile response - zero sluggish fade transitions
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg whitespace-nowrap active:translate-y-px transition-colors duration-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer shrink-0";

    const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border border-blue-700 shadow-xs",
      gov:
        "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 border border-slate-950 shadow-xs",
      // Gradient deprecated per design standards - renders solid crisp authoritative blue
      gradient:
        "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border border-blue-700 shadow-xs",
      secondary:
        "bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 border border-slate-200",
      outline:
        "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 shadow-2xs",
      "outline-dark":
        "border border-slate-700 bg-slate-900 text-white hover:bg-slate-800 hover:border-slate-500 active:bg-slate-950 shadow-xs",
      // Glass deprecated per design standards - renders solid crisp dark panel
      glass:
        "border border-slate-700 bg-slate-900 text-white hover:bg-slate-800 shadow-xs",
      ghost:
        "text-slate-700 hover:bg-slate-100 hover:text-slate-950 active:bg-slate-200 border border-transparent",
      "ghost-dark":
        "text-slate-200 hover:bg-slate-800 hover:text-white active:bg-slate-700 border border-slate-800",
      destructive:
        "bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900 border border-rose-800 shadow-xs",
      white:
        "bg-white text-slate-950 hover:bg-slate-100 active:bg-slate-200 border border-slate-300 font-bold shadow-xs",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-xs sm:text-sm gap-2",
      lg: "h-11 px-5 text-sm gap-2",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span className="whitespace-nowrap">{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
