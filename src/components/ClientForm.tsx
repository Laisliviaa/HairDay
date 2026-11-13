import { useState, type FormEvent } from 'react'
import { useSalon } from '../context/SalonContext'
import { useI18n, type Key } from '../i18n'
import { formatCPF, formatPhone, isValidCPF, isValidEmail, isValidPhone, minName, onlyDigits, sameName } from '../utils/helpers'

type Props = { onSaved?: (id: string) => void; onCancel?: () => void }

export function ClientForm({ onSaved, onCancel }: Props) {
  const { t } = useI18n()
  const { clients, addClient } = useSalon()
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<Key[]>([])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found: Key[] = []
    if (!minName(name)) found.push('err.name3')
    else if (clients.some((c) => sameName(c.name, name))) found.push('err.nameDup')
    if (cpf) {
      if (!isValidCPF(cpf)) found.push('err.cpf')
      else if (clients.some((c) => c.cpf === onlyDigits(cpf))) found.push('err.cpfDup')
    }
    if (!isValidPhone(phone)) found.push('err.phone')
    if (email && !isValidEmail(email)) found.push('err.email')
    setErrors(found)
    if (found.length > 0) return
    const id = addClient({ name: name.trim(), cpf: onlyDigits(cpf), phone: onlyDigits(phone), email: email.trim() })
    setName(''); setCpf(''); setPhone(''); setEmail('')
    onSaved?.(id)
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <h2>{t('cf.title')}</h2>
      <label htmlFor="c-name">{t('cf.name')}</label>
      <input id="c-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="two">
        <div>
          <label htmlFor="c-cpf">{t('cf.cpf')}</label>
          <input id="c-cpf" type="text" inputMode="numeric" value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} />
        </div>
        <div>
          <label htmlFor="c-phone">{t('cf.phone')}</label>
          <input id="c-phone" type="text" inputMode="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} />
        </div>
      </div>
      <label htmlFor="c-email">{t('cf.email')}</label>
      <input id="c-email" type="text" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      {errors.map((k) => <small key={k} className="error" role="alert">{t(k)}</small>)}
      <div className="actions">
        {onCancel && <button type="button" className="ghost" onClick={onCancel}>{t('common.cancel')}</button>}
        <button type="submit" className="primary">{t('cf.save')}</button>
      </div>
    </form>
  )
}
