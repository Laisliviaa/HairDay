import { useState, type FormEvent } from 'react'
import { useSalon } from '../context/SalonContext'
import { formatDuration, money } from '../utils/helpers'

export function ProceduresPage() {
  const { procedures, addProcedure } = useSalon()
  const [name, setName] = useState('')
  const [durationMin, setDurationMin] = useState('')
  const [price, setPrice] = useState('')
  const [combinesWith, setCombinesWith] = useState<string[]>([])
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const duration = Number(durationMin)
    const value = Number(price.replace(',', '.'))
    if (!name.trim() || !(duration > 0) || !(value >= 0) || price === '') {
      setError('Preencha nome, tempo (em minutos) e valor.')
      return
    }
    addProcedure({ name: name.trim(), durationMin: duration, price: value, combinesWith })
    setName(''); setDurationMin(''); setPrice(''); setCombinesWith([]); setError('')
  }

  return (
    <div className="page">
      <form className="form card" onSubmit={handleSubmit} noValidate>
        <h2>Novo procedimento</h2>
        <label htmlFor="p-name">Nome</label>
        <input id="p-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <label htmlFor="p-time">Tempo (minutos)</label>
        <input id="p-time" type="number" min="5" step="5" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
        <label htmlFor="p-price">Valor (R$)</label>
        <input id="p-price" type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
        <fieldset>
          <legend>Pode ser feito junto com</legend>
          <div className="slots">
            {procedures.map((p) => (
              <label key={p.id} className="chip">
                <input
                  type="checkbox"
                  checked={combinesWith.includes(p.id)}
                  onChange={() => setCombinesWith((prev) => (prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]))}
                />
                <span>{p.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {error && <small className="error" role="alert">{error}</small>}
        <button type="submit" className="primary">Salvar procedimento</button>
      </form>

      <ul className="cards">
        {procedures.map((p) => (
          <li key={p.id} className="card">
            <strong>{p.name}</strong>
            <span>{formatDuration(p.durationMin)} · {money(p.price)}</span>
            <small>
              Combina com:{' '}
              {procedures.filter((o) => o.id !== p.id && (p.combinesWith.includes(o.id) || o.combinesWith.includes(p.id))).map((o) => o.name).join(', ') || 'nenhum'}
            </small>
          </li>
        ))}
      </ul>
    </div>
  )
}
