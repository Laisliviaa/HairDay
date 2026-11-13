import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Appointment, Block, Client, Employee, PricePoint, Procedure } from '../types/salon'
import { useI18n } from '../i18n'
import { EPOCH } from '../utils/helpers'

type SalonContextType = {
  procedures: Procedure[]
  employees: Employee[]
  clients: Client[]
  appointments: Appointment[]
  blocks: Block[]
  addProcedure: (data: Omit<Procedure, 'id'>) => void
  removeProcedure: (id: string) => void
  addPriceChange: (variantId: string, point: PricePoint) => void
  addEmployee: (data: Omit<Employee, 'id'>) => void
  toggleEmployee: (id: string) => void
  toggleDayOff: (id: string, weekday: number) => void
  removeEmployee: (id: string) => void
  addClient: (data: Omit<Client, 'id'>) => string
  removeClient: (id: string) => void
  addAppointment: (data: Omit<Appointment, 'id'>) => void
  updateAppointment: (id: string, patch: Partial<Appointment>) => void
  removeAppointment: (id: string) => void
  addBlock: (data: Omit<Block, 'id'>) => void
  removeBlock: (id: string) => void
  // devolvem o motivo que impede a exclusão, ou null se pode excluir
  whyNotProcedure: (id: string) => string | null
  whyNotEmployee: (id: string) => string | null
  whyNotClient: (id: string) => string | null
}

const v = (id: string, label: string, durationMin: number, value: number) => ({ id, label, durationMin, prices: [{ from: EPOCH, value }] })

const initialProcedures: Procedure[] = [
  { id: 'corte', name: '@p.cut', color: '#F4A6C0', combinesWith: ['barba'], variants: [v('corte-m', '@v.male', 30, 40), v('corte-f', '@v.female', 60, 90)] },
  { id: 'barba', name: '@p.beard', color: '#78CFC0', combinesWith: ['corte'], variants: [v('barba-p', '@v.default', 30, 30)] },
  { id: 'unha', name: '@p.nails', color: '#F5C451', combinesWith: ['progressiva'], variants: [v('unha-m', '@v.hand', 60, 50), v('unha-p', '@v.foot', 60, 55)] },
  { id: 'progressiva', name: '@p.straight', color: '#B9A6F2', combinesWith: ['unha'], variants: [v('prog-p', '@v.default', 180, 250)] },
]

const initialEmployees: Employee[] = [
  { id: 'ana', name: 'Ana', available: true, procedureIds: ['corte', 'unha', 'progressiva'], daysOff: [1, 2] },
  { id: 'carlos', name: 'Carlos', available: true, procedureIds: ['corte', 'barba'], daysOff: [0] },
]

const initialClients: Client[] = [
  { id: 'helena', name: 'Helena Souza', cpf: '52998224725', phone: '11987654321', email: 'helena@email.com' },
]

const SalonContext = createContext<SalonContextType | null>(null)

export function SalonProvider({ children }: { children: ReactNode }) {
  const [procedures, setProcedures] = useState(initialProcedures)
  const [employees, setEmployees] = useState(initialEmployees)
  const [clients, setClients] = useState(initialClients)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])

  const { t } = useI18n()

  const value: SalonContextType = {
    procedures, employees, clients, appointments, blocks,
    addProcedure: (data) => setProcedures((prev) => [...prev, { ...data, id: crypto.randomUUID() }]),
    removeProcedure: (id) => {
      setProcedures((prev) => prev.filter((p) => p.id !== id).map((p) => ({ ...p, combinesWith: p.combinesWith.filter((x) => x !== id) })))
      setEmployees((prev) => prev.map((e) => ({ ...e, procedureIds: e.procedureIds.filter((x) => x !== id) })))
    },
    addPriceChange: (variantId, point) =>
      setProcedures((prev) =>
        prev.map((p) => ({
          ...p,
          variants: p.variants.map((x) =>
            x.id === variantId ? { ...x, prices: [...x.prices.filter((o) => o.from !== point.from), point] } : x,
          ),
        })),
      ),
    toggleDayOff: (id, weekday) =>
      setEmployees((prev) =>
        prev.map((e) => (e.id === id ? { ...e, daysOff: e.daysOff.includes(weekday) ? e.daysOff.filter((d) => d !== weekday) : [...e.daysOff, weekday] } : e)),
      ),
    addEmployee: (data) => setEmployees((prev) => [...prev, { ...data, id: crypto.randomUUID() }]),
    toggleEmployee: (id) => setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, available: !e.available } : e))),
    removeEmployee: (id) => {
      setEmployees((prev) => prev.filter((e) => e.id !== id))
      setBlocks((prev) => prev.filter((b) => b.employeeId !== id))
    },
    addClient: (data) => {
      const id = crypto.randomUUID()
      setClients((prev) => [...prev, { ...data, id }])
      return id
    },
    removeClient: (id) => setClients((prev) => prev.filter((c) => c.id !== id)),
    addAppointment: (data) => setAppointments((prev) => [...prev, { ...data, id: crypto.randomUUID() }]),
    updateAppointment: (id, patch) => setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))),
    removeAppointment: (id) => setAppointments((prev) => prev.filter((a) => a.id !== id)),
    addBlock: (data) => setBlocks((prev) => [...prev, { ...data, id: crypto.randomUUID() }]),
    removeBlock: (id) => setBlocks((prev) => prev.filter((b) => b.id !== id)),
    whyNotProcedure: (id) => {
      const n = appointments.filter((a) => a.items.some((i) => i.procedureId === id)).length
      return n ? t('why.proc', { n }) : null
    },
    whyNotEmployee: (id) => {
      const n = appointments.filter((a) => a.employeeId === id).length
      return n ? t('why.emp', { n }) : null
    },
    whyNotClient: (id) => {
      const n = appointments.filter((a) => a.clientId === id).length
      return n ? t('why.client', { n }) : null
    },
  }

  return <SalonContext.Provider value={value}>{children}</SalonContext.Provider>
}

export function useSalon() {
  const context = useContext(SalonContext)
  if (!context) throw new Error('useSalon deve ser usado dentro de SalonProvider')
  return context
}
