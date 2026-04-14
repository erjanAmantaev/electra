import { useEffect, useMemo, useState } from 'react';
import { Mail, Search, Shield, ShieldCheck, ShoppingBag, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAdminCustomers, type AdminCustomer } from '../../lib/storeApi';
import { useAuth } from '../../context/AuthContext';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return 'Never';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminCustomers() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 8;

  useEffect(() => {
    let mounted = true;

    const loadCustomers = async () => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        const result = await getAdminCustomers(token, searchQuery || undefined);
        if (!mounted) return;
        setCustomers(result);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : 'Unable to load customers.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadCustomers();

    return () => {
      mounted = false;
    };
  }, [token, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totals = useMemo(() => {
    const totalCustomers = customers.length;
    const adminAccounts = customers.filter(customer => customer.is_admin).length;
    const repeatCustomers = customers.filter(customer => customer.orders_count > 1).length;
    const lifetimeRevenue = customers.reduce((sum, customer) => sum + Number(customer.total_spent || 0), 0);

    return {
      totalCustomers,
      adminAccounts,
      repeatCustomers,
      lifetimeRevenue,
    };
  }, [customers]);

  const totalPages = Math.max(1, Math.ceil(customers.length / pageSize));

  const visibleCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return customers.slice(start, start + pageSize);
  }, [customers, currentPage]);

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-[#dde5f1] bg-white p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={event => {
              event.preventDefault();
              setSearchQuery(searchInput.trim());
            }}
          >
            <div className="relative flex-1 max-w-xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                placeholder="Search by name, username, or email"
                className="w-full h-11 rounded-full border border-[#dce3ef] bg-[#f7f9fd] pl-9 pr-4 text-sm outline-none focus:border-[#1a5ee8]"
              />
            </div>
            <button type="submit" className="h-11 px-5 rounded-full bg-[#1a5ee8] text-white text-xs font-bold tracking-widest uppercase">
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearchQuery('');
              }}
              className="h-11 px-5 rounded-full border border-[#dce3ef] bg-white text-xs font-bold tracking-widest uppercase text-slate-600"
            >
              Clear
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="h-11 px-5 rounded-full bg-[#dfe8f7] text-[#1a5ee8] text-xs font-bold tracking-widest uppercase"
          >
            Open Orders
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <article className="rounded-3xl border border-[#dde5f1] bg-white p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Total Customers</p>
          <p className="text-4xl font-heading font-black text-slate-800">{loading ? '...' : totals.totalCustomers}</p>
        </article>

        <article className="rounded-3xl border border-[#dde5f1] bg-white p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Admin Accounts</p>
          <p className="text-4xl font-heading font-black text-slate-800">{loading ? '...' : totals.adminAccounts}</p>
        </article>

        <article className="rounded-3xl border border-[#dde5f1] bg-white p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Repeat Buyers</p>
          <p className="text-4xl font-heading font-black text-slate-800">{loading ? '...' : totals.repeatCustomers}</p>
        </article>

        <article className="rounded-3xl border border-[#dde5f1] bg-white p-5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Lifetime Revenue</p>
          <p className="text-4xl font-heading font-black text-slate-800">{loading ? '...' : formatCurrency(totals.lifetimeRevenue)}</p>
        </article>
      </div>

      <section className="rounded-[28px] border border-[#dde5f1] bg-white p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-heading font-black text-slate-800">Customer Directory</h2>
          <span className="text-xs font-bold tracking-widest uppercase text-slate-500">Page {currentPage} / {totalPages}</span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading customers...</p>
        ) : error ? (
          <div className="border border-error/30 bg-error/10 text-error rounded-xl px-4 py-3 text-sm">{error}</div>
        ) : customers.length === 0 ? (
          <p className="text-sm text-slate-500">No customers found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-[#e5ebf5] text-slate-500 uppercase text-[10px] tracking-widest">
                    <th className="py-3 pr-3">Customer</th>
                    <th className="py-3 pr-3">Role</th>
                    <th className="py-3 pr-3">Orders</th>
                    <th className="py-3 pr-3">Spent</th>
                    <th className="py-3 pr-3">Joined</th>
                    <th className="py-3 pr-3">Last Order</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCustomers.map(customer => (
                    <tr key={customer.id} className="border-b border-[#eef2f8] last:border-b-0">
                      <td className="py-3 pr-3">
                        <p className="font-semibold text-slate-700">{customer.full_name}</p>
                        <p className="text-xs text-slate-500">@{customer.username}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            customer.is_admin ? 'bg-[#dbe7ff] text-[#1a5ee8]' : 'bg-[#e9f7ef] text-emerald-700'
                          }`}
                        >
                          {customer.is_admin ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                          {customer.is_admin ? 'Admin' : 'Customer'}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-slate-600">{customer.orders_count}</td>
                      <td className="py-3 pr-3 text-slate-600">{formatCurrency(Number(customer.total_spent || 0))}</td>
                      <td className="py-3 pr-3 text-slate-600">{formatDate(customer.date_joined)}</td>
                      <td className="py-3 pr-3 text-slate-600">{formatDate(customer.last_order_at)}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <a
                            href={`mailto:${customer.email}`}
                            className="h-8 w-8 rounded-full border border-[#dce3ef] bg-white text-slate-500 hover:text-[#1a5ee8] inline-flex items-center justify-center"
                            aria-label={`Email ${customer.full_name}`}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => navigate('/admin/orders')}
                            className="h-8 w-8 rounded-full border border-[#dce3ef] bg-white text-slate-500 hover:text-[#1a5ee8] inline-flex items-center justify-center"
                            aria-label={`View orders for ${customer.full_name}`}
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className="h-8 w-8 rounded-full border border-[#dce3ef] bg-white text-slate-500 hover:text-[#1a5ee8] inline-flex items-center justify-center"
                            aria-label="Open profile"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
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
    </div>
  );
}
