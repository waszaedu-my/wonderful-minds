'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { playSound, speak } from '@/lib/sound'
import { useGameStore } from '@/lib/game-store'
import { Volume2 } from 'lucide-react'

interface CalmCornerProps {
  onBack: () => void
}

type Phase = 'idle' | 'inhale' | 'hold' | 'exhale' | 'rest'
type Tool = 'breathing' | 'bubbles' | 'feelings' | 'sounds'

const breathingPhases: { phase: Phase; label: string; duration: number; scale: number; color: string }[] = [
  { phase: 'inhale', label: 'Breathe in...', duration: 4, scale: 1.6, color: 'from-sky-300 to-blue-400' },
  { phase: 'hold', label: 'Hold...', duration: 2, scale: 1.6, color: 'from-blue-300 to-indigo-400' },
  { phase: 'exhale', label: 'Breathe out...', duration: 6, scale: 0.8, color: 'from-indigo-300 to-purple-400' },
  { phase: 'rest', label: 'Rest...', duration: 2, scale: 0.8, color: 'from-purple-300 to-pink-400' },
]

const calmSounds = [
  { id: 'rain', emoji: '🌧️', label: 'Rain', color: 'from-sky-200 to-blue-300' },
  { id: 'ocean', emoji: '🌊', label: 'Ocean', color: 'from-cyan-200 to-teal-300' },
  { id: 'forest', emoji: '🌳', label: 'Forest', color: 'from-green-200 to-emerald-300' },
  { id: 'wind', emoji: '🍃', label: 'Wind', color: 'from-emerald-200 to-green-300' },
]

const feelingCards = [
  { emoji: '😊', label: 'I feel happy', color: 'bg-amber-100 border-amber-300' },
  { emoji: '😢', label: 'I feel sad', color: 'bg-sky-100 border-sky-300' },
  { emoji: '😠', label: 'I feel angry', color: 'bg-rose-100 border-rose-300' },
  { emoji: '😨', label: 'I feel scared', color: 'bg-purple-100 border-purple-300' },
  { emoji: '😌', label: 'I feel calm', color: 'bg-emerald-100 border-emerald-300' },
  { emoji: '🥱', label: 'I feel tired', color: 'bg-indigo-100 border-indigo-300' },
  { emoji: '🤩', label: 'I feel excited', color: 'bg-pink-100 border-pink-300' },
  { emoji: '🤔', label: 'I feel confused', color: 'bg-orange-100 border-orange-300' },
]

const calmingPhrases = [
  'You are safe.',
  'You are loved.',
  'It is okay to feel this way.',
  'Take your time.',
  'You are doing your best.',
  'Breathe in calm, breathe out worry.',
  'You are strong.',
  'This feeling will pass.',
]

