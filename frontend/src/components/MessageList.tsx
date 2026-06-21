import type { ChatMessage } from '../services/api'
import { StreamingAssistantMessage } from './StreamingAssistantMessage'

type MessageListProps = {
  messages: ChatMessage[]
  isStreaming: boolean
  pendingStartedAt: number | null
  corpusLabel: string
}

export function MessageList({
  messages,
  isStreaming,
  pendingStartedAt,
  corpusLabel,
}: MessageListProps) {
  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12 text-center text-sm leading-relaxed text-zinc-500">
        Say something. gzip will continue it by finding the most compressible
        bytes in {corpusLabel}.
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.map((message, index) => {
        const isActiveStream =
          isStreaming &&
          index === messages.length - 1 &&
          message.role === 'assistant' &&
          pendingStartedAt !== null

        return (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {isActiveStream ? (
              <StreamingAssistantMessage
                content={message.content}
                startedAt={pendingStartedAt}
                isStreaming
              />
            ) : (
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
            )}
          </div>
        )
      })}
    </div>
  )
}
