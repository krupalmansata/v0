"use client"

import { Link, usePathname } from "@/src/i18n/routing"
import { Menu, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  Users,
  FileText,
  Palette,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { database } from "@/lib/firebase"
import { ref, onValue } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"

export function MobileNav() {
  const pathname = usePathname()
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const tNav = useTranslations("Navigation")
  const tCommon = useTranslations("Common")
  const [open, setOpen] = useState(false)
  const { userData } = useAuth()
  const [businessName, setBusinessName] = useState("")
  const [businessSlug, setBusinessSlug] = useState("")

  const navItems = [
    { href: "/dashboard", label: tNav("dashboard"), icon: LayoutDashboard },
    { href: "/jobs", label: tNav("jobs"), icon: Briefcase },
    { href: "/bookings", label: tNav("bookings"), icon: CalendarCheck },
    { href: "/staff", label: tNav("staff"), icon: Users },
    { href: "/invoice-preview", label: tNav("invoices"), icon: FileText },
    { href: "/settings/branding", label: tNav("branding"), icon: Palette },
  ]

  useEffect(() => {
    if (!userData?.businessId) return
    const businessRef = ref(database, `businesses/${userData.businessId}`)
    const unsubscribe = onValue(businessRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setBusinessName(data.name || tCommon("defaultBusinessFallback"))
        setBusinessSlug(data.slug || userData.businessId)
      }
    })
    return () => unsubscribe()
  }, [userData?.businessId])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{tNav("toggleMenu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side={isRtl ? "right" : "left"} className="w-64 p-0">
        <SheetTitle className="sr-only">{tNav("navMenuLabel")}</SheetTitle>
        <SheetDescription className="sr-only">{tNav("mainNavFor", { name: businessName || tCommon("defaultBusinessFallback") })}</SheetDescription>
        <div className="flex items-center gap-3 h-16 px-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background font-semibold text-sm">
              {(businessName || "B").substring(0, 2).toUpperCase()}
            </span>
          </div>
          <span className="font-semibold text-foreground truncate">{businessName || tCommon("loading")}</span>
        </div>

        <nav className="px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
          {businessSlug && (
            <Link
              href={`/public/${businessSlug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              {tNav("publicPreview")}
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
