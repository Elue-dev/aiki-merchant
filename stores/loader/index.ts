import { create } from 'zustand'

interface LoaderState {
  showLoader: boolean
  showSlowMessage: boolean
  setShowLoader: (show: boolean) => void
  setShowSlowMessage: (show: boolean) => void
}

export const useLoaderStore = create<LoaderState>((set) => ({
  showLoader: false,
  showSlowMessage: false,
  setShowLoader: (show) => set({ showLoader: show }),
  setShowSlowMessage: (show) => set({ showSlowMessage: show }),
}))
