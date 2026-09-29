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
  Layers
} from 'lucide-react';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';

export default function FinanceDashboardPage() {
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
        <p className="text-xs font-semibold text-slate-500">Loading financial intelligence dashboard...</p>
      </div>
    );
  }

  const navCards = [
    {
      title: 'Event & Program Expenses',
      desc: 'Submit and inspect detailed multi-item event costs with submitter tracking.',
      href: '/finance/event-expenses',
      icon: Receipt,
      color: 'bg-rose-50 text-[#B62A35]'
    },
    {
      title: 'Central Ledger',
      desc: 'Master chronological double-entry transaction record.',
      href: '/finance/transactions',
      icon: FileText,
      color: 'bg-blue-50 text-blue-700'
    },
    {
      title: 'Activity Accounts',
      desc: 'Event & health camp budgets and statements.',
      href: '/finance/activities',
      icon: Activity,
      color: 'bg-emerald-50 text-emerald-700'
    },
    {
      title: 'Member Claims',
      desc: 'Reimbursement workflows with zero double-counting.',
      href: '/finance/reimbursements',
      icon: UserCheck,
      color: 'bg-purple-50 text-purple-700'
    },
    {
      title: 'Field Advances',
      desc: 'Operational requisitions & settlement reconciler.',
      href: '/finance/advances',
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-700'
    },
    {
      title: 'Vaults & Banks',
      desc: 'Cash in hand, BRAC, DBBL, bKash & Nagad accounts.',
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Finance & Accounting Hub</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#A6772A]/15 text-[#A6772A]">
              Live Double-Entry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            We Can Change (WCC) Executive Treasury, Event Cost Allocations & Financial Analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/finance/event-expenses"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Receipt className="w-4 h-4" />
            <span>ইভেন্ট খরচ এন্ট্রি (Leader Form)</span>
          </Link>
          <Link
            href="/finance/transactions"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Transaction</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liquidity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Liquidity</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            ৳ {(data?.totalLiquidity || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400">Available across all cash vaults & bank accounts</p>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Inflows</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-blue-600">
            ৳ {(data?.totalIncome || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400">Grants, donor support & membership fees</p>
        </div>

        {/* Total Expense */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Incurred Outflows</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#B62A35] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#B62A35]">
            ৳ {(data?.totalExpense || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400">Field camps, materials & operational expenses</p>
        </div>

        {/* Pending Claims */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Claims</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-600">
            ৳ {(data?.pendingClaims || 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400">Unsettled personal member expense claims</p>
        </div>
      </div>

      {/* Sub-module Navigation Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Financial Sub-Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-[#B62A35]/30 transition-all space-y-3 group"
              >
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
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
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
            <h3 className="font-bold text-sm text-slate-900">Vaults & Bank Balances</h3>
            <Link href="/finance/accounts" className="text-xs font-bold text-[#B62A35] hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.accountsSummary || []).map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{acc.name}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{acc.type}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-sm text-slate-900">৳ {acc.balance.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Spend Distribution */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Expense Allocation by Category</h3>
            <span className="text-xs text-slate-400 font-medium">Categorized Outflows</span>
          </div>

          <div className="space-y-3">
            {Object.entries(data?.categorySpend || {}).map(([cat, amount]) => {
              const totalExp = data?.totalExpense || 1;
              const percent = Math.round((amount / totalExp) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{cat}</span>
                    <span className="text-slate-900 font-mono">
                      ৳ {amount.toLocaleString()} ({percent}%)
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
            })}
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
                আর্থিক প্রবাহ এনালিটিক্স (Monthly Income vs Expense Trend)
              </h3>
              <p className="text-xs text-slate-500">
                মাসভিত্তিক মোট আয় এবং ব্যয়ের তুলনামূলক রিয়েল-টাইম বার গ্রাফ ও অনুপাত
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-500" />
              <span className="text-slate-700">Inflows (আয়)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#B62A35]" />
              <span className="text-slate-700">Outflows (ব্যয়)</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="space-y-4">
          {(() => {
            const trends = data?.monthlyTrends || [];
            const activeMonths = trends.filter(m => m.income > 0 || m.expense > 0);
            const displayMonths = activeMonths.length > 0 ? activeMonths : trends.slice(0, 6);
            const maxVal = Math.max(...displayMonths.map(m => Math.max(m.income, m.expense)), 1);

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {displayMonths.map((m) => {
                  const incHeight = Math.max(Math.round((m.income / maxVal) * 100), m.income > 0 ? 8 : 2);
                  const expHeight = Math.max(Math.round((m.expense / maxVal) * 100), m.expense > 0 ? 8 : 2);
                  const net = m.income - m.expense;

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
                            {m.income > 0 ? `${Math.round(m.income / 1000)}k` : '0'}
                          </span>
                          <div
                            className="w-full bg-blue-500 rounded-t-md transition-all duration-500 hover:brightness-110"
                            style={{ height: `${incHeight}%` }}
                            title={`Income: ৳ ${m.income.toLocaleString()}`}
                          />
                        </div>

                        {/* Expense Bar */}
                        <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <span className="text-[9px] font-mono font-bold text-[#B62A35] truncate">
                            {m.expense > 0 ? `${Math.round(m.expense / 1000)}k` : '0'}
                          </span>
                          <div
                            className="w-full bg-[#B62A35] rounded-t-md transition-all duration-500 hover:brightness-110"
                            style={{ height: `${expHeight}%` }}
                            title={`Expense: ৳ ${m.expense.toLocaleString()}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 text-center text-[10px] pt-1 border-t border-slate-200/60">
                        <div className="text-blue-600 font-bold">আয়: ৳{m.income.toLocaleString()}</div>
                        <div className="text-[#B62A35] font-bold">ব্যয়: ৳{m.expense.toLocaleString()}</div>
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
                ইভেন্ট ও প্রোগ্রামভিত্তিক খরচের খতিয়ান (Leader Cost Submissions)
              </h3>
              <p className="text-xs text-slate-500">
                কোন লিডার কোন ইভেন্টের জন্য কত খরচ জমা দিয়েছেন তার পুঙ্খানুপুঙ্খ বিবরণ
              </p>
            </div>
          </div>

          <Link
            href="/finance/event-expenses"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন খরচ যোগ করুন</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">ইভেন্ট / কর্মসূচির নাম</th>
                <th className="py-3 px-3">খরচের আইটেম সংখ্যা</th>
                <th className="py-3 px-3">দাখিলকারী লিডার / অ্যাডমিন</th>
                <th className="py-3 px-3 text-right">মোট খরচের পরিমাণ</th>
                <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.eventWiseExpenses || []).length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-slate-400">
                    কোন ইভেন্টভিত্তিক খরচ এখনও জমা দেওয়া হয়নি।
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
                        {evt.itemCount} টি আইটেম
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#B62A35]" />
                        <span>{evt.submittedBy}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-sm text-[#B62A35]">
                      ৳ {evt.totalAmount.toLocaleString()}
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
            <h3 className="font-bold text-sm text-slate-900">Recent Double-Entry Transactions</h3>
            <p className="text-xs text-slate-400">Master chronological ledger activity</p>
          </div>
          <Link href="/finance/transactions" className="text-xs font-bold text-[#B62A35] hover:underline">
            View Full Ledger →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.recentTransactions || []).map((txn) => {
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
                      {isIncome ? '+' : '-'} ৳ {txn.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={txn.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
