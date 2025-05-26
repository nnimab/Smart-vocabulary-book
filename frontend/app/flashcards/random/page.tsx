"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Shuffle, AlertCircle, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FlashCard } from "@/components/flash-card"
import { useVocabulary } from "@/hooks/use-vocabulary"

export default function RandomFlashcardsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { currentBook, words, isLoading } = useVocabulary()
  const [randomWords, setRandomWords] = useState<typeof words>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // 生成隨機排序的單字
  const generateRandomWords = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5)
    setRandomWords(shuffled)
    setCurrentIndex(0)
    
    toast({
      title: "已重新洗牌",
      description: "單字順序已隨機重新排列",
    })
  }

  // 初始化隨機單字
  useEffect(() => {
    if (!isLoading && words.length > 0) {
      generateRandomWords()
    }
  }, [isLoading, words])

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < randomWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">載入中...</p>
        </div>
      </div>
    )
  }

  if (randomWords.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Card className="w-full max-w-md p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">沒有單字</h2>
          <p className="text-muted-foreground mb-4">您需要先添加單字或選擇單字本</p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => router.push("/settings")}>添加單字</Button>
            <Button variant="outline" onClick={() => router.push("/vocabulary-books")}>
              選擇單字本
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/flashcards")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回正常模式
        </Button>
        <h1 className="text-3xl font-bold text-center flex-grow">隨機學習模式</h1>
        <Button variant="outline" onClick={generateRandomWords}>
          <Shuffle className="h-4 w-4 mr-2" />
          重新洗牌
        </Button>
      </div>
      
      <div className="mb-4 text-center">
        <h2 className="text-xl font-semibold mb-2">{currentBook ? currentBook.name : "默認單字本"}</h2>
        <p className="text-muted-foreground">
          {currentIndex + 1} / {randomWords.length}
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="h-12 w-12 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="sr-only">上一個</span>
        </Button>

        <div className="w-full max-w-md">
          {randomWords[currentIndex] && (
            <FlashCard word={randomWords[currentIndex].word} definition={randomWords[currentIndex].definition} />
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === randomWords.length - 1}
          className="h-12 w-12 rounded-full"
        >
          <ChevronLeft className="h-6 w-6 transform rotate-180" />
          <span className="sr-only">下一個</span>
        </Button>
      </div>

      <div className="flex justify-center">
        <div className="flex gap-1 flex-wrap max-w-lg">
          {randomWords.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-6 rounded-full transition-all ${
                index === currentIndex ? "bg-primary" : "bg-muted hover:bg-muted-foreground/50"
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`跳到第 ${index + 1} 個單字`}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 