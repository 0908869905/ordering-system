import React, { useState, useEffect, useRef } from 'react';
import { Peer } from 'peerjs';
import { Wifi, WifiOff, Loader2, Megaphone, Volume2, VolumeX, Maximize2, Minimize2, ArrowLeft } from 'lucide-react';
import { Order, OrderStatus, PeerMessage } from '../types';
import { STORAGE_KEY, FIXED_KITCHEN_ID } from '../constants';
import { useLanguage } from '../LanguageContext';

interface QueueViewProps {
  onBack: () => void;
}

export const QueueView: React.FC<QueueViewProps> = ({ onBack }) => {
  const { t, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<any>(null);
  const lastCompletedRef = useRef<string | null>(null); 
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize and unlock audio context on user interaction
  const unlockAudio = () => {
    try {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                audioCtxRef.current = new AudioContext();
            }
        }
        
        const ctx = audioCtxRef.current;
        if (ctx) {
            if (ctx.state === 'suspended') ctx.resume();
            
            // Play a silent buffer to force the audio engine to wake up (iOS hack)
            const buffer = ctx.createBuffer(1, 1, 22050);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
        }

        // Prime TTS (iOS requires this to be triggered by user gesture first)
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance('');
            window.speechSynthesis.speak(utterance);
        }
    } catch (e) {
        console.error("Failed to unlock audio", e);
    }
  };

  // Toggle Fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(e => console.log(e));
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => setIsFullscreen(false));
        }
    }
  };

  // Listen for fullscreen change events (ESC key etc)
  useEffect(() => {
      const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener('fullscreenchange', handleFsChange);
      return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Sound Notification (Chime)
  const playDing = () => {
    if (isMuted) return;
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      
      if (ctx.state === 'suspended') ctx.resume();

      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      // Note 1 (C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.value = 523.25; 
      gain1.gain.setValueAtTime(0.1, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1);
      osc1.start(now);
      osc1.stop(now + 1);

      // Note 2 (E5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 659.25; 
      gain2.gain.setValueAtTime(0.1, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.start(now + 0.2);
      osc2.stop(now + 1.2);

    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  // TTS (Text to Speech)
  const speakOrder = (orderNumber: number) => {
    if (isMuted) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Interrupt previous

      let text = '';
      let lang = 'zh-TW';

      if (language === 'en') {
          text = `Order number ${orderNumber}, ready.`;
          lang = 'en-US';
      } else {
          text = `請 ${orderNumber} 號 顧客取餐`;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; 
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      
      if (lang === 'zh-TW') {
         selectedVoice = voices.find(v => 
            (v.lang === 'zh-TW' || v.lang === 'zh-HK' || v.lang === 'zh-CN') && 
            (v.name.includes('Google') || v.name.includes('Taiwan'))
         ) || voices.find(v => v.lang.startsWith('zh'));
      } else {
         selectedVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'));
      }

      if (selectedVoice) utterance.voice = selectedVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  // Load initial from local storage
  useEffect(() => {
    if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            audioCtxRef.current = new AudioContext();
        }
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOrders(parsed);
        const completed = parsed.filter((o: Order) => o.status === OrderStatus.COMPLETED)
          .sort((a: Order, b: Order) => b.timestamp - a.timestamp);
        if (completed.length > 0) {
            lastCompletedRef.current = completed[0].id;
        } else {
            lastCompletedRef.current = '';
        }
      } catch (e) {}
    }

    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
        console.log("Queue Peer ID:", id);
    });

    peer.on('error', (err) => {
        if (err.type === 'peer-unavailable') {
            return;
        }
        console.error("Queue Peer Error:", err);
    });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (peerRef.current) peerRef.current.destroy();
    };
  }, []);

  // Effect to detect new completed orders and play sound
  useEffect(() => {
    const completed = orders
      .filter(o => o.status === OrderStatus.COMPLETED)
      .sort((a, b) => b.timestamp - a.timestamp); // Newest first

    if (completed.length > 0) {
      const newestId = completed[0].id;
      
      if (lastCompletedRef.current === null) {
          lastCompletedRef.current = newestId;
          return;
      }

      if (lastCompletedRef.current !== newestId) {
        playDing();
        setTimeout(() => {
           speakOrder(completed[0].orderNumber);
        }, 1000); 
      }
      lastCompletedRef.current = newestId;
    } else {
        if (lastCompletedRef.current !== null && lastCompletedRef.current !== '') {
             lastCompletedRef.current = ''; 
        } else if (lastCompletedRef.current === null) {
            lastCompletedRef.current = '';
        }
    }
  }, [orders]);

  const handleStartConnection = () => {
      unlockAudio();
      setShowConnectModal(false);
      connectToKitchen();
  };

  const handleLocalMode = () => {
      unlockAudio();
      setShowConnectModal(false);
  };

  const connectToKitchen = () => {
    const peer = peerRef.current;
    if (!peer || peer.destroyed) return;
    
    if (connRef.current && connRef.current.open) {
        setIsConnected(true);
        return;
    }

    const conn = peer.connect(FIXED_KITCHEN_ID);
    
    conn.on('open', () => {
      setIsConnected(true);
      connRef.current = conn;
    });

    conn.on('data', (data: any) => {
      const msg = data as PeerMessage;
      if (msg.type === 'SYNC_ORDERS') {
        setOrders(msg.payload);
      }
    });

    conn.on('close', () => {
      setIsConnected(false);
      connRef.current = null;
    });
    
    conn.on('error', (err) => {
        setIsConnected(false);
        connRef.current = null;
    });
  };

  // Reconnect Interval
  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setInterval>;
    if (!isConnected && !showConnectModal) {
      reconnectTimer = setInterval(() => {
        connectToKitchen();
      }, 3000); 
    }
    return () => clearInterval(reconnectTimer);
  }, [isConnected, showConnectModal]);

  const preparingOrders = orders
    .filter(o => o.status === OrderStatus.PENDING)
    .sort((a, b) => a.orderNumber - b.orderNumber); 

  const readyOrders = orders
    .filter(o => o.status === OrderStatus.COMPLETED)
    .sort((a, b) => b.timestamp - a.timestamp); // Newest first

  const nowServing = readyOrders.length > 0 ? readyOrders[0] : null;
  const historyOrders = readyOrders.length > 1 ? readyOrders.slice(1, 10) : [];

  return (
    <div className="h-screen bg-slate-950 text-white font-sans overflow-hidden flex flex-col relative">
       {/* Connection Modal */}
       {showConnectModal && !isConnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-slate-700">
            <h3 className="text-2xl font-black text-white mb-4">{t('queue.connectHost')}</h3>
            <p className="text-slate-400 mb-8 text-sm">{t('queue.connectDesc')}</p>
            <button 
              onClick={handleStartConnection}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-xl hover:bg-green-500 transition-colors shadow-lg shadow-green-900/50 flex items-center justify-center gap-2"
            >
              <Volume2 size={24} /> {t('queue.startDisplay')}
            </button>
            <button 
              onClick={handleLocalMode}
              className="mt-6 text-slate-500 text-sm hover:text-slate-300"
            >
              {t('queue.localMode')}
            </button>
          </div>
        </div>
      )}

      {/* Control Bar (Top) */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start pointer-events-none">
          <button 
             onClick={onBack} 
             className="pointer-events-auto bg-slate-800/50 backdrop-blur-md p-3 rounded-full text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="pointer-events-auto flex gap-3">
             <div className={`flex items-center gap-2 px-3 py-2 rounded-full backdrop-blur-md text-xs font-bold border ${isConnected ? 'bg-green-900/30 border-green-500/30 text-green-400' : 'bg-red-900/30 border-red-500/30 text-red-400'}`}>
                {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                {isConnected ? 'ONLINE' : 'OFFLINE'}
             </div>
             
             <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-full backdrop-blur-md border transition-colors ${isMuted ? 'bg-red-900/30 border-red-500/30 text-red-400' : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white'}`}
             >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
             </button>

             <button 
                onClick={toggleFullScreen}
                className="p-2 rounded-full backdrop-blur-md bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white transition-colors"
             >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
             </button>
          </div>
      </div>

      <div className="flex-1 flex w-full h-full">
        {/* Left: Preparing (30%) */}
        <div className="w-[30%] min-w-[320px] bg-slate-900 border-r border-slate-800 flex flex-col relative z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
           <div className="p-6 pb-4 border-b border-slate-800 bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                 <h2 className="text-2xl font-black text-yellow-400 tracking-widest uppercase">{t('queue.preparing')}</h2>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {preparingOrders.length === 0 && (
                  <div className="text-slate-600 font-bold text-center py-20 italic opacity-50">
                      {t('kitchen.noOrders')}
                  </div>
              )}
              {preparingOrders.map(order => (
                  <div key={order.id} className="relative group animate-fade-in-up">
                      <div className="absolute inset-0 bg-yellow-500 blur opacity-10 group-hover:opacity-20 transition-opacity rounded-lg"></div>
                      <div className="relative bg-slate-800/80 border-l-4 border-yellow-500 p-5 rounded-r-xl shadow-lg flex justify-between items-center backdrop-blur-sm">
                          <div>
                              <span className="block text-xs text-yellow-500/70 font-bold uppercase tracking-wider mb-1">Coming Up</span>
                              <span className="text-4xl font-black text-white tracking-tighter">#{order.orderNumber}</span>
                          </div>
                          <Loader2 className="text-yellow-500/20 animate-spin" size={32} />
                      </div>
                  </div>
              ))}
           </div>
        </div>

        {/* Right: Ready (70%) */}
        <div className="flex-1 flex flex-col relative bg-slate-950">
           {/* Background Effects */}
           <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[100px]"></div>
           </div>

           {/* Hero Section */}
           <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-10">
               {nowServing ? (
                   <div className="text-center animate-bounce-in">
                       <div className="inline-block bg-green-500/20 text-green-400 border border-green-500/50 px-6 py-2 rounded-full text-xl font-bold tracking-[0.2em] mb-8 uppercase backdrop-blur-md shadow-[0_0_20px_rgba(74,222,128,0.3)]">
                           {t('queue.nowServing')}
                       </div>
                       <div className="text-[15rem] md:text-[20rem] font-black text-white leading-[0.8] tracking-tighter drop-shadow-[0_0_40px_rgba(34,197,94,0.6)]">
                           {nowServing.orderNumber}
                       </div>
                       <div className="mt-8 text-slate-400 text-2xl font-medium tracking-wide">
                           {t('queue.ready')}
                       </div>
                   </div>
               ) : (
                   <div className="flex flex-col items-center opacity-30">
                       <WifiOff size={100} className="mb-4" />
                       <span className="text-3xl font-bold tracking-widest">{t('queue.waiting')}</span>
                   </div>
               )}
           </div>

           {/* History Strip */}
           <div className="h-40 bg-slate-900/80 border-t border-slate-800 backdrop-blur-md flex flex-col justify-center relative z-20">
               <div className="px-8 mb-2 flex items-center gap-2">
                   <Megaphone size={16} className="text-slate-500" />
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('queue.lastCalled')}</span>
               </div>
               <div className="flex items-center gap-6 px-8 overflow-x-auto pb-4 hide-scrollbar">
                   {historyOrders.map(order => (
                       <div key={order.id} className="shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400">
                           <span className="text-3xl font-black text-slate-300">#{order.orderNumber}</span>
                       </div>
                   ))}
                   {historyOrders.length === 0 && (
                       <span className="text-slate-600 text-sm italic pl-2">No history yet...</span>
                   )}
               </div>
           </div>
        </div>
      </div>

      {/* Marquee Footer */}
      <div className="h-10 bg-black border-t border-slate-800 flex items-center overflow-hidden relative z-50">
          <div className="whitespace-nowrap animate-marquee flex gap-10 text-lg font-bold text-slate-300 tracking-wider">
              <span>🎉 歡迎光臨 FairDay Eats 園遊會點餐系統！ </span>
              <span>📱 掃描 QR Code 線上點餐更快速！ </span>
              <span>⚠️ 過號請至櫃台詢問 </span>
              <span>✅ 號碼顯示紅色代表請稍候，綠色代表可取餐 </span>
              <span>🎉 Welcome to FairDay Eats! Please pick up your order when your number is called.</span>
          </div>
      </div>
    </div>
  );
};