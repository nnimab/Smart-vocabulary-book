"use client"

import type { ReactNode } from "react"
import { SessionProvider } from "next-auth/react"
import { VocabularyProvider } from "@/hooks/use-vocabulary"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <VocabularyProvider>{children}</VocabularyProvider>
    </SessionProvider>
  )
}
