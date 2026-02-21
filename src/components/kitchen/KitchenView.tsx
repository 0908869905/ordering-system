import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ClipboardList, Package, FileEdit, BarChart3, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useMenuStore } from '@/stores/useMenuStore'
import { usePeerSync } from '@/hooks/usePeerSync'
import ConnectionStatus from '@/components/shared/ConnectionStatus'
import KitchenLogin from './KitchenLogin'
import OrderBoard from './OrderBoard'
import InventoryPanel from './InventoryPanel'
import MenuEditor from './MenuEditor'
import RevenueReport from './RevenueReport'
import KitchenSettings from './KitchenSettings'
import type { Translations } from '@/constants'

interface Props {
  t: Translations
}

type KitchenTab = 'orders' | 'inventory' | 'menu' | 'revenue' | 'settings'

export default function KitchenView({ t }: Props) {
  const { isKitchenAuthenticated, setKitchenAuthenticated, language } =
    useSettingsStore()
  const [activeTab, setActiveTab] = useState<KitchenTab>('orders')
  const peer = usePeerSync()
  const tabBarRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  // Auto-start as host when kitchen view loads
  useEffect(() => {
    if (isKitchenAuthenticated && peer.connectionState === 'disconnected') {
      peer.startHost(`kitchen-${Date.now().toString(36)}`).catch(() => {
        // Silently fail, kitchen works fine in local mode
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKitchenAuthenticated])

  // Auto-broadcast menu/inventory changes to other tabs and connected peers
  useEffect(() => {
    const unsubscribe = useMenuStore.subscribe((state, prevState) => {
      if (state.categories !== prevState.categories) {
        peer.broadcastMenuSync()
      } else if (state.items !== prevState.items) {
        peer.broadcastInventorySync()
      }
    })
    return unsubscribe
  }, [peer.broadcastMenuSync, peer.broadcastInventorySync])

  // Tab indicator sliding animation
  useEffect(() => {
    if (!tabBarRef.current) return
    const activeBtn = tabBarRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement | null
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      })
    }
  }, [activeTab])

  if (!isKitchenAuthenticated) {
    return <KitchenLogin t={t} />
  }

  const tabs: { id: KitchenTab; label: string; icon: React.ReactNode }[] = [
    { id: 'orders', label: t.orders, icon: <ClipboardList className="!size-4" /> },
    { id: 'inventory', label: t.inventory, icon: <Package className="!size-4" /> },
    { id: 'menu', label: t.menuEditor, icon: <FileEdit className="!size-4" /> },
    { id: 'revenue', label: t.revenue, icon: <BarChart3 className="!size-4" /> },
    { id: 'settings', label: t.settings, icon: <Settings className="!size-4" /> },
  ]

  return (
    <div className="dark flex min-h-dvh flex-col bg-[#1a1714] text-[#f5f1eb] no-select">
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-warm-800/30 bg-[#1a1714] px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-warm-400 hover:bg-warm-800/30"
          onClick={() => window.location.href = '/'}
        >
          <ArrowLeft />
        </Button>
        <h1 className="flex-1 font-heading text-lg font-bold text-primary-400 ink-text">
          {t.kitchenManage}
        </h1>
        <ConnectionStatus
          t={t}
          connectionState={peer.connectionState}
          peerId={peer.peerId}
          connectedPeers={peer.connectedPeers}
          isHost={peer.isHost}
          onStartHost={peer.startHost}
          onConnect={peer.connectToHost}
          onDisconnect={peer.disconnect}
        />
        <Button
          variant="ghost"
          size="sm"
          className="text-warm-400 hover:bg-warm-800/30"
          onClick={() => {
            setKitchenAuthenticated(false)
            window.location.href = '/'
          }}
        >
          <LogOut className="!size-4" />
          {t.logout}
        </Button>
      </header>

      {/* Tab Bar — 滑動指示器 */}
      <div ref={tabBarRef} className="relative flex overflow-x-auto border-b border-warm-800/30 bg-[#1a1714]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex shrink-0 items-center gap-1.5 px-4 py-3 text-sm font-heading font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-400'
                : 'text-warm-500 hover:text-warm-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
        {/* Sliding Indicator */}
        <div
          className="absolute bottom-0 h-[2px] bg-primary-400 transition-all duration-300 ease-out"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto animate-fade-in" key={activeTab}>
        {activeTab === 'orders' && <OrderBoard t={t} language={language} />}
        {activeTab === 'inventory' && <InventoryPanel t={t} language={language} />}
        {activeTab === 'menu' && <MenuEditor t={t} language={language} />}
        {activeTab === 'revenue' && <RevenueReport t={t} language={language} />}
        {activeTab === 'settings' && <KitchenSettings t={t} />}
      </div>
    </div>
  )
}
