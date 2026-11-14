import { useSalon } from '../context/SalonContext'
import { useI18n } from '../i18n'
import type { Employee, PeriodKey } from '../types/salon'
import {
  PAY_KEY, PERIODS, PERIOD_KEY, REASON_KEY, SLOT_STARTS, STATUS_KEY, STEP, blockMinutes, paymentStatus, periodOf, rowOf,
  toMinutes, toTime, worksOn,
} from '../utils/helpers'
import { servicesText } from '../utils/communication'

type Props = {
  date: string
  employees: Employee[] // só os profissionais visíveis (filtro)
  onNew: (employeeId: string, time: string) => void
  onOpen: (appointmentId: string) => void
}

export function DayGrid({ date, employees, onNew, onOpen }: Props) {
  const { t, tl } = useI18n()
  const { procedures, clients, appointments, blocks, removeAppointment, removeBlock } = useSalon()

  const day = appointments.filter((a) => a.date === date && a.status !== 'cancelled' && employees.some((e) => e.id === a.employeeId))
  const locks = blocks.filter((b) => b.dateFrom <= date && date <= b.dateTo && employees.some((e) => e.id === b.employeeId))

  // quantos atendimentos começam em cada período
  const countByPeriod = day.reduce(
    (acc, a) => {
      acc[periodOf(a.time)] += 1
      return acc
    },
    { morning: 0, afternoon: 0, night: 0 } as Record<PeriodKey, number>,
  )

  const isBandStart = (i: number) => i === 0 || periodOf(SLOT_STARTS[i - 1]) !== periodOf(SLOT_STARTS[i])
  const rowsOf = (key: PeriodKey) => {
    const idx = SLOT_STARTS.map((s, i) => (periodOf(s) === key ? i : -1)).filter((i) => i >= 0)
    return `${idx[0] + 2} / span ${idx.length}`
  }

  return (
    <div className="daygrid-wrap">
      <div
        className="daygrid"
        style={{
          gridTemplateColumns: `34px 52px repeat(${employees.length}, minmax(160px, 1fr))`,
          gridTemplateRows: `auto repeat(${SLOT_STARTS.length}, 56px)`,
        }}
      >
        {employees.map((emp, c) => {
          const works = worksOn(emp, date)
          const label = !works ? t('grid.off') : emp.available ? t('grid.available') : t('grid.unavailable')
          return (
            <div key={emp.id} className={works && emp.available ? 'colhead' : 'colhead off'} style={{ gridRow: 1, gridColumn: c + 3 }}>
              <strong>{emp.name}</strong>
              <small>{label}</small>
            </div>
          )
        })}

        {PERIODS.map((p) => (
          <div key={p.key} className="band" style={{ gridRow: rowsOf(p.key), gridColumn: 1 }}>
            <span>{t(PERIOD_KEY[p.key])} {p.range}</span>
          </div>
        ))}

        {SLOT_STARTS.map((s, i) => (
          <div key={s} className={`tick${s.endsWith(':00') ? ' hour' : ''}${isBandStart(i) ? ' start' : ''}`} style={{ gridRow: i + 2, gridColumn: 2 }}>
            {s.endsWith(':00') ? `${s.slice(0, 2)}h` : ''}
          </div>
        ))}

        {employees.map((emp, c) =>
          SLOT_STARTS.map((s, i) => (
            <button
              key={`${emp.id}-${s}`}
              type="button"
              tabIndex={-1}
              className={`cell${s.endsWith(':00') ? ' hour' : ''}${isBandStart(i) ? ' start' : ''}`}
              disabled={!emp.available || !worksOn(emp, date)}
              aria-label={t('grid.book', { name: emp.name, time: s })}
              style={{ gridRow: i + 2, gridColumn: c + 3 }}
              onClick={() => onNew(emp.id, s)}
            />
          )),
        )}

        {PERIODS.filter((p) => countByPeriod[p.key] === 0).map((p) => (
          <p key={p.key} className="empty" style={{ gridRow: rowsOf(p.key), gridColumn: '3 / -1' }}>
            {t('grid.empty')}
          </p>
        ))}

        {locks.map((b) => {
          const c = employees.findIndex((e) => e.id === b.employeeId)
          const from = Math.max(0, (toMinutes(b.start) - toMinutes(SLOT_STARTS[0])) / STEP)
          const to = Math.min(SLOT_STARTS.length, (toMinutes(b.end) - toMinutes(SLOT_STARTS[0])) / STEP)
          const reason = t(REASON_KEY[b.reason])
          return (
            <div key={b.id} className="lock" style={{ gridRow: `${from + 2} / ${to + 2}`, gridColumn: c + 3 }}>
              <span>{reason} · {b.start}–{b.end}</span>
              <button type="button" className="trash" aria-label={t('grid.removeLock', { reason })} onClick={() => window.confirm(t('grid.confirmLock')) && removeBlock(b.id)}>×</button>
            </div>
          )
        })}

        {day.map((a) => {
          const c = employees.findIndex((e) => e.id === a.employeeId)
          const client = clients.find((x) => x.id === a.clientId)
          const color = procedures.find((p) => p.id === a.items[0]?.procedureId)?.color ?? '#D9D9E3'
          const name = client?.name ?? '?'
          const end = toTime(toMinutes(a.time) + a.durationMin)
          return (
            <article
              key={a.id}
              className="block"
              data-status={a.status}
              style={{ gridRow: `${rowOf(a.time) + 2} / span ${blockMinutes(a.durationMin) / STEP}`, gridColumn: c + 3, background: color }}
            >
              <button type="button" className="open" onClick={() => onOpen(a.id)} aria-label={t('grid.open', { name })}>
                <strong>{name}</strong>
                <small>{servicesText(a, procedures, tl)} · {a.time}–{end}</small>
                <small>{t(STATUS_KEY[a.status])} · {t(PAY_KEY[paymentStatus(a.total, a.paid)])}</small>
              </button>
              <button type="button" className="trash" aria-label={t('grid.del', { name })} onClick={() => window.confirm(t('grid.confirmDel', { name })) && removeAppointment(a.id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6" />
                </svg>
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
