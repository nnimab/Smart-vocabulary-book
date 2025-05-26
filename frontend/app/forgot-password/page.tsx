"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator"
import { BookOpen, Mail, ArrowLeft, Lock, Key } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'reset'>('email')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "錯誤",
        description: "請輸入您的電子郵件",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // 模擬請求
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 在這個示例中，我們直接進入重置步驟
      // 實際應用中會發送郵件給用戶
      setStep('reset')

      toast({
        title: "驗證郵件",
        description: `重置代碼已發送到 ${email}。請輸入重置代碼 RESET123 來重置密碼。`,
      })
    } catch (error) {
      toast({
        title: "發送失敗",
        description: "無法發送重置密碼郵件，請稍後再試",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resetCode || !newPassword || !confirmPassword) {
      toast({
        title: "錯誤",
        description: "請填寫所有欄位",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "錯誤",
        description: "密碼和確認密碼不匹配",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword, resetCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "密碼重置失敗")
      }

      toast({
        title: "重置成功",
        description: "您的密碼已成功重置，請使用新密碼登入",
      })

      // 延遲後跳轉到登入頁面
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error: any) {
      toast({
        title: "重置失敗",
        description: error.message || "密碼重置時發生錯誤",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center justify-center">
              <BookOpen className="mr-2 h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">單字卡學習</span>
            </Link>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 'email' ? '忘記密碼' : '重置密碼'}
                </CardTitle>
                <CardDescription>
                  {step === 'email'
                    ? "輸入您的電子郵件，我們將發送重置密碼的代碼"
                    : "輸入重置代碼和新密碼"}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {step === 'email' ? (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">電子郵件</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="您的電子郵件"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                          發送中...
                        </>
                      ) : (
                        "發送重置代碼"
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetCode">重置代碼</Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="resetCode"
                          type="text"
                          placeholder="輸入重置代碼 (RESET123)"
                          className="pl-10"
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">新密碼</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="輸入新密碼"
                          className="pl-10"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      {newPassword && (
                        <PasswordStrengthIndicator password={newPassword} />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">確認新密碼</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="再次輸入新密碼"
                          className="pl-10"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                          重置中...
                        </>
                      ) : (
                        "重置密碼"
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>

              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => router.push("/login")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回登入
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>

      <footer className="border-t py-4">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} NNimab單字卡學習應用。保留所有權利。
        </div>
      </footer>
    </div>
  )
}
