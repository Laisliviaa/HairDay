import { getLocale } from '../i18n'
import type { Period, PeriodKey, PaymentStatus, AppointmentStatus, Procedure, ServiceItem, Variant, Employee } from '../types/salon'

export const PERIODS: Period[] = [
  { key: 'morning', range: '09h-12h' },
  { key: 'afternoon', range: '13h-18h' },
  { key: 'night', range: '19h-21h' },
]
export const PERIOD_KEY = { morning: 'per.morning', afternoon: 'per.afternoon', night: 'per.night' } as const
export const STATUS_KEY = { scheduled: 'st.scheduled', confirmed: 'st.confirmed', done: 'st.done', noshow: 'st.noshow', cancelled: 'st.cancelled' } as const
export const PAY_KEY = { pending: 'pay.pending', partial: 'pay.partial', paid: 'pay.paid' } as const
export const REASON_KEY = { lunch: 'rs.lunch', dayoff: 'rs.dayoff', vacation: 'rs.vacation', other: 'rs.other' } as const
export const WEEKDAY_KEY = ['wd.0', 'wd.1', 'wd.2', 'wd.3', 'wd.4', 'wd.5', 'wd.6'] as const
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] // semana começando na segunda
export const DEFAULT_LABEL = '@v.default'

export const SWATCHES = ['#F4A6C0', '#78CFC0', '#F5C451', '#B9A6F2', '#A5CF74', '#84B4F2', '#F59B7B', '#D9D9E3']

// o salão fecha às 21h: o último atendimento precisa terminar até lá
export const OPEN = 9 * 60
export const CLOSE = 21 * 60
export const STEP = 30
export const EPOCH = '2000-01' // início de vigência do preço original
export const MIN_DATE = '2020-01-01'
export const MAX_DATE = '2030-12-31'

export const toMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}
export const toTime = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

// 09:00, 09:30 ... 20:30 (cada linha da agenda)
export const SLOT_STARTS: string[] = Array.from(
  { length: (CLOSE - STEP - OPEN) / STEP + 1 },
  (_, i) => toTime(OPEN + i * STEP),
)
export const blockMinutes = (durationMin: number) => Math.max(Math.ceil(durationMin / STEP) * STEP, STEP)
export const rowOf = (time: string) => (toMinutes(time) - OPEN) / STEP

export function periodOf(time: string): PeriodKey {
  const hour = Math.floor(toMinutes(time) / 60)
  if (hour < 13) return 'morning'
  if (hour < 19) return 'afternoon'
  return 'night'
}

export const money = (value: number) => value.toLocaleString(getLocale(), { style: 'currency', currency: 'BRL' })
export const round2 = (n: number) => Math.round(n * 100) / 100

export function formatDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (!h) return `${m}min`
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const parse = (date: string) => new Date(`${date}T12:00:00`)
export const clampDate = (date: string) => (date < MIN_DATE ? MIN_DATE : date > MAX_DATE ? MAX_DATE : date)
export const inRange = (date: string) => date >= MIN_DATE && date <= MAX_DATE
export const today = () => clampDate(toISODate(new Date()))
export const thisMonth = () => today().slice(0, 7)
export const shiftDate = (date: string, days: number) => {
  const d = parse(date)
  d.setDate(d.getDate() + days)
  return clampDate(toISODate(d))
}
export const weekdayOf = (date: string) => parse(date).getDay()
export const worksOn = (e: Employee, date: string) => !e.daysOff.includes(weekdayOf(date))
export const longDate = (date: string) => parse(date).toLocaleDateString(getLocale(), { weekday: 'long', day: 'numeric', month: 'long' })
export const shortDate = (date: string) => parse(date).toLocaleDateString(getLocale())
export const monthLabel = (month: string) => parse(`${month}-01`).toLocaleDateString(getLocale(), { month: '2-digit', year: 'numeric' })

// preço da variação na data: o último reajuste com vigência até aquele mês
export function priceOn(variant: Variant, date: string) {
  const month = date.slice(0, 7)
  const sorted = [...variant.prices].sort((a, b) => a.from.localeCompare(b.from))
  const valid = sorted.filter((p) => p.from <= month)
  return (valid.length ? valid[valid.length - 1] : sorted[0]).value
}

export function paymentStatus(total: number, paid: number): PaymentStatus {
  if (paid <= 0) return 'pending'
  return paid < total ? 'partial' : 'paid'
}
export const statusOf = (s: AppointmentStatus) => STATUS_KEY[s]

export const canCombine = (
  a: { id: string; combinesWith: string[] },
  b: { id: string; combinesWith: string[] },
) => a.combinesWith.includes(b.id) || b.combinesWith.includes(a.id)

export function serviceLabel(procedures: Procedure[], item: ServiceItem, tl: (s: string) => string) {
  const p = procedures.find((x) => x.id === item.procedureId)
  const v = p?.variants.find((x) => x.id === item.variantId)
  if (!p) return '?'
  return v && v.label !== DEFAULT_LABEL ? `${tl(p.name)} (${tl(v.label)})` : tl(p.name)
}

/* validações e máscaras */
export const onlyDigits = (s: string) => s.replace(/\D/g, '')
export const normalizeName = (s: string) =>
  s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ')
export const sameName = (a: string, b: string) => normalizeName(a) === normalizeName(b)
export const minName = (s: string) => s.trim().length >= 3

export function isValidCPF(raw: string) {
  const c = onlyDigits(raw)
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false
  const digit = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(c[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  return digit(9) === Number(c[9]) && digit(10) === Number(c[10])
}
export const isValidPhone = (raw: string) => {
  const d = onlyDigits(raw)
  return d.length === 11 && d[2] === '9'
}
export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

export function formatCPF(raw: string) {
  const d = onlyDigits(raw).slice(0, 11)
  return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2')
}
export function formatPhone(raw: string) {
  const d = onlyDigits(raw).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
