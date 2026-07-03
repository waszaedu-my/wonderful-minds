'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

interface FeedbackOverlayProps {
  show: boolean
  type: 'correct' | 'wrong' | 'celebrate'
  message?: string
  onDone?: () => void
  reducedMotion?: boolean
}

export function FeedbackOverlay({
  show,
  type,
  message,
  onDone,
  reducedMotion = false,
}: FeedbackOverlayProps) {
  useEffect(() => {
    if (show && onDone) {
      const t = setTimeout(onDone, type === 'celebrate' ? 2200 : 1400)
      return () => clearTimeout(t)
    }
  }, [show, onDone, type])

  const colors = {
    correct: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    wrong: 'bg-rose-100 text-rose-700 border-rose-300',
    celebrate: 'bg-amber-100 text-amber-700 border-amber-300',
  }

  const emojis = {
    correct: '✅',
    wrong: '🤗',
    celebrate: '🎉',
  }

  const labels = {
    correct: message ?? 'Great job!',
    wrong: message ?? 'Try again!',
    celebrate: message ?? 'You did it!',
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <motion.div
            className={`relative z-10 px-8 py-6 rounded-3xl border-4 ${colors[type]} shadow-2xl flex flex-col items-center gap-3 max-w-md mx-4`}
            initial={
              reducedMotion
                ? { opacity: 0 }
                : { scale: 0.5, y: 30, opacity: 0 }
            }
            animate={
              reducedMotion
                ? { opacity: 1 }
                : { scale: 1, y: 0, opacity: 1 }
            }
            exit={
              reducedMotion
                ? { opacity: 0 }
                : { scale: 0.8, opacity: 0 }
            }
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
          >
            <motion.div
              className="text-7xl"
              animate={
                reducedMotion
                  ? undefined
                  : type === 'celebrate'
                    ? {
                        rotate: [0, -15, 15, -10, 10, 0],
                        scale: [1, 1.2, 1, 1.15, 1],
                      }
                    : type === 'correct'
                      ? { scale: [1, 1.3, 1] }
                      : { x: [0, -8, 8, -6, 6, 0] }
              }
              transition={{ duration: 0.6 }}
            >
              {emojis[type]}
            </motion.div>
            <p className="text-2xl font-bold text-center">{labels[type]}</p>
            {type === 'celebrate' && !reducedMotion && (
              <div className="flex gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="text-2xl"
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: [-10, -30, -10], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 1,
                      delay: i * 0.1,
                      repeat: Infinity,
                    }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Confetti burst component for celebrations
export function ConfettiBurst({
  show,
  reducedMotion = false,
}: {
  show: boolean
  reducedMotion?: boolean
}) {
  if (reducedMotion) return null

  const pieces = [...Array(24)]
  const colors = [
    '#EF4444',
    '#F97316',
    '#FACC15',
    '#22C55E',
    '#3B82F6',
    '#A855F7',
    '#EC4899',
  ]

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
          {pieces.map((_, i) => {
            const color = colors[i % colors.length]
            const xStart = 50 + (Math.random() - 0.5) * 30
            const xEnd = (Math.random() - 0.5) * 100
            const rotate = Math.random() * 720 - 360
            return (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-sm"
                style={{ backgroundColor: color }}
                initial={{
                  x: `${xStart}vw`,
                  y: '0vh',
                  opacity: 1,
                  rotate: 0,
                }}
                animate={{
                  x: `${xEnd}vw`,
                  y: '100vh',
                  opacity: 0,
                  rotate,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  ease: 'easeOut',
                }}
              />
            )
          })}
        </div>
      )}
    </AnimatePresence>
  )
}
