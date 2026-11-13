import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Appointment, Employee, Procedure } from '../types/salon'

type SalonContextType = {
  procedures: Procedure[]
  employees: Employee[]
  appointments: Appointment[]
  addProcedure: (data: Omit<Procedure, 'id'>) => void
  addEmployee: (data: Omit<Employee, 'id'>) => void
  toggleEmployee: (id: string) => void
  addAppointment: (data: Omit<Appointment, 'id'>) => void
  removeAppointment: (id: string) => void
}

const initialProcedures: Procedure[] = [
  { id: 'corte', name: 'Corte', durationMin: 30, price: 40, combinesWith: ['barba'] },
  { id: 'barba', name: 'Barba', durationMin: 30, price: 30, combinesWith: ['corte'] },
  { id: 'unha', name: 'Unha', durationMin: 60, price: 50, combinesWith: ['progressiva'] },
  { id: 'progressiva', name: 'Progressiva', durationMin: 180, price: 250, combinesWith: ['unha'] },
]

const initialEmployees: Employee[] = [
  { id: 'ana', name: 'Ana', available: true, procedureIds: ['corte', 'unha', 'progressiva'] },
  { id: 'carlos', name: 'Carlos', available: true, procedureIds: ['corte', 'barba'] },
]

const SalonContext = createContext<SalonContextType | null>(null)

export function SalonProvider({ children }: { children: ReactNode }) {
  const [procedures, setProcedures] = useState(initialProcedures)
  const [employees, setEmployees] = useState(initialEmployees)
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const value: SalonContextType = {
    procedures,
    employees,
    appointments,
    addProcedure: (data) => setProcedures((prev) => [...prev, { ...data, id: crypto.randomUUID() }]),
    addEmployee: (data) => setEmployees((prev) => [...prev, { ...data, id: crypto.randomUUID() }]),
    toggleEmployee: (id) =>
      setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, available: !e.available } : e))),
    addAppointment: (data) => setAppointments((prev) => [...prev, { ...data, id: crypto.randomUUID() }]),
    removeAppointment: (id) => setAppointments((prev) => prev.filter((a) => a.id !== id)),
  }

  return <SalonContext.Provider value={value}>{children}</SalonContext.Provider>
}

export function useSalon() {
  const context = useContext(SalonContext)
  if (!context) throw new Error('useSalon deve ser usado dentro de SalonProvider')
  return context
}
