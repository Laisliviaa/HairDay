import type { Appointment, Client, Employee, Procedure } from '../types/salon'
import type { Key } from '../i18n'
import { longDate, money, serviceLabel, toMinutes, toTime } from './helpers'

type T = (key: Key, params?: Record<string, string | number>) => string
type TL = (label: string) => string

export const servicesText = (a: Appointment, procedures: Procedure[], tl: TL) =>
  a.items.length ? a.items.map((i) => serviceLabel(procedures, i, tl)).join(' + ') : tl('@sch.simple')

function whatText(a: Appointment, procedures: Procedure[], t: T, tl: TL, employee?: Employee) {
  const when = t('msg.when', { date: longDate(a.date), time: a.time })
  return `${servicesText(a, procedures, tl)}, ${when}${employee ? t('msg.with', { name: employee.name }) : ''}`
}

export function whatsappLink(client: Client, kind: 'confirm' | 'reminder', a: Appointment, procedures: Procedure[], t: T, tl: TL, employee?: Employee) {
  const rest = a.total - a.paid
  const pay = rest > 0 ? t('msg.payRest', { v: money(rest) }) : t('msg.payDone')
  const text = t(kind === 'confirm' ? 'msg.confirm' : 'msg.reminder', {
    name: client.name.trim().split(' ')[0],
    what: whatText(a, procedures, t, tl, employee),
    pay,
  })
  return `https://wa.me/55${client.phone}?text=${encodeURIComponent(text)}`
}

const stamp = (date: string, time: string) => `${date.replace(/-/g, '')}T${time.replace(':', '')}00`

function icsText(a: Appointment, client: Client, procedures: Procedure[], tl: TL, employee?: Employee) {
  const end = toTime(toMinutes(a.time) + a.durationMin)
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HairDay//PT-BR', 'BEGIN:VEVENT',
    `UID:${a.id}@hairday`, `DTSTAMP:${now}`,
    `DTSTART:${stamp(a.date, a.time)}`, `DTEND:${stamp(a.date, end)}`,
    `SUMMARY:HairDay - ${servicesText(a, procedures, tl)}`,
    `DESCRIPTION:${client.name}${employee ? ` / ${employee.name}` : ''}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadInvite(a: Appointment, client: Client, procedures: Procedure[], tl: TL, employee?: Employee) {
  const blob = new Blob([icsText(a, client, procedures, tl, employee)], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'hairday-agendamento.ics'
  link.click()
  URL.revokeObjectURL(url)
}

export function mailtoLink(a: Appointment, client: Client, procedures: Procedure[], t: T, tl: TL, employee?: Employee) {
  const subject = t('mail.subject', { date: longDate(a.date), time: a.time })
  const body = t('mail.body', { name: client.name.split(' ')[0], what: whatText(a, procedures, t, tl, employee) })
  return `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
