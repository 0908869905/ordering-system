import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { translations, type Translations } from '@/constants'
import QueueView from '@/components/queue/QueueView'

function App() {
  const { language } = useSettingsStore()
  const t: Translations = translations[language]
  return <QueueView t={t} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
