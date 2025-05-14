'use client'

export default function Hero() {
  return (
    <div className="flex flex-col items-center justify-center h-[85vh]">
      <div className="text-center space-y-8">
        <h1 className="text-6xl [text-shadow:_0_0_0.5px_rgb(0_0_0)]">
          Chat with your calendar
        </h1>
        <p className="text-xl text-gray-600">
          The natural way to manage your schedule. Just ask and let AI handle the rest.
        </p>

        <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors"
          />
          <button className="bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-900 transition-colors [text-shadow:_0_0_0.25px_rgb(255_255_255)]">
            Join waitlist
          </button>
        </div>
      </div>
    </div>
  )
}
