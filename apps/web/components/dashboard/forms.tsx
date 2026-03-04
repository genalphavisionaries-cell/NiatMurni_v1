"use client";

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const FormField = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function FormField({ className, ...props }, ref) {
  return <div ref={ref} className={cn("space-y-2", className)} {...props} />;
});

export const FormLabel = forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(function FormLabel({ className, ...props }, ref) {
  return (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-gray-900", className)}
      {...props}
    />
  );
});

export const TextInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function TextInput({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300",
        className
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300",
        className
      )}
      {...props}
    />
  );
});

export function FormSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}
