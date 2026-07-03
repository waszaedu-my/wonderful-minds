'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ActivityId =
  | 'emotions'
  | 'colors-shapes'
  | 'counting'
  | 'alphabet'
  | 'memory'
  | 'patterns'
  | 'routines'
  | 'calm'
  // New activities
  | 'animals'
  | 'body-parts'
  | 'story-builder'
  | 'music-maker'
  | 'opposites'
  | 'sorting'
  | 'spot-diff'
  | 'drawing'
  | 'daily-challenge'

export interface ActivityProgress {
  stars: number
  completedRounds: number
  bestStreak: number
  lastPlayed: number | null
  level: number // 1-5 difficulty progression
}

export interface Settings {
  soundEnabled: boolean
  musicEnabled: boolean
  reducedMotion: boolean
  highContrast: boolean
}

export interface PetState {
  type: 'cat' | 'dog' | 'bunny' | 'dragon'
  name: string
  level: number
  happiness: number // 0-100
  xp: number // total stars earned
  lastFed: number | null
  accessories: string[] // unlocked accessories
}

export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  unlocked: boolean
  unlockedAt: number | null
  progress?: number // 0-100
}

export interface DailyStreak {
  current: number
  longest: number
  lastPlayedDate: string | null // YYYY-MM-DD
  todayCompleted: boolean
}

interface GameState {
  // Navigation
  currentScreen: 'home' | ActivityId
  setScreen: (screen: 'home' | ActivityId) => void

  // Progress per activity
  progress: Record<ActivityId, ActivityProgress>
  addStars: (activity: ActivityId, amount: number) => void
  recordRound: (activity: ActivityId, streak: number) => void
  levelUp: (activity: ActivityId) => void

  // Total stars
  totalStars: () => number

  // Settings
  settings: Settings
  updateSettings: (partial: Partial<Settings>) => void

  // Virtual Pet
  pet: PetState
  setPetType: (type: PetState['type']) => void
  setPetName: (name: string) => void
  feedPet: (amount?: number) => void
  unlockAccessory: (id: string) => void

  // Achievements
  achievements: Achievement[]
  unlockAchievement: (id: string) => void
  updateAchievementProgress: (id: string, progress: number) => void

  // Daily streak
  streak: DailyStreak
  markTodayPlayed: () => void

  // Daily challenge
  dailyChallengeCompleted: boolean
  dailyChallengeDate: string | null
  completeDailyChallenge: () => void

  // Reset
  resetProgress: () => void
}

const defaultProgress: ActivityProgress = {
  stars: 0,
  completedRounds: 0,
  bestStreak: 0,
  lastPlayed: null,
  level: 1,
}

const allActivities: ActivityId[] = [
  'emotions',
  'colors-shapes',
  'counting',
  'alphabet',
  'memory',
  'patterns',
  'routines',
  'calm',
  'animals',
  'body-parts',
  'story-builder',
  'music-maker',
  'opposites',
  'sorting',
  'spot-diff',
  'drawing',
]

const defaultSettings: Settings = {
  soundEnabled: true,
  musicEnabled: false,
  reducedMotion: false,
  highContrast: false,
}

const defaultPet: PetState = {
  type: 'cat',
  name: 'Star',
  level: 1,
  happiness: 50,
  xp: 0,
  lastFed: null,
  accessories: [],
}

