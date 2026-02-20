import { useState } from 'react'
import { ChefHat, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSettingsStore } from '@/stores/useSettingsStore'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export default function KitchenLogin({ t }: Props) {
  const { passwordHash, setKitchenAuthenticated, setCurrentView } =
    useSettingsStore()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleLogin = async () => {
    const hash = await hashPassword(password)
    if (hash === passwordHash) {
      setKitchenAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6">
      <Button
        variant="ghost"
        className="absolute left-4 top-4"
        onClick={() => setCurrentView('landing')}
      >
        <ArrowLeft className="!size-5" />
        {t.back}
      </Button>

      <ChefHat className="h-16 w-16 text-primary-500" />
      <h1 className="font-heading text-2xl font-bold">{t.kitchenLogin}</h1>

      <div className="flex w-full max-w-xs flex-col gap-4">
        <Input
          type="password"
          inputMode="numeric"
          placeholder={t.password}
          value={password}
          className="text-center font-mono text-lg tracking-widest"
          onChange={(e) => {
            setPassword(e.target.value)
            setError(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleLogin()
          }}
          autoFocus
        />
        {error && (
          <p className="text-center text-sm text-[hsl(var(--destructive))]">
            {t.wrongPassword}
          </p>
        )}
        <Button size="lg" onClick={handleLogin}>
          {t.login}
        </Button>
      </div>

      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        預設密碼: 1234
      </p>
    </div>
  )
}
