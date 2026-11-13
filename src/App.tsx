import { useState } from 'react'
import { I18nProvider, useI18n, type Lang } from './i18n'
import { SalonProvider, useSalon } from './context/SalonContext'
import { DayGrid } from './components/DayGrid'
import { BookingDialog, type BookingTarget } from './components/BookingDialog'
import { AppointmentDetail } from './components/AppointmentDetail'
import { BlockDialog } from './components/BlockDialog'
import { ClientsPage } from './components/ClientsPage'
import { ProceduresPage } from './components/ProceduresPage'
import { EmployeesPage } from './components/EmployeesPage'
import { Flag } from './components/Flag'
import { MAX_DATE, MIN_DATE, STATUS_KEY, inRange, longDate, shiftDate, today, worksOn } from './utils/helpers'

type Tab = 'agenda' | 'clients' | 'procedures' | 'employees'

const TABS = [
  { key: 'agenda', label: 'app.agenda' },
  { key: 'clients', label: 'app.clients' },
  { key: 'procedures', label: 'app.procedures' },
  { key: 'employees', label: 'app.team' },
] as const

const LANGS: { key: Lang; name: string }[] = [
  { key: 'pt', name: 'Português (Brasil)' },
  { key: 'en', name: 'English' },
  { key: 'es', name: 'Español' },
]

function Agenda() {
  const { t } = useI18n()
  const { employees } = useSalon()
  const [date, setDate] = useState(today())
  const [filter, setFilter] = useState('')
  const [booking, setBooking] = useState<BookingTarget | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [blockOpen, setBlockOpen] = useState(false)

  const visible = filter ? employees.filter((e) => e.id === filter) : employees
  const nobodyWorks = visible.length > 0 && visible.every((e) => !worksOn(e, date))

  return (
    <>
      <div className="daybar">
        <div className="daynav">
          <button type="button" aria-label={t('agenda.prev')} disabled={date <= MIN_DATE} onClick={() => setDate(shiftDate(date, -1))}>‹</button>
          <h2>{longDate(date)}</h2>
          <button type="button" aria-label={t('agenda.next')} disabled={date >= MAX_DATE} onClick={() => setDate(shiftDate(date, 1))}>›</button>
        </div>
        <div className="dayactions">
          <input type="date" aria-label={t('agenda.date')} min={MIN_DATE} max={MAX_DATE} value={date} onChange={(e) => inRange(e.target.value) && setDate(e.target.value)} />
          <select aria-label={t('agenda.filter')} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">{t('agenda.all')}</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <button type="button" className="ghost" onClick={() => setBlockOpen(true)}>{t('agenda.block')}</button>
          <button type="button" className="primary" onClick={() => setBooking({ date, employeeId: filter, time: '' })}>{t('agenda.new')}</button>
        </div>
      </div>

      <ul className="legend" aria-label={t('agenda.legend')}>
        {(['scheduled', 'confirmed', 'done', 'noshow'] as const).map((s) => (
          <li key={s}><i data-status={s} />{t(STATUS_KEY[s])}</li>
        ))}
        <li><i className="lockkey" />{t('agenda.lock')}</li>
      </ul>

      {nobodyWorks && <p className="notice" role="status">{t('agenda.allOff')}</p>}
      {visible.length === 0 ? <p className="notice">{t('agenda.noEmp')}</p> : (
        <DayGrid date={date} employees={visible} onNew={(employeeId, time) => setBooking({ date, employeeId, time })} onOpen={setDetailId} />
      )}

      <BookingDialog target={booking} onClose={() => setBooking(null)} onSaved={setDate} />
      <AppointmentDetail id={detailId} onClose={() => setDetailId(null)} />
      <BlockDialog open={blockOpen} date={date} employeeId={filter} onClose={() => setBlockOpen(false)} />
    </>
  )
}

function Shell() {
  const { t, lang, setLang, theme, toggleTheme } = useI18n()
  const [tab, setTab] = useState<Tab>('agenda')

  return (
    <>
      <header className="topbar">
        <h1 className="logo"><span className="pole" aria-hidden="true" />HairDay</h1>
        <nav aria-label={t('app.sections')}>
          {TABS.map((x) => (
            <button key={x.key} type="button" aria-current={tab === x.key ? 'page' : undefined} onClick={() => setTab(x.key)}>
              {t(x.label)}
            </button>
          ))}
        </nav>
        <div className="tools">
          <div className="langs" role="group" aria-label={t('app.lang')}>
            {LANGS.map((l) => (
              <button key={l.key} type="button" aria-pressed={lang === l.key} title={l.name} aria-label={l.name} onClick={() => setLang(l.key)}>
                <Flag lang={l.key} />
              </button>
            ))}
          </div>
          <button type="button" className="themebtn" onClick={toggleTheme} title={theme === 'light' ? t('app.toDark') : t('app.toLight')} aria-label={theme === 'light' ? t('app.toDark') : t('app.toLight')}>
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            )}
          </button>
        </div>
      </header>

      <main className="content">
        {tab === 'agenda' && <Agenda />}
        {tab === 'clients' && <ClientsPage />}
        {tab === 'procedures' && <ProceduresPage />}
        {tab === 'employees' && <EmployeesPage />}
      </main>
    </>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <SalonProvider>
        <Shell />
      </SalonProvider>
    </I18nProvider>
  )
}
