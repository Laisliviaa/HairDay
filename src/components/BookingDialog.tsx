import { useState, type FormEvent } from 'react'
import { useSalon } from '../context/SalonContext'
import { useI18n, type Key } from '../i18n'
import type { ServiceItem } from '../types/salon'
import {
  BOOKING_TIMES, CLOSE, DEFAULT_LABEL, MAX_DATE, MIN_DATE, blockMinutes, canCombine, formatCPF, formatDuration,
  inRange, money, priceOn, round2, toMinutes, worksOn,
} from '../utils/helpers'
import { ClientForm } from './ClientForm'
import { Modal } from './Modal'

export type BookingTarget = { date: string; employeeId: string; time: string }

type DialogProps = { target: BookingTarget | null; onClose: () => void; onSaved: (date: string) => void }

export function BookingDialog({ target, onClose, onSaved }: DialogProps) {
  return (
    <Modal open={!!target} onClose={onClose}>
      {target && <BookingForm initial={target} onCancel={onClose} onSaved={onSaved} />}
    </Modal>
  )
}

type FormProps = { initial: BookingTarget; onCancel: () => void; onSaved: (date: string) => void }
type Deposit = '' | 'none' | 'half' | 'full'

function BookingForm({ initial, onCancel, onSaved }: FormProps) {
  const { t, tl } = useI18n()
  const { procedures, employees, clients, appointments, blocks, addAppointment } = useSalon()
  const [clientId, setClientId] = useState('')
  const [creating, setCreating] = useState(clients.length === 0)
  const [date, setDate] = useState(initial.date)
  const [selected, setSelected] = useState<string[]>([]) // ids das variações escolhidas
  const [employeeId, setEmployeeId] = useState(initial.employeeId)
  const [time, setTime] = useState(initial.time)
  const [deposit, setDeposit] = useState<Deposit>('') // começa vazio de propósito
  const [errors, setErrors] = useState<Key[]>([])

  const chosen = procedures.flatMap((p) => p.variants.filter((x) => selected.includes(x.id)).map((x) => ({ p, v: x })))
  const items: ServiceItem[] = chosen.map((c) => ({ procedureId: c.p.id, variantId: c.v.id }))
  const durationMin = chosen.reduce((s, c) => s + c.v.durationMin, 0)
  const total = round2(chosen.reduce((s, c) => s + priceOn(c.v, date), 0))

  // profissionais que trabalham no dia, estão disponíveis e fazem TODOS os procedimentos escolhidos
  const capable = employees.filter((e) => e.available && inRange(date) && worksOn(e, date) && chosen.every((c) => e.procedureIds.includes(c.p.id)))
  const empId = capable.some((e) => e.id === employeeId) ? employeeId : ''

  const busy = appointments.filter((a) => a.date === date && a.employeeId === empId && a.status !== 'cancelled')
  const locks = blocks.filter((b) => b.employeeId === empId && b.dateFrom <= date && date <= b.dateTo)

  function isFree(slot: string) {
    const start = toMinutes(slot)
    const end = start + blockMinutes(durationMin)
    if (end > CLOSE) return false
    if (busy.some((a) => start < toMinutes(a.time) + blockMinutes(a.durationMin) && toMinutes(a.time) < end)) return false
    return !locks.some((b) => start < toMinutes(b.end) && toMinutes(b.start) < end)
  }

  const freeSlots = empId ? BOOKING_TIMES.filter(isFree) : []
  const currentTime = freeSlots.includes(time) ? time : ''

  function toggleVariant(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found: Key[] = []
    const client = clients.find((item) => item.id === clientId)
    if (!client) found.push('err.client')
    if (!date || !inRange(date)) found.push(date ? 'agenda.range' : 'err.date')
    if (items.length === 0) found.push('err.procs')
    else if (!empId) found.push('err.employee')
    else if (!currentTime) found.push('err.time')
    if (!deposit) found.push('err.payment')
    setErrors(found)
    if (found.length > 0 || !client) return

    const paid = deposit === 'full' ? total : deposit === 'half' ? round2(total / 2) : 0
    const clientName = client.name
    addAppointment({ clientId, clientName, date, time: currentTime, durationMin, total, paid, status: 'scheduled', items, employeeId: empId })
    onSaved(date)
    onCancel()
  }

  if (creating) {
    return <ClientForm onSaved={(id) => { setClientId(id); setCreating(false) }} onCancel={clients.length ? () => setCreating(false) : onCancel} />
  }

  const half = round2(total / 2)

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h2>{t('bk.title')}</h2>

      <label htmlFor="client">{t('bk.client')}</label>
      <div className="inline">
        <select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">{t('common.select')}</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}{c.cpf && ` · ${formatCPF(c.cpf)}`}</option>)}
        </select>
        <button type="button" className="ghost" onClick={() => setCreating(true)}>{t('bk.newClient')}</button>
      </div>

      <label htmlFor="date">{t('bk.date')}</label>
      <input id="date" type="date" min={MIN_DATE} max={MAX_DATE} value={date} onChange={(e) => setDate(e.target.value)} />

      <fieldset>
        <legend>{t('bk.procs')}</legend>
        <p className="hint">{t('bk.procsHint')}</p>
        {procedures.map((p) => (
          <div key={p.id} className="chips">
            {p.variants.map((x) => (
              <label key={x.id} className="chip">
                <input
                  type="checkbox"
                  checked={selected.includes(x.id)}
                  disabled={!selected.includes(x.id) && chosen.some((c) => c.p.id === p.id || !canCombine(c.p, p))}
                  onChange={() => toggleVariant(x.id)}
                />
                <span>
                  <i style={{ background: p.color }} />
                  {tl(p.name)}{x.label !== DEFAULT_LABEL && ` ${tl(x.label).toLowerCase()}`} · {formatDuration(x.durationMin)} · {money(priceOn(x, date))}
                </span>
              </label>
            ))}
          </div>
        ))}
      </fieldset>

      <div className="two">
        <div>
          <label htmlFor="employee">{t('bk.employee')}</label>
          <select id="employee" value={empId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">{capable.length ? t('common.select') : t('bk.noOne')}</option>
            {capable.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="time">{t('bk.time')}</label>
          <select id="time" value={currentTime} onChange={(e) => setTime(e.target.value)} disabled={!empId}>
            <option value="">{empId ? t('common.select') : '—'}</option>
            {freeSlots.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <fieldset>
        <legend>{t('bk.payment')}</legend>
        <div className="chips">
          {([['none', 'bk.payDay'], ['half', 'bk.pay50'], ['full', 'bk.payFull']] as const).map(([key, label]) => (
            <label key={key} className="chip">
              <input type="radio" name="deposit" checked={deposit === key} onChange={() => setDeposit(key)} />
              <span>{t(label)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {items.length > 0 && (
        <p className="hint">
          {t('bk.summary', { d: formatDuration(durationMin), total: money(total) })}
          {deposit === 'half' && t('bk.remaining', { v: money(total - half) })}
          {deposit === 'none' && t('bk.remaining', { v: money(total) })}
        </p>
      )}

      {errors.map((k) => <small key={k} className="error" role="alert">{t(k)}</small>)}

      <div className="actions">
        <button type="button" className="ghost" onClick={onCancel}>{t('common.cancel')}</button>
        <button type="submit" className="primary">{t('bk.submit')}</button>
      </div>
    </form>
  )
}
