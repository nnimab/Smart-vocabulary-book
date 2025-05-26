"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "./use-toast"

interface Word {
  id: string
  word: string
  definition: string
  familiarity?: number // 熟悉度等級 (0-5)
  isKnown?: boolean // 是否已掌握
  lastReviewedAt?: Date // 上次複習時間
  nextReviewAt?: Date // 下次推薦複習時間
  incorrectCount?: number // 標記為不熟悉的次數
}

interface VocabularyBook {
  id: string
  name: string
  words: Word[]
}

interface VocabularyContextType {
  books: VocabularyBook[]
  currentBookId: string | null
  currentBook: VocabularyBook | null
  words: Word[]
  isLoading: boolean
  addBook: (book: VocabularyBook) => void
  removeBook: (bookId: string) => void
  setCurrentBook: (bookId: string) => void
  addWord: (bookId: string, word: Word) => void
  removeWord: (bookId: string, wordId: string) => void
  addWordsFromCSV: (bookId: string, words: Word[]) => void
  updateWordFamiliarity: (wordId: string, isKnown: boolean) => void // 新增熟悉度更新功能
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined)

export function VocabularyProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [books, setBooks] = useState<VocabularyBook[]>([])
  const [currentBookId, setCurrentBookId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 確定用戶是否已登入
  const isAuthenticated = status === "authenticated"
  const userEmail = session?.user?.email

  // 從 API 加載數據
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        if (isAuthenticated && userEmail) {
          // 從 API 獲取單字本
          const response = await fetch('/api/vocabulary')
          if (!response.ok) {
            throw new Error("獲取單字本失敗")
          }
          const data = await response.json()
          setBooks(data.books || [])

          // 獲取當前單字本ID
          const currentBookResponse = await fetch('/api/vocabulary/current-book')
          if (currentBookResponse.ok) {
            const currentBookData = await currentBookResponse.json()
            setCurrentBookId(currentBookData.currentBookId)
          }
        } else if (status === "unauthenticated") {
          // 訪客模式：使用 localStorage
          const storedBooks = localStorage.getItem("vocabulary-books")
          const storedCurrentBookId = localStorage.getItem("current-book-id")

          if (storedBooks) {
            setBooks(JSON.parse(storedBooks))
          } else {
            // 創建默認單字本
            const defaultBook: VocabularyBook = {
              id: "default",
              name: "默認單字本",
              words: [
                { id: "1", word: "apple", definition: "蘋果", isKnown: false, familiarity: 0 },
                { id: "2", word: "banana", definition: "香蕉", isKnown: false, familiarity: 0 },
                { id: "3", word: "orange", definition: "橙子", isKnown: false, familiarity: 0 },
              ],
            }
            setBooks([defaultBook])
          }

          if (storedCurrentBookId) {
            setCurrentBookId(storedCurrentBookId)
          } else if (books.length > 0) {
            setCurrentBookId(books[0].id)
          }
        }
      } catch (error) {
        console.error("Error loading vocabulary data:", error)
        toast({
          title: "讀取單字本失敗",
          description: "無法讀取您的單字本數據",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    // 只有在會話狀態變化或用戶登入/登出時重新加載
    if (status !== "loading") {
      loadData()
    }
  }, [status, userEmail, toast])

  // 保存數據
  useEffect(() => {
    const saveData = async () => {
      if (isLoading) return

      try {
        if (isAuthenticated && userEmail) {
          // 登入用戶：使用 API 保存
          const response = await fetch('/api/vocabulary', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ books }),
          })

          if (!response.ok) {
            throw new Error("保存單字本失敗")
          }

          // 保存當前單字本ID
          if (currentBookId) {
            await fetch('/api/vocabulary/current-book', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ currentBookId }),
            })
          }
        } else {
          // 訪客模式：使用 localStorage
          localStorage.setItem("vocabulary-books", JSON.stringify(books))
          if (currentBookId) {
            localStorage.setItem("current-book-id", currentBookId)
          }
        }
      } catch (error) {
        console.error("Error saving vocabulary data:", error)
        toast({
          title: "保存單字本失敗",
          description: "無法保存您的單字本數據",
          variant: "destructive",
        })
      }
    }

    // 每次 books 或 currentBookId 變更時保存
    if (!isLoading) {
      saveData()
    }
  }, [books, currentBookId, isAuthenticated, userEmail, isLoading, toast])

  const currentBook = books.find((book) => book.id === currentBookId) || null
  const words = currentBook?.words || []

  const addBook = async (book: VocabularyBook) => {
    try {
      if (isAuthenticated && userEmail) {
        // 登入用戶：通過 API 添加單字本
        const response = await fetch('/api/vocabulary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ book }),
        })

        if (!response.ok) {
          throw new Error("添加單字本失敗")
        }

        const data = await response.json()
        setBooks(data.books || [])
      } else {
        // 訪客模式：直接更新狀態
        setBooks((prev) => [...prev, book])
      }

      if (!currentBookId) {
        setCurrentBook(book.id)
      }
    } catch (error) {
      console.error("Error adding vocabulary book:", error)
      toast({
        title: "添加單字本失敗",
        description: "無法添加新的單字本",
        variant: "destructive",
      })
    }
  }

  const removeBook = (bookId: string) => {
    setBooks((prev) => prev.filter((book) => book.id !== bookId))
    if (currentBookId === bookId) {
      const remainingBooks = books.filter((book) => book.id !== bookId)
      setCurrentBookId(remainingBooks.length > 0 ? remainingBooks[0].id : null)
    }
  }

  const setCurrentBook = (bookId: string) => {
    setCurrentBookId(bookId)
  }

  const addWord = (bookId: string, word: Word) => {
    // 確保單字有初始熟悉度設置
    const wordWithFamiliarity = {
      ...word,
      familiarity: word.familiarity || 0,
      isKnown: word.isKnown || false,
    }
    
    setBooks((prev) => prev.map((book) => (book.id === bookId ? { ...book, words: [...book.words, wordWithFamiliarity] } : book)))
  }

  const removeWord = (bookId: string, wordId: string) => {
    setBooks((prev) =>
      prev.map((book) => (book.id === bookId ? { ...book, words: book.words.filter((w) => w.id !== wordId) } : book)),
    )
  }

  const addWordsFromCSV = (bookId: string, newWords: Word[]) => {
    // 確保所有單字都有初始熟悉度設置
    const wordsWithFamiliarity = newWords.map(word => ({
      ...word,
      familiarity: word.familiarity || 0,
      isKnown: word.isKnown || false,
    }))
    
    setBooks((prev) =>
      prev.map((book) => (book.id === bookId ? { ...book, words: [...book.words, ...wordsWithFamiliarity] } : book)),
    )
  }

  // 更新單字熟悉度
  const updateWordFamiliarity = async (wordId: string, isKnown: boolean) => {
    if (!currentBookId) return

    try {
      // 找到單字
      const updatedBooks = books.map(book => {
        if (book.id !== currentBookId) return book

        const updatedWords = book.words.map(word => {
          if (word.id !== wordId) return word

          // 更新熟悉度
          const now = new Date()
          let newFamiliarity = word.familiarity || 0
          let incorrectCount = word.incorrectCount || 0

          if (isKnown) {
            // 熟悉：增加熟悉度
            newFamiliarity = Math.min(5, newFamiliarity + 1)
          } else {
            // 不熟悉：降低熟悉度
            newFamiliarity = Math.max(0, newFamiliarity - 1)
            // 增加不熟悉計數
            incorrectCount += 1
          }

          // 計算下次複習時間（根據艾賓浩斯曲線）
          const intervals = [1, 2, 4, 7, 15, 30] // 間隔天數
          const interval = intervals[Math.min(newFamiliarity, intervals.length - 1)]
          
          const nextReviewDate = new Date(now)
          nextReviewDate.setDate(now.getDate() + interval)

          return {
            ...word,
            isKnown: isKnown || newFamiliarity >= 4, // 達到4級以上視為熟悉
            familiarity: newFamiliarity,
            incorrectCount: incorrectCount,
            lastReviewedAt: now,
            nextReviewAt: nextReviewDate
          }
        })

        return { ...book, words: updatedWords }
      })

      setBooks(updatedBooks)

      // 如果已登入，也通過 API 更新
      if (isAuthenticated && userEmail) {
        await fetch(`/api/words/${wordId}/familiarity`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isKnown }),
        })
      }
    } catch (error) {
      console.error("Error updating word familiarity:", error)
      toast({
        title: "更新單字熟悉度失敗",
        description: "無法更新單字熟悉度",
        variant: "destructive",
      })
    }
  }

  return (
    <VocabularyContext.Provider
      value={{
        books,
        currentBookId,
        currentBook,
        words,
        isLoading,
        addBook,
        removeBook,
        setCurrentBook,
        addWord,
        removeWord,
        addWordsFromCSV,
        updateWordFamiliarity,
      }}
    >
      {children}
    </VocabularyContext.Provider>
  )
}

export function useVocabulary() {
  const context = useContext(VocabularyContext)
  if (context === undefined) {
    throw new Error("useVocabulary must be used within a VocabularyProvider")
  }
  return context
}
