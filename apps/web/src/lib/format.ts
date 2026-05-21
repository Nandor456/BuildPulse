export function formatDate(value: string | null | undefined) {
  if (!value) return 'Pending'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Invalid date'

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Open'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Invalid date'

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(date)
}

export function formatHours(value: number | null | undefined) {
  if (value === null || value === undefined) return '0.0h'
  return `${value.toFixed(1)}h`
}

export function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) return 'Not set'

  return new Intl.NumberFormat(undefined, {
    currency: 'RON',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

export function getCurrentPeriod() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getMonthBounds(period: string) {
  const [yearValue, monthValue] = parsePeriod(period)
  const from = `${yearValue}-${String(monthValue).padStart(2, '0')}-01`
  const lastDay = new Date(yearValue, monthValue, 0).getDate()
  const to = `${yearValue}-${String(monthValue).padStart(2, '0')}-${String(
    lastDay,
  ).padStart(2, '0')}`

  return { from, to }
}

export function parsePeriod(period: string): [number, number] {
  const [yearRaw, monthRaw] = period.split('-')
  const year = Number(yearRaw)
  const month = Number(monthRaw)

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    const today = new Date()
    return [today.getFullYear(), today.getMonth() + 1]
  }

  return [year, month]
}