const defaultAchievements: Achievement[] = [
  { id: 'first-star', title: 'First Star', description: 'Earn your very first star', emoji: '⭐', unlocked: false, unlockedAt: null },
  { id: 'ten-stars', title: 'Star Collector', description: 'Earn 10 stars', emoji: '🌟', unlocked: false, unlockedAt: null },
  { id: 'fifty-stars', title: 'Star Master', description: 'Earn 50 stars', emoji: '✨', unlocked: false, unlockedAt: null },
  { id: 'hundred-stars', title: 'Star Hero', description: 'Earn 100 stars', emoji: '💫', unlocked: false, unlockedAt: null },
  { id: 'first-game', title: 'First Steps', description: 'Finish your first game', emoji: '👣', unlocked: false, unlockedAt: null },
  { id: 'five-games', title: 'Explorer', description: 'Try 5 different games', emoji: '🧭', unlocked: false, unlockedAt: null },
  { id: 'all-games', title: 'Adventurer', description: 'Try all 16 games', emoji: '🗺️', unlocked: false, unlockedAt: null },
  { id: 'streak-3', title: 'On a Roll', description: 'Play 3 days in a row', emoji: '🔥', unlocked: false, unlockedAt: null },
  { id: 'streak-7', title: 'Week Warrior', description: 'Play 7 days in a row', emoji: '🏆', unlocked: false, unlockedAt: null },
  { id: 'memory-master', title: 'Memory Master', description: 'Win Memory Match in under 8 moves', emoji: '🧠', unlocked: false, unlockedAt: null },
  { id: 'perfect-routine', title: 'Routine Pro', description: 'Complete a routine perfectly', emoji: '📋', unlocked: false, unlockedAt: null },
  { id: 'calm-breather', title: 'Zen Master', description: 'Complete 3 breathing cycles', emoji: '🧘', unlocked: false, unlockedAt: null },
  { id: 'daily-challenge', title: 'Daily Champion', description: 'Complete your first Daily Challenge', emoji: '📅', unlocked: false, unlockedAt: null },
  { id: 'artist', title: 'Little Artist', description: 'Create a drawing', emoji: '🎨', unlocked: false, unlockedAt: null },
  { id: 'musician', title: 'Music Maker', description: 'Play a song on the piano', emoji: '🎵', unlocked: false, unlockedAt: null },
  { id: 'pet-friend', title: 'Best Friend', description: 'Feed your pet 5 times', emoji: '🐾', unlocked: false, unlockedAt: null },
]

