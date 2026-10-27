import { buttonClasses } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-32 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-ink-2 mt-2">The page you’re looking for doesn’t exist or has moved.</p>
      <Link href="/dashboard" className={`${buttonClasses("primary")} mt-6`}>
        Back to dashboard
      </Link>
    </div>
  );
}
