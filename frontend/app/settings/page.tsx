"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useVocabulary } from "@/hooks/use-vocabulary"
import { Upload, Save, FileText } from "lucide-react"

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const bookId = searchParams.get("bookId")
  const { toast } = useToast()
  const { books, currentBookId, addWord, addWordsFromCSV } = useVocabulary()

  const [selectedBookId, setSelectedBookId] = useState(bookId || currentBookId || "")
  const [word, setWord] = useState("")
  const [definition, setDefinition] = useState("")
  const [csvContent, setCsvContent] = useState("")

  useEffect(() => {
    if (bookId) {
      setSelectedBookId(bookId)
    } else if (currentBookId) {
      setSelectedBookId(currentBookId)
    }
  }, [bookId, currentBookId])

  const handleAddWord = () => {
    if (!selectedBookId) {
      toast({
        title: "錯誤",
        description: "請先選擇一個單字本",
        variant: "destructive",
      })
      return
    }

    if (word.trim() && definition.trim()) {
      addWord(selectedBookId, {
        id: Date.now().toString(),
        word: word.trim(),
        definition: definition.trim(),
      })
      setWord("")
      setDefinition("")
      toast({
        title: "成功",
        description: "單字已添加到單字本",
      })
    } else {
      toast({
        title: "錯誤",
        description: "單字和定義不能為空",
        variant: "destructive",
      })
    }
  }

  const handleImportCSV = () => {
    if (!selectedBookId) {
      toast({
        title: "錯誤",
        description: "請先選擇一個單字本",
        variant: "destructive",
      })
      return
    }

    if (!csvContent.trim()) {
      toast({
        title: "錯誤",
        description: "CSV內容不能為空",
        variant: "destructive",
      })
      return
    }

    try {
      // 簡單的CSV解析，格式：單字,定義
      const lines = csvContent.trim().split("\n")
      const words = lines.map((line) => {
        const [word, definition] = line.split(",").map((item) => item.trim())
        if (!word || !definition) {
          throw new Error("CSV格式錯誤")
        }
        return {
          id: Date.now() + Math.random().toString(),
          word,
          definition,
        }
      })

      addWordsFromCSV(selectedBookId, words)
      setCsvContent("")
      toast({
        title: "成功",
        description: `已導入 ${words.length} 個單字`,
      })
    } catch (error) {
      toast({
        title: "錯誤",
        description: "CSV格式錯誤，請確保每行的格式為：單字,定義",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setCsvContent(content)
    }
    reader.readAsText(file)
  }

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">單字設定</h1>

      <div className="mb-6">
        <Label htmlFor="book-select">選擇單字本</Label>
        <Select value={selectedBookId} onValueChange={setSelectedBookId}>
          <SelectTrigger id="book-select" className="w-full">
            <SelectValue placeholder="選擇單字本" />
          </SelectTrigger>
          <SelectContent>
            {books.map((book) => (
              <SelectItem key={book.id} value={book.id}>
                {book.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="add" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">添加單字</TabsTrigger>
          <TabsTrigger value="import">匯入CSV</TabsTrigger>
        </TabsList>
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>添加新單字</CardTitle>
              <CardDescription>手動添加單字和定義到您選擇的單字本</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="word">單字</Label>
                <Input id="word" value={word} onChange={(e) => setWord(e.target.value)} placeholder="輸入單字" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="definition">定義</Label>
                <Textarea
                  id="definition"
                  value={definition}
                  onChange={(e) => setDefinition(e.target.value)}
                  placeholder="輸入定義或翻譯"
                  rows={4}
                />
              </div>
              <Button onClick={handleAddWord} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                保存單字
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>匯入CSV</CardTitle>
              <CardDescription>從CSV文件匯入單字，格式：單字,定義</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-file">上傳CSV文件</Label>
                <div className="flex items-center gap-2">
                  <Input id="csv-file" type="file" accept=".csv,.txt" onChange={handleFileUpload} className="flex-1" />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="csv-content">CSV內容</Label>
                <Textarea
                  id="csv-content"
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder="單字1,定義1
單字2,定義2
..."
                  rows={8}
                />
              </div>
              <Button onClick={handleImportCSV} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                匯入單字
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
