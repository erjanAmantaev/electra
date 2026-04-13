import { useEffect, useState } from 'react';
import { ArrowLeft, CreditCard, Package, Truck, Wallet } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrderByNumber, type OrderHistoryItem } from '../lib/storeApi';

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

export default function OrderDetail() {
  const { orderNumber } = useParams();
  const { isAuthenticated, token } = useAuth();

  const [order, setOrder] = useState<OrderHistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      if (!orderNumber) {
        setError('Order number is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await getOrderByNumber(token, orderNumber);
        if (!mounted) return;
        setOrder(result);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load order details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadOrder();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, token, orderNumber]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-12 lg:px-24 py-20 text-center">
        <div className="bg-surface border border-border rounded-3xl p-10">
          <h1 className="text-3xl font-heading font-black mb-4">Sign in to view order details</h1>
          <p className="text-text-secondary mb-6">Your order timeline and line items are available in your profile.</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-full bg-text-primary text-background px-6 py-3 text-sm font-bold hover:bg-primary transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-12 lg:px-24 py-12">
        <div className="h-[620px] rounded-3xl bg-surface border border-border animate-pulse"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-12 lg:px-24 py-20 text-center">
        <div className="border border-error/30 bg-error/10 rounded-3xl p-10">
          <h1 className="text-3xl font-heading font-black mb-3">Order unavailable</h1>
          <p className="text-error mb-6">{error || 'We could not find this order.'}</p>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center rounded-full bg-text-primary text-background px-6 py-3 text-sm font-bold hover:bg-primary transition-colors"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  const statusStyle =
    order.status === 'completed'
      ? 'bg-success/10 text-success border-success/20'
      : order.status === 'processing'
      ? 'bg-warning/10 text-warning border-warning/20'
      : 'bg-error/10 text-error border-error/20';

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-12 lg:px-24 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <Link to="/profile" className="inline-flex items-center gap-2 text-sm font-bold text-text-tertiary hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </Link>
        <Link to="/catalog" className="inline-flex items-center gap-2 text-sm font-bold text-text-tertiary hover:text-primary transition-colors">
          Continue Shopping
        </Link>
      </div>

      <header className="border border-border bg-surface rounded-3xl p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-text-tertiary mb-2">Order Details</p>
            <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight mb-3">#{order.order_number}</h1>
            <p className="text-text-secondary">
              Placed on {formatOrderDate(order.placed_at)} • {order.item_count} item{order.item_count === 1 ? '' : 's'}
            </p>
          </div>
          <span className={`inline-flex border px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase ${statusStyle}`}>
            {order.status}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-surface border border-border rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-heading font-black mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Line Items
          </h2>

          <div className="flex flex-col gap-4">
            {order.items.map(item => (
              <article key={item.id} className="bg-background border border-border rounded-2xl p-4 md:p-5 flex gap-4">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-xl border border-border bg-center bg-cover shrink-0"
                  style={{ backgroundImage: item.image_url ? `url('${item.image_url}')` : undefined }}
                ></div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base leading-tight">{item.product_name}</h3>
                    <p className="text-xs text-text-tertiary uppercase tracking-widest mt-1">{item.product_brand}</p>
                    {item.product_slug && (
                      <Link
                        to={`/product/${item.product_slug}`}
                        className="inline-block text-xs font-bold text-primary hover:opacity-80 mt-2"
                      >
                        View product
                      </Link>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-text-secondary">Qty {item.quantity} • {formatCurrency(Number(item.unit_price))}</p>
                    <p className="font-bold text-lg mt-1">{formatCurrency(Number(item.line_total))}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="bg-surface border border-border rounded-3xl p-6 md:p-8 h-fit lg:sticky lg:top-8">
          <h2 className="text-xl font-heading font-black mb-6">Order Summary</h2>

          <div className="flex flex-col gap-3 text-sm border-b border-border pb-5 mb-5">
            <div className="flex justify-between">
              <span className="text-text-secondary">Subtotal</span>
              <span className="font-bold">{formatCurrency(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Tax</span>
              <span className="font-bold">{formatCurrency(Number(order.tax_amount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Shipping</span>
              <span className="font-bold">{Number(order.shipping_amount) > 0 ? formatCurrency(Number(order.shipping_amount)) : 'Free'}</span>
            </div>
            <div className="flex justify-between pt-2 mt-1 border-t border-border">
              <span className="font-bold">Total</span>
              <span className="font-black text-lg">{formatCurrency(Number(order.total_amount))}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 text-sm">
            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <p className="font-bold">Delivery</p>
                <p className="text-text-secondary">
                  {order.delivery_method === 'express' ? 'Express Delivery' : 'Standard Shipping'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <p className="font-bold">Payment Method</p>
                <p className="text-text-secondary">
                  {order.payment_brand || 'Card'} ending in {order.payment_last4 || '0000'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Wallet className="w-4 h-4 mt-0.5 text-primary" />
              <div>
                <p className="font-bold">Wallet Applied</p>
                <p className="text-text-secondary">{order.used_wallet ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
