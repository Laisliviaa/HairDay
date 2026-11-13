export type PeriodKey = 'morning' | 'afternoon' | 'night'

export type Period = { key: PeriodKey; label: string; range: string }

export type Procedure = {
  id: string
  name: string
  durationMin: number
  price: number
  color: string // cor da "amostra" usada na agenda
  combinesWith: string[] // ids de procedimentos que podem ser feitos junto
}

export type Employee = {
  id: string
  name: string
  available: boolean
  procedureIds: string[] // o que o profissional realiza
}

export type Appointment = {
  id: string
  clientName: string // futuramente: clientId, quando existir a aba de clientes
  date: string // AAAA-MM-DD
  time: string // HH:MM (início)
  durationMin: number
  total: number
  procedureIds: string[]
  employeeId: string
}
