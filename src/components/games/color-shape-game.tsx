'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { FeedbackOverlay, ConfettiBurst } from '@/components/feedback-overlay'
import { colors, shapes, type ColorItem, type ShapeItem } from '@/lib/games-data'
import { playSound, speak } from '@/lib/sound'
import { useGameStore } from '@/lib/game-store'
import { Volume2, RotateCw, Check } from 'lucide-react'

interface ColorShapeGameProps {
  onBack: () => void
}

type Mode = 'color' | 'shape'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function ColorShapeGame({ onBack }: ColorShapeGameProps) {
  const addStars = useGameStore((s) => s.addStars)
  const recordRound = useGameStore((s) => s.recordRound)
  const settings = useGameStore((s) => s.settings)

  const [round, setRound] = useState(0)
  const [mode, setMode] = useState<Mode>('color')
  const [target, setTarget] = useState<ColorItem | ShapeItem | null>(null)
  const [options, setOptions] = useState<(ColorItem | ShapeItem)[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)
  const TOTAL_ROUNDS = 6

  const newRound = () => {
    const newMode: Mode = Math.random() > 0.5 ? 'color' : 'shape'
    setMode(newMode)
    if (newMode === 'color') {
      const pool = shuffle(colors).slice(0, 4)
      const newTarget = pool[0]
      setTarget(newTarget)
      setOptions(shuffle(pool))
    } else {
      const pool = shuffle(shapes).slice(0, 4)
      const newTarget = pool[0]
      setTarget(newTarget)
      setOptions(shuffle(pool))
    }
    setPicked(null)
    setFeedback(null)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    newRound()
  }, [])

  const instruction = useMemo(() => {
    if (!target) return ''
    return mode === 'color'
      ? `Find the color ${target.name}`
      : `Find the ${target.name}`
  }, [mode, target])

  const handlePick = (id: string) => {
    if (picked || !target) return
    setPicked(id)
    const correct = id === target.id
    if (correct) {
      playSound('correct', settings.soundEnabled)
      speak(target.name, settings.soundEnabled)
      setFeedback('correct')
      const newStreak = streak + 1
      setStreak(newStreak)
      setScore(score + 1)
      const starsEarned = 1 + (newStreak >= 3 ? 1 : 0)
      addStars('colors-shapes', starsEarned)
      setTimeout(() => setFeedback(null), 1100)
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
      recordRound('colors-shapes', streak)
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
    if (picked === target?.id && !feedback) {
      const t = setTimeout(handleNext, 900)
      return () => clearTimeout(t)
    }
     
  }, [picked, feedback, target])

  const isColor = (item: ColorItem | ShapeItem): item is ColorItem =>
    'hex' in item

  return (
    <GameShell
      activityId="colors-shapes"
      title="Colors & Shapes"
      emoji="🎨"
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
        {/* Target */}
        {target && (
          <motion.div
            key={`${target.id}-${round}-${mode}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-4 border-emerald-200 max-w-md w-full text-center"
          >
            <p className="text-lg sm:text-xl font-bold text-emerald-700 mb-3">
              {mode === 'color' ? 'Find this color:' : 'Find this shape:'}
            </p>
            {isColor(target) ? (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                  style={{ backgroundColor: target.hex }}
                />
                <div className="text-3xl font-extrabold text-slate-700">
                  {target.name}
                </div>
                <button
                  onClick={() => speak(target.name, settings.soundEnabled)}
                  className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800"
                >
                  <Volume2 className="w-4 h-4" /> Listen
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <svg
                  viewBox="0 0 100 100"
                  className="w-24 h-24"
                  dangerouslySetInnerHTML={{
                    __html: `<g fill="#10b981" stroke="#065f46" stroke-width="2">${target.svg}</g>`,
                  }}
                />
                <div className="text-3xl font-extrabold text-slate-700">
                  {target.name}
                </div>
                <button
                  onClick={() => speak(target.name, settings.soundEnabled)}
                  className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800"
                >
                  <Volume2 className="w-4 h-4" /> Listen
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl">
          {options.map((opt) => {
            const isPicked = picked === opt.id
            const isCorrect = target && opt.id === target.id
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
                        : 'border-emerald-100 hover:border-emerald-300'
                  }`}
                aria-label={
                  isColor(opt) ? `Color: ${opt.name}` : `Shape: ${opt.name}`
                }
              >
                {isColor(opt) ? (
                  <motion.div
                    className="w-16 h-16 rounded-full border-4 border-white shadow"
                    style={{ backgroundColor: opt.hex }}
                    animate={
                      showResult && isCorrect
                        ? { scale: [1, 1.3, 1] }
                        : { scale: 1 }
                    }
                  />
                ) : (
                  <motion.svg
                    viewBox="0 0 100 100"
                    className="w-16 h-16"
                    dangerouslySetInnerHTML={{
                      __html: `<g fill="#10b981" stroke="#065f46" stroke-width="2">${opt.svg}</g>`,
                    }}
                    animate={
                      showResult && isCorrect
                        ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }
                        : { scale: 1 }
                    }
                  />
                )}
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
          {picked === target?.id && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
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
            <span className="font-bold text-amber-700">
              🔥 {streak} in a row!
            </span>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
