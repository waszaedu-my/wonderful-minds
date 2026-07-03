'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { FeedbackOverlay, ConfettiBurst } from '@/components/feedback-overlay'
import { animals, type Animal } from '@/lib/games-data'
import { playSound, speak } from '@/lib/sound'
import { useGameStore } from '@/lib/game-store'
import { Volume2, RotateCw, Check } from 'lucide-react'

interface AnimalGameProps {
  onBack: () => void
}

type Mode = 'sound' | 'name' | 'habitat'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

const TOTAL_ROUNDS = 6

export function AnimalGame({ onBack }: AnimalGameProps) {
  const addStars = useGameStore((s) => s.addStars)
  const recordRound = useGameStore((s) => s.recordRound)
  const settings = useGameStore((s) => s.settings)

  const [round, setRound] = useState(0)
  const [mode, setMode] = useState<Mode>('sound')
  const [target, setTarget] = useState<Animal>(() => animals[0])
  const [options, setOptions] = useState<Animal[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)

  const newRound = () => {
    const modes: Mode[] = ['sound', 'name', 'habitat']
    const newMode = modes[Math.floor(Math.random() * modes.length)]
    setMode(newMode)
    const newTarget = animals[Math.floor(Math.random() * animals.length)]
    setTarget(newTarget)
    // In habitat mode, wrong options must be from DIFFERENT habitats
    // so only the target is correct for its habitat
    const others =
      newMode === 'habitat'
        ? shuffle(
            animals.filter(
              (a) => a.id !== newTarget.id && a.habitat !== newTarget.habitat
            )
          ).slice(0, 3)
        : shuffle(animals.filter((a) => a.id !== newTarget.id)).slice(0, 3)
    setOptions(shuffle([newTarget, ...others]))
    setPicked(null)
    setFeedback(null)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    newRound()
  }, [])

  const instruction = useMemo(() => {
    return mode === 'sound'
      ? 'Which animal makes this sound?'
      : mode === 'name'
        ? 'Find this animal:'
        : 'Which animal lives here?'
  }, [mode])

  const handlePick = (id: string) => {
    if (picked) return
    setPicked(id)
    const correct = id === target.id
    if (correct) {
      playSound('correct', settings.soundEnabled)
      speak(`${target.name}! ${target.sound}`, settings.soundEnabled)
      setFeedback('correct')
      const newStreak = streak + 1
      setStreak(newStreak)
      setScore(score + 1)
      const starsEarned = 1 + (newStreak >= 3 ? 1 : 0)
      addStars('animals', starsEarned)
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
      recordRound('animals', streak)
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
    if (picked === target.id && !feedback) {
      const t = setTimeout(handleNext, 900)
      return () => clearTimeout(t)
    }
     
  }, [picked, feedback])

  const targetDisplay = () => {
    if (mode === 'sound') {
      return (
        <>
          <p className="text-base sm:text-lg font-bold text-orange-700 mb-3">
            Which animal says:
          </p>
          <motion.div
            className="text-3xl sm:text-4xl font-extrabold text-orange-800 mb-3 italic"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            &ldquo;{target.sound}&rdquo;
          </motion.div>
          <button
            onClick={() => speak(target.sound, settings.soundEnabled)}
            className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800"
          >
            <Volume2 className="w-4 h-4" /> Listen
          </button>
        </>
      )
    }
    if (mode === 'name') {
      return (
        <>
          <p className="text-base sm:text-lg font-bold text-orange-700 mb-3">
            Find the:
          </p>
          <div className="text-4xl sm:text-5xl font-extrabold text-orange-800 mb-3">
            {target.name}
          </div>
          <button
            onClick={() => speak(target.name, settings.soundEnabled)}
            className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800"
          >
            <Volume2 className="w-4 h-4" /> Listen
          </button>
        </>
      )
    }
    return (
      <>
        <p className="text-base sm:text-lg font-bold text-orange-700 mb-3">
          Who lives here:
        </p>
        <div className="text-4xl sm:text-5xl mb-3">
          {target.habitat === 'Home' && '🏠'}
          {target.habitat === 'Farm' && '🚜'}
          {target.habitat === 'Pond' && '🪷'}
          {target.habitat === 'Garden' && '🌷'}
          {target.habitat === 'Sky' && '☁️'}
          {target.habitat === 'Forest' && '🌲'}
          {target.habitat === 'Savanna' && '🦒'}
          {target.habitat === 'Jungle' && '🌴'}
        </div>
        <div className="text-xl font-bold text-orange-800 mb-2">
          {target.habitat}
        </div>
        <button
          onClick={() => speak(target.habitat, settings.soundEnabled)}
          className="inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-800"
        >
          <Volume2 className="w-4 h-4" /> Listen
        </button>
      </>
    )
  }

  return (
    <GameShell
      activityId="animals"
      title="Animal Friends"
      emoji="🐾"
      onBack={onBack}
      instruction={`Round ${round + 1} of ${TOTAL_ROUNDS} • ${instruction}`}
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
        <motion.div
          key={`${target.id}-${round}-${mode}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-4 border-orange-200 max-w-md w-full text-center"
        >
          {targetDisplay()}
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl">
          {options.map((opt) => {
            const isPicked = picked === opt.id
            const isCorrect = opt.id === target.id
            const showResult = picked !== null
            return (
              <motion.button
                key={opt.id}
                onClick={() => handlePick(opt.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={picked !== null}
                className={`relative bg-white rounded-3xl p-4 sm:p-5 shadow-md border-4 transition-all flex flex-col items-center gap-2 min-h-[120px]
                  ${
                    showResult && isCorrect
                      ? 'border-emerald-400 bg-emerald-50'
                      : showResult && isPicked && !isCorrect
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-orange-100 hover:border-orange-300'
                  }`}
                aria-label={`Animal: ${opt.name}`}
              >
                <motion.span
                  className="text-5xl sm:text-6xl"
                  animate={
                    showResult && isCorrect
                      ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] }
                      : { scale: 1 }
                  }
                >
                  {opt.emoji}
                </motion.span>
                <span className="text-sm sm:text-base font-bold text-slate-700">
                  {opt.name}
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
          {picked === target.id && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <p className="text-emerald-600 font-semibold mb-2">
                Yes! That is the {target.name.toLowerCase()}! {target.sound}
              </p>
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors"
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
