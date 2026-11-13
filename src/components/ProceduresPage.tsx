import { useState, type FormEvent } from 'react'
import { useSalon } from '../context/SalonContext'
import { useI18n, type Key } from '../i18n'
import { DEFAULT_LABEL, EPOCH, MAX_DATE, SWATCHES, formatDuration, minName, money, monthLabel, priceOn, sameName, thisMonth, today } from '../utils/helpers'

type Row = { key: string; label: string; minutes: string; price: string }
const newRow = (): Row => ({ key: crypto.randomUUID(), label: '', minutes: '', price: '' })
const toNumber = (s: string) => Number(s.replace(',', '.'))

export function ProceduresPage() {
  const { t, tl } = useI18n()
  const { procedures, addProcedure, removeProcedure, addPriceChange, whyNotProcedure } = useSalon()
  const [name, setName] = useState('')
  const [color, setColor] = useState(SWATCHES[procedures.length % SWATCHES.length])
  const [combinesWith, setCombinesWith] = useState<string[]>([])
  const [rows, setRows] = useState<Row[]>([newRow()])
  const [error, setError] = useState<Key | ''>('')
  const [notice, setNotice] = useState('')

  const allVariants = procedures.flatMap((p) => p.variants.map((v) => ({ p, v })))
  const [raiseVariant, setRaiseVariant] = useState('')
  const [raisePrice, setRaisePrice] = useState('')
  const [raiseMonth, setRaiseMonth] = useState('')
  const [raiseError, setRaiseError] = useState<Key | ''>('')

  const updateRow = (key: string, patch: Partial<Row>) => setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!minName(name)) return setError('err.name3')
    if (procedures.some((p) => sameName(tl(p.name), name))) return setError('err.nameDup')
    for (const r of rows) {
      if (rows.length > 1 && !r.label.trim()) return setError('pr.errVariantName')
      if (!(toNumber(r.minutes) > 0) || r.price === '' || !(toNumber(r.price) >= 0)) return setError('pr.errVariantNums')
    }
    addProcedure({
      name: name.trim(), color, combinesWith,
      variants: rows.map((r) => ({ id: crypto.randomUUID(), label: r.label.trim() || DEFAULT_LABEL, durationMin: toNumber(r.minutes), prices: [{ from: EPOCH, value: toNumber(r.price) }] })),
    })
    setName(''); setCombinesWith([]); setRows([newRow()]); setError('')
    setColor(SWATCHES[(procedures.length + 1) % SWATCHES.length])
  }

  function handleRaise(event: FormEvent) {
    event.preventDefault()
    const value = toNumber(raisePrice)
    if (!raiseVariant) return setRaiseError('pr.errPickProc')
    if (raisePrice === '' || !(value >= 0)) return setRaiseError('pr.errValue')
    if (!raiseMonth || raiseMonth < thisMonth() || raiseMonth > MAX_DATE.slice(0, 7)) return setRaiseError('pr.errMonth')
    addPriceChange(raiseVariant, { from: raiseMonth, value })
    setRaisePrice(''); setRaiseMonth(''); setRaiseError('')
  }

  function remove(id: string, label: string) {
    const why = whyNotProcedure(id)
    if (why) return setNotice(why)
    if (window.confirm(t('pr.confirm', { name: label }))) { removeProcedure(id); setNotice('') }
  }

  return (
    <div className="page">
      <div className="stack">
        <form className="form panel" onSubmit={handleSubmit} noValidate>
          <h2>{t('pr.new')}</h2>
          <label htmlFor="p-name">{t('pr.name')}</label>
          <input id="p-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />

          <fieldset>
            <legend>{t('pr.timeValue')}</legend>
            <p className="hint">{t('pr.timeHint')}</p>
            {rows.map((r) => (
              <div key={r.key} className="variant-row">
                <input type="text" placeholder={t('pr.variant')} aria-label={t('pr.variantLabel')} value={r.label} onChange={(e) => updateRow(r.key, { label: e.target.value })} />
                <input type="number" min="5" step="5" placeholder={t('pr.min')} aria-label={t('pr.minLabel')} value={r.minutes} onChange={(e) => updateRow(r.key, { minutes: e.target.value })} />
                <input type="text" inputMode="decimal" placeholder="R$" aria-label={t('pr.valueLabel')} value={r.price} onChange={(e) => updateRow(r.key, { price: e.target.value })} />
                {rows.length > 1 && <button type="button" className="ghost" aria-label={t('pr.removeVariant')} onClick={() => setRows((prev) => prev.filter((x) => x.key !== r.key))}>×</button>}
              </div>
            ))}
            <button type="button" className="ghost" onClick={() => setRows((prev) => [...prev, newRow()])}>{t('pr.addVariant')}</button>
          </fieldset>

          <fieldset>
            <legend>{t('pr.color')}</legend>
            <div className="swatches">
              {SWATCHES.map((c) => (
                <label key={c} className="swatch">
                  <input type="radio" name="color" checked={color === c} onChange={() => setColor(c)} aria-label={t('pr.colorOf', { c })} />
                  <span style={{ background: c }} />
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>{t('pr.combine')}</legend>
            <div className="chips">
              {procedures.map((p) => (
                <label key={p.id} className="chip">
                  <input type="checkbox" checked={combinesWith.includes(p.id)} onChange={() => setCombinesWith((prev) => (prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]))} />
                  <span><i style={{ background: p.color }} />{tl(p.name)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {error && <small className="error" role="alert">{t(error)}</small>}
          <button type="submit" className="primary">{t('pr.save')}</button>
        </form>

        <form className="form panel" onSubmit={handleRaise} noValidate>
          <h2>{t('pr.raiseTitle')}</h2>
          <p className="hint">{t('pr.raiseHint')}</p>
          <label htmlFor="r-var">{t('pr.raiseProc')}</label>
          <select id="r-var" value={raiseVariant} onChange={(e) => setRaiseVariant(e.target.value)}>
            <option value="">{t('common.select')}</option>
            {allVariants.map(({ p, v }) => <option key={v.id} value={v.id}>{tl(p.name)}{v.label !== DEFAULT_LABEL && ` · ${tl(v.label)}`} {t('pr.today', { v: money(priceOn(v, today())) })}</option>)}
          </select>
          <div className="two">
            <div>
              <label htmlFor="r-price">{t('pr.newValue')}</label>
              <input id="r-price" type="text" inputMode="decimal" value={raisePrice} onChange={(e) => setRaisePrice(e.target.value)} />
            </div>
            <div>
              <label htmlFor="r-month">{t('pr.from')}</label>
              <input id="r-month" type="month" min={thisMonth()} max={MAX_DATE.slice(0, 7)} value={raiseMonth} onChange={(e) => setRaiseMonth(e.target.value)} />
            </div>
          </div>
          {raiseError && <small className="error" role="alert">{t(raiseError)}</small>}
          <button type="submit" className="primary">{t('pr.raiseSubmit')}</button>
        </form>
      </div>

      <div>
        {notice && <p className="notice" role="alert">{notice}</p>}
        <ul className="list">
          {procedures.map((p) => (
            <li key={p.id} style={{ borderLeftColor: p.color }}>
              <strong>{tl(p.name)}</strong>
              {p.variants.map((v) => {
                const upcoming = v.prices.filter((x) => x.from > thisMonth()).sort((a, b) => a.from.localeCompare(b.from))
                return (
                  <div key={v.id} className="variant">
                    <span>{v.label !== DEFAULT_LABEL && <b>{tl(v.label)} · </b>}{formatDuration(v.durationMin)} · {money(priceOn(v, today()))}</span>
                    {upcoming.map((x) => <small key={x.from} className="alert">{t('pr.alert', { v: money(x.value), m: monthLabel(x.from) })}</small>)}
                    {v.prices.length > 1 && (
                      <details>
                        <summary>{t('pr.history')}</summary>
                        <ul className="history">
                          {[...v.prices].sort((a, b) => b.from.localeCompare(a.from)).map((x) => (
                            <li key={x.from}>{x.from === EPOCH ? t('pr.initial') : t('pr.fromMonth', { m: monthLabel(x.from) })}: {money(x.value)}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                )
              })}
              <small>
                {t('pr.combinesWith', { list: procedures.filter((o) => o.id !== p.id && (p.combinesWith.includes(o.id) || o.combinesWith.includes(p.id))).map((o) => tl(o.name)).join(', ') || t('pr.none') })}
              </small>
              <button type="button" className="danger small" onClick={() => remove(p.id, tl(p.name))}>{t('pr.delete')}</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
