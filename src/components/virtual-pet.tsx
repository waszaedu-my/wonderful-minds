'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/game-store'
import { petEmojis, petAccessories } from '@/lib/games-data'
import { playSound } from '@/lib/sound'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Heart, Sparkles, X } from 'lucide-react'

const petTypes: { id: 'cat' | 'dog' | 'bunny' | 'dragon'; label: string; emoji: string }[] = [
  { id: 'cat', label: 'Cat', emoji: '🐱' },
  { id: 'dog', label: 'Dog', emoji: '🐶' },
  { id: 'bunny', label: 'Bunny', emoji: '🐰' },
  { id: 'dragon', label: 'Dragon', emoji: '🐲' },
]

export function VirtualPet() {
  const pet = useGameStore((s) => s.pet)
  const setPetType = useGameStore((s) => s.setPetType)
  const setPetName = useGameStore((s) => s.setPetName)
  const feedPet = useGameStore((s) => s.feedPet)
  const unlockAccessory = useGameStore((s) => s.unlockAccessory)
  const totalStars = useGameStore((s) => s.totalStars())
  const settings = useGameStore((s) => s.settings)

  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(pet.name)

  const petEmoji =
    petEmojis[pet.type]?.[Math.min(pet.level - 1, petEmojis[pet.type].length - 1)] ?? '🐱'

  const happinessLevel =
    pet.happiness >= 80
      ? 'super happy'
      : pet.happiness >= 50
        ? 'happy'
        : pet.happiness >= 25
          ? 'okay'
          : 'hungry'

  const happinessEmoji =
    pet.happiness >= 80 ? '😄' : pet.happiness >= 50 ? '🙂' : pet.happiness >= 25 ? '😐' : '😴'

  const handleFeed = () => {
    playSound('star', settings.soundEnabled)
    feedPet(15)
  }

  const handleChoosePet = (type: 'cat' | 'dog' | 'bunny' | 'dragon') => {
    playSound('pop', settings.soundEnabled)
    setPetType(type)
  }

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setPetName(nameInput.trim().slice(0, 12))
      playSound('click', settings.soundEnabled)
    }
    setEditing(false)
  }

  const handleBuyAccessory = (id: string, cost: number) => {
    if (pet.accessories.includes(id)) return
    if (totalStars < cost) {
      playSound('wrong', settings.soundEnabled)
      return
    }
    playSound('star', settings.soundEnabled)
    unlockAccessory(id)
    // Note: we don't deduct stars here for simplicity; accessories are unlocked by reaching star milestones
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative bg-white rounded-3xl p-3 sm:p-4 shadow-md border-4 border-pink-200 flex items-center gap-3 cursor-pointer"
          aria-label="Visit your pet"
        >
          <motion.div
            animate={{ y: [0, -4, 0], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-4xl sm:text-5xl relative"
          >
            {petEmoji}
            {pet.accessories.includes('hat') && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">🎩</span>
            )}
            {pet.accessories.includes('crown') && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</span>
            )}
            {pet.accessories.includes('bow') && (
              <span className="absolute top-2 -right-1 text-base">🎀</span>
            )}
            {pet.accessories.includes('glasses') && (
              <span className="absolute top-3 left-1/2 -translate-x-1/2 text-base">🕶️</span>
            )}
            {pet.accessories.includes('flower') && (
              <span className="absolute top-1 -left-1 text-base">🌸</span>
            )}
          </motion.div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              <p className="font-extrabold text-pink-700 text-sm sm:text-base">
                {pet.name}
              </p>
              <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">
                Lv {pet.level}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Heart
                className={`w-3 h-3 ${
                  pet.happiness >= 50 ? 'text-rose-500 fill-rose-400' : 'text-slate-400'
                }`}
              />
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-400 to-pink-500"
                  animate={{ width: `${pet.happiness}%` }}
                />
              </div>
              <span className="text-xs">{happinessEmoji}</span>
            </div>
          </div>
        </motion.button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-pink-700 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" /> Your Pet Friend
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pet display */}
          <div className="flex flex-col items-center gap-2 bg-gradient-to-b from-pink-100 to-purple-100 rounded-2xl p-6">
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-8xl relative"
            >
              {petEmoji}
              {pet.accessories.includes('hat') && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl">🎩</span>
              )}
              {pet.accessories.includes('crown') && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl">👑</span>
              )}
            </motion.div>
            <p className="text-xl font-extrabold text-pink-700">{pet.name}</p>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full font-bold">
                Level {pet.level}
              </span>
              <span className="text-xs bg-amber-200 text-amber-700 px-2 py-1 rounded-full font-bold">
                {pet.xp} XP
              </span>
            </div>
            <p className="text-sm text-pink-600">
              {pet.name} is feeling {happinessLevel}! {happinessEmoji}
            </p>
          </div>

          {/* Happiness bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-pink-600">Happiness</span>
              <span className="text-pink-700 font-bold">{pet.happiness}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-400 to-pink-500"
                animate={{ width: `${pet.happiness}%` }}
              />
            </div>
          </div>

          {/* Feed button */}
          <button
            onClick={handleFeed}
            className="w-full py-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-full font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5" /> Feed {pet.name} (+15 happiness)
          </button>

          {/* Name editor */}
          <div>
            <p className="text-xs font-semibold text-pink-600 mb-2">Name your pet:</p>
            <div className="flex gap-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={12}
                className="flex-1 px-3 py-2 rounded-xl border-2 border-pink-200 focus:border-pink-400 outline-none text-sm"
                placeholder="Pet name"
              />
              <button
                onClick={handleSaveName}
                className="px-4 py-2 bg-pink-500 text-white rounded-xl font-bold text-sm hover:bg-pink-600"
              >
                Save
              </button>
            </div>
          </div>

          {/* Pet type selector */}
          <div>
            <p className="text-xs font-semibold text-pink-600 mb-2">Choose a pet:</p>
            <div className="grid grid-cols-4 gap-2">
              {petTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleChoosePet(t.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    pet.type === t.id
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-slate-200 hover:border-pink-200'
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-600">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accessories shop */}
          <div>
            <p className="text-xs font-semibold text-pink-600 mb-2">
              Accessories (earned by playing):
            </p>
            <div className="grid grid-cols-3 gap-2">
              {petAccessories.map((a) => {
                const owned = pet.accessories.includes(a.id)
                return (
                  <button
                    key={a.id}
                    onClick={() => handleBuyAccessory(a.id, a.cost)}
                    disabled={owned}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                      owned
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-slate-200 hover:border-pink-200 opacity-60'
                    }`}
                  >
                    <span className="text-2xl">{a.emoji}</span>
                    <span className="text-[10px] font-bold text-slate-600">{a.name}</span>
                    {owned ? (
                      <span className="text-[10px] text-emerald-600 font-bold">Owned</span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-bold">⭐ {a.cost}</span>
                    )}
                  </button>
                )
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-center">
              You have {totalStars} stars. Earn more by playing games!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
