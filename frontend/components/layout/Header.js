"use client";

import Button from "@/components/shared/Button";

export default function Header({
  title,
  user,
  onLogout,
  onMenuClick,
  menuOpen,
}) {
  const displayName = user?.name || "Admin";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="app-sidebar"
          onClick={onMenuClick}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h1 className="truncate text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
            aria-hidden="true"
          >
            {initial}
          </span>
          <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-700 sm:block">
            {displayName}
          </span>
        </div>

        <Button type="button" variant="ghost" onClick={onLogout} className="px-3 py-1.5">
          Logout
        </Button>
      </div>
    </header>
  );
}
