import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Clock, CheckCircle, RefreshCw, Trash2, Receipt, Share2, Edit, Plus, Minus, X, Save, CheckCheck, CircleDollarSign, Volume2, BarChart3, TrendingUp, Package, Boxes, Ban, FileText, List, CornerDownRight, AlertTriangle, Lock, KeyRound, LogIn, Loader2, Delete, Store, ChefHat, BellRing } from 'lucide-react';
import { Peer, DataConnection } from 'peerjs';
import { STORAGE_KEY, COUNTER_KEY, MENU_ITEMS, FIXED_KITCHEN_ID, KITCHEN_PASSWORD_HASH } from '../constants';
import { Order, OrderStatus, PeerMessage, CartItem, Inventory, MenuOption, MenuItem } from '../types';
import { useLanguage } from '../LanguageContext';

interface KitchenViewProps {
  onBack: () => void;
}

type KitchenRole = 'FRONT_DESK' | 'KITCHEN' | 'PICKUP';

const INVENTORY_KEY = 'fairday_inventory_v1';
const REVENUE_ADJUSTMENT_KEY = 'fairday_revenue_adj_v1';

// Helper component for elapsed time
const ElapsedTime: React.FC<{ timestamp: number }> = ({ timestamp }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - timestamp) / 60000)); // Minutes
        }, 10000); // Update every 10s
        
        setElapsed(Math.floor((Date.now() - timestamp) / 60000));
        return () => clearInterval(interval);
    }, [timestamp]);

    let colorClass = 'text-green-500';
    if (elapsed >= 5) colorClass = 'text-yellow-500';
    if (elapsed >= 10) colorClass = 'text-red-500';

    return (
        <span className={`text-xs font-black ${colorClass} flex items-center gap-1`}>
            {elapsed}m ago
        </span>
    );
};

