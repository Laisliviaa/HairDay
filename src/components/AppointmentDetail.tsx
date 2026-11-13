import { useState } from 'react'
import { useSalon } from '../context/SalonContext'
import { useI18n } from '../i18n'
import { downloadInvite, mailtoLink, servicesText, whatsappLink } from '../utils/communication'
import type { AppointmentStatus } from '../types/salon'
import { PAY_KEY, STATUS_KEY, formatPhone, longDate, money, paymentStatus, round2, toMinutes, toTime } from '../utils/helpers'
import { Modal } from './Modal'

type Props = { id: string | null; onClose: () => void }

export function AppointmentDetail({ id, onClose }: Props) {
  return <Modal open={!!id} onClose={onClose}>{id && <Detail id={id} onClose={onClose} />}</Modal>
}

function Detail({ id, onClose }: { id: string; onClose: () => void }) {
  const { t, tl } = useI18n()
  const { appointments, clients, procedures, employees, updateAppointment, removeAppointment } = useSalon()
  const [amount, setAmount] = useState('')
  const [error, setError] = useState(false)

  const a = appointments.find((x) => x.id === id)
  const client = clients.find((c) => c.id === a?.clientId)
  if (!a || !client) return null
  const employee = employees.find((e) => e.id === a.employeeId)
  const pay = paymentStatus(a.total, a.paid)

  function register() {
    const value = Number(amount.replace(',', '.'))
    if (!a || !(value > 0)) return setError(true)
    updateAppointment(a.id, { paid: Math.min(a.total, round2(a.paid + value)) })
    setAmount(''); setError(false)
  }

  function remove() {
    if (!a || !window.confirm(t('dt.confirmDel'))) return
    removeAppointment(a.id)
    onClose()
  }

  return (
    <div className="form">
      <h2>{client.name}</h2>
      <p className="hint">{formatPhone(client.phone)}{client.email && ` · ${client.email}`}</p>
      <p>{servicesText(a, procedures, tl)}</p>
      <p className="hint">{longDate(a.date)} · {a.time}–{toTime(toMinutes(a.time) + a.durationMin)}{employee && ` · ${employee.name}`}</p>

      <label htmlFor="status">{t('dt.status')}</label>
      <select id="status" value={a.status} onChange={(e) => updateAppointment(a.id, { status: e.target.value as AppointmentStatus })}>
        {(Object.keys(STATUS_KEY) as AppointmentStatus[]).map((key) => <option key={key} value={key}>{t(STATUS_KEY[key])}</option>)}
      </select>

      <fieldset className="paybox">
        <legend>{t('dt.payment')} · <span className={`pill ${pay}`}>{t(PAY_KEY[pay])}</span></legend>
        <p>{t('dt.totals', { total: money(a.total), paid: money(a.paid), rest: money(a.total - a.paid) })}</p>
        {a.total - a.paid > 0 && (
          <div className="inline">
            <input type="text" inputMode="decimal" placeholder={t('dt.received')} aria-label={t('dt.received')} value={amount} onChange={(e) => setAmount(e.target.value)} />
            <button type="button" className="ghost" onClick={register}>{t('dt.register')}</button>
            <button type="button" className="ghost" onClick={() => updateAppointment(a.id, { paid: a.total })}>{t('dt.settle')}</button>
          </div>
        )}
        {error && <small className="error" role="alert">{t('dt.errValue')}</small>}
      </fieldset>

      <fieldset>
        <legend>{t('dt.notify')}</legend>
        <div className="chips">
          <a className="ghost" href={whatsappLink(client, 'confirm', a, procedures, t, tl, employee)} target="_blank" rel="noreferrer">{t('dt.waConfirm')}</a>
          <a className="ghost" href={whatsappLink(client, 'reminder', a, procedures, t, tl, employee)} target="_blank" rel="noreferrer">{t('dt.waReminder')}</a>
          <button type="button" className="ghost" onClick={() => downloadInvite(a, client, procedures, tl, employee)}>{t('dt.ics')}</button>
          <a className="ghost" href={mailtoLink(a, client, procedures, t, tl, employee)}>{t('dt.email')}</a>
        </div>
        <p className="hint">{t('dt.emailHint')}</p>
      </fieldset>

      <div className="actions">
        <button type="button" className="danger" onClick={remove}>{t('dt.delete')}</button>
        <button type="button" className="primary" onClick={onClose}>{t('common.close')}</button>
      </div>
    </div>
  )
}
