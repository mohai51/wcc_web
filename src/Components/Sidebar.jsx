'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  Wallet,
  CreditCard,
  ArrowDownUp,
  Receipt,
  PieChart,
  ShieldCheck,
  Award,
  Calendar,
  CalendarDays,
  Sparkles,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  FileText,
  HeartHandshake,
  AlertTriangle,
  Languages,
  Stethoscope,
  Heart,
  Droplets,
  Ambulance
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/Components/LanguageToggle';

function SidebarInner({ user, collapsed, setCollapsed, onClose, isMobile }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get('tab') || '' : '';
  const { lang, t, setLang } = useLanguage();

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('wcc_token');
    localStorage.removeItem('wcc_user');
    router.push('/');
  };

  const getRoleBadge = (role) => {
    const roleName = t(`roles.${role}`, role);
    switch (role) {
      case 'admin':
        return { text: roleName, color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'coordinator':
        return { text: roleName, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'wing_leader':
        return { text: roleName, color: 'bg-amber-500/20 text-[#F1AD1A] border-amber-500/30' };
      case 'volunteer':
        return { text: roleName, color: 'bg-amber-500/20 text-[#F1AD1A] border-amber-500/30' };
      case 'finance_officer':
        return { text: roleName, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      default:
        return { text: roleName, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    }
  };

  // Nav menus grouped per role with full bilingual support
  const getNavSections = () => {
    const isBn = lang === 'bn';

    if (user.role === 'admin' || user.role === 'finance_officer') {
      return [
        {
          title: isBn ? 'মূল পরিচালনা' : 'CORE OVERSIGHT',
          items: [
            { id: 'overview', label: isBn ? 'ড্যাশবোর্ড ওভারভিউ' : 'Dashboard Overview', icon: LayoutDashboard, href: '/dashboard' },
            ...(user.role === 'admin'
              ? [
                  { id: 'coordinators', label: isBn ? 'সমন্বয়ক হাব' : 'Coordinators Hub', icon: ShieldCheck, href: '/dashboard?tab=coordinators' },
                  { id: 'volunteers', label: isBn ? 'স্বেচ্ছাসেবক হাব' : 'Volunteer Hub', icon: HeartHandshake, href: '/dashboard?tab=volunteers' },
                  { id: 'health-wing-portal', label: isBn ? 'স্বাস্থ্য উইং (ক্যাম্প ও রক্তদান)' : 'Health Wing (Camps & Blood)', icon: Stethoscope, href: '/wings/health' },
                  { id: 'education-wing-portal', label: isBn ? 'শিক্ষা উইং (কোর্স ও বই)' : 'Education Wing (Courses & Books)', icon: Sparkles, href: '/wings/education' },
                  { id: 'wings', label: isBn ? 'উইং ব্যবস্থাপনা' : 'Wings Management', icon: Sparkles, href: '/admin/wings' },
                  { id: 'programs', label: isBn ? 'প্রকল্প হাব' : 'Programs Hub', icon: Calendar, href: '/admin/programs' },
                  { id: 'events', label: isBn ? 'ইভেন্ট ও ক্যাম্প' : 'Events Hub', icon: CalendarDays, href: '/admin/events' },
                  { id: 'issues', label: isBn ? 'নাগরিক সমস্যা' : 'Community Issues', icon: AlertTriangle, href: '/admin/issues' }
                ]
              : []),
            { id: 'profile', label: isBn ? 'প্রোফাইল ও সেটিংস' : 'My Profile & Settings', icon: User, href: '/profile' },
            { id: 'member-requests', label: isBn ? 'সদস্যের আবেদন' : 'Member Requests', icon: HeartHandshake, href: '/dashboard?tab=requests' },
            { id: 'members', label: isBn ? 'সদস্য তালিকা' : 'Member Directory', icon: Users, href: '/members' },
            { id: 'add-member', label: isBn ? 'নতুন সদস্য নিবন্ধন' : 'Register Member', icon: UserPlus, href: '/members/new' },
            { id: 'approvals', label: isBn ? 'অনুমোদনের অপেক্ষায়' : 'Pending Approvals', icon: Clock, href: '/members?status=Pending' }
          ]
        },
        {
          title: isBn ? 'অর্থ ও হিসাব' : 'FINANCE & AUDIT',
          items: [
            { id: 'finance', label: isBn ? 'অর্থ তহবিল হাব' : 'Finance Hub', icon: Wallet, href: '/finance' },
            { id: 'event-expenses', label: isBn ? 'ইভেন্ট ও প্রোগ্রামের খরচ' : 'Event Expenses Form', icon: Receipt, href: '/finance/event-expenses' },
            { id: 'accounts', label: isBn ? 'হিসাব ও ভল্ট' : 'Accounts & Vaults', icon: CreditCard, href: '/finance/accounts' },
            { id: 'transactions', label: isBn ? 'লেনদেন খতিয়ান' : 'Master Transactions', icon: ArrowDownUp, href: '/finance/transactions' },
            { id: 'reimbursements', label: isBn ? 'ব্যয় দাবি' : 'Expense Claims', icon: Receipt, href: '/finance/reimbursements' }
          ]
        },
        {
          title: isBn ? 'এনালিটিক্স ও পাবলিক' : 'INTELLIGENCE & PUBLIC',
          items: [
            { id: 'analytics', label: isBn ? 'পরিসংখ্যান' : 'Demographic Analytics', icon: PieChart, href: '/analytics' },
            { id: 'verify', label: isBn ? 'পাবলিক কিউআর যাচাই' : 'Public QR Verification', icon: ShieldCheck, href: '/verify' }
          ]
        }
      ];
    }

    if (user.role === 'coordinator' || user.role === 'wing_leader') {
      let assignedWingSlug = user.assignedWing?.slug;
      if (!assignedWingSlug) {
        const uEmail = (user.email || '').toLowerCase();
        const vWing = (user.volunteerWing || '').toLowerCase();
        if (uEmail.includes('health') || vWing.includes('স্বাস্থ্য') || vWing.includes('health')) {
          assignedWingSlug = 'health';
        } else {
          assignedWingSlug = 'education';
        }
      }
      const isHealthLead = assignedWingSlug === 'health';

      return [
        {
          title: user.role === 'wing_leader' ? (isBn ? 'উইং পরিচালনা' : 'WING LEADERSHIP') : (isBn ? 'সমন্বয়ক পরিচালনা' : 'WING OPERATIONS'),
          items: [
            { id: 'overview', label: isBn ? 'লিডার হাব' : 'Leader Hub', icon: LayoutDashboard, href: '/dashboard' },
            {
              id: 'wing-portal',
              label: isBn ? (isHealthLead ? 'আমার স্বাস্থ্য উইং প্ল্যাটফর্ম' : 'আমার শিক্ষা উইং প্ল্যাটফর্ম') : (isHealthLead ? 'My Health Wing Platform' : 'My Wing Platform'),
              icon: isHealthLead ? Stethoscope : Sparkles,
              href: `/wings/${assignedWingSlug}`
            },
            { id: 'profile', label: isBn ? 'লিডার প্রোফাইল' : 'Leader Profile', icon: User, href: '/profile' },
            { id: 'programs', label: isBn ? 'উইং প্রকল্পসমূহ' : 'Wing Programs', icon: Calendar, href: '/admin/programs' },
            { id: 'events', label: isBn ? 'উইং ইভেন্টসমূহ' : 'Wing Events', icon: CalendarDays, href: '/admin/events' },
            { id: 'event-expenses', label: isBn ? 'ইভেন্ট খরচ এন্ট্রি' : 'Event Expense Entry', icon: Receipt, href: '/finance/event-expenses' },
            { id: 'issues', label: isBn ? 'নাগরিক সমস্যা' : 'Community Issues', icon: AlertTriangle, href: '/admin/issues' }
          ]
        },
        {
          title: isBn ? 'উইং ও পাবলিক সেবা' : 'WINGS & PUBLIC SERVICES',
          items: [
            { id: 'health-wing', label: isBn ? 'স্বাস্থ্য উইং (ক্যাম্প ও রক্তদান)' : 'Health Wing (Camps & Blood)', icon: Stethoscope, href: '/wings/health' },
            { id: 'education-wing', label: isBn ? 'শিক্ষা উইং (কোর্স ও বই)' : 'Education Wing (Courses & Books)', icon: Sparkles, href: '/wings/education' },
            { id: 'public-wings', label: isBn ? 'সকল উইং তালিকা' : 'Explore All Wings', icon: Sparkles, href: '/wings' },
            { id: 'verify', label: isBn ? 'পাবলিক কিউআর যাচাই' : 'Public QR Verification', icon: ShieldCheck, href: '/verify' }
          ]
        }
      ];
    }

    if (user.role === 'volunteer') {
      return [
        {
          title: isBn ? 'স্বেচ্ছাসেবক শাখা' : 'VOLUNTEER CORPS',
          items: [
            { id: 'hub', label: isBn ? 'স্বেচ্ছাসেবক হাব' : 'Volunteer Hub', icon: LayoutDashboard, href: '/dashboard?tab=hub' },
            { id: 'profile', label: isBn ? 'প্রোফাইল' : 'Volunteer Profile', icon: User, href: '/profile' },
            { id: 'requests', label: isBn ? 'উইং আবেদন' : 'Wing Requests', icon: HeartHandshake, href: '/dashboard?tab=requests' },
            { id: 'health-wing-volunteer', label: isBn ? 'স্বাস্থ্য উইং (ক্যাম্প ও রক্তদান)' : 'Health Wing (Camps & Blood)', icon: Stethoscope, href: '/wings/health' },
            { id: 'wings-portal', label: isBn ? 'শিক্ষা উইং (কোর্স ও বই)' : 'Education Wing & Books', icon: Sparkles, href: '/wings/education' },
            { id: 'badge', label: isBn ? 'ডিজিটাল ব্যাজ' : 'My Digital Badge', icon: Award, href: '/dashboard?tab=badge' },
            { id: 'log', label: isBn ? 'কাজের সময় লিপিবদ্ধ' : 'Log Service Hours', icon: Clock, href: '/dashboard?tab=log' },
            { id: 'history', label: isBn ? 'কাজের ইতিহাস' : 'Service Log History', icon: FileText, href: '/dashboard?tab=history' }
          ]
        },
        {
          title: isBn ? 'সামাজিক কার্যক্রম' : 'COMMUNITY ACTION',
          items: [
            { id: 'all-wings', label: isBn ? 'সকল উইং তালিকা' : 'All Wings Directory', icon: Sparkles, href: '/wings' },
            { id: 'drives', label: isBn ? 'আসন্ন ক্যাম্পেইন' : 'Upcoming Drives', icon: Calendar, href: '/dashboard?tab=drives' },
            { id: 'verify', label: isBn ? 'আইডি কার্ড যাচাই' : 'Verify Credentials', icon: ShieldCheck, href: '/verify' }
          ]
        }
      ];
    }

    // Default: Member
    return [
      {
        title: isBn ? 'আমার সদস্যপদ ও সেবা' : 'MY MEMBERSHIP & SERVICES',
        items: [
          { id: 'hub', label: isBn ? 'মেম্বার পোর্টাল' : 'Member Portal', icon: LayoutDashboard, href: '/dashboard?tab=hub' },
          { id: 'health-wing', label: isBn ? 'স্বাস্থ্য উইং (ক্যাম্প ও রক্তদান)' : 'Health Wing (Camps & Blood)', icon: Stethoscope, href: '/wings/health' },
          { id: 'education-wing', label: isBn ? 'শিক্ষা উইং (কোর্স ও বই)' : 'Education Wing (Courses & Books)', icon: Sparkles, href: '/wings/education' },
          { id: 'all-wings', label: isBn ? 'সকল উইং তালিকা' : 'WCC Wings Directory', icon: Sparkles, href: '/wings' },
          { id: 'profile', label: isBn ? 'সদস্য প্রোফাইল' : 'Membership Profile', icon: User, href: '/profile' },
          { id: 'requests', label: isBn ? 'উইং ও ভলান্টিয়ার হাব' : 'Wing & Volunteer Hub', icon: HeartHandshake, href: '/dashboard?tab=requests' },
          { id: 'id-card', label: isBn ? 'অফিসিয়াল ডিজিটাল আইডি' : 'Official Digital ID', icon: Award, href: '/dashboard?tab=id-card' }
        ]
      },
      {
        title: isBn ? 'সেবা ও ডিরেক্টরি' : 'SERVICES & DIRECTORY',
        items: [
          { id: 'directory', label: isBn ? 'সদস্য তালিকা' : 'Member Directory', icon: Users, href: '/members' },
          { id: 'reimbursement', label: isBn ? 'ব্যয় দাবি' : 'Claim Reimbursement', icon: Receipt, href: '/finance/reimbursements' },
          { id: 'verify', label: isBn ? 'সদস্য আইডি যাচাই' : 'Verify Member ID', icon: ShieldCheck, href: '/verify' }
        ]
      }
    ];
  };

  const navSections = getNavSections();

  return (
    <aside
      className={`h-screen bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col justify-between select-none transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Header & Navigation Container */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Branding Header */}
        <div className={`px-4 py-3.5 border-b border-slate-800 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} shrink-0 min-h-[4.25rem] relative`}>
          <Link
            href="/dashboard"
            onClick={onClose}
            className={`flex items-center gap-3 min-w-0 ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="w-10 h-10 rounded-full bg-white p-1 border-2 border-[#F1AD1A] shrink-0 shadow-md">
              <img
                src="/landing/wcc.png"
                alt="WCC"
                className="w-full h-full object-contain"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 flex-nowrap">
                  <span className="font-black text-sm text-white tracking-tight shrink-0 whitespace-nowrap">WCC PORTAL</span>
                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border shrink-0 whitespace-nowrap ${getRoleBadge(user.role).color}`}>
                    {getRoleBadge(user.role).text}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {lang === 'bn' ? 'আমরাই আনব পরিবর্তন' : 'Empowering Positive Change'}
                </p>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle (Expanded state) */}
          {!isMobile && !collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors shrink-0 cursor-pointer ml-1"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors shrink-0 cursor-pointer ml-1"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Toggle */}
        {!isMobile && collapsed && (
          <div className="py-1.5 flex justify-center border-b border-slate-800/80 bg-slate-900/50">
            <button
              onClick={() => setCollapsed(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-[#F1AD1A] hover:bg-slate-800 transition-colors"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Navigation Groups */}
        <div className="p-3 pr-2 space-y-4 overflow-y-auto flex-1 overscroll-contain sidebar-scroll">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed ? (
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  {section.title}
                </div>
              ) : (
                <div className="h-px bg-slate-800/80 my-2 mx-3" />
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const itemTab = item.href.includes('tab=') ? item.href.split('tab=')[1] : '';
                const itemBase = item.href.split('?')[0];

                // Determine active state cleanly
                let isCurrent = false;
                if (itemTab) {
                  isCurrent = pathname === itemBase && currentTab === itemTab;
                } else if (item.href.includes('status=Pending')) {
                  isCurrent = pathname === '/members' && searchParams.get('status') === 'Pending';
                } else if (itemBase === '/dashboard') {
                  isCurrent = pathname === '/dashboard' && (!currentTab || currentTab === 'hub' || currentTab === 'overview') && (item.id === 'overview' || item.id === 'hub');
                } else {
                  isCurrent = pathname === itemBase;
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={`group flex items-center ${
                      collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
                    } rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-[#B62A35] to-[#8E1A23] text-white shadow-md shadow-rose-950/40 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/90 active:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors duration-150 ${isCurrent ? 'text-white' : 'text-slate-400 group-hover:text-[#F1AD1A]'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Profile & Actions Container */}
      <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950 shrink-0">
        {/* Language Toggle */}
        {!collapsed ? (
          <LanguageToggle variant="sidebar" className="mb-2" />
        ) : (
          <div className="flex justify-center mb-1">
            <button
              type="button"
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-[#F1AD1A] hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              title={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            >
              {lang === 'bn' ? 'বাং' : 'EN'}
            </button>
          </div>
        )}

        {/* Quick link to Guest Site */}
        <Link
          href="/"
          onClick={onClose}
          title={lang === 'bn' ? 'পাবলিক ওয়েবসাইটে যান' : 'View Public Guest Site'}
          className={`flex items-center ${
            collapsed ? 'justify-center px-0' : 'gap-2.5 px-3'
          } py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-colors w-full group`}
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#F1AD1A] shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span className="truncate">{lang === 'bn' ? 'পাবলিক ওয়েবসাইট' : 'Public Guest Site'}</span>}
        </Link>

        {/* User Profile Snippet & Logout */}
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 pt-1">
            <Link
              href="/profile"
              onClick={onClose}
              title={`${user.name || 'User'} (${user.email}) - View Profile`}
              className="w-9 h-9 rounded-full bg-[#B62A35]/20 text-[#F1AD1A] border border-[#F1AD1A]/40 flex items-center justify-center shrink-0 font-bold text-xs hover:border-[#F1AD1A] hover:scale-105 transition-all"
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Link>
            <button
              onClick={handleLogout}
              title={lang === 'bn' ? 'লগআউট' : 'Log out'}
              aria-label="Log out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
            <Link
              href="/profile"
              onClick={onClose}
              title={lang === 'bn' ? 'প্রোফাইল পরিচালনা' : 'Manage My Profile'}
              className="flex items-center gap-2.5 overflow-hidden hover:opacity-90 transition-opacity flex-1 min-w-0"
            >
              <div className="w-8 h-8 rounded-full bg-[#B62A35]/20 text-[#F1AD1A] border border-[#F1AD1A]/40 flex items-center justify-center shrink-0 font-bold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate min-w-0">
                <div className="text-xs font-bold text-white truncate hover:text-[#F1AD1A] transition-colors">{user.name || 'User'}</div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title={lang === 'bn' ? 'লগআউট' : 'Log out'}
              aria-label="Log out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default function Sidebar(props) {
  return (
    <Suspense fallback={<div className="w-72 h-screen bg-slate-950 shrink-0" />}>
      <SidebarInner {...props} />
    </Suspense>
  );
}
