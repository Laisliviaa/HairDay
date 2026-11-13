import { useSalon } from '../context/SalonContext'
import type { Appointment, Period } from '../types/salon'
import { money, toMinutes, toTime } from '../utils/helpers'

type Props = {
  period: Period
  appointments: Appointment[]
  onRemove: (id: string) => void
}

export function PeriodSection({ period, appointments, onRemove }: Props) {
  const { procedures, employees } = useSalon()

  return (
    <section className="period" aria-label={period.label}>
      <header>
        <h3>{period.label}</h3>
        <span>{period.range}</span>
      </header>

      {appointments.length === 0 ? (
        <p className="empty">Você ainda não tem agendamentos cadastrados nesse período.</p>
      ) : (
        <ul>
          {appointments.map((item) => {
            const names = procedures.filter((p) => item.procedureIds.includes(p.id)).map((p) => p.name).join(' + ')
            const employee = employees.find((e) => e.id === item.employeeId)
            return (
              <li key={item.id}>
                <time>{item.time}</time>
                <div>
                  <strong>{item.clientName}</strong>
                  <small>
                    {names} · até {toTime(toMinutes(item.time) + item.durationMin)} · {employee?.name} · {money(item.total)}
                  </small>
                </div>
                <button type="button" className="trash" aria-label={`Excluir agendamento de ${item.clientName}`} onClick={() => onRemove(item.id)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6" />
                  </svg>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
