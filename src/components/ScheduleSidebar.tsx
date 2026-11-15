import { ui } from '../styles'
import { useState, type FormEvent } from 'react'
import { useSalon } from '../context/SalonContext'
import { useI18n } from '../i18n'
import { BOOKING_TIMES, MAX_DATE, MIN_DATE, PERIODS, PERIOD_KEY, inRange, periodOf, sameName, toMinutes, today, worksOn } from '../utils/helpers'
import { DateField } from './DateField'

type Props = { onSaved: (date: string) => void; onAdvanced: (date: string) => void }

// O cadastro básico do enunciado reserva uma hora, sem exigir telefone ou pagamento.
const DURATION = 60

export function ScheduleSidebar({ onSaved, onAdvanced }: Props) {
  const { t } = useI18n()
  const { appointments, employees, blocks, clients, addClient, addAppointment } = useSalon()
  const [date, setDate] = useState(today())
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  function availableEmployee(slot: string) {
    if (!inRange(date)) return undefined
    const start = toMinutes(slot)
    const end = start + DURATION
    return employees.find((employee) => employee.available && worksOn(employee, date)
      && !appointments.some((a) => a.employeeId === employee.id && a.date === date && a.status !== 'cancelled'
        && start < toMinutes(a.time) + a.durationMin && toMinutes(a.time) < end)
      && !blocks.some((b) => b.employeeId === employee.id && b.dateFrom <= date && date <= b.dateTo
        && start < toMinutes(b.end) && toMinutes(b.start) < end))
  }

  const employee = time ? availableEmployee(time) : undefined
  const selectedTime = employee ? time : ''

  function submit(event: FormEvent) {
    event.preventDefault()
    setSaved(false)
    if (!date || !inRange(date)) return setError(t('err.date'))
    if (!selectedTime || !employee) return setError(t('err.time'))
    const clientName = name.trim()
    if (!clientName) return setError(t('sch.nameError'))
    const existing = clients.find((client) => sameName(client.name, clientName))
    const clientId = existing?.id ?? addClient({ name: clientName, cpf: '', phone: '', email: '' })
    addAppointment({ clientId, clientName: existing?.name ?? clientName, date, time: selectedTime,
      durationMin: DURATION, total: 0, paid: 0, status: 'scheduled', items: [], employeeId: employee.id })
    onSaved(date)
    setName(''); setTime(''); setError(''); setSaved(true)
  }

  return (
    <aside className={ui.scheduleSidebar}>
      <header>
        <h2>{t('sch.title')}</h2>
        <p>{t('sch.subtitle')}</p>
      </header>
      <form className={ui.scheduleForm} onSubmit={submit} noValidate>
        <div className={ui.scheduleField}>
          <label htmlFor="schedule-date">{t('bk.date')}</label>
          <DateField id="schedule-date" label={t('bk.date')} value={date} min={MIN_DATE} max={MAX_DATE}
            onChange={(value) => { setDate(value); setTime(''); setSaved(false) }} />
        </div>
        <fieldset className={ui.scheduleTimes}>
          <legend>{t('sch.times')}</legend>
          {PERIODS.map((period) => (
            <div className={ui.timePeriod} key={period.key}>
              <p>{t(PERIOD_KEY[period.key])}</p>
              <div className={ui.timeOptions}>
                {BOOKING_TIMES.filter((slot) => periodOf(slot) === period.key).map((slot) => (
                  <button key={slot} type="button" aria-pressed={selectedTime === slot} disabled={!availableEmployee(slot)}
                    onClick={() => { setTime(slot); setSaved(false) }}>{slot}</button>
                ))}
              </div>
            </div>
          ))}
        </fieldset>
        <div className={ui.scheduleField}>
          <label htmlFor="schedule-client">{t('bk.client')}</label>
          <div className={ui.scheduleClient}>
            <img src="/figma/client.svg" alt="" />
            <input id="schedule-client" type="text" autoComplete="name" placeholder={t('sch.namePlaceholder')}
              value={name} onChange={(e) => { setName(e.target.value); setSaved(false) }} />
          </div>
        </div>
        {error && <p className={ui.error} role="alert">{error}</p>}
        {saved && <p className={ui.scheduleSuccess} role="status">{t('sch.saved')}</p>}
        <button className={ui.scheduleSubmit} type="submit">{t('bk.submit')}</button>
      </form>
      <details className={ui.scheduleExtra}>
        <summary>{t('sch.more')}</summary>
        <p>{t('sch.simpleHint')}</p>
        <button type="button" className={ui.ghost} onClick={() => onAdvanced(inRange(date) ? date : today())}>{t('sch.advanced')}</button>
      </details>
    </aside>
  )
}
