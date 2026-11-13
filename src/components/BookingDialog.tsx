import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSalon } from '../context/SalonContext'
import { SLOT_STARTS, STEP, CLOSE, blockMinutes, canCombine, formatDuration, money, toMinutes } from '../utils/helpers'

export type BookingTarget = { date: string; employeeId: string; time: string }

type DialogProps = {
  target: BookingTarget | null
  onClose: () => void
  onSaved: (date: string) => void
}

export function BookingDialog({ target, onClose, onSaved }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (target && !dialog.open) dialog.showModal()
    if (!target && dialog.open) dialog.close()
  }, [target])

  return (
    <dialog ref={ref} onClose={onClose}>
      {target && <BookingForm initial={target} onCancel={onClose} onSaved={onSaved} />}
    </dialog>
  )
}

type FormProps = {
  initial: BookingTarget
  onCancel: () => void
  onSaved: (date: string) => void
}

function BookingForm({ initial, onCancel, onSaved }: FormProps) {
  const { procedures, employees, appointments, addAppointment } = useSalon()
  const [date, setDate] = useState(initial.date)
  const [clientName, setClientName] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [employeeId, setEmployeeId] = useState(initial.employeeId)
  const [time, setTime] = useState(initial.time)
  const [errors, setErrors] = useState<string[]>([])

  const chosen = procedures.filter((p) => selected.includes(p.id))
  const durationMin = chosen.reduce((sum, p) => sum + p.durationMin, 0)
  const total = chosen.reduce((sum, p) => sum + p.price, 0)

  // profissionais disponíveis que fazem TODOS os procedimentos escolhidos
  const capable = employees.filter((e) => e.available && selected.every((id) => e.procedureIds.includes(id)))

  const busy = appointments.filter((a) => a.date === date && a.employeeId === employeeId)

  function isFree(slot: string) {
    const start = toMinutes(slot)
    const end = start + blockMinutes(durationMin)
    if (end > CLOSE) return false
    return !busy.some((a) => start < toMinutes(a.time) + blockMinutes(a.durationMin) && toMinutes(a.time) < end)
  }

  const freeSlots = employeeId ? SLOT_STARTS.filter(isFree) : []
  const currentTime = freeSlots.includes(time) ? time : ''

  function toggleProcedure(id: string) {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
    setSelected(next)
    const stillOk = employees.find((e) => e.id === employeeId && e.available && next.every((p) => e.procedureIds.includes(p)))
    if (!stillOk) setEmployeeId('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found: string[] = []
    if (!clientName.trim()) found.push('Informe o nome do cliente.')
    if (!date) found.push('Selecione uma data.')
    if (selected.length === 0) found.push('Escolha ao menos um procedimento.')
    else if (!employeeId) found.push('Escolha o profissional.')
    else if (!currentTime) found.push('Escolha um horário livre.')
    setErrors(found)
    if (found.length > 0) return

    addAppointment({ clientName: clientName.trim(), date, time: currentTime, durationMin, total, procedureIds: selected, employeeId })
    onSaved(date)
    onCancel()
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h2>Novo agendamento</h2>

      <label htmlFor="client">Cliente</label>
      <input id="client" type="text" autoComplete="off" value={clientName} onChange={(e) => setClientName(e.target.value)} />

      <label htmlFor="date">Data</label>
      <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <fieldset>
        <legend>Procedimentos</legend>
        <p className="hint">Marque mais de um se a cliente quiser. Só ficam ativos os que podem ser feitos juntos.</p>
        <div className="chips">
          {procedures.map((p) => (
            <label key={p.id} className="chip">
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                disabled={!selected.includes(p.id) && chosen.some((c) => !canCombine(c, p))}
                onChange={() => toggleProcedure(p.id)}
              />
              <span><i style={{ background: p.color }} />{p.name} · {formatDuration(p.durationMin)} · {money(p.price)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="two">
        <div>
          <label htmlFor="employee">Profissional</label>
          <select id="employee" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            <option value="">{capable.length ? 'Selecione' : 'Ninguém disponível'}</option>
            {capable.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="time">Horário</label>
          <select id="time" value={currentTime} onChange={(e) => setTime(e.target.value)} disabled={!employeeId}>
            <option value="">{employeeId ? 'Selecione' : '—'}</option>
            {freeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {selected.length > 0 && <p className="hint">Duração: {formatDuration(durationMin)} · Total: {money(total)} · Blocos de {STEP} min</p>}

      {errors.map((msg) => <small key={msg} className="error" role="alert">{msg}</small>)}

      <div className="actions">
        <button type="button" className="ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="primary">Agendar</button>
      </div>
    </form>
  )
}
