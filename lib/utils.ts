import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format an ISO date string (YYYY-MM-DD) to a locale-aware short date, e.g. "Mar 30, 2026" */
export function formatDate(isoDate: string | undefined | null): string {
  if (!isoDate) return "—"
  const d = new Date(isoDate + "T00:00:00") // force local midnight to avoid UTC offset shift
  if (isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

/** Format a 24-hour time string (HH:MM) to a locale-aware time, e.g. "2:00 PM" */
export function formatTime(time: string | undefined | null): string {
  if (!time) return "—"
  const [h, m] = time.split(":").map(Number)
  if (isNaN(h) || isNaN(m)) return time
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

/** Shorten a Firebase push key to a human-readable job number, e.g. "JOB-X4Y8Z1" */
export function formatJobId(id: string | undefined | null): string {
  if (!id) return "—"
  return `JOB-${id.slice(-6).toUpperCase()}`
}

/** Safely normalise Firebase proofPhotos: may arrive as object when indices are non-sequential */
export function normalizePhotos(photos: any): string[] {
  if (!photos) return []
  if (Array.isArray(photos)) return photos.filter(Boolean)
  return Object.values(photos).filter(Boolean) as string[]
}
