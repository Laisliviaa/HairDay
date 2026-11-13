import { useState } from 'react'
import { SalonProvider } from './context/SalonContext'
import { DayGrid } from './components/DayGrid'
import { BookingDialog, type BookingTarget } from './components/BookingDialog'
import { ProceduresPage } from './components/ProceduresPage'
import { EmployeesPage } from './components/EmployeesPage'
import { longDate, shiftDate, today } from './utils/helpers'

type Tab = 'agenda' | 'procedures' | 'employees'

const TABS: { key: Tab; label: string }[] = [
  { key: 'agenda', label: 'Agenda' },
  { key: 'procedures', label: 'Procedimentos' },
  { key: 'employees', label: 'Equipe' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('agenda')
  const [date, setDate] = useState(today())
  const [booking, setBooking] = useState<BookingTarget | null>(null)

  return (
    <SalonProvider>
      <header className="topbar">
        <h1 className="logo"><span className="pole" aria-hidden="true" />HairDay</h1>
        <nav aria-label="Seções">
          {TABS.map((t) => (
            <button key={t.key} type="button" aria-current={tab === t.key ? 'page' : undefined} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
          {/* espaço reservado para a futura aba de clientes */}
          <button type="button" disabled title="Em breve">Clientes</button>
        </nav>
      </header>

      <main className="content">
        {tab === 'agenda' && (
          <>
            <div className="daybar">
              <div className="daynav">
                <button type="button" aria-label="Dia anterior" onClick={() => setDate(shiftDate(date, -1))}>‹</button>
                <h2>{longDate(date)}</h2>
                <button type="button" aria-label="Próximo dia" onClick={() => setDate(shiftDate(date, 1))}>›</button>
              </div>
              <div className="dayactions">
                <input type="date" aria-label="Data da agenda" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
                <button type="button" className="primary" onClick={() => setBooking({ date, employeeId: '', time: '' })}>Novo agendamento</button>
              </div>
            </div>
            <DayGrid date={date} onNew={(employeeId, time) => setBooking({ date, employeeId, time })} />
            <BookingDialog target={booking} onClose={() => setBooking(null)} onSaved={setDate} />
          </>
        )}
        {tab === 'procedures' && <ProceduresPage />}
        {tab === 'employees' && <EmployeesPage />}
      </main>
    </SalonProvider>
  )
}
