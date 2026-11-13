import { useState, type FormEvent } from 'react'
import { useSalon } from '../context/SalonContext'
import { SWATCHES, formatDuration, money } from '../utils/helpers'

export function ProceduresPage() {
  const { procedures, addProcedure } = useSalon()
  const [name, setName] = useState('')
  const [durationMin, setDurationMin] = useState('')
  const [price, setPrice] = useState('')
  const [color, setColor] = useState(SWATCHES[procedures.length % SWATCHES.length])
  const [combinesWith, setCombinesWith] = useState<string[]>([])
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const duration = Number(durationMin)
    const value = Number(price.replace(',', '.'))
    if (!name.trim() || !(duration > 0) || price === '' || !(value >= 0)) {
      setError('Preencha nome, tempo (em minutos) e valor.')
      return
    }
    addProcedure({ name: name.trim(), durationMin: duration, price: value, color, combinesWith })
    setName(''); setDurationMin(''); setPrice(''); setCombinesWith([]); setError('')
    setColor(SWATCHES[(procedures.length + 1) % SWATCHES.length])
  }

  return (
    <div className="page">
      <form className="form panel" onSubmit={handleSubmit} noValidate>
        <h2>Novo procedimento</h2>
        <label htmlFor="p-name">Nome</label>
        <input id="p-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="two">
          <div>
            <label htmlFor="p-time">Tempo (minutos)</label>
            <input id="p-time" type="number" min="5" step="5" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
          </div>
          <div>
            <label htmlFor="p-price">Valor (R$)</label>
            <input id="p-price" type="text" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
        </div>
        <fieldset>
          <legend>Cor na agenda</legend>
          <div className="swatches">
            {SWATCHES.map((c) => (
              <label key={c} className="swatch">
                <input type="radio" name="color" checked={color === c} onChange={() => setColor(c)} aria-label={`Cor ${c}`} />
                <span style={{ background: c }} />
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Pode ser feito junto com</legend>
          <div className="chips">
            {procedures.map((p) => (
              <label key={p.id} className="chip">
                <input
                  type="checkbox"
                  checked={combinesWith.includes(p.id)}
                  onChange={() => setCombinesWith((prev) => (prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]))}
                />
                <span><i style={{ background: p.color }} />{p.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {error && <small className="error" role="alert">{error}</small>}
        <button type="submit" className="primary">Salvar procedimento</button>
      </form>

      <ul className="list">
        {procedures.map((p) => (
          <li key={p.id} style={{ borderLeftColor: p.color }}>
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
