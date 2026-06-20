import { useEffect, useState } from 'react'

export function ElapsedMs({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const tick = () => setElapsed(Math.max(0, Date.now() - startedAt))
    tick()
    const id = window.setInterval(tick, 100)
    return () => window.clearInterval(id)
  }, [startedAt])

  return <>{(elapsed / 1000).toFixed(1)}s</>
}

export function FakeBytes() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setCount((value) => value + Math.floor(Math.random() * 18) + 4)
    }, 80)
    return () => window.clearInterval(id)
  }, [])

  return <>{count}</>
}
