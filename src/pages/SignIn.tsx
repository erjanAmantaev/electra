import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, LockKeyhole } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      toast.success('Welcome back! Redirecting to your profile...');
      navigate('/profile');
    } catch (error) {
      toast.error((error as Error).message || 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 min-h-[80vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-surface border border-border shadow-2xl rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-black mb-2 tracking-tighter">Welcome Back</h1>
            <p className="text-text-secondary text-sm">Enter your credentials to access your Electra profile.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 relative">
              <label className="text-xs font-bold tracking-widest text-text-tertiary uppercase ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  type="email"
                  placeholder="julian@precision.tech"
                  className="w-full bg-background border border-border pl-12 pr-4 py-4 rounded-xl focus:border-primary outline-none transition-colors text-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 relative">
              <div className="flex justify-between items-center ml-1">
                 <label className="text-xs font-bold tracking-widest text-text-tertiary uppercase">Password</label>
                 <Link to="#" className="text-xs font-medium text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-background border border-border pl-12 pr-4 py-4 rounded-xl focus:border-primary outline-none transition-colors text-sm tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-text-primary text-background py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-95 shadow-xl hover:shadow-primary/20 mt-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-8">
            Don't have an account? <Link to="/register" className="font-bold text-text-primary hover:text-primary transition-colors">Apply for membership.</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
