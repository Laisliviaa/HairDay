import { useSalon } from '../context/SalonContext'
import type { PeriodKey } from '../types/salon'
import { PERIODS, SLOT_STARTS, STEP, blockMinutes, money, periodOf, rowOf, toMinutes, toTime } from '../utils/helpers'

type Props = {
  date: string
  onNew: (employeeId: string, time: string) => void
}

export function DayGrid({ date, onNew }: Props) {
  const { employees, procedures, appointments, removeAppointment } = useSalon()

  const day = appointments.filter((a) => a.date === date)

  // quantos atendimentos começam em cada período
  const countByPeriod = day.reduce(
    (acc, a) => {
      acc[periodOf(a.time)] += 1
      return acc
    },
    { morning: 0, afternoon: 0, night: 0 } as Record<PeriodKey, number>,
  )

  const isBandStart = (i: number) => i === 0 || periodOf(SLOT_STARTS[i - 1]) !== periodOf(SLOT_STARTS[i])

  // linhas da grade que pertencem a um período (a linha 1 é o cabeçalho)
  const rowsOf = (key: PeriodKey) => {
    const idx = SLOT_STARTS.map((t, i) => (periodOf(t) === key ? i : -1)).filter((i) => i >= 0)
    return `${idx[0] + 2} / span ${idx.length}`
  }

  return (
    <div className="daygrid-wrap">
      <div
        className="daygrid"
        style={{
          gridTemplateColumns: `34px 52px repeat(${employees.length}, minmax(150px, 1fr))`,
          gridTemplateRows: `auto repeat(${SLOT_STARTS.length}, 42px)`,
        }}
      >
        {employees.map((emp, c) => (
          <div key={emp.id} className={emp.available ? 'colhead' : 'colhead off'} style={{ gridRow: 1, gridColumn: c + 3 }}>
            <strong>{emp.name}</strong>
            <small>{emp.available ? 'Disponível' : 'Indisponível'}</small>
          </div>
        ))}

        {PERIODS.map((p) => (
          <div key={p.key} className="band" style={{ gridRow: rowsOf(p.key), gridColumn: 1 }}>
            <span>{p.label} {p.range}</span>
          </div>
        ))}

        {SLOT_STARTS.map((t, i) => (
          <div key={t} className={`tick${t.endsWith(':00') ? ' hour' : ''}${isBandStart(i) ? ' start' : ''}`} style={{ gridRow: i + 2, gridColumn: 2 }}>
            {t.endsWith(':00') ? `${t.slice(0, 2)}h` : ''}
          </div>
        ))}

        {employees.map((emp, c) =>
          SLOT_STARTS.map((t, i) => (
            <button
              key={`${emp.id}-${t}`}
              type="button"
              tabIndex={-1}
              className={`cell${t.endsWith(':00') ? ' hour' : ''}${isBandStart(i) ? ' start' : ''}`}
              disabled={!emp.available}
              aria-label={`Agendar ${emp.name} às ${t}`}
              style={{ gridRow: i + 2, gridColumn: c + 3 }}
              onClick={() => onNew(emp.id, t)}
            />
          )),
        )}

        {PERIODS.filter((p) => countByPeriod[p.key] === 0).map((p) => (
          <p key={p.key} className="empty" style={{ gridRow: rowsOf(p.key), gridColumn: '3 / -1' }}>
            Você ainda não tem agendamentos cadastrados nesse período.
          </p>
        ))}

        {day.map((a) => {
          const c = employees.findIndex((e) => e.id === a.employeeId)
          if (c < 0) return null
          const color = procedures.find((p) => p.id === a.procedureIds[0])?.color ?? '#D9D9E3'
          const names = procedures.filter((p) => a.procedureIds.includes(p.id)).map((p) => p.name).join(' + ')
          const end = toTime(toMinutes(a.time) + a.durationMin)
          return (
            <article
              key={a.id}
              className="block"
              style={{ gridRow: `${rowOf(a.time) + 2} / span ${blockMinutes(a.durationMin) / STEP}`, gridColumn: c + 3, background: color }}
            >
              <strong>{a.clientName}</strong>
              <small>{names} · {a.time}–{end} · {money(a.total)}</small>
              <button type="button" className="trash" aria-label={`Excluir agendamento de ${a.clientName}`} onClick={() => removeAppointment(a.id)}>
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
