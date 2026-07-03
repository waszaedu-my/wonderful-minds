'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { FeedbackOverlay, ConfettiBurst } from '@/components/feedback-overlay'
import { sortingSets, type SortingCategory } from '@/lib/games-data'
import { playSound, speak } from '@/lib/sound'
import { useGameStore } from '@/lib/game-store'
import { RotateCw, Check, Package } from 'lucide-react'

interface SortingGameProps {
  onBack: () => void
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

interface SortItem {
  itemId: string
  emoji: string
  name: string
  correctCategoryId: string
}

export function SortingGame({ onBack }: SortingGameProps) {
  const addStars = useGameStore((s) => s.addStars)
  const recordRound = useGameStore((s) => s.recordRound)
  const settings = useGameStore((s) => s.settings)

  const [setIdx, setSetIdx] = useState(0)
  const [items, setItems] = useState<SortItem[]>([])
  const [selected, setSelected] = useState<SortItem | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [completedSets, setCompletedSets] = useState<Set<number>>(new Set())

  const currentSet = sortingSets[setIdx]
  const totalItemsInSet = currentSet.categories.reduce(
    (sum, c) => sum + c.items.length,
    0
  )
  const sortedCount = totalItemsInSet - items.length

  const startSet = (idx: number) => {
    const set = sortingSets[idx]
    const allItems: SortItem[] = []
    set.categories.forEach((cat) => {
      cat.items.forEach((item, i) => {
        allItems.push({
          itemId: `${cat.id}-${i}`,
          emoji: item.emoji,
          name: item.name,
          correctCategoryId: cat.id,
        })
      })
    })
    setItems(shuffle(allItems))
    setSelected(null)
    setFeedback(null)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startSet(0)
  }, [])

  const handleSelectItem = (item: SortItem) => {
    if (feedback) return
    playSound('pop', settings.soundEnabled)
    setSelected(item)
  }

  const handleSort = (category: SortingCategory) => {
    if (!selected || feedback) return
    const correct = selected.correctCategoryId === category.id
    if (correct) {
      playSound('correct', settings.soundEnabled)
      speak(selected.name, settings.soundEnabled)
      setFeedback('correct')
      setItems((prev) => prev.filter((i) => i.itemId !== selected.itemId))
      addStars('sorting', 1)
      const remaining = items.length - 1
      if (remaining === 0) {
        // Set complete
        setTimeout(() => {
          playSound('celebrate', settings.soundEnabled)
          setCelebrate(true)
          setCompletedSets((prev) => new Set(prev).add(setIdx))
          recordRound('sorting', 1)
          addStars('sorting', 3)
          setTimeout(() => {
            setCelebrate(false)
            const nextIdx = (setIdx + 1) % sortingSets.length
            setSetIdx(nextIdx)
            startSet(nextIdx)
          }, 2800)
        }, 400)
      }
      setTimeout(() => {
        setFeedback(null)
        setSelected(null)
      }, 700)
    } else {
      playSound('wrong', settings.soundEnabled)
      setFeedback('wrong')
      setTimeout(() => {
        setFeedback(null)
        setSelected(null)
      }, 1200)
    }
  }

  const handleReset = () => {
    playSound('whoosh', settings.soundEnabled)
    startSet(setIdx)
  }

  return (
    <GameShell
      activityId="sorting"
      title="Sorting Game"
      emoji="📦"
      onBack={onBack}
      instruction={`Set ${setIdx + 1} of ${sortingSets.length}: ${currentSet.title} • Sorted: ${sortedCount}/${totalItemsInSet}`}
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
        message="All sorted!"
        reducedMotion={settings.reducedMotion}
      />

      <div className="flex-1 flex flex-col items-center gap-4">
        {/* Title banner */}
        <motion.div
          key={`title-${setIdx}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-100 rounded-2xl px-5 py-2 border-2 border-amber-300"
        >
          <span className="font-extrabold text-amber-800 text-sm sm:text-base">
            {currentSet.title}
          </span>
        </motion.div>

        {/* Items to sort */}
        {items.length > 0 ? (
          <div className="w-full max-w-2xl bg-amber-50 rounded-2xl p-3 border-2 border-amber-200">
            <p className="text-xs font-semibold text-amber-700 mb-2 text-center">
              {selected
                ? `Now tap the box for "${selected.name}" ${selected.emoji}`
                : 'Tap an item to select it:'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center min-h-[80px]">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.button
                    key={item.itemId}
                    layout
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    onClick={() => handleSelectItem(item)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={feedback !== null}
                    className={`bg-white rounded-xl px-3 py-2 shadow border-2 flex flex-col items-center transition-all ${
                      selected?.itemId === item.itemId
                        ? 'border-purple-500 bg-purple-50 scale-105'
                        : 'border-amber-300 hover:border-amber-500'
                    }`}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-[10px] font-semibold text-slate-600">
                      {item.name}
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 rounded-2xl px-6 py-4 border-2 border-emerald-300 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="font-bold text-emerald-700">All sorted!</p>
          </div>
        )}

        {/* Category boxes */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl">
          {currentSet.categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => handleSort(cat)}
              whileHover={selected ? { scale: 1.03 } : {}}
              whileTap={selected ? { scale: 0.97 } : {}}
              disabled={!selected || feedback !== null}
              className={`bg-white rounded-2xl p-4 border-4 shadow-md flex flex-col items-center gap-2 transition-all min-h-[140px] ${
                selected
                  ? 'border-amber-400 hover:bg-amber-50 cursor-pointer'
                  : 'border-amber-200 opacity-70'
              }`}
            >
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-amber-700 text-sm">
                  {cat.name}
                </span>
              </div>
              <span className="text-4xl">{cat.emoji}</span>
            </motion.button>
          ))}
        </div>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-700 rounded-full font-bold border-2 border-amber-300 hover:bg-amber-50 transition-colors text-sm"
        >
          <RotateCw className="w-4 h-4" /> Reset
        </button>

        {/* Completed sets indicator */}
        {completedSets.size > 0 && (
          <div className="bg-emerald-100 px-4 py-2 rounded-full border-2 border-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-emerald-700 text-xs">
              {completedSets.size} set{completedSets.size === 1 ? '' : 's'} complete!
            </span>
          </div>
        )}
      </div>
    </GameShell>
  )
}
