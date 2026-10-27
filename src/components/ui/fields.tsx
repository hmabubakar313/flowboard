import { cn } from "@/lib/utils/cn";
import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDownIcon } from "./icons";

const CONTROL =
  "w-full rounded-control border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-ink-3 " +
  "hover:border-ink-3 disabled:bg-sunken disabled:text-ink-3 aria-[invalid=true]:border-danger";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(CONTROL, "h-9", className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea ref={ref} className={cn(CONTROL, "min-h-24 resize-y py-2", className)} {...props} />
  );
});

/** Native select with a custom chevron: keeps built-in keyboard and mobile behaviour. */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <div className="relative">
        <select ref={ref} className={cn(CONTROL, "h-9 appearance-none pr-8", className)} {...props}>
          {children}
        </select>
        <ChevronDownIcon className="text-ink-3 pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2" />
      </div>
    );
  },
);
