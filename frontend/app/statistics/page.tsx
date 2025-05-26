"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVocabulary } from "@/hooks/use-vocabulary"
import { ActivityHeatmap } from "@/components/activity-heatmap"
import { ProgressChart } from "@/components/progress-chart"
import { BookOpen, Calendar, TrendingUp, Award } from "lucide-react"

interface LearningStats {
  totalWords: number
  knownWords: number
  unknownWords: number
  masteryRate: number
  streakDays: number
  longestStreak: number
  averagePerDay: number
  studySessionCount: number
}

export default function StatisticsPage() {
  const { books, currentBookId } = useVocabulary()
  const [selectedBookId, setSelectedBookId] = useState<string>(currentBookId || "all")
  const [timeframe, setTimeframe] = useState<string>("year")
  
  // 狀態保存學習數據
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null)
  const [activityData, setActivityData] = useState<Record<string, number>>({})
  const [monthlyProgress, setMonthlyProgress] = useState<any[]>([])
  const [memoryCurve, setMemoryCurve] = useState<any>({
    standardCurve: [],
    userCurve: []
  })
  const [isLoading, setIsLoading] = useState(true)

  // 基於選中的單字本和用戶數據計算統計信息
  useEffect(() => {
    const calculateStats = () => {
      setIsLoading(true)
      
      try {
        // 基於所選單字本過濾數據
        const booksToAnalyze = selectedBookId === "all" 
          ? books 
          : books.filter(book => book.id === selectedBookId)
        
        if (booksToAnalyze.length === 0) {
          setIsLoading(false)
          return
        }
        
        // 收集所有單字
        let allWords: any[] = []
        let studySessionCount = 0
        
        booksToAnalyze.forEach(book => {
          allWords = [...allWords, ...book.words]
          // 模擬會話次數 - 在實際應用中會從API獲取
          studySessionCount += Math.floor(book.words.length * 0.8)
        })
        
        // 基礎統計
        const totalWords = allWords.length
        const knownWords = allWords.filter(word => word.isKnown).length
        const unknownWords = totalWords - knownWords
        const masteryRate = totalWords > 0 ? Math.round((knownWords / totalWords) * 100) : 0
        
        // 生成活動數據（基於單字最後復習時間）
        const activityMap: Record<string, number> = {}
        
        // 獲取時間範圍
        const now = new Date()
        const startDate = new Date()
        
        if (timeframe === "month") {
          startDate.setMonth(now.getMonth() - 1)
        } else if (timeframe === "quarter") {
          startDate.setMonth(now.getMonth() - 3)
        } else if (timeframe === "year") {
          startDate.setFullYear(now.getFullYear() - 1)
        } else {
          // 全部時間 - 假設最長3年
          startDate.setFullYear(now.getFullYear() - 3)
        }
        
        // 為時間範圍內的每一天初始化數據
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split("T")[0]
          activityMap[dateStr] = 0
        }
        
        // 根據單字的複習歷史填充活動數據
        allWords.forEach(word => {
          if (word.lastReviewedAt) {
            const reviewDate = new Date(word.lastReviewedAt)
            if (reviewDate >= startDate && reviewDate <= now) {
              const dateStr = reviewDate.toISOString().split("T")[0]
              activityMap[dateStr] = (activityMap[dateStr] || 0) + 1
            }
          }
        })
        
        // 計算學習連續性
        const activeDates = Object.entries(activityMap)
          .filter(([_, count]) => count > 0)
          .map(([date]) => date)
          .sort()
        
        let currentStreak = 0
        let longestStreak = 0
        let lastActiveDate: Date | null = null
        
        activeDates.forEach(dateStr => {
          const currentDate = new Date(dateStr)
          
          if (lastActiveDate) {
            const diffTime = currentDate.getTime() - lastActiveDate.getTime()
            const diffDays = diffTime / (1000 * 3600 * 24)
            
            if (diffDays === 1) {
              // 連續學習
              currentStreak += 1
            } else {
              // 中斷了，重新計數
              currentStreak = 1
            }
          } else {
            currentStreak = 1
          }
          
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak
          }
          
          lastActiveDate = currentDate
        })
        
        // 檢查今天是否學習過
        const today = new Date().toISOString().split("T")[0]
        const streakDays = activityMap[today] > 0 ? currentStreak : 0
        
        // 計算每日平均學習量
        const activeDaysCount = activeDates.length || 1
        const averagePerDay = totalWords / activeDaysCount
        
        // 更新統計數據
        setLearningStats({
          totalWords,
          knownWords,
          unknownWords,
          masteryRate,
          streakDays,
          longestStreak,
          averagePerDay: Math.round(averagePerDay * 10) / 10,
          studySessionCount
        })
        
        // 更新活動熱圖數據
        setActivityData(activityMap)
        
        // 生成月度進度數據
        const monthlyData: Record<string, {learned: number, mastered: number}> = {}
        
        // 初始化過去12個月的數據
        for (let i = 0; i < 12; i++) {
          const monthDate = new Date()
          monthDate.setMonth(monthDate.getMonth() - i)
          const monthKey = monthDate.toISOString().slice(0, 7) // YYYY-MM
          monthlyData[monthKey] = { learned: 0, mastered: 0 }
        }
        
        // 基於單字的創建和掌握時間填充月度數據
        allWords.forEach(word => {
          // 使用單字的創建時間作為學習時間
          if (word.createdAt) {
            const createdDate = new Date(word.createdAt)
            const monthKey = createdDate.toISOString().slice(0, 7)
            
            if (monthlyData[monthKey]) {
              monthlyData[monthKey].learned += 1
            }
          }
          
          // 對於已掌握的單字，使用最後複習時間作為掌握時間
          if (word.isKnown && word.lastReviewedAt) {
            const masteredDate = new Date(word.lastReviewedAt)
            const monthKey = masteredDate.toISOString().slice(0, 7)
            
            if (monthlyData[monthKey]) {
              monthlyData[monthKey].mastered += 1
            }
          }
        })
        
        // 轉換為圖表格式並排序
        const progressData = Object.entries(monthlyData).map(([month, data]) => {
          return {
            month: new Date(month).toLocaleString("default", { month: "short" }),
            learned: data.learned,
            mastered: data.mastered
          }
        })
        
        // 按時間順序排序
        progressData.sort((a, b) => {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          return months.indexOf(a.month) - months.indexOf(b.month)
        })
        
        setMonthlyProgress(progressData)
        
        // 生成艾賓浩斯遺忘曲線數據
        // 標準曲線
        const standardCurve = [
          { day: 0, retention: 100 },
          { day: 1, retention: 70 },
          { day: 2, retention: 60 },
          { day: 4, retention: 50 },
          { day: 7, retention: 40 },
          { day: 14, retention: 30 },
          { day: 30, retention: 20 },
          { day: 60, retention: 15 },
          { day: 90, retention: 10 }
        ]
        
        // 計算用戶實際記憶曲線 (基於單字熟悉度)
        // 在實際應用中，這應該從API獲取更準確的數據
        const userCurve = standardCurve.map(point => {
          // 使用單字熟悉度計算實際保留率
          // 熟悉度越高的單字，實際保留率越高
          let actualRetention = point.retention
          
          const knownRatio = knownWords / (totalWords || 1)
          
          // 根據用戶掌握率微調曲線
          if (knownRatio > 0.7) {
            // 學習效果好，記憶曲線更平緩
            actualRetention = Math.min(100, point.retention + 10)
          } else if (knownRatio < 0.3) {
            // 學習效果差，記憶曲線更陡峭
            actualRetention = Math.max(0, point.retention - 10)
          }
          
          return { day: point.day, retention: actualRetention }
        })
        
        setMemoryCurve({
          standardCurve,
          userCurve
        })
        
      } catch (error) {
        console.error("統計數據計算錯誤:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    calculateStats()
  }, [books, selectedBookId, timeframe])

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

  return (
    <div className="container py-8 px-4 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">學習統計</h1>
        <p className="text-muted-foreground">追蹤您的學習進度和活動模式</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="w-full md:w-1/2">
          <Select value={selectedBookId} onValueChange={setSelectedBookId}>
            <SelectTrigger>
              <SelectValue placeholder="選擇單字本" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有單字本</SelectItem>
              {books.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="選擇時間範圍" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">過去30天</SelectItem>
              <SelectItem value="quarter">過去3個月</SelectItem>
              <SelectItem value="year">過去一年</SelectItem>
              <SelectItem value="all">全部時間</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">總學習單字</p>
                <p className="text-2xl font-bold">{learningStats?.totalWords || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">連續學習天數</p>
                <p className="text-2xl font-bold">{learningStats?.streakDays || 0} 天</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">掌握率</p>
                <p className="text-2xl font-bold">{learningStats?.masteryRate || 0}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">每日平均</p>
                <p className="text-2xl font-bold">{learningStats?.averagePerDay || 0} 個</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="activity">活躍度報表</TabsTrigger>
          <TabsTrigger value="progress">學習進度</TabsTrigger>
          <TabsTrigger value="memory">記憶曲線</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>學習活躍度</CardTitle>
              <CardDescription>過去一年的學習活動記錄，顏色越深表示學習量越大</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHeatmap data={activityData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>單字學習進度</CardTitle>
              <CardDescription>每月學習和掌握的單字數量</CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressChart data={monthlyProgress} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory">
          <Card>
            <CardHeader>
              <CardTitle>記憶曲線</CardTitle>
              <CardDescription>根據艾賓浩斯遺忘曲線，顯示單字記憶保留率</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <MemoryCurve 
                  standardCurve={memoryCurve.standardCurve} 
                  userCurve={memoryCurve.userCurve} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// 記憶曲線組件
function MemoryCurve({ 
  standardCurve, 
  userCurve 
}: { 
  standardCurve: { day: number; retention: number }[],
  userCurve: { day: number; retention: number }[]
}) {
  // 找出最大天數，用於計算比例
  const maxDay = Math.max(
    ...standardCurve.map((d) => d.day),
    ...userCurve.map((d) => d.day)
  )

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 relative">
        {/* Y軸標籤 */}
        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-muted-foreground">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* 網格線 */}
        <div className="absolute left-10 right-0 top-0 bottom-0">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="absolute left-0 right-0 border-t border-dashed border-muted"
              style={{ top: `${100 - percent}%` }}
            />
          ))}
        </div>

        {/* SVG圖表 */}
        <svg className="absolute left-10 right-0 top-0 bottom-0 w-[calc(100%-2.5rem)] h-full">
          <defs>
            <linearGradient id="standard-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--muted-foreground))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(var(--muted-foreground))" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="user-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 標準曲線 */}
          <path
            d={`
              M ${(standardCurve[0].day / maxDay) * 100}% ${100 - standardCurve[0].retention}%
              ${standardCurve.map((d) => `L ${(d.day / maxDay) * 100}% ${100 - d.retention}%`).join(" ")}
            `}
            fill="none"
            stroke="rgb(var(--muted-foreground))"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* 用戶實際曲線 - 填充區域 */}
          <path
            d={`
              M ${(userCurve[0].day / maxDay) * 100}% ${100 - userCurve[0].retention}%
              ${userCurve.map((d) => `L ${(d.day / maxDay) * 100}% ${100 - d.retention}%`).join(" ")}
              L ${(userCurve[userCurve.length - 1].day / maxDay) * 100}% 100%
              L ${(userCurve[0].day / maxDay) * 100}% 100%
              Z
            `}
            fill="url(#user-gradient)"
          />

          {/* 用戶實際曲線 - 線條 */}
          <path
            d={`
              M ${(userCurve[0].day / maxDay) * 100}% ${100 - userCurve[0].retention}%
              ${userCurve.map((d) => `L ${(d.day / maxDay) * 100}% ${100 - d.retention}%`).join(" ")}
            `}
            fill="none"
            stroke="rgb(var(--primary))"
            strokeWidth="2"
          />

          {/* 用戶實際曲線 - 數據點 */}
          {userCurve.map((d, i) => (
            <circle
              key={i}
              cx={`${(d.day / maxDay) * 100}%`}
              cy={`${100 - d.retention}%`}
              r="4"
              fill="white"
              stroke="rgb(var(--primary))"
              strokeWidth="2"
            />
          ))}
        </svg>

        {/* 圖例 */}
        <div className="absolute right-0 top-0 flex items-center gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-1 bg-primary mr-1"></div>
            <span>您的記憶曲線</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-1 border-t border-dashed border-muted-foreground mr-1"></div>
            <span>標準曲線</span>
          </div>
        </div>
      </div>

      {/* X軸標籤 */}
      <div className="h-8 ml-10 flex justify-between text-xs text-muted-foreground">
        {standardCurve.map((d, i) => (
          <div key={i} style={{ width: `${100 / standardCurve.length}%` }}>
            {d.day} 天
          </div>
        ))}
      </div>
    </div>
  )
}