export const KitchenView: React.FC<KitchenViewProps> = ({ onBack }) => {
  const { t, language } = useLanguage();
  
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);

  // Kitchen Mode State
  const [kitchenMode, setKitchenMode] = useState<'HOST' | 'CLIENT' | 'CONNECTING'>('CONNECTING');
  
  // Role State
  const [activeRole, setActiveRole] = useState<KitchenRole>('FRONT_DESK');

  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<Inventory>({});
  const [isPeerReady, setIsPeerReady] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showStats, setShowStats] = useState(false); 
  const [statsTab, setStatsTab] = useState<'overview' | 'history'>('overview');
  const [showInventory, setShowInventory] = useState(false);
  const [revenueAdjustment, setRevenueAdjustment] = useState<number>(0);
  
  // Numpad State
  const [numPadValue, setNumPadValue] = useState('');
  // 新增：根據 numPadValue 找到第一個未付款且符合號碼的訂單
  const previewOrder = useMemo(() => {
    const targetNum = parseInt(numPadValue);
    if (!targetNum) return null;
    return orders
      .filter(o => o.status === OrderStatus.UNPAID && o.orderNumber === targetNum)
      .sort((a, b) => a.timestamp - b.timestamp)[0] || null;
  }, [numPadValue, orders]);

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'warning' | 'success' } | null>(null);
  
  // Force update for timers every minute
  const [, setTick] = useState(0);
  useEffect(() => {
      const timer = setInterval(() => setTick(t => t + 1), 60000);
      return () => clearInterval(timer);
  }, []);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [toast]);

  // Dangerous Action Confirmation State
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    type: 'reset' | 'clear' | null;
  }>({ isOpen: false, type: null });

  // New state for adding items with options in Edit Modal
  const [addingItemId, setAddingItemId] = useState<string>('');
  const [addingItemOptions, setAddingItemOptions] = useState<Record<string, number>>({});

  const peerRef = useRef<Peer | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // For Host: list of clients. For Client: connection to Host (single item array for simplicity or just ref)
  const connectionsRef = useRef<DataConnection[]>([]);
  const hostConnRef = useRef<DataConnection | null>(null);
  
  // Keep track of processed transaction IDs to deduplicate orders (sync across host instance)
  const processedTxIds = useRef<Set<string>>(new Set());

  // Helpers for translation
  const getItemName = (item: MenuItem | CartItem | {name: string, name_en?: string}) => {
    if ('name_en' in item && item.name_en) {
         return language === 'en' ? item.name_en : item.name;
    }
    const menuItem = MENU_ITEMS.find(m => m.name === item.name); 
    if (menuItem) {
        return language === 'en' ? (menuItem.name_en || menuItem.name) : menuItem.name;
    }
    return item.name;
  };

  const getOptionName = (opt: MenuOption | {name: string, name_en?: string}) => {
    if ('name_en' in opt && opt.name_en) {
        return language === 'en' ? opt.name_en : opt.name;
    }
     for (const item of MENU_ITEMS) {
         if (item.options) {
             const found = item.options.find(o => o.name === opt.name);
             if (found) return language === 'en' ? (found.name_en || found.name) : found.name;
         }
     }
     return opt.name;
  };

  // Helper to strictly find base item from cart ID (prevents m1 matching m11)
  const findBaseItem = (cartId: string) => {
    return MENU_ITEMS.find(m => cartId === m.id || cartId.startsWith(m.id + '-'));
  };

  // Initialize Audio
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
            const buffer = ctx.createBuffer(1, 1, 22050);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
        }
    } catch (e) {
        console.error("Failed to unlock audio", e);
    }
  };

  // Sound Notification
  const playDing = () => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.value = 523.25; 
      gain1.gain.setValueAtTime(0.1, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1);
      osc1.start(now);
      osc1.stop(now + 1);

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

  // Helper to broadcast orders (HOST ONLY)
  const broadcastOrders = (currentOrders: Order[]) => {
    const msg: PeerMessage = { type: 'SYNC_ORDERS', payload: currentOrders };
    connectionsRef.current = connectionsRef.current.filter(conn => conn.open);
    connectionsRef.current.forEach(conn => {
      try { conn.send(msg); } catch (e) { console.error("Failed to send orders", e); }
    });
  };

  // Helper to broadcast inventory (HOST ONLY)
  const broadcastInventory = (currentInventory: Inventory) => {
    const msg: PeerMessage = { type: 'SYNC_INVENTORY', payload: currentInventory };
    connectionsRef.current = connectionsRef.current.filter(conn => conn.open);
    connectionsRef.current.forEach(conn => {
      try { conn.send(msg); } catch (e) { console.error("Failed to send inventory", e); }
    });
  };

  // Helper to broadcast revenue adjustment (HOST ONLY)
  const broadcastRevenueAdjustment = (adjustment: number) => {
    const msg: PeerMessage = { type: 'SYNC_REVENUE_ADJUSTMENT', payload: adjustment };
    connectionsRef.current = connectionsRef.current.filter(conn => conn.open);
    connectionsRef.current.forEach(conn => {
      try { conn.send(msg); } catch (e) { console.error("Failed to send revenue adj", e); }
    });
  };

  // Load Inventory from LocalStorage
  const loadInventory = () => {
    const stored = localStorage.getItem(INVENTORY_KEY);
    if (stored) {
      try {
        setInventory(JSON.parse(stored));
      } catch(e) {}
    } else {
        const initialInv: Inventory = {};
        MENU_ITEMS.forEach(item => {
            initialInv[item.id] = 50;
            if (item.options) {
                item.options.forEach(opt => initialInv[opt.id] = 50);
            }
        });
        setInventory(initialInv);
        localStorage.setItem(INVENTORY_KEY, JSON.stringify(initialInv));
    }
  };

  // Load orders from LocalStorage
  const loadOrders = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        // --- AUTO-FIX: Deduplicate by ID immediately on load ---
        const uniqueOrdersMap = new Map();
        parsed.forEach((o: Order) => {
            if (!uniqueOrdersMap.has(o.id)) {
                uniqueOrdersMap.set(o.id, o);
            } else {
                console.warn("Found duplicate order in storage, removing:", o.id);
            }
        });
        const uniqueOrders = Array.from(uniqueOrdersMap.values()) as Order[];
        
        // If duplicates found, clean up storage immediately
        if (uniqueOrders.length !== parsed.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueOrders));
        }

        setOrders(uniqueOrders.sort((a, b) => b.timestamp - a.timestamp));
      } catch (e) {
        console.error("Failed to parse orders");
      }
    }
  };

  const loadRevenueAdjustment = () => {
      const stored = localStorage.getItem(REVENUE_ADJUSTMENT_KEY);
      if (stored) {
          setRevenueAdjustment(parseInt(stored) || 0);
      }
  };

  const generateNextOrderNumber = () => {
     const stored = localStorage.getItem(STORAGE_KEY);
     const currentOrders: Order[] = stored ? JSON.parse(stored) : [];
     let maxOrderNum = 0;
     currentOrders.forEach(o => { if (o.orderNumber > maxOrderNum) maxOrderNum = o.orderNumber; });
     const persistentCounter = parseInt(localStorage.getItem(COUNTER_KEY) || '0');
     return Math.max(maxOrderNum, persistentCounter) + 1;
  };

  // Security: Hash Password
  const hashPassword = async (pwd: string) => {
      const msgBuffer = new TextEncoder().encode(pwd);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsCheckingPassword(true);
      try {
          const hash = await hashPassword(passwordInput);
          if (hash === KITCHEN_PASSWORD_HASH) {
              setIsAuthenticated(true);
              setLoginError(false);
          } else {
              setLoginError(true);
          }
      } catch (err) {
          console.error("Crypto API error", err);
          alert("瀏覽器不支援加密功能，無法驗證密碼。");
      } finally {
          setIsCheckingPassword(false);
      }
  };

  // Initialize as Host
  const initHostPeer = () => {
      const peer = new Peer(FIXED_KITCHEN_ID);
      peerRef.current = peer;

      peer.on('open', (id) => {
          console.log('Kitchen HOST opened with ID:', id);
          setIsPeerReady(true);
          setKitchenMode('HOST');
      });

      peer.on('connection', (conn) => {
          console.log('Kitchen HOST received connection');
          connectionsRef.current.push(conn);

          conn.on('open', () => {
              // Send initial state to new connection
              const currentOrders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
              const currentInv = JSON.parse(localStorage.getItem(INVENTORY_KEY) || '{}');
              const currentAdj = parseInt(localStorage.getItem(REVENUE_ADJUSTMENT_KEY) || '0');
              
              conn.send({ type: 'SYNC_ORDERS', payload: currentOrders } as PeerMessage);
              conn.send({ type: 'SYNC_INVENTORY', payload: currentInv } as PeerMessage);
              conn.send({ type: 'SYNC_REVENUE_ADJUSTMENT', payload: currentAdj } as PeerMessage);
          });

          conn.on('data', (data: any) => {
              const msg = data as PeerMessage;
              
              if (msg.type === 'SUBMIT_ORDER') {
                  const { items, totalAmount, transactionId } = msg.payload;
                  
                  // Deduplicate based on transactionId
                  if (transactionId && processedTxIds.current.has(transactionId)) {
                      console.warn("Skipping duplicate order with transaction ID:", transactionId);
                      return;
                  }
                  if (transactionId) {
                      processedTxIds.current.add(transactionId);
                      // Cleanup old IDs periodically to avoid memory leak
                      if (processedTxIds.current.size > 200) {
                          const it = processedTxIds.current.values();
                          processedTxIds.current.delete(it.next().value);
                      }
                  }

                  const nextNumber = generateNextOrderNumber();
                  
                  const newOrder: Order = {
                      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                      orderNumber: nextNumber,
                      items,
                      totalAmount,
                      status: OrderStatus.UNPAID,
                      timestamp: Date.now()
                  };
  
                  // Update Inventory
                  const currentInv = JSON.parse(localStorage.getItem(INVENTORY_KEY) || '{}');
                  items.forEach((item: CartItem) => {
                      const baseItem = findBaseItem(item.id);
                      if (baseItem && currentInv[baseItem.id] !== undefined) {
                          currentInv[baseItem.id] = Math.max(0, currentInv[baseItem.id] - item.quantity);
                          
                          // SPECIAL RULE: m1 (Fried Noodles) also consumes 1 Egg (opt-egg)
                          if (baseItem.id === 'm1' && currentInv['opt-egg'] !== undefined) {
                              currentInv['opt-egg'] = Math.max(0, currentInv['opt-egg'] - item.quantity);
                          }
                      }
                      if (item.selectedOptions) {
                          item.selectedOptions.forEach(opt => {
                              if (currentInv[opt.id] !== undefined) {
                                  currentInv[opt.id] = Math.max(0, currentInv[opt.id] - item.quantity);
                              }
                          });
                      }
                  });
                  setInventory(currentInv);
                  localStorage.setItem(INVENTORY_KEY, JSON.stringify(currentInv));
                  broadcastInventory(currentInv);
                  
                  // Check for low stock after order processing
                  let lowStockWarning = '';
                  for (const item of items) {
                      const baseItem = findBaseItem(item.id);
                      if (baseItem) {
                          const stock = currentInv[baseItem.id];
                          if (stock !== undefined && stock < 5) {
                              lowStockWarning = getItemName(baseItem);
                              break;
                          }
                      }
                      if (lowStockWarning) break;
                  }

                  if (lowStockWarning) {
                      setToast({ message: `${t('common.warning')}: ${lowStockWarning} ${t('customer.stock')} < 5`, type: 'warning' });
                  }

                  // Update Orders in LocalStorage and State
                  const currentOrders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
                  
                  // Extra sanity check for duplicate IDs (e.g. from rapid race conditions)
                  if (!currentOrders.find((o: Order) => o.id === newOrder.id)) {
                      const updatedOrders = [newOrder, ...currentOrders].sort((a: Order, b: Order) => b.timestamp - a.timestamp);
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
                      setOrders(updatedOrders);
                      broadcastOrders(updatedOrders);
                      playDing();
                      conn.send({ type: 'ORDER_CREATED', payload: newOrder });
                  } else {
                      conn.send({ type: 'ORDER_CREATED', payload: newOrder });
                  }
              }

              if (msg.type === 'KITCHEN_ACTION') {
                  // Handle actions from Client Kitchens
                  const { action, payload } = msg.payload;
                  handleHostActionProcess(action, payload);
              }
          });
      });

      peer.on('error', (err) => {
          if (err.type === 'unavailable-id') {
              console.warn('Host ID taken, switching to Client mode...');
              peer.destroy();
              initClientPeer();
          } else {
              console.error('Kitchen Peer Error:', err);
              setIsPeerReady(false);
          }
      });
  };

  // Initialize as Client (Secondary Kitchen)
  const initClientPeer = () => {
      const peer = new Peer(); // Random ID
      peerRef.current = peer;

      peer.on('open', (id) => {
          console.log('Kitchen CLIENT opened with ID:', id);
          setKitchenMode('CLIENT');
          connectToHost(peer);
      });
      
      peer.on('error', (err) => {
          console.error("Kitchen Client Error:", err);
      });
  };

  const connectToHost = (peer: Peer) => {
      const conn = peer.connect(FIXED_KITCHEN_ID);
      hostConnRef.current = conn;

      conn.on('open', () => {
          console.log("Connected to Kitchen HOST");
          setIsPeerReady(true);
      });

      conn.on('data', (data: any) => {
          const msg = data as PeerMessage;
          if (msg.type === 'SYNC_ORDERS') {
              const newOrders = msg.payload as Order[];
              setOrders(newOrders);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders));
          }
          if (msg.type === 'SYNC_INVENTORY') {
              const newInv = msg.payload as Inventory;
              setInventory(newInv);
              localStorage.setItem(INVENTORY_KEY, JSON.stringify(newInv));
          }
          if (msg.type === 'SYNC_REVENUE_ADJUSTMENT') {
              const newAdj = msg.payload as number;
              setRevenueAdjustment(newAdj);
              localStorage.setItem(REVENUE_ADJUSTMENT_KEY, newAdj.toString());
          }
      });

      conn.on('close', () => {
          setIsPeerReady(false);
          setTimeout(() => connectToHost(peer), 1000);
      });
      
      conn.on('error', () => {
          setIsPeerReady(false);
      });
  };

  // Initialize Logic
  useEffect(() => {
    if (!isAuthenticated) return;

    if (!audioCtxRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) audioCtxRef.current = new AudioContext();
    }

    loadOrders();
    loadInventory();
    loadRevenueAdjustment();

    initHostPeer();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) loadOrders();
      if (e.key === INVENTORY_KEY) loadInventory();
      if (e.key === REVENUE_ADJUSTMENT_KEY) loadRevenueAdjustment();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (peerRef.current) peerRef.current.destroy();
    };
  }, [isAuthenticated]);


  // --- Action Processor (Wrapper) ---
  const performAction = (action: string, payload: any) => {
      if (kitchenMode === 'HOST') {
          handleHostActionProcess(action, payload);
      } else {
          hostConnRef.current?.send({ 
              type: 'KITCHEN_ACTION', 
              payload: { action, payload } 
          } as PeerMessage);
      }
  };

  // Central Logic for modifying state (Run by Host Only)
  const handleHostActionProcess = (action: string, payload: any) => {
      if (action === 'UPDATE_STATUS') {
          const { orderId, status } = payload;
          const currentOrders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
          const updatedOrders = currentOrders.map((o: Order) => {
              if (o.id === orderId) {
                  const updated = { ...o, status };
                  if (status === OrderStatus.PENDING && (!o.paidTimestamp || o.status === OrderStatus.UNPAID)) {
                      updated.paidTimestamp = Date.now();
                  }
                  return updated;
              }
              return o;
          });
          setOrders(updatedOrders);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
          broadcastOrders(updatedOrders);
      }
      
      if (action === 'UPDATE_INVENTORY') {
          const { itemId, newQuantity } = payload;
          const currentInv = JSON.parse(localStorage.getItem(INVENTORY_KEY) || '{}');
          currentInv[itemId] = Math.max(0, newQuantity);
          setInventory(currentInv);
          localStorage.setItem(INVENTORY_KEY, JSON.stringify(currentInv));
          broadcastInventory(currentInv);
      }

      if (action === 'UPDATE_REVENUE_ADJUSTMENT') {
          const { amount } = payload;
          setRevenueAdjustment(amount);
          localStorage.setItem(REVENUE_ADJUSTMENT_KEY, amount.toString());
          broadcastRevenueAdjustment(amount);
      }

      if (action === 'CANCEL_ORDER') {
           const { order } = payload;
           const currentOrders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
           
           // Restore Inventory
           const currentInv = JSON.parse(localStorage.getItem(INVENTORY_KEY) || '{}');
           order.items.forEach((item: CartItem) => {
                const baseItem = findBaseItem(item.id);
                if (baseItem && currentInv[baseItem.id] !== undefined) {
                    currentInv[baseItem.id] += item.quantity;
                    if (baseItem.id === 'm1' && currentInv['opt-egg'] !== undefined) {
                        currentInv['opt-egg'] += item.quantity;
                    }
                }
                if (item.selectedOptions) {
                    item.selectedOptions.forEach((opt: MenuOption) => {
                        if (currentInv[opt.id] !== undefined) {
                            currentInv[opt.id] += item.quantity;
                        }
                    });
                }
           });
           setInventory(currentInv);
           localStorage.setItem(INVENTORY_KEY, JSON.stringify(currentInv));
           broadcastInventory(currentInv);

           // Update Order Status
           const updatedOrders = currentOrders.map((o: Order) => o.id === order.id ? { ...o, status: OrderStatus.CANCELLED } : o);
           setOrders(updatedOrders);
           localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
           broadcastOrders(updatedOrders);
      }

      if (action === 'RESET_COUNTER') {
          localStorage.setItem(COUNTER_KEY, '0');
      }

      if (action === 'CLEAR_HISTORY') {
           const currentOrders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
           const activeOrders = currentOrders.filter((o: Order) => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.PICKED_UP && o.status !== OrderStatus.CANCELLED);
           setOrders(activeOrders);
           localStorage.setItem(STORAGE_KEY, JSON.stringify(activeOrders));
           broadcastOrders(activeOrders);
      }
      
      if (action === 'SAVE_EDITED_ORDER') {
          const { originalOrderId, newOrder } = payload;
           const currentOrders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
           const originalOrder = currentOrders.find((o: Order) => o.id === originalOrderId);
           
           if (originalOrder) {
                 const currentInv = JSON.parse(localStorage.getItem(INVENTORY_KEY) || '{}');
                 const tempCounts: Record<string, number> = {};
                 originalOrder.items.forEach((item: CartItem) => {
                      tempCounts[item.id] = (tempCounts[item.id] || 0) - item.quantity;
                 });
                 newOrder.items.forEach((item: CartItem) => {
                      tempCounts[item.id] = (tempCounts[item.id] || 0) + item.quantity;
                 });
                 
                 Object.entries(tempCounts).forEach(([cartItemId, diff]) => {
                      if (diff === 0) return;
                      const itemDef = newOrder.items.find((i: CartItem) => i.id === cartItemId) || originalOrder.items.find((i: CartItem) => i.id === cartItemId);
                      if (!itemDef) return;
                      
                      const baseItem = findBaseItem(itemDef.id);
                      
                      if(baseItem) {
                          if (currentInv[baseItem.id] !== undefined) {
                              currentInv[baseItem.id] = Math.max(0, currentInv[baseItem.id] - diff);
                              if (baseItem.id === 'm1' && currentInv['opt-egg'] !== undefined) {
                                  currentInv['opt-egg'] = Math.max(0, currentInv['opt-egg'] - diff);
                              }
                          }
                          if (itemDef.selectedOptions) {
                              itemDef.selectedOptions.forEach((opt: MenuOption) => {
                                  if (currentInv[opt.id] !== undefined) {
                                      currentInv[opt.id] = Math.max(0, currentInv[opt.id] - diff);
                                  }
                              });
                          }
                      }
                 });
                 setInventory(currentInv);
                 localStorage.setItem(INVENTORY_KEY, JSON.stringify(currentInv));
                 broadcastInventory(currentInv);
           }

           const updatedOrders = currentOrders.map((o: Order) => o.id === originalOrderId ? newOrder : o);
           setOrders(updatedOrders);
           localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
           broadcastOrders(updatedOrders);
      }
      
      if (action === 'RESET_ALL_INVENTORY') {
          const initialInv: Inventory = {};
          MENU_ITEMS.forEach(item => {
              initialInv[item.id] = 50;
              if(item.options) item.options.forEach(o => initialInv[o.id] = 50);
          });
          setInventory(initialInv);
          localStorage.setItem(INVENTORY_KEY, JSON.stringify(initialInv));
          broadcastInventory(initialInv);
      }
  };

  // --- UI Action Wrappers ---
  const updateOrderStatus = (e: React.MouseEvent | null, orderId: string, status: OrderStatus) => {
      if (e) e.stopPropagation();
      performAction('UPDATE_STATUS', { orderId, status });
  };

  const cancelOrder = (order: Order) => {
    if (!window.confirm(`Delete Order #${order.orderNumber}?`)) return;
    performAction('CANCEL_ORDER', { order });
  };

  const closeConfirmation = () => {
    setConfirmation({ isOpen: false, type: null });
  };

  const requestResetCounter = () => {
    setConfirmation({ isOpen: true, type: 'reset' });
  };

  const requestClearHistory = () => {
    setConfirmation({ isOpen: true, type: 'clear' });
  };

  const executeConfirmationAction = () => {
    if (confirmation.type === 'reset') {
        performAction('RESET_COUNTER', {});
        alert(t('kitchen.resetSuccess'));
    } else if (confirmation.type === 'clear') {
        performAction('CLEAR_HISTORY', {});
    }
    closeConfirmation();
  };

  const updateInventory = (itemId: string, newQuantity: number) => {
      performAction('UPDATE_INVENTORY', { itemId, newQuantity });
      
      if (newQuantity < 5) {
        let name = itemId;
        const item = MENU_ITEMS.find(m => m.id === itemId);
        if (item) {
             name = getItemName(item);
        } else {
             for (const m of MENU_ITEMS) {
                 if (m.options) {
                     const opt = m.options.find(o => o.id === itemId);
                     if (opt) {
                         name = getOptionName(opt);
                         break;
                     }
                 }
             }
        }
        setToast({ message: `${t('common.warning')}: ${name} ${t('customer.stock')} < 5`, type: 'warning' });
    }
  };
  
  const resetAllInventory = () => {
      performAction('RESET_ALL_INVENTORY', {});
  };

  // --- Numpad Logic ---
  const handleNumpadInput = (val: string) => {
    if (val === 'C') {
        setNumPadValue('');
    } else if (val === 'BS') {
        setNumPadValue(prev => prev.slice(0, -1));
    } else if (val === 'ENTER') {
        if (!numPadValue) return;
        const targetNum = parseInt(numPadValue);
        // Find the OLDEST order that is unpaid with this number
        const targetOrder = orders
            .filter(o => o.status === OrderStatus.UNPAID && o.orderNumber === targetNum)
            .sort((a, b) => a.timestamp - b.timestamp)[0]; // Sort ascending time to find oldest

        if (targetOrder) {
            updateOrderStatus(null, targetOrder.id, OrderStatus.PENDING);
            setNumPadValue('');
            playDing();
            setToast({ message: `Order #${targetNum} confirmed!`, type: 'success' });
        } else {
            setToast({ message: `Order #${targetNum} not found in Unpaid!`, type: 'warning' });
        }
    } else {
        if (numPadValue.length < 4) { // Limit length
             setNumPadValue(prev => prev + val);
        }
    }
  };

  // --- Statistics Logic ---
  const handleRevenueAdjustment = (val: number) => {
      setRevenueAdjustment(val);
      performAction('UPDATE_REVENUE_ADJUSTMENT', { amount: val });
  };

  const statistics = useMemo(() => {
    let totalRevenue = 0;
    let totalOrders = 0;
    const productStats: Record<string, { name: string, quantity: number, revenue: number }> = {};
    const optionStats: Record<string, { name: string, quantity: number }> = {};

    if (!Array.isArray(orders)) return { totalRevenue, totalOrders, productStats: [], optionStats: [] };

    orders.forEach(order => {
      if (!order || (order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.PICKED_UP)) return;

      totalRevenue += (order.totalAmount || 0);
      totalOrders += 1;
      
      if (Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (!item || !item.name) return;
            
            const itemName = item.name;
            const itemQty = item.quantity || 0;
            const itemPrice = item.price || 0;

            if (!productStats[itemName]) {
              productStats[itemName] = { name: itemName, quantity: 0, revenue: 0 };
            }
            productStats[itemName].quantity += itemQty;
            productStats[itemName].revenue += (itemPrice * itemQty);
            
            if (item.selectedOptions && Array.isArray(item.selectedOptions)) {
              item.selectedOptions.forEach(opt => {
                if (!opt || !opt.name) return;
                const optName = opt.name;
                const optPrice = opt.price || 0;

                if (!optionStats[optName]) {
                  optionStats[optName] = { name: optName, quantity: 0 };
                }
                optionStats[optName].quantity += itemQty;
                productStats[itemName].revenue += (optPrice * itemQty);
              });
            }
          });
      }
    });

    return {
      totalRevenue,
      totalOrders,
      productStats: Object.values(productStats).sort((a, b) => b.quantity - a.quantity),
      optionStats: Object.values(optionStats).sort((a, b) => b.quantity - a.quantity)
    };
  }, [orders]);

  const getStatusBadge = (status: OrderStatus) => {
      switch(status) {
          case OrderStatus.UNPAID: return <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded text-xs font-bold">{t('kitchen.unpaid')}</span>;
          case OrderStatus.PENDING: return <span className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-2 py-1 rounded text-xs font-bold">{t('kitchen.preparing')}</span>;
          case OrderStatus.COMPLETED: return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-1 rounded text-xs font-bold">{t('kitchen.completed')}</span>;
          case OrderStatus.PICKED_UP: return <span className="bg-green-100 text-green-800 border border-green-200 px-2 py-1 rounded text-xs font-bold">{t('kitchen.pickedUp')}</span>;
          case OrderStatus.CANCELLED: return <span className="bg-red-100 text-red-800 border border-red-200 px-2 py-1 rounded text-xs font-bold">{t('kitchen.cancelled')}</span>;
          default: return null;
      }
  };


  // --- Editing Logic ---
  const openEditModal = (order: Order) => setEditingOrder(JSON.parse(JSON.stringify(order)));
  const closeEditModal = () => {
    setEditingOrder(null);
    setAddingItemId('');
    setAddingItemOptions({});
  };

  const updateEditingItemQuantity = (itemId: string, delta: number) => {
    if (!editingOrder) return;
    
    // Inventory Check (Local check for UI feedback, Host will re-check or just apply)
    if (delta > 0) {
        const item = editingOrder.items.find(i => i.id === itemId);
        const originalOrder = orders.find(o => o.id === editingOrder.id);
        const originalItem = originalOrder?.items.find(i => i.id === itemId);
        const originalQty = originalItem ? originalItem.quantity : 0;
        
        if (item) {
             const baseMenuItem = MENU_ITEMS.find(m => m.name === item.name);
             if (baseMenuItem) {
                 const currentQty = item.quantity;
                 const nextQty = currentQty + delta;
                 const neededFromInv = nextQty - originalQty;
                 
                 if (neededFromInv > 0) {
                     const inv = inventory as unknown as Record<string, number>;
                     const currentStock = (inv[baseMenuItem.id] as number) ?? 0;
                     if (currentStock < neededFromInv) {
                         alert(t('kitchen.inventoryLow') || "Stock insufficient!");
                         return;
                     }
                     if (item.selectedOptions) {
                         const optionCounts: Record<string, number> = {};
                         item.selectedOptions.forEach(o => optionCounts[o.id] = (optionCounts[o.id] || 0) + 1);
                         for (const [optId, countPerItem] of Object.entries(optionCounts)) {
                             const totalNeeded = countPerItem * neededFromInv;
                             const optStock = (inv[optId] as number) ?? 0;
                             if (optStock < totalNeeded) {
                                  alert("Option stock insufficient!");
                                  return;
                             }
                         }
                     }
                 }
             }
        }
    }

    const updatedItems = editingOrder.items.map(item => {
      if (item.id === itemId) return { ...item, quantity: Math.max(0, item.quantity + delta) };
      return item;
    }).filter(item => item.quantity > 0);
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setEditingOrder({ ...editingOrder, items: updatedItems, totalAmount: newTotal });
  };

  const handleAddItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAddingItemId(e.target.value);
    setAddingItemOptions({});
  };

  const updateAddingOptionQuantity = (optionId: string, delta: number) => {
    if (delta > 0) {
        const inv = inventory as unknown as Record<string, number>;
        const stock = (inv[optionId] as number) ?? 0;
        const current = addingItemOptions[optionId] || 0;
        if (current + delta > stock) {
            return;
        }
    }

    setAddingItemOptions(prev => {
         const current = prev[optionId] || 0;
         const next = Math.max(0, current + delta);
         if (next === 0) {
             const { [optionId]: _, ...rest } = prev;
             return rest;
         }
         return { ...prev, [optionId]: next };
    });
  };

  const confirmAddItem = () => {
    if (!editingOrder || !addingItemId) return;
    const menuItem = MENU_ITEMS.find(m => m.id === addingItemId);
    if (!menuItem) return;

    const inv = inventory as unknown as Record<string, number>;

    // --- Inventory Check for New Item ---
    const baseStock = (inv[menuItem.id] as number) ?? 0;
    if (baseStock < 1) {
        alert("Stock insufficient: " + getItemName(menuItem));
        return;
    }
    
    for (const [optId, qty] of Object.entries(addingItemOptions)) {
        if (qty > 0) {
            const optStock = (inv[optId] as number) ?? 0;
            if (optStock < qty) {
                 const optName = menuItem.options?.find(o => o.id === optId)?.name || optId;
                 alert("Stock insufficient for option: " + optName);
                 return;
            }
        }
    }

    const selectedOptions: MenuOption[] = [];
    if (menuItem.options) {
        Object.entries(addingItemOptions).forEach(([optId, qty]) => {
            const opt = menuItem.options!.find(o => o.id === optId);
            if (opt) {
                for(let i=0; i<qty; i++) selectedOptions.push(opt);
            }
        });
    }

    const optionsSuffix = selectedOptions.length > 0 
      ? '-' + selectedOptions.map(o => o.id).sort().join('-') 
      : '';
    const cartItemId = menuItem.id + optionsSuffix; 

    const optionsPrice = selectedOptions.reduce((sum, o) => sum + o.price, 0);
    const unitPrice = menuItem.price + optionsPrice;

    let updatedItems = [...editingOrder.items];
    const existingIndex = updatedItems.findIndex(i => i.id === cartItemId);
    
    if (existingIndex >= 0) {
        const existingItem = updatedItems[existingIndex];
        const originalOrder = orders.find(o => o.id === editingOrder.id);
        const originalItem = originalOrder?.items.find(i => i.id === cartItemId);
        const originalQty = originalItem ? originalItem.quantity : 0;
        const currentQty = existingItem.quantity;
        const nextQty = currentQty + 1;
        const neededFromInv = nextQty - originalQty;
        
        if (baseStock < neededFromInv) {
            alert(t('kitchen.inventoryLow') || "Stock insufficient!");
            return;
        }

        updatedItems[existingIndex].quantity += 1;
    } else {
        updatedItems.push({
            ...menuItem,
            id: cartItemId,
            price: unitPrice,
            selectedOptions,
            quantity: 1
        });
    }
    
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setEditingOrder({ ...editingOrder, items: updatedItems, totalAmount: newTotal });
    
    setAddingItemId('');
    setAddingItemOptions({});
  };

  const saveEditedOrder = () => {
    if (!editingOrder) return;
    performAction('SAVE_EDITED_ORDER', { originalOrderId: editingOrder.id, newOrder: editingOrder });
    closeEditModal();
  };

  // --- Login Screen ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative">
        {/* Main Login Card */}
        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700 z-10">
           <div className="flex flex-col items-center mb-6 text-slate-200">
               <div className="bg-indigo-600 p-4 rounded-full mb-4 shadow-lg shadow-indigo-900/50">
                  <Lock size={32} />
               </div>
               <h2 className="text-2xl font-black">{t('kitchen.title')}</h2>
               <p className="text-slate-400 text-sm mt-1">{t('common.enterPassword')}</p>
           </div>
           
           <form onSubmit={handleLogin} className="space-y-4">
               <div className="relative">
                   <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                   <input 
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder={t('common.password')}
                      className="w-full bg-slate-900 border-2 border-slate-600 rounded-xl py-4 pl-12 pr-4 text-white text-lg font-bold focus:border-indigo-500 focus:outline-none transition-colors"
                      autoFocus
                   />
               </div>
               {loginError && (
                   <div className="text-red-400 text-sm font-bold text-center animate-pulse">
                       {t('common.accessDenied')}
                   </div>
               )}
               <button 
                  type="submit"
                  disabled={isCheckingPassword}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
               >
                   {isCheckingPassword ? <Loader2 className="animate-spin" size={20}/> : <><LogIn size={20} /> {t('common.login')}</>}
               </button>
           </form>
           
           <div className="flex flex-col gap-2 mt-6">
                <button onClick={onBack} className="text-slate-500 hover:text-slate-300 text-sm font-bold">
                    {t('common.back')}
                </button>
           </div>
        </div>
      </div>
    );
  }

  // --- Main Kitchen View (Authenticated) ---
  const unpaidOrders = orders.filter(o => o.status === OrderStatus.UNPAID).reverse();
  const pendingOrders = orders
    .filter(o => o.status === OrderStatus.PENDING)
    .sort((a, b) => {
       const timeA = a.paidTimestamp || a.timestamp;
       const timeB = b.paidTimestamp || b.timestamp;
       return timeA - timeB;
    });

  const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 relative flex flex-col">
      <header className="flex flex-wrap gap-4 justify-between items-center mb-4 border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/50">
            <Receipt className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-wide">{t('kitchen.title')}</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className={`inline-block w-2.5 h-2.5 rounded-full ${isPeerReady ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-red-500'}`}></span>
               <p className="text-slate-400 font-bold text-sm">
                   {isPeerReady ? t('kitchen.connectionActive') : t('kitchen.connectionLost')} 
                   {isPeerReady && kitchenMode === 'HOST' && <span className="text-green-500 ml-1 text-xs font-mono opacity-70">[HOST]</span>}
                   {isPeerReady && kitchenMode === 'CLIENT' && <span className="text-blue-400 ml-1 text-xs font-mono opacity-70">[CLIENT]</span>}
               </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
             onClick={() => { unlockAudio(); playDing(); }}
             className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-green-400 transition-colors border border-green-900"
          >
             <Volume2 size={16} /> {t('kitchen.testSound')}
          </button>
          
          {/* Dynamic Buttons based on Role */}
          {activeRole === 'KITCHEN' && (
            <button 
               onClick={() => setShowInventory(true)}
               className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-orange-900/50"
            >
               <Boxes size={16} /> {t('kitchen.inventory')}
            </button>
          )}

          {activeRole === 'FRONT_DESK' && (
            <button 
               onClick={(e) => { e.stopPropagation(); setShowStats(true); setStatsTab('overview'); }}
               className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors shadow-lg shadow-indigo-900/50"
            >
               <BarChart3 size={16} /> {t('kitchen.reports')}
            </button>
          )}

          {(activeRole === 'FRONT_DESK' || activeRole === 'PICKUP') && (
            <>
              <button 
                onClick={requestResetCounter}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors border border-slate-700"
              >
                 <RefreshCw size={14} /> {t('kitchen.resetCounter')}
              </button>
              <button 
                onClick={requestClearHistory}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors border border-slate-700"
              >
                <Trash2 size={16} /> {t('kitchen.clearHistory')}
              </button>
            </>
          )}

          <button 
            onClick={onBack}
            className="px-5 py-2 bg-slate-700 hover:bg-white hover:text-slate-900 font-bold rounded-lg transition-all"
          >
            {t('common.back')}
          </button>
        </div>
      </header>

      {/* Role Switcher Tabs */}
      <div className="flex gap-2 p-1 bg-slate-800 rounded-xl w-fit mb-6 self-start shadow-inner">
         <button 
           onClick={() => setActiveRole('FRONT_DESK')}
           className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${activeRole === 'FRONT_DESK' ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
         >
           <Store size={18} /> 前台 (Front)
         </button>
         <button 
           onClick={() => setActiveRole('KITCHEN')}
           className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${activeRole === 'KITCHEN' ? 'bg-yellow-500 text-yellow-950 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
         >
           <ChefHat size={18} /> 廚房 (Kitchen)
         </button>
         <button 
           onClick={() => setActiveRole('PICKUP')}
           className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${activeRole === 'PICKUP' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
         >
           <BellRing size={18} /> 出餐 (Pickup)
         </button>
      </div>

      {/* Main Grid - Modified to show only active role content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        
        {/* Unpaid / Front Desk View */}
        {activeRole === 'FRONT_DESK' && (
          <div className="flex flex-col bg-slate-800/30 rounded-2xl border border-red-900/30 overflow-hidden h-full">
            <div className="p-4 bg-red-900/20 border-b border-red-900/30 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center">
              <h2 className="text-xl font-black flex items-center gap-2 text-red-400">
                <CircleDollarSign className="w-6 h-6" /> {t('kitchen.unpaid')} ({unpaidOrders.length})
              </h2>
            </div>

            {/* Numpad Area - Visible only in Front Desk */}
<div className="bg-slate-800 border-b border-red-900/30 p-6 flex flex-col md:flex-row md:items-start md:gap-6">
  {/* 左邊：輸入號碼後的訂單預覽 */}
  {previewOrder && (
    <div className="md:flex-1 bg-slate-900 rounded-xl border border-slate-700 p-4 mb-4 md:mb-0">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <span className="bg-red-500 text-white w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg shadow-sm">
            {previewOrder.orderNumber}
          </span>
          <div>
            <span className="text-xl font-bold block text-white">
              ${previewOrder.totalAmount}
            </span>
            <ElapsedTime timestamp={previewOrder.timestamp} />
          </div>
        </div>
      </div>

      <ul className="space-y-3 text-sm text-slate-300 mb-2">
        {previewOrder.items.map((item, idx) => (
          <li key={idx} className="flex flex-col">
            <div className="flex justify-between items-center">
              <span className="font-black text-slate-200 text-lg">
                {getItemName(item)}
              </span>
              <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-bold">
                x{item.quantity}
              </span>
            </div>
            {(item.selectedOptions?.length || item.note) ? (
              <div className="text-xs text-slate-500 mt-1 pl-1 border-l-2 border-slate-600">
                {item.selectedOptions?.map(o => (
                  <span key={o.id} className="mr-2 block">
                    + {getOptionName(o)}
                  </span>
                ))}
                {item.note && (
                  <span className="text-red-400 block font-bold">
                    ! {item.note}
                  </span>
                )}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )}

  {/* 右邊：數字鍵盤 */}
  <div className="w-full max-w-md md:ml-auto">
    <div className="flex items-center justify-between bg-slate-900 rounded-xl px-4 py-4 mb-4 border border-slate-700">
      <span
        className={`text-4xl font-black tracking-widest ${
          numPadValue ? 'text-white' : 'text-slate-600'
        }`}
      >
        {numPadValue || '---'}
      </span>
      <button
        onClick={() => handleNumpadInput('BS')}
        className="text-slate-400 hover:text-red-400 p-2"
      >
        <Delete size={32} />
      </button>
    </div>
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
        <button
          key={n}
          onClick={() => handleNumpadInput(n.toString())}
          className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-2xl py-4 rounded-xl active:scale-95 transition-all shadow-sm border-b-4 border-slate-900 active:border-b-0 active:translate-y-1"
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => handleNumpadInput('C')}
        className="bg-slate-700 hover:bg-red-900/50 text-red-400 font-bold text-2xl py-4 rounded-xl active:scale-95 transition-all border border-transparent hover:border-red-800"
      >
        C
      </button>
      <button
        onClick={() => handleNumpadInput('0')}
        className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-2xl py-4 rounded-xl active:scale-95 transition-all shadow-sm border-b-4 border-slate-900 active:border-b-0 active:translate-y-1"
      >
        0
      </button>
      <button
        onClick={() => handleNumpadInput('ENTER')}
        className="bg-green-600 hover:bg-green-500 text-white font-bold text-2xl py-4 rounded-xl active:scale-95 transition-all shadow-lg shadow-green-900/30 border-b-4 border-green-800 active:border-b-0 active:translate-y-1"
      >
        <CheckCheck size={32} className="mx-auto" />
      </button>
    </div>
  </div>
</div>

<div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
  {unpaidOrders.length === 0 && (
    <div className="text-slate-500 text-center py-10 font-bold border-2 border-dashed border-slate-700 rounded-xl">
      {t('kitchen.noOrders')}
    </div>
  )}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {unpaidOrders.map((order) => {
      const elapsedMinutes = Math.floor((Date.now() - order.timestamp) / 60000);
      const isUrgent = elapsedMinutes >= 5;
                  
      return (
        <div
          key={order.id}
          className={`bg-slate-800 text-slate-200 rounded-xl shadow-lg border relative overflow-hidden group ${
            isUrgent
              ? 'border-red-500 animate-pulse-red shadow-[0_0_15px_rgba(239,68,68,0.3)]'
              : 'border-red-500/50'
          }`}
        >
          {!isUrgent && (
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
          )}
          <div className="p-4 pl-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className="bg-red-500 text-white w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg shadow-sm">
                  {order.orderNumber}
                </span>
                <div>
                  <span className="text-xl font-bold block text-white">
                    ${order.totalAmount}
                  </span>
                  <ElapsedTime timestamp={order.timestamp} />
                </div>
              </div>
              <div className="flex gap-2 z-10 relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelOrder(order);
                  }}
                  className="p-2 text-red-400 hover:text-red-100 hover:bg-red-500/20 rounded-full transition-colors"
                  title={t('common.cancel')}
                >
                  <Ban size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(order);
                  }}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
                >
                  <Edit size={18} />
                </button>
              </div>
            </div>
                       
            <ul className="space-y-3 text-sm text-slate-300 mb-4">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-200 text-lg">
                      {getItemName(item)}
                    </span>
                    <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-bold">
                      x{item.quantity}
                    </span>
                  </div>
                  {(item.selectedOptions?.length || item.note) ? (
                    <div className="text-xs text-slate-500 mt-1 pl-1 border-l-2 border-slate-600">
                      {item.selectedOptions?.map(o => (
                        <span key={o.id} className="mr-2 block">
                          + {getOptionName(o)}
                        </span>
                      ))}
                      {item.note && (
                        <span className="text-red-400 block font-bold">
                          ! {item.note}
                        </span>
                      )}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>

            <button
              onClick={(e) =>
                updateOrderStatus(e, order.id, OrderStatus.PENDING)
              }
              className="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-900/50"
            >
              <CircleDollarSign size={18} /> {t('kitchen.markPaid')}
            </button>
          </div>
        </div>
      );
    })}
  </div>
</div>
          </div>
        )}


        {/* Pending / Kitchen View */}
        {activeRole === 'KITCHEN' && (
          <div className="flex flex-col bg-slate-800/30 rounded-2xl border border-yellow-900/30 overflow-hidden h-full">
            <div className="p-4 bg-yellow-900/20 border-b border-yellow-900/30 backdrop-blur-sm sticky top-0 z-10">
              <h2 className="text-xl font-black flex items-center gap-2 text-yellow-400">
                <Clock className="w-6 h-6" /> {t('kitchen.preparing')} ({pendingOrders.length})
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
               {pendingOrders.length === 0 && (
                 <div className="text-slate-500 text-center py-10 font-bold border-2 border-dashed border-slate-700 rounded-xl">{t('kitchen.noOrders')}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pendingOrders.map((order) => {
                  const elapsedMinutes = Math.floor((Date.now() - order.timestamp) / 60000);
                  const isUrgent = elapsedMinutes >= 5;

                  return (
                  <div key={order.id} className={`bg-white text-slate-900 rounded-xl shadow-xl overflow-hidden animate-fade-in relative ${isUrgent ? 'border-4 border-red-500 animate-pulse-red' : 'border-l-[8px] border-yellow-400'}`}>
                      <div className={`p-4 border-b border-gray-200 flex justify-between items-center ${isUrgent ? 'bg-red-50' : 'bg-yellow-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black border-4 border-white shadow-sm ${isUrgent ? 'bg-red-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                            {order.orderNumber}
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm text-gray-500 font-bold">{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              <ElapsedTime timestamp={order.timestamp} />
                          </div>
                        </div>
                        <div className="flex gap-2 z-10 relative">
                            <button 
                                onClick={(e) => { e.stopPropagation(); cancelOrder(order); }} 
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" 
                                title={t('common.cancel')}
                            >
                                <Ban size={20} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); openEditModal(order); }} 
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            >
                                <Edit size={18} />
                            </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <ul className="space-y-4 mb-6">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex flex-col items-start text-base border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                              <div className="flex justify-between w-full">
                                  <div className="font-black text-gray-900 text-2xl">{getItemName(item)}</div>
                                  <span className="font-black bg-slate-900 text-white px-3 py-0.5 rounded-lg text-lg shrink-0">x{item.quantity}</span>
                              </div>
                              
                              <div className="flex flex-col mt-2 gap-2 pl-1">
                                {item.selectedOptions && item.selectedOptions.length > 0 && (
                                    item.selectedOptions.map((opt, optIdx) => (
                                      <span key={optIdx} className="text-xl font-black text-indigo-950 bg-indigo-200 px-3 py-1.5 rounded-lg border-l-4 border-indigo-600 flex items-center shadow-sm w-fit">
                                        <CornerDownRight size={24} className="mr-2 inline text-indigo-800" /> {getOptionName(opt)}
                                      </span>
                                    ))
                                )}
                                {item.note && (
                                    <div className="text-lg text-red-800 font-black bg-red-100 px-3 py-1.5 rounded-lg border-l-4 border-red-600 w-fit mt-1 shadow-sm">
                                      備註: {item.note}
                                    </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                        <button 
                          onClick={(e) => updateOrderStatus(e, order.id, OrderStatus.COMPLETED)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:translate-y-1 text-lg"
                        >
                          <CheckCircle size={24} /> {t('kitchen.completeOrder')}
                        </button>
                      </div>
                  </div>
                );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Completed / Pickup View */}
        {activeRole === 'PICKUP' && (
          <div className="flex flex-col bg-slate-800/30 rounded-2xl border border-green-900/30 overflow-hidden h-full">
            <div className="p-4 bg-green-900/20 border-b border-green-900/30 backdrop-blur-sm sticky top-0 z-10">
              <h2 className="text-xl font-black flex items-center gap-2 text-green-400">
                <CheckCircle className="w-6 h-6" /> {t('kitchen.completed')} ({completedOrders.length})
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {completedOrders.length === 0 && (
                 <div className="text-slate-500 text-center py-10 font-bold border-2 border-dashed border-slate-700 rounded-xl">{t('kitchen.noOrders')}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {completedOrders.map((order) => (
                  <div key={order.id} className="bg-slate-700/40 p-5 rounded-xl border border-slate-600/50 opacity-90 hover:opacity-100 transition-all hover:bg-slate-700/60 shadow-lg flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-green-600/20 text-green-400 border border-green-500/50 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-2xl shadow-inner">
                            {order.orderNumber}
                            </span>
                            <span className="text-sm text-slate-400 font-mono font-bold border border-slate-600 px-2 py-1 rounded">${order.totalAmount}</span>
                        </div>
                        </div>
                        <div className="text-sm text-slate-300 font-medium space-y-2 mb-4">
                        {order.items.map((i, idx) => (
                            <div key={idx} className="flex justify-between border-b border-slate-600/30 pb-1 last:border-0">
                                <span>{getItemName(i)}</span>
                                <span className="font-bold">x{i.quantity}</span>
                            </div>
                        ))}
                        </div>
                    </div>
                    
                    <button 
                        onClick={(e) => updateOrderStatus(e, order.id, OrderStatus.PICKED_UP)}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
                        title="Picked Up"
                    >
                        <CheckCheck size={20} /> {t('kitchen.pickedUp')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] animate-bounce-in">
           <div className={`${toast.type === 'success' ? 'bg-green-600 border-green-400' : 'bg-orange-600 border-orange-400'} text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold border-2 backdrop-blur-md`}>
              {toast.type === 'success' ? <CheckCircle size={20} className="text-green-200" /> : <AlertTriangle size={20} className="text-orange-200" />}
              <span>{toast.message}</span>
           </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmation.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900 border-t-4 border-red-500">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4 text-red-600">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-2xl font-black">{t('common.warning')}</h3>
              </div>
              <h4 className="text-xl font-bold mb-3">
                {confirmation.type === 'reset' ? t('kitchen.confirmResetTitle') : t('kitchen.confirmClearTitle')}
              </h4>
              <p className="text-gray-600 font-medium leading-relaxed mb-4">
                {confirmation.type === 'reset' ? t('kitchen.confirmResetMsg') : t('kitchen.confirmClearMsg')}
              </p>
              
              {/* Extra context for Reset if orders exist */}
              {confirmation.type === 'reset' && orders.length > 0 && (
                 <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm text-yellow-800 font-bold mb-2">
                    ⚠ 系統偵測到目前還有 {orders.length} 筆訂單。除非清除它們，否則號碼不會重置為 1。
                 </div>
              )}
            </div>
            <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={closeConfirmation}
                className="px-5 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button 
                onClick={executeConfirmationAction}
                className="px-5 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg transition-colors flex items-center gap-2"
              >
                {t('kitchen.confirmAction')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 h-[70vh]">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-orange-50">
                      <div className="flex items-center gap-3">
                          <div className="bg-orange-600 p-2 rounded-lg">
                              <Boxes className="text-white" size={24} />
                          </div>
                          <h3 className="text-2xl font-black text-slate-800 tracking-wide">{t('kitchen.inventory')}</h3>
                      </div>
                      <button onClick={() => setShowInventory(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                          <X size={28} />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 bg-white">
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold sticky top-0 z-10">
                              <tr>
                                  <th className="px-4 py-3 border-b">{t('kitchen.itemName')}</th>
                                  <th className="px-4 py-3 text-right border-b">{t('kitchen.currentStock')}</th>
                                  <th className="px-4 py-3 text-center border-b">{t('kitchen.action')}</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {MENU_ITEMS.map((item) => {
                                  const stock = (inventory[item.id] as number) ?? 0;
                                  return (
                                    <React.Fragment key={item.id}>
                                      {/* Main Item Row */}
                                      <tr className="hover:bg-gray-50">
                                          <td className="px-4 py-4 font-black text-slate-900 text-lg">{getItemName(item)}</td>
                                          <td className="px-4 py-4 text-right">
                                              <span className={`inline-block px-3 py-1 rounded-full font-bold ${stock === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                  {stock === 0 ? t('kitchen.soldOut') : stock}
                                              </span>
                                              {/* Simple visual bar */}
                                              <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
                                                  <div className={`h-full rounded-full ${stock < 10 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, stock * 2)}%` }}></div>
                                              </div>
                                          </td>
                                          <td className="px-4 py-4">
                                              <div className="flex items-center justify-center gap-2">
                                                  <button onClick={() => updateInventory(item.id, stock - 1)} className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-xl hover:bg-gray-100 text-black transition-colors shadow-sm"><Minus size={20}/></button>
                                                  <input 
                                                      type="number" 
                                                      value={stock} 
                                                      onChange={(e) => updateInventory(item.id, parseInt(e.target.value) || 0)}
                                                      className="w-20 text-center border-2 border-gray-300 rounded-xl py-2 font-black text-black text-xl bg-white focus:border-black focus:outline-none"
                                                  />
                                                  <button onClick={() => updateInventory(item.id, stock + 1)} className="w-12 h-12 flex items-center justify-center border-2 border-gray-300 rounded-xl hover:bg-gray-100 text-black transition-colors shadow-sm"><Plus size={20}/></button>
                                              </div>
                                          </td>
                                      </tr>
                                      {/* Option Rows */}
                                      {item.options && item.options.map(opt => {
                                          const optStock = (inventory[opt.id] as number) ?? 0;
                                          return (
                                            <tr key={opt.id} className="bg-slate-50/50 hover:bg-slate-100">
                                                <td className="px-4 py-3 pl-8 flex items-center gap-2 text-base text-slate-600 font-bold">
                                                    <CornerDownRight size={16} className="text-slate-400" />
                                                    {getOptionName(opt)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-bold ${optStock === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                                                        {optStock === 0 ? t('kitchen.soldOut') : optStock}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2 scale-90">
                                                        <button onClick={() => updateInventory(opt.id, optStock - 1)} className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-white text-black transition-colors"><Minus size={16}/></button>
                                                        <input 
                                                            type="number" 
                                                            value={optStock} 
                                                            onChange={(e) => updateInventory(opt.id, parseInt(e.target.value) || 0)}
                                                            className="w-16 text-center border border-gray-300 rounded-lg py-1 font-bold text-black text-base bg-white focus:border-black focus:outline-none"
                                                        />
                                                        <button onClick={() => updateInventory(opt.id, optStock + 1)} className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-white text-black transition-colors"><Plus size={16}/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                          );
                                      })}
                                    </React.Fragment>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
                  <div className="p-5 border-t border-gray-200 bg-white flex justify-end gap-3">
                      <button onClick={resetAllInventory} className="px-4 py-3 border border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50">
                          {t('kitchen.resetAll50')}
                      </button>
                      <button onClick={() => setShowInventory(false)} className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 shadow-lg">
                          {t('common.close')}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] text-slate-900">
             <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-indigo-50">
                 <div className="flex items-center gap-3">
                     <div className="bg-indigo-600 p-2 rounded-lg">
                        <BarChart3 className="text-white" size={24} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-800 tracking-wide">{t('kitchen.revenueCenter')}</h3>
                 </div>
                 <button onClick={() => setShowStats(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                    <X size={28} />
                 </button>
             </div>

             <div className="flex border-b border-gray-200 bg-white px-6 pt-4 gap-6">
                 <button 
                   onClick={() => setStatsTab('overview')}
                   className={`pb-3 text-lg font-bold border-b-4 transition-colors ${statsTab === 'overview' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                 >
                   {t('kitchen.overview')}
                 </button>
                 <button 
                   onClick={() => setStatsTab('history')}
                   className={`pb-3 text-lg font-bold border-b-4 transition-colors ${statsTab === 'history' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                 >
                   {t('kitchen.history')}
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                {statsTab === 'overview' ? (
                   <div className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-40">
                              <span className="text-gray-500 font-bold uppercase tracking-wide text-sm">{t('kitchen.systemRevenue')}</span>
                              <span className="text-4xl font-black text-slate-800">${statistics.totalRevenue}</span>
                              <div className="w-full h-1 bg-gray-100 rounded-full mt-2">
                                  <div className="h-full bg-indigo-500 w-[70%] rounded-full"></div>
                              </div>
                           </div>
                           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between h-40">
                              <span className="text-gray-500 font-bold uppercase tracking-wide text-sm">{t('kitchen.adjustment')}</span>
                              <div className="flex items-center gap-2">
                                  <input 
                                    type="number" 
                                    value={revenueAdjustment} 
                                    onChange={(e) => handleRevenueAdjustment(parseInt(e.target.value) || 0)}
                                    className={`text-4xl font-black bg-transparent border-b-2 border-dashed border-gray-300 w-full focus:outline-none focus:border-indigo-500 ${revenueAdjustment < 0 ? 'text-red-500' : 'text-green-500'}`}
                                  />
                              </div>
                              <span className="text-xs text-gray-400">Manual +/- correction</span>
                           </div>
                           <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-900/20 text-white flex flex-col justify-between h-40 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                              <span className="text-indigo-200 font-bold uppercase tracking-wide text-sm relative z-10">{t('kitchen.finalTotal')}</span>
                              <span className="text-5xl font-black relative z-10">${statistics.totalRevenue + revenueAdjustment}</span>
                              <span className="text-sm text-indigo-200 font-medium relative z-10">{t('kitchen.totalOrders')}: {statistics.totalOrders}</span>
                           </div>
                       </div>

                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                               <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                   <TrendingUp size={20} className="text-indigo-500"/> {t('kitchen.productSales')}
                               </h4>
                               <div className="space-y-4">
                                   {statistics.productStats.length === 0 && <p className="text-gray-400 text-center py-4">No data yet</p>}
                                   {statistics.productStats.map((stat, idx) => (
                                       <div key={idx} className="flex items-center justify-between group">
                                           <div className="flex items-center gap-3">
                                               <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                               <span className="font-bold text-gray-700">{stat.name}</span>
                                           </div>
                                           <div className="text-right">
                                               <span className="block font-black text-slate-900">{stat.quantity} <span className="text-xs font-normal text-gray-400">{t('common.unit')}</span></span>
                                               <span className="text-xs font-bold text-indigo-500">${stat.revenue}</span>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           </div>
                           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                               <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                                   <Package size={20} className="text-orange-500"/> {t('kitchen.addOnUsage')}
                               </h4>
                               <div className="space-y-4">
                                   {statistics.optionStats.length === 0 && <p className="text-gray-400 text-center py-4">No data yet</p>}
                                   {statistics.optionStats.map((stat, idx) => (
                                       <div key={idx} className="flex items-center justify-between">
                                           <span className="font-bold text-gray-700">{stat.name}</span>
                                           <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-black text-sm">{stat.quantity}</span>
                                       </div>
                                   ))}
                               </div>
                           </div>
                       </div>
                   </div>
                ) : (
                   <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                       <table className="w-full text-left">
                           <thead className="bg-gray-50 border-b border-gray-200">
                               <tr>
                                   <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Time</th>
                                   <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Order #</th>
                                   <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider">Items</th>
                                   <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                   <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Status</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                               {orders.map(order => (
                                   <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                       <td className="px-6 py-4 text-sm font-bold text-gray-500 whitespace-nowrap">
                                           {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                       </td>
                                       <td className="px-6 py-4 text-sm font-black text-slate-800">#{order.orderNumber}</td>
                                       <td className="px-6 py-4 text-sm text-gray-600">
                                           <div className="flex flex-col gap-2">
                                               {order.items.map((i, idx) => (
                                                   <div key={idx} className="flex flex-col">
                                                       <span className="font-bold text-slate-700">{getItemName(i)} <span className="text-slate-500 font-normal">x{i.quantity}</span></span>
                                                       {i.selectedOptions && i.selectedOptions.length > 0 && (
                                                           <span className="text-xs text-blue-500 ml-2 font-medium">
                                                               + {i.selectedOptions.map(o => getOptionName(o)).join(', ')}
                                                           </span>
                                                       )}
                                                       {i.note && (
                                                           <span className="text-xs text-red-400 ml-2 italic">
                                                               ! {i.note}
                                                           </span>
                                                       )}
                                                   </div>
                                               ))}
                                           </div>
                                       </td>
                                       <td className="px-6 py-4 text-sm font-black text-slate-800 text-right">${order.totalAmount}</td>
                                       <td className="px-6 py-4 text-center">
                                           {getStatusBadge(order.status)}
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
                )}
             </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-900">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-black text-slate-800">{t('kitchen.editOrder')}</h3>
                <span className="text-sm font-bold text-blue-600">Order #{editingOrder.orderNumber}</span>
              </div>
              <button onClick={closeEditModal} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={24} />
              </button>
            </div>

            <div className="p-4 max-h-[50vh] overflow-y-auto">
              {editingOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <span className="font-bold text-lg block">{getItemName(item)}</span>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="text-sm text-blue-500 font-bold">
                         {item.selectedOptions.map(o => `+${getOptionName(o)}`).join(', ')}
                      </div>
                    )}
                    {item.note && (
                       <span className="text-xs text-red-500 font-bold block bg-red-50 px-1 py-0.5 rounded w-fit my-1">
                         Note: {item.note}
                       </span>
                    )}
                    <span className="text-sm text-gray-500">${item.price} / {t('common.unit')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <button 
                       onClick={() => updateEditingItemQuantity(item.id, -1)}
                       className={`p-2 rounded-lg border ${item.quantity === 1 ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 hover:bg-gray-100 text-gray-600'}`}
                     >
                       {item.quantity === 1 ? <Trash2 size={18} /> : <Minus size={18} />}
                     </button>
                     <span className="w-8 text-center font-black text-xl">{item.quantity}</span>
                     <button 
                       onClick={() => updateEditingItemQuantity(item.id, 1)}
                       className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
                     >
                       <Plus size={18} />
                     </button>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 pt-4 border-t border-dashed border-blue-200">
                <label className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-2 block">{t('kitchen.addItem')}</label>
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <select 
                            value={addingItemId}
                            onChange={handleAddItemSelect}
                            className="flex-1 bg-white border-2 border-gray-200 text-gray-900 rounded-xl px-4 py-3 font-bold focus:border-blue-500 focus:outline-none appearance-none"
                            style={{ backgroundImage: 'none' }}
                        >
                            <option value="" disabled>{t('kitchen.selectItem')}</option>
                            {MENU_ITEMS.map(m => {
                                const stock = (inventory[m.id] as number) ?? 0;
                                return (
                                    <option key={m.id} value={m.id} disabled={stock <= 0}>
                                        {getItemName(m)} (${m.price}) {stock <= 0 ? `(${t('kitchen.soldOut')})` : ''}
                                    </option>
                                );
                            })}
                        </select>
                        <button 
                            onClick={confirmAddItem}
                            disabled={!addingItemId}
                            className={`font-bold px-6 py-2 rounded-xl transition-colors border-2 ${!addingItemId ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'}`}
                        >
                            {t('common.confirm')}
                        </button>
                    </div>

                    {/* Options UI */}
                    {addingItemId && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 animate-fade-in">
                        {(() => {
                            const item = MENU_ITEMS.find(m => m.id === addingItemId);
                            if (!item) return null;
                            if (!item.options || item.options.length === 0) return (
                                <p className="text-xs text-blue-400 font-bold text-center">No options available</p>
                            );
                            return (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">{t('kitchen.toppings')}:</p>
                                    {item.options.map(opt => {
                                        const qty = addingItemOptions[opt.id] || 0;
                                        const optStock = (inventory[opt.id] as number) ?? 0;
                                        return (
                                            <div key={opt.id} className="flex justify-between items-center text-sm bg-white/50 p-2 rounded border border-blue-100">
                                                <span className="font-bold text-blue-900">{getOptionName(opt)} (+${opt.price})</span>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => updateAddingOptionQuantity(opt.id, -1)} 
                                                        className={`w-6 h-6 flex items-center justify-center rounded border ${qty > 0 ? 'bg-white border-blue-300 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-300'}`}
                                                        disabled={qty === 0}
                                                    >
                                                        <Minus size={12}/>
                                                    </button>
                                                    <span className={`w-4 text-center font-bold ${qty > 0 ? 'text-blue-700' : 'text-gray-400'}`}>{qty}</span>
                                                    <button 
                                                        onClick={() => updateAddingOptionQuantity(opt.id, 1)} 
                                                        className={`w-6 h-6 flex items-center justify-center rounded border ${qty >= optStock ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed' : 'bg-white border-blue-300 text-blue-600 hover:bg-blue-50'}`}
                                                        disabled={qty >= optStock}
                                                    >
                                                        <Plus size={12}/>
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            );
                        })()}
                        </div>
                    )}
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t border-gray-200">
               <div className="flex justify-between items-center mb-4">
                 <span className="font-bold text-gray-600">{t('kitchen.newTotal')}</span>
                 <span className="font-black text-3xl text-blue-600">${editingOrder.totalAmount}</span>
               </div>
               <div className="flex gap-3">
                 <button 
                   onClick={closeEditModal}
                   className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white border border-gray-300 hover:bg-gray-50"
                 >
                   {t('common.cancel')}
                 </button>
                 <button 
                   onClick={saveEditedOrder}
                   className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md flex justify-center items-center gap-2"
                 >
                   <Save size={20} /> {t('common.save')}
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};