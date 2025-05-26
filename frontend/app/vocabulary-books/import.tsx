"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FileUp, File, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useVocabulary } from "@/hooks/use-vocabulary"

type ImportMethod = "text" | "csv" | "file"

interface ImportDialogProps {
  bookId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportDialog({ bookId, open, onOpenChange }: ImportDialogProps) {
  const { toast } = useToast()
  const { addWordsFromCSV } = useVocabulary()
  const [method, setMethod] = useState<ImportMethod>("text")
  const [text, setText] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)

  const resetForm = () => {
    setText("")
    setFile(null)
    setIsImporting(false)
    setProgress(0)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const parseCSVText = (csvText: string) => {
    const lines = csvText.trim().split("\n")
    const words = []

    for (let i = 0; i < lines.length; i++) {
      // 忽略空行
      if (!lines[i].trim()) continue

      // 嘗試解析CSV格式 (word,definition)
      const parts = lines[i].split(",")
      
      if (parts.length >= 2) {
        const word = parts[0].trim()
        const definition = parts.slice(1).join(",").trim()
        
        if (word && definition) {
          words.push({
            id: `import-${Date.now()}-${i}`,
            word,
            definition,
            familiarity: 0,
            isKnown: false
          })
        }
      }
    }

    return words
  }

  const parseTextFormat = (text: string) => {
    const lines = text.trim().split("\n")
    const words = []

    for (let i = 0; i < lines.length; i++) {
      // 忽略空行
      if (!lines[i].trim()) continue
      
      // 嘗試解析不同格式: 空格分隔、冒號分隔、制表符分隔
      let word, definition
      
      if (lines[i].includes(":")) {
        // 冒號分隔 (word: definition)
        [word, definition] = lines[i].split(":", 2).map(part => part.trim())
      } else if (lines[i].includes("\t")) {
        // 制表符分隔 (word\tdefinition)
        [word, definition] = lines[i].split("\t", 2).map(part => part.trim())
      } else {
        // 空格分隔 (word definition)
        const parts = lines[i].trim().split(" ")
        word = parts[0]
        definition = parts.slice(1).join(" ")
      }

      if (word && definition) {
        words.push({
          id: `import-${Date.now()}-${i}`,
          word,
          definition,
          familiarity: 0,
          isKnown: false
        })
      }
    }

    return words
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
    }
  }

  const handleImport = async () => {
    try {
      setIsImporting(true)
      setProgress(10)

      let words = []

      if (method === "file" && file) {
        // 讀取文件內容
        const fileContent = await file.text()
        setProgress(30)
        
        // 根據文件類型解析
        if (file.name.endsWith(".csv")) {
          words = parseCSVText(fileContent)
        } else {
          words = parseTextFormat(fileContent)
        }
      } else if (method === "csv") {
        // 解析CSV文本
        words = parseCSVText(text)
      } else {
        // 解析自由格式文本
        words = parseTextFormat(text)
      }

      setProgress(60)

      if (words.length === 0) {
        toast({
          title: "無法導入單字",
          description: "找不到有效的單字數據，請檢查您的輸入格式",
          variant: "destructive",
        })
        setIsImporting(false)
        setProgress(0)
        return
      }

      // 導入單字
      addWordsFromCSV(bookId, words)
      
      setProgress(100)

      toast({
        title: "導入成功",
        description: `成功導入了 ${words.length} 個單字`,
      })

      // 延遲關閉對話框，讓用戶看到成功消息
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (error) {
      console.error("單字導入錯誤:", error)
      toast({
        title: "導入失敗",
        description: "處理單字數據時出錯，請檢查格式後重試",
        variant: "destructive",
      })
      setIsImporting(false)
      setProgress(0)
    }
  }

  const renderExample = () => {
    if (method === "csv") {
      return (
        <div className="text-xs text-muted-foreground mt-2">
          <p>範例格式 (CSV):</p>
          <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">
            {`apple,蘋果\nbanana,香蕉\ncherry,櫻桃`}
          </pre>
        </div>
      )
    }
    
    return (
      <div className="text-xs text-muted-foreground mt-2">
        <p>支持的格式:</p>
        <pre className="bg-muted p-2 rounded mt-1 overflow-x-auto">
          {`word definition\nword: definition\nword\tdefinition`}
        </pre>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>批量導入單字</DialogTitle>
          <DialogDescription>
            導入多個單字到您的單字本。支持多種格式。
          </DialogDescription>
        </DialogHeader>

        <Tabs value={method} onValueChange={(v) => setMethod(v as ImportMethod)} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text">文本輸入</TabsTrigger>
            <TabsTrigger value="csv">CSV格式</TabsTrigger>
            <TabsTrigger value="file">文件上傳</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">輸入單字和定義</Label>
              <Textarea
                id="text-input"
                placeholder="輸入單字和定義，每行一個單字"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                disabled={isImporting}
              />
              {renderExample()}
            </div>
          </TabsContent>
          
          <TabsContent value="csv" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="csv-input">CSV格式 (word,definition)</Label>
              <Textarea
                id="csv-input"
                placeholder="apple,蘋果&#10;banana,香蕉&#10;cherry,櫻桃"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                disabled={isImporting}
              />
              {renderExample()}
            </div>
          </TabsContent>
          
          <TabsContent value="file" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>上傳文件 (.txt, .csv)</Label>
              {!file ? (
                <div className="border-2 border-dashed rounded-md p-8 text-center">
                  <FileUp className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    拖放文件到此處，或點擊選擇文件
                  </p>
                  <Button variant="outline" asChild>
                    <label>
                      選擇文件
                      <input
                        type="file"
                        accept=".txt,.csv"
                        className="sr-only"
                        onChange={handleFileUpload}
                        disabled={isImporting}
                      />
                    </label>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[270px]">{file.name}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setFile(null)}
                    disabled={isImporting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                支持的文件：.txt（文本格式），.csv（CSV格式）
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {isImporting && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">正在處理單字數據...</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            取消
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isImporting || (method !== "file" && !text) || (method === "file" && !file)}
          >
            導入單字
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 