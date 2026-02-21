import { useState } from 'react'
import { Volume2, VolumeX, RotateCcw, Key, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
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
      className={`toggle-switch relative h-7 w-12 transition-colors ${checked ? 'bg-primary-600' : 'bg-warm-700'}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-6 w-6 transition-transform ${checked ? 'translate-x-5' : ''} toggle-knob`}
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
  const [pendingAction, setPendingAction] = useState<{ message: string; action: () => void } | null>(null)

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
    <div className="p-4 animate-fade-in">
      {/* Stall Name */}
      <div className="mb-5 organic-radius border border-warm-800/30 bg-[#2e2a22] p-4">
        <h3 className="flex items-center gap-2 font-heading text-base font-semibold mb-3 text-warm-200">
          <Store className="h-4 w-4 text-primary-400" />
          {t.stallName}
        </h3>
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
      </div>

      <div className="brush-divider mx-auto w-24 mb-5" style={{ opacity: 0.25 }} />

      {/* Sound Settings */}
      <div className="mb-5 organic-radius-alt border border-warm-800/30 bg-[#2e2a22] p-4">
        <h3 className="flex items-center gap-2 font-heading text-base font-semibold mb-3 text-warm-200">
          {soundEnabled ? (
            <Volume2 className="h-4 w-4 text-primary-400" />
          ) : (
            <VolumeX className="h-4 w-4 text-warm-500" />
          )}
          {t.soundEnabled}
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-heading text-warm-300">{t.soundEnabled}</span>
            <ToggleSwitch checked={soundEnabled} onChange={() => setSoundEnabled(!soundEnabled)} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-heading text-warm-300">{t.speechEnabled}</span>
            <ToggleSwitch checked={speechEnabled} onChange={() => setSpeechEnabled(!speechEnabled)} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-heading text-warm-300 shrink-0">{t.volume}</span>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="volume-slider flex-1"
            />
            <span className="w-10 text-right text-sm font-mono text-warm-400">{volume}%</span>
          </div>
        </div>
      </div>

      <div className="brush-divider mx-auto w-24 mb-5" style={{ opacity: 0.25 }} />

      {/* Password */}
      <div className="mb-5 organic-radius border border-warm-800/30 bg-[#2e2a22] p-4">
        <h3 className="flex items-center gap-2 font-heading text-base font-semibold mb-3 text-warm-200">
          <Key className="h-4 w-4 text-primary-400" />
          {t.setPassword}
        </h3>
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
            <p className="text-xs text-accent-500 animate-fade-in">{pwdError}</p>
          )}
          {pwdSuccess && (
            <p className="text-xs text-emerald-400 animate-fade-in">
              {t.passwordUpdated}
            </p>
          )}
          <Button size="sm" onClick={handleChangePassword}>
            {t.save}
          </Button>
        </div>
      </div>

      <div className="brush-divider mx-auto w-24 mb-5" style={{ opacity: 0.25 }} />

      {/* Reset Data */}
      <div className="organic-radius-alt border border-warm-800/30 bg-[#2e2a22] p-4">
        <h3 className="flex items-center gap-2 font-heading text-base font-semibold mb-3 text-accent-400">
          <RotateCcw className="h-4 w-4" />
          {t.resetData}
        </h3>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-warm-600/30 text-warm-300 hover:text-accent-400 hover:border-accent-500/30"
            onClick={() => setPendingAction({ message: t.confirmResetOrders, action: resetOrders })}
          >
            {t.resetOrders}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-warm-600/30 text-warm-300 hover:text-accent-400 hover:border-accent-500/30"
            onClick={() => setPendingAction({ message: t.confirmResetCounter, action: resetCounter })}
          >
            {t.resetCounter}
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={!!pendingAction}
        message={pendingAction?.message ?? ''}
        confirmLabel={t.confirm}
        cancelLabel={t.back}
        onConfirm={() => { pendingAction?.action(); setPendingAction(null) }}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  )
}
