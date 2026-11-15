import { ui } from '../styles'
import { useState, type FormEvent } from 'react'
import { useSalon } from '../context/SalonContext'
import { useI18n, type Key } from '../i18n'
import type { Employee } from '../types/salon'
import { WEEKDAY_KEY, WEEK_ORDER, minName, sameName, weekdayOf } from '../utils/helpers'

export function EmployeesPage() {
  const { t, tl } = useI18n()
  const { employees, procedures, appointments, addEmployee, toggleEmployee, toggleDayOff, removeEmployee, whyNotEmployee } = useSalon()
  const [name, setName] = useState('')
  const [procedureIds, setProcedureIds] = useState<string[]>([])
  const [daysOff, setDaysOff] = useState<number[]>([0]) // domingo de folga por padrão
  const [error, setError] = useState<Key | ''>('')
  const [notice, setNotice] = useState('')

  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!minName(name)) return setError('err.name3')
    if (employees.some((e) => sameName(e.name, name))) return setError('err.nameDup')
    if (procedureIds.length === 0) return setError('em.errProcs')
    addEmployee({ name: name.trim(), available: true, procedureIds, daysOff })
    setName(''); setProcedureIds([]); setDaysOff([0]); setError('')
  }

  function remove(id: string, label: string) {
    const why = whyNotEmployee(id)
    if (why) return setNotice(why)
    if (window.confirm(t('em.confirm', { name: label }))) { removeEmployee(id); setNotice('') }
  }

  // não deixa marcar folga num dia da semana em que já há atendimento
  function changeDay(e: Employee, weekday: number) {
    if (!e.daysOff.includes(weekday)) {
      const n = appointments.filter((a) => a.employeeId === e.id && a.status !== 'cancelled' && weekdayOf(a.date) === weekday).length
      if (n) return setNotice(t('em.errScale', { n, name: e.name }))
    }
    setNotice('')
    toggleDayOff(e.id, weekday)
  }

  return (
    <div className={ui.page}>
      <div className={ui.stack}>
        <form className={`${ui.form} ${ui.panel}`} onSubmit={handleSubmit} noValidate>
          <h2>{t('em.new')}</h2>
          <label htmlFor="e-name">{t('em.name')}</label>
          <input id="e-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <fieldset>
            <legend>{t('em.does')}</legend>
            <div className={ui.chips}>
              {procedures.map((p) => (
                <label key={p.id} className={ui.chip}>
                  <input type="checkbox" checked={procedureIds.includes(p.id)} onChange={() => setProcedureIds((prev) => toggle(prev, p.id))} />
                  <span><i style={{ background: p.color }} />{tl(p.name)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>{t('em.daysOff')}</legend>
            <div className={ui.chips}>
              {WEEK_ORDER.map((d) => (
                <label key={d} className={ui.chip}>
                  <input type="checkbox" checked={daysOff.includes(d)} onChange={() => setDaysOff((prev) => toggle(prev, d))} />
                  <span>{t(WEEKDAY_KEY[d])}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {error && <small className={ui.error} role="alert">{t(error)}</small>}
          <button type="submit" className={ui.primary}>{t('em.save')}</button>
        </form>

        <section className={ui.panel}>
          <h2>{t('em.scale')}</h2>
          <p className={ui.hint}>{t('em.scaleHint')}</p>
          <div className={ui.scalewrap}>
            <table className={ui.scale}>
              <thead>
                <tr><th scope="col" />{WEEK_ORDER.map((d) => <th key={d} scope="col">{t(WEEKDAY_KEY[d])}</th>)}</tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.id}>
                    <th scope="row">{e.name}</th>
                    {WEEK_ORDER.map((d) => {
                      const off = e.daysOff.includes(d)
                      return (
                        <td key={d}>
                          <button type="button" className={off ? ui.off : ui.on} aria-label={`${e.name}, ${t(WEEKDAY_KEY[d])}: ${off ? t('em.off') : t('em.works')}`} onClick={() => changeDay(e, d)}>
                            {off ? t('em.off') : '✓'}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr className={ui.summary}>
                  <th scope="row">{t('em.open')}</th>
                  {WEEK_ORDER.map((d) => <td key={d}>{employees.some((e) => !e.daysOff.includes(d)) ? t('em.opened') : t('em.closed')}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div>
        {notice && <p className={ui.notice} role="alert">{notice}</p>}
        <ul className={ui.list}>
          {employees.map((e) => (
            <li key={e.id}>
              <strong>{e.name}</strong>
              <small>{procedures.filter((p) => e.procedureIds.includes(p.id)).map((p) => tl(p.name)).join(', ') || t('em.noProcs')}</small>
              <div className={ui.chips}>
                <button type="button" className={e.available ? `${ui.status} ${ui.on}` : `${ui.status} ${ui.off}`} aria-pressed={e.available} onClick={() => toggleEmployee(e.id)}>
                  {e.available ? t('grid.available') : t('grid.unavailable')}
                </button>
                <button type="button" className={`${ui.danger} ${ui.small}`} onClick={() => remove(e.id, e.name)}>{t('em.delete')}</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
