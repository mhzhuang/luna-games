import { useEffect, useRef, useState } from 'react'
import './draw-along.css'

type DrawAlongProps = { onBack: () => void }
type Tool = 'brush' | 'eraser'

const COLORS = ['#4b287f', '#ef668f', '#ffbd3f', '#4fadd0', '#62b979', '#20265f']

function DrawAlong({ onBack }: DrawAlongProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef({ x: 0, y: 0 })
  const historyRef = useRef<string[]>([])
  const [color, setColor] = useState(COLORS[0])
  const [brushSize, setBrushSize] = useState(8)
  const [tool, setTool] = useState<Tool>('brush')
  const [guideOn, setGuideOn] = useState(true)
  const [canUndo, setCanUndo] = useState(false)
  const [finished, setFinished] = useState(false)

  const prepareCanvas = (savedImage?: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(rect.width * ratio)
    canvas.height = Math.round(rect.height * ratio)
    const context = canvas.getContext('2d')
    if (!context) return
    context.scale(ratio, ratio)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    if (savedImage) {
      const image = new Image()
      image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height)
      image.src = savedImage
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    prepareCanvas()
    const observer = new ResizeObserver(() => {
      const savedImage = canvas.width ? canvas.toDataURL() : undefined
      prepareCanvas(savedImage)
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  const pointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drawingRef.current = true
    lastPointRef.current = pointFromEvent(event)
    setFinished(false)
  }

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const point = pointFromEvent(event)
    const pressure = event.pointerType === 'pen' && event.pressure > 0 ? .55 + event.pressure * .65 : 1
    context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
    context.strokeStyle = color
    context.lineWidth = (tool === 'eraser' ? brushSize * 2.2 : brushSize) * pressure
    context.beginPath()
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y)
    context.lineTo(point.x, point.y)
    context.stroke()
    lastPointRef.current = point
  }

  const stopDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    drawingRef.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
    const snapshot = event.currentTarget.toDataURL()
    historyRef.current = [...historyRef.current, snapshot].slice(-20)
    setCanUndo(true)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    historyRef.current = []
    setCanUndo(false)
    setFinished(false)
  }

  const undo = () => {
    historyRef.current.pop()
    const previous = historyRef.current.at(-1)
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    if (previous) {
      const image = new Image()
      const rect = canvas.getBoundingClientRect()
      image.onload = () => context.drawImage(image, 0, 0, rect.width, rect.height)
      image.src = previous
    }
    setCanUndo(historyRef.current.length > 0)
  }

  return (
    <main className="draw-game">
      {finished && <div className="draw-celebration" aria-hidden="true">★ ✦ ♥ ✧ ★</div>}
      <header className="draw-header">
        <button type="button" className="draw-back" onClick={onBack}>‹ <span>游戏大厅</span></button>
        <div className="draw-title"><span>✎</span><div><strong>跟着画</strong><small>月亮小兔子</small></div></div>
        <button type="button" className="finish-button" onClick={() => setFinished(true)}>完成啦 ✓</button>
      </header>

      <section className="drawing-tools" aria-label="画画工具">
        <div className="color-tools">
          {COLORS.map((item) => (
            <button type="button" key={item} className={color === item && tool === 'brush' ? 'selected' : ''} style={{ '--paint': item } as React.CSSProperties} onClick={() => { setColor(item); setTool('brush') }} aria-label={`选择颜色 ${item}`} />
          ))}
        </div>
        <label className="size-tool">粗细 <input type="range" min="3" max="20" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} /></label>
        <div className="action-tools">
          <button type="button" className={tool === 'eraser' ? 'active' : ''} onClick={() => setTool(tool === 'eraser' ? 'brush' : 'eraser')}>橡皮擦</button>
          <button type="button" onClick={undo} disabled={!canUndo}>撤销</button>
          <button type="button" onClick={clearCanvas}>清空</button>
        </div>
      </section>

      <section className="drawing-area">
        <article className="drawing-card reference-card">
          <div className="drawing-label">看这里画</div>
          <img src="/games/draw-along/moon-bunny.jpg" alt="月亮小兔子参考画" draggable="false" />
        </article>
        <article className="drawing-card canvas-card">
          <div className="drawing-label">Luna 的画</div>
          <div className="canvas-wrap">
            {guideOn && <img src="/games/draw-along/moon-bunny.jpg" className="drawing-guide" alt="" draggable="false" />}
            <canvas
              ref={canvasRef}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              aria-label="画画区域"
            />
          </div>
        </article>
      </section>

      <footer className="draw-footer">
        <label><input type="checkbox" checked={guideOn} onChange={(event) => setGuideOn(event.target.checked)} /> 显示淡色底稿</label>
        <p>{finished ? '画得真有创意，Luna！' : '不用画得一模一样，画出你喜欢的样子吧！'}</p>
      </footer>
    </main>
  )
}

export default DrawAlong
