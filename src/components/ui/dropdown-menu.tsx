"use client";

import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";

interface DropdownMenuProps {
  /** Accessible name for the trigger button. */
  label: string;
  trigger: ReactNode;
  triggerClassName?: string;
  align?: "start" | "end";
  menuClassName?: string;
  children: ReactNode;
}

interface Position {
  top: number;
  left: number;
  minWidth: number;
}

const ITEM_SELECTOR = '[role^="menuitem"]:not(:disabled)';

/**
 * Menu button pattern: opens on click/Enter/Space/ArrowDown, arrow keys move focus,
 * Escape and Tab close it, and focus returns to the trigger. The popup uses fixed
 * positioning so it is never clipped by scrolling table containers.
 */
export function DropdownMenu({
  label,
  trigger,
  triggerClassName,
  align = "end",
  menuClassName,
  children,
}: DropdownMenuProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const open = position !== null;

  const close = useCallback((restoreFocus: boolean) => {
    setPosition(null);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      top: rect.bottom + 4,
      left: align === "end" ? rect.right : rect.left,
      minWidth: Math.max(rect.width, 176),
    });
  };

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>(ITEM_SELECTOR)?.focus();

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close(false);
    };
    const dismiss = () => close(false);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
    };
  }, [open, close]);

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const focusAt = (next: number) => {
      event.preventDefault();
      items[(next + items.length) % items.length]?.focus();
    };
    switch (event.key) {
      case "ArrowDown":
        return focusAt(index + 1);
      case "ArrowUp":
        return focusAt(index - 1);
      case "Home":
        return focusAt(0);
      case "End":
        return focusAt(items.length - 1);
      case "Escape":
        event.preventDefault();
        return close(true);
      case "Tab":
        return close(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !open) {
            event.preventDefault();
            openMenu();
          }
        }}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {position ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest(ITEM_SELECTOR)) close(true);
          }}
          style={{
            top: position.top,
            left: align === "end" ? undefined : position.left,
            right: align === "end" ? window.innerWidth - position.left : undefined,
            minWidth: position.minWidth,
          }}
          className={cn(
            "bg-surface shadow-pop rounded-panel fixed z-50 max-w-[calc(100vw-1rem)] p-1",
            menuClassName,
          )}
        >
          {children}
        </div>
      ) : null}
    </>
  );
}

const ITEM_CLASSES =
  "flex w-full items-center gap-2 rounded-control px-2.5 py-1.5 text-left text-base text-ink " +
  "hover:bg-sunken focus-visible:bg-sunken focus-visible:outline-offset-[-2px]";

interface MenuItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "role"> {
  href?: string;
  tone?: "default" | "danger";
  checked?: boolean;
}

export function MenuItem({
  href,
  tone = "default",
  checked,
  className,
  children,
  ...props
}: MenuItemProps) {
  const classes = cn(ITEM_CLASSES, tone === "danger" && "text-danger", className);
  if (href) {
    return (
      <Link href={href} role="menuitem" className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type="button"
      role={checked === undefined ? "menuitem" : "menuitemradio"}
      aria-checked={checked}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="bg-line my-1 h-px" />;
}
