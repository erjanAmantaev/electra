import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import heroImage from '../assets/hero.png';

type AuthMode = 'login' | 'register';

type AuthGatewayProps = {
  initialMode?: AuthMode;
};

const panelCopy: Record<
  AuthMode,
  {
    subtitle: string;
    title: string;
    description: string;
    badgeTitle: string;
    badgeBody: string;
  }
> = {
  login: {
    subtitle: 'Electra',
    title: 'The future of electronics, curated for you.',
    description:
      "Experience the world\'s most innovative technology through a lens of pure minimalism.",
    badgeTitle: 'Premium Care',
    badgeBody: '2-year extended warranty',
  },
  register: {
    subtitle: 'Welcome Onboard',
    title: 'Build your Electra profile and unlock faster checkout.',
    description: 'Track orders, save favorites, and manage billing from a single premium account.',
    badgeTitle: 'Member Access',
    badgeBody: 'Orders, billing and support',
  },
};

const formCopy: Record<
  AuthMode,
  {
    heading: string;
    description: string;
    actionLabel: string;
    switchPrompt: string;
    switchAction: string;
  }
> = {
  login: {
    heading: 'Welcome back',
    description: 'Please enter your details to access your account.',
    actionLabel: 'Sign In',
    switchPrompt: "Don't have an account?",
    switchAction: 'Create an account',
  },
  register: {
    heading: 'Create your account',
    description: 'Set up your profile to start shopping with saved preferences.',
    actionLabel: 'Create Account',
    switchPrompt: 'Already have an account?',
    switchAction: 'Sign in',
  },
};

const layoutTransition = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 28,
};

export default function AuthGateway({ initialMode = 'login' }: AuthGatewayProps) {
  const navigate = useNavigate();
  const { signIn, register, isAuthenticated } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const isLogin = mode === 'login';
  const panel = panelCopy[mode];
  const formText = formCopy[mode];

  const handleToggleMode = () => {
    if (loading) return;
    setMode(current => (current === 'login' ? 'register' : 'login'));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email.trim(), password);
        toast.success('Signed in successfully.');
      } else {
        if (!name.trim()) {
          throw new Error('Full name is required.');
        }

        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        await register(name.trim(), email.trim(), password);
        toast.success('Account created successfully.');
      }

      navigate('/profile');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to continue right now.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] w-full px-4 py-10 md:px-6 md:py-14 flex items-center justify-center">
      <motion.section
        layout
        transition={layoutTransition}
        className="w-full max-w-6xl bg-surface border border-border rounded-[2rem] p-4 md:p-6 shadow-[0_20px_70px_rgba(2,6,23,0.12)]"
      >
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          <motion.aside
            layout
            transition={layoutTransition}
            style={{ order: isLogin ? 1 : 2 }}
            className="relative w-full lg:w-1/2 min-h-[420px] md:min-h-[520px] rounded-[1.6rem] overflow-hidden bg-gradient-to-br from-[#0f5ef0] via-[#0f57e3] to-[#2b78ff] text-white p-8 md:p-10"
          >
            <div className="absolute -right-20 -top-16 w-72 h-72 bg-white/10 blur-3xl rounded-full" />
            <div className="absolute -left-20 -bottom-16 w-72 h-72 bg-white/10 blur-3xl rounded-full" />

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="relative z-10 h-full flex flex-col"
              >
                <div>
                  <p className="text-4xl font-heading font-black mb-2 tracking-tight">{panel.subtitle}</p>
                  <div className="h-[2px] w-12 bg-white/55 mb-8" />
                  <h2 className="text-4xl md:text-6xl font-heading font-black leading-[1.05] tracking-tight mb-6 max-w-sm">
                    {panel.title}
                  </h2>
                  <p className="text-sm md:text-base text-white/80 max-w-sm leading-relaxed">{panel.description}</p>
                </div>

                <div className="mt-8 md:mt-10 rounded-[1.4rem] bg-[#0d50ce]/75 border border-white/20 p-3 md:p-4 rotate-6 shadow-2xl">
                  <img
                    src={heroImage}
                    alt="Electra preview"
                    className="w-full h-44 md:h-52 object-cover rounded-xl opacity-80"
                  />
                </div>

                <div className="mt-auto inline-flex items-center gap-3 rounded-full bg-white/28 backdrop-blur px-5 py-3 w-fit border border-white/35">
                  <span className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <span>
                    <span className="block text-[11px] font-bold tracking-widest uppercase">{panel.badgeTitle}</span>
                    <span className="block text-xs text-white/80">{panel.badgeBody}</span>
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.aside>

          <motion.div
            layout
            transition={layoutTransition}
            style={{ order: isLogin ? 2 : 1 }}
            className="w-full lg:w-1/2 rounded-[1.6rem] bg-background border border-border p-8 md:p-10"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.form
                key={mode}
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="h-full flex flex-col"
              >
                <div className="mb-8">
                  <h1 className="text-4xl font-heading font-black tracking-tight mb-2">{formText.heading}</h1>
                  <p className="text-text-secondary">{formText.description}</p>
                </div>

                {!isLogin && (
                  <div className="mb-4">
                    <label className="block text-xs font-bold tracking-widest text-text-tertiary uppercase mb-2">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                      <input
                        value={name}
                        onChange={event => setName(event.target.value)}
                        required={!isLogin}
                        type="text"
                        placeholder="Alex Johnson"
                        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-xs font-bold tracking-widest text-text-tertiary uppercase mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input
                      value={email}
                      onChange={event => setEmail(event.target.value)}
                      required
                      type="email"
                      placeholder="alex@example.com"
                      className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold tracking-widest text-text-tertiary uppercase">Password</label>
                    {isLogin && (
                      <button type="button" className="text-xs text-primary font-semibold hover:underline">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <LockKeyhole className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input
                      value={password}
                      onChange={event => setPassword(event.target.value)}
                      required
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="mb-6">
                    <label className="block text-xs font-bold tracking-widest text-text-tertiary uppercase mb-2">Confirm Password</label>
                    <div className="relative">
                      <LockKeyhole className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                      <input
                        value={confirmPassword}
                        onChange={event => setConfirmPassword(event.target.value)}
                        required={!isLogin}
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-hover transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {loading ? 'Please wait...' : formText.actionLabel}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </span>
                </button>

                <p className="mt-8 text-sm text-text-secondary">
                  {formText.switchPrompt}{' '}
                  <button
                    type="button"
                    onClick={handleToggleMode}
                    className="font-bold text-primary hover:underline"
                  >
                    {formText.switchAction}
                  </button>
                </p>
              </motion.form>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
