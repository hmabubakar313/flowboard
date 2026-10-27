import { cn } from "@/lib/utils/cn";

const TONES = [
  "bg-[#e3ebe7] text-[#174739]",
  "bg-[#f3e7d3] text-[#6e4510]",
  "bg-[#e6e9ee] text-[#34495d]",
  "bg-[#f1e2de] text-[#7a2a1b]",
  "bg-[#ebe7dc] text-[#4f4c44]",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")
  ).toUpperCase();
}

function toneFor(seed: string): string {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length] ?? TONES[0]!;
}

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none",
        size === "sm" ? "size-5 text-[10px]" : "size-7 text-xs",
        toneFor(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