const defaultStreak: DailyStreak = {
  current: 0,
  longest: 0,
  lastPlayedDate: null,
  todayCompleted: false,
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function computePetLevel(xp: number): number {
  // Level up every 20 stars
  return Math.floor(xp / 20) + 1
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentScreen: 'home',
      setScreen: (screen) => set({ currentScreen: screen }),

      progress: allActivities.reduce(
        (acc, id) => ({ ...acc, [id]: { ...defaultProgress } }),
        {} as Record<ActivityId, ActivityProgress>
      ),

      addStars: (activity, amount) =>
        set((state) => {
          const newProgress = {
            ...state.progress,
            [activity]: {
              ...state.progress[activity],
              stars: state.progress[activity].stars + amount,
              lastPlayed: Date.now(),
            },
          }
          // Pet happiness + XP
          const newXp = state.pet.xp + amount
          const newPetLevel = computePetLevel(newXp)
          const newHappiness = Math.min(100, state.pet.happiness + amount * 2)
          return {
            progress: newProgress,
            pet: {
              ...state.pet,
              xp: newXp,
              level: newPetLevel,
              happiness: newHappiness,
              lastFed: Date.now(),
            },
          }
        }),

      recordRound: (activity, streak) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [activity]: {
              ...state.progress[activity],
              completedRounds: state.progress[activity].completedRounds + 1,
              bestStreak: Math.max(state.progress[activity].bestStreak, streak),
              lastPlayed: Date.now(),
            },
          },
        })),

      levelUp: (activity) =>
        set((state) => {
          const cur = state.progress[activity]
          if (cur.level >= 5) return state
          return {
            progress: {
              ...state.progress,
              [activity]: { ...cur, level: cur.level + 1 },
            },
          }
        }),

      totalStars: () => {
        const progress = get().progress
        return allActivities.reduce(
          (sum, id) => sum + progress[id].stars,
          0
        )
      },

      settings: defaultSettings,
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),

      pet: defaultPet,
      setPetType: (type) => set((state) => ({ pet: { ...state.pet, type } })),
      setPetName: (name) => set((state) => ({ pet: { ...state.pet, name } })),
      feedPet: (amount = 10) =>
        set((state) => ({
          pet: {
            ...state.pet,
            happiness: Math.min(100, state.pet.happiness + amount),
            lastFed: Date.now(),
          },
        })),
      unlockAccessory: (id) =>
        set((state) => ({
          pet: {
            ...state.pet,
            accessories: state.pet.accessories.includes(id)
              ? state.pet.accessories
              : [...state.pet.accessories, id],
          },
        })),

      achievements: defaultAchievements,
      unlockAchievement: (id) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id && !a.unlocked
              ? { ...a, unlocked: true, unlockedAt: Date.now() }
              : a
          ),
        })),
      updateAchievementProgress: (id, progress) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id ? { ...a, progress } : a
          ),
        })),

      streak: defaultStreak,
      markTodayPlayed: () =>
        set((state) => {
          const today = todayStr()
          if (state.streak.lastPlayedDate === today && state.streak.todayCompleted) {
            return state
          }
          let newCurrent = 1
          if (state.streak.lastPlayedDate === yesterdayStr()) {
            newCurrent = state.streak.current + 1
          } else if (state.streak.lastPlayedDate === today) {
            newCurrent = state.streak.current
          }
          return {
            streak: {
              current: newCurrent,
              longest: Math.max(state.streak.longest, newCurrent),
              lastPlayedDate: today,
              todayCompleted: true,
            },
          }
        }),

      dailyChallengeCompleted: false,
      dailyChallengeDate: null,
      completeDailyChallenge: () =>
        set(() => ({
          dailyChallengeCompleted: true,
          dailyChallengeDate: todayStr(),
        })),

      resetProgress: () =>
        set({
          progress: allActivities.reduce(
            (acc, id) => ({ ...acc, [id]: { ...defaultProgress } }),
            {} as Record<ActivityId, ActivityProgress>
          ),
          pet: { ...defaultPet },
          achievements: defaultAchievements.map((a) => ({ ...a, unlocked: false, unlockedAt: null })),
          streak: { ...defaultStreak },
          dailyChallengeCompleted: false,
          dailyChallengeDate: null,
        }),
    }),
    {
      name: 'wonderful-minds-storage-v2',
      // Merge persisted state with defaults to handle schema changes (new activities added)
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<GameState> | undefined
        if (!persisted) return currentState

        // Merge progress: ensure all activities exist with defaults
        const mergedProgress = { ...currentState.progress }
        if (persisted.progress) {
          for (const key of Object.keys(currentState.progress) as ActivityId[]) {
            const persistedActivity = persisted.progress[key]
            if (persistedActivity) {
              mergedProgress[key] = {
                ...currentState.progress[key],
                ...persistedActivity,
              }
            }
          }
        }

        return {
          ...currentState,
          ...persisted,
          progress: mergedProgress,
          // Ensure settings, pet, achievements, streak have defaults if missing
          settings: { ...currentState.settings, ...persisted.settings },
          pet: { ...currentState.pet, ...persisted.pet },
          achievements: currentState.achievements.map((a) => {
            const persistedAch = persisted.achievements?.find((p) => p.id === a.id)
            return persistedAch ? { ...a, ...persistedAch } : a
          }),
          streak: { ...currentState.streak, ...persisted.streak },
        }
      },
    }
  )
)

export const activityMeta: Record<
  ActivityId,
  { title: string; subtitle: string; emoji: string; color: string; category: string; isNew?: boolean }
