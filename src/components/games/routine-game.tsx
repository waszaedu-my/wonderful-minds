'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { FeedbackOverlay, ConfettiBurst } from '@/components/feedback-overlay'
import { morningRoutine, eveningRoutine, type RoutineStep } from '@/lib/games-data'
import { playSound, speak } from '@/lib/sound'
import { useGameStore } from '@/lib/game-store'
import { RotateCw, Check, ChevronUp, ChevronDown, Sun, Moon } from 'lucide-react'

interface RoutineGameProps {
  onBack: () => void
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function RoutineGame({ onBack }: RoutineGameProps) {
  const addStars = useGameStore((s) => s.addStars)
  const recordRound = useGameStore((s) => s.recordRound)
  const settings = useGameStore((s) => s.settings)

  const [routineType, setRoutineType] = useState<'morning' | 'evening'>(
    'morning'
  )
  const [shuffled, setShuffled] = useState<RoutineStep[]>([])
  const [ordered, setOrdered] = useState<RoutineStep[]>([])
  const [checking, setChecking] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [wrongStep, setWrongStep] = useState<number | null>(null)

  const startRoutine = (type: 'morning' | 'evening') => {
    setRoutineType(type)
    const steps = type === 'morning' ? morningRoutine : eveningRoutine
    setShuffled(shuffle(steps))
    setOrdered([])
    setChecking(false)
    setFeedback(null)
    setWrongStep(null)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startRoutine('morning')
  }, [])

  const handleAdd = (step: RoutineStep) => {
    if (checking) return
    playSound('pop', settings.soundEnabled)
    speak(step.label, settings.soundEnabled)
    setShuffled(shuffled.filter((s) => s.id !== step.id))
    setOrdered([...ordered, step])
  }

  const handleRemove = (step: RoutineStep) => {
    if (checking) return
    playSound('click', settings.soundEnabled)
    setOrdered(ordered.filter((s) => s.id !== step.id))
    setShuffled([...shuffled, step])
  }

  const moveUp = (idx: number) => {
    if (checking || idx === 0) return
    playSound('click', settings.soundEnabled)
    const newOrdered = [...ordered]
    ;[newOrdered[idx - 1], newOrdered[idx]] = [newOrdered[idx], newOrdered[idx - 1]]
    setOrdered(newOrdered)
  }

  const moveDown = (idx: number) => {
    if (checking || idx === ordered.length - 1) return
    playSound('click', settings.soundEnabled)
    const newOrdered = [...ordered]
    ;[newOrdered[idx], newOrdered[idx + 1]] = [newOrdered[idx + 1], newOrdered[idx]]
    setOrdered(newOrdered)
  }

  const handleCheck = () => {
    const correctOrder =
      routineType === 'morning' ? morningRoutine : eveningRoutine
    const isCorrect = ordered.every(
      (step, i) => step.id === correctOrder[i].id
    )

    setChecking(true)
    if (isCorrect) {
      playSound('celebrate', settings.soundEnabled)
      speak('Perfect! You got the routine right!', settings.soundEnabled)
      setCelebrate(true)
      addStars('routines', 5)
      recordRound('routines', 1)
      setTimeout(() => {
        setCelebrate(false)
        setChecking(false)
      }, 2800)
    } else {
      playSound('wrong', settings.soundEnabled)
      // Find first wrong index
      let firstWrong = -1
      for (let i = 0; i < ordered.length; i++) {
        if (ordered[i].id !== correctOrder[i].id) {
          firstWrong = i
          break
        }
      }
      setWrongStep(firstWrong)
      setFeedback('wrong')
      setTimeout(() => {
        setFeedback(null)
        setWrongStep(null)
        setChecking(false)
      }, 1800)
    }
  }

  const handleReset = () => {
    playSound('whoosh', settings.soundEnabled)
    startRoutine(routineType)
  }

  const allPlaced = shuffled.length === 0
  const correctOrder =
    routineType === 'morning' ? morningRoutine : eveningRoutine

