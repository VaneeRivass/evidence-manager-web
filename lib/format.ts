// Dates and sizes as a person reads them, in Spanish — mockup screen 3. Intl ships with
// the browser: no library.

const relative = new Intl.RelativeTimeFormat('es', {
  numeric: 'auto',
  style: 'short',
})
const dayMonth = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
})
const dayMonthYear = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const MINUTE = 60_000
const HOUR = 60 * MINUTE

// «hace 5 min» · «hace 2 h» · «ayer» · «24 sept» · «24 sept 2025»
export function formatWhen(iso: string, now = new Date()): string {
  const date = new Date(iso)
  const elapsed = now.getTime() - date.getTime()

  if (elapsed < MINUTE) return 'ahora'
  if (elapsed < HOUR)
    return relative.format(-Math.floor(elapsed / MINUTE), 'minute')
  if (isSameDay(date, now))
    return relative.format(-Math.floor(elapsed / HOUR), 'hour')

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameDay(date, yesterday)) return 'ayer'

  return date.getFullYear() === now.getFullYear()
    ? dayMonth.format(date)
    : dayMonthYear.format(date)
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const time = new Intl.DateTimeFormat('es', {
  hour: '2-digit',
  minute: '2-digit',
})

// The case page's dates, exact rather than relative — mockup screen 8:
// «hoy, 10:14» · «24 sept 2026»
export function formatDate(iso: string, now = new Date()): string {
  const date = new Date(iso)
  return isSameDay(date, now)
    ? `hoy, ${time.format(date)}`
    : dayMonthYear.format(date)
}

const oneDecimal = new Intl.NumberFormat('es', { maximumFractionDigits: 1 })
const KB = 1024
const MB = 1024 * KB

// «396 bytes» · «840 KB» · «1,2 MB». Under 1 KB the exact count: rounded, a 396-byte file
// would read «1 KB» — and evidence is worth reading precisely.
export function formatSize(bytes: number): string {
  if (bytes < KB) return bytes === 1 ? '1 byte' : `${bytes} bytes`
  // Rounded before choosing the unit: 1,048,200 bytes would otherwise read «1024 KB»
  const kb = Math.round(bytes / KB)
  if (kb < 1024) return `${kb} KB`
  return `${oneDecimal.format(bytes / MB)} MB`
}
