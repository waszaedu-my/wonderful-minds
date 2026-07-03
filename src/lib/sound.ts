'use client'

// Web Audio API based sound generator — no external files needed.
// All sounds are synthesized in the browser so the app remains lightweight
// and works fully offline.

type SoundType =
  | 'click'
  | 'correct'
  | 'wrong'
  | 'star'
  | 'celebrate'
  | 'whoosh'
  | 'pop'
  | 'tick'
  | 'breathe-in'
  | 'breathe-out'
  | 'note-c'
  | 'note-d'
  | 'note-e'
  | 'note-f'
  | 'note-g'
  | 'note-a'
  | 'note-b'
  | 'note-c8'
  | 'achievement'

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      audioCtx = new AC()
    } catch {
      return null
    }
  }
  // Resume if suspended (autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

interface ToneOptions {
  frequency: number
  duration: number
  type?: OscillatorType
  volume?: number
  attack?: number
  release?: number
  detune?: number
}

function playTone({
  frequency,
  duration,
  type = 'sine',
  volume = 0.15,
  attack = 0.01,
  release = 0.1,
  detune = 0,
}: ToneOptions) {
  const ctx = getCtx()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.value = frequency
  osc.detune.value = detune

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(volume, now + attack)
  gain.gain.setValueAtTime(volume, now + duration - release)
  gain.gain.linearRampToValueAtTime(0, now + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + duration)
}

function playSequence(
  notes: Array<{ freq: number; time: number; duration: number; type?: OscillatorType }>
) {
  const ctx = getCtx()
  if (!ctx) return
  notes.forEach(({ freq, time, duration, type }) => {
    setTimeout(() => playTone({ frequency: freq, duration, type }), time)
  })
}

export function playSound(type: SoundType, enabled = true) {
  if (!enabled) return

  switch (type) {
    case 'click':
      playTone({ frequency: 440, duration: 0.08, type: 'sine', volume: 0.08 })
      break
    case 'pop':
      playTone({ frequency: 600, duration: 0.12, type: 'triangle', volume: 0.1 })
      setTimeout(
        () => playTone({ frequency: 900, duration: 0.08, type: 'triangle', volume: 0.08 }),
        40
      )
      break
    case 'tick':
      playTone({ frequency: 800, duration: 0.04, type: 'square', volume: 0.04 })
      break
    case 'correct':
      // Happy ascending arpeggio
      playSequence([
        { freq: 523.25, time: 0, duration: 0.15, type: 'sine' }, // C5
        { freq: 659.25, time: 100, duration: 0.15, type: 'sine' }, // E5
        { freq: 783.99, time: 200, duration: 0.25, type: 'sine' }, // G5
      ])
      break
    case 'wrong':
      // Gentle low tone (not harsh)
      playTone({ frequency: 220, duration: 0.2, type: 'sine', volume: 0.1 })
      setTimeout(
        () => playTone({ frequency: 196, duration: 0.25, type: 'sine', volume: 0.1 }),
        150
      )
      break
    case 'star':
      // Sparkle sound — quick high notes
      playSequence([
        { freq: 1046.5, time: 0, duration: 0.1, type: 'triangle' }, // C6
        { freq: 1318.51, time: 60, duration: 0.1, type: 'triangle' }, // E6
        { freq: 1567.98, time: 120, duration: 0.15, type: 'triangle' }, // G6
      ])
      break
    case 'celebrate':
      // Big happy chord sequence
      playSequence([
        { freq: 523.25, time: 0, duration: 0.2, type: 'sine' }, // C5
        { freq: 659.25, time: 100, duration: 0.2, type: 'sine' }, // E5
        { freq: 783.99, time: 200, duration: 0.2, type: 'sine' }, // G5
        { freq: 1046.5, time: 300, duration: 0.4, type: 'sine' }, // C6
        { freq: 1318.51, time: 400, duration: 0.4, type: 'triangle' }, // E6
        { freq: 1567.98, time: 500, duration: 0.5, type: 'triangle' }, // G6
      ])
      break
    case 'whoosh':
      // Soft downward sweep
      playTone({ frequency: 800, duration: 0.3, type: 'sine', volume: 0.06 })
      setTimeout(
        () => playTone({ frequency: 400, duration: 0.2, type: 'sine', volume: 0.06 }),
        100
      )
      break
    case 'breathe-in':
      // Rising soft tone
      playTone({ frequency: 330, duration: 0.6, type: 'sine', volume: 0.08 })
      setTimeout(
        () => playTone({ frequency: 440, duration: 0.6, type: 'sine', volume: 0.08 }),
        200
      )
      break
    case 'breathe-out':
      // Falling soft tone
      playTone({ frequency: 440, duration: 0.6, type: 'sine', volume: 0.08 })
      setTimeout(
        () => playTone({ frequency: 330, duration: 0.8, type: 'sine', volume: 0.08 }),
        200
      )
      break
    case 'note-c':
      playTone({ frequency: 261.63, duration: 0.4, type: 'triangle', volume: 0.15 })
      break
    case 'note-d':
      playTone({ frequency: 293.66, duration: 0.4, type: 'triangle', volume: 0.15 })
      break
    case 'note-e':
      playTone({ frequency: 329.63, duration: 0.4, type: 'triangle', volume: 0.15 })
      break
    case 'note-f':
      playTone({ frequency: 349.23, duration: 0.4, type: 'triangle', volume: 0.15 })
      break
    case 'note-g':
      playTone({ frequency: 392.0, duration: 0.4, type: 'triangle', volume: 0.15 })
      break
    case 'note-a':
      playTone({ frequency: 440.0, duration: 0.4, type: 'triangle', volume: 0.15 })
      break
    case 'note-b':
      playTone({ frequency: 493.88, duration: 0.4, type: 'triangle', volume: 0.15 })
      break
    case 'note-c8':
      playTone({ frequency: 523.25, duration: 0.4, type: 'triangle', volume: 0.15 })
      break
    case 'achievement':
      // Special achievement fanfare
      playSequence([
        { freq: 523.25, time: 0, duration: 0.15, type: 'sine' },
        { freq: 659.25, time: 100, duration: 0.15, type: 'sine' },
        { freq: 783.99, time: 200, duration: 0.15, type: 'sine' },
        { freq: 1046.5, time: 300, duration: 0.5, type: 'triangle' },
        { freq: 1318.51, time: 400, duration: 0.5, type: 'triangle' },
      ])
      break
  }
}

// Speech synthesis for instructions — uses built-in browser TTS
export function speak(text: string, enabled = true) {
  if (!enabled) return
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.85
    utterance.pitch = 1.1
    utterance.volume = 0.8
    window.speechSynthesis.speak(utterance)
  } catch {
    // Silent fail — speech is optional
  }
}
