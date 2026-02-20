import { useSettingsStore } from '@/stores/useSettingsStore'
import { translations, type Translations } from '@/constants'
import LandingPage from '@/components/landing/LandingPage'
import CustomerView from '@/components/customer/CustomerView'
import KitchenView from '@/components/kitchen/KitchenView'
import QueueView from '@/components/queue/QueueView'

export type TProps = { t: Translations }

export default function App() {
  const { currentView, language } = useSettingsStore()
  const t: Translations = translations[language]

  return (
    <div className="min-h-dvh bg-[hsl(var(--background))]">
      {currentView === 'landing' && <LandingPage t={t} />}
      {currentView === 'customer' && <CustomerView t={t} />}
      {currentView === 'kitchen' && <KitchenView t={t} />}
      {currentView === 'queue' && <QueueView t={t} />}
    </div>
  )
}
