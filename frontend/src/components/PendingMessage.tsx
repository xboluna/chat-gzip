import { WibblingSpinner } from 'performative-ui'
import { GZIP_VERBS } from '../constants/corpora'
import { ElapsedMs, FakeBytes } from './SpinnerInfo'

type PendingMessageProps = {
  startedAt: number
}

export function PendingMessage({ startedAt }: PendingMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-300">
        <WibblingSpinner
          verbs={[...GZIP_VERBS]}
          verbInterval={1500}
          glyphColor="#34d399"
          info={
            <>
              <ElapsedMs startedAt={startedAt} /> · ↓ <FakeBytes /> bytes
            </>
          }
        />
      </div>
    </div>
  )
}
