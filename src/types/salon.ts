export type PeriodKey = 'morning' | 'afternoon' | 'night'
export type Period = { key: PeriodKey; range: string }

// preço com vigência: vale a partir do mês "from" (AAAA-MM)
export type PricePoint = { from: string; value: number }

export type Variant = {
  id: string
  label: string // texto livre ou chave "@v.male" para traduzir
  durationMin: number
  prices: PricePoint[]
}

export type Procedure = {
  id: string
  name: string
  color: string
  combinesWith: string[] // ids de procedimentos que podem ser feitos junto
  variants: Variant[]
}

export type Employee = {
  id: string
  name: string
  available: boolean
  procedureIds: string[]
  daysOff: number[] // folgas fixas toda semana (0 = domingo ... 6 = sábado)
}

export type Client = {
  id: string
  name: string
  cpf: string // só números (pode ficar vazio)
  phone: string // só números, com DDD
  email: string
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'done' | 'noshow' | 'cancelled'
export type PaymentStatus = 'pending' | 'partial' | 'paid'

export type ServiceItem = { procedureId: string; variantId: string }

export type Appointment = {
  id: string
  clientId: string
  date: string // AAAA-MM-DD
  time: string // HH:MM
  durationMin: number
  total: number // valor fechado na data do agendamento
  paid: number
  status: AppointmentStatus
  items: ServiceItem[]
  employeeId: string
}

export type Block = {
  id: string
  employeeId: string
  reason: 'lunch' | 'dayoff' | 'vacation' | 'other'
  dateFrom: string
  dateTo: string
  start: string
  end: string
}
