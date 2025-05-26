"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Book, Plus, Edit, Trash, Upload } from "lucide-react"
import { useVocabulary } from "@/hooks/use-vocabulary"
import { ImportDialog } from "./import"

export default function VocabularyBooksPage() {
  const router = useRouter()
  const { books, currentBookId, addBook, removeBook, setCurrentBook } = useVocabulary()
  const [newBookName, setNewBookName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)

  const handleAddBook = () => {
    if (newBookName.trim()) {
      addBook({ id: Date.now().toString(), name: newBookName.trim(), words: [] })
      setNewBookName("")
      setIsDialogOpen(false)
    }
  }

  const handleSelectBook = (bookId: string) => {
    setCurrentBook(bookId)
    router.push("/")
  }

  const handleOpenImportDialog = (bookId: string) => {
    setSelectedBookId(bookId)
    setIsImportDialogOpen(true)
  }

  return (
    <div className="container py-8 px-4 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">單字本</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新增單字本
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增單字本</DialogTitle>
              <DialogDescription>為您的單字創建一個新的單字本。</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">名稱</Label>
                <Input
                  id="name"
                  value={newBookName}
                  onChange={(e) => setNewBookName(e.target.value)}
                  placeholder="例如：TOEFL單字"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddBook}>創建</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <Card key={book.id} className={book.id === currentBookId ? "border-primary" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5" />
                {book.name}
              </CardTitle>
              <CardDescription>{book.words.length} 個單字</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {book.words.length > 0
                  ? `包含：${book.words
                      .slice(0, 3)
                      .map((w) => w.word)
                      .join(", ")}${book.words.length > 3 ? "..." : ""}`
                  : "這個單字本還沒有單字"}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => handleSelectBook(book.id)}>
                {book.id === currentBookId ? "當前使用中" : "選擇"}
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleOpenImportDialog(book.id)}
                  title="批量導入單字"
                >
                  <Upload className="h-4 w-4" />
                  <span className="sr-only">導入單字</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => router.push(`/settings?bookId=${book.id}`)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">編輯</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => removeBook(book.id)}>
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">刪除</span>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <div className="mt-12 text-center">
          <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">沒有單字本</h2>
          <p className="text-muted-foreground mb-4">創建您的第一個單字本來開始學習</p>
        </div>
      )}

      {/* 批量導入對話框 */}
      {selectedBookId && (
        <ImportDialog
          bookId={selectedBookId}
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
        />
      )}
    </div>
  )
}
