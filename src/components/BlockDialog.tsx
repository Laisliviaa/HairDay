import { useState, type FormEvent } from 'react'
import { useSalon } from '../context/SalonContext'
import { useI18n, type Key } from '../i18n'
import type { Block } from '../types/salon'
import { CLOSE, MAX_DATE, MIN_DATE, REASON_KEY, SLOT_STARTS, blockMinutes, inRange, toMinutes, toTime } from '../utils/helpers'
import { Modal } from './Modal'

type Props = { open: boolean; date: string; employeeId: string; onClose: () => void }

const REASONS = Object.keys(REASON_KEY) as Block['reason'][]
const END_TIMES = [...SLOT_STARTS.slice(1), toTime(CLOSE)]

export function BlockDialog({ open, date, employeeId, onClose }: Props) {
  return <Modal open={open} onClose={onClose}>{open && <BlockForm date={date} employeeId={employeeId} onClose={onClose} />}</Modal>
}

function BlockForm({ date, employeeId, onClose }: Omit<Props, 'open'>) {
  const { t } = useI18n()
  const { employees, appointments, addBlock } = useSalon()
  const [emp, setEmp] = useState(employeeId || employees[0]?.id || '')
  const [reason, setReason] = useState<Block['reason']>('lunch')
  const [dateFrom, setDateFrom] = useState(date)
  const [dateTo, setDateTo] = useState(date)
  const [start, setStart] = useState('12:00')
  const [end, setEnd] = useState('13:00')
  const [error, setError] = useState<{ key: Key; n?: number } | null>(null)

  const fullDay = reason === 'dayoff' || reason === 'vacation'

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const s = fullDay ? SLOT_STARTS[0] : start
    const e = fullDay ? toTime(CLOSE) : end
    if (!emp || !inRange(dateFrom) || !inRange(dateTo)) return setError({ key: 'bl.errPick' })
    if (dateTo < dateFrom) return setError({ key: 'bl.errDates' })
    if (toMinutes(e) <= toMinutes(s)) return setError({ key: 'bl.errTimes' })
    const clash = appointments.filter(
      (a) => a.employeeId === emp && a.status !== 'cancelled' && a.date >= dateFrom && a.date <= dateTo &&
        toMinutes(a.time) < toMinutes(e) && toMinutes(s) < toMinutes(a.time) + blockMinutes(a.durationMin),
    )
    if (clash.length) return setError({ key: 'bl.errClash', n: clash.length })
    addBlock({ employeeId: emp, reason, dateFrom, dateTo, start: s, end: e })
    onClose()
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h2>{t('bl.title')}</h2>
      <div className="two">
        <div>
          <label htmlFor="b-emp">{t('bl.employee')}</label>
          <select id="b-emp" value={emp} onChange={(e) => setEmp(e.target.value)}>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="b-reason">{t('bl.reason')}</label>
          <select id="b-reason" value={reason} onChange={(e) => setReason(e.target.value as Block['reason'])}>
            {REASONS.map((r) => <option key={r} value={r}>{t(REASON_KEY[r])}</option>)}
          </select>
        </div>
      </div>
      <div className="two">
        <div>
          <label htmlFor="b-from">{t('bl.from')}</label>
          <input id="b-from" type="date" min={MIN_DATE} max={MAX_DATE} value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); if (dateTo < e.target.value) setDateTo(e.target.value) }} />
        </div>
        <div>
          <label htmlFor="b-to">{t('bl.to')}</label>
          <input id="b-to" type="date" min={MIN_DATE} max={MAX_DATE} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>
      {fullDay ? (
        <p className="hint">{t('bl.fullDay', { reason: t(REASON_KEY[reason]) })}</p>
      ) : (
        <div className="two">
          <div>
            <label htmlFor="b-start">{t('bl.startAt')}</label>
            <select id="b-start" value={start} onChange={(e) => setStart(e.target.value)}>{SLOT_STARTS.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <div>
            <label htmlFor="b-end">{t('bl.endAt')}</label>
            <select id="b-end" value={end} onChange={(e) => setEnd(e.target.value)}>{END_TIMES.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
        </div>
      )}
      {error && <small className="error" role="alert">{t(error.key, { n: error.n ?? 0 })}</small>}
      <div className="actions">
        <button type="button" className="ghost" onClick={onClose}>{t('common.cancel')}</button>
        <button type="submit" className="primary">{t('bl.submit')}</button>
      </div>
    </form>
  )
}
