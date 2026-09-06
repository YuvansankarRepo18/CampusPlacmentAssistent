import { Routes, Route, Navigate, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Bot, BrainCircuit, BriefcaseBusiness, Code2, GraduationCap, Eye, EyeOff, LayoutDashboard, MessageSquareText, PenTool, Sparkles, UserCircle2, UploadCloud, CheckCircle2, XCircle, Clock, Target, Award, BarChart3, Zap, BookOpen, TrendingUp, RotateCcw, ChevronRight, ChevronLeft, Flag, Check, AlertTriangle, ShieldCheck, KeyRound, Mail, LogOut, ArrowRight, Lock, RefreshCw, Play, Send, Cpu, Trophy, Terminal, Code, FileCode2, FileText, Download, Copy, Layers, FileCheck, Mic, MicOff, Volume2, Radio, Building2, Info } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { CoachModule } from './components/CoachModule';

const api = {
  async get<T>(path: string): Promise<T> {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    return res.json() as Promise<T>;
  },
  async post<T>(path: string, body: unknown): Promise<T> {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    });
    return res.json() as Promise<T>;
  }
};

function ProtectedRoute({ children, role }: { children: JSX.Element; role?: 'student' | 'admin' | 'tpo' }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex items-center gap-3">
          <RefreshCw className="animate-spin text-blue-500" size={24} />
          <span className="text-sm font-medium">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicOnlyRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <RefreshCw className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const links = useMemo(() => [
    { to: '/aptitude', label: 'Aptitude', icon: BrainCircuit },
    { to: '/coding', label: 'Coding', icon: Code2 },
    { to: '/resume', label: 'Resume', icon: PenTool },
    { to: '/interview', label: 'Interviews', icon: MessageSquareText },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/coach', label: 'Coach', icon: Bot },
    { to: '/profile', label: 'Profile', icon: UserCircle2 }
  ], []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600/20 p-2 text-blue-400 border border-blue-500/20">
              <BriefcaseBusiness size={20} />
            </div>
            <div>
              <p className="font-bold text-white tracking-tight">Campus Placement Assistant</p>
              <p className="text-xs text-slate-400">Generative AI Coaching Platform</p>
            </div>
          </Link>
          <div className="flex items-center gap-2 lg:gap-4">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white">
                <Icon size={16} /> <span className="hidden md:inline">{label}</span>
              </Link>
            ))}

            {user && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <Link to="/profile" className="flex items-center gap-2.5 hover:opacity-90 transition">
                  <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-8 h-8 rounded-full border border-blue-500/30 object-cover" />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-white leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</p>
                  </div>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-6 py-8 flex-1 w-full">{children}</main>
      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        Placement Assistant Platform © 2026 • AI-Powered Placement Readiness
      </footer>
    </div>
  );
}

