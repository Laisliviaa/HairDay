import { ui } from '../styles'
import { useState } from 'react'
import { useSalon } from '../context/SalonContext'
import { useI18n } from '../i18n'
import { servicesText } from '../utils/communication'
import { PAY_KEY, STATUS_KEY, formatCPF, formatPhone, money, onlyDigits, paymentStatus, shortDate } from '../utils/helpers'
import { ClientForm } from './ClientForm'

export function ClientsPage() {
  const { t, tl } = useI18n()
  const { clients, appointments, procedures, removeClient, whyNotClient } = useSalon()
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')

  const term = search.trim().toLowerCase()
  const digits = onlyDigits(search)
  const shown = clients.filter(
    (c) => !term || c.name.toLowerCase().includes(term) || (digits && (c.cpf.includes(digits) || c.phone.includes(digits))),
  )

  function remove(id: string, name: string) {
    const why = whyNotClient(id)
    if (why) return setNotice(why)
    if (window.confirm(t('cl.confirm', { name }))) { removeClient(id); setNotice('') }
  }

  return (
    <div className={ui.page}>
      <div className={ui.panel}><ClientForm /></div>

      <div>
        <label className={ui.searchlabel} htmlFor="search">{t('cl.search')}</label>
        <input id="search" type="text" value={search} onChange={(e) => setSearch(e.target.value)} />
        {notice && <p className={ui.notice} role="alert">{notice}</p>}

        <ul className={ui.list}>
          {shown.length === 0 && <li><small>{t('cl.none')}</small></li>}
          {shown.map((c) => {
            const history = appointments.filter((a) => a.clientId === c.id).sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
            return (
              <li key={c.id}>
                <details>
                  <summary><strong>{c.name}</strong> <small>{c.cpf && `${formatCPF(c.cpf)} · `}{formatPhone(c.phone)}</small></summary>
                  <div className={ui.clientBody}>
                    <p className={ui.hint}>{c.email || t('cl.noEmail')}</p>
                    <div className={ui.chips}>
                      <a className={ui.ghost} href={`https://wa.me/55${c.phone}`} target="_blank" rel="noreferrer">{t('cl.wa')}</a>
                      <button type="button" className={ui.danger} onClick={() => remove(c.id, c.name)}>{t('cl.delete')}</button>
                    </div>
                    <h3>{t('cl.history', { n: history.length })}</h3>
                    {history.length === 0 ? <p className={ui.hint}>{t('cl.noHistory')}</p> : (
                      <ul className={ui.history}>
                        {history.map((a) => (
                          <li key={a.id}>
                            <strong>{shortDate(a.date)} · {a.time}</strong> {servicesText(a, procedures, tl)}
                            <small>{t(STATUS_KEY[a.status])} · {t(PAY_KEY[paymentStatus(a.total, a.paid)])} · {t('cl.paidOf', { paid: money(a.paid), total: money(a.total) })}</small>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </details>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
