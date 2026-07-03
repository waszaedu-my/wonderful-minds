'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { FeedbackOverlay, ConfettiBurst } from '@/components/feedback-overlay'
import { patternQuestions, type PatternQuestion } from '@/lib/games-data'
import { playSound, speak } from '@/lib/sound'
import { useGameStore } from '@/lib/game-store'
import { RotateCw, Check } from 'lucide-react'

interface PatternGameProps {
  onBack: () => void
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

const TOTAL_ROUNDS = 6

export function PatternGame({ onBack }: PatternGameProps) {
  const addStars = useGameStore((s) => s.addStars)
  const recordRound = useGameStore((s) => s.recordRound)
  const settings = useGameStore((s) => s.settings)

  const [questions, setQuestions] = useState<PatternQuestion[]>([])
  const [round, setRound] = useState(0)
  const [picked, setPicked] = useState<string | number | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)

  const current = questions[round]

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuestions(shuffle(patternQuestions).slice(0, TOTAL_ROUNDS))
  }, [])

  const handlePick = (option: string | number) => {
    if (picked !== null || !current) return
    setPicked(option)
    if (option === current.answer) {
      playSound('correct', settings.soundEnabled)
      speak('Great job!', settings.soundEnabled)
      setFeedback('correct')
      const newStreak = streak + 1
      setStreak(newStreak)
      setScore(score + 1)
      const starsEarned = 1 + (newStreak >= 3 ? 1 : 0)
      addStars('patterns', starsEarned)
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
      recordRound('patterns', streak)
      setTimeout(() => {
        setCelebrate(false)
        setRound(0)
        setScore(0)
        setStreak(0)
        setQuestions(shuffle(patternQuestions).slice(0, TOTAL_ROUNDS))
      }, 2400)
    } else {
      setRound(round + 1)
      setPicked(null)
      setFeedback(null)
    }
  }

  useEffect(() => {
    if (picked !== null && current && picked === current.answer && !feedback) {
      const t = setTimeout(handleNext, 900)
      return () => clearTimeout(t)
    }
     
  }, [picked, feedback, current])

  if (!current) {
    return (
      <GameShell
        activityId="patterns"
        title="Pattern Play"
        emoji="🔁"
        onBack={onBack}
        instruction="Loading..."
      >
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-5xl"
          >
            🔁
          </motion.div>
        </div>
      </GameShell>
    )
  }

  return (
    <GameShell
      activityId="patterns"
      title="Pattern Play"
      emoji="🔁"
      onBack={onBack}
      instruction={`Round ${round + 1} of ${TOTAL_ROUNDS} • What comes next?`}
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

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {/* Pattern display */}
        <motion.div
          key={`pattern-${round}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="bg-white rounded-3xl p-4 sm:p-6 shadow-lg border-4 border-lime-200 max-w-2xl w-full"
        >
          <p className="text-center text-sm font-semibold text-lime-700 mb-3">
            Look at the pattern:
          </p>
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            {current.sequence.map((item, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-lime-100 border-2 border-lime-300 flex items-center justify-center text-3xl sm:text-4xl font-bold"
              >
                {item}
              </motion.div>
            ))}
            {/* Question mark box */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-amber-200 border-2 border-amber-400 border-dashed flex items-center justify-center text-3xl font-bold text-amber-700"
            >
              ?
            </motion.div>
          </div>
        </motion.div>

        {/* Options */}
        <div className="w-full max-w-2xl">
          <p className="text-center text-sm font-semibold text-lime-700 mb-3">
            Pick what comes next:
          </p>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {current.options.map((opt) => {
              const isPicked = picked === opt
              const isCorrect = opt === current.answer
              const showResult = picked !== null
              return (
                <motion.button
                  key={String(opt)}
                  onClick={() => handlePick(opt)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={picked !== null}
                  className={`relative aspect-square rounded-2xl shadow-md border-4 transition-all flex items-center justify-center text-4xl sm:text-5xl font-bold
                    ${
                      showResult && isCorrect
                        ? 'border-emerald-400 bg-emerald-50'
                        : showResult && isPicked && !isCorrect
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-lime-200 bg-white hover:border-lime-400'
                    }`}
                  aria-label={`Option: ${opt}`}
                >
                  {opt}
                  {showResult && isCorrect && (
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full w-7 h-7 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        <AnimatePresence>
          {picked === current.answer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-emerald-600 font-semibold mb-2">
                Yes! {current.answer} comes next!
              </p>
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-lime-600 text-white rounded-full font-bold hover:bg-lime-700 transition-colors"
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
