export type Appointment = {
  id: string
  clientName: string
  date: string // AAAA-MM-DD
  time: string // HH:MM
}

export type PeriodKey = 'morning' | 'afternoon' | 'night'

export type Period = {
  key: PeriodKey
  label: string
  range: string
  times: string[]
}
