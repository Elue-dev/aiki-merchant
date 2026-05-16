import { useLoaderStore } from '@/stores/loader'

export default function AppLoader() {
  const showSlowMessage = useLoaderStore((s) => s.showSlowMessage)

  return (
    <div className="fixed inset-0 z-9999 flex flex-col justify-start bg-black/25">
      <div className="w-full h-1 relative overflow-hidden bg-primary/10">
        <div
          className="loader-bar absolute"
          style={{
            background: 'var(--primary)',
            boxShadow: '0 0 8px 2px var(--primary)',
          }}
        />
      </div>

      {showSlowMessage && (
        <div className="flex justify-center mt-4">
          <p className="bg-black/20 text-white text-sm font-medium px-4 py-2 rounded-full">
            Taking longer than expected — check your connection…
          </p>
        </div>
      )}
    </div>
  )
}
