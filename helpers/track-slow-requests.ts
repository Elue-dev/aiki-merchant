import { useLoaderStore } from '@/stores/loader'

const SLOW_THRESHOLD_MS = 4000

export interface SlowRequestOptions {
  silent?: boolean
  slowThreshold?: number
}

export async function withSlowRequestTracking<T>(
  fn: () => Promise<T>,
  options?: SlowRequestOptions,
): Promise<T> {
  if (options?.silent) return fn()

  const { setShowLoader, setShowSlowMessage } = useLoaderStore.getState()
  const threshold = options?.slowThreshold ?? SLOW_THRESHOLD_MS

  setShowLoader(true)

  const slowTimer = setTimeout(() => {
    setShowSlowMessage(true)
  }, threshold)

  try {
    return await fn()
  } finally {
    clearTimeout(slowTimer)
    setShowLoader(false)
    setShowSlowMessage(false)
  }
}
