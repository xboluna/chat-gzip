type InfoButtonProps = {
  onClick: () => void
}

export function InfoButton({ onClick }: InfoButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-800 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
    >
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-4 w-4 text-zinc-500 transition-colors group-hover:text-emerald-400"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 011-1h.5a1 1 0 011 1v4a1 1 0 11-2 0V10a1 1 0 01-.5-1zm1-4.25a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z"
          clipRule="evenodd"
        />
      </svg>
      <span className="hidden sm:inline">What&rsquo;s happening?</span>
    </button>
  )
}
