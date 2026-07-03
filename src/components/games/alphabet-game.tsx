'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { FeedbackOverlay, ConfettiBurst } from '@/components/feedback-overlay'
import { alphabet, type LetterItem } from '@/lib/games-data'
import { playSound, speak } from '@/lib/sound'
import { useGameStore } from '@/lib/game-store'
import { Volume2, RotateCw, Check, ChevronRight, ChevronLeft } from 'lucide-react'

interface AlphabetGameProps {
  onBack: () => void
}

type Mode = 'learn' | 'quiz'

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function AlphabetGame({ onBack }: AlphabetGameProps) {
  const addStars = useGameStore((s) => s.addStars)
  const recordRound = useGameStore((s) => s.recordRound)
  const settings = useGameStore((s) => s.settings)

  const [mode, setMode] = useState<Mode>('learn')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [quizRound, setQuizRound] = useState(0)
  const [target, setTarget] = useState<LetterItem | null>(null)
  const [options, setOptions] = useState<LetterItem[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [streak, setStreak] = useState(0)
  const [score, setScore] = useState(0)
  const TOTAL_QUIZ_ROUNDS = 6

  const current = alphabet[currentIdx]

  const speakLetter = (letter: string, word?: string) => {
    if (word) {
      speak(`${letter} for ${word}`, settings.soundEnabled)
    } else {
      speak(letter, settings.soundEnabled)
    }
  }

  const startQuiz = () => {
    setMode('quiz')
    setQuizRound(0)
    setScore(0)
    setStreak(0)
    newQuizRound()
  }

  const newQuizRound = () => {
    const pool = shuffle(alphabet).slice(0, 4)
    const newTarget = pool[0]
    setTarget(newTarget)
    setOptions(shuffle(pool))
    setPicked(null)
    setFeedback(null)
  }

  const handlePick = (letter: string) => {
    if (picked || !target) return
    setPicked(letter)
    if (letter === target.letter) {
      playSound('correct', settings.soundEnabled)
      speak(`${target.letter} for ${target.word}`, settings.soundEnabled)
      setFeedback('correct')
      const newStreak = streak + 1
      setStreak(newStreak)
      setScore(score + 1)
      const starsEarned = 1 + (newStreak >= 3 ? 1 : 0)
      addStars('alphabet', starsEarned)
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
    if (quizRound + 1 >= TOTAL_QUIZ_ROUNDS) {
      playSound('celebrate', settings.soundEnabled)
      setCelebrate(true)
      recordRound('alphabet', streak)
      setTimeout(() => {
        setCelebrate(false)
        setMode('learn')
        setQuizRound(0)
        setScore(0)
        setStreak(0)
        setCurrentIdx(0)
      }, 2400)
    } else {
      setQuizRound(quizRound + 1)
      newQuizRound()
    }
  }

  useEffect(() => {
    if (mode === 'quiz' && picked === target?.letter && !feedback) {
      const t = setTimeout(handleNext, 1000)
      return () => clearTimeout(t)
    }
  }, [picked, feedback, target, mode])

  // Learn mode
  if (mode === 'learn') {
    return (
      <GameShell
        activityId="alphabet"
        title="ABC Adventure"
        emoji="🔤"
        onBack={onBack}
        instruction="Tap the letter to hear it. Use arrows to explore."
      >
        <ConfettiBurst
          show={celebrate}
          reducedMotion={settings.reducedMotion}
        />
        <FeedbackOverlay
          show={celebrate}
          type="celebrate"
          message={`You got ${score} right!`}
          reducedMotion={settings.reducedMotion}
        />

        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {/* Big letter card */}
          <motion.div
            key={current.letter}
            initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border-4 border-violet-200 w-full max-w-md flex flex-col items-center gap-4"
          >
            <motion.button
              onClick={() => speakLetter(current.letter, current.word)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-8xl sm:text-9xl font-extrabold text-violet-700 leading-none"
              aria-label={`Letter ${current.letter}. Tap to hear.`}
            >
              {current.letter}
            </motion.button>
            <div className="flex flex-col items-center gap-2">
              <motion.span
                className="text-7xl sm:text-8xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {current.emoji}
              </motion.span>
              <p className="text-2xl sm:text-3xl font-bold text-slate-700">
                {current.letter} for{' '}
                <span className="text-violet-700">{current.word}</span>
              </p>
              <button
                onClick={() => speakLetter(current.letter, current.word)}
                className="inline-flex items-center gap-1 text-sm text-violet-500 hover:text-violet-700 mt-1"
              >
                <Volume2 className="w-4 h-4" /> Say it again
              </button>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => {
                playSound('click', settings.soundEnabled)
                setCurrentIdx(Math.max(0, currentIdx - 1))
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={currentIdx === 0}
              className="w-14 h-14 rounded-full bg-white border-4 border-violet-200 flex items-center justify-center disabled:opacity-30 hover:border-violet-400 transition-colors"
              aria-label="Previous letter"
            >
              <ChevronLeft className="w-6 h-6 text-violet-700" />
            </motion.button>

            <div className="bg-violet-100 px-4 py-2 rounded-full border-2 border-violet-300 min-w-[100px] text-center">
              <span className="text-sm font-bold text-violet-700">
                {currentIdx + 1} / {alphabet.length}
              </span>
            </div>

            <motion.button
              onClick={() => {
                playSound('click', settings.soundEnabled)
                setCurrentIdx(Math.min(alphabet.length - 1, currentIdx + 1))
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={currentIdx === alphabet.length - 1}
              className="w-14 h-14 rounded-full bg-white border-4 border-violet-200 flex items-center justify-center disabled:opacity-30 hover:border-violet-400 transition-colors"
              aria-label="Next letter"
            >
              <ChevronRight className="w-6 h-6 text-violet-700" />
            </motion.button>
          </div>

          {/* Quiz button */}
          <motion.button
            onClick={() => {
              playSound('whoosh', settings.soundEnabled)
              startQuiz()
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full font-bold shadow-lg flex items-center gap-2"
          >
            🎯 Play Quiz Game
          </motion.button>

          {/* Alphabet overview */}
          <div className="w-full max-w-2xl">
            <p className="text-center text-sm text-violet-500 mb-2">
              Or jump to a letter:
            </p>
            <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5">
              {alphabet.map((item, i) => (
                <button
                  key={item.letter}
                  onClick={() => {
                    playSound('pop', settings.soundEnabled)
                    setCurrentIdx(i)
                  }}
                  className={`aspect-square rounded-lg text-sm font-bold transition-colors ${
                    i === currentIdx
                      ? 'bg-violet-600 text-white'
                      : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50'
                  }`}
                  aria-label={`Jump to letter ${item.letter}`}
                >
                  {item.letter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GameShell>
    )
  }

  // Quiz mode
  return (
    <GameShell
      activityId="alphabet"
      title="ABC Quiz"
      emoji="🔤"
      onBack={onBack}
      instruction={`Round ${quizRound + 1} of ${TOTAL_QUIZ_ROUNDS} • Which letter does "${target?.word}" start with?`}
    >
      <ConfettiBurst show={celebrate} reducedMotion={settings.reducedMotion} />
      <FeedbackOverlay
        show={feedback !== null}
        type={feedback ?? 'correct'}
        reducedMotion={settings.reducedMotion}
      />

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* Target */}
        {target && (
          <motion.div
            key={`${target.letter}-${quizRound}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border-4 border-violet-200 max-w-md w-full text-center"
          >
            <p className="text-base sm:text-lg font-semibold text-violet-600 mb-3">
              This word starts with which letter?
            </p>
            <motion.div
              className="text-7xl sm:text-8xl mb-3"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {target.emoji}
            </motion.div>
            <div className="text-3xl font-extrabold text-slate-700 mb-2">
              {target.word}
            </div>
            <button
              onClick={() => speak(target.word, settings.soundEnabled)}
              className="inline-flex items-center gap-1 text-sm text-violet-500 hover:text-violet-700"
            >
              <Volume2 className="w-4 h-4" /> Listen
            </button>
          </motion.div>
        )}

        {/* Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-2xl">
          {options.map((opt) => {
            const isPicked = picked === opt.letter
            const isCorrect = target && opt.letter === target.letter
            const showResult = picked !== null
            return (
              <motion.button
                key={opt.letter}
                onClick={() => handlePick(opt.letter)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={picked !== null}
                className={`relative bg-white rounded-3xl p-4 sm:p-6 shadow-md border-4 transition-all flex flex-col items-center gap-2 min-h-[120px]
                  ${
                    showResult && isCorrect
                      ? 'border-emerald-400 bg-emerald-50'
                      : showResult && isPicked && !isCorrect
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-violet-100 hover:border-violet-300'
                  }`}
                aria-label={`Letter ${opt.letter}`}
              >
                <span className="text-5xl sm:text-6xl font-extrabold text-violet-700">
                  {opt.letter}
                </span>
                <span className="text-xs text-slate-500">
                  {opt.emoji} {opt.word}
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
          {picked === target?.letter && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-full font-bold hover:bg-violet-700 transition-colors"
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