export function CalmCorner({ onBack }: CalmCornerProps) {
  const settings = useGameStore((s) => s.settings)
  const addStars = useGameStore((s) => s.addStars)

  const [tool, setTool] = useState<Tool>('breathing')
  const [breathingActive, setBreathingActive] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [phrase, setPhrase] = useState(calmingPhrases[0])
  const [bubbles, setBubbles] = useState<
    { id: number; x: number; size: number; color: string }[]
  >([])
  const bubbleIdRef = useRef(0)

  // Breathing cycle
  useEffect(() => {
    if (!breathingActive) return
    const current = breathingPhases[phaseIdx]
    if (current.phase === 'inhale') {
      playSound('breathe-in', settings.soundEnabled)
      speak('Breathe in', settings.soundEnabled)
    } else if (current.phase === 'exhale') {
      playSound('breathe-out', settings.soundEnabled)
      speak('Breathe out', settings.soundEnabled)
    }
    const t = setTimeout(() => {
      const nextIdx = (phaseIdx + 1) % breathingPhases.length
      setPhaseIdx(nextIdx)
      if (nextIdx === 0) {
        const newCount = cycleCount + 1
        setCycleCount(newCount)
        addStars('calm', 1)
        if (newCount >= 3) {
          // Auto stop after 3 cycles
          setTimeout(() => {
            setBreathingActive(false)
            setPhaseIdx(0)
            setCycleCount(0)
            playSound('star', settings.soundEnabled)
          }, 500)
        }
      }
    }, current.duration * 1000)
    return () => clearTimeout(t)
  }, [breathingActive, phaseIdx])

  // Rotate calming phrase
  useEffect(() => {
    if (tool !== 'feelings') return
    const i = setInterval(() => {
      setPhrase(calmingPhrases[Math.floor(Math.random() * calmingPhrases.length)])
    }, 5000)
    return () => clearInterval(i)
  }, [tool])

  const makeBubble = () => {
    playSound('pop', settings.soundEnabled)
    const id = bubbleIdRef.current++
    const x = Math.random() * 80 + 10
    const size = Math.random() * 60 + 40
    const colors = ['#FCA5A5', '#FCD34D', '#86EFAC', '#93C5FD', '#C4B5FD', '#F9A8D4']
    const color = colors[Math.floor(Math.random() * colors.length)]
    setBubbles((prev) => [...prev, { id, x, size, color }])
    setTimeout(() => {
      setBubbles((prev) => prev.filter((b) => b.id !== id))
    }, 4000)
  }

  const currentPhase = breathingPhases[phaseIdx]

  return (
    <GameShell
      activityId="calm"
      title="Calm Corner"
      emoji="🌌"
      onBack={onBack}
      instruction="A quiet space to breathe, relax, and feel good."
    >
      <div className="flex-1 flex flex-col items-center gap-6">
        {/* Tool selector */}
        <div className="flex gap-2 flex-wrap justify-center">
          {[
            { id: 'breathing' as const, emoji: '🌬️', label: 'Breathe' },
            { id: 'bubbles' as const, emoji: '🫧', label: 'Bubbles' },
            { id: 'feelings' as const, emoji: '💛', label: 'My Feelings' },
            { id: 'sounds' as const, emoji: '🎧', label: 'Calm Sounds' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                playSound('click', settings.soundEnabled)
                setBreathingActive(false)
                setPhaseIdx(0)
                setCycleCount(0)
                setTool(t.id)
              }}
              className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${
                tool === t.id
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-400'
              }`}
            >
              <span className="text-lg">{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Tool content */}
        <div className="w-full max-w-2xl flex-1 flex items-center justify-center min-h-[400px]">
          {/* BREATHING */}
          {tool === 'breathing' && (
            <div className="flex flex-col items-center gap-6 w-full">
              <motion.div
                className={`relative w-64 h-64 rounded-full bg-gradient-to-br ${currentPhase.color} shadow-2xl flex items-center justify-center border-8 border-white`}
                animate={{
                  scale: breathingActive ? currentPhase.scale : 1,
                }}
                transition={{
                  duration: breathingActive ? currentPhase.duration : 0.5,
                  ease: 'easeInOut',
                }}
              >
                <div className="text-center text-white">
                  {breathingActive ? (
                    <>
                      <div className="text-2xl sm:text-3xl font-extrabold drop-shadow">
                        {currentPhase.label}
                      </div>
                      <div className="text-sm mt-2 opacity-90">
                        Cycle {cycleCount + 1} of 3
                      </div>
                    </>
                  ) : (
                    <div className="text-5xl">🌟</div>
                  )}
                </div>
              </motion.div>

              {!breathingActive ? (
                <motion.button
                  onClick={() => {
                    setBreathingActive(true)
                    setPhaseIdx(0)
                    setCycleCount(0)
                    playSound('whoosh', settings.soundEnabled)
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-indigo-500 text-white rounded-full font-bold text-lg shadow-lg hover:bg-indigo-600 transition-colors"
                >
                  Start breathing
                </motion.button>
              ) : (
                <button
                  onClick={() => {
                    setBreathingActive(false)
                    setPhaseIdx(0)
                    setCycleCount(0)
                    playSound('click', settings.soundEnabled)
                  }}
                  className="px-6 py-2 bg-white text-indigo-600 rounded-full font-bold border-2 border-indigo-200 hover:bg-indigo-50 transition-colors"
                >
                  Stop
                </button>
              )}

              <p className="text-center text-sm text-indigo-500 max-w-sm">
                Follow the circle. Breathe in as it grows, breathe out as it
                shrinks. Do 3 rounds for a star!
              </p>
            </div>
          )}

          {/* BUBBLES */}
          {tool === 'bubbles' && (
            <div className="flex flex-col items-center gap-4 w-full">
              <p className="text-center text-sm text-indigo-600 max-w-sm">
                Tap anywhere to make bubbles. Watch them float away and pop!
              </p>
              <button
                onClick={makeBubble}
                className="px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-transform"
              >
                🫧 Pop a bubble!
              </button>
              <div className="relative w-full h-80 bg-gradient-to-b from-sky-100 to-indigo-100 rounded-3xl overflow-hidden border-4 border-indigo-200">
                <AnimatePresence>
                  {bubbles.map((bubble) => (
                    <motion.div
                      key={bubble.id}
                      initial={{ y: 320, x: `${bubble.x}%`, opacity: 0.7 }}
                      animate={{ y: -100, opacity: [0.7, 0.9, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 4, ease: 'easeOut' }}
                      onClick={() => {
                        playSound('pop', settings.soundEnabled)
                        setBubbles((prev) =>
                          prev.filter((b) => b.id !== bubble.id)
                        )
                      }}
                      className="absolute rounded-full cursor-pointer"
                      style={{
                        width: bubble.size,
                        height: bubble.size,
                        backgroundColor: bubble.color + '80',
                        border: '2px solid white',
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* FEELINGS */}
          {tool === 'feelings' && (
            <div className="flex flex-col items-center gap-6 w-full">
              <motion.div
                key={phrase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-lg border-4 border-pink-200 max-w-md text-center"
              >
                <p className="text-2xl font-bold text-pink-700">{phrase}</p>
                <button
                  onClick={() => speak(phrase, settings.soundEnabled)}
                  className="mt-3 inline-flex items-center gap-1 text-sm text-pink-500 hover:text-pink-700"
                >
                  <Volume2 className="w-4 h-4" /> Listen
                </button>
              </motion.div>

              <div>
                <p className="text-center text-sm font-semibold text-pink-600 mb-3">
                  How do you feel right now?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {feelingCards.map((f) => (
                    <motion.button
                      key={f.label}
                      onClick={() => {
                        playSound('pop', settings.soundEnabled)
                        speak(f.label, settings.soundEnabled)
                        addStars('calm', 1)
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`rounded-2xl p-3 border-2 ${f.color} flex flex-col items-center gap-1`}
                    >
                      <span className="text-3xl">{f.emoji}</span>
                      <span className="text-xs font-semibold text-slate-700">
                        {f.label.replace('I feel ', '')}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
              <p className="text-center text-xs text-pink-400 max-w-xs">
                It is okay to feel anything. Naming our feelings helps us feel
                better.
              </p>
            </div>
          )}

          {/* CALM SOUNDS */}
          {tool === 'sounds' && (
            <div className="flex flex-col items-center gap-4 w-full">
              <p className="text-center text-sm text-indigo-600 max-w-sm">
                Pick a calm sound. Close your eyes and listen. (Sounds are
                simulated)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
                {calmSounds.map((sound) => (
                  <motion.button
                    key={sound.id}
                    onClick={() => {
                      playSound('whoosh', settings.soundEnabled)
                      speak(`Imagine the sound of ${sound.label.toLowerCase()}`, settings.soundEnabled)
                      addStars('calm', 1)
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gradient-to-br ${sound.color} rounded-3xl p-5 shadow-md border-4 border-white flex flex-col items-center gap-2`}
                  >
                    <motion.span
                      className="text-5xl"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    >
                      {sound.emoji}
                    </motion.span>
                    <span className="font-bold text-slate-700">
                      {sound.label}
                    </span>
                  </motion.button>
                ))}
              </div>
              <div className="mt-4 bg-white rounded-2xl p-4 border-2 border-indigo-200 max-w-md text-center">
                <p className="text-sm text-indigo-600 italic">
                  &ldquo;Close your eyes. Take a slow breath. Imagine the sound
                  washing over you like a warm blanket.&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  )
}
