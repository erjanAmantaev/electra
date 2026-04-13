import { useEffect, useState } from 'react';
import { User, Bell, Settings, CreditCard, Lock, Package, Sun, Moon, LogOut, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import {
  getBillingProfile,
  getOrderHistory,
  linkBillingCard,
  type BillingProfile,
  type OrderHistoryItem,
} from '../lib/storeApi';

const MAX_CARD_DIGITS = 19;

function toDigitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function formatCardNumberInput(value: string) {
  const digits = toDigitsOnly(value).slice(0, MAX_CARD_DIGITS);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiryInput(value: string) {
  const digits = toDigitsOnly(value).slice(0, 4);

  if (!digits) return '';
  if (digits.length < 2) return digits;

  let month = Number(digits.slice(0, 2));
  if (Number.isNaN(month) || month <= 0) month = 1;
  if (month > 12) month = 12;

  const monthText = String(month).padStart(2, '0');
  const yearText = digits.slice(2, 4);

  return yearText ? `${monthText}/${yearText}` : monthText;
}

function formatCvvInput(value: string) {
  return toDigitsOnly(value).slice(0, 3);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatOrderDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState('settings');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { user, signOut, isAuthenticated, token } = useAuth();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [billing, setBilling] = useState<BillingProfile | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [savingPaymentMethod, setSavingPaymentMethod] = useState(false);
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : 'Member';
  const emailAddress = user?.email ?? '';

  const handleSignOut = () => {
    signOut();
    toast.success('Signed out successfully.');
  };

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      if (activeTab !== 'orders' || !token || !isAuthenticated) return;

      setOrdersLoading(true);
      setOrdersError('');
      try {
        const result = await getOrderHistory(token);
        if (!mounted) return;
        setOrders(result);
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'Unable to load order history.';
        setOrdersError(message);
      } finally {
        if (mounted) setOrdersLoading(false);
      }
    };

    void loadOrders();

    return () => {
      mounted = false;
    };
  }, [activeTab, isAuthenticated, token]);

  useEffect(() => {
    let mounted = true;

    const loadBillingProfile = async () => {
      if (activeTab !== 'payment' || !token || !isAuthenticated) return;

      setBillingLoading(true);
      try {
        const profile = await getBillingProfile(token);
        if (!mounted) return;
        setBilling(profile);
        setCardHolderName(profile.card_holder_name || '');
        setShowAddPaymentForm(false);
      } catch (error) {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : 'Unable to load payment methods.';
        toast.error(message);
      } finally {
        if (mounted) setBillingLoading(false);
      }
    };

    void loadBillingProfile();

    return () => {
      mounted = false;
    };
  }, [activeTab, isAuthenticated, token]);

  const handleOpenPaymentForm = () => {
    setShowAddPaymentForm(true);
  };

  const handleSavePaymentMethod = async () => {
    if (!token) {
      toast.error('Please sign in to save a payment method.');
      return;
    }

    if (!cardHolderName.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      toast.error('Fill in all payment fields.');
      return;
    }

    const cardDigits = toDigitsOnly(cardNumber);
    const cvvDigits = toDigitsOnly(cvv);

    if (cardDigits.length < 12) {
      toast.error('Card number looks too short.');
      return;
    }

    if (expiry.length !== 5 || !expiry.includes('/')) {
      toast.error('Expiry should look like MM/YY.');
      return;
    }

    if (cvvDigits.length !== 3) {
      toast.error('CVV must be exactly 3 digits.');
      return;
    }

    setSavingPaymentMethod(true);
    try {
      const profile = await linkBillingCard(token, {
        card_holder_name: cardHolderName.trim(),
        card_number: cardDigits,
        expiry,
        cvv: cvvDigits,
      });

      setBilling(profile);
      setShowAddPaymentForm(false);
      setCardNumber('');
      setExpiry('');
      setCvv('');

      toast.success(`Payment method saved: ${profile.card_brand} •••• ${profile.card_last4}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save payment method.';
      toast.error(message);
    } finally {
      setSavingPaymentMethod(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-12 lg:px-24 py-24 text-center">
        <div className="bg-surface border border-border rounded-3xl p-12 shadow-2xl">
          <User className="mx-auto mb-6 w-16 h-16 text-primary" />
          <h1 className="text-3xl font-heading font-black mb-4">Welcome back.</h1>
          <p className="text-text-secondary max-w-xl mx-auto mb-8">
            Sign in to access your profile, order history, and personalized Electra settings.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-text-primary text-background px-6 py-3 text-sm font-bold hover:bg-primary transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'settings', label: 'Profile Details', icon: <User className="w-4 h-4" /> },
    { id: 'orders', label: 'Order History', icon: <Package className="w-4 h-4" /> },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Login', icon: <Lock className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-12 lg:px-24 py-12">
      {/* Header Section */}
      <header className="mb-12 border-b border-border pb-12 flex flex-col items-center md:items-start text-center md:text-left">
        <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">Member Settings</span>
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter mb-2">{displayName}</h1>
        <p className="text-text-secondary">{emailAddress}</p>
      </header>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Aside - Secondary Navigation */}
        <aside className="w-full md:w-64 shrink-0">
           <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-surface border border-border shadow-sm text-primary' : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
              
              <div className="hidden md:block w-full h-[1px] bg-border my-4"></div>
              
              <button onClick={handleSignOut} className="hidden md:flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-error hover:bg-error/10 transition-colors mt-auto">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
           </nav>
        </aside>

        {/* Main Settings List */}
        <main className="flex-1">
           <AnimatePresence mode="wait">
             {activeTab === 'settings' && (
               <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-12">
                 
                 {/* Notifications Group */}
                 <section>
                    <h3 className="text-xs font-bold tracking-widest text-text-tertiary uppercase mb-6 flex items-center gap-2">
                       <Bell className="w-4 h-4" /> NOTIFICATIONS
                    </h3>
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border">
                       <div className="p-6 flex justify-between items-center bg-background/50 hover:bg-background transition-colors cursor-pointer" onClick={() => toast('Toggled order status.')}>
                          <div>
                            <h4 className="font-bold text-sm mb-1">Order Status Updates</h4>
                            <p className="text-xs text-text-secondary">Real-time alerts for delivery tracking.</p>
                          </div>
                          <div className="w-10 h-6 bg-primary rounded-full relative shadow-inner">
                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow"></div>
                          </div>
                       </div>
                       <div className="p-6 flex justify-between items-center bg-background/50 hover:bg-background transition-colors cursor-pointer" onClick={() => toast('Toggled product releases.')}>
                          <div>
                            <h4 className="font-bold text-sm mb-1">Product Releases</h4>
                            <p className="text-xs text-text-secondary">Early access to new flagship hardware.</p>
                          </div>
                          <div className="w-10 h-6 bg-surface-hover border border-border rounded-full relative shadow-inner">
                            <div className="w-4 h-4 bg-text-tertiary rounded-full absolute left-1 top-1 shadow"></div>
                          </div>
                       </div>
                       <div className="p-6 flex justify-between items-center bg-background/50 hover:bg-background transition-colors cursor-pointer" onClick={() => toast('Toggled account activity.')}>
                          <div>
                            <h4 className="font-bold text-sm mb-1">Account Activity</h4>
                            <p className="text-xs text-text-secondary">Security notifications for new logins.</p>
                          </div>
                          <div className="w-10 h-6 bg-primary rounded-full relative shadow-inner">
                            <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow"></div>
                          </div>
                       </div>
                    </div>
                 </section>

                 {/* System Preferences */}
                 <section>
                    <h3 className="text-xs font-bold tracking-widest text-text-tertiary uppercase mb-6 flex items-center gap-2">
                       <Settings className="w-4 h-4" /> SYSTEM
                    </h3>
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border">
                       <div className="p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-background/50">
                          <div>
                            <h4 className="font-bold text-sm mb-1">Interface Theme</h4>
                          </div>
                          <div className="flex bg-surface-hover border border-border p-1 rounded-xl">
                            <button onClick={() => setTheme('light')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'light' ? 'bg-background shadow text-text-primary' : 'text-text-secondary'}`}>
                               <Sun className="w-4 h-4" /> Light
                            </button>
                            <button onClick={() => setTheme('dark')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-black text-white shadow' : 'text-text-secondary'}`}>
                               <Moon className="w-4 h-4" /> Dark
                            </button>
                          </div>
                       </div>
                       <div className="p-6 flex justify-between items-center bg-background/50">
                          <h4 className="font-bold text-sm">Language</h4>
                          <button className="flex items-center gap-2 text-sm font-medium bg-surface border border-border px-4 py-2 rounded-xl hover:bg-surface-hover transition-colors">
                            🇺🇸 English (US)
                          </button>
                       </div>
                    </div>
                 </section>

               </motion.div>
             )}

             {activeTab === 'orders' && (
               <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                 {/* Order History */}
                 <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold tracking-widest text-text-tertiary uppercase flex items-center gap-2">
                       <Package className="w-4 h-4" /> RECENT PURCHASES
                    </h3>
                    <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">{orders.length} orders</span>
                 </div>

                 {ordersLoading ? (
                   <div className="text-sm text-text-secondary">Loading order history...</div>
                 ) : ordersError ? (
                   <div className="border border-error/30 bg-error/10 text-error rounded-xl px-4 py-3 text-sm">{ordersError}</div>
                 ) : orders.length === 0 ? (
                   <div className="bg-surface border border-border rounded-2xl p-8 text-text-secondary">
                     No orders yet. Your completed checkouts will appear here.
                   </div>
                 ) : (
                   <div className="flex flex-col gap-4">
                     {orders.map(order => {
                       const preview = order.items[0];
                       const statusStyle =
                         order.status === 'completed'
                           ? 'bg-success/10 text-success border-success/20'
                           : order.status === 'processing'
                           ? 'bg-warning/10 text-warning border-warning/20'
                           : 'bg-error/10 text-error border-error/20';

                       return (
                         <div key={order.id} className="bg-surface border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:shadow-md transition-shadow">
                           <div
                             className="w-20 h-20 bg-background rounded-xl border border-border shrink-0 bg-cover bg-center"
                             style={{ backgroundImage: preview?.image_url ? `url('${preview.image_url}')` : undefined }}
                           ></div>
                           <div className="flex-1">
                             <h4 className="font-heading font-bold text-lg mb-1">
                               {order.order_number} • {order.item_count} item{order.item_count === 1 ? '' : 's'}
                             </h4>
                             <p className="text-sm text-text-secondary">
                               {formatOrderDate(order.placed_at)} • {order.delivery_method === 'express' ? 'Express Delivery' : 'Standard Shipping'}
                             </p>
                             {preview && (
                               <p className="text-xs text-text-tertiary mt-2">
                                 Top item: {preview.product_name}
                               </p>
                             )}
                           </div>
                           <div className="flex flex-col sm:items-end gap-2 mt-4 sm:mt-0">
                             <p className="font-bold text-lg">{formatCurrency(Number(order.total_amount))}</p>
                             <span className={`border px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${statusStyle}`}>
                               {order.status}
                             </span>
                             <Link
                               to={`/orders/${encodeURIComponent(order.order_number)}`}
                               className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary hover:opacity-80"
                             >
                               View details <ArrowRight className="w-3 h-3" />
                             </Link>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 )}
               </motion.div>
             )}
             
             {/* Security and Payment mock tabs to fill out UI interaction */}
             {activeTab === 'payment' && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="font-heading font-bold text-2xl">Payment Methods</h3>
                      <p className="text-sm text-text-secondary">Manage your saved card for faster checkout.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenPaymentForm}
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-text-primary text-background text-sm font-bold hover:bg-primary transition-colors"
                    >
                      {billing?.is_card_linked ? 'Update Method' : 'Add Method'}
                    </button>
                  </div>

                  {billingLoading ? (
                    <div className="bg-surface border border-border rounded-2xl p-6 text-sm text-text-secondary">Loading payment methods...</div>
                  ) : (
                    <>
                      {billing?.is_card_linked && (
                        <div className="bg-surface border border-border rounded-2xl p-6">
                          <p className="text-xs font-bold tracking-widest uppercase text-text-tertiary mb-2">Saved Card</p>
                          <p className="font-bold text-lg mb-1">{billing.card_brand} •••• {billing.card_last4}</p>
                          <p className="text-sm text-text-secondary">Card holder: {billing.card_holder_name || 'Not set'}</p>
                        </div>
                      )}

                      {showAddPaymentForm && (
                        <form
                          onSubmit={event => {
                            event.preventDefault();
                            void handleSavePaymentMethod();
                          }}
                          className="bg-surface border border-border rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                          <div className="sm:col-span-2 flex flex-col gap-2">
                            <label className="text-xs font-bold text-text-tertiary tracking-widest uppercase">Card Holder</label>
                            <input
                              value={cardHolderName}
                              onChange={event => setCardHolderName(event.target.value)}
                              placeholder="Alex Thompson"
                              className="bg-background border border-border p-3 rounded-xl focus:border-primary outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2 flex flex-col gap-2">
                            <label className="text-xs font-bold text-text-tertiary tracking-widest uppercase">Card Number</label>
                            <input
                              value={cardNumber}
                              onChange={event => setCardNumber(formatCardNumberInput(event.target.value))}
                              placeholder="4242 4242 4242 4242"
                              inputMode="numeric"
                              maxLength={23}
                              autoComplete="cc-number"
                              className="bg-background border border-border p-3 rounded-xl focus:border-primary outline-none font-mono tracking-widest"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-text-tertiary tracking-widest uppercase">Expiry</label>
                            <input
                              value={expiry}
                              onChange={event => setExpiry(formatExpiryInput(event.target.value))}
                              placeholder="MM/YY"
                              inputMode="numeric"
                              maxLength={5}
                              autoComplete="cc-exp"
                              className="bg-background border border-border p-3 rounded-xl focus:border-primary outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-text-tertiary tracking-widest uppercase">CVV</label>
                            <input
                              value={cvv}
                              onChange={event => setCvv(formatCvvInput(event.target.value))}
                              placeholder="123"
                              inputMode="numeric"
                              maxLength={3}
                              autoComplete="cc-csc"
                              className="bg-background border border-border p-3 rounded-xl focus:border-primary outline-none"
                            />
                          </div>

                          <div className="sm:col-span-2 flex justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => setShowAddPaymentForm(false)}
                              className="px-5 py-2.5 rounded-full border border-border text-sm font-bold hover:bg-background transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={savingPaymentMethod}
                              className="px-5 py-2.5 rounded-full bg-text-primary text-background text-sm font-bold hover:bg-primary transition-colors disabled:opacity-60"
                            >
                              {savingPaymentMethod ? 'Saving...' : 'Save Method'}
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </motion.div>
             )}

             {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                   <div className="bg-surface border border-border rounded-2xl p-8">
                      <h3 className="font-heading font-bold text-xl mb-4">Change Password</h3>
                      <div className="flex flex-col gap-4 max-w-sm">
                         <input type="password" placeholder="Current Password" className="bg-background border border-border p-3 rounded-xl focus:border-primary outline-none" />
                         <input type="password" placeholder="New Password" className="bg-background border border-border p-3 rounded-xl focus:border-primary outline-none" />
                         <button onClick={() => toast.success('Password updated')} className="bg-text-primary text-background p-3 rounded-xl font-bold mt-2 hover:bg-primary transition-colors">Update Password</button>
                      </div>
                   </div>
                </motion.div>
             )}
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
