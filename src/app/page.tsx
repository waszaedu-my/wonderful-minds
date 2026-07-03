'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HomeScreen } from '@/components/home-screen'
import { EmotionGame } from '@/components/games/emotion-game'
import { ColorShapeGame } from '@/components/games/color-shape-game'
import { CountingGame } from '@/components/games/counting-game'
import { AlphabetGame } from '@/components/games/alphabet-game'
import { MemoryGame } from '@/components/games/memory-game'
import { PatternGame } from '@/components/games/pattern-game'
import { RoutineGame } from '@/components/games/routine-game'
import { CalmCorner } from '@/components/games/calm-corner'
// New games
import { AnimalGame } from '@/components/games/animal-game'
import { BodyPartsGame } from '@/components/games/body-parts-game'
import { StoryBuilderGame } from '@/components/games/story-builder-game'
import { MusicMakerGame } from '@/components/games/music-maker-game'
import { OppositesGame } from '@/components/games/opposites-game'
import { SortingGame } from '@/components/games/sorting-game'
import { SpotDiffGame } from '@/components/games/spot-diff-game'
import { DrawingCanvasGame } from '@/components/games/drawing-canvas-game'
import { useGameStore, type ActivityId } from '@/lib/game-store'

export default function Home() {
  const currentScreen = useGameStore((s) => s.currentScreen)
  const setScreen = useGameStore((s) => s.setScreen)

  // Scroll to top on screen change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  }, [currentScreen])

  const goHome = () => setScreen('home')
  const goActivity = (id: ActivityId) => setScreen(id)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentScreen}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {currentScreen === 'home' && <HomeScreen onSelect={goActivity} />}
        {currentScreen === 'emotions' && <EmotionGame onBack={goHome} />}
        {currentScreen === 'colors-shapes' && (
          <ColorShapeGame onBack={goHome} />
        )}
        {currentScreen === 'counting' && <CountingGame onBack={goHome} />}
        {currentScreen === 'alphabet' && <AlphabetGame onBack={goHome} />}
        {currentScreen === 'memory' && <MemoryGame onBack={goHome} />}
        {currentScreen === 'patterns' && <PatternGame onBack={goHome} />}
        {currentScreen === 'routines' && <RoutineGame onBack={goHome} />}
        {currentScreen === 'calm' && <CalmCorner onBack={goHome} />}
        {/* New games */}
        {currentScreen === 'animals' && <AnimalGame onBack={goHome} />}
        {currentScreen === 'body-parts' && <BodyPartsGame onBack={goHome} />}
        {currentScreen === 'story-builder' && (
          <StoryBuilderGame onBack={goHome} />
        )}
        {currentScreen === 'music-maker' && <MusicMakerGame onBack={goHome} />}
        {currentScreen === 'opposites' && <OppositesGame onBack={goHome} />}
        {currentScreen === 'sorting' && <SortingGame onBack={goHome} />}
        {currentScreen === 'spot-diff' && <SpotDiffGame onBack={goHome} />}
        {currentScreen === 'drawing' && <DrawingCanvasGame onBack={goHome} />}
        {/* Daily challenge just routes home with a notification - it sends you to specific games */}
        {currentScreen === 'daily-challenge' && <HomeScreen onSelect={goActivity} />}
      </motion.div>
    </AnimatePresence>
  )
}
