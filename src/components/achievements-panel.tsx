'use client'

import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/game-store'
import { playSound } from '@/lib/sound'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Award, Lock } from 'lucide-react'

export function AchievementsPanel() {
  const achievements = useGameStore((s) => s.achievements)
  const settings = useGameStore((s) => s.settings)

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => playSound('click', settings.soundEnabled)}
          className="relative bg-white rounded-3xl p-2 sm:p-3 shadow-md border-4 border-amber-200 flex items-center gap-2 cursor-pointer"
          aria-label="View achievements"
        >
          <Award className="w-5 h-5 text-amber-500" />
          <div className="text-left">
            <p className="font-extrabold text-amber-700 text-xs sm:text-sm leading-tight">
              Badges
            </p>
            <p className="text-[10px] text-amber-600 leading-tight">
              {unlockedCount}/{totalCount}
            </p>
          </div>
          {unlockedCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {unlockedCount}
            </span>
          )}
        </motion.button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-amber-700 flex items-center justify-center gap-2">
            <Award className="w-5 h-5" /> My Badges
          </DialogTitle>
        </DialogHeader>

        <p className="text-center text-sm text-slate-500 mb-3">
          You earned {unlockedCount} of {totalCount} badges!
        </p>

        <div className="grid grid-cols-2 gap-3">
          {achievements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-2xl p-3 border-2 flex flex-col items-center gap-1 text-center ${
                a.unlocked
                  ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-300'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="text-4xl relative">
                {a.unlocked ? a.emoji : '🔒'}
              </div>
              <p className="text-xs font-bold text-slate-700 leading-tight">
                {a.title}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                {a.description}
              </p>
              {a.unlocked ? (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                  ✓ Earned
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> Locked
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