function LandingPage() {
  const { user, loginWithOAuth, logout } = useAuth();
  const navigate = useNavigate();
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const handleOAuth = async (provider: 'google' | 'linkedin') => {
    setOauthLoading(provider);
    try {
      await loginWithOAuth(provider);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err?.message || `${provider} authentication failed`);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_50%),linear-gradient(135deg,_#020617,_#0f172a)] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600/20 p-2 text-blue-400 border border-blue-500/20">
              <BriefcaseBusiness size={22} />
            </div>
            <div>
              <p className="font-bold text-white text-lg tracking-tight">Campus Placement Assistant</p>
              <p className="text-xs text-slate-400">Generative AI Platform for Students</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition shadow-lg flex items-center gap-2">
                  Go to Dashboard <ArrowRight size={16} />
                </Link>
                <button onClick={logout} className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 transition">
                  Sign In
                </Link>
                <Link to="/register" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition shadow-md">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="mx-auto flex max-w-7xl flex-1 flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:justify-between">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-300 shadow-inner">
            <Sparkles size={14} /> Production-Grade Placement AI Suite
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight text-white">
            Master Campus Placements with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Generative AI</span>.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Practice adaptive aptitude assessments, simulate realistic AI technical & HR mock interviews, build ATS-optimized resumes, and evaluate code performance in one unified platform.
          </p>

          {/* Call to Actions & OAuth Buttons */}
          {!user ? (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 font-semibold text-white shadow-xl hover:from-blue-500 hover:to-indigo-500 transition flex items-center gap-2">
                  Get Started for Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 font-medium text-slate-200 hover:bg-slate-800 transition">
                  Sign In to Account
                </Link>
              </div>

              {/* OAuth Provider Buttons */}
              <div className="pt-4 border-t border-slate-800/80 max-w-md space-y-3">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Or continue with single sign-on</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleOAuth('google')}
                    disabled={oauthLoading !== null}
                    className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 px-4 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z"/>
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
                    </svg>
                    {oauthLoading === 'google' ? 'Signing in...' : 'Google'}
                  </button>

                  <button
                    onClick={() => handleOAuth('linkedin')}
                    disabled={oauthLoading !== null}
                    className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/90 py-2.5 px-4 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                    </svg>
                    {oauthLoading === 'linkedin' ? 'Signing in...' : 'LinkedIn'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4">
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-xl hover:bg-blue-500 transition">
                Access Dashboard <ArrowRight size={18} />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Feature Highlights Grid */}
        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3 text-blue-400">
              <GraduationCap size={26} />
              <h3 className="font-bold text-lg text-white">Placement Readiness Suite</h3>
            </div>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
              Active
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Aptitude Test Engine', '20-question dynamic tests with zero repeat questions', BrainCircuit],
              ['AI Resume Checker', 'ATS formatting checks and keyword suggestions', PenTool],
              ['Mock Interviewer', 'Adaptive HR, technical & managerial modes', MessageSquareText],
              ['Coding Evaluator', 'Multi-language complexity & quality feedback', Code2]
            ].map(([title, description, Icon]: any) => (
              <div key={title} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <Icon size={18} />
                  <h4 className="font-semibold text-sm text-white">{title}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <footer className="border-t border-slate-800/80 px-6 py-4 text-center text-xs text-slate-500">
        Campus Placement Assistant • Enterprise SaaS Authentication & Analytics Engine
      </footer>
    </div>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithOAuth } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'linkedin') => {
    setError('');
    setLoading(true);
    try {
      await loginWithOAuth(provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || `${provider} authentication failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex rounded-xl bg-blue-600/20 p-3 text-blue-400 border border-blue-500/20 mb-2">
            <BriefcaseBusiness size={28} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Welcome back</h2>
          <p className="text-sm text-slate-400">Sign in to your Campus Placement account</p>
        </div>

        {/* OAuth Provider Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-4 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('linkedin')}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-4 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
            LinkedIn
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800"></div>
          <span className="absolute bg-slate-900 px-3 text-xs text-slate-500 uppercase">Or email</span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-blue-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-12 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-blue-600"
              />
              Remember me for 30 days
            </label>
          </div>

          {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 font-semibold text-white transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithOAuth } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'student' as const });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength meter calculation
  const passwordCriteria = useMemo(() => {
    const p = form.password;
    return {
      length: p.length >= 8,
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      number: /\d/.test(p),
      special: /[^A-Za-z0-9]/.test(p),
    };
  }, [form.password]);

  const strengthScore = useMemo(() => {
    return Object.values(passwordCriteria).filter(Boolean).length;
  }, [passwordCriteria]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.fullName.trim()) {
      setError('Full name is required.');
      return;
    }

    if (strengthScore < 4) {
      setError('Please choose a stronger password matching all criteria below.');
      return;
    }

    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'linkedin') => {
    setError('');
    setLoading(true);
    try {
      await loginWithOAuth(provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || `${provider} authentication failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex rounded-xl bg-blue-600/20 p-3 text-blue-400 border border-blue-500/20 mb-2">
            <BriefcaseBusiness size={28} />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Create your account</h2>
          <p className="text-sm text-slate-400">Join thousands of students on Placement Assistant</p>
        </div>

        {/* OAuth Provider Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-4 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-1.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('linkedin')}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-4 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
            </svg>
            LinkedIn
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800"></div>
          <span className="absolute bg-slate-900 px-3 text-xs text-slate-500 uppercase">Or fill form</span>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              placeholder="Aarav Sharma"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              placeholder="name@domain.com"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Account Role</label>
            <select
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as any })}
            >
              <option value="student">Student / Candidate</option>
              <option value="tpo">Training & Placement Officer (TPO)</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-4 pr-12 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                type={showPassword ? 'text' : 'password'}
                placeholder="Choose a strong password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Meter */}
            {form.password && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Password Strength</span>
                  <span className={`font-semibold ${
                    strengthScore >= 4 ? 'text-emerald-400' : strengthScore >= 2 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {strengthScore >= 4 ? 'Strong' : strengthScore >= 2 ? 'Moderate' : 'Weak'}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strengthScore >= 4 ? 'bg-emerald-500' : strengthScore >= 2 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${(strengthScore / 5) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 pt-1">
                  <span className={passwordCriteria.length ? 'text-emerald-400 font-medium' : ''}>✓ Min 8 characters</span>
                  <span className={passwordCriteria.uppercase ? 'text-emerald-400 font-medium' : ''}>✓ Uppercase letter</span>
                  <span className={passwordCriteria.lowercase ? 'text-emerald-400 font-medium' : ''}>✓ Lowercase letter</span>
                  <span className={passwordCriteria.number ? 'text-emerald-400 font-medium' : ''}>✓ Number</span>
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 font-semibold text-white transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-400 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/insights');
      setData(res);
    } catch (err) {
      console.error('Failed to fetch placement readiness insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const report = data?.report;
  const readinessScore = data?.readinessScore ?? 0;
  const placementProbability = data?.placementProbability ?? 0;
  const confidenceLevel = data?.confidenceLevel ?? 'Needs Work';

  const moduleScores = report?.moduleScores || {
    resume: { label: 'Resume Strength', score: data?.resumeStrength ?? 0, weight: 0.20, attemptsCount: 0, status: 'NOT_STARTED' },
    coding: { label: 'Coding Score', score: data?.codingScore ?? 0, weight: 0.35, attemptsCount: 0, status: 'NOT_STARTED' },
    aptitude: { label: 'Aptitude Score', score: data?.aptitudeScore ?? 0, weight: 0.20, attemptsCount: 0, status: 'NOT_STARTED' },
    interview: { label: 'Interview Score', score: data?.interviewScore ?? 0, weight: 0.25, attemptsCount: 0, status: 'NOT_STARTED' }
  };

  const companyReadiness = report?.companyReadiness || [
    { company: 'Google', readinessScore: 0, status: 'NEEDS_PREPARATION', primaryFocus: 'DSA & Code Efficiency' },
    { company: 'Amazon', readinessScore: 0, status: 'NEEDS_PREPARATION', primaryFocus: 'Leadership Principles & Scalability' },
    { company: 'Microsoft', readinessScore: 0, status: 'NEEDS_PREPARATION', primaryFocus: 'OOP Patterns & Algorithms' },
    { company: 'TCS', readinessScore: 0, status: 'NEEDS_PREPARATION', primaryFocus: 'NQT Aptitude & Communication' },
    { company: 'Infosys', readinessScore: 0, status: 'NEEDS_PREPARATION', primaryFocus: 'Logical Reasoning & Coding' },
    { company: 'Zoho', readinessScore: 0, status: 'NEEDS_PREPARATION', primaryFocus: 'Custom Logic Coding' }
  ];

  const categoryBreakdown = report?.categoryBreakdown || {
    quantitative: 0,
    logical: 0,
    verbal: 0,
    dsaCoding: 0,
    webDev: 0,
    communication: 0
  };

  const recommendations = report?.dynamicRecommendations || [
    { id: '1', category: 'Resume', priority: 'High', title: 'Optimize Resume ATS Score', action: 'Upload and analyze your resume to extract missing technical keywords.', targetModuleRoute: '/resume' },
    { id: '2', category: 'Coding', priority: 'High', title: 'Solve DSA Coding Assessments', action: 'Complete your first timed coding assessment challenge.', targetModuleRoute: '/coding' },
    { id: '3', category: 'Aptitude', priority: 'High', title: 'Practice Aptitude Tests', action: 'Run Quantitative & Logical test sessions.', targetModuleRoute: '/aptitude' },
    { id: '4', category: 'Interview', priority: 'Medium', title: 'Simulate AI Mock Interview', action: 'Run a live voice/text mock interview session.', targetModuleRoute: '/interview' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & AI Readiness Gauge */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 p-8 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-400">
            <Sparkles size={14} className="text-blue-400 animate-pulse" /> Central AI Placement Readiness Engine
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">Placement Intelligence Dashboard</h1>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Real-time readiness analytics dynamically aggregated from your ATS Resume strength, Coding assessments, Aptitude tests, and AI Mock Interview sessions.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button onClick={() => setShowDetailModal(true)} className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg transition-all flex items-center gap-2">
              <Info size={16} /> Detailed Readiness Math Breakdown
            </button>
            <button onClick={fetchDashboardData} disabled={loading} className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-all flex items-center gap-1.5">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Metrics
            </button>
          </div>
        </div>

        {/* Executive Gauge & Probability Card */}
        <div className="flex items-center gap-6 bg-slate-950/80 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
          {/* Radial Score Gauge */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-blue-500 stroke-current transition-all duration-1000 ease-out" strokeDasharray={`${readinessScore}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-extrabold text-white">{readinessScore}%</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">AI Readiness</span>
            </div>
          </div>

          <div className="space-y-2 border-l border-slate-800/80 pl-6">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Placement Forecast</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">{placementProbability}%</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                {confidenceLevel} Confidence
              </span>
            </div>
            <p className="text-xs text-slate-400">High probability of clearing initial technical & HR rounds.</p>
          </div>
        </div>
      </div>

      {/* 4 Module Live Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            key: 'resume',
            label: 'Resume Strength (ATS)',
            val: moduleScores.resume.score,
            weight: '20%',
            attempts: `${moduleScores.resume.attemptsCount || 0} Analyzed`,
            icon: FileText,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
            route: '/resume'
          },
          {
            key: 'coding',
            label: 'Coding Score (DSA)',
            val: moduleScores.coding.score,
            weight: '35%',
            attempts: `${moduleScores.coding.solvedCount || 0} Problems Solved`,
            icon: Code2,
            color: 'text-sky-400',
            bg: 'bg-sky-500/10 border-sky-500/20',
            route: '/coding'
          },
          {
            key: 'aptitude',
            label: 'Aptitude Score',
            val: moduleScores.aptitude.score,
            weight: '20%',
            attempts: `${moduleScores.aptitude.attemptsCount || 0} Tests Attempted`,
            icon: BrainCircuit,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10 border-violet-500/20',
            route: '/aptitude'
          },
          {
            key: 'interview',
            label: 'Interview Score',
            val: moduleScores.interview.score,
            weight: '25%',
            attempts: `${moduleScores.interview.attemptsCount || 0} Sessions Completed`,
            icon: MessageSquareText,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
            route: '/interview'
          }
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.key} onClick={() => navigate(m.route)} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3 cursor-pointer hover:border-slate-700 transition-all hover:scale-[1.02] shadow-lg group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">{m.label}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${m.bg} ${m.color}`}>
                  Weight: {m.weight}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className={`text-3xl font-extrabold ${m.color}`}>{m.val}%</span>
                <Icon size={20} className={`${m.color} opacity-80 group-hover:scale-110 transition-transform`} />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <span>{m.attempts}</span>
                <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Target Company Readiness & Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
        {/* Target Company Readiness Grid */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 size={20} className="text-blue-400" /> Target Company Placement Readiness Index
            </h3>
            <span className="text-xs text-slate-400">Targeted Benchmark</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {companyReadiness.map((c: any) => (
              <div key={c.company} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{c.company}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'READY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : c.status === 'COMPETITIVE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Readiness Fit:</span>
                    <span className="font-bold text-white">{c.readinessScore}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${c.readinessScore}%` }} />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-1">Focus: {c.primaryFocus}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Skill Progress Breakdown */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-purple-400" /> Category Skill Radar Breakdown
            </h3>
          </div>

          <div className="space-y-4">
            {[
              { label: 'DSA & Core Algorithms', score: categoryBreakdown.dsaCoding, color: 'bg-sky-500' },
              { label: 'Logical & Reasoning Aptitude', score: categoryBreakdown.logical, color: 'bg-violet-500' },
              { label: 'Quantitative Problem Solving', score: categoryBreakdown.quantitative, color: 'bg-blue-500' },
              { label: 'Verbal & Language Mastery', score: categoryBreakdown.verbal, color: 'bg-indigo-500' },
              { label: 'Interview Verbal Communication', score: categoryBreakdown.communication, color: 'bg-emerald-500' },
              { label: 'Web & System Architecture', score: categoryBreakdown.webDev, color: 'bg-amber-500' }
            ].map((s) => (
              <div key={s.label} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{s.label}</span>
                  <span className="text-white">{s.score}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
                  <div className={`${s.color} h-full rounded-full transition-all duration-500`} style={{ width: `${s.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Weakness AI Recommendations */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap size={20} className="text-amber-400" /> Actionable Dynamic AI Recommendations
          </h3>
          <span className="text-xs text-slate-400">Weakness-Triggered Insights</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec: any) => (
            <div key={rec.id || rec.title} className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    {rec.category} • Priority: {rec.priority}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{rec.action}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 line-clamp-1">{rec.reasoning}</span>
                <button onClick={() => navigate(rec.targetModuleRoute || '/dashboard')} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center gap-1">
                  Start Practice <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: DETAILED READINESS MATH BREAKDOWN */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target size={22} className="text-blue-400" /> AI Placement Readiness Score Calculation
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Weighted Math & Multi-Module Aggregation Breakdown</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                ✕
              </button>
            </div>

            {/* Formula Card */}
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Weighted Formula Math</span>
              <p className="text-sm font-mono text-slate-200">
                AI Readiness Score = (Resume × 20%) + (Coding × 35%) + (Aptitude × 20%) + (Interview × 25%)
              </p>
            </div>

            {/* Contribution Breakdown Table */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Module Contribution Breakdown</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Module</th>
                      <th className="py-2 px-3">Actual Score</th>
                      <th className="py-2 px-3">Configured Weight</th>
                      <th className="py-2 px-3">Weighted Contribution</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {Object.values(moduleScores).map((m: any) => (
                      <tr key={m.label || m.moduleName}>
                        <td className="py-3 px-3 font-semibold text-white">{m.label || m.moduleName}</td>
                        <td className="py-3 px-3 font-mono font-bold text-blue-400">{m.score}%</td>
                        <td className="py-3 px-3 font-mono">{Math.round((m.weight || 0.25) * 100)}%</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">+{Math.round((m.score || 0) * (m.weight || 0.25))}%</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${m.status === 'EXCELLENT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Candidate Strengths & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                <span className="font-bold text-emerald-400 uppercase tracking-wider block">Identified Candidate Strengths</span>
                <ul className="space-y-1 text-slate-300">
                  {report?.topStrengths?.map((st: string, idx: number) => <li key={idx}>✓ {st}</li>) || <li>✓ Active platform engagement</li>}
                </ul>
              </div>

              <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-2">
                <span className="font-bold text-rose-400 uppercase tracking-wider block">Critical Gaps to Resolve</span>
                <ul className="space-y-1 text-slate-300">
                  {report?.criticalGaps?.map((gap: string, idx: number) => <li key={idx}>⚠️ {gap}</li>) || <li>⚠️ Complete remaining assessment modules</li>}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setShowDetailModal(false)} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg">
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResumePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [showJdInput, setShowJdInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'breakdown' | 'jobmatch' | 'sections' | 'bullets' | 'formatting' | 'benchmarking' | 'roadmap' | 'optimizer' | 'history'>('breakdown');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const sampleJDs: Record<string, string> = {
    'Software Engineer': `We are seeking a Software Engineer proficient in Python, Java, Data Structures, Algorithms, REST APIs, Microservices, and SQL databases. Experience with Docker, AWS, and Git is preferred.`,
    'Full Stack Developer': `Looking for a Full Stack Developer with experience in React, Node.js, TypeScript, Express, MongoDB, Tailwind CSS, REST APIs, and CI/CD automated deployment pipelines.`,
    'Data Analyst': `Seeking a Data Analyst with strong Python, SQL, PostgreSQL, Pandas, NumPy, Data Visualization, Tableau, and Statistical Analysis capabilities.`
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.get<any[]>('/resume/history');
      if (Array.isArray(data)) {
        setHistory(data);
        if (data.length > 0 && !result) {
          setResult(data[0]);
          setFilename(data[0].fileName);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('file', file);
      if (jobDescription.trim()) {
        fd.append('jobDescription', jobDescription.trim());
      }
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Analysis failed');
      const data = await res.json();
      setResult(data);
      setFilename(file.name);
      fetchHistory();
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOptimizedText = () => {
    if (result?.optimizedResumeText) {
      navigator.clipboard.writeText(result.optimizedResumeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadDocx = () => {
    if (!result?.optimizedResumeText) return;
    const blob = new Blob([result.optimizedResumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(filename || 'Resume').replace(/\.[^/.]+$/, '')}_ATS_Optimized.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdfView = () => {
    if (!result?.optimizedResumeText) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename || 'ATS Optimized Resume'}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 40px; line-height: 1.5; color: #111; max-width: 800px; margin: 0 auto; }
            pre { white-space: pre-wrap; word-wrap: break-word; font-size: 13px; }
          </style>
        </head>
        <body>
          <pre>${result.optimizedResumeText}</pre>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const ScoreRadialRing = ({ score }: { score: number }) => {
    const radius = 54;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    const pct = Math.max(0, Math.min(100, score));
    const offset = circumference - (pct / 100) * circumference;

    const getColor = (s: number) => {
      if (s >= 80) return '#10b981';
      if (s >= 65) return '#f59e0b';
      return '#ef4444';
    };

    return (
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2}>
          <circle stroke="#1e293b" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
          <circle stroke={getColor(score)} fill="transparent" strokeWidth={stroke} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400">/ 100</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
              <Sparkles size={14} /> Commercial ATS Resume Analyzer & Optimizer
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">AI ATS Resume Analyzer</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload your resume for multi-category ATS scoring, keyword gap analysis, section grading, AI STAR-method bullet rewrites, and instant ATS optimization.
            </p>
          </div>

          {/* Action Upload Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3 min-w-[300px]">
            <input id="resume-upload-file" type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} className="hidden" disabled={loading} />
            <label htmlFor="resume-upload-file" className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-sm font-semibold transition-all ${loading ? 'bg-slate-800 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] cursor-pointer'}`}>
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <UploadCloud size={18} />}
              {loading ? 'Parsing & Analyzing Resume...' : 'Upload PDF or DOCX Resume'}
            </label>

            <button onClick={() => setShowJdInput(!showJdInput)} className="w-full text-center text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1">
              <Target size={14} /> {showJdInput ? 'Hide Job Description Matcher' : '+ Target Job Description (Optional)'}
            </button>

            {filename && <p className="text-center text-xs text-slate-400 truncate">Uploaded: <span className="text-slate-200 font-medium">{filename}</span></p>}
          </div>
        </div>

        {/* Optional Target Job Description Input */}
        {showJdInput && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Target size={14} className="text-purple-400" /> Target Job Description (Paste JD text to calculate Job Match Score %)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Load sample:</span>
                {Object.keys(sampleJDs).map((role) => (
                  <button key={role} onClick={() => setJobDescription(sampleJDs[role])} className="text-[11px] px-2 py-0.5 rounded-full border border-slate-700 bg-slate-900 text-blue-400 hover:bg-slate-800">
                    {role}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the target job description here..." className="w-full h-24 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none" />
          </div>
        )}

        {error && <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">{error}</div>}
      </div>

      {/* Main Analysis Dashboard */}
      {result ? (
        <div className="space-y-6">
          {/* Executive Top Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Overall ATS Score */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex items-center gap-4">
              <ScoreRadialRing score={result.overallAtsScore ?? 75} />
              <div>
                <span className="text-xs text-slate-400 font-medium">Overall ATS Score</span>
                <div className="text-lg font-bold text-white mt-1 flex items-center gap-1.5">
                  {result.overallAtsScore >= 80 ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Top Tier</span>
                  ) : result.overallAtsScore >= 65 ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">Ready</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">Needs Work</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Weighted 11-category score</p>
              </div>
            </div>

            {/* Recruiter Readiness */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Recruiter Readiness</span>
                <Award size={18} className="text-indigo-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-white">{result.recruiterReadinessScore ?? 82}%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${result.recruiterReadinessScore ?? 82}%` }} />
                </div>
              </div>
            </div>

            {/* Job Match Score */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Job Match Score</span>
                <Target size={18} className="text-purple-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-white">{result.jobMatch?.jobMatchScore ?? (jobDescription ? 70 : '--')}</div>
                <p className="text-[11px] text-slate-500 mt-1">{result.jobMatch ? `Matched vs ${result.jobMatch.jobTitle || 'Role'}` : 'Paste Job Description for JD Match'}</p>
              </div>
            </div>

            {/* Resume Completeness */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Completeness</span>
                <CheckCircle2 size={18} className="text-emerald-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-white">{result.resumeCompletenessScore ?? 85}%</div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${result.resumeCompletenessScore ?? 85}%` }} />
                </div>
              </div>
            </div>

            {/* Employability Score */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-medium">Employability Index</span>
                <TrendingUp size={18} className="text-blue-400" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-extrabold text-white">{result.employabilityScore ?? 88}%</div>
                <p className="text-[11px] text-slate-500 mt-1">Campus Placement benchmark</p>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'breakdown', label: '11-Category Score Breakdown', icon: BarChart3 },
              { id: 'jobmatch', label: 'Job Description Match', icon: Target },
              { id: 'sections', label: 'Section-by-Section Analysis', icon: Layers },
              { id: 'bullets', label: 'AI Bullet Point Rewriter', icon: Sparkles },
              { id: 'formatting', label: 'ATS Formatting Checks', icon: FileCheck },
              { id: 'benchmarking', label: 'Role Benchmarking', icon: Trophy },
              { id: 'roadmap', label: 'Improvement Roadmap', icon: Zap },
              { id: 'optimizer', label: 'AI Resume Optimizer & Download', icon: Download },
              { id: 'history', label: 'Version History', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'}`}>
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: 11 Category Breakdown */}
          {activeTab === 'breakdown' && result.categoryScores && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(result.categoryScores).map((catKey) => {
                const cat = result.categoryScores[catKey];
                return (
                  <div key={catKey} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{cat.label}</h4>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${cat.score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : cat.score >= 65 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {cat.score} / 100
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cat.score >= 80 ? 'bg-emerald-500' : cat.score >= 65 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${cat.score}%` }} />
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {cat.pointsGained?.map((pg: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-emerald-400">
                          <CheckCircle2 size={13} className="shrink-0 mt-0.5" />
                          <span>{pg}</span>
                        </div>
                      ))}
                      {cat.pointsLost?.map((pl: string, i: number) => (
                        <div key={i} className="flex items-start gap-1.5 text-rose-400">
                          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                          <span>{pl}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">{cat.feedback}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: Job Match */}
          {activeTab === 'jobmatch' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
              {result.jobMatch ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Job Description Match Analysis</h3>
                      <p className="text-xs text-slate-400 mt-1">Target Role: <span className="text-purple-400 font-semibold">{result.jobMatch.jobTitle}</span></p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-extrabold text-purple-400">{result.jobMatch.jobMatchScore}%</span>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Job Compatibility</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Matching Skills */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 size={16} /> Matching Skills Found ({result.jobMatch.matchingSkills?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {result.jobMatch.matchingSkills?.map((s: string) => (
                          <span key={s} className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-300">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle size={16} /> Missing Critical Keywords ({result.jobMatch.missingSkills?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {result.jobMatch.missingSkills?.map((s: string) => (
                          <span key={s} className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-medium text-rose-300">
                            + {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 text-xs text-purple-200">
                    💡 <span className="font-semibold">Recruiter Recommendation:</span> {result.jobMatch.compatibilityExplanation}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <Target size={36} className="mx-auto text-slate-600" />
                  <h4 className="text-sm font-semibold text-slate-300">No Job Description Provided</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Paste a Job Description in the header upload section above to calculate your exact Job Match Score % and identify missing technical keywords.
                  </p>
                  <button onClick={() => setShowJdInput(true)} className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500">
                    Open Job Description Matcher
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Section Analysis */}
          {activeTab === 'sections' && result.sectionAnalysis && (
            <div className="space-y-4">
              {result.sectionAnalysis.map((sec: any, idx: number) => (
                <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold px-3 py-1 rounded-xl ${sec.score >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : sec.score >= 75 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        Grade {sec.grade}
                      </span>
                      <h4 className="text-base font-bold text-white">{sec.sectionName}</h4>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{sec.score} / 100</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="font-semibold text-emerald-400 block mb-1">Strengths:</span>
                      <ul className="space-y-1 text-slate-300">
                        {sec.strengths?.map((st: string, i: number) => <li key={i}>• {st}</li>)}
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-amber-400 block mb-1">Opportunities for Improvement:</span>
                      <ul className="space-y-1 text-slate-300">
                        {sec.improvements?.map((imp: string, i: number) => <li key={i}>• {imp}</li>)}
                      </ul>
                    </div>
                  </div>

                  {sec.missingItems && sec.missingItems.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-semibold text-rose-400">Missing Elements:</span>
                      {sec.missingItems.map((mi: string, i: number) => (
                        <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 font-medium">
                          ⚠️ {mi}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: AI Bullet Rewriter */}
          {activeTab === 'bullets' && result.bulletRewrites && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-xs text-blue-300 flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <Sparkles size={16} className="text-blue-400" /> AI STAR-Method Bullet Point Optimizer
                </span>
                <span className="text-[11px] text-slate-400">Quantified metrics & active verbs injected</span>
              </div>

              {result.bulletRewrites.map((bw: any) => (
                <div key={bw.id} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{bw.section}</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      {bw.impactBoost}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Before */}
                    <div className="rounded-xl border border-rose-500/20 bg-slate-950 p-4 space-y-2">
                      <span className="font-semibold text-rose-400 uppercase text-[10px] tracking-wider block">Before (Weak / Passive)</span>
                      <p className="text-slate-400 leading-relaxed">"{bw.originalText}"</p>
                    </div>

                    {/* After */}
                    <div className="rounded-xl border border-emerald-500/20 bg-slate-950 p-4 space-y-2">
                      <span className="font-semibold text-emerald-400 uppercase text-[10px] tracking-wider block">After (AI Optimized STAR Bullet)</span>
                      <p className="text-slate-200 font-medium leading-relaxed">"{bw.rewrittenText}"</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 font-medium">Metrics Injected:</span>
                    {bw.metricsAdded?.map((m: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 font-medium">
                        + {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: ATS Formatting */}
          {activeTab === 'formatting' && result.formattingChecks && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck size={20} className="text-emerald-400" /> ATS Compatibility & Layout Validation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.formattingChecks.map((fc: any, idx: number) => (
                  <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">{fc.checkName}</h4>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${fc.status === 'PASS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {fc.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{fc.detail}</p>
                    <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">💡 Recommendation: {fc.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Benchmarking */}
          {activeTab === 'benchmarking' && result.benchmarking && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Campus Placement Percentile Benchmarking</h3>
                  <p className="text-xs text-slate-400 mt-1">Target Position: <span className="text-blue-400 font-semibold">{result.benchmarking.targetRole}</span></p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-extrabold text-emerald-400">Top {100 - result.benchmarking.candidatePercentile}%</span>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Candidate Rank Percentile ({result.benchmarking.candidatePercentile}th Percentile)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Top Candidate Competencies</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {result.benchmarking.topCompetencies?.map((tc: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400" /> {tc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Competency Gaps vs Top 10% Candidates</h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {result.benchmarking.competencyGaps?.map((cg: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-400" /> {cg}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Improvement Roadmap */}
          {activeTab === 'roadmap' && result.roadmap && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap size={20} className="text-amber-400" /> Prioritized Resume Improvement Roadmap
              </h3>

              {result.roadmap.map((rm: any) => (
                <div key={rm.id} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${rm.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : rm.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {rm.priority} Priority
                      </span>
                      <h4 className="text-sm font-bold text-white">{rm.title}</h4>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-400">+{rm.expectedScoreBoost} ATS Pts</span>
                  </div>

                  <p className="text-xs text-slate-300">{rm.action}</p>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">Why this matters: {rm.reasoning}</p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 8: AI Resume Optimizer & Downloader */}
          {activeTab === 'optimizer' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-purple-400" /> AI-Generated ATS-Optimized Resume
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Ready to copy or export as text / printable PDF format</p>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={handleCopyOptimizedText} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700">
                    <Copy size={14} /> {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                  <button onClick={handleDownloadDocx} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500">
                    <Download size={14} /> Download TXT / DOCX
                  </button>
                  <button onClick={handleDownloadPdfView} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-semibold text-white hover:scale-105 transition-all">
                    <FileText size={14} /> Print / Save PDF
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                {result.optimizedResumeText || 'Optimized resume content generating...'}
              </div>
            </div>
          )}

          {/* TAB 9: Version History */}
          {activeTab === 'history' && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock size={20} className="text-blue-400" /> Resume Version Analysis History
              </h3>

              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((h: any, idx: number) => (
                    <div key={h.id || idx} onClick={() => setResult(h)} className={`rounded-2xl border p-4 flex items-center justify-between cursor-pointer transition-all ${result?.id === h.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-950 hover:bg-slate-900'}`}>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{h.fileName || 'Resume.pdf'}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Uploaded: {new Date(h.uploadedAt || Date.now()).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-emerald-400">{h.overallAtsScore} / 100</span>
                        <ChevronRight size={16} className="text-slate-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No historical analyses found.</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-12 text-center space-y-4">
          <UploadCloud size={48} className="mx-auto text-blue-500 animate-pulse" />
          <h3 className="text-xl font-bold text-white">Upload Your Resume for AI ATS Evaluation</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload your resume in PDF or DOCX format. Get an instant 11-category score breakdown, target Job Description keyword match, AI STAR bullet rewrites, and downloadable ATS optimization.
          </p>
        </div>
      )}
    </div>
  );
}

function InterviewPage() {
  const [view, setView] = useState<'wizard' | 'live' | 'report' | 'history'>('wizard');
  const [config, setConfig] = useState<any>({
    role: 'Software Engineer',
    company: 'Google',
    experienceLevel: 'Fresher',
    type: 'Technical',
    useResumeContext: true,
    questionCount: 5
  });

  const [sessionId, setSessionId] = useState<string>('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [report, setReport] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const roles = [
    'Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'Data Analyst', 'Data Scientist', 'AI Engineer', 'DevOps Engineer', 'QA Engineer', 'Product Manager'
  ];

  const companies = [
    'Google', 'Amazon', 'Microsoft', 'Deloitte', 'TCS', 'Infosys', 'Accenture', 'Cognizant', 'Capgemini', 'Zoho'
  ];

  const expLevels = ['Fresher', '1-3 years', '3-5 years', 'Experienced'];
  const types = ['Technical', 'HR', 'Behavioral', 'Managerial', 'Coding', 'System Design', 'Mixed Interview'];

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    let interval: any;
    if (view === 'live') {
      interval = setInterval(() => setTimerSec((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  // Web Speech API - Speech-to-Text (STT) setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = 'en-US';

        recog.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript) {
            setCandidateAnswer((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
          }
        };

        recog.onerror = () => setIsListening(false);
        recog.onend = () => setIsListening(false);

        setRecognition(recog);
      }
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await api.get<any[]>('/interview/history');
      if (Array.isArray(data)) setHistory(data);
    } catch {
      // ignore
    }
  };

  const handleSpeakQuestion = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMic = () => {
    if (!recognition) {
      alert('Speech Recognition (Speech-to-Text) is not supported in this browser. Please type your response.');
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const startSimulation = async () => {
    setLoading(true);
    setCandidateAnswer('');
    setEvaluations([]);
    setCurrentIdx(0);
    setTimerSec(0);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(config)
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to start interview');
      const data = await res.json();
      setSessionId(data.sessionId);
      setQuestions(data.questions || []);
      setView('live');

      if (data.questions && data.questions.length > 0) {
        handleSpeakQuestion(data.questions[0].questionText);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to start interview session');
    } finally {
      setLoading(false);
    }
  };

  const handleNextAnswer = async (skip = false) => {
    if (evaluating) return;
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    if (isListening && recognition) {
      try { recognition.stop(); } catch {}
      setIsListening(false);
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setEvaluating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          questionId: currentQ.id,
          questionText: currentQ.questionText,
          candidateAnswer: skip ? 'Candidate skipped this question.' : candidateAnswer,
          config
        })
      });

      const evalData = await res.json();
      const newEvals = [...evaluations, evalData];
      setEvaluations(newEvals);
      setCandidateAnswer('');

      // Check if AI generated dynamic follow-up question
      if (evalData.followUpQuestion && !currentQ.isFollowUp && questions.length < 8) {
        const updatedQs = [...questions];
        updatedQs.splice(currentIdx + 1, 0, evalData.followUpQuestion);
        setQuestions(updatedQs);
      }

      if (currentIdx + 1 < (questions.length + (evalData.followUpQuestion ? 1 : 0))) {
        const nextIdx = currentIdx + 1;
        setCurrentIdx(nextIdx);
        const nextQ = questions[nextIdx] || evalData.followUpQuestion;
        if (nextQ) handleSpeakQuestion(nextQ.questionText);
      } else {
        // Finish Session
        finishSimulation(newEvals);
      }
    } catch (err: any) {
      console.error('Evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const finishSimulation = async (allEvals: any[]) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/interview/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          sessionId,
          config,
          evaluations: allEvals,
          durationSeconds: timerSec
        })
      });
      const reportData = await res.json();
      setReport(reportData);
      setView('report');
      fetchHistory();
    } catch (err: any) {
      alert(err?.message || 'Failed to finish interview report');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Navigation */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400">
            <Radio size={14} className="animate-pulse text-indigo-400" /> AI-Powered Placement Interview Simulation
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Interview Simulation Platform</h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Simulate realistic technical, HR, coding, and system design interviews tailored to your target company, role, and uploaded resume context.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setView('wizard')} className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${view === 'wizard' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}>
            New Simulation
          </button>
          <button onClick={() => setView('history')} className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${view === 'history' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}>
            Session History
          </button>
        </div>
      </div>

      {/* VIEW 1: SETUP WIZARD */}
      {view === 'wizard' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 space-y-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <Target size={22} className="text-blue-400" /> Configure Target Interview Session
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Role */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Target Role</label>
              <select value={config.role} onChange={(e) => setConfig({ ...config, role: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none">
                {roles.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* Target Company */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Target Company Style</label>
              <select value={config.company} onChange={(e) => setConfig({ ...config, company: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none">
                {companies.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Experience Level</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {expLevels.map((lvl) => (
                  <button key={lvl} type="button" onClick={() => setConfig({ ...config, experienceLevel: lvl })} className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${config.experienceLevel === lvl ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Interview Type</label>
              <select value={config.type} onChange={(e) => setConfig({ ...config, type: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none">
                {types.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Resume Integration Switch */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <FileText size={18} className="text-purple-400" /> Resume & ATS Context Integration
              </span>
              <p className="text-xs text-slate-400 max-w-lg">
                Dynamically extract your skills, projects, and certifications from your uploaded ATS resume report to generate personalized interview questions.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={config.useResumeContext} onChange={(e) => setConfig({ ...config, useResumeContext: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={startSimulation} disabled={loading} className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2">
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
              {loading ? 'Generating AI Simulation Session...' : 'Start Live AI Interview Session'}
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: LIVE INTERVIEW HUD */}
      {view === 'live' && questions.length > 0 && (
        <div className="space-y-6">
          {/* Top Session Progress Bar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-slate-300 font-medium">{config.role} @ {config.company}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-mono text-amber-400 font-bold">
                <Clock size={15} /> {formatTimer(timerSec)}
              </span>
              <button onClick={() => finishSimulation(evaluations)} className="text-xs text-rose-400 hover:underline">
                End Early
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6">
            {/* Left AI Panel */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4 text-center">
                <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-1 flex items-center justify-center shadow-xl">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                    <Bot size={44} className={isSpeaking ? 'text-purple-400 animate-pulse' : 'text-blue-400'} />
                  </div>
                  {isSpeaking && <span className="absolute -bottom-1 px-2 py-0.5 rounded-full bg-purple-500 text-[9px] font-bold text-white animate-bounce">Speaking...</span>}
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">AI Placement Interview Panel</h3>
                  <p className="text-xs text-slate-400">{config.company} Style {config.type} Interviewer</p>
                </div>
              </div>

              {/* Audio Wave Visualizer */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Voice Status:</span>
                  <span className={isListening ? 'text-emerald-400 font-bold animate-pulse' : isSpeaking ? 'text-purple-400 font-bold' : 'text-slate-500'}>
                    {isListening ? '🎙 Listening to Candidate...' : isSpeaking ? '🔊 AI Reading Question...' : 'Idle'}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-1.5 h-8">
                  {[40, 70, 30, 90, 50, 80, 40, 60].map((h, i) => (
                    <div key={i} className={`w-1 rounded-full transition-all duration-300 ${isSpeaking ? 'bg-purple-500 animate-pulse' : isListening ? 'bg-emerald-500 animate-bounce' : 'bg-slate-800'}`} style={{ height: (isSpeaking || isListening) ? `${h}%` : '20%' }} />
                  ))}
                </div>

                <button onClick={() => handleSpeakQuestion(questions[currentIdx]?.questionText || '')} className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5">
                  <Volume2 size={14} className="text-purple-400" /> Read Question Aloud (TTS)
                </button>
              </div>
            </div>

            {/* Right Question & Live Answer Area */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 flex flex-col justify-between">
              {/* Question Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    {questions[currentIdx]?.category || 'Interview Question'}
                  </span>
                  {questions[currentIdx]?.isFollowUp && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                      <Sparkles size={12} /> Dynamic AI Follow-up
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white leading-relaxed">
                  {questions[currentIdx]?.questionText}
                </h3>
              </div>

              {/* Live Answer Text Area */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Your Response (Type or Use Microphone)</label>
                  <button onClick={toggleMic} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}>
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                    {isListening ? 'Stop Mic' : 'Voice Input (STT)'}
                  </button>
                </div>

                <textarea value={candidateAnswer} onChange={(e) => setCandidateAnswer(e.target.value)} placeholder="Type or speak your structured STAR response here..." className="w-full h-40 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200 placeholder-slate-600 focus:border-blue-500 focus:outline-none" />
              </div>

              {/* Live Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <button onClick={() => handleNextAnswer(true)} disabled={evaluating} className="text-xs text-slate-400 hover:text-slate-200">
                  Skip Question
                </button>

                <button onClick={() => handleNextAnswer(false)} disabled={evaluating || (!candidateAnswer.trim() && !isListening)} className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-lg hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2">
                  {evaluating ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
                  {evaluating ? 'Evaluating Response...' : 'Submit & Next Question'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: COMPREHENSIVE POST-INTERVIEW REPORT */}
      {view === 'report' && report && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-6">
              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  Simulation Completed
                </span>
                <h2 className="text-2xl font-extrabold text-white mt-2">Interview Performance Scorecard</h2>
                <p className="text-xs text-slate-400 mt-1">{report.config?.role} @ {report.config?.company} ({report.config?.type} Round)</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-white">{report.overallScore}</span>
                  <span className="text-xs text-slate-400 block">/ 100 Overall</span>
                </div>
                <div className="text-center border-l border-slate-800 pl-4">
                  <span className="text-3xl font-extrabold text-emerald-400">{report.placementReadinessScore}%</span>
                  <span className="text-xs text-slate-400 block">Placement Readiness</span>
                </div>
              </div>
            </div>

            {/* Score Breakdown Gauges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              {[
                { label: 'Technical', score: report.technicalScore },
                { label: 'Communication', score: report.communicationScore },
                { label: 'Confidence', score: report.confidenceScore },
                { label: 'Problem Solving', score: report.problemSolvingScore },
                { label: 'Behavioral', score: report.behavioralScore },
                { label: 'Role Readiness', score: report.roleReadinessScore }
              ].map((m, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-1">
                  <span className="text-xl font-bold text-white">{m.score}%</span>
                  <span className="text-[11px] text-slate-400 block font-medium">{m.label}</span>
                </div>
              ))}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={16} /> Key Performance Strengths
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {report.topStrengths?.map((st: string, i: number) => <li key={i}>✓ {st}</li>)}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle size={16} /> Key Improvement Areas
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {report.keyWeaknesses?.map((kw: string, i: number) => <li key={i}>⚠️ {kw}</li>)}
                </ul>
              </div>
            </div>

            {/* Question-by-Question Breakdown */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h3 className="text-lg font-bold text-white">Question-by-Question Evaluation</h3>

              {report.questionEvaluations?.map((eq: any, idx: number) => (
                <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Question {idx + 1}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      Score: {eq.score} / 100
                    </span>
                  </div>

                  <p className="text-sm font-bold text-white">{eq.questionText}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block mb-1">Your Response Transcript</span>
                      <p className="text-slate-300 leading-relaxed">"{eq.candidateAnswer}"</p>
                    </div>
                    <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase block mb-1">STAR Model Ideal Answer Key</span>
                      <p className="text-slate-200 leading-relaxed">{eq.idealAnswerSnippet}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: SESSION HISTORY */}
      {view === 'history' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock size={20} className="text-blue-400" /> Past Interview Simulation History
          </h3>

          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((h: any, idx: number) => (
                <div key={h.id || idx} onClick={() => { setReport(h); setView('report'); }} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-all">
                  <div>
                    <h4 className="text-sm font-bold text-white">{h.config?.role} @ {h.config?.company}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Date: {new Date(h.completedAt || Date.now()).toLocaleDateString()} | Type: {h.config?.type}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-emerald-400">{h.overallScore} / 100</span>
                    <ChevronRight size={16} className="text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No past interview sessions found.</p>
          )}
        </div>
      )}
    </div>
  );
}


function AptitudePage() {
  const [testConfig, setTestConfig] = useState({ category: 'all', difficulty: 'medium', count: 20, durationMin: 30 });
  const [test, setTest] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'test' | 'solutions' | 'insights'>('test');
  const [solutionFilter, setSolutionFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const data = await api.get('/aptitude/insights');
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aptitude_test');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.test) {
          setTest(parsed.test);
          setAnswers(parsed.answers || {});
          setMarked(parsed.marked || {});
          setCurrent(parsed.current || 0);
          setTimeLeft(parsed.timeLeft || null);
          setRunning(parsed.running || false);
        }
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    if (!running || timeLeft == null) return;
    if (timeLeft <= 0) {
      submitTest();
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => (s != null ? s - 1 : s)), 1000);
    return () => clearInterval(t);
  }, [running, timeLeft]);

  useEffect(() => {
    try {
      if (test) {
        localStorage.setItem('aptitude_test', JSON.stringify({ test, answers, marked, current, timeLeft, running }));
      }
    } catch (err) {}
  }, [test, answers, marked, current, timeLeft, running]);

  const startTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const body = {
        categories: testConfig.category === 'all' ? 'all' : [testConfig.category],
        difficulty: testConfig.difficulty,
        count: 20,
        durationSec: testConfig.durationMin * 60
      };
      const res = await api.post<any>('/aptitude/start', body);
      setTest(res);
      setAnswers({});
      setMarked({});
      setCurrent(0);
      setTimeLeft(res.totalTimeSec || testConfig.durationMin * 60);
      setRunning(true);
      setActiveTab('test');
    } catch (err: any) {
      alert(err?.message || 'Failed to start test');
    } finally {
      setLoading(false);
    }
  };

  const selectOption = (qId: string, idx: number) => {
    setAnswers((s) => ({ ...s, [qId]: idx }));
  };

  const toggleMark = (qId: string) => {
    setMarked((s) => ({ ...s, [qId]: !s[qId] }));
  };

  const submitTest = async () => {
    if (!test) return;
    setRunning(false);
    setLoading(true);
    try {
      const payload = {
        testId: test.testId,
        answers,
        timeSpentSec: test.totalTimeSec ? test.totalTimeSec - (timeLeft || 0) : 0
      };
      const res = await api.post<any>('/aptitude/submit', payload);
      setResult(res);
      setAnalytics(res.analytics);
      localStorage.removeItem('aptitude_test');
      setActiveTab('solutions');
    } catch (err: any) {
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setTest(null);
    setAnswers({});
    setMarked({});
    setCurrent(0);
    setTimeLeft(null);
    setRunning(false);
    setResult(null);
    localStorage.removeItem('aptitude_test');
    fetchAnalytics();
  };

  const currentQ = test?.questions?.[current];

  const filteredSolutions = useMemo(() => {
    if (!result?.questionDetails) return [];
    return result.questionDetails.filter((q: any) => {
      if (solutionFilter === 'correct') return q.isCorrect;
      if (solutionFilter === 'incorrect') return !q.isCorrect && q.selectedIndex !== -1;
      if (solutionFilter === 'unanswered') return q.selectedIndex === -1;
      return true;
    });
  }, [result, solutionFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            <Zap size={14} /> Production-Grade Placement Aptitude Platform
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Aptitude Assessment Platform</h1>
          <p className="mt-1 text-sm text-slate-400">AMCAT & HackerRank standard adaptive 20-question test engine with zero question repetition.</p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-950 p-1.5 border border-slate-800">
          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === 'test' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BrainCircuit size={16} /> Test Runner
          </button>
          {result && (
            <button
              onClick={() => setActiveTab('solutions')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === 'solutions' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen size={16} /> Solutions & Review
            </button>
          )}
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === 'insights' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 size={16} /> Performance Insights
          </button>
        </div>
      </div>

      {/* TAB 1: TEST RUNNER */}
      {activeTab === 'test' && (
        <>
          {/* Test Setup Mode */}
          {!test && !result && (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Configure Your Assessment</h2>
                  <p className="mt-1 text-sm text-slate-400">Select categories and difficulty to generate a unique 20-question placement test.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Category Selection</label>
                    <select
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 focus:border-blue-500 focus:outline-none"
                      value={testConfig.category}
                      onChange={(e) => setTestConfig({ ...testConfig, category: e.target.value })}
                    >
                      <option value="all">🌟 All Categories (5 Quant + 5 Logical + 5 Verbal + 5 DI)</option>
                      <option value="Quantitative">🔢 Quantitative Aptitude (20 Questions)</option>
                      <option value="Logical">🧩 Logical Reasoning (20 Questions)</option>
                      <option value="Verbal">💬 Verbal Ability (20 Questions)</option>
                      <option value="DataInterpretation">📊 Data Interpretation (20 Questions)</option>
                    </select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Difficulty Level</label>
                      <select
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 focus:border-blue-500 focus:outline-none"
                        value={testConfig.difficulty}
                        onChange={(e) => setTestConfig({ ...testConfig, difficulty: e.target.value })}
                      >
                        <option value="easy">Easy (Fundamentals)</option>
                        <option value="medium">Medium (Standard AMCAT)</option>
                        <option value="hard">Hard (Advanced Placement)</option>
                        <option value="adaptive">Adaptive Mix</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Duration (Minutes)</label>
                      <input
                        type="number"
                        min={10}
                        max={120}
                        value={testConfig.durationMin}
                        onChange={(e) => setTestConfig({ ...testConfig, durationMin: Math.max(10, Number(e.target.value)) })}
                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-2 text-xs text-blue-200">
                    <p className="font-semibold flex items-center gap-1.5"><Sparkles size={14} /> Smart Question Engine Rules:</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      <li>Generates exactly 20 unique questions per session.</li>
                      <li>Filters against your lifetime history to ensure zero repeat questions.</li>
                      <li>Includes procedural variable-substituted math and GenAI dynamic items.</li>
                    </ul>
                  </div>

                  <button
                    onClick={startTest}
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Generating 20 Unique Questions...' : '🚀 Start 20-Question Aptitude Test'}
                  </button>
                </div>
              </div>

              {/* Sidebar Quick Stats */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
                <h3 className="text-lg font-semibold text-white">Your Aptitude Summary</h3>

                {analytics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                        <p className="text-xs text-slate-400">Tests Completed</p>
                        <p className="mt-1 text-2xl font-bold text-blue-400">{analytics.testsAttempted}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                        <p className="text-xs text-slate-400">Overall Accuracy</p>
                        <p className="mt-1 text-2xl font-bold text-emerald-400">{analytics.overallAccuracy}%</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 space-y-3">
                      <p className="text-xs font-semibold text-slate-300">Category Accuracy</p>
                      {Object.entries(analytics.categoryPerformance || {}).map(([cat, stat]: any) => (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>{cat}</span>
                            <span>{stat.accuracy}% ({stat.correct}/{stat.attempted})</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stat.accuracy}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Take your first test to see performance insights.</p>
                )}
              </div>
            </div>
          )}

          {/* Live Test Environment (AMCAT/HackerRank Style) */}
          {test && !result && currentQ && (
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* Question Main Panel */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl space-y-6">
                {/* Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-blue-600/20 px-3 py-1 text-xs font-semibold text-blue-300">
                      Question {current + 1} of {test.totalQuestions}
                    </span>
                    <span className="rounded-xl bg-slate-800 px-3 py-1 text-xs text-slate-300">
                      {currentQ.category} • {currentQ.topic}
                    </span>
                    <span className={`rounded-xl px-2.5 py-0.5 text-xs font-medium ${
                      currentQ.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      currentQ.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {currentQ.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 border border-slate-800 text-amber-400 font-mono font-bold">
                    <Clock size={16} />
                    {timeLeft != null ? `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}` : '00:00'}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${((current + 1) / test.totalQuestions) * 100}%` }}
                  />
                </div>

                {/* Question Statement */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
                  <p className="text-base sm:text-lg font-medium text-slate-100 whitespace-pre-line leading-relaxed">
                    {currentQ.question}
                  </p>
                </div>

                {/* Options List */}
                <div className="space-y-3">
                  {currentQ.options.map((opt: string, idx: number) => {
                    const isSelected = answers[currentQ.id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => selectOption(currentQ.id, idx)}
                        className={`w-full text-left rounded-2xl p-4 border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-500 bg-blue-600/15 text-white shadow-md'
                            : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-sm sm:text-base font-normal">{opt}</span>
                        </div>
                        {isSelected && <Check size={18} className="text-blue-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMark(currentQ.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                        marked[currentQ.id]
                          ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Flag size={14} /> {marked[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={current === 0}
                      onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                      className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>

                    {current < test.totalQuestions - 1 ? (
                      <button
                        onClick={() => setCurrent((c) => Math.min(test.totalQuestions - 1, c + 1))}
                        className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-blue-600 text-sm font-medium text-white hover:bg-blue-500"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to submit your test?')) submitTest();
                        }}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500 shadow-lg"
                      >
                        <CheckCircle2 size={16} /> Submit Test
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Grid Sidebar */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Question Palette</h3>
                  <p className="mt-1 text-xs text-slate-500">Jump directly to any question</p>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {test.questions.map((q: any, i: number) => {
                    const isAnswered = answers[q.id] != null;
                    const isMarked = marked[q.id];
                    const isCurrent = i === current;

                    let bgClass = 'bg-slate-950 border-slate-800 text-slate-400';
                    if (isCurrent) bgClass = 'border-2 border-blue-500 text-white font-bold bg-slate-800';
                    else if (isMarked) bgClass = 'bg-amber-500/20 border-amber-500/40 text-amber-300';
                    else if (isAnswered) bgClass = 'bg-blue-600 border-blue-500 text-white';

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrent(i)}
                        className={`h-10 w-full rounded-xl border text-xs transition flex items-center justify-center ${bgClass}`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="space-y-2 pt-4 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600" /> Answered ({Object.keys(answers).length})
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500/40" /> Marked for Review ({Object.values(marked).filter(Boolean).length})
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-950 border border-slate-800" /> Unanswered ({test.totalQuestions - Object.keys(answers).length})
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Complete and submit your aptitude test now?')) submitTest();
                  }}
                  className="w-full rounded-xl bg-emerald-600/90 hover:bg-emerald-600 py-3 text-sm font-semibold text-white transition shadow-md"
                >
                  Submit Test Now
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: SOLUTIONS & DETAILED EXPLANATION REVIEW */}
      {(activeTab === 'solutions' || (result && activeTab === 'test')) && result && (
        <div className="space-y-6">
          {/* Result Score Banner */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-400">Score</p>
                <p className="mt-2 text-4xl font-extrabold text-emerald-400">{result.attempt?.score} / {result.attempt?.total}</p>
                <p className="mt-1 text-xs text-slate-500">Correct Answers</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-400">Accuracy Rate</p>
                <p className="mt-2 text-4xl font-extrabold text-blue-400">{result.attempt?.accuracy}%</p>
                <p className="mt-1 text-xs text-slate-500">Overall Precision</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-center">
                <p className="text-xs uppercase tracking-wider text-slate-400">Time Spent</p>
                <p className="mt-2 text-4xl font-extrabold text-amber-400">
                  {Math.floor((result.attempt?.timeSpentSec || 0) / 60)}m {(result.attempt?.timeSpentSec || 0) % 60}s
                </p>
                <p className="mt-1 text-xs text-slate-500">Test Duration</p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-center flex flex-col items-center justify-center gap-2">
                <button
                  onClick={resetTest}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-2.5 text-sm font-semibold text-white shadow-md transition"
                >
                  <RotateCcw size={16} className="inline mr-1.5" /> Start New Test
                </button>
              </div>
            </div>

            {/* Category Performance Pills */}
            <div className="border-t border-slate-800 pt-6">
              <h4 className="text-sm font-semibold text-slate-300 mb-3">Category Breakdown</h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(result.attempt?.categoryStats || {}).map(([cat, stat]: any) => (
                  <div key={cat} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                    <p className="text-xs font-semibold text-slate-300">{cat}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>{stat.correct} / {stat.total} Correct</span>
                      <span className="font-bold text-emerald-400">{stat.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Solutions Section Header & Filter */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-400" /> Step-by-Step Question Solutions
                </h3>
                <p className="mt-1 text-xs text-slate-400">Review answers, mathematical formulas, and logical reasoning steps for all 20 questions.</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                {(['all', 'correct', 'incorrect', 'unanswered'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSolutionFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                      solutionFilter === filter ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {filter} ({filter === 'all' ? result.questionDetails?.length : result.questionDetails?.filter((q: any) => filter === 'correct' ? q.isCorrect : filter === 'incorrect' ? (!q.isCorrect && q.selectedIndex !== -1) : q.selectedIndex === -1).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List with Step-by-step explanations */}
            <div className="space-y-6">
              {filteredSolutions.map((q: any, idx: number) => (
                <div key={q.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-slate-800 text-xs font-bold flex items-center justify-center text-slate-300">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{q.category} • {q.topic}</span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                      q.isCorrect ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                      q.selectedIndex === -1 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                      'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {q.isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {q.isCorrect ? 'Correct' : q.selectedIndex === -1 ? 'Unanswered' : 'Incorrect'}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-medium text-slate-100 whitespace-pre-line">{q.question}</p>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt: string, optIdx: number) => {
                      const isUserSelected = q.selectedIndex === optIdx;
                      const isCorrectAnswer = q.correctIndex === optIdx;

                      let optStyle = 'border-slate-800 bg-slate-900/40 text-slate-400';
                      if (isCorrectAnswer) optStyle = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200 font-semibold';
                      else if (isUserSelected && !q.isCorrect) optStyle = 'border-rose-500/60 bg-rose-500/10 text-rose-200';

                      return (
                        <div key={optIdx} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                          </div>
                          {isCorrectAnswer && <span className="text-xs text-emerald-400 font-bold">(Correct)</span>}
                          {isUserSelected && !isCorrectAnswer && <span className="text-xs text-rose-400 font-bold">(Your Choice)</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-1.5 text-xs text-slate-300">
                    <p className="font-semibold text-blue-300 flex items-center gap-1.5">
                      <Sparkles size={14} /> Step-by-Step Solution & Explanation:
                    </p>
                    <p className="whitespace-pre-line leading-relaxed font-sans text-slate-300">{q.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PERFORMANCE INSIGHTS & AI ROADMAP DASHBOARD */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {analytics ? (
            <>
              {/* Top Overview Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Tests Attempted</span>
                    <BrainCircuit size={18} className="text-blue-400" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-white">{analytics.testsAttempted}</p>
                  <p className="mt-1 text-xs text-slate-500">{analytics.totalQuestionsAttempted} Total Questions Solved</p>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Average Score</span>
                    <Target size={18} className="text-sky-400" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-sky-400">{analytics.averageScore} / 20</p>
                  <p className="mt-1 text-xs text-slate-500">Mean Test Score</p>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Best Score</span>
                    <Award size={18} className="text-amber-400" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-amber-400">{analytics.bestScore} / 20</p>
                  <p className="mt-1 text-xs text-slate-500">Personal Peak Record</p>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Overall Accuracy</span>
                    <TrendingUp size={18} className="text-emerald-400" />
                  </div>
                  <p className="mt-3 text-3xl font-extrabold text-emerald-400">{analytics.overallAccuracy}%</p>
                  <p className="mt-1 text-xs text-slate-500">Lifetime Precision</p>
                </div>
              </div>

              {/* Strengths and Weaknesses Pills */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
                  <h3 className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 size={18} /> Topic Strengths (≥75% Accuracy)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analytics.strengths && analytics.strengths.length > 0 ? (
                      analytics.strengths.map((s: any) => (
                        <span key={s.topic} className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-300 font-medium">
                          {s.topic} ({s.accuracy}%)
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">Keep practicing to identify strong topics.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
                  <h3 className="text-base font-semibold text-rose-400 flex items-center gap-2">
                    <AlertTriangle size={18} /> Weak Areas (&lt;60% Accuracy)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analytics.weaknesses && analytics.weaknesses.length > 0 ? (
                      analytics.weaknesses.map((w: any) => (
                        <span key={w.topic} className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 text-xs text-rose-300 font-medium">
                          {w.topic} ({w.accuracy}%)
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">No critical weak areas detected! Excellent work.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* AI-Generated Personalized Placement Roadmap */}
              <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="text-blue-400" size={20} /> AI-Generated Personalized Placement Roadmap
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">Custom tailored preparation strategy based on your historical test attempts and topic weaknesses.</p>
                </div>

                <div className="space-y-4">
                  {analytics.roadmap && analytics.roadmap.map((item: any) => (
                    <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            item.priority === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {item.priority} Priority
                          </span>
                          <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                        </div>
                        <span className="text-xs text-slate-500">Est. {item.estimatedHours} hrs</span>
                      </div>

                      <p className="text-xs text-slate-400">{item.description}</p>

                      <div className="space-y-1.5 pt-2">
                        <p className="text-xs font-semibold text-blue-300">Action Items:</p>
                        <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1">
                          {item.actionableSteps.map((step: string, i: number) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center text-slate-400">
              <p>Loading analytics data...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CodingPage() {
  const [activeTab, setActiveTab] = useState<'editor' | 'leaderboard' | 'history'>('editor');

  // Assessment Session State
  const [session, setSession] = useState<any>(null);
  const [activeQIndex, setActiveQIndex] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'cpp' | 'java' | 'python'>('python');
  const [fontSize, setFontSize] = useState<number>(14);

  // Solution Drafts for 4 Questions (independent code per language)
  const [solutions, setSolutions] = useState<
    Record<
      string,
      {
        selectedLanguage: 'cpp' | 'java' | 'python';
        codes: {
          python: string;
          cpp: string;
          java: string;
        };
        isSubmitted?: boolean;
        evaluation?: any;
      }
    >
  >({});

  // Validation Warnings
  const [submissionWarning, setSubmissionWarning] = useState<string | null>(null);

  // Timer (90 mins = 5400 seconds)
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Console Drawer & Output
  const [activeDrawerTab, setActiveDrawerTab] = useState<'testcases' | 'aieval'>('testcases');
  const [customInput, setCustomInput] = useState<string>('');
  const [runResults, setRunResults] = useState<any>(null);
  const [evalResults, setEvalResults] = useState<any>(null);

  // Loading States
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [isSubmittingQ, setIsSubmittingQ] = useState<boolean>(false);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState<boolean>(false);

  // Results & History
  const [finalAttempt, setFinalAttempt] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedHistoryAttempt, setSelectedHistoryAttempt] = useState<any>(null);

  // Helper to check if code is empty or default starter code
  const checkIsStarterCode = (code: string) => {
    if (!code || code.trim().length === 0) return true;
    const cleaned = code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .replace(/#.*/g, '')
      .replace(/import\s+.*/g, '')
      .replace(/from\s+.*/g, '')
      .replace(/using\s+namespace\s+std;/g, '')
      .replace(/class\s+\w+[\s\S]*?/g, '')
      .replace(/def\s+\w+[\s\S]*?/g, '')
      .replace(/pass/g, '')
      .replace(/return\s*(?:\{\}|new\s+int\[\]\{\}|new\s+ArrayList<>\(\)|0|null|nullptr|true|false|"");?/g, '')
      .replace(/[\{\}\s\(\);:]/g, '');

    return cleaned.length < 5;
  };

  // Start / Load Assessment Session on Mount
  const startNewAssessment = async (attemptId?: string) => {
    setLoadingSession(true);
    setFinalAttempt(null);
    setRunResults(null);
    setEvalResults(null);
    setSubmissionWarning(null);
    try {
      const data: any = await api.post('/coding/assessment/start', { attemptId });
      setSession(data);
      setActiveQIndex(0);

      // Initialize code templates for questions
      const initialSolutions: Record<string, any> = {};
      data.questions.forEach((q: any) => {
        initialSolutions[q.id] = {
          selectedLanguage: 'python',
          codes: {
            python: q.starterCode?.python || `# Write Python solution for ${q.title}`,
            cpp: q.starterCode?.cpp || `// Write C++ solution for ${q.title}`,
            java: q.starterCode?.java || `// Write Java solution for ${q.title}`,
          },
          isSubmitted: false,
        };
      });
      setSolutions(initialSolutions);

      // Start 90-minute countdown
      const remainingSec = Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000));
      setTimeLeft(remainingSec > 0 ? remainingSec : 5400);
      setIsTimerRunning(true);
    } catch (err) {
      console.error('Failed to start coding session:', err);
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    startNewAssessment();
  }, []);

  // Timer Tick Logic
  useEffect(() => {
    if (!isTimerRunning || timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit(); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      api.get('/coding/leaderboard').then((res) => setLeaderboard(res as any[])).catch(console.error);
    } else if (activeTab === 'history') {
      api.get('/coding/history').then((res) => setHistory(res as any[])).catch(console.error);
    }
  }, [activeTab]);

  const currentQ = session?.questions?.[activeQIndex];
  const currentSolution = currentQ ? solutions[currentQ.id] : null;
  const currentSolutionCode =
    currentSolution?.codes?.[selectedLanguage] ||
    currentQ?.starterCode?.[selectedLanguage] ||
    '';

  // Handle Language Change for Current Question
  const handleLanguageChange = (lang: 'cpp' | 'java' | 'python') => {
    setSelectedLanguage(lang);
    setSubmissionWarning(null);
    if (!currentQ) return;

    setSolutions((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedLanguage: lang,
      },
    }));
  };

  // Update Code in Editor
  const handleCodeChange = (newCode: string) => {
    setSubmissionWarning(null);
    if (!currentQ) return;
    setSolutions((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selectedLanguage,
        codes: {
          ...(prev[currentQ.id]?.codes || {
            python: currentQ.starterCode?.python || '',
            cpp: currentQ.starterCode?.cpp || '',
            java: currentQ.starterCode?.java || '',
          }),
          [selectedLanguage]: newCode,
        },
      },
    }));
  };

  // Run Code against sample test cases
  const handleRunCode = async () => {
    if (!currentQ || !currentSolutionCode) return;
    setSubmissionWarning(null);

    if (checkIsStarterCode(currentSolutionCode)) {
      setSubmissionWarning('Please write your solution code before running test cases.');
      return;
    }

    setIsRunningCode(true);
    setRunResults(null);
    setActiveDrawerTab('testcases');

    try {
      const data = await api.post('/coding/run', {
        questionId: currentQ.id,
        language: selectedLanguage,
        code: currentSolutionCode,
        customInput: customInput.trim() || undefined,
      });
      setRunResults(data);
    } catch (err: any) {
      setSubmissionWarning(err?.message || 'Run code failed');
    } finally {
      setIsRunningCode(false);
    }
  };

  // Submit Question Solution
  const handleSubmitQuestion = async () => {
    if (!currentQ || !currentSolutionCode) return;
    setSubmissionWarning(null);

    if (checkIsStarterCode(currentSolutionCode)) {
      setSubmissionWarning('Please write your solution before submitting. Empty or default starter code cannot be evaluated.');
      return;
    }

    setIsSubmittingQ(true);
    setEvalResults(null);

    try {
      const evalData = await api.post('/coding/submit-question', {
        questionId: currentQ.id,
        language: selectedLanguage,
        code: currentSolutionCode,
      });

      setEvalResults(evalData);
      setActiveDrawerTab('aieval');

      // Update solution draft as submitted
      setSolutions((prev) => ({
        ...prev,
        [currentQ.id]: {
          ...prev[currentQ.id],
          isSubmitted: true,
          evaluation: evalData,
        },
      }));
    } catch (err: any) {
      setSubmissionWarning(err?.message || 'Submit question failed');
    } finally {
      setIsSubmittingQ(false);
    }
  };

  // Final Assessment Submission
  const handleFinalSubmit = async () => {
    if (!session) return;
    setIsSubmittingAssessment(true);
    try {
      // Map solutions to payload with selected code per question
      const payloadSolutions: Record<string, any> = {};
      Object.entries(solutions).forEach(([qId, draft]) => {
        payloadSolutions[qId] = {
          language: draft.selectedLanguage || 'python',
          code: draft.codes?.[draft.selectedLanguage || 'python'] || '',
          isSubmitted: draft.isSubmitted,
          evaluation: draft.evaluation,
        };
      });

      const data = await api.post('/coding/assessment/submit', {
        assessmentId: session.assessmentId,
        startTime: session.startTime,
        questions: session.questions,
        solutions: payloadSolutions,
      });

      setFinalAttempt(data);
      setIsTimerRunning(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to submit assessment');
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Header & Navigation Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-600/20 p-2.5 text-blue-400 border border-blue-500/20">
            <Code2 size={24} />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-0.5 text-xs font-medium text-blue-300 mb-1">
              <Zap size={14} /> LeetCode & HackerRank Standard Assessment Engine
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">DSA Coding Assessment</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 90-Minute Timer */}
          {session && (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2 border font-mono font-bold text-sm ${
              timeLeft != null && timeLeft < 600
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-amber-400'
            }`}>
              <Clock size={16} />
              <span>{timeLeft != null ? formatTime(timeLeft) : '90:00'}</span>
            </div>
          )}

          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'editor' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code size={14} /> Assessment Platform
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'leaderboard' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy size={14} /> Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                activeTab === 'history' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 size={14} /> Assessment History
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'editor' && (
        <>
          {loadingSession ? (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-16 text-center space-y-4">
              <RefreshCw className="animate-spin text-blue-500 mx-auto" size={32} />
              <p className="text-sm font-semibold text-slate-300">Generating unique 4-question DSA assessment...</p>
            </div>
          ) : session && currentQ ? (
            <div className="space-y-4">
              {/* Question Navigation Bar (Question 1 - 4) */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {session.questions.map((q: any, idx: number) => {
                    const sol = solutions[q.id];
                    const isPassed = sol?.evaluation?.correctnessScore >= 100;
                    const isSubmitted = sol?.isSubmitted;
                    const isActive = idx === activeQIndex;

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setActiveQIndex(idx);
                          setRunResults(null);
                          setEvalResults(sol?.evaluation || null);
                          setSubmissionWarning(null);
                        }}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                          isActive
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                            : isPassed
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : isSubmitted
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        <span>Q{idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          q.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
                          q.difficulty === 'hard' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {q.difficulty}
                        </span>
                        {isPassed && <CheckCircle2 size={14} className="text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={activeQIndex === 0}
                    onClick={() => {
                      setActiveQIndex((prev) => Math.max(0, prev - 1));
                      setSubmissionWarning(null);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-300 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={activeQIndex === session.questions.length - 1}
                    onClick={() => {
                      setActiveQIndex((prev) => Math.min(session.questions.length - 1, prev + 1));
                      setSubmissionWarning(null);
                    }}
                    className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-300 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <button
                    onClick={handleFinalSubmit}
                    disabled={isSubmittingAssessment}
                    className="ml-2 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-50"
                  >
                    <Send size={14} /> Submit Full Assessment
                  </button>
                </div>
              </div>

              {/* Warning Banner */}
              {submissionWarning && (
                <div className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-300 font-medium">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
                    <span>{submissionWarning}</span>
                  </div>
                  <button onClick={() => setSubmissionWarning(null)} className="text-amber-400 hover:text-white font-bold ml-2">✕</button>
                </div>
              )}

              {/* Main Split Grid (Problem Left, Code Editor Right) */}
              <div className="grid gap-6 lg:grid-cols-12">
                {/* Left Panel: Problem Statement */}
                <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 max-h-[750px] overflow-y-auto custom-scrollbar">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
                        {currentQ.topic}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                        currentQ.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        currentQ.difficulty === 'hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {currentQ.difficulty}
                      </span>
                    </div>

                    <h2 className="mt-3 text-2xl font-bold text-white">{currentQ.title}</h2>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-mono">
                      <span>Expected Time: <strong className="text-slate-200">{currentQ.expectedTimeComplexity}</strong></span>
                      <span>Expected Space: <strong className="text-slate-200">{currentQ.expectedSpaceComplexity}</strong></span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-800 pt-4">
                    <h3 className="text-sm font-semibold text-white">Problem Description</h3>
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                      {currentQ.description}
                    </p>
                  </div>

                  {/* Examples */}
                  <div className="space-y-4 border-t border-slate-800 pt-4">
                    <h3 className="text-sm font-semibold text-white">Examples</h3>
                    {currentQ.examples.map((ex: any, idx: number) => (
                      <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2 text-xs font-mono">
                        <p className="text-slate-400"><strong className="text-blue-400">Input:</strong> {ex.input}</p>
                        <p className="text-slate-400"><strong className="text-emerald-400">Output:</strong> {ex.output}</p>
                        {ex.explanation && <p className="text-slate-500 font-sans text-[11px] pt-1">Explanation: {ex.explanation}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  <div className="space-y-2 border-t border-slate-800 pt-4">
                    <h3 className="text-sm font-semibold text-white">Constraints</h3>
                    <ul className="list-disc pl-5 text-xs text-slate-400 space-y-1 font-mono">
                      {currentQ.constraints.map((c: string, idx: number) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Panel: Monaco-Style Code Editor & Console */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Editor Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <FileCode2 size={18} className="text-blue-400" />
                      <select
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value as any)}
                        className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none"
                      >
                        <option value="python">Python 3</option>
                        <option value="cpp">C++ (GCC 11)</option>
                        <option value="java">Java 17</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                        <span>Font:</span>
                        <select
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-slate-300"
                        >
                          <option value={12}>12px</option>
                          <option value={14}>14px</option>
                          <option value={16}>16px</option>
                        </select>
                      </div>

                      <button
                        onClick={handleRunCode}
                        disabled={isRunningCode}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
                      >
                        <Play size={14} className="text-emerald-400" />
                        {isRunningCode ? 'Running...' : 'Run Code'}
                      </button>

                      <button
                        onClick={handleSubmitQuestion}
                        disabled={isSubmittingQ}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition shadow disabled:opacity-50"
                      >
                        <Send size={14} />
                        {isSubmittingQ ? 'Evaluating...' : 'Submit Question'}
                      </button>
                    </div>
                  </div>

                  {/* Monaco-Style Dark Editor Window */}
                  <div className="relative rounded-3xl border border-slate-800 bg-[#0d1117] p-4 shadow-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
                      <span>solution.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'cpp' ? 'cpp' : 'java'}</span>
                      <span className="text-emerald-400">UTF-8 • Monaco Kernel</span>
                    </div>

                    <div className="flex gap-4 pt-4 font-mono" style={{ fontSize: `${fontSize}px` }}>
                      {/* Line Numbers Gutter */}
                      <div className="select-none text-slate-600 text-right pr-2 space-y-1">
                        {Array.from({ length: Math.max(16, currentSolutionCode.split('\n').length) }).map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>

                      {/* Code Textarea */}
                      <textarea
                        value={currentSolutionCode}
                        onChange={(e) => handleCodeChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Tab') {
                            e.preventDefault();
                            const val = e.currentTarget.value;
                            const start = e.currentTarget.selectionStart;
                            const end = e.currentTarget.selectionEnd;
                            e.currentTarget.value = val.substring(0, start) + '    ' + val.substring(end);
                            e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 4;
                            handleCodeChange(e.currentTarget.value);
                          }
                        }}
                        className="w-full h-[380px] bg-transparent text-slate-100 resize-none focus:outline-none leading-relaxed custom-scrollbar font-mono"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  {/* Console & AI Evaluation Output Drawer */}
                  <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveDrawerTab('testcases')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            activeDrawerTab === 'testcases' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Terminal size={14} /> Test Results {runResults && `(${runResults.testResults.filter((t: any) => t.passed).length}/${runResults.testResults.length})`}
                        </button>
                        <button
                          onClick={() => setActiveDrawerTab('aieval')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            activeDrawerTab === 'aieval' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Cpu size={14} className="text-blue-400" /> AI Evaluation & Complexity
                        </button>
                      </div>

                      <span className="text-[11px] font-mono text-slate-500">Live Console Output</span>
                    </div>

                    {activeDrawerTab === 'testcases' && (
                      <div className="space-y-3 font-mono text-xs">
                        <div className="space-y-1 font-sans">
                          <label className="text-[11px] font-semibold text-slate-400">Custom Testcase Input (Optional):</label>
                          <input
                            type="text"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="e.g. [2, 7, 11, 15] or sample text"
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none font-mono"
                          />
                        </div>

                        {runResults ? (
                          <div className="space-y-3">
                            {runResults.testResults.map((t: any, idx: number) => (
                              <div
                                key={idx}
                                className={`rounded-xl border p-3 space-y-1.5 ${
                                  t.passed ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'
                                }`}
                              >
                                <div className="flex items-center justify-between font-sans">
                                  <span className={`font-bold ${t.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {t.passed ? '✓ Test Case Passed' : '✗ Test Case Failed'}
                                  </span>
                                  <span className="text-slate-400 text-[11px]">{t.runtimeMs} ms</span>
                                </div>
                                <p className="text-slate-300">Input: <span className="text-white">{t.input}</span></p>
                                <p className="text-slate-300">Expected: <span className="text-emerald-300">{t.expectedOutput}</span></p>
                                <p className="text-slate-300">Actual: <span className="text-slate-100">{t.actualOutput}</span></p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic py-2">Click "Run Code" to execute your solution against visible test cases.</p>
                        )}
                      </div>
                    )}

                    {activeDrawerTab === 'aieval' && (
                      <div className="space-y-4 font-sans text-xs">
                        {evalResults ? (
                          evalResults.isEmptyCode ? (
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
                              <p className="font-bold text-amber-400 flex items-center gap-1.5">
                                <AlertTriangle size={16} /> No Solution Submitted
                              </p>
                              <p className="text-amber-200/90 text-xs">
                                AI evaluation cannot be generated because no solution code was provided. Please write your code in the editor before submitting.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                                  <p className="text-slate-400 text-[11px]">Correctness</p>
                                  <p className={`text-lg font-bold mt-1 ${evalResults.correctnessScore >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    {evalResults.correctnessScore}%
                                  </p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                                  <p className="text-slate-400 text-[11px]">Time Complexity</p>
                                  <p className="text-sm font-mono font-bold text-blue-400 mt-1">{evalResults.actualTimeComplexity}</p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                                  <p className="text-slate-400 text-[11px]">Space Complexity</p>
                                  <p className="text-sm font-mono font-bold text-violet-400 mt-1">{evalResults.actualSpaceComplexity}</p>
                                </div>
                                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                                  <p className="text-slate-400 text-[11px]">Code Quality</p>
                                  <p className="text-lg font-bold text-amber-400 mt-1">{evalResults.codeQuality.score}/100</p>
                                </div>
                              </div>

                              {/* Mistake Breakdown & Complexity Comparison */}
                              <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                                <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                                  <Sparkles size={14} className="text-blue-400" /> Mistake & Complexity Breakdown:
                                </p>
                                <p className="text-slate-300 leading-relaxed text-xs">{evalResults.mistakeAnalysis}</p>
                                {evalResults.complexityComparison && (
                                  <p className="text-xs text-slate-400 font-mono pt-1">{evalResults.complexityComparison}</p>
                                )}
                              </div>

                              {/* AI Optimization Suggestions */}
                              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
                                <p className="font-semibold text-slate-200">AI Optimization Suggestions:</p>
                                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                                  {evalResults.suggestions.map((s: string, i: number) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )
                        ) : (
                          <p className="text-slate-500 italic py-2">Click "Submit Question" to evaluate correctness & AI complexity metrics.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* Leaderboard View */}
      {activeTab === 'leaderboard' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="text-amber-400" size={24} /> Global DSA Coding Leaderboard
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Only users who have successfully completed an assessment appear on the leaderboard. Ranked by score, accuracy, and speed.
              </p>
            </div>
            <button onClick={() => api.get('/coding/leaderboard').then((res) => setLeaderboard(res as any[]))} className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Solved</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Total Score</th>
                  <th className="py-3 px-4">Time Taken</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {leaderboard.length > 0 ? (
                  leaderboard.map((item: any) => (
                    <tr key={item.userId} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-bold">
                        {item.rank === 1 ? '🥇 #1' : item.rank === 2 ? '🥈 #2' : item.rank === 3 ? '🥉 #3' : `#${item.rank}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={item.profileImage} alt={item.userName} className="w-7 h-7 rounded-full border border-slate-700" />
                          <div>
                            <p className="font-semibold text-white">{item.userName}</p>
                            <p className="text-[10px] text-slate-400">{item.userEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-300">{item.solvedCount} / 4</td>
                      <td className="py-3.5 px-4 font-bold text-blue-400">{item.accuracy || 100}%</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{item.totalScore} / 400</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{Math.floor(item.durationSeconds / 60)}m {item.durationSeconds % 60}s</td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(item.attemptedAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 italic">No leaderboard entries yet. Complete a coding assessment to claim rank #1!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History View */}
      {activeTab === 'history' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="text-blue-400" size={24} /> Assessment History
              </h2>
              <p className="text-xs text-slate-400 mt-1">Detailed history of all genuine DSA coding assessment attempts.</p>
            </div>
            <button onClick={() => api.get('/coding/history').then((res) => setHistory(res as any[]))} className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-300">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((h: any) => (
                <div key={h.attemptId} className="rounded-2xl border border-slate-800 bg-slate-950 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                        h.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        h.status === 'Incomplete' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {h.status || 'Completed'}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-sm">DSA Assessment Attempt #{h.attemptId.slice(-6)}</h4>
                        <p className="text-xs text-slate-400">{new Date(h.completedAt || h.startTime).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <p className="text-slate-400">Total Score</p>
                        <p className="text-base font-bold text-emerald-400">{h.totalScore} / 400</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Solved</p>
                        <p className="text-base font-bold text-blue-400">{h.solvedQuestionsCount} / 4</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Duration</p>
                        <p className="text-base font-mono font-bold text-slate-300">{Math.floor((h.durationSeconds || 0) / 60)}m</p>
                      </div>
                      <button
                        onClick={() => setSelectedHistoryAttempt(selectedHistoryAttempt?.attemptId === h.attemptId ? null : h)}
                        className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
                      >
                        {selectedHistoryAttempt?.attemptId === h.attemptId ? 'Hide Details' : 'View Code & Feedback'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded History Details */}
                  {selectedHistoryAttempt?.attemptId === h.attemptId && (
                    <div className="space-y-3 pt-2">
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Assigned Questions & Solutions:</h5>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {Object.entries(h.questionSolutions || {}).map(([qId, sol]: any) => (
                          <div key={qId} className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">Question ID: {qId}</span>
                              <span className={`font-bold ${sol?.evaluation?.correctnessScore >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {sol?.evaluation?.correctnessScore || 0}% Passed
                              </span>
                            </div>
                            <p className="text-slate-400 font-mono text-[11px]">Language: {sol?.language || 'python'}</p>
                            <div className="rounded-lg bg-slate-950 p-2.5 max-h-32 overflow-y-auto custom-scrollbar font-mono text-[11px] text-slate-300 whitespace-pre-wrap">
                              {sol?.code || 'No code submitted.'}
                            </div>
                            {sol?.evaluation?.mistakeAnalysis && (
                              <p className="text-slate-400 text-[11px] pt-1">
                                <strong className="text-slate-300">Feedback:</strong> {sol.evaluation.mistakeAnalysis}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic text-center py-6">No previous attempts recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* Final Results Modal */}
      {finalAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
          <div className="w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="text-center space-y-2">
              <div className="inline-flex rounded-xl bg-emerald-500/20 p-3 text-emerald-400 border border-emerald-500/20 mb-2">
                <Trophy size={32} />
              </div>
              <h2 className="text-3xl font-extrabold text-white">Assessment Complete!</h2>
              <p className="text-sm text-slate-400">Here is your performance breakdown across all 4 DSA topics</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Total Score</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">{finalAttempt.totalScore} <span className="text-sm text-slate-500">/ 400</span></p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Solved Questions</p>
                <p className="text-3xl font-extrabold text-blue-400 mt-1">{finalAttempt.solvedQuestionsCount} <span className="text-sm text-slate-500">/ 4</span></p>
              </div>
            </div>

            <div className="space-y-3 border-t border-slate-800 pt-4">
              <h3 className="text-sm font-semibold text-white">Topic Performance:</h3>
              {Object.entries(finalAttempt.topicBreakdown || {}).map(([topic, data]: any) => (
                <div key={topic} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs">
                  <span className="font-semibold text-slate-300">{topic}</span>
                  <span className={`font-bold ${data.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {data.score} / 100 ({data.passed ? 'PASSED' : 'PARTIAL'})
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setFinalAttempt(null);
                  setActiveTab('leaderboard');
                }}
                className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 transition"
              >
                View Leaderboard
              </button>
              <button
                onClick={() => startNewAssessment()}
                className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 hover:bg-slate-800"
              >
                New Attempt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CoachPage() {
  return <CoachModule />;
}

function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetLink('');
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
      if (res.resetLink) setResetLink(res.resetLink);
    } catch (err: any) {
      setError(err?.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex rounded-xl bg-blue-600/20 p-3 text-blue-400 border border-blue-500/20 mb-2">
            <KeyRound size={28} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Reset your password</h2>
          <p className="text-xs text-slate-400">Enter your email address and we'll send you a password reset link.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />
            </div>
          </div>

          {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</p>}
          {message && (
            <div className="space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-300">
              <p className="font-semibold">{message}</p>
              {resetLink && (
                <div className="pt-2 border-t border-emerald-500/20 space-y-1">
                  <p className="text-slate-400 font-mono text-[11px]">Development Reset Link:</p>
                  <Link to={resetLink} className="font-mono text-blue-400 underline break-all block">
                    {window.location.origin}{resetLink}
                  </Link>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 font-semibold text-white transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'Sending Request...' : 'Send Password Reset Link'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Remembered your password?{' '}
          <Link to="/login" className="font-semibold text-blue-400 hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Invalid or missing password reset token.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex rounded-xl bg-blue-600/20 p-3 text-blue-400 border border-blue-500/20 mb-2">
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Create New Password</h2>
          <p className="text-xs text-slate-400">Enter a new secure password for your account.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">New Password</label>
            <div className="relative">
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-4 pr-12 py-3 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 chars (uppercase, lowercase, symbol)"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 py-3 font-semibold text-white transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <img
            src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            alt={user.name}
            className="w-24 h-24 rounded-full border-2 border-blue-500/40 object-cover shadow-xl"
          />
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h2 className="text-2xl font-bold text-white tracking-tight">{user.name}</h2>
              <span className="rounded-full bg-blue-600/20 border border-blue-500/30 px-3 py-0.5 text-xs font-semibold text-blue-300 capitalize">
                {user.role}
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck size={14} /> Verified Account
              </span>
            </div>
            <p className="text-sm text-slate-400 flex items-center justify-center sm:justify-start gap-2">
              <Mail size={16} /> {user.email}
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
            <h3 className="font-semibold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Lock size={16} className="text-blue-400" /> Authentication Provider
            </h3>
            <div className="flex items-center gap-3 pt-1">
              {user.provider === 'google' ? (
                <span className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
                  </svg>
                  Google OAuth 2.0
                </span>
              ) : user.provider === 'linkedin' ? (
                <span className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                  LinkedIn OAuth
                </span>
              ) : (
                <span className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 flex items-center gap-2">
                  <Mail size={16} className="text-blue-400" /> Standard Email & Password
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 space-y-3">
            <h3 className="font-semibold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} className="text-blue-400" /> Account Security & Session
            </h3>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p>Last login: <span className="text-slate-200 font-medium">{new Date(user.lastLoginAt).toLocaleString()}</span></p>
              <p>Account created: <span className="text-slate-200 font-medium">{new Date(user.createdAt).toLocaleDateString()}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
      <Route path="/reset-password" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />

      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/resume" element={<ProtectedRoute><Layout><ResumePage /></Layout></ProtectedRoute>} />
      <Route path="/interview" element={<ProtectedRoute><Layout><InterviewPage /></Layout></ProtectedRoute>} />
      <Route path="/coding" element={<ProtectedRoute><Layout><CodingPage /></Layout></ProtectedRoute>} />
      <Route path="/aptitude" element={<ProtectedRoute><Layout><AptitudePage /></Layout></ProtectedRoute>} />
      <Route path="/coach" element={<ProtectedRoute><Layout><CoachPage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
