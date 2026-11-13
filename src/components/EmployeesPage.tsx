import { useState, type FormEvent } from 'react'
import { useSalon } from '../context/SalonContext'

export function EmployeesPage() {
  const { employees, procedures, addEmployee, toggleEmployee } = useSalon()
  const [name, setName] = useState('')
  const [procedureIds, setProcedureIds] = useState<string[]>([])
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim() || procedureIds.length === 0) {
      setError('Informe o nome e ao menos um procedimento.')
      return
    }
    addEmployee({ name: name.trim(), available: true, procedureIds })
    setName(''); setProcedureIds([]); setError('')
  }

  return (
    <div className="page">
      <form className="form panel" onSubmit={handleSubmit} noValidate>
        <h2>Novo profissional</h2>
        <label htmlFor="e-name">Nome</label>
        <input id="e-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <fieldset>
          <legend>Realiza</legend>
          <div className="chips">
            {procedures.map((p) => (
              <label key={p.id} className="chip">
                <input
                  type="checkbox"
                  checked={procedureIds.includes(p.id)}
                  onChange={() => setProcedureIds((prev) => (prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]))}
                />
                <span><i style={{ background: p.color }} />{p.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {error && <small className="error" role="alert">{error}</small>}
        <button type="submit" className="primary">Salvar profissional</button>
      </form>

      <ul className="list">
        {employees.map((e) => (
          <li key={e.id}>
            <strong>{e.name}</strong>
            <small>{procedures.filter((p) => e.procedureIds.includes(p.id)).map((p) => p.name).join(', ')}</small>
            <button type="button" className={e.available ? 'status on' : 'status off'} aria-pressed={e.available} onClick={() => toggleEmployee(e.id)}>
              {e.available ? 'Disponível' : 'Indisponível'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
