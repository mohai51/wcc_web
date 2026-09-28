'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users,
  Wallet,
  PieChart,
  ShieldCheck,
  UserPlus,
  Home,
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  HeartHandshake,
  Sparkles,
  LayoutDashboard,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/Components/LanguageToggle';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem('wcc_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('wcc_token');
    localStorage.removeItem('wcc_user');
    setUser(null);
    router.push('/');
  };

  // Dynamic public guest navigation links
  const navLinks = [
    { name: t('nav.home'), href: '/', icon: Home },
    { name: t('nav.visionMission'), href: '/vision-mission', icon: null },
    { name: t('nav.wings'), href: '/wings', icon: null },
    { name: t('nav.programs'), href: '/programs', icon: null },
    { name: t('nav.events'), href: '/events', icon: null },
    { name: t('nav.reportIssue'), href: '/report-issue', icon: null },
    { name: t('nav.verifyId'), href: '/verify', icon: ShieldCheck }
  ];

  const getRoleBadge = (role) => {
    const roleName = t(`roles.${role}`, role);
    switch (role) {
      case 'admin':
        return { text: roleName, color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'coordinator':
        return { text: roleName, color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'wing_leader':
        return { text: roleName, color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'volunteer':
        return { text: roleName, color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'finance_officer':
        return { text: roleName, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { text: roleName, color: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#F1AD1A] bg-white p-0.5 shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <img
                src="/landing/wcc.png"
                alt="We Can Change Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-lg text-[#B62A35] tracking-tight whitespace-nowrap">{t('brand.shortName')}</span>
                <span className="text-[10px] bg-[#F1AD1A]/20 text-[#A6772A] font-extrabold px-1.5 py-0.5 rounded whitespace-nowrap">
                  {user ? `${user.role.toUpperCase()} PORTAL` : (lang === 'bn' ? 'অফিসিয়াল' : 'OFFICIAL')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden 2xl:block truncate max-w-[220px]">
                {t('brand.tagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation (Protected against wrapping) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-1.5 xl:px-2.5 py-1.5 rounded-lg text-[11px] xl:text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#B62A35] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#B62A35] hover:bg-slate-100'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 shrink-0 hidden 2xl:block" />}
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Language Switcher */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-3 shrink-0">
            {/* Language Toggle Pill */}
            <LanguageToggle />

            {user ? (
              <div className="flex items-center gap-1.5 xl:gap-3 shrink-0">
                {/* Switch to Portal Workspace */}
                <Link
                  href="/dashboard"
                  title="Go to My Portal Workspace"
                  className="flex items-center gap-1 px-2.5 py-1.5 xl:px-3.5 xl:py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-[11px] xl:text-xs font-bold rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{t('nav.portal')}</span>
                </Link>

                <div className="flex items-center gap-1.5 xl:gap-2 pl-1.5 xl:pl-2 border-l border-slate-200 shrink-0">
                  <div className="hidden xl:flex flex-col text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px] xl:max-w-[130px] whitespace-nowrap">
                      {user.name}
                    </span>
                    <div className="flex items-center justify-end">
                      <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded border font-bold whitespace-nowrap ${getRoleBadge(user.role).color}`}>
                        {getRoleBadge(user.role).text}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/profile"
                    className="p-1.5 text-slate-500 hover:text-[#B62A35] hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    title={lang === 'bn' ? 'প্রোফাইল' : 'Profile'}
                  >
                    <User className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={handleLogout}
                    title={t('nav.logout')}
                    className="p-1.5 text-slate-400 hover:text-[#B62A35] hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 xl:px-4 xl:py-2 text-[11px] xl:text-xs font-bold rounded-xl bg-[#B62A35] hover:bg-[#9E1F2A] text-white transition-all shadow-xs whitespace-nowrap shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{t('nav.login')}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button & Mobile Lang Switch */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive ? 'bg-[#B62A35] text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <div className="p-3 bg-slate-50 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#B62A35]/10 text-[#B62A35] flex items-center justify-center font-bold text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{user.name}</div>
                      <span className={`text-[9px] uppercase px-1 rounded font-bold ${getRoleBadge(user.role).color}`}>
                        {getRoleBadge(user.role).text}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>{t('nav.portal')}</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-center text-xs font-bold bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-xl shadow-xs transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('nav.login')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
