import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full text-center rounded-2xl border border-border bg-surface p-10 shadow-lg">
        <p className="text-xs font-bold tracking-widest uppercase text-text-tertiary mb-3">404</p>
        <h1 className="text-4xl font-heading font-black mb-4">Page Not Found</h1>
        <p className="text-text-secondary mb-8">
          The page you are trying to open does not exist or was moved to another route.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </section>
  );
}
