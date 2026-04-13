import { BarChart3, Boxes, ClipboardList } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Overview', icon: BarChart3, end: true },
  { to: '/admin/products', label: 'Products', icon: Boxes },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
];

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12 lg:px-24 py-10">
      <header className="mb-8 border-b border-border pb-6">
        <p className="text-xs font-bold tracking-widest uppercase text-primary mb-2">Control Center</p>
        <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight">Admin Panel</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <aside className="bg-surface border border-border rounded-2xl p-4 h-fit lg:sticky lg:top-24">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            {links.map(link => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-background border border-border text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        <section>
          <Outlet />
        </section>
      </div>
    </div>
  );
}
