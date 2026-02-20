import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { translations, type Translations } from '@/constants'
import KitchenView from '@/components/kitchen/KitchenView'

function App() {
  const { language } = useSettingsStore()
  const t: Translations = translations[language]
  return <KitchenView t={t} />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
