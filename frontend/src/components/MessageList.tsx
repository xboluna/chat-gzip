import type { ChatMessage } from '../services/api'
import { PendingMessage } from './PendingMessage'

type MessageListProps = {
  messages: ChatMessage[]
  pending: boolean
  pendingStartedAt: number | null
}

export function MessageList({
  messages,
  pending,
  pendingStartedAt,
}: MessageListProps) {
  if (messages.length === 0 && !pending) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12 text-center text-sm leading-relaxed text-zinc-500">
        Say something. gzip will continue it by finding the most compressible
        bytes in Tiny Shakespeare.
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.map((message, index) => (
        <div
          key={`${message.role}-${index}`}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              message.role === 'user'
                ? 'rounded-br-md bg-emerald-600/20 text-emerald-50'
                : 'rounded-bl-md border border-zinc-800 bg-zinc-900/80 text-zinc-200'
            }`}
          >
            {message.content || (
              <span className="italic text-zinc-500">(empty continuation)</span>
            )}
          </div>
        </div>
      ))}
      {pending && pendingStartedAt !== null && (
        <PendingMessage startedAt={pendingStartedAt} />
      )}
    </div>
  )
}
