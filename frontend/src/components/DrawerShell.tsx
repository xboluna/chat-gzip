import { useState, type ReactNode } from 'react'

type DrawerShellProps = {
  label: string
  summary: ReactNode
  disabled?: boolean
  children: ReactNode
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${
        open ? 'rotate-180' : ''
      }`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function DrawerShell({
  label,
  summary,
  disabled = false,
  children,
}: DrawerShellProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-zinc-800 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <button
          type="button"
          disabled={disabled}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-3 py-3 text-left disabled:opacity-60"
        >
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            {label}
          </span>
          <span className="flex min-w-0 items-center gap-2 text-xs text-zinc-500">
            <span className="truncate font-mono text-zinc-400">{summary}</span>
            <ChevronIcon open={open} />
          </span>
        </button>

        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-out ${
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="pb-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
