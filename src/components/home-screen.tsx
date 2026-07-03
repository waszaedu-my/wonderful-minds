'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  useGameStore,
  activityMeta,
  activityCategories,
  type ActivityId,
} from '@/lib/game-store'
import { playSound } from '@/lib/sound'
import { Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { VirtualPet } from '@/components/virtual-pet'
import { AchievementsPanel } from '@/components/achievements-panel'
import { DailyChallenge } from '@/components/daily-challenge'
import { useAchievementWatcher } from '@/hooks/use-achievement-watcher'

interface HomeScreenProps {
  onSelect: (id: ActivityId) => void
}

export function HomeScreen({ onSelect }: HomeScreenProps) {
  const progress = useGameStore((s) => s.progress)
  const totalStars = useGameStore((s) => s.totalStars())
  const settings = useGameStore((s) => s.settings)
  const updateSettings = useGameStore((s) => s.updateSettings)
  const resetProgress = useGameStore((s) => s.resetProgress)
  const markTodayPlayed = useGameStore((s) => s.markTodayPlayed)

  // Watch for achievement unlocks
  useAchievementWatcher()

  // Mark today as played when home is visited
  useState(() => {
    markTodayPlayed()
  })

  const [activeCategory, setActiveCategory] = useState<string>('all')

  const activities = Object.keys(activityMeta) as ActivityId[]
  const filteredActivities =
    activeCategory === 'all'
      ? activities
      : activities.filter((id) => activityMeta[id].category === activeCategory)

  const handleSelect = (id: ActivityId) => {
    playSound('whoosh', settings.soundEnabled)
    onSelect(id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <motion.div
              className="text-3xl"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🌈
            </motion.div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-purple-700 leading-tight">
                Wonderful Minds
              </h1>
              <p className="text-xs text-purple-500 hidden sm:block">
                Learning &amp; growing together
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <AchievementsPanel />

            <div className="flex items-center gap-1 bg-amber-100 px-2 sm:px-3 py-1.5 rounded-full border-2 border-amber-200">
              <span className="text-base sm:text-lg">⭐</span>
              <span className="font-bold text-amber-700 text-sm sm:text-base">
                {totalStars}
              </span>
            </div>

            <button
              onClick={() =>
                updateSettings({ soundEnabled: !settings.soundEnabled })
              }
              className="p-2 rounded-full bg-white border-2 border-purple-200 hover:bg-purple-50 transition-colors"
              aria-label={
                settings.soundEnabled ? 'Turn sound off' : 'Turn sound on'
              }
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-purple-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-purple-400" />
              )}
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="p-2 rounded-full bg-white border-2 border-purple-200 hover:bg-purple-50 transition-colors"
                  aria-label="Reset progress"
                >
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will erase all your stars, badges, pet, and streak. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my progress</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      resetProgress()
                      playSound('pop', settings.soundEnabled)
                    }}
                    className="bg-rose-500 hover:bg-rose-600"
                  >
                    Yes, reset
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      {/* Hero section with pet */}
      <section className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4"
        >
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border-2 border-purple-200 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-purple-700">
                Welcome back, friend!
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-purple-800">
              What would you like to play?
            </h2>
          </div>
          <VirtualPet />
        </motion.div>

        {/* Daily challenge banner */}
        <DailyChallenge onPlay={onSelect} />
      </section>

      {/* Category filter */}
      <section className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => {
              playSound('click', settings.soundEnabled)
              setActiveCategory('all')
            }}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              activeCategory === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-white text-purple-600 border-2 border-purple-200 hover:border-purple-400'
            }`}
          >
            ✨ All Games
          </button>
          {Object.entries(activityCategories).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => {
                playSound('click', settings.soundEnabled)
                setActiveCategory(key)
              }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                activeCategory === key
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-purple-600 border-2 border-purple-200 hover:border-purple-400'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Activity Grid */}
      <main className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredActivities.map((id, i) => {
            const meta = activityMeta[id]
            const p = progress[id] ?? { stars: 0, completedRounds: 0, bestStreak: 0, lastPlayed: null, level: 1 }
            return (
              <motion.button
                key={id}
                onClick={() => handleSelect(id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.4) }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.96 }}
                className={`relative bg-gradient-to-br ${meta.color} rounded-3xl p-4 sm:p-5 border-4 border-white shadow-lg text-left flex flex-col items-center gap-2 min-h-[170px] sm:min-h-[190px] focus:outline-none focus:ring-4 focus:ring-purple-300`}
                aria-label={`Play ${meta.title}: ${meta.subtitle}`}
              >
                <motion.div
                  className="text-4xl sm:text-5xl"
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                >
                  {meta.emoji}
                </motion.div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-700 text-center">
                  {meta.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 text-center">
                  {meta.subtitle}
                </p>

                {meta.isNew && (
                  <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    NEW!
                  </span>
                )}

                <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-white/80 px-1.5 py-0.5 rounded-full">
                  <span className="text-xs">⭐</span>
                  <span className="text-[10px] font-bold text-amber-700">
                    {p.stars}
                  </span>
                </div>

                {p.completedRounds > 0 && (
                  <div className="absolute bottom-1.5 left-1.5 bg-white/80 px-1.5 py-0.5 rounded-full">
                    <span className="text-[9px] font-semibold text-purple-600">
                      ✓ {p.completedRounds}
                    </span>
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Encouragement footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-purple-500">
            Take your time. You are doing great! 💜
          </p>
          <p className="text-xs text-purple-400 mt-1">
            {filteredActivities.length} games • Come back every day for new challenges!
          </p>
        </motion.div>
      </main>

      <footer className="mt-auto py-4 text-center text-xs text-purple-400">
        Made with love for every wonderful mind.
      </footer>
    </div>
  )
}
