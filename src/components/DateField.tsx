import { ui } from '../styles'
type Props = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  min: string
  max: string
}

export function DateField({ id, label, value, onChange, min, max }: Props) {
  return (
    <div className={ui.scheduleDate}>
      <img src="/figma/calendar.svg" alt="" />
      <input id={id} aria-label={label} type="date" value={value} min={min} max={max} onChange={(e) => onChange(e.target.value)} />
      <img className={ui.dateChevron} src="/figma/chevron.svg" alt="" />
    </div>
  )
}
