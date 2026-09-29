'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  PlusCircle,
  FileText,
  Activity,
  CreditCard,
  Building,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Receipt,
  UserCheck,
  BarChart3,
  PieChart,
  Sparkles,
  Layers,
  User,
  DollarSign,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';
import { useLanguage } from '@/context/LanguageContext';

export default function FinanceDashboardPage() {
  const { tx, lang } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFinance() {
      try {
        const res = await api.getFinanceDashboard();
        setData(res);
      } catch (err) {
        console.error('Error fetching finance dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFinance();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-slate-500">
          {tx('আর্থিক তথ্যাবলি লোড হচ্ছে...', 'Loading financial intelligence dashboard...')}
        </p>
      </div>
    );
  }

  const navCards = [
    {
      title: tx('ইভেন্ট ও প্রোগ্রামের খরচ', 'Event & Program Expenses'),
      desc: tx('লিডারদের দাখিলকৃত বিভিন্ন ইভেন্টের আইটেমভিত্তিক খরচের নিরীক্ষা ও নতুন খরচ এন্ট্রি।', 'Submit and inspect detailed multi-item event costs with submitter tracking.'),
      href: '/finance/event-expenses',
      icon: Receipt,
      color: 'bg-rose-50 text-[#B62A35]'
    },
    {
      title: tx('কেন্দ্রীয় মাস্টার লেজার', 'Central Master Ledger'),
      desc: tx('সংগঠনের সকল আয় ও ব্যয়ের সম্পূর্ণ কালানুক্রমিক ও স্বয়ংক্রিয় ডাবল-এন্ট্রি খতিয়ান।', 'Master chronological double-entry transaction record.'),
      href: '/finance/transactions',
      icon: FileText,
      color: 'bg-blue-50 text-blue-700'
    },
    {
      title: tx('আয় ও অনুদান ট্র্যাকার', 'Income & Inflows'),
      desc: tx('প্রকল্পের অনুদান, দাতার অবদান, স্পনসরশিপ ও সংগৃহীত সদস্য ফি ট্র্যাকিং।', 'Grants, donor sponsorships, and collected membership contributions.'),
      href: '/finance/income',
      icon: ArrowDownRight,
      color: 'bg-sky-50 text-sky-700'
    },
    {
      title: tx('ব্যয় ব্যবস্থাপনা', 'Expense Management'),
      desc: tx('মাঠ পর্যায়ের খরচ, সরঞ্জাম ক্রয় এবং সাধারণ অপারেশনাল ব্যয়ের খতিয়ান।', 'Field operations, material procurements, and general expense records.'),
      href: '/finance/expenses',
      icon: ArrowUpRight,
      color: 'bg-rose-50 text-rose-700'
    },
    {
      title: tx('কর্মসূচিভিত্তিক হিসাব', 'Activity Accounts'),
      desc: tx('স্বাস্থ্য ক্যাম্প ও প্রকল্পভিত্তিক বাজেট বরাদ্দ, প্রকৃত ব্যয় ও স্টেটমেন্ট।', 'Event & health camp budgets, variance analysis, and financial statements.'),
      href: '/finance/activities',
      icon: Activity,
      color: 'bg-emerald-50 text-emerald-700'
    },
    {
      title: tx('সদস্যদের ব্যয় দাবি', 'Member Reimbursement Claims'),
      desc: tx('সদস্যদের ব্যক্তিগত খরচের রিইমবার্সমেন্ট আবেদন ও অনুমোদন প্রক্রিয়া।', 'Member expense claim workflows without double-counting liabilities.'),
      href: '/finance/reimbursements',
      icon: UserCheck,
      color: 'bg-purple-50 text-purple-700'
    },
    {
      title: tx('মাঠ পর্যায়ের অগ্রিম', 'Field Advances'),
      desc: tx('জরুরি মাঠ পর্যায়ের কাজের অগ্রিম গ্রহণ ও সমন্বয়ের রিকনসিলিয়েশন।', 'Operational requisitions & settlement reconciler.'),
      href: '/finance/advances',
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-700'
    },
    {
      title: tx('ভল্ট ও ব্যাংক অ্যাকাউন্ট', 'Vaults & Bank Accounts'),
      desc: tx('ক্যাশ ইন হ্যান্ড, ব্র্যাক ব্যাংক, নগদ ও বিকাশ মার্চেন্ট অ্যাকাউন্টের ব্যালেন্স।', 'Cash in hand vaults, BRAC, DBBL, bKash & Nagad accounts.'),
      href: '/finance/accounts',
      icon: Building,
      color: 'bg-indigo-50 text-indigo-700'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {tx('অর্থ ও হিসাব তহবিল হাব', 'Finance & Accounting Hub')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#A6772A]/15 text-[#A6772A]">
              Live Double-Entry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {tx(
              'উই ক্যান চেঞ্জ (WCC) নির্বাহী কোষাগার, ইভেন্ট খরচ বরাদ্দ ও রিয়েল-টাইম এনালিটিক্স।',
              'We Can Change (WCC) Executive Treasury, Event Cost Allocations & Financial Analytics.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/finance/event-expenses"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>{tx('ইভেন্ট খরচ এন্ট্রি (Leader Form)', 'Event Expense Entry (Leader Form)')}</span>
          </Link>
          <Link
            href="/finance/transactions"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{tx('লেনদেন খতিয়ান', 'Record Transaction')}</span>
          </Link>
          <Link
            href="/finance/income"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>{tx('আয় যুক্ত করুন', 'Add Income')}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidity */}
        <Link
          href="/finance/accounts"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2 hover:border-emerald-300 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
              {tx('মোট নগদ ও ব্যাংক তহবিল', 'Total Liquidity')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
            ৳ {(data?.totalLiquidity || 0).toLocaleString()}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{tx('সকল নগদ ভল্ট ও ব্যাংক ব্যালেন্স', 'Available across all vaults & banks')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        {/* Total Income */}
        <Link
          href="/finance/income"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2 hover:border-blue-300 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-700 transition-colors">
              {tx('মোট সংগৃহীত আয়', 'Total Inflows')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-blue-600">
            ৳ {(data?.totalIncome || 0).toLocaleString()}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{tx('অনুদান, স্পনসর ও সদস্য ফি', 'Grants, donor support & membership fees')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        {/* Total Expense */}
        <Link
          href="/finance/expenses"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2 hover:border-rose-300 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#B62A35] transition-colors">
              {tx('মোট ব্যয় ও খরচ', 'Incurred Outflows')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#B62A35] flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#B62A35]">
            ৳ {(data?.totalExpense || 0).toLocaleString()}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{tx('ক্যাম্প, লজিস্টিক ও কার্যক্রম ব্যয়', 'Field camps, materials & operational costs')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#B62A35] group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        {/* Pending Claims */}
        <Link
          href="/finance/reimbursements"
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2 hover:border-amber-300 hover:shadow-md transition-all group block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-700 transition-colors">
              {tx('অমীমাংসিত ব্যয় দাবি', 'Pending Claims')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-600">
            ৳ {(data?.pendingClaims || 0).toLocaleString()}
          </h3>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{tx('সদস্যদের ব্যক্তিগত খরচের দাবি', 'Unsettled member reimbursement claims')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>
      </div>

      {/* Sub-module Navigation Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          {tx('আর্থিক মডিউলসমূহ', 'Financial Sub-Modules')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-[#B62A35]/30 transition-all space-y-3 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#B62A35] group-hover:translate-x-1 transition-all" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#B62A35] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{card.desc}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-[#B62A35] group-hover:underline flex items-center gap-1">
                  <span>{tx('প্রবেশ করুন', 'Open Module')}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Accounts Liquidity & Category Spend Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Accounts Summary */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">{tx('ভল্ট ও ব্যাংক ব্যালেন্স', 'Vaults & Bank Balances')}</h3>
              <p className="text-[11px] text-slate-400">{tx('সক্রিয় হিসাব ও নগদ জমা', 'Active accounts & vaults')}</p>
            </div>
            <Link href="/finance/accounts" className="text-xs font-bold text-[#B62A35] hover:underline">
              {tx('ব্যবস্থাপনা →', 'Manage →')}
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.accountsSummary || []).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">{tx('কোন ব্যাংক হিসাব পাওয়া যায়নি।', 'No accounts found.')}</p>
            ) : (
              (data?.accountsSummary || []).map((acc) => (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{acc.name}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{acc.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-slate-900">
                      ৳ {(acc.balance || 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 block font-semibold">Active</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Spend Distribution */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {tx('খাতভিত্তিক ব্যয় বণ্টন', 'Expense Allocation by Category')}
              </h3>
              <p className="text-[11px] text-slate-400">{tx('কোন খাতে কত শতাংশ খরচ হয়েছে', 'Categorized outflows distribution')}</p>
            </div>
            <Link href="/finance/expenses" className="text-xs font-bold text-[#B62A35] hover:underline">
              {tx('বিস্তারিত →', 'View All →')}
            </Link>
          </div>

          <div className="space-y-3">
            {Object.keys(data?.categorySpend || {}).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">{tx('কোন খরচের তথ্য পাওয়া যায়নি।', 'No categorized spend recorded yet.')}</p>
            ) : (
              Object.entries(data?.categorySpend || {}).map(([cat, amount]) => {
                const totalExp = data?.totalExpense || 1;
                const percent = Math.min(Math.round(((amount || 0) / totalExp) * 100), 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{cat}</span>
                      <span className="text-slate-900 font-mono">
                        ৳ {(amount || 0).toLocaleString()} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#B62A35] to-[#E08A00] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Interactive Analytics: Monthly Inflow vs Outflow Visual Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                {tx('আর্থিক প্রবাহ এনালিটিক্স (Monthly Cash Flow Analytics)', 'Monthly Cash Flow Analytics (Income vs Expense)')}
              </h3>
              <p className="text-xs text-slate-500">
                {tx('মাসভিত্তিক মোট আয় এবং ব্যয়ের তুলনামূলক রিয়েল-টাইম বার গ্রাফ ও অনুপাত', 'Monthly comparative trend of total inflows and outflows')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-500" />
              <span className="text-slate-700">{tx('Inflows (আয়)', 'Inflows (Income)')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#B62A35]" />
              <span className="text-slate-700">{tx('Outflows (ব্যয়)', 'Outflows (Expense)')}</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="space-y-4">
          {(() => {
            const trends = data?.monthlyTrends || [];
            const activeMonths = trends.filter(m => (m.income || 0) > 0 || (m.expense || 0) > 0);
            const displayMonths = activeMonths.length > 0 ? activeMonths : trends.slice(0, 6);
            const maxVal = Math.max(...displayMonths.map(m => Math.max(m.income || 0, m.expense || 0)), 1);

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {displayMonths.map((m) => {
                  const incHeight = Math.max(Math.round(((m.income || 0) / maxVal) * 100), (m.income || 0) > 0 ? 8 : 2);
                  const expHeight = Math.max(Math.round(((m.expense || 0) / maxVal) * 100), (m.expense || 0) > 0 ? 8 : 2);
                  const net = (m.income || 0) - (m.expense || 0);

                  return (
                    <div
                      key={m.monthKey}
                      className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between space-y-3"
                    >
                      <div className="text-center border-b border-slate-200/60 pb-1.5">
                        <span className="font-bold text-xs text-slate-800 block">{m.label}</span>
                        <span className={`text-[10px] font-mono font-semibold ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {net >= 0 ? `+৳ ${net.toLocaleString()}` : `-৳ ${Math.abs(net).toLocaleString()}`}
                        </span>
                      </div>

                      {/* Bar Visualization Container */}
                      <div className="h-32 flex items-end justify-center gap-3 px-2 pt-2">
                        {/* Income Bar */}
                        <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[9px] font-mono font-bold text-blue-700 truncate">
                            {(m.income || 0) > 0 ? `${Math.round((m.income || 0) / 1000)}k` : '0'}
                          </span>
                          <div
                            className="w-full bg-blue-500 rounded-t-md transition-all duration-500 hover:brightness-110"
                            style={{ height: `${incHeight}%` }}
                            title={`Income: ৳ ${(m.income || 0).toLocaleString()}`}
                          />
                        </div>

                        {/* Expense Bar */}
                        <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[9px] font-mono font-bold text-[#B62A35] truncate">
                            {(m.expense || 0) > 0 ? `${Math.round((m.expense || 0) / 1000)}k` : '0'}
                          </span>
                          <div
                            className="w-full bg-[#B62A35] rounded-t-md transition-all duration-500 hover:brightness-110"
                            style={{ height: `${expHeight}%` }}
                            title={`Expense: ৳ ${(m.expense || 0).toLocaleString()}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 text-center text-[10px] pt-1 border-t border-slate-200/60">
                        <div className="text-blue-600 font-bold">{tx('আয়:', 'In:')} ৳{(m.income || 0).toLocaleString()}</div>
                        <div className="text-[#B62A35] font-bold">{tx('ব্যয়:', 'Out:')} ৳{(m.expense || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Program & Event Wise Expenses Table: Submitter Leader Tracking */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#F1AD1A] flex items-center justify-center">
              <Receipt className="w-5 h-5 text-[#B62A35]" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                {tx('ইভেন্ট ও প্রোগ্রামভিত্তিক খরচের খতিয়ান (Leader Cost Submissions)', 'Event & Program Cost Submissions (Leader Audits)')}
              </h3>
              <p className="text-xs text-slate-500">
                {tx('কোন লিডার কোন ইভেন্টের জন্য কত খরচ জমা দিয়েছেন তার পুঙ্খানুপুঙ্খ বিবরণ', 'Itemized record of event budgets submitted by wing leaders')}
              </p>
            </div>
          </div>

          <Link
            href="/finance/event-expenses"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{tx('নতুন খরচ যোগ করুন', 'Add New Expense')}</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">{tx('ইভেন্ট / কর্মসূচির নাম', 'Event / Program Name')}</th>
                <th className="py-3 px-3">{tx('খরচের আইটেম সংখ্যা', 'Item Count')}</th>
                <th className="py-3 px-3">{tx('দাখিলকারী লিডার / অ্যাডমিন', 'Submitted By Leader / Admin')}</th>
                <th className="py-3 px-3 text-right">{tx('মোট খরচের পরিমাণ', 'Total Cost')}</th>
                <th className="py-3 px-3 text-center">{tx('স্ট্যাটাস', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.eventWiseExpenses || []).length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">
                    {tx('কোন ইভেন্টভিত্তিক খরচ এখনও জমা দেওয়া হয়নি।', 'No event expenses submitted yet.')}
                  </td>
                </tr>
              ) : (
                (data?.eventWiseExpenses || []).map((evt, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{evt.title}</div>
                      {evt.activityId && (
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">{evt.activityId}</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {evt.itemCount} {tx('টি আইটেম', 'items')}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#B62A35]" />
                        <span>{evt.submittedBy}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-sm text-[#B62A35]">
                      ৳ {(evt.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Ledger Recorded
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Chronological Ledger Strip */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              {tx('সাম্প্রতিক ডাবল-এন্ট্রি লেনদেনসমূহ', 'Recent Double-Entry Transactions')}
            </h3>
            <p className="text-xs text-slate-400">{tx('সেন্ট্রাল মাস্টার লেজারের সাম্প্রতিক কার্যবিবরণী', 'Master chronological ledger activity')}</p>
          </div>
          <Link href="/finance/transactions" className="text-xs font-bold text-[#B62A35] hover:underline">
            {tx('সম্পূর্ণ খতিয়ান দেখুন →', 'View Full Ledger →')}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">{tx('তারিখ', 'Date')}</th>
                <th className="py-2.5 px-3">{tx('ধরন', 'Type')}</th>
                <th className="py-2.5 px-3">{tx('বিবরণ', 'Description')}</th>
                <th className="py-2.5 px-3">{tx('অ্যাকাউন্ট', 'Account')}</th>
                <th className="py-2.5 px-3 text-right">{tx('পরিমাণ', 'Amount')}</th>
                <th className="py-2.5 px-3 text-center">{tx('স্ট্যাটাস', 'Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.recentTransactions || []).length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">
                    {tx('কোন সাম্প্রতিক লেনদেন পাওয়া যায়নি।', 'No recent transactions recorded.')}
                  </td>
                </tr>
              ) : (
                (data?.recentTransactions || []).map((txn) => {
                  const isIncome = txn.type === 'Income';
                  return (
                    <tr key={txn.transactionId || txn._id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{txn.date}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isIncome ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-800">{txn.description}</div>
                        <div className="text-[10px] text-slate-400">{txn.category}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{txn.accountName || 'Cash Vault'}</td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold ${
                          isIncome ? 'text-blue-600' : 'text-[#B62A35]'
                        }`}
                      >
                        {isIncome ? '+' : '-'} ৳ {(txn.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge status={txn.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
