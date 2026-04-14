import { useEffect, useState } from 'react';
import { Search, ShoppingCart, User, Sun, Moon, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { itemCount } = useCart();
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : '';

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const categoryParam = new URLSearchParams(location.search).get('category');
  const activeNavKey = (() => {
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname === '/about') return 'about';
    if (location.pathname === '/support') return 'support';
    if (location.pathname === '/catalog' && categoryParam === 'smartphones') return 'phones';
    if (location.pathname === '/catalog') return 'catalog';
    return '';
  })();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = search.trim();
    navigate(term ? `/catalog?search=${encodeURIComponent(term)}` : '/catalog');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-[92rem] mx-auto px-8 md:px-20 lg:px-28 h-16 flex items-center justify-between">
        <div className="flex items-center gap-16">
          <Link to="/" className="text-xl font-heading font-black tracking-tighter">
            ELECTRA
          </Link>
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-text-secondary">
            <Link
              to="/catalog"
              className={`relative pb-1 transition-colors ${activeNavKey === 'catalog' ? 'text-text-primary' : 'hover:text-text-primary'}`}
            >
              Catalog
              {activeNavKey === 'catalog' && (
                <motion.span
                  layoutId="navbar-active-underline"
                  transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                  className="absolute left-0 right-0 -bottom-[2px] h-0.5 rounded-full bg-primary"
                />
              )}
            </Link>
            <Link
              to="/catalog?category=smartphones"
              className={`relative pb-1 transition-colors ${activeNavKey === 'phones' ? 'text-text-primary' : 'hover:text-text-primary'}`}
            >
              Phones
              {activeNavKey === 'phones' && (
                <motion.span
                  layoutId="navbar-active-underline"
                  transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                  className="absolute left-0 right-0 -bottom-[2px] h-0.5 rounded-full bg-primary"
                />
              )}
            </Link>
            {user?.is_admin && (
              <Link
                to="/admin"
                className={`relative pb-1 transition-colors ${activeNavKey === 'admin' ? 'text-text-primary' : 'hover:text-text-primary'}`}
              >
                Admin
                {activeNavKey === 'admin' && (
                  <motion.span
                    layoutId="navbar-active-underline"
                    transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                    className="absolute left-0 right-0 -bottom-[2px] h-0.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            )}
            <Link
              to="/about"
              className={`relative pb-1 transition-colors ${activeNavKey === 'about' ? 'text-text-primary' : 'hover:text-text-primary'}`}
            >
              About Us
              {activeNavKey === 'about' && (
                <motion.span
                  layoutId="navbar-active-underline"
                  transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                  className="absolute left-0 right-0 -bottom-[2px] h-0.5 rounded-full bg-primary"
                />
              )}
            </Link>
            <Link
              to="/support"
              className={`relative pb-1 transition-colors ${activeNavKey === 'support' ? 'text-text-primary' : 'hover:text-text-primary'}`}
            >
              Support
              {activeNavKey === 'support' && (
                <motion.span
                  layoutId="navbar-active-underline"
                  transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                  className="absolute left-0 right-0 -bottom-[2px] h-0.5 rounded-full bg-primary"
                />
              )}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(value => !value)}
            className="p-2 hover:bg-surface hover:text-primary transition-colors rounded-full md:hidden"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative">
            <Search className="absolute left-3 w-4 h-4 text-text-tertiary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
              placeholder="Search products..."
              className="pl-9 pr-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-full text-sm outline-none focus:border-primary transition-colors w-72"
            />
          </form>
          <Link to="/cart" className="p-2 hover:bg-surface hover:text-primary transition-colors rounded-full relative">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-background rounded-full text-[10px] font-bold flex items-center justify-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 hover:bg-surface hover:text-primary transition-colors rounded-full">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {!isAuthenticated && (
            <Link to="/login" className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-sm font-medium hover:bg-surface-hover transition-colors">
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
          {isAuthenticated && user && (
            <Link
              to="/profile"
              className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-surface border border-border hover:bg-surface-hover transition-colors"
            >
              <span className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center">
                <User className="w-4 h-4" />
              </span>
              <span className="leading-tight">
                <span className="block text-sm font-bold text-text-primary">{displayName}</span>
                <span className="block text-[11px] text-text-tertiary">{user.email}</span>
              </span>
            </Link>
          )}
          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            className="p-2 hover:bg-surface hover:text-primary transition-colors rounded-full md:hidden"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="px-6 py-4 flex flex-col gap-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center relative">
              <Search className="absolute left-3 w-4 h-4 text-text-tertiary" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                type="text"
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-full text-sm outline-none focus:border-primary"
              />
            </form>

            <nav className="flex flex-col gap-2 text-sm font-semibold">
              <Link to="/catalog" className="px-3 py-2 rounded-lg hover:bg-surface transition-colors">Catalog</Link>
              <Link to="/catalog?category=smartphones" className="px-3 py-2 rounded-lg hover:bg-surface transition-colors">Phones</Link>
              <Link to="/about" className="px-3 py-2 rounded-lg hover:bg-surface transition-colors">About Us</Link>
              <Link to="/support" className="px-3 py-2 rounded-lg hover:bg-surface transition-colors">Support</Link>
              {user?.is_admin && (
                <Link to="/admin" className="px-3 py-2 rounded-lg hover:bg-surface transition-colors">Admin</Link>
              )}
            </nav>

            {!isAuthenticated ? (
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-sm font-bold hover:bg-surface-hover transition-colors"
              >
                <User className="w-4 h-4" /> Sign In
              </Link>
            ) : (
              <Link
                to="/profile"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-surface border border-border text-sm font-bold hover:bg-surface-hover transition-colors"
              >
                <User className="w-4 h-4" /> {displayName || 'Profile'}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
