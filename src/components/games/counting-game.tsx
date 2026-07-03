'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { FeedbackOverlay, ConfettiBurst } from '@/components/feedback-overlay'
import { playSound, speak } from '@/lib/sound'
import { useGameStore } from '@/lib/game-store'
import { Volume2, RotateCw, Check } from 'lucide-react'

interface CountingGameProps {
  onBack: () => void
}

const fruitEmojis = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍑', '🥝', '🍍', '🥥']
const TOTAL_ROUNDS = 6

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function CountingGame({ onBack }: CountingGameProps) {
  const addStars = useGameStore((s) => s.addStars)
  const recordRound = useGameStore((s) => s.recordRound)
  const settings = useGameStore((s) => s.settings)

  const [round, setRound] = useState(0)
  const [target, setTarget] = useState(0)
  const [emoji, setEmoji] = useState(fruitEmojis[0])
  const [options, setOptions] = useState<number[]>([])
  const [picked, setPicked] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)
  const [tappedCount, setTappedCount] = useState(0)

  const newRound = () => {
    const newTarget = Math.floor(Math.random() * 8) + 2 // 2-9
    const newEmoji = fruitEmojis[Math.floor(Math.random() * fruitEmojis.length)]
    setTarget(newTarget)
    setEmoji(newEmoji)
    // Generate 3 wrong options near the target (wide enough range to avoid infinite loop)
    const wrongs = new Set<number>()
    while (wrongs.size < 3) {
      const delta = Math.floor(Math.random() * 7) - 3 // -3..+3
      const candidate = newTarget + delta
      if (candidate > 0 && candidate !== newTarget && candidate <= 12) {
        wrongs.add(candidate)
      }
    }
    setOptions(shuffle([newTarget, ...Array.from(wrongs)]))
    setPicked(null)
    setFeedback(null)
    setTappedCount(0)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    newRound()
  }, [])

  const handlePick = (n: number) => {
    if (picked !== null) return
    setPicked(n)
    if (n === target) {
      playSound('correct', settings.soundEnabled)
      speak(`${n}! Great job!`, settings.soundEnabled)
      setFeedback('correct')
      const newStreak = streak + 1
      setStreak(newStreak)
      setScore(score + 1)
      const starsEarned = 1 + (newStreak >= 3 ? 1 : 0)
      addStars('counting', starsEarned)
      setTimeout(() => setFeedback(null), 1200)
    } else {
      playSound('wrong', settings.soundEnabled)
      setFeedback('wrong')
      setStreak(0)
      setTimeout(() => {
        setFeedback(null)
        setPicked(null)
      }, 1400)
    }
  }

  const handleNext = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      playSound('celebrate', settings.soundEnabled)
      setCelebrate(true)
      recordRound('counting', streak)
      setTimeout(() => {
        setCelebrate(false)
        setRound(0)
        setScore(0)
        setStreak(0)
        newRound()
      }, 2400)
    } else {
      setRound(round + 1)
      newRound()
    }
  }

  useEffect(() => {
    if (picked === target && !feedback) {
      const t = setTimeout(handleNext, 900)
      return () => clearTimeout(t)
    }
     
  }, [picked, feedback])

  const handleTapFruit = (idx: number) => {
    if (tappedCount < target) {
      playSound('pop', settings.soundEnabled)
      const newCount = idx + 1
      setTappedCount(newCount)
      if (newCount <= target) {
        speak(String(newCount), settings.soundEnabled)
      }
    }
  }

  return (
    <GameShell
      activityId="counting"
      title="Counting Fun"
      emoji="🔢"
      onBack={onBack}
      instruction={`Round ${round + 1} of ${TOTAL_ROUNDS} • How many do you see? Tap them to count!`}
    >
      <ConfettiBurst show={celebrate} reducedMotion={settings.reducedMotion} />
      <FeedbackOverlay
        show={feedback !== null}
        type={feedback ?? 'correct'}
        reducedMotion={settings.reducedMotion}
      />
      <FeedbackOverlay
        show={celebrate}
        type="celebrate"
        message={`You got ${score} right!`}
        reducedMotion={settings.reducedMotion}
      />

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* Counter display */}
        <div className="bg-white rounded-2xl px-6 py-3 shadow-md border-4 border-sky-200 flex items-center gap-3">
          <span className="text-sm font-semibold text-sky-600">
            Counted:
          </span>
          <span className="text-3xl font-extrabold text-sky-700">
            {tappedCount}
          </span>
          <button
            onClick={() => speak(`There are ${target}`, settings.soundEnabled)}
            className="inline-flex items-center gap-1 text-sm text-sky-500 hover:text-sky-700 ml-2"
          >
            <Volume2 className="w-4 h-4" /> Listen
          </button>
        </div>

        {/* Fruits grid */}
        <motion.div
          key={`fruits-${round}`}
          className="bg-white/80 rounded-3xl p-4 sm:p-6 shadow-lg border-4 border-sky-200 w-full max-w-md min-h-[180px] flex items-center justify-center"
        >
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {[...Array(target)].map((_, i) => {
              const isTapped = i < tappedCount
              return (
                <motion.button
                  key={i}
                  onClick={() => handleTapFruit(i)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  animate={
                    isTapped
                      ? { scale: [1, 1.3, 1.1], opacity: 1 }
                      : { scale: 1, opacity: 0.85 }
                  }
                  className="text-3xl sm:text-4xl p-1"
                  aria-label={`Item ${i + 1}`}
                >
                  {emoji}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Answer options */}
        <div className="flex gap-3 sm:gap-4 flex-wrap justify-center">
          {options.map((n) => {
            const isPicked = picked === n
            const isCorrect = n === target
            const showResult = picked !== null
            return (
              <motion.button
                key={n}
                onClick={() => handlePick(n)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={picked !== null}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-md border-4 flex items-center justify-center text-3xl sm:text-4xl font-extrabold transition-all
                  ${
                    showResult && isCorrect
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : showResult && isPicked && !isCorrect
                        ? 'border-rose-400 bg-rose-50 text-rose-700'
                        : 'border-sky-200 bg-white text-sky-700 hover:border-sky-400'
                  }`}
                aria-label={`Answer: ${n}`}
              >
                {n}
                {showResult && isCorrect && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence>
          {picked === target && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-emerald-600 font-semibold mb-2">
                Yes! There are {target} {emoji}.
              </p>
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white rounded-full font-bold hover:bg-sky-700 transition-colors"
              >
                Next <RotateCw className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {streak >= 2 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-amber-100 px-4 py-2 rounded-full border-2 border-amber-300"
          >
            <span className="font-bold text-amber-700">
              🔥 {streak} in a row!
            </span>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
