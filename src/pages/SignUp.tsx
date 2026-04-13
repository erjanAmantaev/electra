import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, LockKeyhole, User, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      toast.success('Account created successfully! Redirecting to your dashboard...');
      navigate('/profile');
    } catch (error) {
      toast.error((error as Error).message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 min-h-[80vh]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-surface border border-border shadow-2xl rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10"></div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-black mb-2 tracking-tighter">Join Electra</h1>
            <p className="text-text-secondary text-sm">Create an account to track orders and manage preferences.</p>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 relative">
              <label className="text-xs font-bold tracking-widest text-text-tertiary uppercase ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  type="text"
                  placeholder="Julian Anderson"
                  className="w-full bg-background border border-border pl-12 pr-4 py-4 rounded-xl focus:border-primary outline-none transition-colors text-sm"
                />
              </div>
            </div>

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
              <label className="text-xs font-bold tracking-widest text-text-tertiary uppercase ml-1">Password</label>
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

            <div className="flex flex-col gap-3 mt-2 text-xs font-medium text-text-secondary border border-border p-4 rounded-xl bg-background">
               <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-success" /> At least 8 characters</div>
               <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-text-tertiary" /> 1 Number or Symbol</div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-text-primary text-background py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-95 shadow-xl hover:shadow-primary/20 mt-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating Account...' : 'Apply for Membership'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-8">
            Already a member? <Link to="/login" className="font-bold text-text-primary hover:text-primary transition-colors">Sign in to your account.</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
