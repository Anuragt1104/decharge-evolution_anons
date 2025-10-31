import type { ButtonHTMLAttributes, DetailedHTMLProps, HTMLAttributes } from "react";
import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | undefined | false | null)[]): string {
  return twMerge(inputs.filter(Boolean).join(" "));
}

export const Card = ({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur",
      className,
    )}
    {...props}
  />
);

export const CardHeader = ({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
  <div className={cn("mb-4 flex flex-col gap-1", className)} {...props} />
);

export const CardTitle = ({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-semibold", className)} {...props} />
);

export const CardDescription = ({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>) => (
  <p className={cn("text-sm text-white/70", className)} {...props} />
);

export const Button = forwardRef<
  HTMLButtonElement,
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300",
      className,
    )}
    {...props}
  />
));

Button.displayName = "Button";

export const Badge = ({
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200",
      className,
    )}
    {...props}
  />
);