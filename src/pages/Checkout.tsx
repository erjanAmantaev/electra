import { useEffect, useMemo, useState } from 'react';
import { CreditCard, AlertCircle, ArrowRight, Wallet, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  getBillingProfile,
  linkBillingCard,
  simulateCheckout,
  topUpWallet,
  type BillingProfile,
} from '../lib/storeApi';

const TAX_RATE = 0.08;
const EXPRESS_FEE = 25;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const { items, itemCount, subtotal, loading: cartLoading, refreshCart } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('express');
  const [billing, setBilling] = useState<BillingProfile | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [linkingCard, setLinkingCard] = useState(false);
  const [toppingUp, setToppingUp] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [topUpAmount, setTopUpAmount] = useState(100);

  const shipping = deliveryMethod === 'express' ? EXPRESS_FEE : 0;
  const tax = useMemo(() => Number((subtotal * TAX_RATE).toFixed(2)), [subtotal]);
  const total = Number((subtotal + shipping + tax).toFixed(2));
  const walletBalance = Number(billing?.wallet_balance ?? 0);
  const isCardLinked = Boolean(billing?.is_card_linked);

  const fetchBilling = async (accessToken: string) => {
    setBillingLoading(true);
    try {
      const profile = await getBillingProfile(accessToken);
      setBilling(profile);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to load billing profile.'));
    } finally {
      setBillingLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setBilling(null);
      return;
    }

    void fetchBilling(token);
  }, [isAuthenticated, token]);

  const handleLinkCard = async () => {
    if (!token) {
      toast.error('Please sign in first.');
      return;
    }

    setLinkingCard(true);
    try {
      const profile = await linkBillingCard(token, {
        card_holder_name: cardHolderName,
        card_number: cardNumber,
        expiry,
        cvv,
      });

      setBilling(profile);
      setCardNumber('');
      setCvv('');
      toast.success(`Card linked: ${profile.card_brand} •••• ${profile.card_last4}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to link card.'));
    } finally {
      setLinkingCard(false);
    }
  };

  const handleTopUp = async () => {
    if (!token) {
      toast.error('Please sign in first.');
      return;
    }

    if (!isCardLinked) {
      toast.error('Link a card before top-up.');
      return;
    }

    if (topUpAmount <= 0) {
      toast.error('Top-up amount must be greater than $0.');
      return;
    }

    setToppingUp(true);
    try {
      const result = await topUpWallet(token, topUpAmount);
      await fetchBilling(token);
      toast.success(`${result.message} Wallet: ${formatCurrency(Number(result.wallet_balance))}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Top-up failed.'));
    } finally {
      setToppingUp(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!isAuthenticated) {
      toast.info('Sign in to continue checkout.');
      navigate('/login');
      return;
    }

    if (!token) {
      toast.error('Your session expired. Please sign in again.');
      navigate('/login');
      return;
    }

    if (!isCardLinked) {
      toast.error('You need to link a card before checkout.');
      return;
    }

    if (itemCount < 1) {
      toast.error('Your cart is empty. Add a product before checkout.');
      navigate('/catalog');
      return;
    }

    setPlacingOrder(true);
    try {
      const result = await simulateCheckout(token, {
        amount: total,
        item_count: itemCount,
        delivery_method: deliveryMethod,
      });

      await refreshCart();
      toast.success('Checkout completed. Redirecting to order details...');

      const params = new URLSearchParams({
        order: result.order_number,
        amount: String(result.charged_amount),
        wallet: String(result.wallet_balance),
        brand: result.card_brand,
        last4: result.card_last4,
        delivery: deliveryMethod,
        usedWallet: result.used_wallet ? '1' : '0',
      });

      navigate(`/success?${params.toString()}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Checkout failed.'));
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 lg:px-24 py-12">
      <header className="flex justify-between items-center mb-12 border-b border-border pb-6">
        <h1 className="text-2xl font-heading font-black tracking-tighter">SECURE CHECKOUT</h1>
        <Link to="/cart" className="text-sm font-bold text-text-tertiary hover:text-primary transition-colors">
          BACK TO CART
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 flex flex-col gap-10">
          <div className="flex items-center gap-6 text-xs sm:text-sm font-bold tracking-widest uppercase">
            <span className="text-primary">01 Shipping</span>
            <span className="w-12 h-[1px] bg-border hidden sm:block"></span>
            <span className="text-primary">02 Card Link</span>
            <span className="w-12 h-[1px] bg-border hidden sm:block"></span>
            <span className="text-primary">03 Review</span>
          </div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-3xl p-8"
          >
            <h2 className="text-2xl font-heading font-bold mb-6">Delivery Method</h2>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setDeliveryMethod('standard')}
                className={`flex justify-between items-center p-5 border rounded-2xl transition-all ${
                  deliveryMethod === 'standard'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-text-tertiary bg-background'
                }`}
              >
                <div>
                  <p className="font-bold text-left">Standard Shipping</p>
                  <p className="text-sm text-text-secondary text-left">3-5 business days</p>
                </div>
                <span className="font-bold">Free</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('express')}
                className={`flex justify-between items-center p-5 border rounded-2xl transition-all ${
                  deliveryMethod === 'express'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-text-tertiary bg-background'
                }`}
              >
                <div>
                  <p className="font-bold text-left">Express Delivery</p>
                  <p className="text-sm text-text-secondary text-left">Next business day</p>
                </div>
                <span className="font-bold">{formatCurrency(EXPRESS_FEE)}</span>
              </button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-surface border border-border rounded-3xl p-8"
          >
            <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
                <CreditCard className="w-6 h-6" /> Card Link and Wallet
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase border ${
                  isCardLinked
                    ? 'bg-success/10 text-success border-success/30'
                    : 'bg-warning/10 text-warning border-warning/30'
                }`}
              >
                {isCardLinked ? 'Card linked' : 'Card required'}
              </span>
            </div>

            {!isAuthenticated ? (
              <div className="rounded-2xl border border-border bg-background p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="font-bold mb-1">Sign in to link your card and complete purchase.</p>
                  <p className="text-sm text-text-secondary">Checkout is blocked until a card is linked.</p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-text-primary text-background text-sm font-bold hover:bg-primary transition-colors"
                >
                  Sign In
                </Link>
              </div>
            ) : billingLoading ? (
              <div className="rounded-2xl border border-border bg-background p-6 text-sm text-text-secondary">
                Loading billing profile...
              </div>
            ) : isCardLinked ? (
              <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-success/30 bg-success/10 p-5">
                  <p className="font-bold text-success mb-2">Card on file</p>
                  <p className="text-sm text-text-secondary">
                    {billing?.card_brand} ending in {billing?.card_last4} under {billing?.card_holder_name}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-background p-5">
                  <p className="font-bold mb-3 flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> Wallet top-up imitation
                  </p>
                  <p className="text-sm text-text-secondary mb-4">
                    Wallet balance: <span className="font-bold text-text-primary">{formatCurrency(walletBalance)}</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={topUpAmount}
                      onChange={event => setTopUpAmount(Math.max(1, Number(event.target.value) || 1))}
                      className="w-full sm:w-52 bg-surface border border-border p-3 rounded-xl focus:border-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleTopUp}
                      disabled={toppingUp}
                      className="px-5 py-3 rounded-xl border border-border bg-text-primary text-background font-bold text-sm hover:bg-primary transition-colors disabled:opacity-60"
                    >
                      {toppingUp ? 'Processing...' : 'Top Up Wallet'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={event => {
                  event.preventDefault();
                  void handleLinkCard();
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold text-text-tertiary tracking-widest uppercase">Card Holder</label>
                  <input
                    value={cardHolderName}
                    onChange={event => setCardHolderName(event.target.value)}
                    placeholder="Alex Thompson"
                    className="bg-background border border-border p-4 rounded-xl focus:border-primary outline-none"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold text-text-tertiary tracking-widest uppercase">Card Number</label>
                  <input
                    value={cardNumber}
                    onChange={event => setCardNumber(event.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="bg-background border border-border p-4 rounded-xl focus:border-primary outline-none font-mono tracking-widest"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-text-tertiary tracking-widest uppercase">Expiry</label>
                  <input
                    value={expiry}
                    onChange={event => setExpiry(event.target.value)}
                    placeholder="MM/YY"
                    className="bg-background border border-border p-4 rounded-xl focus:border-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-text-tertiary tracking-widest uppercase">CVV</label>
                  <input
                    value={cvv}
                    onChange={event => setCvv(event.target.value)}
                    placeholder="123"
                    className="bg-background border border-border p-4 rounded-xl focus:border-primary outline-none"
                  />
                </div>

                <div className="sm:col-span-2 mt-2">
                  <button
                    type="submit"
                    disabled={linkingCard}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-text-primary text-background font-bold text-sm hover:bg-primary transition-colors disabled:opacity-60"
                  >
                    {linkingCard ? 'Linking card...' : 'Link Card'}
                  </button>
                </div>
              </form>
            )}
          </motion.section>

          <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-text-tertiary uppercase">
            <ShieldCheck className="w-4 h-4" /> Simulated secure checkout with linked card verification
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-3xl p-8 sticky top-8 shadow-xl">
            <h2 className="text-xl font-heading font-black mb-8">YOUR SELECTION</h2>

            <div className="flex flex-col gap-6 mb-8 border-b border-border pb-8">
              {cartLoading ? (
                <p className="text-sm text-text-secondary">Loading cart items...</p>
              ) : items.length === 0 ? (
                <p className="text-sm text-warning">Your cart is empty.</p>
              ) : (
                items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div
                      className="w-16 h-16 bg-background rounded-lg border border-border shrink-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${item.product.image_url}')` }}
                    ></div>
                    <div className="flex-1 flex justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm">{item.product.name}</h4>
                        <p className="text-xs text-text-secondary mt-1">QTY: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-sm">{formatCurrency(Number(item.line_total))}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-col gap-4 text-sm mb-8">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary font-medium">SUBTOTAL</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary font-medium">SHIPPING</span>
                <span className="font-bold text-success">{shipping > 0 ? formatCurrency(shipping) : 'Free'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary font-medium">TAX</span>
                <span className="font-bold">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border pt-4 mt-2">
                <span className="font-bold text-base">TOTAL</span>
                <span className="font-black text-2xl">{formatCurrency(total)}</span>
              </div>
            </div>

            <div
              className={`rounded-xl border px-4 py-3 text-sm mb-6 ${
                isCardLinked
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-warning/30 bg-warning/10 text-warning'
              }`}
            >
              {isCardLinked
                ? `Ready to buy. Linked ${billing?.card_brand} •••• ${billing?.card_last4}.`
                : 'Checkout blocked: link a card first.'}
            </div>

            <button
              type="button"
              onClick={handleConfirmOrder}
              disabled={placingOrder || billingLoading || cartLoading || itemCount < 1}
              className="w-full bg-text-primary text-background py-5 rounded-full font-bold text-lg hover:bg-primary transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {placingOrder ? 'PROCESSING...' : 'CONFIRM ORDER'} <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-[10px] text-text-tertiary text-center mt-6 uppercase tracking-widest">
              Linked card required. Wallet is auto-applied when balance covers the full total.
            </p>

            {!isCardLinked && (
              <p className="flex items-center justify-center gap-2 text-xs text-warning mt-4">
                <AlertCircle className="w-4 h-4" /> Complete card link on the left to unlock payment.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
