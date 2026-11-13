import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Appointment } from '../types/appointment'

type AppointmentsContextType = {
  appointments: Appointment[]
  addAppointment: (data: Omit<Appointment, 'id'>) => void
  removeAppointment: (id: string) => void
}

const AppointmentsContext = createContext<AppointmentsContextType | null>(null)

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  function addAppointment(data: Omit<Appointment, 'id'>) {
    setAppointments((prev) => [...prev, { ...data, id: crypto.randomUUID() }])
  }

  function removeAppointment(id: string) {
    setAppointments((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <AppointmentsContext.Provider value={{ appointments, addAppointment, removeAppointment }}>
      {children}
    </AppointmentsContext.Provider>
  )
}

export function useAppointments() {
  const context = useContext(AppointmentsContext)
  if (!context) throw new Error('useAppointments deve ser usado dentro de AppointmentsProvider')
  return context
}
