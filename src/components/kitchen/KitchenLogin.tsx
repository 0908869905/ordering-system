import { useState } from 'react'
import { ChefHat, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { hashPassword } from '@/lib/crypto'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
}

export default function KitchenLogin({ t }: Props) {
  const { passwordHash, passwordSalt, setKitchenAuthenticated } =
    useSettingsStore()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleLogin = async () => {
    const hash = await hashPassword(password, passwordSalt)
    if (hash === passwordHash) {
      setKitchenAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  return (
    <div className="dark flex min-h-dvh flex-col items-center justify-center gap-6 p-6 bg-[#1a1714] text-[#f5f1eb]">
      <Button
        variant="ghost"
        className="absolute left-4 top-4 text-warm-400"
        onClick={() => window.location.href = '/'}
      >
        <ArrowLeft className="!size-5" />
        {t.back}
      </Button>

      <ChefHat className="h-16 w-16 text-primary-400 animate-fade-in" />
      <h1 className="font-decorative text-3xl tracking-[0.1em] ink-text animate-fade-in">
        {t.kitchenLogin}
      </h1>
      <div className="brush-divider w-20" style={{ opacity: 0.4 }} />

      <div className="flex w-full max-w-xs flex-col gap-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <Input
          type="password"
          inputMode="numeric"
          placeholder={t.password}
          value={password}
          className="text-center font-mono text-lg tracking-widest bg-warm-900/30 border-warm-700/50 text-warm-100"
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
          <p className="text-center text-sm text-accent-500 animate-fade-in">
            {t.wrongPassword}
          </p>
        )}
        <Button size="lg" className="woodblock-shadow-accent" onClick={handleLogin}>
          {t.login}
        </Button>
      </div>

      <p className="text-xs text-warm-600 font-heading">
        {t.contactAdmin}
      </p>
    </div>
  )
}
