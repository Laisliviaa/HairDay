import type { Period, PeriodKey } from '../types/salon'

export const PERIODS: Period[] = [
  { key: 'morning', label: 'Manhã', range: '09h-12h' },
  { key: 'afternoon', label: 'Tarde', range: '13h-18h' },
  { key: 'night', label: 'Noite', range: '19h-21h' },
]

const OPEN = 9 * 60
const LAST_START = 21 * 60
export const CLOSE = 22 * 60
const STEP = 30

export const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export const toTime = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

// 09:00, 09:30, ... 21:00
export const SLOT_STARTS: string[] = Array.from(
  { length: (LAST_START - OPEN) / STEP + 1 },
  (_, i) => toTime(OPEN + i * STEP),
)

export function periodOf(time: string): PeriodKey {
  const hour = Math.floor(toMinutes(time) / 60)
  if (hour < 13) return 'morning'
  if (hour < 19) return 'afternoon'
  return 'night'
}

export const money = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m}min`
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

export function today(): string {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

// dois procedimentos combinam se qualquer um deles lista o outro
export const canCombine = (
  a: { id: string; combinesWith: string[] },
  b: { id: string; combinesWith: string[] },
) => a.combinesWith.includes(b.id) || b.combinesWith.includes(a.id)
