'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { FeedbackOverlay, ConfettiBurst } from '@/components/feedback-overlay'
import { stories, type Story } from '@/lib/games-data'
import { playSound, speak } from '@/lib/sound'
import { useGameStore } from '@/lib/game-store'
import { RotateCw, Check, ChevronUp, ChevronDown, BookOpen } from 'lucide-react'

interface StoryBuilderGameProps {
  onBack: () => void
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function StoryBuilderGame({ onBack }: StoryBuilderGameProps) {
  const addStars = useGameStore((s) => s.addStars)
  const recordRound = useGameStore((s) => s.recordRound)
  const settings = useGameStore((s) => s.settings)

  const [storyIdx, setStoryIdx] = useState(0)
  const [story, setStory] = useState<Story>(() => stories[0])
  const [shuffled, setShuffled] = useState(() => shuffle(stories[0].steps))
  const [ordered, setOrdered] = useState<typeof story.steps>([])
  const [checking, setChecking] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [celebrate, setCelebrate] = useState(false)
  const [wrongIdx, setWrongIdx] = useState<number | null>(null)

  const startStory = (idx: number) => {
    const s = stories[idx]
    setStoryIdx(idx)
    setStory(s)
    setShuffled(shuffle(s.steps))
    setOrdered([])
    setChecking(false)
    setFeedback(null)
    setWrongIdx(null)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startStory(0)
  }, [])

  const handleAdd = (step: typeof story.steps[0]) => {
    if (checking) return
    playSound('pop', settings.soundEnabled)
    speak(step.text, settings.soundEnabled)
    setShuffled(shuffled.filter((s) => s.id !== step.id))
    setOrdered([...ordered, step])
  }

  const handleRemove = (step: typeof story.steps[0]) => {
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
    const correctOrder = story.steps
    const isCorrect = ordered.every(
      (step, i) => step.id === correctOrder[i].id
    )

    setChecking(true)
    if (isCorrect) {
      playSound('celebrate', settings.soundEnabled)
      // Read the whole story
      const fullStory = ordered.map((s) => s.text).join(' ')
      speak(fullStory, settings.soundEnabled)
      setCelebrate(true)
      addStars('story-builder', 5)
      recordRound('story-builder', 1)
      setTimeout(() => {
        setCelebrate(false)
        setChecking(false)
        // Move to next story
        const nextIdx = (storyIdx + 1) % stories.length
        startStory(nextIdx)
      }, 3200)
    } else {
      playSound('wrong', settings.soundEnabled)
      let firstWrong = -1
      for (let i = 0; i < ordered.length; i++) {
        if (ordered[i].id !== correctOrder[i].id) {
          firstWrong = i
          break
        }
      }
      setWrongIdx(firstWrong)
      setFeedback('wrong')
      setTimeout(() => {
        setFeedback(null)
        setWrongIdx(null)
        setChecking(false)
      }, 1800)
    }
  }

  const handleReset = () => {
    playSound('whoosh', settings.soundEnabled)
    startStory(storyIdx)
  }

  const allPlaced = shuffled.length === 0

  return (
    <GameShell
      activityId="story-builder"
      title="Story Builder"
      emoji="📚"
      onBack={onBack}
      instruction={`Story ${storyIdx + 1} of ${stories.length}: Put the pictures in order to tell the story!`}
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
        message="Great story!"
        reducedMotion={settings.reducedMotion}
      />

      <div className="flex-1 flex flex-col items-center gap-4">
        {/* Story title */}
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl px-5 py-2 shadow-md border-2 border-purple-200 flex items-center gap-2"
        >
          <BookOpen className="w-5 h-5 text-purple-600" />
          <span className="font-extrabold text-purple-700">{story.title}</span>
        </motion.div>

        {/* Available story pieces */}
        {shuffled.length > 0 && (
          <div className="w-full max-w-2xl bg-purple-50 rounded-2xl p-3 border-2 border-purple-200">
            <p className="text-xs font-semibold text-purple-700 mb-2 text-center">
              Tap to add to your story:
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
                    className="bg-white rounded-xl px-3 py-2 shadow border-2 border-purple-300 flex items-center gap-2"
                  >
                    <span className="text-2xl">{step.emoji}</span>
                    <span className="text-xs font-semibold text-slate-700 max-w-[120px]">
                      {step.text}
                    </span>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Ordered list */}
        <div className="w-full max-w-2xl bg-white rounded-2xl p-4 border-4 border-purple-300 shadow-md min-h-[200px]">
          <p className="text-xs font-semibold text-purple-700 mb-3 text-center">
            Your story (in order):
          </p>
          {ordered.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-purple-400 text-sm">
              Tap pictures above to build your story ✨
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {ordered.map((step, idx) => {
                  const isCorrectSpot = step.id === story.steps[idx]?.id
                  const showWrong = checking && wrongIdx === idx
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
                            : 'border-purple-200 bg-purple-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-400 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-2xl">{step.emoji}</span>
                      <span className="flex-1 text-xs sm:text-sm font-semibold text-slate-700">
                        {step.text}
                      </span>
                      {checking && isCorrectSpot && (
                        <Check className="w-5 h-5 text-emerald-500" />
                      )}
                      {!checking && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-purple-200 disabled:opacity-30"
                            aria-label="Move up"
                          >
                            <ChevronUp className="w-4 h-4 text-purple-700" />
                          </button>
                          <button
                            onClick={() => moveDown(idx)}
                            disabled={idx === ordered.length - 1}
                            className="p-1 rounded hover:bg-purple-200 disabled:opacity-30"
                            aria-label="Move down"
                          >
                            <ChevronDown className="w-4 h-4 text-purple-700" />
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
              <Check className="w-5 h-5" /> Tell my story!
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-3 bg-white text-purple-700 rounded-full font-bold border-2 border-purple-300 hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              <RotateCw className="w-4 h-4" /> Reset
            </button>
          </motion.div>
        )}
      </div>
    </GameShell>
  )
}
