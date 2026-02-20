import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { translations, type Translations } from '@/constants'
import { useBroadcastListener } from '@/hooks/useBroadcastListener'
import CustomerView from '@/components/customer/CustomerView'

function App() {
  const { language } = useSettingsStore()
  const t: Translations = translations[language]
  useBroadcastListener()
  return (
    <div className="min-h-dvh bg-[hsl(var(--background))]">
      <CustomerView t={t} />
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