> = {
  emotions: {
    title: 'Feelings Friends',
    subtitle: 'Match faces to feelings',
    emoji: '😊',
    color: 'from-amber-200 to-orange-200',
    category: 'feelings',
  },
  'colors-shapes': {
    title: 'Colors & Shapes',
    subtitle: 'Sort and match',
    emoji: '🎨',
    color: 'from-emerald-200 to-teal-200',
    category: 'basics',
  },
  counting: {
    title: 'Counting Fun',
    subtitle: 'Count with me',
    emoji: '🔢',
    color: 'from-sky-200 to-cyan-200',
    category: 'numbers',
  },
  alphabet: {
    title: 'ABC Adventure',
    subtitle: 'Learn your letters',
    emoji: '🔤',
    color: 'from-violet-200 to-purple-200',
    category: 'letters',
  },
  memory: {
    title: 'Memory Match',
    subtitle: 'Find the pairs',
    emoji: '🧠',
    color: 'from-rose-200 to-pink-200',
    category: 'thinking',
  },
  patterns: {
    title: 'Pattern Play',
    subtitle: 'What comes next?',
    emoji: '🔁',
    color: 'from-lime-200 to-green-200',
    category: 'thinking',
  },
  routines: {
    title: 'My Day',
    subtitle: 'Order your routine',
    emoji: '☀️',
    color: 'from-yellow-200 to-amber-200',
    category: 'life',
  },
  calm: {
    title: 'Calm Corner',
    subtitle: 'Breathe and relax',
    emoji: '🌌',
    color: 'from-indigo-200 to-blue-200',
    category: 'feelings',
  },
  // NEW activities
  animals: {
    title: 'Animal Friends',
    subtitle: 'Listen and match',
    emoji: '🐾',
    color: 'from-orange-200 to-amber-300',
    category: 'world',
    isNew: true,
  },
  'body-parts': {
    title: 'Body Parts',
    subtitle: 'Where is it?',
    emoji: '👂',
    color: 'from-pink-200 to-rose-300',
    category: 'life',
    isNew: true,
  },
  'story-builder': {
    title: 'Story Builder',
    subtitle: 'Tell a story',
    emoji: '📚',
    color: 'from-purple-200 to-fuchsia-300',
    category: 'thinking',
    isNew: true,
  },
  'music-maker': {
    title: 'Music Maker',
    subtitle: 'Play a song',
    emoji: '🎹',
    color: 'from-cyan-200 to-blue-300',
    category: 'creative',
    isNew: true,
  },
  opposites: {
    title: 'Opposites',
    subtitle: 'Match the pairs',
    emoji: '⚖️',
    color: 'from-teal-200 to-emerald-300',
    category: 'thinking',
    isNew: true,
  },
  sorting: {
    title: 'Sorting Game',
    subtitle: 'Find the category',
    emoji: '📦',
    color: 'from-amber-200 to-yellow-300',
    category: 'thinking',
    isNew: true,
  },
  'spot-diff': {
    title: 'Spot the Difference',
    subtitle: 'Find what changed',
    emoji: '🔍',
    color: 'from-emerald-200 to-green-300',
    category: 'thinking',
    isNew: true,
  },
  drawing: {
    title: 'Drawing Canvas',
    subtitle: 'Make your art',
    emoji: '🖌️',
    color: 'from-fuchsia-200 to-pink-300',
    category: 'creative',
    isNew: true,
  },
  'daily-challenge': {
    title: 'Daily Challenge',
    subtitle: 'A surprise mix today',
    emoji: '🎁',
    color: 'from-amber-300 to-orange-400',
    category: 'special',
    isNew: true,
  },
}

export const activityCategories: Record<string, { label: string; emoji: string }> = {
  feelings: { label: 'Feelings', emoji: '💛' },
  basics: { label: 'Basics', emoji: '🌈' },
  numbers: { label: 'Numbers', emoji: '🔢' },
  letters: { label: 'Letters', emoji: '🔤' },
  thinking: { label: 'Thinking', emoji: '🧠' },
  life: { label: 'Life Skills', emoji: '☀️' },
  world: { label: 'World', emoji: '🌍' },
  creative: { label: 'Creative', emoji: '🎨' },
  special: { label: 'Special', emoji: '✨' },
}
