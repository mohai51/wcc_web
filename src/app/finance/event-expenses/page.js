'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Receipt,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Sparkles,
  Layers,
  FileText,
  CreditCard,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

const EXPENSE_CATEGORIES = [
  'Medical Supplies & Medicine',
  'Food & Refreshment',
  'Transportation & Logistics',
  'Banner, Sound & Stage Setup',
  'Training Materials & Books',
  'Sports Goods & Equipment',
  'Venue / Space Rental',
  'Tree Saplings & Gardening',
  'Printing & Office Stationery',
  'Emergency Patient Support',
  'Volunteer Honorarium / Conveyance',
  'Miscellaneous'
];

export default function EventExpensesPage() {
  const router = useRouter();
  const { lang, tx } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [selectedEventType, setSelectedEventType] = useState('event'); // 'event' or 'program'
  const [selectedEventId, setSelectedEventId] = useState('');
  const [customEventTitle, setCustomEventTitle] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [generalRemarks, setGeneralRemarks] = useState('');

  // Itemized Expense Rows
  const [expenseRows, setExpenseRows] = useState([
    { id: '1', description: '', category: 'Medical Supplies & Medicine', amount: '', paidBy: '', vendor: '' },
    { id: '2', description: '', category: 'Food & Refreshment', amount: '', paidBy: '', vendor: '' }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const storedUser = localStorage.getItem('wcc_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setCurrentUser(parsed);
        }

        const [eventsData, programsData, accountsData] = await Promise.all([
          api.getEvents().catch(() => []),
          api.getPrograms().catch(() => []),
          api.getAccounts().catch(() => [])
        ]);

        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setPrograms(Array.isArray(programsData) ? programsData : []);
        setAccounts(Array.isArray(accountsData) ? accountsData : []);

        if (Array.isArray(accountsData) && accountsData.length > 0) {
          setSelectedAccountId(accountsData[0].accountId);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  const addExpenseRow = () => {
    setExpenseRows((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: '',
        category: 'Food & Refreshment',
        amount: '',
        paidBy: currentUser?.name || '',
        vendor: ''
      }
    ]);
  };

  const removeExpenseRow = (id) => {
    if (expenseRows.length === 1) {
      alert(lang === 'bn' ? 'কমপক্ষে একটি খরচের বিবরণ থাকতে হবে।' : 'At least one expense row is required.');
      return;
    }
    setExpenseRows((prev) => prev.filter((row) => row.id !== id));
  };

  const updateExpenseRow = (id, field, value) => {
    setExpenseRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const totalCalculatedAmount = expenseRows.reduce((sum, row) => {
    const val = parseFloat(row.amount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessResult(null);

    // Validate event name
    let finalTitle = '';
    let finalEventId = null;
    let finalProgramId = null;

    if (selectedEventType === 'event') {
      if (selectedEventId === 'custom' || !selectedEventId) {
        if (!customEventTitle.trim()) {
          setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে ইভেন্টের নাম লিখুন বা নির্বাচন করুন।' : 'Please specify the Event Name.');
          return;
        }
        finalTitle = customEventTitle.trim();
      } else {
        const found = events.find((ev) => ev._id === selectedEventId);
        finalTitle = found?.title || 'Event Expense';
        finalEventId = found?._id || selectedEventId;
      }
    } else {
      if (selectedEventId === 'custom' || !selectedEventId) {
        if (!customEventTitle.trim()) {
          setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে প্রোগ্রামের নাম লিখুন।' : 'Please specify the Program Name.');
          return;
        }
        finalTitle = customEventTitle.trim();
      } else {
        const found = programs.find((pr) => pr._id === selectedEventId);
        finalTitle = found?.title || 'Program Expense';
        finalProgramId = found?._id || selectedEventId;
      }
    }

    // Validate rows
    const validItems = expenseRows.filter(
      (r) => r.description.trim() && parseFloat(r.amount) > 0
    );

    if (validItems.length === 0) {
      setErrorMsg(
        lang === 'bn'
          ? 'অনুগ্রহ করে কমপক্ষে একটি খরচের বিবরণ ও সঠিক টাকার অঙ্ক উল্লেখ করুন।'
          : 'Please enter at least one valid expense description and positive amount.'
      );
      return;
    }

    const matchedAccount = accounts.find((a) => a.accountId === selectedAccountId);

    const payload = {
      date: expenseDate,
      eventTitle: finalTitle,
      eventId: finalEventId,
      programTitle: finalProgramId ? finalTitle : '',
      programId: finalProgramId,
      paymentMethod,
      accountId: selectedAccountId || 'WCC-ACC-000001',
      accountName: matchedAccount?.name || 'Cash in Hand (Main Vault)',
      submittedByName: currentUser?.name || currentUser?.email || 'Leader',
      submittedByRole: currentUser?.role || 'wing_leader',
      remarks: generalRemarks,
      items: validItems.map((item) => ({
        description: item.description.trim(),
        category: item.category,
        amount: parseFloat(item.amount),
        paidBy: item.paidBy.trim() || currentUser?.name || 'Leader',
        vendorOrMember: item.vendor.trim()
      }))
    };

    setSubmitting(true);
    try {
      const res = await api.createExpense(payload);
      setSuccessResult({
        title: finalTitle,
        count: validItems.length,
        total: totalCalculatedAmount,
        res
      });
      // Reset rows
      setExpenseRows([
        { id: Date.now().toString(), description: '', category: 'Medical Supplies & Medicine', amount: '', paidBy: '', vendor: '' }
      ]);
      setCustomEventTitle('');
      setGeneralRemarks('');
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'Failed to submit event expenses. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500">
          {tx('ইভেন্ট ও আর্থিক অ্যাকাউন্ট লোড হচ্ছে...', 'Loading events & treasury accounts...')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/finance" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {tx('ইভেন্ট ও প্রোগ্রামের বিস্তারিত খরচ এন্ট্রি', 'Event & Program Detailed Expense Entry')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B62A35]/10 text-[#B62A35]">
              Finance Hub Direct
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {tx(
              'উইং লিডার বা সমন্বয়ক যে কোনো ইভেন্ট/প্রোগ্রামের নাম দিয়ে ধাপে ধাপে একাধিক খরচের হিসাব জমা দিতে পারেন। এটি সরাসরি ফিন্যান্স হাবের মূল লেজার ও ড্যাশবোর্ডে যুক্ত হবে।',
              'Leaders can submit itemized multi-row expenses for any event or program. Automatically reflects across Central Ledger, Treasury, and Analytics.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/finance"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            <Building className="w-4 h-4 text-[#B62A35]" />
            <span>{tx('ফিন্যান্স ড্যাশবোর্ড', 'Finance Hub')}</span>
          </Link>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successResult && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm">
                {tx('খরচ সফলভাবে ফিন্যান্স হাবে সংরক্ষিত হয়েছে!', 'Event expenses submitted directly to Finance Hub!')}
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                <strong>{successResult.title}</strong> — {successResult.count} {tx('টি খরচের আইটেম', 'items')}, {tx('মোট খরচ', 'Total')}:{' '}
                <strong className="font-mono font-black text-emerald-900">৳ {successResult.total.toLocaleString()}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Link
              href="/finance"
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              {tx('ড্যাশবোর্ড এনালিটিক্স দেখুন', 'View Analytics')}
            </Link>
            <button
              onClick={() => setSuccessResult(null)}
              className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 text-xs font-bold rounded-lg hover:bg-emerald-100/50"
            >
              {tx('আরেকটি এন্ট্রি করুন', 'Add Another')}
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#B62A35] shrink-0" />
          <p className="text-xs font-semibold">{errorMsg}</p>
        </div>
      )}

      {/* Main Expense Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Event or Program */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#B62A35] flex items-center justify-center font-black text-xs">
                {tx('১', '1')}
              </div>
              <h3 className="font-black text-sm text-slate-900">
                {tx('ইভেন্ট / প্রোগ্রাম নির্বাচন ও প্রাথমিক তথ্য', 'Event / Program Selection & Basics')}
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {tx('যে আয়োজনের খরচ হচ্ছে', 'Activity Allocation')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#B62A35]" />
                <span>{tx('ধরণ', 'Type')}</span>
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedEventType('event')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedEventType === 'event'
                      ? 'bg-[#B62A35] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tx('ইভেন্ট', 'Event')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEventType('program')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    selectedEventType === 'program'
                      ? 'bg-[#B62A35] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tx('প্রোগ্রাম', 'Program')}
                </button>
              </div>
            </div>

            {/* Event dropdown or custom */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F1AD1A]" />
                <span>
                  {selectedEventType === 'event'
                    ? tx('ইভেন্টের নাম', 'Event Name')
                    : tx('প্রোগ্রামের নাম', 'Program Name')}
                </span>
                <span className="text-rose-500">*</span>
              </label>

              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#B62A35] focus:bg-white transition-all cursor-pointer"
              >
                <option value="">
                  {selectedEventType === 'event'
                    ? tx('-- বিদ্যমান ইভেন্ট নির্বাচন করুন --', '-- Choose existing event --')
                    : tx('-- বিদ্যমান প্রোগ্রাম নির্বাচন করুন --', '-- Choose existing program --')}
                </option>
                {selectedEventType === 'event'
                  ? events.map((ev) => (
                      <option key={ev._id} value={ev._id}>
                        {ev.title} ({new Date(ev.date).toLocaleDateString('bn-BD')}) - {ev.location}
                      </option>
                    ))
                  : programs.map((pr) => (
                      <option key={pr._id} value={pr._id}>
                        {pr.title}
                      </option>
                    ))}
                <option value="custom">
                  {tx('➕ অন্য কোনো নতুন ইভেন্ট / কর্মসূচির নাম লিখুন', '➕ Enter Custom Event Name manually')}
                </option>
              </select>

              {(selectedEventId === 'custom' || (!selectedEventId && events.length === 0)) && (
                <input
                  type="text"
                  placeholder={tx('ইভেন্টের নাম লিখুন (যেমন: ফ্রি মেডিকেল ও চক্ষু শিবির ২০২৬)...', 'Enter event name (e.g. Free Eye Camp 2026)...')}
                  value={customEventTitle}
                  onChange={(e) => setCustomEventTitle(e.target.value)}
                  className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#B62A35] focus:bg-white transition-all"
                />
              )}
            </div>

            {/* Expense Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{tx('খরচের তারিখ', 'Expense Date')}</span>
              </label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-[#B62A35] focus:bg-white transition-all"
              />
            </div>

            {/* Treasury Vault Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>{tx('টাকা পরিশোধের ফান্ড / ভল্ট', 'Paid From Account')}</span>
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#B62A35] focus:bg-white transition-all cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc.accountId} value={acc.accountId}>
                    {acc.name} (৳ {acc.currentBalance?.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>{tx('পেমেন্ট মাধ্যম', 'Payment Method')}</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#B62A35] focus:bg-white transition-all cursor-pointer"
              >
                <option value="Cash">{tx('Cash (নগদ)', 'Cash (In-hand)')}</option>
                <option value="bKash">{tx('bKash (বিকাশ)', 'bKash (Mobile Banking)')}</option>
                <option value="Nagad">{tx('Nagad (নগদ ওয়ালেট)', 'Nagad (Mobile Banking)')}</option>
                <option value="Bank Transfer">{tx('Bank Transfer (ব্যাংক ট্রান্সফার)', 'Bank Transfer')}</option>
                <option value="Cheque">{tx('Cheque (চেক)', 'Cheque')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Multiple Itemized Expenses */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#F1AD1A] flex items-center justify-center font-black text-xs">
                {tx('২', '2')}
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">
                  {tx('খরচের বিস্তারিত বিবরণ ও টাকার পরিমাণ', 'Itemized Expense Details & Amounts')}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {tx('একটি ইভেন্টের জন্য যতগুলো খুশি আলাদা আলাদা খরচ যোগ করুন', 'Add as many individual expense items as needed for this event')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addExpenseRow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B62A35]/10 hover:bg-[#B62A35] text-[#B62A35] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{tx('নতুন খরচের সারি যোগ করুন', 'Add Expense Item')}</span>
            </button>
          </div>

          {/* Rows Container */}
          <div className="space-y-3">
            {expenseRows.map((row, index) => (
              <div
                key={row.id}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-black">
                      {index + 1}
                    </span>
                    <span>{tx('খরচের আইটেম', 'Item')} #{index + 1}</span>
                  </span>

                  {expenseRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExpenseRow(row.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title={tx('এই আইটেম মুছুন', 'Delete row')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Description */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      {tx('খরচের বিবরণ', 'Expense Description')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={tx('যেমন: ডাক্তারদের জন্য লাঞ্চ ও নাস্তা...', 'e.g. 50 Lunch packets for volunteers')}
                      value={row.description}
                      onChange={(e) => updateExpenseRow(row.id, 'description', e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#B62A35]"
                    />
                  </div>

                  {/* Category */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      {tx('ক্যাটাগরি', 'Category')}
                    </label>
                    <select
                      value={row.category}
                      onChange={(e) => updateExpenseRow(row.id, 'category', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:border-[#B62A35] cursor-pointer"
                    >
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount (BDT) */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      {tx('পরিমাণ (টাকা)', 'Amount (BDT)')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ৳
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        placeholder="0"
                        value={row.amount}
                        onChange={(e) => updateExpenseRow(row.id, 'amount', e.target.value)}
                        required
                        className="w-full bg-white border border-slate-200 rounded-xl pl-6 pr-3 py-2 text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#B62A35]"
                      />
                    </div>
                  </div>

                  {/* Paid By (Leader / Person) */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">
                      {tx('কে পরিশোধ করেছেন', 'Paid By (Name)')}
                    </label>
                    <input
                      type="text"
                      placeholder={currentUser?.name || 'Responsible Leader'}
                      value={row.paidBy}
                      onChange={(e) => updateExpenseRow(row.id, 'paidBy', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#B62A35]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary Footer Strip */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                {tx('মোট সমন্বিত খরচ', 'Total Cumulative Event Expense')}
              </span>
              <p className="text-[11px] text-slate-300">
                {expenseRows.length} {tx('টি আইটেম সংগৃহীত', 'items entered')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F1AD1A]">{tx('মোট:', 'Total:')}</span>
              <h3 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
                ৳ {totalCalculatedAmount.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        {/* Step 3: Leader Submitter Info & Submit Action */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
                {tx('৩', '3')}
              </div>
              <h3 className="font-black text-sm text-slate-900">
                {tx('দাখিলকারীর তথ্য ও চূড়ান্ত সংরক্ষণ', 'Submitter Verification & Final Record')}
              </h3>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">
              Direct Audit Logged
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {tx('দাখিলকারী লিডার / অ্যাডমিন', 'Submitter Profile')}
              </span>
              <div className="font-bold text-slate-900 text-sm">{currentUser?.name || 'Authenticated Leader'}</div>
              <div className="text-slate-500 text-[11px]">
                {currentUser?.email} •{' '}
                <span className="uppercase text-[#B62A35] font-bold">{currentUser?.role || 'Leader'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600">
                {tx('সার্বিক নোট বা মন্তব্য (যদি থাকে)', 'General Notes / Reference')}
              </label>
              <textarea
                rows="2"
                placeholder={tx('ভাউচার বা বিশেষ তথ্য থাকলে লিখুন...', 'Add notes, invoice refs, or details...')}
                value={generalRemarks}
                onChange={(e) => setGeneralRemarks(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#B62A35] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
            <Link
              href="/finance"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors text-center"
            >
              {tx('বাতিল করুন', 'Cancel')}
            </Link>

            <button
              type="submit"
              disabled={submitting || totalCalculatedAmount <= 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 bg-[#B62A35] hover:bg-[#9E1F2A] disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{tx('সংরক্ষণ হচ্ছে...', 'Saving to Treasury...')}</span>
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  <span>{tx('ফিন্যান্স হাবে খরচ জমা দিন', 'Submit Expenses to Finance Hub')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
