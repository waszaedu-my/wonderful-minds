'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { FeedbackOverlay, ConfettiBurst } from '@/components/feedback-overlay'
import { opposites, type OppositePair } from '@/lib/games-data'
import { playSound, speak } from '@/lib/sound'
import { useGameStore } from '@/lib/game-store'
import { Volume2, RotateCw, Check } from 'lucide-react'

interface OppositesGameProps {
  onBack: () => void
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

const TOTAL_ROUNDS = 6

export function OppositesGame({ onBack }: OppositesGameProps) {
  const addStars = useGameStore((s) => s.addStars)
  const recordRound = useGameStore((s) => s.recordRound)
  const settings = useGameStore((s) => s.settings)

  const [round, setRound] = useState(0)
  const [pair, setPair] = useState<OppositePair>(() => opposites[0])
  const [showLeft, setShowLeft] = useState(true)
  const [options, setOptions] = useState<{ word: string; emoji: string }[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)

  const newRound = () => {
    const newPair = opposites[Math.floor(Math.random() * opposites.length)]
    // Use a LOCAL variable so options match the prompt
    const newShowLeft = Math.random() > 0.5
    setPair(newPair)
    setShowLeft(newShowLeft)
    // The correct answer is the OPPOSITE side of what we're showing
    const correct = newShowLeft ? newPair.right : newPair.left
    // Wrong options: same side as the correct answer, from other pairs
    const wrongs = shuffle(opposites.filter((p) => p.id !== newPair.id))
      .slice(0, 3)
      .map((p) => (newShowLeft ? p.right : p.left))
    setOptions(shuffle([correct, ...wrongs]))
    setPicked(null)
    setFeedback(null)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    newRound()
  }, [])

  const handlePick = (optionWord: string) => {
    if (picked) return
    setPicked(optionWord)
    const correctWord = showLeft ? pair.right.word : pair.left.word
    const correctEmoji = showLeft ? pair.right.emoji : pair.left.emoji
    if (optionWord === correctWord) {
      playSound('correct', settings.soundEnabled)
      speak(`${pair.left.word} and ${pair.right.word} are opposites!`, settings.soundEnabled)
      setFeedback('correct')
      const newStreak = streak + 1
      setStreak(newStreak)
      setScore(score + 1)
      const starsEarned = 1 + (newStreak >= 3 ? 1 : 0)
      addStars('opposites', starsEarned)
      setTimeout(() => setFeedback(null), 1300)
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
      recordRound('opposites', streak)
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
    if (picked !== null && !feedback) {
      const correctWord = showLeft ? pair.right.word : pair.left.word
      if (picked === correctWord) {
        const t = setTimeout(handleNext, 900)
        return () => clearTimeout(t)
      }
    }
     
  }, [picked, feedback])

  const prompt = showLeft ? pair.left : pair.right
  const correctAnswer = showLeft ? pair.right : pair.left

  return (
    <GameShell
      activityId="opposites"
      title="Opposites"
      emoji="⚖️"
      onBack={onBack}
      instruction={`Round ${round + 1} of ${TOTAL_ROUNDS} • Find the opposite!`}
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
        {/* Prompt */}
        <motion.div
          key={`${pair.id}-${round}-${showLeft}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-4 border-teal-200 max-w-md w-full text-center"
        >
          <p className="text-base sm:text-lg font-bold text-teal-700 mb-3">
            This is:
          </p>
          <motion.div
            className="text-7xl sm:text-8xl mb-3"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {prompt.emoji}
          </motion.div>
          <div className="text-3xl font-extrabold text-slate-700 mb-3">
            {prompt.word}
          </div>
          <button
            onClick={() => speak(prompt.word, settings.soundEnabled)}
            className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-800"
          >
            <Volume2 className="w-4 h-4" /> Listen
          </button>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl">
          {options.map((opt) => {
            const word = opt.word
            const emoji = opt.emoji
            const isPicked = picked === word
            const isCorrect = word === correctAnswer.word
            const showResult = picked !== null
            return (
              <motion.button
                key={word}
                onClick={() => handlePick(word)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={picked !== null}
                className={`relative bg-white rounded-3xl p-4 sm:p-5 shadow-md border-4 transition-all flex flex-col items-center gap-2 min-h-[120px]
                  ${
                    showResult && isCorrect
                      ? 'border-emerald-400 bg-emerald-50'
                      : showResult && isPicked && !isCorrect
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-teal-100 hover:border-teal-300'
                  }`}
                aria-label={`Opposite: ${word}`}
              >
                <motion.span
                  className="text-5xl sm:text-6xl"
                  animate={
                    showResult && isCorrect
                      ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }
                      : { scale: 1 }
                  }
                >
                  {emoji}
                </motion.span>
                <span className="text-sm sm:text-base font-bold text-slate-700">
                  {word}
                </span>
                {showResult && isCorrect && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full w-7 h-7 flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence>
          {picked === correctAnswer.word && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-emerald-600 font-semibold mb-2">
                Yes! {pair.left.word} and {pair.right.word} are opposites!
              </p>
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-full font-bold hover:bg-teal-700 transition-colors"
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
