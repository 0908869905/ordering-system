import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Plus, Minus, X, Ticket, Wifi, WifiOff, Loader2, Check, Megaphone, Utensils, Coffee } from 'lucide-react';
import { Peer } from 'peerjs';
import { MENU_ITEMS, STORAGE_KEY, CUSTOMER_STORAGE_KEY, COUNTER_KEY, FIXED_KITCHEN_ID } from '../constants';
import { MenuItem, CartItem, Order, OrderStatus, PeerMessage, MenuOption, Inventory, Category } from '../types';
import { generateWelcomeMessage } from '../services/geminiService';
import { useLanguage } from '../LanguageContext';

interface CustomerViewProps {
  onBack: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ onBack }) => {
  const { t, language } = useLanguage();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [inventory, setInventory] = useState<Inventory>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(t('common.loading'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState<Order | null>(null);
  
  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Ref to prevent double submission synchronously
  const isSubmittingRef = useRef(false);
  
  // Queue Status
  const [servingNumber, setServingNumber] = useState<number | null>(null);
  const [showQueueModal, setShowQueueModal] = useState(false);
  
  // Option & Note Selection State
  const [selectingItem, setSelectingItem] = useState<MenuItem | null>(null);
  const [currentOptions, setCurrentOptions] = useState<Record<string, number>>({});
  const [currentItemNote, setCurrentItemNote] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);

  // Connection State
  const [isConnected, setIsConnected] = useState(false);
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<any>(null);

  // Cart Animation State
  const [isCartAnimating, setIsCartAnimating] = useState(false);

  useEffect(() => {
    generateWelcomeMessage().then(msg => {
        setWelcomeMessage(msg); 
    });
    
    // Initialize Peer Once
    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', (id) => {
        console.log("Customer Peer ID:", id);
        connectToKitchen();
    });

    peer.on('error', (err) => {
        if (err.type === 'peer-unavailable') {
            // Kitchen is not online yet, will be handled by retry interval
            return;
        }
        console.error("Peer Error:", err);
    });

    return () => {
      if (peerRef.current) peerRef.current.destroy();
    };
  }, []);

  // Update welcome message when language changes
  useEffect(() => {
     setWelcomeMessage(t('common.loading'));
     setTimeout(() => {
         setWelcomeMessage(language === 'en' ? 'Welcome! Order your delicious food here!' : '哇塞！超熱騰騰香噴噴的炒麵香腸來囉！快來吃爆它！');
     }, 500);
  }, [language, t]);

  // Toast Timer Effect
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const connectToKitchen = () => {
    const peer = peerRef.current;
    if (!peer || peer.destroyed) return;
    
    if (connRef.current && connRef.current.open) {
        setIsConnected(true);
        return;
    }

    // console.log("Attempting to connect to:", FIXED_KITCHEN_ID);
    const conn = peer.connect(FIXED_KITCHEN_ID);
    
    conn.on('open', () => {
      console.log("Connected to Kitchen!");
      setIsConnected(true);
      connRef.current = conn;
    });

    conn.on('data', (data: any) => {
       const msg = data as PeerMessage;
       
       if (msg.type === 'ORDER_CREATED') {
          const confirmedOrder = msg.payload as Order;
          // Save to CUSTOMER storage, not main storage, to avoid collision on localhost
          const storedOrders = localStorage.getItem(CUSTOMER_STORAGE_KEY);
          const orders = storedOrders ? JSON.parse(storedOrders) : [];
          orders.push(confirmedOrder);
          localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(orders));
          
          setOrderComplete(confirmedOrder);
          setCart([]);
          setIsSubmitting(false);
          isSubmittingRef.current = false; // Reset lock
          setIsCartOpen(false);
       }

       if (msg.type === 'SYNC_INVENTORY') {
           setInventory(msg.payload);
       }

       if (msg.type === 'SYNC_ORDERS') {
           const orders = msg.payload as Order[];
           const completed = orders
              .filter((o: Order) => o.status === OrderStatus.COMPLETED)
              .sort((a, b) => b.timestamp - a.timestamp);
           setServingNumber(completed.length > 0 ? completed[0].orderNumber : null);
       }
    });

    conn.on('close', () => {
      setIsConnected(false);
      connRef.current = null;
    });

    conn.on('error', (err) => {
      // console.error("Connection error:", err);
      setIsConnected(false);
      connRef.current = null;
    });
  };

  // Reconnect Interval - Increased to 2000ms to avoid network spam
  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setInterval>;
    if (!isConnected) {
      reconnectTimer = setInterval(() => {
        connectToKitchen();
      }, 2000); 
    }
    return () => clearInterval(reconnectTimer);
  }, [isConnected]);

  // --- Helper to get max available stock considering cart ---
  const getRemainingStock = (itemId: string): number => {
      if (!isConnected) return 999;
      
      const inv = inventory as unknown as Record<string, number>;
      const serverStock = (inv[itemId] as number) ?? 0;
      
      // Strict prefix check to avoid m1 matching m11
      const inCart = cart.filter(c => c.id === itemId || c.id.startsWith(itemId + '-')).reduce((sum, c) => sum + c.quantity, 0);
      
      let effectiveStock = Math.max(0, serverStock - inCart);

      // --- SPECIAL RULE: Fried Noodles (m1) consumes Egg (opt-egg) ---
      // If we are checking stock for Noodles (m1), we must also check if we have enough Eggs.
      if (itemId === 'm1') {
          const eggServerStock = (inv['opt-egg'] as number) ?? 0;
          
          // Calculate Total Eggs currently claimed in cart
          // 1. Eggs claimed by m1 orders (1 per m1)
          const eggsForM1 = cart
              .filter(c => c.id === 'm1' || c.id.startsWith('m1-'))
              .reduce((sum, c) => sum + c.quantity, 0);
          
          // 2. Eggs claimed by 'Add Egg' option (across ANY item)
          const eggsForOptions = cart.reduce((sum, c) => {
              if (c.selectedOptions) {
                  const eggOpts = c.selectedOptions.filter(o => o.id === 'opt-egg');
                  return sum + (eggOpts.length * c.quantity);
              }
              return sum;
          }, 0);

          const totalEggsUsed = eggsForM1 + eggsForOptions;
          const remainingEggs = Math.max(0, eggServerStock - totalEggsUsed);

          // The limit for m1 is the minimum of its own stock OR the remaining egg stock
          effectiveStock = Math.min(effectiveStock, remainingEggs);
      }

      // --- SPECIAL RULE: Add Egg (opt-egg) check ---
      // If we are checking stock for 'opt-egg' directly (e.g. for the option button), we must account for m1 usage
      if (itemId === 'opt-egg') {
           const eggsForM1 = cart
              .filter(c => c.id === 'm1' || c.id.startsWith('m1-'))
              .reduce((sum, c) => sum + c.quantity, 0);
           
           const eggsForOptions = cart.reduce((sum, c) => {
              if (c.selectedOptions) {
                  const eggOpts = c.selectedOptions.filter(o => o.id === 'opt-egg');
                  return sum + (eggOpts.length * c.quantity);
              }
              return sum;
          }, 0);
          
          effectiveStock = Math.max(0, serverStock - (eggsForM1 + eggsForOptions));
      }

      return effectiveStock;
  };

  // --- Cart Logic with Options ---

  const handleItemClick = (item: MenuItem) => {
    // Check stock before opening modal
    const remaining = getRemainingStock(item.id);
    if (remaining <= 0) return;

    setSelectingItem(item);
    setCurrentOptions({}); // Reset options
    setCurrentItemNote('');
    setCurrentQuantity(1);
  };

  const updateOptionQuantity = (optionId: string, delta: number) => {
    const currentQty = currentOptions[optionId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    // Check stock if increasing
    if (delta > 0 && isConnected) {
        const available = getRemainingStock(optionId);
        
        if (newQty > currentQty && available < (newQty - ((currentOptions[optionId] as number) || 0))) {
             if (newQty > available) return;
        }
    }

    setCurrentOptions(prev => {
        const newState = { ...prev, [optionId]: newQty };
        if (newQty === 0) {
            delete newState[optionId];
        }
        return newState;
    });
  };

  const confirmOptions = () => {
    if (!selectingItem) return;
    
    // Construct selected options array based on counts
    const selected: MenuOption[] = [];
    Object.entries(currentOptions).forEach(([id, count]) => {
        const opt = selectingItem.options?.find(o => o.id === id);
        if (opt) {
            for (let i = 0; i < count; i++) {
                selected.push(opt);
            }
        }
    });

    addItemToCart(selectingItem, selected, currentItemNote.trim(), currentQuantity);
    showToast(`✅ ${getItemName(selectingItem)} ${t('customer.addedToCart')}`);
    setSelectingItem(null);
    setCurrentOptions({});
    setCurrentItemNote('');
    setCurrentQuantity(1);
  };

  const addItemToCart = (item: MenuItem, selectedOptions: MenuOption[], note: string = '', quantity: number = 1) => {
    const optionsSuffix = selectedOptions.length > 0 
      ? '-' + selectedOptions.map(o => o.id).sort().join('-') 
      : '';
    const noteSuffix = note ? `-${btoa(unescape(encodeURIComponent(note))).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}` : '';
    const cartItemId = item.id + optionsSuffix + noteSuffix;
    const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    const finalPrice = item.price + optionsPrice;

    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        return prev.map((i) => i.id === cartItemId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, id: cartItemId, price: finalPrice, selectedOptions: selectedOptions, note: note, quantity: quantity }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  const addMoreFromCart = (item: CartItem) => {
     // Strict prefix match to find the base item info
     const baseItem = MENU_ITEMS.find(m => item.id === m.id || item.id.startsWith(m.id + '-'));
     if (baseItem) {
         const remaining = getRemainingStock(baseItem.id);
         if (remaining <= 0) {
             alert(t('customer.inventoryLow'));
             return;
         }
         
         // Also check options if they have stock limits (like eggs)
         if (item.selectedOptions) {
             for (const opt of item.selectedOptions) {
                 const optRemaining = getRemainingStock(opt.id);
                 if (optRemaining <= 0) {
                     alert(`${t('customer.inventoryLow')} (${getOptionName(opt)})`);
                     return;
                 }
             }
         }
     }

     setCart((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Trigger animation when total items change (add/remove)
  useEffect(() => {
    if (totalItems > 0) {
        setIsCartAnimating(true);
        const timer = setTimeout(() => setIsCartAnimating(false), 200);
        return () => clearTimeout(timer);
    }
  }, [totalItems]);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return;
    
    // Check synchronous ref to prevent double submission race conditions
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    if (connRef.current && isConnected) {
      // --- Pre-flight Stock Validation ---
      // We must calculate the TOTAL need for the whole cart and compare it to current inventory
      // This is safer than relying on `getRemainingStock` during individual item additions
      const needed: Record<string, number> = {};
      
      cart.forEach(item => {
          // Identify base item (assuming ID format like 'm1' or 'm1-opt...')
          // We can find the base item definition by prefix
          const baseItemDef = MENU_ITEMS.find(m => item.id === m.id || item.id.startsWith(m.id + '-'));
          
          if (baseItemDef) {
              // 1. Count Base Item
              needed[baseItemDef.id] = (needed[baseItemDef.id] || 0) + item.quantity;

              // 2. Count Implicit Dependencies (Special Rule: M1 uses Opt-Egg)
              if (baseItemDef.id === 'm1') {
                  needed['opt-egg'] = (needed['opt-egg'] || 0) + item.quantity;
              }
          }

          // 3. Count Explicit Options
          if (item.selectedOptions) {
              item.selectedOptions.forEach(opt => {
                  needed[opt.id] = (needed[opt.id] || 0) + item.quantity;
              });
          }
      });

      // Verify against Inventory
      let isStockSufficient = true;
      for (const [id, qty] of Object.entries(needed)) {
          const currentStock = (inventory[id] as number) ?? 0;
          if (currentStock < qty) {
              // Find readable name for error
              let name = id;
              const menuItem = MENU_ITEMS.find(m => m.id === id);
              if (menuItem) name = getItemName(menuItem);
              else {
                  // Search inside options
                  for (const m of MENU_ITEMS) {
                      const opt = m.options?.find(o => o.id === id);
                      if (opt) { name = getOptionName(opt); break; }
                  }
              }
              
              alert(`${t('customer.inventoryLow')} (${name})`);
              isStockSufficient = false;
              break;
          }
      }

      if (!isStockSufficient) {
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          return;
      }

      // Generate a unique transaction ID for this submission attempt
      const transactionId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      const message: PeerMessage = {
        type: 'SUBMIT_ORDER',
        payload: { items: cart, totalAmount: totalAmount, transactionId: transactionId }
      };
      connRef.current.send(message);
    } else {
      if (confirm(t('customer.useLocalConfirm'))) {
          const currentCount = parseInt(localStorage.getItem(COUNTER_KEY) || '0');
          const newOrderNumber = currentCount + 1;
          const newOrder: Order = {
            id: Date.now().toString(),
            orderNumber: newOrderNumber,
            items: cart,
            totalAmount,
            status: OrderStatus.UNPAID,
            timestamp: Date.now(),
          };
          // Save to CUSTOMER storage
          const storedOrders = localStorage.getItem(CUSTOMER_STORAGE_KEY);
          const orders = storedOrders ? JSON.parse(storedOrders) : [];
          orders.push(newOrder);
          localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(orders));
          localStorage.setItem(COUNTER_KEY, newOrderNumber.toString());
    
          setOrderComplete(newOrder);
          setCart([]);
          setIsSubmitting(false);
          isSubmittingRef.current = false;
          setIsCartOpen(false);
      } else {
          setIsSubmitting(false);
          isSubmittingRef.current = false;
      }
    }
  };

  const handleNewOrder = () => setOrderComplete(null);

  const getItemName = (item: MenuItem | CartItem) => {
      return language === 'en' ? (item.name_en || item.name) : item.name;
  };

  const getOptionName = (opt: MenuOption) => {
      return language === 'en' ? (opt.name_en || opt.name) : opt.name;
  };
  
  const getOptionNote = (opt: MenuOption) => {
      return language === 'en' ? (opt.note_en || opt.note) : opt.note;
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center relative">
        {/* Connection Status Indicator in Success Screen */}
        <div className="absolute top-4 right-4">
           <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${isConnected ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isConnected ? t('customer.connected') : t('customer.disconnected')}
           </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full animate-bounce-in border border-green-100">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket className="w-12 h-12 text-green-700" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-2">{t('customer.orderSuccess')}</h2>
          <div className="my-8 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <p className="text-gray-700 text-sm uppercase tracking-wide font-bold mb-2">{t('customer.orderNumber')}</p>
            <p className="text-8xl font-black text-gray-900 tracking-tighter">#{orderComplete.orderNumber}</p>
          </div>
          <p className="text-base text-gray-800 font-medium mb-8">
             {t('customer.payInstruction')} <span className="text-red-700 font-bold">{t('customer.payInstructionBold')}</span>{t('customer.payInstructionEnd')}
          </p>
          
          <button 
            onClick={() => setShowQueueModal(true)}
            className="w-full bg-yellow-400 text-yellow-900 py-4 rounded-xl text-xl font-bold hover:bg-yellow-500 transition-colors shadow-lg focus:ring-4 focus:ring-yellow-200 outline-none mb-3 flex items-center justify-center gap-2"
          >
            <Megaphone size={24} />
            {t('customer.checkQueue')}
          </button>

          <button 
            onClick={handleNewOrder}
            className="w-full bg-green-700 text-white py-4 rounded-xl text-xl font-bold hover:bg-green-800 transition-colors shadow-lg focus:ring-4 focus:ring-green-300 outline-none"
          >
            {t('customer.backToHome')}
          </button>
        </div>

        {/* Re-using Queue Status Modal for Order Success Screen */}
        {showQueueModal && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowQueueModal(false)}>
                <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-400"></div>
                    <h3 className="text-2xl font-black text-gray-800 mb-6">{t('customer.currentServing')}</h3>
                    <div className="mb-8">
                        {servingNumber ? (
                            <span className="text-9xl font-black text-yellow-500 drop-shadow-sm leading-none">
                                {servingNumber}
                            </span>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-gray-400 py-4">
                                <Megaphone size={48} className="opacity-20" />
                                <span className="text-xl font-bold">{t('customer.noActiveQueue')}</span>
                            </div>
                        )}
                    </div>
                    <button 
                    onClick={() => setShowQueueModal(false)}
                    className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors"
                    >
                    {t('common.close')}
                    </button>
                </div>
            </div>
        )}
      </div>
    );
  }

  // Calculate dynamic price based on option quantities
  const currentOptionsPrice = selectingItem 
    ? (selectingItem.options 
        ? selectingItem.options.reduce((sum, opt) => sum + (opt.price * (currentOptions[opt.id] || 0)), 0) 
        : 0)
    : 0;

  // Calculate max allowable quantity for the modal
  const maxSelectableQuantity = selectingItem ? getRemainingStock(selectingItem.id) : 1;

  return (
    <div className="min-h-screen bg-gray-100 pb-32 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[80] animate-fade-in-up">
           <div className="bg-slate-900/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 text-sm md:text-base border border-slate-700/50">
              <Check size={18} className="text-green-400" />
              {toastMessage}
           </div>
        </div>
      )}

      {/* Queue Status Modal */}
      {showQueueModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowQueueModal(false)}>
            <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-400"></div>
                <h3 className="text-2xl font-black text-gray-800 mb-6">{t('customer.currentServing')}</h3>
                <div className="mb-8">
                    {servingNumber ? (
                        <span className="text-9xl font-black text-yellow-500 drop-shadow-sm leading-none">
                            {servingNumber}
                        </span>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-400 py-4">
                            <Megaphone size={48} className="opacity-20" />
                            <span className="text-xl font-bold">{t('customer.noActiveQueue')}</span>
                        </div>
                    )}
                </div>
                <button 
                  onClick={() => setShowQueueModal(false)}
                  className="w-full bg-gray-100 text-gray-800 py-3 rounded-xl font-bold text-lg hover:bg-gray-200 transition-colors"
                >
                  {t('common.close')}
                </button>
            </div>
        </div>
      )}

      {/* Option Selection Modal */}
      {selectingItem && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]" role="dialog" aria-modal="true">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-orange-50 shrink-0">
              <h3 className="text-2xl font-black text-gray-900">{getItemName(selectingItem)}</h3>
              <button onClick={() => setSelectingItem(null)} className="p-2 bg-white rounded-full text-gray-600 hover:text-gray-900 border border-gray-200" aria-label={t('common.close')}>
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="mb-4 p-2 bg-orange-100 text-orange-900 text-center rounded-lg font-bold text-sm border border-orange-200">
                  {t('customer.stock')}: {maxSelectableQuantity}
              </div>

              {selectingItem.options && selectingItem.options.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-600 font-bold mb-4 text-sm uppercase tracking-wide">{t('customer.addOns')}</p>
                  <div className="space-y-3">
                    {selectingItem.options.map((opt) => {
                      const qty = currentOptions[opt.id] || 0;
                      
                      const available = getRemainingStock(opt.id);
                      const effectiveStockLeft = Math.max(0, available - qty);
                      const isOptSoldOut = isConnected && effectiveStockLeft <= 0 && available <= 0;
                      const hasStock = !isConnected || effectiveStockLeft > 0;

                      return (
                        <div 
                          key={opt.id}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all 
                            ${isOptSoldOut 
                                ? 'bg-gray-100 border-gray-200 opacity-60' 
                                : qty > 0 
                                    ? 'border-orange-500 bg-orange-50' 
                                    : 'border-gray-200'
                            }`}
                        >
                          <div>
                              <p className={`font-bold ${isOptSoldOut ? 'text-gray-500' : 'text-gray-900'}`}>{getOptionName(opt)} (+${opt.price})</p>
                              {getOptionNote(opt) && <p className="text-xs text-orange-700 font-bold mt-0.5">{getOptionNote(opt)}</p>}
                          </div>

                          {isOptSoldOut ? (
                              <span className="text-xs font-black text-red-600 bg-red-100 px-2 py-1 rounded">{t('customer.soldOut')}</span>
                          ) : (
                              <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => updateOptionQuantity(opt.id, -1)}
                                    disabled={qty === 0}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${qty > 0 ? 'bg-white border-orange-300 text-orange-700' : 'bg-gray-100 border-gray-300 text-gray-400'}`}
                                    aria-label={`Decrease ${getOptionName(opt)}`}
                                  >
                                      <Minus size={16}/>
                                  </button>
                                  <span className={`font-black w-4 text-center ${qty > 0 ? 'text-orange-800' : 'text-gray-400'}`}>{qty}</span>
                                  <button 
                                    onClick={() => updateOptionQuantity(opt.id, 1)}
                                    disabled={!hasStock}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${hasStock ? 'bg-orange-600 border-orange-600 text-white shadow-md' : 'bg-gray-100 border-gray-300 text-gray-400'}`}
                                    aria-label={`Increase ${getOptionName(opt)}`}
                                  >
                                      <Plus size={16}/>
                                  </button>
                              </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Note Input */}
              <div className="mb-6">
                 <p className="text-gray-600 font-bold mb-2 text-sm uppercase tracking-wide">{t('customer.note')}</p>
                 <textarea
                  value={currentItemNote}
                  onChange={(e) => setCurrentItemNote(e.target.value)}
                  placeholder={t('customer.notePlaceholder')}
                  rows={3}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none text-gray-900 font-medium resize-none bg-gray-50 placeholder-gray-400"
                 />
              </div>

               {/* Quantity Selector */}
               <div className="flex items-center justify-between py-4 border-t border-gray-200">
                  <span className="font-bold text-gray-800 text-lg">{t('common.quantity')}</span>
                  <div className="flex items-center gap-6 bg-gray-100 rounded-xl p-2 border border-gray-300">
                    <button 
                      onClick={() => setCurrentQuantity(q => Math.max(1, q - 1))}
                      className={`p-3 rounded-lg bg-white shadow-sm border border-gray-300 ${currentQuantity <= 1 ? 'text-gray-300' : 'text-gray-900 hover:text-orange-700'}`}
                      disabled={currentQuantity <= 1}
                      aria-label="Decrease Quantity"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="font-black text-2xl w-8 text-center text-gray-900">{currentQuantity}</span>
                    <button 
                      onClick={() => setCurrentQuantity(q => Math.min(maxSelectableQuantity, q + 1))}
                      className={`p-3 rounded-lg bg-white shadow-sm border border-gray-300 ${currentQuantity >= maxSelectableQuantity ? 'text-gray-300' : 'text-gray-900 hover:text-orange-700'}`}
                      disabled={currentQuantity >= maxSelectableQuantity}
                       aria-label="Increase Quantity"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
               </div>
            </div>

            <div className="p-5 border-t border-gray-200 shrink-0 bg-white">
              <button 
                onClick={confirmOptions}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 shadow-lg active:scale-[0.98] transition-transform focus:ring-4 focus:ring-orange-300 outline-none"
              >
                {t('customer.addToCart')} ${ (selectingItem.price + currentOptionsPrice) * currentQuantity}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900">😋 {t('customer.stallName')}</h1>
            <p className="text-base font-medium text-gray-700 mt-1">{welcomeMessage}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowQueueModal(true)}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 transition-colors"
            >
              <Megaphone size={14} />
              {t('customer.checkQueue')}
            </button>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${isConnected ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isConnected ? t('customer.connected') : t('customer.disconnected')}
            </div>
            <button onClick={onBack} className="text-gray-700 hover:text-gray-900 font-bold text-sm bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300 transition-colors">
              {t('common.back')}
            </button>
          </div>
        </div>
        
        {!isConnected && (
          <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 animate-pulse">
             <Loader2 size={16} className="animate-spin" />
             {t('customer.reconnecting')}
          </div>
        )}
      </header>

      {/* Menu Grid */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MENU_ITEMS.map((item) => {
            const serverStock = isConnected ? ((inventory[item.id] as number) ?? 0) : 999;
            const remaining = getRemainingStock(item.id);
            const isSoldOut = serverStock <= 0 || (isConnected && remaining <= 0); // Logic updated
            
            // Check if user has maxed out their own cart capability for this item
            const isMaxedInCart = remaining <= 0 && !isSoldOut;
            
            const itemName = getItemName(item);
            const itemDesc = language === 'en' ? (item.description_en || item.description) : item.description;

            return (
              <div key={item.id} className={`bg-white rounded-3xl shadow-lg border border-gray-100 p-6 flex flex-col transition-all duration-300 relative overflow-hidden group ${isSoldOut ? 'opacity-80 pointer-events-none grayscale-[0.3]' : 'hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 active:scale-95 active:shadow-md'}`}>
                {/* Sticker Label */}
                <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-xs font-black uppercase tracking-wider shadow-sm transform transition-transform
                    ${item.category === Category.FOOD 
                        ? 'bg-yellow-400 text-yellow-900 shadow-[2px_2px_0px_rgba(202,138,4,0.3)]' 
                        : 'bg-blue-400 text-blue-900 shadow-[2px_2px_0px_rgba(30,58,138,0.3)]'
                    }`}
                >
                  <div className="flex items-center gap-1">
                      {item.category === Category.FOOD ? <Utensils size={12}/> : <Coffee size={12}/>}
                      {item.category}
                  </div>
                </div>

                {isSoldOut && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <div className="border-[6px] border-red-600 text-red-600 font-black text-4xl px-6 py-2 transform -rotate-12 opacity-80 backdrop-blur-[1px] bg-white/40 rounded-xl shadow-2xl tracking-widest uppercase border-double">
                            {t('customer.soldOut')}
                        </div>
                    </div>
                )}
                
                <div className="flex justify-between items-start mb-3 mt-4">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{itemName}</h3>
                  <span className="text-2xl font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">${item.price}</span>
                </div>
                
                <p className="text-gray-600 font-medium text-base mb-6 flex-grow leading-relaxed">
                  {itemDesc}
                </p>
                
                <button
                  onClick={() => {
                      if (isMaxedInCart) {
                          alert(t('customer.inventoryLow')); // Or a more specific "Limit Reached" message
                          return;
                      }
                      handleItemClick(item);
                  }}
                  disabled={isSoldOut}
                  className={`w-full border-2 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 outline-none focus:ring-4 focus:ring-orange-200
                    ${isMaxedInCart 
                        ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed' 
                        : 'bg-white text-orange-700 border-orange-200 hover:bg-orange-50 hover:border-orange-400 shadow-sm'
                    }
                    ${isSoldOut ? 'bg-gray-100 text-gray-400 border-gray-200' : ''}
                  `}
                >
                  {isSoldOut ? t('customer.restocking') : (isMaxedInCart ? t('customer.limitReached') : <><Plus size={24} /> {t('customer.addToOrder')}</>)}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-30 pointer-events-none">
          <button
            onClick={() => setIsCartOpen(true)}
            className={`pointer-events-auto bg-slate-900 text-white w-full max-w-md shadow-2xl shadow-slate-900/40 rounded-2xl py-4 px-6 flex justify-between items-center transform transition-all duration-300 border border-slate-700 focus:ring-4 focus:ring-slate-500 outline-none
                ${isCartAnimating ? 'scale-105 bg-slate-800' : 'hover:-translate-y-1'}
            `}
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border-2 border-slate-800 shadow-lg relative overflow-hidden group">
                <span className="relative z-10">{totalItems}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              </div>
              <span className="font-bold text-xl tracking-wide">{t('customer.viewOrder')}</span>
            </div>
            <span className="text-3xl font-black text-orange-400">${totalAmount}</span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200" role="dialog" aria-modal="true">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <ShoppingCart className="text-orange-600" /> {t('customer.yourOrder')}
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-700 border border-transparent hover:border-gray-300">
                <X size={28} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-white">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-5 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-gray-900">{getItemName(item)}</h4>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.selectedOptions.map((opt, idx) => (
                          <span key={idx} className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-bold border border-orange-200">
                            + {getOptionName(opt)}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.note && (
                       <p className="text-xs text-gray-600 mt-1 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded border border-gray-200">
                         {t('customer.note')}: {item.note}
                       </p>
                    )}
                    <p className="text-gray-600 font-bold text-sm mt-1">${item.price} / {t('common.unit')}</p>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-100 rounded-xl p-1.5 border border-gray-300">
                    <button onClick={() => removeFromCart(item.id)} className="p-2 bg-white rounded-lg shadow-sm text-gray-700 hover:text-red-600 border border-gray-200" aria-label="Decrease">
                      <Minus size={20} />
                    </button>
                    <span className="font-black text-xl w-8 text-center text-gray-900">{item.quantity}</span>
                    <button onClick={() => addMoreFromCart(item)} className="p-2 bg-white rounded-lg shadow-sm text-gray-700 hover:text-green-600 border border-gray-200" aria-label="Increase">
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="w-20 text-right font-black text-xl text-gray-900">
                    ${item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-700 font-bold text-lg">{t('customer.total')}</span>
                <span className="text-4xl font-black text-orange-600">${totalAmount}</span>
              </div>
              
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className={`w-full py-5 rounded-xl text-xl font-bold text-white shadow-lg transition-all border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 focus:ring-4 focus:ring-orange-300 outline-none ${
                  isSubmitting 
                  ? 'bg-gray-500 border-gray-700 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                }`}
              >
                {isSubmitting ? t('customer.processing') : t('customer.submitOrder')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};