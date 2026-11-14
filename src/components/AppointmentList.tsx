import { useSalon } from '../context/SalonContext'
import { useI18n } from '../i18n'
import type { Appointment, PeriodKey } from '../types/salon'
import { PERIODS, periodOf } from '../utils/helpers'
import { PeriodSection } from './PeriodSection'

type Props = { date: string; employeeId: string; onOpen: (id: string) => void }

export function AppointmentList({ date, employeeId, onOpen }: Props) {
  const { appointments, removeAppointment } = useSalon()
  const { t } = useI18n()
  const grouped = appointments
    .filter((a) => a.date === date && a.status !== 'cancelled' && (!employeeId || a.employeeId === employeeId))
    .reduce((periods, appointment) => {
      periods[periodOf(appointment.time)].push(appointment)
      return periods
    }, { morning: [], afternoon: [], night: [] } as Record<PeriodKey, Appointment[]>)

  function remove(appointment: Appointment) {
    if (window.confirm(t('grid.confirmDel', { name: appointment.clientName }))) removeAppointment(appointment.id)
  }

  return (
    <div className="appointment-list">
      {PERIODS.map((period) => <PeriodSection key={period.key} period={period}
        appointments={[...grouped[period.key]].sort((a, b) => a.time.localeCompare(b.time))}
        onOpen={onOpen} onRemove={remove} />)}
    </div>
  )
}
