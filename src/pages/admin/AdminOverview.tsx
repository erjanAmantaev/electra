import { useEffect, useState } from 'react';
import { Package, ShoppingBag, Users, Wallet } from 'lucide-react';
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

  return (
    <div className="flex flex-col gap-6">
      {error && <div className="border border-error/30 bg-error/10 text-error rounded-xl px-4 py-3 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <p className="text-xs font-bold tracking-widest uppercase text-text-tertiary">{card.title}</p>
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-heading font-black tracking-tight mb-2">
                {loading ? '...' : card.value}
              </p>
              <p className="text-sm text-text-secondary">{card.subtitle}</p>
            </article>
          );
        })}
      </div>

      <section className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-lg font-heading font-black mb-2">Admin-Only Area</h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          These pages are visible only for accounts listed in ELECTRA_ADMIN_EMAILS (or staff/superusers). Use Products to add/edit/deactivate catalog items and Orders to monitor platform activity.
        </p>
      </section>
    </div>
  );
}
