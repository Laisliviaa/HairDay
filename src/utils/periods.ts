import type { Period } from '../types/appointment'

const hours = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => `${String(from + i).padStart(2, '0')}:00`)

export const PERIODS: Period[] = [
  { key: 'morning', label: 'Manhã', range: '09h-12h', times: hours(9, 12) },
  { key: 'afternoon', label: 'Tarde', range: '13h-18h', times: hours(13, 18) },
  { key: 'night', label: 'Noite', range: '19h-21h', times: hours(19, 21) },
]

export function today(): string {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}
