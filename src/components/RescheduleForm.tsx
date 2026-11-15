import { useState, type FormEvent } from 'react'
import { useSalon } from '../context/SalonContext'
import { useI18n } from '../i18n'
import type { Appointment } from '../types/salon'
import { BOOKING_TIMES, CLOSE, MAX_DATE, MIN_DATE, blockMinutes, inRange, toMinutes, worksOn } from '../utils/helpers'

type Props = { appointment: Appointment; onCancel: () => void; onSaved: (date: string) => void }

export function RescheduleForm({ appointment, onCancel, onSaved }: Props) {
  const { t } = useI18n()
  const { appointments, employees, blocks, updateAppointment } = useSalon()
  const [date, setDate] = useState(appointment.date)
  const [time, setTime] = useState(appointment.time)
  const [error, setError] = useState('')
  const employee = employees.find((e) => e.id === appointment.employeeId)
  const available = !!employee && employee.available && inRange(date) && worksOn(employee, date)
    && appointment.items.every((item) => employee.procedureIds.includes(item.procedureId))

  const slots = available ? BOOKING_TIMES.filter((slot) => {
    const start = toMinutes(slot)
    const end = start + blockMinutes(appointment.durationMin)
    return end <= CLOSE
      // O próprio agendamento não deve bloquear seu horário atual.
      && !appointments.some((a) => a.id !== appointment.id && a.employeeId === appointment.employeeId
        && a.date === date && a.status !== 'cancelled'
        && start < toMinutes(a.time) + blockMinutes(a.durationMin) && toMinutes(a.time) < end)
      && !blocks.some((b) => b.employeeId === appointment.employeeId && b.dateFrom <= date && date <= b.dateTo
        && start < toMinutes(b.end) && toMinutes(b.start) < end)
  }) : []
  const selectedTime = slots.includes(time) ? time : ''

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!date || !inRange(date)) return setError(t('err.date'))
    if (!selectedTime) return setError(t('rsch.chooseTime'))
    // Atualiza o mesmo id; preço, pagamento, duração e serviços permanecem intactos.
    updateAppointment(appointment.id, { date, time: selectedTime })
    onSaved(date)
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <h2>{t('rsch.title')}</h2>
      <p>{appointment.clientName}{employee && ` · ${employee.name}`}</p>
      <p className="hint">{t('rsch.hint')}</p>
      <label htmlFor="reschedule-date">{t('bk.date')}</label>
      <input id="reschedule-date" type="date" min={MIN_DATE} max={MAX_DATE} value={date}
        onChange={(event) => { setDate(event.target.value); setTime(''); setError('') }} />
      <label htmlFor="reschedule-time">{t('bk.time')}</label>
      <select id="reschedule-time" value={selectedTime} onChange={(event) => { setTime(event.target.value); setError('') }}>
        <option value="">{t('common.select')}</option>
        {slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
      </select>
      {slots.length === 0 && <p role="status" className="hint">{t('rsch.noSlots')}</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions">
        <button type="button" className="ghost" onClick={onCancel}>{t('common.cancel')}</button>
        <button type="submit" className="primary">{t('rsch.save')}</button>
      </div>
    </form>
  )
}
