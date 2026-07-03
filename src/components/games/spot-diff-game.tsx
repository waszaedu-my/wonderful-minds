'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { FeedbackOverlay, ConfettiBurst } from '@/components/feedback-overlay'
import { playSound, speak } from '@/lib/sound'
import { useGameStore } from '@/lib/game-store'
import { RotateCw, Check, Eye } from 'lucide-react'

interface SpotDiffGameProps {
  onBack: () => void
}

interface DiffPuzzle {
  id: string
  base: string[] // grid of emojis
  modified: string[] // grid with one diff
  diffIndex: number
  description: string
}

// Generate puzzles using emoji grids - each puzzle has 9 emojis, one is changed
const puzzles: DiffPuzzle[] = [
  {
    id: 'p1',
    base: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍑', '🥝', '🍍'],
    modified: ['🍎', '🍌', '🍇', '🍓', '🍋', '🍉', '🍑', '🥝', '🍍'],
    diffIndex: 4,
    description: 'The orange became a lemon!',
  },
  {
    id: 'p2',
    base: ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼', '🦁', '🐯', '🐨'],
    modified: ['🐶', '🐱', '🐰', '🐻', '🦊', '🐼', '🐮', '🐯', '🐨'],
    diffIndex: 6,
    description: 'The lion became a cow!',
  },
  {
    id: 'p3',
    base: ['⭐', '🌙', '☀️', '☁️', '🌧️', '⚡', '🌈', '❄️', '🌪️'],
    modified: ['⭐', '🌙', '☀️', '☁️', '🌧️', '🔥', '🌈', '❄️', '🌪️'],
    diffIndex: 5,
    description: 'The lightning became fire!',
  },
  {
    id: 'p4',
    base: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒'],
    modified: ['🚗', '🚕', '🚙', '🚲', '🚎', '🏎️', '🚓', '🚑', '🚒'],
    diffIndex: 3,
    description: 'The bus became a bike!',
  },
  {
    id: 'p5',
    base: ['🎈', '🎁', '🎀', '🎉', '🎊', '🎂', '🍰', '🧁', '🍭'],
    modified: ['🎈', '🎁', '🎀', '🎉', '🎊', '🍕', '🍰', '🧁', '🍭'],
    diffIndex: 5,
    description: 'The cake became a pizza!',
  },
  {
    id: 'p6',
    base: ['🌟', '✨', '💫', '⭐', '🌠', '🌌', '🪐', '🌙', '🌞'],
    modified: ['🌟', '✨', '💫', '⭐', '🌠', '🌌', '🪐', '🌙', '🌼'],
    diffIndex: 8,
    description: 'The sun became a flower!',
  },
]

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

const TOTAL_ROUNDS = 5

export function SpotDiffGame({ onBack }: SpotDiffGameProps) {
  const addStars = useGameStore((s) => s.addStars)
  const recordRound = useGameStore((s) => s.recordRound)
  const settings = useGameStore((s) => s.settings)

  const [round, setRound] = useState(0)
  const [puzzle, setPuzzle] = useState<DiffPuzzle>(() => puzzles[0])
  const [picked, setPicked] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)
  const [puzzleQueue, setPuzzleQueue] = useState<DiffPuzzle[]>([])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPuzzleQueue(shuffle(puzzles).slice(0, TOTAL_ROUNDS))
  }, [])

  useEffect(() => {
    if (puzzleQueue.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPuzzle(puzzleQueue[0])
    }
  }, [puzzleQueue])

  const handlePick = (idx: number) => {
    if (picked !== null) return
    setPicked(idx)
    if (idx === puzzle.diffIndex) {
      playSound('correct', settings.soundEnabled)
      speak(`You found it! ${puzzle.description}`, settings.soundEnabled)
      setFeedback('correct')
      const newStreak = streak + 1
      setStreak(newStreak)
      setScore(score + 1)
      const starsEarned = 2 + (newStreak >= 3 ? 1 : 0)
      addStars('spot-diff', starsEarned)
      setTimeout(() => setFeedback(null), 1400)
    } else {
      playSound('wrong', settings.soundEnabled)
      setFeedback('wrong')
      setStreak(0)
      setTimeout(() => {
        setFeedback(null)
        setPicked(null)
      }, 1300)
    }
  }

  const handleNext = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      playSound('celebrate', settings.soundEnabled)
      setCelebrate(true)
      recordRound('spot-diff', streak)
      setTimeout(() => {
        setCelebrate(false)
        setRound(0)
        setScore(0)
        setStreak(0)
        const newQueue = shuffle(puzzles).slice(0, TOTAL_ROUNDS)
        setPuzzleQueue(newQueue)
      }, 2400)
    } else {
      setRound(round + 1)
      setPuzzle(puzzleQueue[round + 1])
      setPicked(null)
      setFeedback(null)
    }
  }

  useEffect(() => {
    if (picked === puzzle.diffIndex && !feedback) {
      const t = setTimeout(handleNext, 1100)
      return () => clearTimeout(t)
    }
     
  }, [picked, feedback])

  return (
    <GameShell
      activityId="spot-diff"
      title="Spot the Difference"
      emoji="🔍"
      onBack={onBack}
      instruction={`Round ${round + 1} of ${TOTAL_ROUNDS} • Find what is different!`}
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
        message={`You found ${score}!`}
        reducedMotion={settings.reducedMotion}
      />

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-2 bg-emerald-100 px-4 py-2 rounded-full border-2 border-emerald-300">
          <Eye className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700">
            Look carefully — one thing is different!
          </span>
        </div>

        {/* Side by side grids */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl">
          {/* Base grid (top) */}
          <div className="bg-white rounded-2xl p-3 border-4 border-emerald-200">
            <p className="text-xs font-bold text-emerald-600 text-center mb-2">
              Picture 1
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {puzzle.base.map((emoji, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-3xl sm:text-4xl"
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>

          {/* Modified grid (bottom) - tap to find diff */}
          <div className="bg-white rounded-2xl p-3 border-4 border-emerald-200">
            <p className="text-xs font-bold text-emerald-600 text-center mb-2">
              Picture 2 (tap!)
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {puzzle.modified.map((emoji, i) => {
                const isPicked = picked === i
                const isCorrect = i === puzzle.diffIndex
                const showResult = picked !== null
                return (
                  <motion.button
                    key={i}
                    onClick={() => handlePick(i)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={picked !== null}
                    className={`aspect-square rounded-lg border flex items-center justify-center text-3xl sm:text-4xl transition-all ${
                      showResult && isCorrect
                        ? 'bg-emerald-200 border-emerald-500 scale-105'
                        : showResult && isPicked && !isCorrect
                          ? 'bg-rose-100 border-rose-400'
                          : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
                    }`}
                    aria-label={`Position ${i + 1}`}
                  >
                    {emoji}
                    {showResult && isCorrect && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                      >
                        <Check className="w-3 h-3" />
                      </motion.span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {picked === puzzle.diffIndex && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-emerald-600 font-semibold mb-2">
                You found it! {puzzle.description}
              </p>
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors"
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
            <span className="font-bold text-amber-700">🔥 {streak} in a row!</span>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
