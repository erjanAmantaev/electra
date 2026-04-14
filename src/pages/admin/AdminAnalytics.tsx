import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Boxes, RefreshCw, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAdminAnalytics, type AdminAnalytics } from '../../lib/storeApi';
import { useAuth } from '../../context/AuthContext';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

const EMPTY_ANALYTICS: AdminAnalytics = {
  kpis: {
    revenue_total: '0',
    orders_total: 0,
    orders_today: 0,
    users_total: 0,
    products_total: 0,
    active_products: 0,
    avg_order_value: '0',
  },
  revenue_series: [],
  top_products: [],
  category_distribution: [],
  status_breakdown: [],
};

export default function AdminAnalytics() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AdminAnalytics>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const result = await getAdminAnalytics(token);
      setAnalytics(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
  }, [token]);

  const revenueMax = useMemo(() => {
    const max = Math.max(...analytics.revenue_series.map(point => Number(point.revenue || 0)), 0);
    return max > 0 ? max : 1;
  }, [analytics.revenue_series]);

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-[#dde5f1] bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">Live store intelligence based on current transactional data.</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadAnalytics()}
              className="h-10 px-4 rounded-full border border-[#dce3ef] bg-white text-xs font-bold tracking-widest uppercase text-slate-600 inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/orders')}
              className="h-10 px-4 rounded-full bg-[#dfe8f7] text-[#1a5ee8] text-xs font-bold tracking-widest uppercase"
            >
              Open Orders
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/customers')}
              className="h-10 px-4 rounded-full bg-[#1a5ee8] text-white text-xs font-bold tracking-widest uppercase"
            >
              Open Customers
            </button>
          </div>
        </div>
      </section>

      {error && <div className="border border-error/30 bg-error/10 text-error rounded-2xl px-4 py-3 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <article className="rounded-3xl border border-[#dde5f1] bg-white p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Total Revenue</p>
          <p className="text-4xl font-heading font-black text-slate-800">{loading ? '...' : formatCurrency(Number(analytics.kpis.revenue_total || 0))}</p>
        </article>
        <article className="rounded-3xl border border-[#dde5f1] bg-white p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Orders</p>
          <p className="text-4xl font-heading font-black text-slate-800">{loading ? '...' : analytics.kpis.orders_total}</p>
          <p className="text-xs text-slate-500 mt-1">{analytics.kpis.orders_today} placed today</p>
        </article>
        <article className="rounded-3xl border border-[#dde5f1] bg-white p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Customers</p>
          <p className="text-4xl font-heading font-black text-slate-800">{loading ? '...' : analytics.kpis.users_total}</p>
        </article>
        <article className="rounded-3xl border border-[#dde5f1] bg-white p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Avg Order Value</p>
          <p className="text-4xl font-heading font-black text-slate-800">{loading ? '...' : formatCurrency(Number(analytics.kpis.avg_order_value || 0))}</p>
        </article>
      </div>

      <section className="rounded-[28px] border border-[#dde5f1] bg-white p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-heading font-black text-slate-800">Revenue Trend (Last 7 Days)</h2>
          <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Rolling window</span>
        </div>

        {analytics.revenue_series.length === 0 ? (
          <p className="text-sm text-slate-500">No revenue data available yet.</p>
        ) : (
          <div className="grid grid-cols-7 gap-2 md:gap-3 items-end h-56">
            {analytics.revenue_series.map(point => {
              const revenue = Number(point.revenue || 0);
              const height = Math.max(8, Math.round((revenue / revenueMax) * 100));

              return (
                <article key={point.date} className="h-full flex flex-col justify-end gap-2">
                  <div className="rounded-xl bg-[#e8eef9] p-2 text-center">
                    <p className="text-[10px] font-bold text-[#1a5ee8]">{point.orders} orders</p>
                    <p className="text-[10px] text-slate-500 truncate">{formatCurrency(revenue)}</p>
                  </div>
                  <div
                    className="rounded-t-xl bg-gradient-to-b from-[#2b74f3] to-[#1a5ee8]"
                    style={{ height: `${height}%`, minHeight: '12px' }}
                    aria-label={`${point.label}: ${formatCurrency(revenue)}`}
                  />
                  <p className="text-[10px] text-center font-semibold text-slate-500">{point.label}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
        <section className="rounded-[28px] border border-[#dde5f1] bg-white p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-heading font-black text-slate-800">Top Products</h2>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-4 py-2 rounded-full bg-[#f0f4fb] text-slate-600 text-xs font-bold tracking-widest uppercase"
            >
              Open Catalog
            </button>
          </div>

          {analytics.top_products.length === 0 ? (
            <p className="text-sm text-slate-500">No product sales recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {analytics.top_products.map(product => (
                <article key={`${product.product_slug}-${product.product_name}`} className="rounded-2xl border border-[#e5ebf5] bg-[#f8faff] px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{product.product_name}</p>
                      <p className="text-xs text-slate-500 truncate">{product.brand || 'Unknown brand'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-800">{formatCurrency(Number(product.revenue || 0))}</p>
                      <p className="text-xs text-slate-500">{product.quantity_sold} sold</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[28px] border border-[#dde5f1] bg-white p-5 md:p-6 space-y-5">
          <div>
            <h2 className="text-2xl font-heading font-black text-slate-800 mb-3">Distribution</h2>

            <div className="space-y-2">
              {analytics.category_distribution.length === 0 ? (
                <p className="text-sm text-slate-500">No categories found.</p>
              ) : (
                analytics.category_distribution.map(category => {
                  const width = Math.max(8, Math.min(100, Math.round((category.count / Math.max(analytics.kpis.products_total, 1)) * 100)));

                  return (
                    <article key={category.category}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-600">{category.label}</span>
                        <span className="text-slate-500">{category.count}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-[#edf2fb] overflow-hidden">
                        <div className="h-full rounded-full bg-[#1a5ee8]" style={{ width: `${width}%` }} />
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-2">Order Status</h3>
            <div className="flex flex-wrap gap-2">
              {analytics.status_breakdown.length === 0 ? (
                <p className="text-sm text-slate-500">No status data yet.</p>
              ) : (
                analytics.status_breakdown.map(item => (
                  <span
                    key={item.status}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#edf2fb] px-3 py-1.5 text-xs font-semibold text-slate-600"
                  >
                    <BarChart3 className="w-3 h-3 text-[#1a5ee8]" />
                    {item.status}
                    <strong className="text-slate-800">{item.count}</strong>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="rounded-xl border border-[#dce3ef] bg-white py-2.5 text-xs font-bold text-slate-600 inline-flex items-center justify-center gap-1.5"
            >
              <Boxes className="w-3.5 h-3.5" /> Products
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/orders')}
              className="rounded-xl border border-[#dce3ef] bg-white py-2.5 text-xs font-bold text-slate-600 inline-flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Orders
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/customers')}
              className="rounded-xl border border-[#dce3ef] bg-white py-2.5 text-xs font-bold text-slate-600 inline-flex items-center justify-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> Customers
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-[#dbe5f8] bg-gradient-to-r from-[#eaf1ff] to-[#f5f8ff] px-6 py-6 md:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-xl bg-white text-[#1a5ee8] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-2xl font-heading font-black text-slate-800 mb-1">Data-driven admin workflow</h3>
            <p className="text-sm text-slate-600">Use analytics to adjust pricing, category depth, and catalog activation strategy.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="h-11 px-5 rounded-full bg-[#1a5ee8] text-white text-xs font-bold tracking-widest uppercase"
        >
          Tune Products
        </button>
      </section>
    </div>
  );
}
