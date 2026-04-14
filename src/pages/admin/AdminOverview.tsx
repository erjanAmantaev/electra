import { useEffect, useState } from 'react';
import { Activity, Package, ShoppingBag, Users, Wallet } from 'lucide-react';
import { getAdminDashboard, type AdminDashboardStats } from '../../lib/storeApi';
import { useAuth } from '../../context/AuthContext';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

const ZERO_STATS: AdminDashboardStats = {
  products_total: 0,
  products_active: 0,
  products_inactive: 0,
  orders_total: 0,
  orders_today: 0,
  users_total: 0,
  revenue_total: '0',
};

export default function AdminOverview() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats>(ZERO_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        const result = await getAdminDashboard(token);
        if (!mounted) return;
        setStats(result);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard stats.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadStats();

    return () => {
      mounted = false;
    };
  }, [token]);

  const cards = [
    {
      title: 'Products',
      value: stats.products_total,
      subtitle: `${stats.products_active} active • ${stats.products_inactive} deactivated`,
      icon: Package,
    },
    {
      title: 'Orders',
      value: stats.orders_total,
      subtitle: `${stats.orders_today} placed today`,
      icon: ShoppingBag,
    },
    {
      title: 'Customers',
      value: stats.users_total,
      subtitle: 'Registered users',
      icon: Users,
    },
    {
      title: 'Revenue',
      value: formatCurrency(Number(stats.revenue_total || 0)),
      subtitle: 'Cumulative revenue',
      icon: Wallet,
    },
  ];

  const revenue = formatCurrency(Number(stats.revenue_total || 0));

  return (
    <div className="space-y-5">
      {error && <div className="border border-error/30 bg-error/10 text-error rounded-2xl px-4 py-3 text-sm">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_0.9fr_0.9fr] gap-4">
        <article className="rounded-[28px] border border-[#1a5ee8]/20 bg-gradient-to-br from-[#1a5ee8] to-[#2a77f7] text-white p-6 md:p-7 shadow-[0_18px_50px_rgba(26,94,232,0.38)]">
          <div className="flex items-start justify-between gap-4 mb-7">
            <span className="w-11 h-11 rounded-xl bg-white/17 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase rounded-full bg-white/18 px-3 py-1">Cumulative Revenue</span>
          </div>
          <p className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-2">{loading ? '...' : revenue}</p>
          <p className="text-sm text-white/85">{stats.orders_today} orders placed today</p>
        </article>

        {cards.slice(0, 2).map(card => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="rounded-[26px] border border-[#dde5f1] bg-white p-6">
              <div className="flex items-start justify-between gap-3 mb-5">
                <span className="w-10 h-10 rounded-xl bg-[#eaf0ff] text-[#1a5ee8] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </span>
                <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500">{card.title}</p>
              </div>
              <p className="text-4xl font-heading font-black tracking-tight text-slate-800 mb-1">{loading ? '...' : card.value}</p>
              <p className="text-xs text-slate-500">{card.subtitle}</p>
            </article>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.55fr] gap-4">
        <article className="rounded-[26px] border border-[#dde5f1] bg-white p-6">
          <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mb-5">Registered Users</p>
          <p className="text-5xl font-heading font-black text-slate-800 mb-1">{loading ? '...' : stats.users_total.toLocaleString('en-US')}</p>
          <p className="text-sm text-slate-500">Verified global accounts</p>
        </article>

        <section className="rounded-[26px] border border-[#dde5f1] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px] font-bold tracking-widest uppercase text-slate-500">System Activity Feed</p>
            <button type="button" className="text-xs font-bold text-[#1a5ee8] hover:underline">View All Logs</button>
          </div>
          <div className="space-y-3">
            <article className="rounded-2xl border border-[#e5ebf5] bg-[#f8faff] px-4 py-3 flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-[#1a5ee8] mt-2" />
              <span>
                <p className="text-sm font-semibold text-slate-700">Inventory sync completed for new catalog update</p>
                <p className="text-xs text-slate-500">2 minutes ago • Automated Process</p>
              </span>
            </article>
            <article className="rounded-2xl border border-[#e5ebf5] bg-[#f8faff] px-4 py-3 flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
              <span>
                <p className="text-sm font-semibold text-slate-700">Order workflow is running normally</p>
                <p className="text-xs text-slate-500">14 minutes ago • Warehouse API</p>
              </span>
            </article>
          </div>
        </section>
      </div>

      <section className="rounded-[30px] border border-[#d7dfeb] bg-[#e5ebf3] px-6 py-7 md:px-8 md:py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-start gap-4">
          <span className="w-11 h-11 rounded-xl bg-white/65 text-[#1a5ee8] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-2xl font-heading font-black text-slate-800 mb-1">Admin-Only Secure Area</h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              This dashboard contains sensitive platform metrics and user data. Any changes are logged and linked to your administrator profile.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" className="px-5 py-2.5 rounded-full bg-slate-800 text-white text-xs font-bold tracking-widest uppercase">Security Logs</button>
          <button type="button" className="px-5 py-2.5 rounded-full bg-white text-slate-700 text-xs font-bold tracking-widest uppercase">Support Portal</button>
        </div>
      </section>
    </div>
  );
}
