'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, ShieldCheck, User, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { auth, googleProvider, getFirebaseAuth } from '@/lib/firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/Components/LanguageToggle';

export default function LoginPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle redirect result if signInWithRedirect was used
  useEffect(() => {
    let isMounted = true;
    const handleRedirectResult = async () => {
      const fb = getFirebaseAuth();
      if (!fb.auth) return;
      try {
        const result = await getRedirectResult(fb.auth);
        if (result && result.user && isMounted) {
          const fbUser = result.user;
          setGoogleLoading(true);
          const res = await api.googleLogin({
            email: fbUser.email,
            name: fbUser.displayName || fbUser.email.split('@')[0],
            photoUrl: fbUser.photoURL || '',
            uid: fbUser.uid
          });

          if (res.token) {
            localStorage.setItem('wcc_token', res.token);
            localStorage.setItem('wcc_user', JSON.stringify(res.user));
            window.location.href = '/dashboard';
          }
        }
      } catch (err) {
        console.error('[Google Redirect Login Notice]', err);
      }
    };
    handleRedirectResult();
    return () => { isMounted = false; };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.token) {
        localStorage.setItem('wcc_token', res.token);
        localStorage.setItem('wcc_user', JSON.stringify(res.user));
        router.push('/dashboard');
      }
    } catch (err) {
      setError(
        lang === 'bn'
          ? (err.message || 'ভুল ইমেইল বা পাসওয়ার্ড দেওয়া হয়েছে।')
          : (err.message || 'Invalid email or password.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const fb = getFirebaseAuth();
      const currentAuth = fb.auth || auth;
      const currentProvider = fb.googleProvider || googleProvider;

      if (!currentAuth || !currentProvider) {
        throw new Error(lang === 'bn' ? 'গুগল অথেনটিকেশন প্রস্তুত নয়। অনুগ্রহ করে পৃষ্ঠাটি রিফ্রেশ করুন।' : 'Firebase authentication is not ready. Please refresh the page.');
      }

      let result;
      try {
        result = await signInWithPopup(currentAuth, currentProvider);
      } catch (popupErr) {
        // Automatically fall back to redirect if popup is blocked
        if (popupErr.code === 'auth/popup-blocked') {
          console.warn('[Firebase] Popup blocked, falling back to redirect...');
          await signInWithRedirect(currentAuth, currentProvider);
          return;
        }
        throw popupErr;
      }

      const fbUser = result?.user;
      if (!fbUser || !fbUser.email) {
        throw new Error(lang === 'bn' ? 'গুগল একাউন্ট থেকে কোনো ইমেইল পাওয়া যায়নি।' : 'No email associated with this Google account.');
      }

      const res = await api.googleLogin({
        email: fbUser.email,
        name: fbUser.displayName || fbUser.email.split('@')[0],
        photoUrl: fbUser.photoURL || '',
        uid: fbUser.uid
      });

      if (res.token) {
        localStorage.setItem('wcc_token', res.token);
        localStorage.setItem('wcc_user', JSON.stringify(res.user));
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError(lang === 'bn' ? 'গুগল সাইন-ইন উইন্ডো বন্ধ করা হয়েছে।' : 'Google sign-in popup was closed before completing.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError(lang === 'bn' ? 'পূর্ববর্তী সাইন-ইন অনুরোধ বাতিল হয়েছে। আবার চেষ্টা করুন।' : 'Previous sign-in request was cancelled. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(lang === 'bn' ? 'এই ডোমেইনটি ফায়ারবেসে অনুমোদিত নয়।' : 'This domain is not authorized in Firebase configuration.');
      } else if (err.code === 'auth/network-request-failed') {
        setError(lang === 'bn' ? 'নেটওয়ার্ক সংযোগ ত্রুটি। ইন্টারনেট কানেকশন চেক করুন।' : 'Network connection error. Please check your internet connection.');
      } else {
        setError(err.message || (lang === 'bn' ? 'গুগল সাইন-ইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Google sign-in failed. Please try again.'));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRolePreset = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  const handleAutoLogin = async (roleEmail, rolePass, redirectUrl = '/dashboard') => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
    setLoading(true);

    try {
      const res = await api.login({ email: roleEmail, password: rolePass });
      if (res.token) {
        localStorage.setItem('wcc_token', res.token);
        localStorage.setItem('wcc_user', JSON.stringify(res.user));
        router.push(redirectUrl);
      }
    } catch (err) {
      setError(
        lang === 'bn'
          ? (err.message || 'অটো লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
          : (err.message || 'Auto login failed. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Header & Language Switcher */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex items-center justify-between mb-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#B62A35] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'bn' ? 'মূল ওয়েবসাইটে ফিরুন' : 'Back to Home'}</span>
        </Link>
        <LanguageToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-block">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#F1AD1A] bg-white p-1 mx-auto shadow-md">
            <img src="/landing/wcc.png" alt="WCC" className="w-full h-full object-contain" />
          </div>
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('auth.loginTitle')}</h2>
        <p className="text-xs text-slate-500">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200 rounded-3xl shadow-sm space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('auth.emailLabel')}</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@wecanchange.org"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('auth.passLabel')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-[#B62A35] focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end mt-1.5">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#B62A35] hover:underline"
                >
                  {t('auth.forgotPass')}
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-2.5 px-4 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? t('btn.loading') : t('auth.signInBtn')}</span>
            </button>
          </form>

          {/* Google Sign-in Option */}
          <div className="space-y-3">
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200"></div>
              <span className="shrink mx-3 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
                {t('auth.orGoogle')}
              </span>
              <div className="grow border-t border-slate-200"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading || loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-300 shadow-2xs transition-colors flex items-center justify-center gap-3 text-xs disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{googleLoading ? t('btn.loading') : t('auth.continueGoogle')}</span>
            </button>
          </div>

          {/* Quick 1-Click Auto Login Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {lang === 'bn' ? '১-ক্লিকে অটো লগইন (Quick Demo Access)' : '1-Click Auto Login'}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                {lang === 'bn' ? '১ ক্লিকে প্রবেশ' : 'Instant Login'}
              </span>
            </div>

            {/* Health Wing Leader Direct 1-Click Login Button */}
            <button
              type="button"
              onClick={() => handleAutoLogin('coordinator.health@wecanchange.org', 'wccmember2026', '/wings/health')}
              disabled={loading || googleLoading}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-black shadow-md shadow-rose-200 transition-all flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50 group hover:scale-[1.01] active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-1 rounded-xl bg-white/20 text-white text-base">🩺</span>
                <div className="text-left">
                  <span className="block font-bold leading-tight text-xs">
                    {lang === 'bn' ? 'স্বাস্থ্য উইং লিডার (১-ক্লিক লগইন)' : 'Health Wing Leader (1-Click Login)'}
                  </span>
                  <span className="block text-[10px] text-white/80 font-normal">
                    {lang === 'bn' ? 'ডা. মোস্তাফিজুর রহমান' : 'Dr. Mostafizur Rahman'} • coordinator.health@wecanchange.org
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-white/20 text-[10px] font-black shrink-0 flex items-center gap-1">
                <span>{lang === 'bn' ? 'লগইন ➔' : 'Login ➔'}</span>
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => handleAutoLogin('admin@wecanchange.org', 'wccadmin2026', '/dashboard')}
                disabled={loading}
                className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 hover:text-[#B62A35] border border-slate-200 text-slate-700 text-[11px] font-bold text-center transition-colors cursor-pointer"
                title="Admin 1-Click Login"
              >
                👑 {t('roles.admin')} {lang === 'bn' ? '(১-ক্লিক)' : '(1-Click)'}
              </button>
              <button
                type="button"
                onClick={() => handleAutoLogin('tanvir.chowdhury@example.com', 'wccmember2026', '/wings/education')}
                disabled={loading}
                className="py-2 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold text-center transition-colors cursor-pointer"
                title="Education Wing Leader 1-Click Login"
              >
                🎓 {lang === 'bn' ? 'শিক্ষা লিডার (১-ক্লিক)' : 'Edu Leader (1-Click)'}
              </button>
              <button
                type="button"
                onClick={() => handleAutoLogin('member@wecanchange.org', 'wccmember2026', '/dashboard')}
                disabled={loading}
                className="py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-bold text-center transition-colors cursor-pointer"
                title="General Member Login"
              >
                👤 {t('roles.member')}
              </button>
              <button
                type="button"
                onClick={() => handleAutoLogin('volunteer@wecanchange.org', 'wccvol2026', '/dashboard')}
                disabled={loading}
                className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-bold text-center transition-colors cursor-pointer"
                title="Volunteer Login"
              >
                🤝 {t('roles.volunteer')}
              </button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 space-y-2">
            <div>
              {t('auth.noAccount')}{' '}
              <Link href="/register" className="font-bold text-[#B62A35] hover:underline">
                {t('auth.registerNow')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
