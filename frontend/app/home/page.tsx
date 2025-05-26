"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Book, Settings, ArrowRight, Sparkles, Brain, Zap, BarChart } from "lucide-react"
import { useVocabulary } from "@/hooks/use-vocabulary"

export default function LandingPage() {
  const router = useRouter()
  const { books } = useVocabulary()
  const [animatedText, setAnimatedText] = useState("單字")

  // 循環顯示不同的單字
  useEffect(() => {
    const words = ["單字", "詞彙", "語言", "學習", "記憶", "知識"]
    let index = 0

    const interval = setInterval(() => {
      index = (index + 1) % words.length
      setAnimatedText(words[index])
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen">
      {/* 英雄區塊 */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background pt-16 pb-24">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:items-center">
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                  最智能的
                  <span className="relative ml-2 inline-block">
                    <span className="absolute inset-0 bg-primary/10 rounded-lg transform -skew-x-12"></span>
                    <span className="relative text-primary">{animatedText}</span>
                  </span>
                  <br />
                  學習工具
                </h1>
                <p className="mb-6 text-lg text-muted-foreground md:pr-10">
                  透過互動式單字卡、智能複習和個性化學習路徑，讓記憶單字變得輕鬆有趣。
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" onClick={() => router.push("/")}>
                    開始學習
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => router.push("/vocabulary-books")}>
                    瀏覽單字本
                  </Button>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative mx-auto max-w-md"
            >
              <div className="relative">
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-30 blur"></div>
                <Card className="relative overflow-hidden rounded-xl border-2 border-primary/20 shadow-xl">
                  <CardContent className="p-0">
                    <div className="flex h-12 items-center bg-primary/10 px-4">
                      <div className="flex space-x-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="mb-4 flex justify-between text-sm text-muted-foreground">
                        <span>單字卡 1/20</span>
                        <span>基礎英語</span>
                      </div>
                      <div className="mb-6 flex h-40 items-center justify-center rounded-lg bg-secondary/30 p-4 shadow-inner">
                        <h3 className="text-3xl font-bold">Serendipity</h3>
                      </div>
                      <div className="flex justify-center space-x-4">
                        <Button variant="outline" size="sm">
                          上一個
                        </Button>
                        <Button variant="outline" size="sm">
                          翻轉
                        </Button>
                        <Button variant="outline" size="sm">
                          下一個
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full bg-primary/20 blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 -z-10 h-32 w-32 rounded-full bg-secondary/20 blur-xl"></div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto mt-16 px-4">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center rounded-full bg-background px-4 py-2 text-sm shadow-md">
              <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
              <span>智能複習系統</span>
            </div>
            <div className="flex items-center rounded-full bg-background px-4 py-2 text-sm shadow-md">
              <Brain className="mr-2 h-4 w-4 text-purple-500" />
              <span>記憶強化技術</span>
            </div>
            <div className="flex items-center rounded-full bg-background px-4 py-2 text-sm shadow-md">
              <Zap className="mr-2 h-4 w-4 text-blue-500" />
              <span>快速導入單字</span>
            </div>
            <div className="flex items-center rounded-full bg-background px-4 py-2 text-sm shadow-md">
              <BarChart className="mr-2 h-4 w-4 text-green-500" />
              <span>學習進度追蹤</span>
            </div>
          </div>
        </div>
      </section>

      {/* 特色區塊 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-bold md:text-4xl">強大功能，輕鬆學習</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              我們的單字卡應用提供多種功能，幫助您更有效地學習和記憶單字。
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-2 border-muted/40 transition-all hover:border-primary/20 hover:shadow-md">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      {feature.icon}
                    </div>
                    <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                    <p className="mb-4 flex-grow text-muted-foreground">{feature.description}</p>
                    <Button variant="ghost" className="w-fit" onClick={() => router.push(feature.link)}>
                      立即體驗
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 統計區塊 */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="mb-2 text-4xl font-bold text-primary">{books.length}</div>
              <p className="text-muted-foreground">單字本</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="mb-2 text-4xl font-bold text-primary">
                {books.reduce((total, book) => total + book.words.length, 0)}
              </div>
              <p className="text-muted-foreground">單字</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="mb-2 text-4xl font-bold text-primary">100%</div>
              <p className="text-muted-foreground">免費使用</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 行動召喚 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 p-8 text-center md:p-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">準備好開始您的學習之旅了嗎？</h2>
              <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
                立即開始使用我們的單字卡應用，讓學習變得更加輕鬆有效。
              </p>
              <Button size="lg" onClick={() => router.push("/")}>
                立即開始
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 頁腳 */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              <span className="font-bold">單字卡學習</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} NNimab單字卡學習應用。保留所有權利。
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    title: "互動式單字卡",
    description: "流暢的翻轉動畫，正反面設計，讓您輕鬆記憶單字和定義。",
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    link: "/",
  },
  {
    title: "單字本管理",
    description: "創建和管理多個單字本，根據不同主題或難度分類您的單字。",
    icon: <Book className="h-6 w-6 text-primary" />,
    link: "/vocabulary-books",
  },
  {
    title: "單字導入工具",
    description: "通過CSV文件快速導入大量單字，或手動添加單個單字和定義。",
    icon: <Settings className="h-6 w-6 text-primary" />,
    link: "/settings",
  },
]
