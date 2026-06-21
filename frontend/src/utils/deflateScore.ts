const encoder = new TextEncoder()

async function deflateLength(bytes: Uint8Array): Promise<number> {
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new CompressionStream('deflate'))
  return (await new Response(stream).arrayBuffer()).byteLength
}

/** Score how well a candidate continuation fits the context (smaller = better). */
export async function scoreCandidate(
  context: string,
  candidate: string,
): Promise<number> {
  const contextBytes = encoder.encode(context)
  const candidateBytes = encoder.encode(candidate)
  const combined = new Uint8Array(contextBytes.length + candidateBytes.length)
  combined.set(contextBytes)
  combined.set(candidateBytes, contextBytes.length)
  return deflateLength(combined)
}
