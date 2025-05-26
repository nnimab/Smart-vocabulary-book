"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator"
import { BookOpen, Github, Mail, Lock, User, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { status: sessionStatus } = useSession()

  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)

  // 登入表單狀態
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  // 註冊表單狀態
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast({ title: "錯誤", description: "請填寫所有必填欄位", variant: "destructive" })
      return
    }
    setIsLoginLoading(true);
    const result = await signIn("credentials", {
      redirect: false, // 我們手動處理 redirect
      email: loginEmail,
      password: loginPassword,
      // callbackUrl: explicitly not setting here, as signIn might handle it differently than expected for credentials.
      // We will handle redirect based on result and current URL searchParams.
    })
    setIsLoginLoading(false);

    if (result?.error) {
      toast({ title: "登入失敗", description: result.error === "CredentialsSignin" ? "電子郵件或密碼錯誤" : result.error, variant: "destructive" })
    } else if (result?.ok) {
      toast({ title: "登入成功", description: "歡迎回來！" })
      
      // 檢查是否有 callbackUrl
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl');
      
      if (callbackUrl) {
        router.push(callbackUrl); // 導向原始請求的頁面
      } else {
        router.push("/"); // 否則導向首頁
      }
    } else {
      toast({ title: "登入失敗", description: "發生未知錯誤", variant: "destructive" })
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
      toast({
        title: "錯誤",
        description: "請填寫所有必填欄位",
        variant: "destructive",
      })
      return
    }

    if (!agreeTerms) {
      toast({
        title: "錯誤",
        description: "請同意服務條款和隱私政策",
        variant: "destructive",
      })
      return
    }

    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: "錯誤",
        description: "密碼和確認密碼不匹配",
        variant: "destructive",
      })
      return
    }

    setIsRegisterLoading(true)
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: registerName, email: registerEmail, password: registerPassword }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "註冊失敗")
      }

      toast({
        title: "註冊成功",
        description: "您的帳戶已創建，請使用新憑證登入。",
      })
      setRegisterName("")
      setRegisterEmail("")
      setRegisterPassword("")
      setRegisterConfirmPassword("")
      setAgreeTerms(false)
    } catch (error: any) {
      toast({
        title: "註冊失敗",
        description: error.message || "註冊時發生錯誤",
        variant: "destructive",
      })
    } finally {
      setIsRegisterLoading(false)
    }
  }

  const handleGuestLogin = () => {
    toast({
      title: "訪客模式",
      description: "您已以訪客身份進入應用",
    })
    router.push("/")
  }

  // 添加一個自動登入的函數
  const handleAutoLogin = async () => {
    setIsLoginLoading(true);
    // 自動填入測試帳號
    const result = await signIn("credentials", {
      redirect: false,
      email: "test@example.com", // 使用測試帳號
      password: "password", // 使用測試密碼
    });
    setIsLoginLoading(false);

    if (result?.error) {
      toast({ title: "登入失敗", description: result.error, variant: "destructive" });
    } else if (result?.ok) {
      toast({ title: "自動登入成功", description: "歡迎回來！" });
      router.push("/"); // 導向首頁
    } else {
      toast({ title: "登入失敗", description: "發生未知錯誤", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center justify-center">
              <BookOpen className="mr-2 h-6 w-6 text-primary" />
              <span className="text-2xl font-bold">單字卡學習</span>
            </Link>
            <h1 className="mt-4 text-2xl font-bold">歡迎回來</h1>
            <p className="mt-2 text-sm text-muted-foreground">登入您的帳戶以繼續學習之旅</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">登入</TabsTrigger>
                <TabsTrigger value="register">註冊</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>帳戶登入</CardTitle>
                    <CardDescription>輸入您的電子郵件和密碼以登入您的帳戶</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email-login">電子郵件</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email-login"
                            type="email"
                            placeholder="您的電子郵件"
                            className="pl-10"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password-login">密碼</Label>
                          <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                            忘記密碼？
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password-login"
                            type="password"
                            placeholder="您的密碼"
                            className="pl-10"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <label
                          htmlFor="remember"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          記住我
                        </label>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoginLoading || sessionStatus === "loading"}>
                        {isLoginLoading || sessionStatus === "loading" ? (
                          <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>處理中...</>
                        ) : (
                          <>登入<ArrowRight className="ml-2 h-4 w-4" /></>
                        )}
                      </Button>
                    </form>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">或使用</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        type="button" 
                        disabled={isLoginLoading || isRegisterLoading || sessionStatus === "loading"}
                        onClick={() => signIn("github")}
                      >
                        <Github className="mr-2 h-4 w-4" />
                        Github
                      </Button>
                      <Button 
                        variant="outline" 
                        type="button" 
                        disabled={isLoginLoading || isRegisterLoading || sessionStatus === "loading"}
                        onClick={() => signIn("google")}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Google
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                      onClick={handleAutoLogin}
                      disabled={isLoginLoading || isRegisterLoading || sessionStatus === 'loading'}
                    >
                      ⚡ 自動登入（自用）
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-muted-foreground"
                      onClick={handleGuestLogin}
                      disabled={isLoginLoading || isRegisterLoading || sessionStatus === 'loading'}
                    >
                      以訪客身份繼續
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>創建帳戶</CardTitle>
                    <CardDescription>填寫以下信息以創建您的帳戶</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name-register">姓名</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name-register"
                            placeholder="您的姓名"
                            className="pl-10"
                            value={registerName}
                            onChange={(e) => setRegisterName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email-register">電子郵件</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email-register"
                            type="email"
                            placeholder="您的電子郵件"
                            className="pl-10"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password-register">密碼</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password-register"
                            type="password"
                            placeholder="創建密碼"
                            className="pl-10"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            required
                          />
                        </div>
                        {registerPassword && (
                          <PasswordStrengthIndicator password={registerPassword} />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password-register">確認密碼</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirm-password-register"
                            type="password"
                            placeholder="確認密碼"
                            className="pl-10"
                            value={registerConfirmPassword}
                            onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={agreeTerms}
                          onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                          required
                        />
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          我同意
                          <Link href="/terms" className="ml-1 text-primary hover:underline">
                            服務條款
                          </Link>{" "}
                          和{" "}
                          <Link href="/privacy" className="text-primary hover:underline">
                            隱私政策
                          </Link>
                        </label>
                      </div>

                      <Button type="submit" className="w-full" disabled={isRegisterLoading || sessionStatus === "loading"}>
                        {isRegisterLoading || sessionStatus === "loading" ? (
                          <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>處理中...</>
                        ) : (
                          <>註冊<ArrowRight className="ml-2 h-4 w-4" /></>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
