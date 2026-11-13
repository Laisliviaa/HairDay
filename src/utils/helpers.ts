import type { Period, PeriodKey } from '../types/salon'

export const PERIODS: Period[] = [
  { key: 'morning', label: 'Manhã', range: '09h-12h' },
  { key: 'afternoon', label: 'Tarde', range: '13h-18h' },
  { key: 'night', label: 'Noite', range: '19h-21h' },
]

// cores das amostras de procedimento
export const SWATCHES = ['#F4A6C0', '#78CFC0', '#F5C451', '#B9A6F2', '#A5CF74', '#84B4F2', '#F59B7B', '#D9D9E3']

export const OPEN = 9 * 60
export const CLOSE = 22 * 60
export const STEP = 30

export const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export const toTime = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

// 09:00, 09:30 ... 21:30 (cada linha da agenda)
export const SLOT_STARTS: string[] = Array.from(
  { length: (CLOSE - STEP - OPEN) / STEP + 1 },
  (_, i) => toTime(OPEN + i * STEP),
)

// quanto tempo o atendimento ocupa na agenda (sempre em blocos de 30 min)
export const blockMinutes = (durationMin: number) => Math.max(Math.ceil(durationMin / STEP) * STEP, STEP)

export const rowOf = (time: string) => (toMinutes(time) - OPEN) / STEP

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

function toISODate(d: Date) {
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

export const today = () => toISODate(new Date())

export function shiftDate(date: string, days: number) {
  const d = new Date(`${date}T12:00:00`)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function longDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}

// dois procedimentos combinam se qualquer um deles lista o outro
export const canCombine = (
  a: { id: string; combinesWith: string[] },
  b: { id: string; combinesWith: string[] },
) => a.combinesWith.includes(b.id) || b.combinesWith.includes(a.id)
