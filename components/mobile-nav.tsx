"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ExternalLink } from "lucide-react"
import { useState } from "react"
import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  Users,
  FileText,
  Palette,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { business } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/staff", label: "Staff", icon: Users },
  { href: "/invoice-preview", label: "Invoices", icon: FileText },
  { href: "/settings/branding", label: "Branding", icon: Palette },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <SheetDescription className="sr-only">Main navigation for {business.name}</SheetDescription>
        <div className="flex items-center gap-3 h-16 px-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background font-semibold text-sm">PS</span>
          </div>
          <span className="font-semibold text-foreground">{business.name}</span>
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
          <Link
            href={`/public/${business.slug}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Preview Public Page
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
