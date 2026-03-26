"use client"

import { AuthProvider as FirebaseAuthProvider } from "@/lib/auth-context"
import { NextIntlClientProvider } from 'next-intl'

export function Providers({ 
  children,
  messages,
  locale
}: { 
  children: React.ReactNode
  messages: any
  locale: string
}) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <FirebaseAuthProvider>
        {children}
      </FirebaseAuthProvider>
    </NextIntlClientProvider>
  )
}
