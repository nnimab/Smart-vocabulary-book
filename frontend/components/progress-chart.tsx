"use client"

import { useEffect, useRef } from "react"

interface ProgressChartProps {
  data: {
    month: string
    learned: number
    mastered: number
  }[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 設置畫布大小
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // 圖表尺寸
    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 20, bottom: 40, left: 60 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // 找出最大值
    const maxValue = Math.max(...data.map((d) => d.learned))
    const yMax = Math.ceil(maxValue / 20) * 20 + 20 // 向上取整到最接近的20的倍數，再加20作為間距

    // 清除畫布
    ctx.clearRect(0, 0, width, height)

    // 繪製網格線和Y軸標籤
    ctx.strokeStyle = "#e5e7eb" // 淺灰色
    ctx.lineWidth = 1
    ctx.beginPath()

    // 水平網格線
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + chartHeight - (i * chartHeight) / 5
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartWidth, y)

      // Y軸標籤
      const value = Math.round((i * yMax) / 5)
      ctx.fillStyle = "#6b7280" // 灰色文字
      ctx.font = "12px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(value.toString(), padding.left - 10, y + 4)
    }
    ctx.stroke()

    // X軸標籤和刻度
    data.forEach((d, i) => {
      const x = padding.left + (i * chartWidth) / (data.length - 1)

      // 刻度線
      ctx.beginPath()
      ctx.moveTo(x, padding.top + chartHeight)
      ctx.lineTo(x, padding.top + chartHeight + 5)
      ctx.stroke()

      // 標籤
      ctx.fillStyle = "#6b7280"
      ctx.font = "12px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(d.month, x, padding.top + chartHeight + 20)
    })

    // 繪製學習柱狀圖
    const barWidth = chartWidth / data.length / 3
    data.forEach((d, i) => {
      const x = padding.left + (i * chartWidth) / (data.length - 1) - barWidth / 2
      const learnedHeight = (d.learned / yMax) * chartHeight
      const masteredHeight = (d.mastered / yMax) * chartHeight

      // 學習柱狀
      ctx.fillStyle = "rgba(var(--primary), 0.2)"
      ctx.fillRect(x - barWidth / 2, padding.top + chartHeight - learnedHeight, barWidth, learnedHeight)

      // 掌握柱狀
      ctx.fillStyle = "rgba(var(--primary), 0.8)"
      ctx.fillRect(x + barWidth / 2, padding.top + chartHeight - masteredHeight, barWidth, masteredHeight)
    })

    // 繪製圖例
    const legendX = padding.left
    const legendY = padding.top - 5

    // 學習圖例
    ctx.fillStyle = "rgba(var(--primary), 0.2)"
    ctx.fillRect(legendX, legendY, 15, 15)
    ctx.fillStyle = "#6b7280"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("學習", legendX + 20, legendY + 12)

    // 掌握圖例
    ctx.fillStyle = "rgba(var(--primary), 0.8)"
    ctx.fillRect(legendX + 80, legendY, 15, 15)
    ctx.fillStyle = "#6b7280"
    ctx.fillText("掌握", legendX + 100, legendY + 12)
  }, [data, canvasRef])

  return (
    <div className="w-full h-80">
      <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
    </div>
  )
}
