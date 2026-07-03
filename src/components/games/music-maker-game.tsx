'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { FeedbackOverlay, ConfettiBurst } from '@/components/feedback-overlay'
import { pianoNotes, songs } from '@/lib/games-data'
import { playSound, speak } from '@/lib/sound'
import { useGameStore } from '@/lib/game-store'
import { Play, Square, RotateCw, Music } from 'lucide-react'

interface MusicMakerGameProps {
  onBack: () => void
}

const noteSoundMap = ['note-c', 'note-d', 'note-e', 'note-f', 'note-g', 'note-a', 'note-b', 'note-c8'] as const

export function MusicMakerGame({ onBack }: MusicMakerGameProps) {
  const addStars = useGameStore((s) => s.addStars)
  const recordRound = useGameStore((s) => s.recordRound)
  const settings = useGameStore((s) => s.settings)

  const [mode, setMode] = useState<'free' | 'song'>('free')
  const [activeNote, setActiveNote] = useState<number | null>(null)
  const [playingSong, setPlayingSong] = useState(false)
  const [currentSongIdx, setCurrentSongIdx] = useState(0)
  const [songStep, setSongStep] = useState(0)
  const [celebrate, setCelebrate] = useState(false)
  const [songsCompleted, setSongsCompleted] = useState<Set<string>>(new Set())
  const playTimeoutsRef = useRef<NodeJS.Timeout[]>([])

  const handleNote = (idx: number) => {
    playSound(noteSoundMap[idx], settings.soundEnabled)
    setActiveNote(idx)
    setTimeout(() => setActiveNote((n) => (n === idx ? null : n)), 300)
  }

  const clearAllTimeouts = () => {
    playTimeoutsRef.current.forEach(clearTimeout)
    playTimeoutsRef.current = []
  }

  const playSong = (songIdx: number) => {
    if (playingSong) return
    const song = songs[songIdx]
    setCurrentSongIdx(songIdx)
    setPlayingSong(true)
    setSongStep(0)
    clearAllTimeouts()

    song.notes.forEach((noteIdx, i) => {
      const t = setTimeout(() => {
        handleNote(noteIdx)
        setSongStep(i + 1)
      }, i * 500)
      playTimeoutsRef.current.push(t)
    })

    const endT = setTimeout(() => {
      setPlayingSong(false)
      // Mark song as completed (heard)
      setSongsCompleted((prev) => new Set(prev).add(song.name))
      addStars('music-maker', 2)
      if (songsCompleted.size + 1 >= songs.length) {
        // All songs played
        playSound('celebrate', settings.soundEnabled)
        setCelebrate(true)
        recordRound('music-maker', songs.length)
        setTimeout(() => setCelebrate(false), 2500)
      }
    }, song.notes.length * 500 + 500)
    playTimeoutsRef.current.push(endT)
  }

  const stopSong = () => {
    clearAllTimeouts()
    setPlayingSong(false)
    setSongStep(0)
    playSound('click', settings.soundEnabled)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimeouts()
  }, [])

  return (
    <GameShell
      activityId="music-maker"
      title="Music Maker"
      emoji="🎹"
      onBack={onBack}
      instruction={
        mode === 'free'
          ? 'Tap the keys to make music!'
          : 'Listen to a song, then try to play it back!'
      }
    >
      <ConfettiBurst show={celebrate} reducedMotion={settings.reducedMotion} />
      <FeedbackOverlay
        show={celebrate}
        type="celebrate"
        message="You played all songs!"
        reducedMotion={settings.reducedMotion}
      />

      <div className="flex-1 flex flex-col items-center gap-5">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode('free')
              stopSong()
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${
              mode === 'free'
                ? 'bg-cyan-500 text-white'
                : 'bg-white text-cyan-600 border-2 border-cyan-200 hover:border-cyan-400'
            }`}
          >
            🎵 Free Play
          </button>
          <button
            onClick={() => {
              setMode('song')
              stopSong()
            }}
            className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${
              mode === 'song'
                ? 'bg-cyan-500 text-white'
                : 'bg-white text-cyan-600 border-2 border-cyan-200 hover:border-cyan-400'
            }`}
          >
            🎼 Play a Song
          </button>
        </div>

        {/* Song selector */}
        {mode === 'song' && (
          <div className="w-full max-w-2xl bg-cyan-50 rounded-2xl p-3 border-2 border-cyan-200">
            <p className="text-xs font-semibold text-cyan-700 mb-2 text-center">
              Pick a song to hear:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {songs.map((song, idx) => {
                const isCurrent = currentSongIdx === idx && playingSong
                const isDone = songsCompleted.has(song.name)
                return (
                  <motion.button
                    key={song.name}
                    onClick={() => (isCurrent ? stopSong() : playSong(idx))}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={playingSong && !isCurrent}
                    className={`relative p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-colors ${
                      isCurrent
                        ? 'bg-cyan-200 border-cyan-400'
                        : isDone
                          ? 'bg-emerald-50 border-emerald-300'
                          : 'bg-white border-cyan-200 hover:border-cyan-400'
                    } disabled:opacity-50`}
                  >
                    <span className="text-3xl">{song.emoji}</span>
                    <span className="text-xs font-bold text-slate-700">
                      {song.name}
                    </span>
                    {isCurrent ? (
                      <Square className="w-3 h-3 text-cyan-700" />
                    ) : (
                      <Play className="w-3 h-3 text-cyan-600" />
                    )}
                    {isDone && (
                      <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Progress indicator */}
            {playingSong && (
              <div className="mt-3">
                <p className="text-xs text-cyan-700 text-center mb-1">
                  Playing: {songStep} / {songs[currentSongIdx].notes.length} notes
                </p>
                <div className="flex gap-0.5 justify-center">
                  {songs[currentSongIdx].notes.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < songStep ? 'bg-cyan-500' : 'bg-cyan-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Piano keyboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="bg-gradient-to-b from-slate-700 to-slate-900 rounded-3xl p-4 shadow-2xl">
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              {pianoNotes.map((note, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleNote(idx)}
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.05 }}
                  animate={
                    activeNote === idx
                      ? { scale: [1, 1.15, 1], y: [0, 4, 0] }
                      : { scale: 1, y: 0 }
                  }
                  className="relative flex-1 h-32 sm:h-48 rounded-b-xl shadow-md flex flex-col items-center justify-end pb-2 sm:pb-4 border-2 border-slate-300"
                  style={{ backgroundColor: note.color }}
                  aria-label={`Play note ${note.note === 'C8' ? 'C' : note.note}`}
                >
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 text-white/40 text-xs sm:text-sm font-bold">
                    {note.note === 'C8' ? 'C' : note.note}
                  </span>
                  <motion.span
                    className="text-2xl sm:text-3xl"
                    animate={
                      activeNote === idx
                        ? { scale: [1, 1.4, 1] }
                        : { scale: 1 }
                    }
                  >
                    🎵
                  </motion.span>
                </motion.button>
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-2">
            {mode === 'free'
              ? 'Make any song you like! Each color is a different note.'
              : 'Tap any key to play your own notes too!'}
          </p>
        </motion.div>

        {/* Footer info */}
        <div className="flex items-center gap-4 text-xs text-cyan-700">
          <div className="flex items-center gap-1">
            <Music className="w-3 h-3" />
            <span>Songs heard: {songsCompleted.size} / {songs.length}</span>
          </div>
        </div>
      </div>
    </GameShell>
  )
}
