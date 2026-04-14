import { useEffect, useMemo, useState } from 'react';
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
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 6;

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
    [orders]
  );

  const activeShipments = useMemo(
    () => orders.filter(order => order.status === 'processing' || order.status === 'completed').length,
    [orders]
  );

  const pendingReturns = useMemo(
    () => orders.filter(order => order.status === 'cancelled').length,
    [orders]
  );

  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
  const visibleOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return orders.slice(start, end);
  }, [orders, currentPage]);

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

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const statusClass = (status: AdminOrder['status']) => {
    if (status === 'completed') return 'bg-emerald-100 text-emerald-700';
    if (status === 'processing') return 'bg-amber-100 text-amber-700';
    return 'bg-rose-100 text-rose-700';
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p className="text-slate-500 text-sm">{orders.length} total orders recorded.</p>
        <div className="flex items-center gap-2">
          <button type="button" className="px-4 py-2 rounded-full bg-[#dfe8f7] text-[#1a5ee8] text-xs font-bold">Export CSV</button>
          <button type="button" className="px-4 py-2 rounded-full bg-[#1a5ee8] text-white text-xs font-bold shadow-[0_8px_20px_rgba(26,94,232,0.35)]">+ New Order</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="rounded-3xl bg-white border border-[#dde5f1] p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Total Revenue</p>
          <p className="text-4xl font-heading font-black text-slate-800 mb-1">{loading ? '...' : formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-emerald-600 font-semibold">+12.5%</p>
        </article>
        <article className="rounded-3xl bg-white border border-[#dde5f1] p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Active Shipments</p>
          <p className="text-4xl font-heading font-black text-slate-800 mb-1">{loading ? '...' : activeShipments}</p>
          <p className="text-xs text-[#1a5ee8] font-semibold">On Track</p>
        </article>
        <article className="rounded-3xl bg-white border border-[#dde5f1] p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Pending Returns</p>
          <p className="text-4xl font-heading font-black text-slate-800 mb-1">{loading ? '...' : pendingReturns}</p>
          <p className="text-xs text-rose-500 font-semibold">Needs review</p>
        </article>
      </div>

      <section className="rounded-[28px] bg-white border border-[#dde5f1] p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-heading font-black text-slate-800">All Orders</h2>
          <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Page {currentPage} / {totalPages}</span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading orders...</p>
        ) : error ? (
          <div className="border border-error/30 bg-error/10 text-error rounded-xl px-4 py-3 text-sm">{error}</div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-slate-500">No orders found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-[#e5ebf5] text-slate-500 uppercase text-[10px] tracking-widest">
                    <th className="py-3 pr-3">Order ID</th>
                    <th className="py-3 pr-3">Customer</th>
                    <th className="py-3 pr-3">Date</th>
                    <th className="py-3 pr-3">Items</th>
                    <th className="py-3 pr-3">Status</th>
                    <th className="py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map(order => (
                    <tr key={order.id} className="border-b border-[#eef2f8] last:border-b-0">
                      <td className="py-3 pr-3 font-bold text-[#1a5ee8]">{order.order_number}</td>
                      <td className="py-3 pr-3">
                        <p className="font-semibold text-slate-700">{order.user_name}</p>
                        <p className="text-xs text-slate-500">{order.user_email}</p>
                      </td>
                      <td className="py-3 pr-3 text-slate-600">{formatDate(order.placed_at)}</td>
                      <td className="py-3 pr-3 text-slate-600">{order.item_count}</td>
                      <td className="py-3 pr-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-800">{formatCurrency(Number(order.total_amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-[#dde5f1] text-xs font-semibold disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full text-xs font-bold ${
                      currentPage === page ? 'bg-[#1a5ee8] text-white' : 'bg-[#f0f4fb] text-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-[#dde5f1] text-xs font-semibold disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <section className="rounded-[28px] border border-[#dde5f1] bg-[#edf1f7] p-7 text-center">
        <h3 className="text-4xl font-heading font-black text-slate-800 mb-3">Stay updated with Admin Insights</h3>
        <p className="text-sm text-slate-600 mb-5">Subscribe to your weekly performance digest and system updates directly to your inbox.</p>
        <div className="mx-auto max-w-xl flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="Enter administrator email"
            className="flex-1 h-11 rounded-full border border-[#d5ddec] bg-white px-4 text-sm outline-none focus:border-[#1a5ee8]"
          />
          <button type="button" className="h-11 px-6 rounded-full bg-[#1a5ee8] text-white text-sm font-bold">Subscribe Now</button>
        </div>
      </section>
    </div>
  );
}
