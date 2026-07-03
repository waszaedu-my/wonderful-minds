'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import { playSound } from '@/lib/sound'
import { useGameStore, type ActivityId } from '@/lib/game-store'
import { ReactNode } from 'react'

interface GameShellProps {
  activityId: ActivityId
  title: string
  emoji: string
  onBack: () => void
  children: ReactNode
  instruction?: string
}

export function GameShell({
  activityId,
  title,
  emoji,
  onBack,
  children,
  instruction,
}: GameShellProps) {
  const progress = useGameStore((s) => s.progress[activityId])
  const settings = useGameStore((s) => s.settings)

  const handleBack = () => {
    playSound('whoosh', settings.soundEnabled)
    onBack()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-pink-50 flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-purple-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border-2 border-purple-200 hover:bg-purple-50 transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5 text-purple-600" />
            <span className="hidden sm:inline text-sm font-semibold text-purple-700">
              Home
            </span>
          </button>

          <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
            <span className="text-2xl">{emoji}</span>
            <h1 className="text-base sm:text-xl font-extrabold text-purple-700 truncate">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-1 bg-amber-100 px-3 py-1.5 rounded-full border-2 border-amber-200">
            <span className="text-lg">⭐</span>
            <span className="font-bold text-amber-700 text-sm">
              {progress.stars}
            </span>
          </div>
        </div>

        {instruction && (
          <div className="max-w-5xl mx-auto px-4 pb-3">
            <motion.div
              key={instruction}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-100/80 border-2 border-purple-200 rounded-2xl px-4 py-2 text-center"
            >
              <p className="text-sm sm:text-base font-semibold text-purple-700">
                {instruction}
              </p>
            </motion.div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col">
        {children}
      </main>

      <footer className="py-3 text-center text-xs text-purple-400">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1 hover:text-purple-600 transition-colors"
        >
          <Home className="w-3 h-3" />
          Back to all activities
        </button>
      </footer>
    </div>
  )
}
