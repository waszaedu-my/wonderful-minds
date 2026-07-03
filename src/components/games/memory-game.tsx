'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { FeedbackOverlay, ConfettiBurst } from '@/components/feedback-overlay'
import { memoryThemes } from '@/lib/games-data'
import { playSound, speak } from '@/lib/sound'
import { useGameStore } from '@/lib/game-store'
import { RotateCw } from 'lucide-react'

interface MemoryGameProps {
  onBack: () => void
}

interface Card {
  id: string
  pairId: string
  emoji: string
  name: string
  flipped: boolean
  matched: boolean
}

function buildDeck(theme: string): Card[] {
  const items = memoryThemes[theme]
  const deck: Card[] = []
  items.forEach((item, i) => {
    deck.push({
      id: `${theme}-${i}-a`,
      pairId: `${theme}-${i}`,
      emoji: item.emoji,
      name: item.name,
      flipped: false,
      matched: false,
    })
    deck.push({
      id: `${theme}-${i}-b`,
      pairId: `${theme}-${i}`,
      emoji: item.emoji,
      name: item.name,
      flipped: false,
      matched: false,
    })
  })
  return deck.sort(() => Math.random() - 0.5)
}

export function MemoryGame({ onBack }: MemoryGameProps) {
  const addStars = useGameStore((s) => s.addStars)
  const recordRound = useGameStore((s) => s.recordRound)
  const settings = useGameStore((s) => s.settings)

  const [theme, setTheme] = useState<keyof typeof memoryThemes>('animals')
  const [deck, setDeck] = useState<Card[]>(() => buildDeck('animals'))
  const [flipped, setFlipped] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)

  const matchedPairs = useMemo(
    () => deck.filter((c) => c.matched).length / 2,
    [deck]
  )
  const totalPairs = deck.length / 2
  const isComplete = matchedPairs === totalPairs

  const changeTheme = (newTheme: keyof typeof memoryThemes) => {
    setTheme(newTheme)
    setDeck(buildDeck(newTheme))
    setFlipped([])
    setMoves(0)
    setLocked(false)
    setShowThemePicker(false)
  }

  const handleFlip = (card: Card) => {
    if (locked || card.flipped || card.matched) return
    playSound('pop', settings.soundEnabled)
    speak(card.name, settings.soundEnabled)
    const newDeck = deck.map((c) =>
      c.id === card.id ? { ...c, flipped: true } : c
    )
    setDeck(newDeck)
    const newFlipped = [...flipped, card.id]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1)
      setLocked(true)
      const [a, b] = newFlipped
        .map((id) => newDeck.find((c) => c.id === id)!)
        .filter(Boolean)
      if (a.pairId === b.pairId) {
        // Match!
        setTimeout(() => {
          playSound('correct', settings.soundEnabled)
          setDeck((prev) =>
            prev.map((c) =>
              c.pairId === a.pairId
                ? { ...c, matched: true, flipped: true }
                : c
            )
          )
          setFlipped([])
          setLocked(false)
        }, 700)
      } else {
        // No match - flip back
        setTimeout(() => {
          setDeck((prev) =>
            prev.map((c) =>
              c.id === a.id || c.id === b.id
                ? { ...c, flipped: false }
                : c
            )
          )
          setFlipped([])
          setLocked(false)
        }, 1200)
      }
    }
  }

  useEffect(() => {
    if (isComplete && deck.length > 0) {
      setTimeout(() => {
        playSound('celebrate', settings.soundEnabled)
        setCelebrate(true)
        const stars = moves <= totalPairs + 2 ? 5 : moves <= totalPairs + 4 ? 4 : 3
        addStars('memory', stars)
        recordRound('memory', totalPairs)
      }, 600)
    }
  }, [isComplete])

  const handlePlayAgain = () => {
    setCelebrate(false)
    changeTheme(theme)
  }

  return (
    <GameShell
      activityId="memory"
      title="Memory Match"
      emoji="🧠"
      onBack={onBack}
      instruction={`Find the matching pairs • Moves: ${moves} • Pairs found: ${matchedPairs}/${totalPairs}`}
    >
      <ConfettiBurst show={celebrate} reducedMotion={settings.reducedMotion} />
      <FeedbackOverlay
        show={celebrate}
        type="celebrate"
        message={`You won in ${moves} moves!`}
        reducedMotion={settings.reducedMotion}
        onDone={() => {}}
      />

      <div className="flex-1 flex flex-col items-center gap-4">
        {/* Theme picker */}
        <div className="flex gap-2 flex-wrap justify-center">
          {(Object.keys(memoryThemes) as Array<keyof typeof memoryThemes>).map(
            (t) => (
              <button
                key={t}
                onClick={() => changeTheme(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize transition-colors ${
                  theme === t
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-rose-600 border-2 border-rose-200 hover:border-rose-400'
                }`}
              >
                {t}
              </button>
            )
          )}
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl w-full">
          {deck.map((card, idx) => (
            <motion.button
              key={card.id}
              onClick={() => handleFlip(card)}
              whileHover={!card.flipped && !card.matched ? { scale: 1.05 } : {}}
              whileTap={{ scale: 0.95 }}
              className="relative aspect-square [perspective:1000px]"
              aria-label={
                card.flipped || card.matched
                  ? `${card.name}`
                  : `Card ${idx + 1}, hidden`
              }
            >
              <motion.div
                className="absolute inset-0 [transform-style:preserve-3d]"
                animate={{
                  rotateY: card.flipped || card.matched ? 180 : 0,
                }}
                transition={{ duration: 0.4 }}
              >
                {/* Back */}
                <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 border-4 border-white shadow-md flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl opacity-50">❓</span>
                </div>
                {/* Front */}
                <div
                  className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl bg-white border-4 shadow-md flex items-center justify-center ${
                    card.matched
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-rose-200'
                  }`}
                >
                  <motion.span
                    className="text-4xl sm:text-5xl"
                    animate={
                      card.matched
                        ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.5 }}
                  >
                    {card.emoji}
                  </motion.span>
                </div>
              </motion.div>
            </motion.button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => changeTheme(theme)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-full font-bold hover:bg-rose-600 transition-colors"
          >
            <RotateCw className="w-4 h-4" /> New game
          </button>
        </div>

        {/* Completion modal */}
        <AnimatePresence>
          {celebrate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
              onClick={handlePlayAgain}
            >
              <motion.div
                initial={{ scale: 0.5, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-amber-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-6xl mb-3">🎉</div>
                <h2 className="text-2xl font-extrabold text-amber-700 mb-2">
                  You did it!
                </h2>
                <p className="text-slate-600 mb-4">
                  You found all {totalPairs} pairs in {moves} moves!
                </p>
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="text-3xl"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.1, type: 'spring' }}
                    >
                      ⭐
                    </motion.span>
                  ))}
                </div>
                <button
                  onClick={handlePlayAgain}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-full font-bold hover:bg-rose-600 transition-colors"
                >
                  <RotateCw className="w-4 h-4" /> Play again
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameShell>
  )
}
