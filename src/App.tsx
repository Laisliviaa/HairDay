import { useState } from 'react'
import { SalonProvider } from './context/SalonContext'
import { AppointmentForm } from './components/AppointmentForm'
import { AppointmentList } from './components/AppointmentList'
import { ProceduresPage } from './components/ProceduresPage'
import { EmployeesPage } from './components/EmployeesPage'
import { today } from './utils/helpers'

type Tab = 'agenda' | 'procedures' | 'employees'

const TABS: { key: Tab; label: string }[] = [
  { key: 'agenda', label: 'Agenda' },
  { key: 'procedures', label: 'Procedimentos' },
  { key: 'employees', label: 'Equipe' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('agenda')
  const [agendaDate, setAgendaDate] = useState(today())

  return (
    <SalonProvider>
      <header className="topbar">
        <h1 className="logo">HairDay</h1>
        <nav aria-label="Seções">
          {TABS.map((t) => (
            <button key={t.key} type="button" aria-current={tab === t.key ? 'page' : undefined} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
          {/* espaço para a futura aba de clientes */}
          <button type="button" disabled title="Em breve">Clientes</button>
        </nav>
      </header>

      {tab === 'agenda' && (
        <div className="layout">
          <aside className="sidebar">
            <AppointmentForm onScheduled={setAgendaDate} />
          </aside>
          <main>
            <AppointmentList date={agendaDate} onDateChange={setAgendaDate} />
          </main>
        </div>
      )}
      {tab === 'procedures' && <main className="layout single"><ProceduresPage /></main>}
      {tab === 'employees' && <main className="layout single"><EmployeesPage /></main>}
    </SalonProvider>
  )
}
