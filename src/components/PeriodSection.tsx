import { useI18n } from '../i18n'
import type { Appointment, Period } from '../types/salon'
import { PERIOD_KEY } from '../utils/helpers'

type Props = {
  period: Period
  appointments: Appointment[]
  onOpen: (id: string) => void
  onRemove: (appointment: Appointment) => void
}

export function PeriodSection({ period, appointments, onOpen, onRemove }: Props) {
  const { t } = useI18n()
  return (
    <section className="period-section" aria-labelledby={`period-${period.key}`} data-period={period.key}>
      <header>
        <img src={`/figma/${period.key}.svg`} alt="" />
        <h3 id={`period-${period.key}`}>{t(PERIOD_KEY[period.key])}</h3>
        <span>{period.range}</span>
      </header>
      {appointments.length === 0 ? <p className="period-empty">{t('grid.empty')}</p> : (
        <ul>
          {appointments.map((appointment) => (
            <li key={appointment.id} className="appointment-row">
              <time>{appointment.time}</time>
              <button className="appointment-name" type="button" onClick={() => onOpen(appointment.id)}
                aria-label={t('grid.open', { name: appointment.clientName })}>{appointment.clientName}</button>
              <button className="appointment-delete" type="button" aria-label={t('grid.del', { name: appointment.clientName })}
                onClick={() => onRemove(appointment)}><img src="/figma/trash.svg" alt="" /></button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
