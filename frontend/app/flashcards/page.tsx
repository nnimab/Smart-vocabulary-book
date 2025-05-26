"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, AlertCircle, Shuffle, RefreshCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FlashCard } from "@/components/flash-card"
import { useVocabulary } from "@/hooks/use-vocabulary"

export default function FlashcardsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { currentBook, words, isLoading, updateWordFamiliarity } = useVocabulary()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCardVisible, setIsCardVisible] = useState(true)
  const [studySession, setStudySession] = useState<{
    id: string;
    startTime: Date;
    knownWords: string[];
    unknownWords: string[];
  } | null>(null)

  // 初始化學習會話
  useEffect(() => {
    if (!isLoading && words.length > 0 && !studySession) {
      const newSession = {
        id: `session-${Date.now()}`,
        startTime: new Date(),
        knownWords: [],
        unknownWords: []
      }
      setStudySession(newSession)
      
      // 在實際應用中，這裡會調用API啟動一個學習會話
      // 例如：startStudySession(currentBook.id)
    }
  }, [isLoading, words, studySession])

  // 確保每次切換到新卡片時卡片可見
  useEffect(() => {
    setIsCardVisible(true);
  }, [currentIndex])

  useEffect(() => {
    if (!isLoading && words.length === 0) {
      toast({
        title: "沒有單字",
        description: "請先添加單字或選擇單字本",
        variant: "destructive",
      })
    }
  }, [isLoading, words, toast])

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  // 處理標記為熟悉的單字
  const handleKnown = (wordId: string) => {
    if (!studySession) return

    // 更新本地會話狀態
    setStudySession({
      ...studySession,
      knownWords: [...studySession.knownWords, wordId]
    })

    // 在實際應用中，這裡會調用API記錄結果
    // 例如：recordWordResult(sessionId, wordId, true)
    
    // 更新單字熟悉度
    if (words[currentIndex] && updateWordFamiliarity) {
      updateWordFamiliarity(words[currentIndex].id, true)
      
      toast({
        title: "已標記為熟悉",
        description: `「${words[currentIndex].word}」已添加到您的熟悉單字庫`,
        variant: "default",
      })
    }
    
    // 切換到下一張卡片
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  // 處理標記為不熟悉的單字
  const handleUnknown = (wordId: string) => {
    if (!studySession) return

    // 更新本地會話狀態
    setStudySession({
      ...studySession,
      unknownWords: [...studySession.unknownWords, wordId]
    })

    // 在實際應用中，這裡會調用API記錄結果
    // 例如：recordWordResult(sessionId, wordId, false)
    
    // 更新單字熟悉度
    if (words[currentIndex] && updateWordFamiliarity) {
      updateWordFamiliarity(words[currentIndex].id, false)
      
      toast({
        title: "已標記為不熟悉",
        description: `「${words[currentIndex].word}」將更頻繁地出現在複習中`,
        variant: "default",
      })
    }
    
    // 切換到下一張卡片
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  // 結束學習會話
  const endStudySession = () => {
    if (!studySession) return

    // 在實際應用中，這裡會調用API結束會話
    // 例如：endStudySession(sessionId)

    toast({
      title: "學習會話已結束",
      description: `共學習了 ${studySession.knownWords.length + studySession.unknownWords.length} 個單字`,
      variant: "default",
    })

    // 重置會話狀態
    setStudySession(null)
  }

  // 學習進度統計
  const getProgressStats = () => {
    if (!studySession) return { total: 0, completed: 0, known: 0, unknown: 0 }

    return {
      total: words.length,
      completed: studySession.knownWords.length + studySession.unknownWords.length,
      known: studySession.knownWords.length,
      unknown: studySession.unknownWords.length
    }
  }

  const progress = getProgressStats()

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

  if (words.length === 0) {
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
        <h1 className="text-3xl font-bold">單字卡</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push("/flashcards/random")}
            className="group"
          >
            <Shuffle className="h-4 w-4 mr-2 group-hover:animate-spin" />
            隨機學習
          </Button>
          {studySession && progress.completed > 0 && (
            <Button 
              variant="outline" 
              onClick={endStudySession}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              結束會話
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold mb-2">{currentBook ? currentBook.name : "默認單字本"}</h2>
        <p className="text-muted-foreground">
          {currentIndex + 1} / {words.length}
        </p>
      </div>

      {/* 學習進度條 */}
      {studySession && (
        <div className="mb-6">
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>已學習: {progress.completed} / {progress.total}</span>
            <div className="flex gap-4">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                熟悉: {progress.known}
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                不熟悉: {progress.unknown}
              </span>
            </div>
          </div>
        </div>
      )}

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
          {words[currentIndex] && isCardVisible && (
            <FlashCard 
              word={words[currentIndex].word} 
              definition={words[currentIndex].definition} 
              wordId={words[currentIndex].id}
              incorrectCount={words[currentIndex].incorrectCount || 0}
              onKnown={handleKnown}
              onUnknown={handleUnknown}
            />
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
          className="h-12 w-12 rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
          <span className="sr-only">下一個</span>
        </Button>
      </div>

      <div className="flex justify-center">
        <div className="flex gap-1 flex-wrap max-w-lg">
          {words.map((_, index) => (
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
