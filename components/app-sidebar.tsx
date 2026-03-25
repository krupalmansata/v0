"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  Users,
  FileText,
  Palette,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { business } from "@/lib/mock-data"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/staff", label: "Staff", icon: Users },
  { href: "/invoice-preview", label: "Invoices", icon: FileText },
  { href: "/settings/branding", label: "Branding", icon: Palette },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border">
      <div className="flex items-center gap-3 h-16 px-6 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
          <span className="text-background font-semibold text-sm">PS</span>
        </div>
        <span className="font-semibold text-foreground">{business.name}</span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
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

      <div className="p-3 border-t border-border">
        <Link
          href={`/public/${business.slug}`}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Preview Public Page
        </Link>
      </div>
    </aside>
  )
}
