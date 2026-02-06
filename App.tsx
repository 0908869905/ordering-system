import React, { useState } from 'react';
import { CustomerView } from './components/CustomerView';
import { KitchenView } from './components/KitchenView';
import { QueueView } from './components/QueueView';
import { ViewMode } from './types';
import { UtensilsCrossed, MonitorPlay, Megaphone, Globe, ArrowRight } from 'lucide-react';
import { LanguageProvider, useLanguage } from './LanguageContext';

const AppContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const { language, setLanguage, t } = useLanguage();

  if (viewMode === 'customer') {
    return <CustomerView onBack={() => setViewMode('landing')} />;
  }

  if (viewMode === 'kitchen') {
    return <KitchenView onBack={() => setViewMode('landing')} />;
  }

  if (viewMode === 'queue') {
    return <QueueView onBack={() => setViewMode('landing')} />;
  }

  // Helper to split text for cleaner display
  const getMainText = (text: string) => text.split('(')[0].trim();
  const getSubText = (text: string) => {
      const match = text.match(/\(([^)]+)\)/);
      return match ? match[1] : '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2.5rem] shadow-2xl w-full max-w-sm md:max-w-md text-center relative overflow-hidden ring-1 ring-white/10 flex flex-col min-h-[600px]">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 opacity-90"></div>

        {/* Language Toggle */}
        <button 
          onClick={() => setLanguage(language === 'zh-Hant' ? 'en' : 'zh-Hant')}
          className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-bold tracking-wider border border-transparent hover:border-white/20 z-10"
        >
          <Globe size={16} />
          {language === 'zh-Hant' ? 'EN' : '中'}
        </button>

        <div className="mt-8 mb-4">
           <h1 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-md">{t('app.title')}</h1>
           <p className="text-indigo-200 text-sm font-medium tracking-wide">{t('app.subtitle')}</p>
        </div>

        <nav className="flex-1 flex flex-col justify-center gap-4 py-2" aria-label="主選單">
          {/* Customer Button - Dominant */}
          <button
            onClick={() => setViewMode('customer')}
            className="animate-breath w-full flex-1 max-h-[320px] group relative overflow-hidden bg-white text-indigo-950 font-bold p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center gap-4 z-10"
          >
            <div className="bg-indigo-50 p-6 rounded-full group-hover:scale-110 transition-transform duration-300 text-indigo-600 shrink-0 ring-4 ring-indigo-100/50">
              <UtensilsCrossed size={56} strokeWidth={2} />
            </div>
            <div className="text-center">
               <span className="block text-3xl font-black mb-1 text-slate-900">{getMainText(t('app.customerBtn'))}</span>
               <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                 {getSubText(t('app.customerBtn')) || 'ORDER NOW'}
               </span>
            </div>
            <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 translate-y-2 group-hover:translate-y-0 duration-300">
                <ArrowRight size={24} />
            </div>
          </button>
        </nav>

        {/* Secondary Buttons Row */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Kitchen Button */}
          <button
            onClick={() => setViewMode('kitchen')}
            className="group flex flex-col items-center justify-center gap-2 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/20 text-indigo-100 p-4 rounded-2xl transition-all hover:border-indigo-400/40 backdrop-blur-sm active:scale-95"
          >
             <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-300 group-hover:text-white transition-colors">
               <MonitorPlay size={20} />
             </div>
             <span className="text-xs font-bold opacity-80 group-hover:opacity-100">{getMainText(t('app.kitchenBtn'))}</span>
          </button>

          {/* Queue Button */}
          <button
            onClick={() => setViewMode('queue')}
            className="group flex flex-col items-center justify-center gap-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/20 text-emerald-100 p-4 rounded-2xl transition-all hover:border-emerald-400/40 backdrop-blur-sm active:scale-95"
          >
             <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-300 group-hover:text-white transition-colors">
               <Megaphone size={20} />
             </div>
             <span className="text-xs font-bold opacity-80 group-hover:opacity-100">{getMainText(t('app.queueBtn'))}</span>
          </button>
        </div>

        <footer className="mt-6 text-indigo-200/30 text-[10px] font-bold tracking-widest uppercase">
          <p>{t('app.footer')}</p>
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;