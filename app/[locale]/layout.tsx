import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

const _geist = Geist({ subsets: ["latin", "arabic"] });
const _geistMono = Geist_Mono({ subsets: ["latin", "arabic"] });

export const metadata: Metadata = {
  title: 'ProServe Solutions - Service Business Management',
  description: 'Manage bookings, jobs, staff, and invoices for your service business',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params;

  if (!['en', 'ar'].includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers messages={messages} locale={locale}>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
