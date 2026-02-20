import { useState } from 'react'
import { Volume2, VolumeX, RotateCcw, Key, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useOrderStore } from '@/stores/useOrderStore'
import { hashPassword, generateSalt, MIN_PASSWORD_LENGTH } from '@/lib/crypto'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-primary-500' : 'bg-warm-300'}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`}
      />
    </button>
  )
}

export default function KitchenSettings({ t }: Props) {
  const {
    stallName,
    setStallName,
    soundEnabled,
    setSoundEnabled,
    speechEnabled,
    setSpeechEnabled,
    volume,
    setVolume,
    setPasswordHash,
    setPasswordSalt,
  } = useSettingsStore()
  const { resetOrders, resetCounter } = useOrderStore()

  const [editStallName, setEditStallName] = useState(stallName)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState(false)

  const handleSaveStallName = () => {
    if (editStallName.trim()) {
      setStallName(editStallName.trim())
    }
  }

  const handleChangePassword = async () => {
    setPwdError('')
    setPwdSuccess(false)
    if (!newPassword) return
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPwdError(t.passwordTooShort)
      return
    }
    if (newPassword !== confirmPwd) {
      setPwdError(t.passwordMismatch)
      return
    }
    const salt = generateSalt()
    const hash = await hashPassword(newPassword, salt)
    setPasswordSalt(salt)
    setPasswordHash(hash)
    setNewPassword('')
    setConfirmPwd('')
    setPwdSuccess(true)
  }

  return (
    <div className="p-4">
      {/* Stall Name */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <Store className="h-4 w-4" />
            {t.stallName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={editStallName}
              onChange={(e) => setEditStallName(e.target.value)}
              className="h-9"
            />
            <Button size="sm" onClick={handleSaveStallName}>
              {t.save}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            {t.soundEnabled}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t.soundEnabled}</span>
              <ToggleSwitch checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t.speechEnabled}</span>
              <ToggleSwitch checked={speechEnabled} onChange={() => setSpeechEnabled(!speechEnabled)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">{t.volume}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="w-8 text-right text-sm">{volume}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <Key className="h-4 w-4" />
            {t.setPassword}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Input
              type="password"
              placeholder={t.newPassword}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setPwdError('')
                setPwdSuccess(false)
              }}
              className="h-9"
            />
            <Input
              type="password"
              placeholder={t.confirmPassword}
              value={confirmPwd}
              onChange={(e) => {
                setConfirmPwd(e.target.value)
                setPwdError('')
                setPwdSuccess(false)
              }}
              className="h-9"
            />
            {pwdError && (
              <p className="text-xs text-[hsl(var(--destructive))]">{pwdError}</p>
            )}
            {pwdSuccess && (
              <p className="text-xs text-[hsl(var(--success))]">
                {t.passwordUpdated}
              </p>
            )}
            <Button size="sm" onClick={handleChangePassword}>
              {t.save}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Data */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 font-heading text-base">
            <RotateCcw className="h-4 w-4" />
            {t.resetData}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(t.confirmResetOrders)) resetOrders()
              }}
            >
              {t.resetOrders}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(t.confirmResetCounter)) resetCounter()
              }}
            >
              {t.resetCounter}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
