import { useSalon } from '../context/SalonContext'
import type { Appointment, PeriodKey } from '../types/salon'
import { PERIODS, periodOf } from '../utils/helpers'
import { PeriodSection } from './PeriodSection'

type Props = {
  date: string
  onDateChange: (date: string) => void
}

export function AppointmentList({ date, onDateChange }: Props) {
  const { appointments, removeAppointment } = useSalon()

  const ofTheDay = appointments.filter((a) => a.date === date)

  const byPeriod = ofTheDay.reduce(
    (acc, a) => {
      acc[periodOf(a.time)].push(a)
      return acc
    },
    { morning: [], afternoon: [], night: [] } as Record<PeriodKey, Appointment[]>,
  )

  return (
    <div className="agenda">
      <header>
        <div>
          <h2>Sua agenda</h2>
          <p className="hint">Consulte os seus atendimentos agendados por dia</p>
        </div>
        <input type="date" aria-label="Data da agenda" value={date} onChange={(e) => onDateChange(e.target.value)} />
      </header>

      {PERIODS.map((period) => (
        <PeriodSection
          key={period.key}
          period={period}
          appointments={[...byPeriod[period.key]].sort((a, b) => a.time.localeCompare(b.time))}
          onRemove={removeAppointment}
        />
      ))}
    </div>
  )
}
