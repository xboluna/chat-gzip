import { type KeyboardEvent } from 'react'

type ChatInputProps = {
  value: string
  disabled: boolean
  onChange: (value: string) => void
  onSend: () => void
}

export function ChatInput({ value, disabled, onChange, onSend }: ChatInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!disabled && value.trim()) {
        onSend()
      }
    }
  }

  return (
    <div className="flex gap-2">
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={2}
        placeholder="Talk to gzip…"
        className="min-h-[44px] flex-1 resize-none rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 disabled:opacity-60"
      />
      <button
        type="button"
        disabled={disabled || !value.trim()}
        onClick={onSend}
        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Send
      </button>
    </div>
  )
}
