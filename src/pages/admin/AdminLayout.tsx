import {
  BarChart3,
  Bell,
  Boxes,
  ClipboardList,
  HelpCircle,
  LineChart,
  Search,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin', label: 'Overview', icon: BarChart3, end: true },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '#', label: 'Customers', icon: Users, disabled: true },
  { to: '#', label: 'Analytics', icon: LineChart, disabled: true },
];

const pageMeta = {
  '/admin': {
    title: 'Admin Panel',
    subtitle: 'Welcome back. Here is the real-time performance of your store.',
    searchPlaceholder: 'Search analytics, orders, or users...',
  },
  '/admin/products': {
    title: 'Product Management',
    subtitle: 'Manage your device catalog, inventory levels, and product visibility.',
    searchPlaceholder: 'Search catalog, orders, or customers...',
  },
  '/admin/orders': {
    title: 'Order Management',
    subtitle: "Review and manage your store's transaction history.",
    searchPlaceholder: 'Search orders, customers, or items...',
  },
};

function resolveMeta(pathname: string) {
  if (pathname.startsWith('/admin/products')) return pageMeta['/admin/products'];
  if (pathname.startsWith('/admin/orders')) return pageMeta['/admin/orders'];
  return pageMeta['/admin'];
}

export default function AdminLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const meta = resolveMeta(location.pathname);
  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : 'Admin User';

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-700">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="hidden md:flex flex-col bg-[#edf2fa] border-r border-[#dce3ef]">
          <div className="px-6 pt-7 pb-6 border-b border-[#dce3ef]">
            <p className="text-[28px] font-heading font-black text-[#1a5ee8] leading-none">Electra Admin</p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium tracking-wide">System Control</p>
          </div>

          <nav className="px-3 py-5 space-y-1">
            {links.map(link => {
              const Icon = link.icon;

              if (link.disabled) {
                return (
                  <div
                    key={link.label}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] text-slate-500/80 cursor-not-allowed"
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </div>
                );
              }

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
                      isActive ? 'bg-[#dceaff] text-[#1354df]' : 'text-slate-600 hover:bg-white/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto px-3 pb-5 space-y-3">
            <button
              type="button"
              className="w-full rounded-xl bg-[#1a5ee8] text-white text-sm font-bold py-3 shadow-[0_10px_24px_rgba(26,94,232,0.35)] hover:opacity-95 transition-opacity"
            >
              Generate Report
            </button>

            <button type="button" className="w-full text-left px-4 py-2.5 rounded-xl text-[13px] text-slate-600 hover:bg-white/70 transition-colors">
              <span className="inline-flex items-center gap-2"><Settings className="w-4 h-4" /> Settings</span>
            </button>
            <button type="button" className="w-full text-left px-4 py-2.5 rounded-xl text-[13px] text-slate-600 hover:bg-white/70 transition-colors">
              <span className="inline-flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Support</span>
            </button>

            <div className="rounded-xl bg-white/70 border border-[#dce3ef] px-3 py-2.5 flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-[#1a5ee8]/12 text-[#1a5ee8] flex items-center justify-center">
                <User className="w-4 h-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-bold text-slate-700 truncate">{displayName}</span>
                <span className="block text-[10px] text-slate-500 truncate">System Control</span>
              </span>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="h-[76px] border-b border-[#dce3ef] bg-white/85 backdrop-blur px-5 md:px-8 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm lg:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={meta.searchPlaceholder}
                className="w-full h-10 rounded-full bg-[#f1f4f9] border border-[#e2e8f2] pl-9 pr-3 text-sm outline-none focus:border-[#1a5ee8]"
              />
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <button type="button" className="w-9 h-9 rounded-full border border-[#dce3ef] bg-white flex items-center justify-center text-slate-500 hover:text-[#1a5ee8]">
                <Bell className="w-4 h-4" />
              </button>
              <button type="button" className="w-9 h-9 rounded-full border border-[#dce3ef] bg-white flex items-center justify-center text-slate-500 hover:text-[#1a5ee8]">
                <Settings className="w-4 h-4" />
              </button>
              <div className="hidden md:flex items-center gap-2 border-l border-[#dce3ef] pl-3 ml-1">
                <span className="text-xs font-semibold text-slate-700">{displayName}</span>
                <span className="w-8 h-8 rounded-full bg-[#1a5ee8]/15 text-[#1a5ee8] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </span>
              </div>
            </div>
          </header>

          <div className="px-5 py-6 md:px-8 md:py-8">
            <div className="md:hidden mb-5 flex gap-2 overflow-x-auto pb-1">
              {links
                .filter(link => !link.disabled)
                .map(link => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      className={({ isActive }) =>
                        `inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap ${
                          isActive ? 'bg-[#1a5ee8] text-white' : 'bg-white border border-[#dce3ef] text-slate-600'
                        }`
                      }
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {link.label}
                    </NavLink>
                  );
                })}
            </div>

            <div className="mb-6">
              <h1 className="text-4xl font-heading font-black tracking-tight text-slate-800">{meta.title}</h1>
              <p className="text-slate-500 mt-1">{meta.subtitle}</p>
            </div>

            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
