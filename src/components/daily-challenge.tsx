'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore, type ActivityId, activityMeta } from '@/lib/game-store'
import { playSound } from '@/lib/sound'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Gift, Check, Flame, Calendar } from 'lucide-react'

interface DailyChallengeProps {
  onPlay: (id: ActivityId) => void
}

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Daily challenge generates a small set of mini-games for the day
function generateDailyChallenge(dayStr: string): ActivityId[] {
  // Hash the date string to a number for deterministic selection
  let hash = 0
  for (let i = 0; i < dayStr.length; i++) {
    hash = ((hash << 5) - hash + dayStr.charCodeAt(i)) | 0
  }
  const seed = Math.abs(hash)

  const allGames: ActivityId[] = [
    'emotions',
    'colors-shapes',
    'counting',
    'alphabet',
    'memory',
    'patterns',
    'animals',
    'body-parts',
    'opposites',
    'sorting',
    'story-builder',
    'routines',
  ]
  const selected: ActivityId[] = []
  const pool = [...allGames]
  for (let i = 0; i < 3; i++) {
    const idx = (seed + i * 7) % pool.length
    selected.push(pool[idx])
    pool.splice(idx, 1)
  }
  return selected
}

export function DailyChallenge({ onPlay }: DailyChallengeProps) {
  const dailyChallengeCompleted = useGameStore((s) => s.dailyChallengeCompleted)
  const dailyChallengeDate = useGameStore((s) => s.dailyChallengeDate)
  const completeDailyChallenge = useGameStore((s) => s.completeDailyChallenge)
  const addStars = useGameStore((s) => s.addStars)
  const progress = useGameStore((s) => s.progress)
  const streak = useGameStore((s) => s.streak)
  const markTodayPlayed = useGameStore((s) => s.markTodayPlayed)
  const settings = useGameStore((s) => s.settings)

  const [open, setOpen] = useState(false)
  const today = getTodayStr()

  // Today's challenge games
  const todaysGames = generateDailyChallenge(today)

  // Check if all 3 games have been played today
  const todayPlayed = todaysGames.every(
    (g) => progress[g].lastPlayed && Date.now() - progress[g].lastPlayed! < 24 * 60 * 60 * 1000
  )

  // Check if it's actually completed today
  const isCompletedToday =
    dailyChallengeCompleted && dailyChallengeDate === today

  // Auto-complete when all 3 are played
  useEffect(() => {
    if (todayPlayed && !isCompletedToday) {
      completeDailyChallenge()
      addStars('daily-challenge', 5) // bonus stars
      markTodayPlayed()
      playSound('celebrate', settings.soundEnabled)
    }
  }, [todayPlayed, isCompletedToday, completeDailyChallenge, addStars, markTodayPlayed, settings.soundEnabled])

  const completedCount = todaysGames.filter(
    (g) => progress[g].lastPlayed && Date.now() - progress[g].lastPlayed! < 24 * 60 * 60 * 1000
  ).length

  const handlePlay = (id: ActivityId) => {
    playSound('whoosh', settings.soundEnabled)
    setOpen(false)
    onPlay(id)
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          playSound('pop', settings.soundEnabled)
          setOpen(true)
        }}
        className={`w-full max-w-3xl mx-auto rounded-3xl p-4 sm:p-5 shadow-lg border-4 text-left flex items-center gap-4 transition-colors ${
          isCompletedToday
            ? 'bg-gradient-to-r from-emerald-100 to-green-100 border-emerald-300'
            : 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300'
        }`}
      >
        <motion.div
          animate={isCompletedToday ? { rotate: [0, 10, -10, 0] } : { scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-4xl sm:text-5xl"
        >
          {isCompletedToday ? '🏆' : '🎁'}
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-amber-800 text-sm sm:text-base">
              Daily Challenge
            </h3>
            <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              +5 ⭐ bonus
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-700 mt-0.5">
            {isCompletedToday
              ? 'Completed today! Come back tomorrow. 🌟'
              : `Play ${todaysGames.length - completedCount} more game${
                  todaysGames.length - completedCount === 1 ? '' : 's'
                } to win!`}
          </p>
          <div className="flex gap-1 mt-2">
            {todaysGames.map((g, i) => {
              const done =
                progress[g].lastPlayed &&
                Date.now() - progress[g].lastPlayed! < 24 * 60 * 60 * 1000
              return (
                <div
                  key={g}
                  className={`w-8 h-1.5 rounded-full ${
                    done ? 'bg-emerald-500' : 'bg-amber-200'
                  }`}
                />
              )
            })}
          </div>
        </div>

        {/* Streak badge */}
        <div className="flex flex-col items-center gap-1 bg-white/60 rounded-2xl px-3 py-2">
          <Flame
            className={`w-5 h-5 ${
              streak.current >= 3 ? 'text-orange-500' : 'text-slate-400'
            }`}
          />
          <span className="text-xs font-bold text-amber-800">
            {streak.current} day{streak.current === 1 ? '' : 's'}
          </span>
        </div>
      </motion.button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-amber-700 flex items-center justify-center gap-2">
              <Gift className="w-5 h-5" /> Today&apos;s Challenge
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-center text-sm text-slate-600">
              Play these {todaysGames.length} games today to earn{' '}
              <span className="font-bold text-amber-700">5 bonus stars</span>!
            </p>

            <div className="space-y-2">
              {todaysGames.map((g, i) => {
                const meta = activityMeta[g]
                const done =
                  progress[g].lastPlayed &&
                  Date.now() - progress[g].lastPlayed! < 24 * 60 * 60 * 1000
                return (
                  <motion.button
                    key={g}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePlay(g)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-colors ${
                      done
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-white border-amber-200 hover:border-amber-400'
                    }`}
                  >
                    <span className="text-3xl">{meta.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-slate-700 text-sm">
                        {meta.title}
                      </p>
                      <p className="text-xs text-slate-500">{meta.subtitle}</p>
                    </div>
                    {done ? (
                      <div className="bg-emerald-500 text-white rounded-full w-7 h-7 flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-amber-700">
                        {i + 1}
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Streak info */}
            <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl p-3 border-2 border-orange-200 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div className="flex-1">
                <p className="text-xs font-bold text-orange-700">
                  {streak.current} day streak!
                </p>
                <p className="text-[10px] text-orange-600">
                  Longest: {streak.longest} days • Come back tomorrow!
                </p>
              </div>
              <Flame
                className={`w-6 h-6 ${
                  streak.current >= 3 ? 'text-orange-500' : 'text-slate-300'
                }`}
              />
            </div>

            {isCompletedToday && (
              <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-300 text-center">
                <p className="text-3xl mb-1">🎉</p>
                <p className="font-bold text-emerald-700">You did it!</p>
                <p className="text-xs text-emerald-600">
                  Come back tomorrow for a new challenge!
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
