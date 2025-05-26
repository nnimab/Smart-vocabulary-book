"use client"

import { useState, useRef, useEffect } from "react"
import { motion, PanInfo, useAnimation } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Check, X, AlertCircle } from "lucide-react"

interface FlashCardProps {
  word: string
  definition: string
  wordId?: string
  incorrectCount?: number
  onKnown?: (wordId: string) => void
  onUnknown?: (wordId: string) => void
}

export function FlashCard({ word, definition, wordId, incorrectCount = 0, onKnown, onUnknown }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const controls = useAnimation()
  const constraintsRef = useRef(null)

  // 卡片滑動方向變更後立即調用回調
  useEffect(() => {
    if (direction === "right" && wordId && onKnown) {
      // 只需要短暫延遲，確保動畫開始
      setTimeout(() => {
        onKnown(wordId);
      }, 100);
    } else if (direction === "left" && wordId && onUnknown) {
      setTimeout(() => {
        onUnknown(wordId);
      }, 100);
    }
  }, [direction, wordId, onKnown, onUnknown]);

  const handleFlip = () => {
    if (!direction) {
      setIsFlipped(!isFlipped)
    }
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100 // 滑動閾值
    
    if (info.offset.x > threshold) {
      // 右滑：熟悉
      setDirection("right")
      controls.start({ 
        x: window.innerWidth,
        opacity: 0,
        transition: { duration: 0.3 }
      });
    } else if (info.offset.x < -threshold) {
      // 左滑：不熟悉
      setDirection("left")
      controls.start({ 
        x: -window.innerWidth,
        opacity: 0,
        transition: { duration: 0.3 }
      });
    } else {
      // 回到原位
      controls.start({ x: 0, opacity: 1 })
    }
  }

  return (
    <div className="relative">
      {/* 滑動反饋提示 */}
      <div className="absolute inset-x-0 top-0 flex justify-between items-center pointer-events-none z-10 opacity-50 px-4">
        <div className={`p-2 rounded-full ${direction === "left" ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"}`}>
          <X className="h-6 w-6" />
          <span className="sr-only">不熟悉</span>
        </div>
        <div className={`p-2 rounded-full ${direction === "right" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}>
          <Check className="h-6 w-6" />
          <span className="sr-only">熟悉</span>
        </div>
      </div>

      {/* 卡片容器 */}
      <div className="perspective-1000 relative h-64 w-full cursor-pointer" onClick={handleFlip} ref={constraintsRef}>
        <motion.div
          className="relative h-full w-full transform-style-3d transition-all duration-500"
          initial={{ opacity: 1 }}
          animate={controls}
          style={{ rotateY: isFlipped ? 180 : 0 }}
          drag="x"
          dragConstraints={constraintsRef}
          onDragEnd={handleDragEnd}
          dragElastic={0.2}
          whileDrag={{ scale: 1.05 }}
        >
          {/* 正面 */}
          <Card
            className={`absolute h-full w-full backface-hidden flex items-center justify-center p-6 shadow-lg border-2 border-primary/20 bg-secondary/30 ${isFlipped ? "invisible" : "visible"}`}
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">{word}</h2>
              <p className="text-sm text-muted-foreground">點擊卡片查看定義<br/>左右滑動標記熟悉度</p>
            </div>
          </Card>

          {/* 背面 */}
          <Card
            className={`absolute h-full w-full backface-hidden flex items-center justify-center p-6 rotate-y-180 shadow-lg border-2 border-primary/20 bg-primary/5 ${isFlipped ? "visible" : "invisible"}`}
          >
            <div className="text-center">
              <p className="text-xl mb-2">{definition}</p>
              <p className="text-sm text-muted-foreground">
                點擊卡片返回<br/>
                左滑: 不熟悉 | 右滑: 熟悉
              </p>
              
              {/* 不熟悉次數標籤 */}
              {incorrectCount > 0 && (
                <div className="absolute bottom-2 right-2 flex items-center text-xs text-red-500">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <span>錯誤次數: {incorrectCount}</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
