import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Mail, Lock, AlertCircle, Loader2, Eye } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, registerWithEmail, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f2fcf8] px-4 text-[#141d1b]">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-100 blur-[90px]"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#b7eaff]/50 blur-[90px]"></div>

      <main className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Wallet className="h-7 w-7" />
            </div>
            <span className="font-headline text-2xl font-bold tracking-tight text-[#141d1b]">MoneyMitra AI</span>
          </div>
          <p className="font-headline text-xs font-semibold uppercase tracking-[0.2em] text-[#3d4a42]">Your AI Financial Companion</p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-8 panel-shadow">
          <div className="absolute left-0 top-0 h-1 w-full bg-[#dbe5e1]">
            <div className="gradient-emerald h-full w-1/2"></div>
          </div>

          <div className="mb-8 flex border-b border-emerald-100">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 pb-4 text-sm font-semibold transition ${
                isLogin ? 'border-b-2 border-emerald-700 text-emerald-700' : 'border-b-2 border-transparent text-[#6d7a72] hover:text-[#141d1b]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 pb-4 text-sm font-semibold transition ${
                !isLogin ? 'border-b-2 border-emerald-700 text-emerald-700' : 'border-b-2 border-transparent text-[#6d7a72] hover:text-[#141d1b]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-700" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`mb-6 flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
              loading
                ? 'cursor-not-allowed border-emerald-100 bg-[#ecf6f2] text-[#6d7a72]'
                : 'border-emerald-100 bg-white text-[#141d1b] hover:bg-[#ecf6f2]'
            }`}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative mb-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-100"></div>
            </div>
            <span className="relative bg-white px-4 text-xs font-medium text-[#6d7a72]">OR EMAIL</span>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div>
              <label className="mb-2 ml-1 block text-xs font-semibold text-[#3d4a42]">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d7a72]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-transparent bg-[#dbe5e1] py-3 pl-10 pr-4 text-sm text-[#141d1b] placeholder:text-[#6d7a72] focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 ml-1 block text-xs font-semibold text-[#3d4a42]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d7a72]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-transparent bg-[#dbe5e1] py-3 pl-10 pr-10 text-sm text-[#141d1b] placeholder:text-[#6d7a72] focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  required
                  minLength="6"
                />
                <Eye className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6d7a72]" />
              </div>
              {!isLogin && <p className="mt-1 text-xs text-[#6d7a72]">Password must be at least 6 characters</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl py-3.5 text-sm font-bold transition ${
                loading ? 'cursor-not-allowed bg-[#bccac0] text-white' : 'gradient-emerald text-white hover:brightness-105'
              }`}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        <div className="mt-7 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#ecf6f2] px-3 py-1.5 text-xs text-[#3d4a42]">
            <Lock className="h-3.5 w-3.5 text-emerald-700" />
            Your data is encrypted and secure
          </div>
          <p className="mt-3 text-xs text-[#6d7a72]">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-emerald-700 transition hover:text-emerald-800"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
