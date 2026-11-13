import { useState, type FormEvent } from 'react'
import { useSalon } from '../context/SalonContext'
import { CLOSE, PERIODS, SLOT_STARTS, canCombine, formatDuration, money, periodOf, toMinutes, today } from '../utils/helpers'

type Props = {
  onScheduled: (date: string) => void
}

export function AppointmentForm({ onScheduled }: Props) {
  const { procedures, employees, appointments, addAppointment } = useSalon()
  const [date, setDate] = useState(today())
  const [clientName, setClientName] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const [time, setTime] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const chosen = procedures.filter((p) => selected.includes(p.id))
  const durationMin = chosen.reduce((sum, p) => sum + p.durationMin, 0)
  const total = chosen.reduce((sum, p) => sum + p.price, 0)

  // só aparecem profissionais disponíveis que fazem TODOS os procedimentos escolhidos
  const availableEmployees = employees.filter(
    (e) => e.available && selected.length > 0 && selected.every((id) => e.procedureIds.includes(id)),
  )

  const employeeDay = appointments.filter((a) => a.date === date && a.employeeId === employeeId)

  function isFree(slot: string) {
    const start = toMinutes(slot)
    const end = start + durationMin
    if (end > CLOSE) return false
    return !employeeDay.some((a) => start < toMinutes(a.time) + a.durationMin && toMinutes(a.time) < end)
  }

  function toggleProcedure(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    setEmployeeId('')
    setTime('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found: string[] = []
    if (!clientName.trim()) found.push('Informe o nome do cliente.')
    if (!date) found.push('Selecione uma data.')
    if (selected.length === 0) found.push('Escolha ao menos um procedimento.')
    else if (!employeeId) found.push('Escolha o profissional.')
    else if (!time) found.push('Escolha um horário.')
    setErrors(found)
    if (found.length > 0) return

    addAppointment({ clientName: clientName.trim(), date, time, durationMin, total, procedureIds: selected, employeeId })
    onScheduled(date)
    setClientName('')
    setSelected([])
    setEmployeeId('')
    setTime('')
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h2>Agende um atendimento</h2>
      <p className="hint">Escolha data, procedimentos, profissional e horário</p>

      <label htmlFor="date">Data</label>
      <input id="date" type="date" value={date} onChange={(e) => { setDate(e.target.value); setTime('') }} />

      <fieldset>
        <legend>Procedimentos</legend>
        <p className="hint">Marque mais de um se a cliente quiser. Só ficam ativos os que podem ser feitos juntos.</p>
        <div className="slots">
          {procedures.map((p) => (
            <label key={p.id} className="chip">
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                disabled={!selected.includes(p.id) && chosen.some((c) => !canCombine(c, p))}
                onChange={() => toggleProcedure(p.id)}
              />
              <span>{p.name} · {formatDuration(p.durationMin)} · {money(p.price)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {selected.length > 0 && (
        <>
          <label htmlFor="employee">Profissional</label>
          <select id="employee" value={employeeId} onChange={(e) => { setEmployeeId(e.target.value); setTime('') }}>
            <option value="">{availableEmployees.length ? 'Selecione' : 'Ninguém disponível para essa combinação'}</option>
            {availableEmployees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <p className="hint">Duração total: {formatDuration(durationMin)} · Total: {money(total)}</p>
        </>
      )}

      <fieldset>
        <legend>Horários</legend>
        {employeeId ? (
          PERIODS.map((period) => (
            <fieldset key={period.key} className="slots">
              <legend>{period.label}</legend>
              {SLOT_STARTS.filter((t) => periodOf(t) === period.key).map((t) => (
                <label key={t} className="chip">
                  <input type="radio" name="time" value={t} checked={time === t} disabled={!isFree(t)} onChange={() => setTime(t)} />
                  <span>{t}</span>
                </label>
              ))}
            </fieldset>
          ))
        ) : (
          <p className="hint">Escolha o procedimento e o profissional para ver os horários livres.</p>
        )}
      </fieldset>

      <label htmlFor="client">Cliente</label>
      <input id="client" type="text" autoComplete="off" value={clientName} onChange={(e) => setClientName(e.target.value)} />

      {errors.map((msg) => <small key={msg} className="error" role="alert">{msg}</small>)}

      <button type="submit" className="primary">Agendar</button>
    </form>
  )
}
