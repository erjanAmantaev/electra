import { useEffect, useState } from 'react';
import { getAdminOrders, type AdminOrder } from '../../lib/storeApi';
import { useAuth } from '../../context/AuthContext';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadOrders = async () => {
      if (!token) return;

      setLoading(true);
      setError('');
      try {
        const result = await getAdminOrders(token);
        if (!mounted) return;
        setOrders(result);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load orders.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadOrders();

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-heading font-black">All Orders</h2>
        <span className="text-xs font-bold tracking-widest uppercase text-text-tertiary">{orders.length} total</span>
      </div>

      {loading ? (
        <p className="text-sm text-text-secondary">Loading orders...</p>
      ) : error ? (
        <div className="border border-error/30 bg-error/10 text-error rounded-xl px-4 py-3 text-sm">{error}</div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-text-secondary">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border text-text-tertiary uppercase text-xs tracking-widest">
                <th className="py-3 pr-3">Order</th>
                <th className="py-3 pr-3">Customer</th>
                <th className="py-3 pr-3">Date</th>
                <th className="py-3 pr-3">Items</th>
                <th className="py-3 pr-3">Status</th>
                <th className="py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-border/60">
                  <td className="py-3 pr-3 font-bold">{order.order_number}</td>
                  <td className="py-3 pr-3">
                    <p className="font-medium">{order.user_name}</p>
                    <p className="text-xs text-text-tertiary">{order.user_email}</p>
                  </td>
                  <td className="py-3 pr-3">{formatDate(order.placed_at)}</td>
                  <td className="py-3 pr-3">{order.item_count}</td>
                  <td className="py-3 pr-3">
                    <span className="inline-flex px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-widest border-border bg-background">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold">{formatCurrency(Number(order.total_amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
