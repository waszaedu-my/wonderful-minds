'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/lib/game-store'
import { playSound } from '@/lib/sound'

// Hook that watches game state and unlocks achievements automatically.
// Also fires confetti/toast when a new achievement is unlocked.
export function useAchievementWatcher() {
  const totalStars = useGameStore((s) => s.totalStars())
  const progress = useGameStore((s) => s.progress)
  const achievements = useGameStore((s) => s.achievements)
  const unlockAchievement = useGameStore((s) => s.unlockAchievement)
  const streak = useGameStore((s) => s.streak)
  const dailyChallengeCompleted = useGameStore((s) => s.dailyChallengeCompleted)
  const settings = useGameStore((s) => s.settings)
  const feedCount = useRef(0)

  useEffect(() => {
    // Star milestones
    if (totalStars >= 1) unlockAchievement('first-star')
    if (totalStars >= 10) unlockAchievement('ten-stars')
    if (totalStars >= 50) unlockAchievement('fifty-stars')
    if (totalStars >= 100) unlockAchievement('hundred-stars')

    // Games played (any with completedRounds > 0)
    const gamesPlayed = Object.values(progress).filter((p) => p.completedRounds > 0).length
    if (gamesPlayed >= 1) unlockAchievement('first-game')
    if (gamesPlayed >= 5) unlockAchievement('five-games')
    if (gamesPlayed >= 8) unlockAchievement('all-games') // 8+ games tried

    // Streak
    if (streak.current >= 3) unlockAchievement('streak-3')
    if (streak.current >= 7) unlockAchievement('streak-7')

    // Daily challenge
    if (dailyChallengeCompleted) unlockAchievement('daily-challenge')

    // Memory master
    if (progress.memory?.bestStreak >= 4 && progress.memory.completedRounds > 0) {
      // approximate
      unlockAchievement('memory-master')
    }

    // Routine
    if (progress.routines?.completedRounds > 0) {
      unlockAchievement('perfect-routine')
    }

    // Calm breather
    if (progress.calm?.completedRounds >= 3) {
      unlockAchievement('calm-breather')
    }

    // Pet friend (any star = feeding pet)
    if (totalStars >= 5) {
      unlockAchievement('pet-friend')
    }

    // Drawing (any)
    if (progress.drawing?.completedRounds > 0) {
      unlockAchievement('artist')
    }

    // Music
    if (progress['music-maker']?.completedRounds > 0) {
      unlockAchievement('musician')
    }
  }, [
    totalStars,
    progress,
    streak.current,
    dailyChallengeCompleted,
    unlockAchievement,
  ])

  // Watch for newly unlocked achievements and play sound
  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const prevUnlocked = useRef(unlockedCount)
  useEffect(() => {
    if (unlockedCount > prevUnlocked.current) {
      playSound('celebrate', settings.soundEnabled)
    }
    prevUnlocked.current = unlockedCount
  }, [unlockedCount, settings.soundEnabled])
}
