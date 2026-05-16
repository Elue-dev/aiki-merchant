export async function safeAsync<T>(
  fn: () => Promise<T>,
): Promise<[T, null] | [null, Error & Record<string, unknown>]> {
  try {
    const result = await fn()
    return [result, null]
  } catch (err) {
    return [null, err as Error & Record<string, unknown>]
  }
}
