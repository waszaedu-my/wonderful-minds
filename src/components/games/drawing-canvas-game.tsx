'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { GameShell } from '@/components/game-shell'
import { ConfettiBurst } from '@/components/feedback-overlay'
import { useGameStore } from '@/lib/game-store'
import { playSound } from '@/lib/sound'
import { Eraser, Trash2, Download, Sparkles } from 'lucide-react'

interface DrawingCanvasGameProps {
  onBack: () => void
}

const colorPalette = [
  '#EF4444', // red
  '#F97316', // orange
  '#FACC15', // yellow
  '#22C55E', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#92400E', // brown
  '#1F2937', // black
  '#F9FAFB', // white (eraser-like)
]

const brushSizes = [4, 8, 14, 22]

export function DrawingCanvasGame({ onBack }: DrawingCanvasGameProps) {
  const addStars = useGameStore((s) => s.addStars)
  const recordRound = useGameStore((s) => s.recordRound)
  const settings = useGameStore((s) => s.settings)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState(colorPalette[5])
  const [brushSize, setBrushSize] = useState(brushSizes[1])
  const [isErasing, setIsErasing] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match its display size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2 // retina
    canvas.height = rect.height * 2
    ctx.scale(2, 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, rect.width, rect.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    const pos = getPos(e)
    lastPosRef.current = pos
    setIsDrawing(true)
    if (!hasDrawn) {
      setHasDrawn(true)
      // Award first-time drawing star
      addStars('drawing', 3)
      recordRound('drawing', 1)
      playSound('star', settings.soundEnabled)
    }
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)

    ctx.strokeStyle = isErasing ? '#FFFFFF' : color
    ctx.lineWidth = isErasing ? brushSize * 2.5 : brushSize
    ctx.beginPath()
    if (lastPosRef.current) {
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    }
    lastPosRef.current = pos
  }

  const stopDraw = () => {
    setIsDrawing(false)
    lastPosRef.current = null
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, rect.width, rect.height)
    setHasDrawn(false)
    playSound('whoosh', settings.soundEnabled)
  }

  const saveDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `my-art-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
    playSound('celebrate', settings.soundEnabled)
    setCelebrate(true)
    setTimeout(() => setCelebrate(false), 2000)
  }

  const handleColorClick = (c: string) => {
    setColor(c)
    setIsErasing(false)
    playSound('pop', settings.soundEnabled)
  }

  const handleBrushClick = (s: number) => {
    setBrushSize(s)
    playSound('click', settings.soundEnabled)
  }

  const handleEraser = () => {
    setIsErasing(true)
    playSound('click', settings.soundEnabled)
  }

  return (
    <GameShell
      activityId="drawing"
      title="Drawing Canvas"
      emoji="🖌️"
      onBack={onBack}
      instruction="Draw whatever you like! Pick a color and brush size, then paint."
    >
      <ConfettiBurst show={celebrate} reducedMotion={settings.reducedMotion} />

      <div className="flex-1 flex flex-col items-center gap-4">
        {/* Color palette */}
        <div className="bg-white rounded-2xl p-3 shadow-md border-2 border-fuchsia-200 w-full max-w-2xl">
          <p className="text-xs font-bold text-fuchsia-700 mb-2 text-center">
            Pick a color:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {colorPalette.map((c) => (
              <motion.button
                key={c}
                onClick={() => handleColorClick(c)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className={`w-9 h-9 rounded-full border-4 shadow transition-all ${
                  color === c && !isErasing
                    ? 'border-fuchsia-500 scale-110'
                    : 'border-white'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
            <motion.button
              onClick={handleEraser}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className={`w-9 h-9 rounded-full border-4 shadow flex items-center justify-center bg-white transition-all ${
                isErasing ? 'border-fuchsia-500 scale-110' : 'border-slate-200'
              }`}
              aria-label="Eraser"
            >
              <Eraser className="w-4 h-4 text-slate-600" />
            </motion.button>
          </div>

          {/* Brush sizes */}
          <div className="flex gap-2 justify-center items-center mt-3 pt-3 border-t border-fuchsia-100">
            <span className="text-xs font-bold text-fuchsia-700 mr-2">Size:</span>
            {brushSizes.map((s) => (
              <motion.button
                key={s}
                onClick={() => handleBrushClick(s)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`rounded-full transition-all ${
                  brushSize === s
                    ? 'bg-fuchsia-500 scale-110'
                    : 'bg-slate-200'
                }`}
                style={{ width: s + 12, height: s + 12 }}
                aria-label={`Brush size ${s}`}
              />
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="w-full max-w-2xl">
          <canvas
            ref={canvasRef}
            onPointerDown={startDraw}
            onPointerMove={draw}
            onPointerUp={stopDraw}
            onPointerLeave={stopDraw}
            className="w-full h-[400px] bg-white rounded-2xl border-4 border-fuchsia-300 shadow-lg cursor-crosshair touch-none"
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap justify-center">
          <motion.button
            onClick={clearCanvas}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2.5 bg-white text-rose-600 rounded-full font-bold border-2 border-rose-300 hover:bg-rose-50 transition-colors flex items-center gap-2 text-sm"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </motion.button>
          <motion.button
            onClick={saveDrawing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2.5 bg-fuchsia-500 text-white rounded-full font-bold hover:bg-fuchsia-600 transition-colors flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" /> Save my art
          </motion.button>
          {hasDrawn && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-4 py-2.5 bg-amber-100 text-amber-700 rounded-full font-bold border-2 border-amber-300 flex items-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" /> +3 stars for creating!
            </motion.div>
          )}
        </div>

        <p className="text-center text-xs text-fuchsia-400 max-w-md">
          You can draw anything! Try shapes, your name, or a picture of your pet. 🎨
        </p>
      </div>
    </GameShell>
  )
}
