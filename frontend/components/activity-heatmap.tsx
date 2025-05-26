"use client"

import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ActivityHeatmapProps {
  data: Record<string, number>
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [calendarData, setCalendarData] = useState<any[][]>([])
  const [monthLabels, setMonthLabels] = useState<string[]>([])
  const [totalContributions, setTotalContributions] = useState(0)

  useEffect(() => {
    if (!data) return

    // 計算日期範圍
    const dates = Object.keys(data).sort()
    if (dates.length === 0) return

    const startDate = new Date(dates[0])
    const endDate = new Date(dates[dates.length - 1])

    // 確保開始日期是星期日（為了對齊）
    const adjustedStartDate = new Date(startDate)
    const dayOfWeek = adjustedStartDate.getDay()
    adjustedStartDate.setDate(adjustedStartDate.getDate() - dayOfWeek)

    // 生成月份標籤
    const months: string[] = []
    const currentDate = new Date(adjustedStartDate)
    while (currentDate <= endDate) {
      const monthName = currentDate.toLocaleString("default", { month: "short" })
      if (months.length === 0 || months[months.length - 1] !== monthName) {
        months.push(monthName)
      }
      currentDate.setDate(currentDate.getDate() + 7)
    }
    setMonthLabels(months)

    // 生成日曆數據
    const calendar: any[][] = [[], [], [], [], [], [], []]
    const currentDay = new Date(adjustedStartDate)
    let total = 0

    while (currentDay <= endDate) {
      const dayOfWeek = currentDay.getDay()
      const dateStr = currentDay.toISOString().split("T")[0]
      const value = data[dateStr] || 0
      total += value

      calendar[dayOfWeek].push({
        date: new Date(currentDay),
        value,
        dateStr,
      })

      currentDay.setDate(currentDay.getDate() + 1)
    }

    setCalendarData(calendar)
    setTotalContributions(total)
  }, [data])

  // 獲取活動級別（0-4）
  const getActivityLevel = (value: number) => {
    if (value === 0) return 0
    if (value <= 2) return 1
    if (value <= 5) return 2
    if (value <= 8) return 3
    return 4
  }

  // 獲取顏色類
  const getColorClass = (level: number) => {
    switch (level) {
      case 0:
        return "bg-muted hover:bg-muted-foreground/20"
      case 1:
        return "bg-primary/20 hover:bg-primary/30"
      case 2:
        return "bg-primary/40 hover:bg-primary/50"
      case 3:
        return "bg-primary/60 hover:bg-primary/70"
      case 4:
        return "bg-primary/80 hover:bg-primary/90"
      default:
        return "bg-muted"
    }
  }

  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  if (calendarData.length === 0) {
    return <div>載入中...</div>
  }

  const dayLabels = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"]

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">{totalContributions} 個學習活動在過去一年</h3>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-muted-foreground mr-1">少</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div key={level} className={`h-3 w-3 rounded-sm ${getColorClass(level)}`} />
          ))}
          <span className="text-muted-foreground ml-1">多</span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto pb-4">
        <div className="min-w-[800px]">
          {/* 月份標籤 */}
          <div className="flex mb-2 pl-10">
            {monthLabels.map((month, i) => (
              <div key={i} className="flex-1 text-xs text-muted-foreground">
                {month}
              </div>
            ))}
          </div>

          {/* 日曆網格 */}
          <div className="flex">
            {/* 星期標籤 */}
            <div className="w-10 pt-2">
              {dayLabels.map(
                (day, i) =>
                  i % 2 === 0 && (
                    <div key={i} className="h-[11px] text-xs text-muted-foreground mb-[13px]">
                      {day}
                    </div>
                  ),
              )}
            </div>

            {/* 活動格子 */}
            <div className="flex-1 grid grid-cols-53 gap-1">
              {calendarData.map((week, weekIndex) => (
                <div key={weekIndex} className="contents">
                  {week.map((day, dayIndex) => {
                    const level = getActivityLevel(day.value)
                    return (
                      <TooltipProvider key={`${weekIndex}-${dayIndex}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`h-[10px] w-[10px] rounded-sm ${getColorClass(level)}`}
                              style={{
                                gridColumn: dayIndex + 1,
                                gridRow: weekIndex + 1,
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <div className="text-xs">
                              <div>{day.value} 個活動</div>
                              <div>{formatDate(day.date)}</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
