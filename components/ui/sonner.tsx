'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'
import { useLocale } from 'next-intl'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()
  const locale = useLocale()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      dir={dir}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
