import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// SVG Icons
const ShieldIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#00F2FF"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#00FF41"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#7000FF"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#FF6B35"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithEmail, registerWithEmail, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Handle Email/Password Auth
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
      // Small delay to ensure auth state updates in context
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      // Small delay to ensure auth state updates in context
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Data Grid Background */}
      <div className="data-grid-bg"></div>
      
      {/* Scan Line */}
      <div className="scan-line"></div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#7000FF]/10 rounded-full blur-3xl translate-x-48 -translate-y-48"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00F2FF]/10 rounded-full blur-3xl -translate-x-40 translate-y-40"></div>

      <div className="w-full max-w-md relative z-10 fade-in-up">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F2FF] to-[#7000FF] opacity-30 blur-xl"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-[#00F2FF] to-[#7000FF] flex items-center justify-center text-[#05070A]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              <ShieldIcon />
            </div>
          </div>
          <h1 className="text-2xl font-mono font-bold text-[#E8EAED] mb-1 tracking-wider">NEURAL LEDGER</h1>
          <p className="text-[#5F6368] text-xs font-mono tracking-widest">SECURE ACCESS TERMINAL</p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel rounded-lg p-8 relative border border-[rgba(255,255,255,0.08)]">
          
          {/* Corner Decorations */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#00F2FF]"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#00F2FF]"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#00F2FF]"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#00F2FF]"></div>
          
          {/* Tab Toggle */}
          <div className="flex gap-1 mb-6 p-1 bg-[#0a0d12] rounded border border-[rgba(255,255,255,0.08)]">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2 rounded font-mono text-xs tracking-wider transition-all ${
                isLogin
                  ? 'bg-[rgba(0,242,255,0.1)] text-[#00F2FF] border border-[#00F2FF]'
                  : 'text-[#5F6368] hover:text-[#9AA0A6]'
              }`}
            >
              AUTHENTICATE
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2 rounded font-mono text-xs tracking-wider transition-all ${
                !isLogin
                  ? 'bg-[rgba(0,242,255,0.1)] text-[#00F2FF] border border-[#00F2FF]'
                  : 'text-[#5F6368] hover:text-[#9AA0A6]'
              }`}
            >
              REGISTER
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-[rgba(255,107,53,0.1)] border border-[#FF6B35] rounded">
              <div className="flex items-center gap-2">
                <AlertIcon />
                <p className="text-[#FF6B35] text-xs font-mono">{error}</p>
              </div>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-4 mb-6">
            {/* Email Input */}
            <div>
              <label className="block text-[10px] font-mono text-[#5F6368] mb-2 tracking-wider">
                OPERATOR ID
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@neural.link"
                className="w-full px-4 py-3 bg-[#0a0d12] border border-[rgba(255,255,255,0.08)] rounded text-[#E8EAED] font-mono text-sm focus:border-[#00F2FF] focus:outline-none focus:shadow-[0_0_10px_rgba(0,242,255,0.2)] transition-all placeholder-[#3C4043]"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[10px] font-mono text-[#5F6368] mb-2 tracking-wider">
                ACCESS KEY
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access key"
                className="w-full px-4 py-3 bg-[#0a0d12] border border-[rgba(255,255,255,0.08)] rounded text-[#E8EAED] font-mono text-sm focus:border-[#00F2FF] focus:outline-none focus:shadow-[0_0_10px_rgba(0,242,255,0.2)] transition-all placeholder-[#3C4043]"
                required
                minLength="6"
              />
              {!isLogin && (
                <p className="text-[9px] text-[#5F6368] mt-1 font-mono tracking-wider">MINIMUM 6 CHARACTERS REQUIRED</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded font-mono text-xs tracking-wider transition-all btn-glitch ${
                loading
                  ? 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#5F6368] cursor-not-allowed'
                  : 'bg-[rgba(0,242,255,0.1)] border border-[#00F2FF] text-[#00F2FF] hover:bg-[rgba(0,242,255,0.2)] hover:shadow-[0_0_30px_rgba(0,242,255,0.3)]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="inline-block w-4 h-4 border border-[#00F2FF]/30 border-t-[#00F2FF] rounded-full animate-spin mr-2"></span>
                  {isLogin ? 'AUTHENTICATING...' : 'REGISTERING...'}
                </span>
              ) : (
                isLogin ? 'INITIATE SESSION' : 'CREATE PROFILE'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent"></div>
            <span className="text-[10px] text-[#5F6368] font-mono tracking-wider">ALTERNATE PROTOCOL</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent"></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full py-3 rounded font-mono text-xs tracking-wider border transition-all flex items-center justify-center gap-3 hover-liquid ${
              loading
                ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.08)] text-[#5F6368] cursor-not-allowed'
                : 'bg-[#0a0d12] border-[rgba(255,255,255,0.08)] text-[#E8EAED] hover:border-[rgba(255,255,255,0.15)]'
            }`}
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border border-[#5F6368]/30 border-t-[#5F6368] rounded-full animate-spin"></span>
            ) : (
              <>
                <GoogleIcon />
                GOOGLE AUTHENTICATION
              </>
            )}
          </button>
        </div>

        {/* Footer Info */}
        <p className="text-center text-xs text-[#5F6368] mt-6 font-mono tracking-wide">
          {isLogin ? "NO PROFILE? " : 'EXISTING OPERATOR? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#00F2FF] hover:text-[#00F2FF]/80 transition-colors"
          >
            {isLogin ? 'REGISTER NOW' : 'AUTHENTICATE'}
          </button>
        </p>
        
        {/* Status Line */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="status-node status-node-green"></div>
          <span className="text-[9px] font-mono text-[#5F6368] tracking-widest">SECURE CHANNEL ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