  return (
    <GameShell
      activityId="routines"
      title="My Day"
      emoji="☀️"
      onBack={onBack}
      instruction="Put the steps in the right order. Add them one by one!"
    >
      <ConfettiBurst show={celebrate} reducedMotion={settings.reducedMotion} />
      <FeedbackOverlay
        show={feedback !== null}
        type={feedback ?? 'correct'}
        message="Hmm, check the order!"
        reducedMotion={settings.reducedMotion}
      />
      <FeedbackOverlay
        show={celebrate}
        type="celebrate"
        message="Perfect routine!"
        reducedMotion={settings.reducedMotion}
      />

      <div className="flex-1 flex flex-col items-center gap-4">
        {/* Routine type toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => startRoutine('morning')}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${
              routineType === 'morning'
                ? 'bg-amber-500 text-white'
                : 'bg-white text-amber-600 border-2 border-amber-200 hover:border-amber-400'
            }`}
          >
            <Sun className="w-4 h-4" /> Morning
          </button>
          <button
            onClick={() => startRoutine('evening')}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${
              routineType === 'evening'
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400'
            }`}
          >
            <Moon className="w-4 h-4" /> Evening
          </button>
        </div>

        {/* Available steps */}
        {shuffled.length > 0 && (
          <div className="w-full max-w-2xl bg-yellow-50 rounded-2xl p-3 border-2 border-yellow-200">
            <p className="text-xs font-semibold text-yellow-700 mb-2 text-center">
              Tap to add to your routine:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <AnimatePresence>
                {shuffled.map((step) => (
                  <motion.button
                    key={step.id}
                    layout
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={() => handleAdd(step)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white rounded-xl px-3 py-2 shadow border-2 border-yellow-300 flex items-center gap-2"
                  >
                    <span className="text-2xl">{step.emoji}</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {step.label}
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Ordered list */}
        <div className="w-full max-w-2xl bg-white rounded-2xl p-4 border-4 border-yellow-300 shadow-md min-h-[200px]">
          <p className="text-xs font-semibold text-yellow-700 mb-3 text-center">
            Your routine (in order):
          </p>
          {ordered.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-yellow-400 text-sm">
              Tap steps above to build your routine ✨
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {ordered.map((step, idx) => {
                  const isCorrectSpot = step.id === correctOrder[idx]?.id
                  const showWrong = checking && wrongStep === idx
                  return (
                    <motion.div
                      key={step.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                        showWrong
                          ? 'border-rose-400 bg-rose-50'
                          : checking && isCorrectSpot
                            ? 'border-emerald-400 bg-emerald-50'
                            : 'border-yellow-200 bg-yellow-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-yellow-400 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-2xl">{step.emoji}</span>
                      <span className="flex-1 text-sm sm:text-base font-semibold text-slate-700">
                        {step.label}
                      </span>
                      {checking && isCorrectSpot && (
                        <Check className="w-5 h-5 text-emerald-500" />
                      )}
                      {!checking && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-yellow-200 disabled:opacity-30"
                            aria-label="Move up"
                          >
                            <ChevronUp className="w-4 h-4 text-yellow-700" />
                          </button>
                          <button
                            onClick={() => moveDown(idx)}
                            disabled={idx === ordered.length - 1}
                            className="p-1 rounded hover:bg-yellow-200 disabled:opacity-30"
                            aria-label="Move down"
                          >
                            <ChevronDown className="w-4 h-4 text-yellow-700" />
                          </button>
                          <button
                            onClick={() => handleRemove(step)}
                            className="p-1 rounded hover:bg-rose-100 text-rose-500 text-xs font-bold"
                            aria-label="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {allPlaced && ordered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <button
              onClick={handleCheck}
              disabled={checking}
              className="px-6 py-3 bg-emerald-500 text-white rounded-full font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-5 h-5" /> Check my routine
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-3 bg-white text-yellow-700 rounded-full font-bold border-2 border-yellow-300 hover:bg-yellow-50 transition-colors flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" /> Reset
            </button>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
