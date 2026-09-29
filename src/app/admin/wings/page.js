'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  Search,
  Table as TableIcon,
  Grid,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldAlert,
  Image as ImageIcon,
  ListChecks,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminWingsPage() {
  const { lang, tx } = useLanguage();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [wings, setWings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Feedback states
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingWing, setEditingWing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    nameEn: '',
    nameBn: '',
    slug: '',
    description: '',
    missionPoints: [],
    coverImage: ''
  });
  const [missionInput, setMissionInput] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [wingToDelete, setWingToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Leader assignment state
  const [leaderModalOpen, setLeaderModalOpen] = useState(false);
  const [wingForLeader, setWingForLeader] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [selectedLeaderId, setSelectedLeaderId] = useState('');
  const [savingLeader, setSavingLeader] = useState(false);

  const handleOpenAssignLeader = async (wing) => {
    setWingForLeader(wing);
    setSelectedLeaderId(wing.leader?._id || wing.leader || '');
    setLeaderModalOpen(true);
    try {
      const data = await api.getUsers();
      setUsersList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load users:', e);
    }
  };

  const handleSaveLeader = async (e) => {
    e.preventDefault();
    if (!wingForLeader) return;
    setSavingLeader(true);
    try {
      await api.assignWingLeader(wingForLeader._id, selectedLeaderId || null);
      flashSuccess(
        tx(
          `উইং লিডার সফলভাবে নির্ধারিত হয়েছে (${wingForLeader.nameBn || wingForLeader.nameEn})!`,
          `Wing leader assigned successfully for ${wingForLeader.nameEn}!`
        )
      );
      setLeaderModalOpen(false);
      fetchWings();
    } catch (err) {
      setErrorMessage(err.message || tx('উইং লিডার অ্যাসাইন করতে সমস্যা হয়েছে।', 'Failed to assign wing leader.'));
    } finally {
      setSavingLeader(false);
    }
  };

  // 1. Check user role
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('wcc_user') : null;
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to parse user session:', e);
      } finally {
        setAuthChecked(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // 2. Fetch wings
  const fetchWings = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const data = await api.getWings();
      setWings(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load wings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked || user?.role !== 'admin') return;
    const timer = setTimeout(() => {
      fetchWings();
    }, 0);
    return () => clearTimeout(timer);
  }, [authChecked, user]);

  // Flash message clear
  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingWing(null);
    setFormData({
      nameEn: '',
      nameBn: '',
      slug: '',
      description: '',
      missionPoints: [],
      coverImage: ''
    });
    setMissionInput('');
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (wing) => {
    setEditingWing(wing);
    setFormData({
      nameEn: wing.nameEn || '',
      nameBn: wing.nameBn || '',
      slug: wing.slug || '',
      description: wing.description || '',
      missionPoints: Array.isArray(wing.missionPoints) ? [...wing.missionPoints] : [],
      coverImage: wing.coverImage || ''
    });
    setMissionInput('');
    setFormErrors({});
    setFormModalOpen(true);
  };

  // Auto-generate slug from nameEn if user hasn't typed custom slug
  const handleNameEnChange = (val) => {
    setFormData((prev) => {
      const next = { ...prev, nameEn: val };
      if (!editingWing && (!prev.slug || prev.slug === slugify(prev.nameEn))) {
        next.slug = slugify(val);
      }
      return next;
    });
  };

  const slugify = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Mission points tag management
  const handleAddMissionPoint = () => {
    const trimmed = missionInput.trim();
    if (trimmed && !formData.missionPoints.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        missionPoints: [...prev.missionPoints, trimmed]
      }));
      setMissionInput('');
    }
  };

  const handleRemoveMissionPoint = (index) => {
    setFormData((prev) => ({
      ...prev,
      missionPoints: prev.missionPoints.filter((_, i) => i !== index)
    }));
  };

  // Form Validation & Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.nameEn.trim()) errors.nameEn = tx('ইংরেজি নাম দেওয়া আবশ্যক', 'English name is required');
    if (!formData.nameBn.trim()) errors.nameBn = tx('বাংলা নাম দেওয়া আবশ্যক', 'Bangla name is required');
    if (!formData.slug.trim()) errors.slug = tx('ইউআরএল স্লাগ দেওয়া আবশ্যক', 'Slug is required');
    else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      errors.slug = tx('স্লাগে কেবল ছোট হাতের অক্ষর, সংখ্যা ও হাইফেন থাকতে পারে', 'Slug may only contain lowercase letters, numbers, and hyphens');
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const payload = {
        nameEn: formData.nameEn.trim(),
        nameBn: formData.nameBn.trim(),
        slug: formData.slug.trim().toLowerCase(),
        description: formData.description.trim(),
        missionPoints: formData.missionPoints,
        coverImage: formData.coverImage.trim()
      };

      if (editingWing) {
        await api.updateWing(editingWing._id, payload);
        flashSuccess(
          tx(
            `উইং "${payload.nameBn || payload.nameEn}" সফলভাবে আপডেট হয়েছে!`,
            `Wing "${payload.nameEn}" updated successfully!`
          )
        );
      } else {
        await api.createWing(payload);
        flashSuccess(
          tx(
            `উইং "${payload.nameBn || payload.nameEn}" সফলভাবে তৈরি হয়েছে!`,
            `Wing "${payload.nameEn}" created successfully!`
          )
        );
      }

      setFormModalOpen(false);
      fetchWings();
    } catch (err) {
      setFormErrors({ submit: err.message || tx('উইং সংরক্ষণ করতে সমস্যা হয়েছে।', 'Failed to save wing.') });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!wingToDelete) return;
    setDeleting(true);
    try {
      await api.deleteWing(wingToDelete._id);
      flashSuccess(
        tx(
          `উইং "${wingToDelete.nameBn || wingToDelete.nameEn}" মুছে ফেলা হয়েছে।`,
          `Wing "${wingToDelete.nameEn}" removed.`
        )
      );
      setDeleteModalOpen(false);
      setWingToDelete(null);
      fetchWings();
    } catch (err) {
      setErrorMessage(err.message || tx('উইং মুছতে সমস্যা হয়েছে।', 'Failed to delete wing.'));
    } finally {
      setDeleting(false);
    }
  };

  // Filtered list
  const filteredWings = wings.filter((w) => {
    const q = search.toLowerCase();
    return (
      (w.nameEn && w.nameEn.toLowerCase().includes(q)) ||
      (w.nameBn && w.nameBn.includes(q)) ||
      (w.slug && w.slug.toLowerCase().includes(q)) ||
      (w.description && w.description.toLowerCase().includes(q))
    );
  });

  // Access Control Guard
  if (!authChecked) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-rose-100 text-[#B62A35] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {tx('অ্যাডমিন অ্যাক্সেস প্রয়োজন', 'Admin Access Required')}
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {tx(
            'উইং ব্যবস্থাপনা মডিউল শুধুমাত্র সিস্টেম অ্যাডমিনিস্ট্রেটরদের জন্য সংরক্ষিত।',
            'The Wing Management suite is restricted to system administrators with elevated oversight privileges.'
          )}
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          {tx('ড্যাশবোর্ডে ফিরে যান', 'Return to Dashboard')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-[#B62A35] rounded-xl border border-rose-100 shadow-xs">
              <Sparkles className="w-5 h-5 text-[#B62A35]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {tx('উইং ব্যবস্থাপনা', 'Wings Management')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {tx(
                  'সাংগঠনিক স্তম্ভ, দ্বিভাষিক নাম, মূল লক্ষ্যসমূহ এবং পাবলিক পোর্টাল রুট পরিচালনা করুন।',
                  'Configure organizational pillars, bilingual titles, key mission goals, and public portal routing.'
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchWings}
            disabled={loading}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            title={tx('তালিকা রিফ্রেশ করুন', 'Refresh list')}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#B62A35]' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{tx('নতুন উইং', 'New Wing')}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-rose-600 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Jump to Wings */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-3.5 sm:p-4 rounded-2xl border border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-[#F1AD1A] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              {tx('সরাসরি উইং পেজে প্রবেশ করুন', 'Direct Wing Access')}
            </span>
            <span className="text-[11px] text-slate-400">
              {tx('নিচের যেকোনো উইংয়ে ক্লিক করলে সরাসরি সেই উইংয়ের পেজ ওপেন হবে:', 'Click any wing below to open its dedicated operational page:')}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {wings.map((w) => (
            <Link
              key={w._id || w.slug}
              href={`/wings/${w.slug}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                w.slug === 'education'
                  ? 'bg-[#B62A35] hover:bg-[#9E1F2A] text-white ring-1 ring-rose-400/50 scale-[1.02]'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white'
              }`}
              title={tx(`${w.nameBn || w.nameEn} পেজে যান`, `Go to ${w.nameEn} page`)}
            >
              <span>{w.slug === 'education' ? '🎓' : w.slug === 'health' ? '🏥' : w.slug === 'sports' ? '⚽' : w.slug === 'cultural' ? '🎨' : '🌱'}</span>
              <span>{lang === 'bn' ? (w.nameBn || w.nameEn) : (w.nameEn || w.nameBn)}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
          ))}
        </div>
      </div>

      {/* Search & Layout Toggle Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tx('উইংয়ের নাম বা স্লাগ দিয়ে অনুসন্ধান করুন...', 'Search wings by name or slug...')}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-[#B62A35] transition-all"
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <span className="text-xs font-bold text-slate-500">
            {tx('মোট:', 'Total:')} <span className="text-slate-900">{filteredWings.length}</span> {tx('টি উইং', 'Wings')}
          </span>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#B62A35] shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title={tx('টেবিল ভিউ', 'Table View')}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                viewMode === 'cards' ? 'bg-white text-[#B62A35] shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title={tx('কার্ড ভিউ', 'Card View')}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#B62A35] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">{tx('উইং লোড হচ্ছে...', 'Loading Wings...')}</p>
        </div>
      ) : filteredWings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">{tx('কোনো উইং পাওয়া যায়নি', 'No Wings Found')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {tx(
              search ? 'আপনার অনুসন্ধানের সাথে কোনো উইং মেলেনি।' : 'কার্যক্রম শুরু করতে প্রথম উইং তৈরি করুন।',
              search ? 'No wings matched your search criteria.' : 'Create the first operational wing to begin organizing community initiatives.'
            )}
          </p>
          {!search && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B62A35] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#9E1F2A] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{tx('প্রথম উইং তৈরি করুন', 'Create First Wing')}</span>
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* Table Layout */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="py-3.5 px-4">{tx('উইংয়ের নাম', 'Wing Name')}</th>
                  <th className="py-3.5 px-4">{tx('স্লাগ', 'Slug')}</th>
                  <th className="py-3.5 px-4">{tx('উইং লিডার', 'Wing Leader')}</th>
                  <th className="py-3.5 px-4">{tx('বিবরণ', 'Description')}</th>
                  <th className="py-3.5 px-4">{tx('মূল লক্ষ্যসমূহ', 'Mission Goals')}</th>
                  <th className="py-3.5 px-4 text-right">{tx('পদক্ষেপ', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWings.map((wing) => (
                  <tr key={wing._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/wings/${wing.slug}`}
                        className="flex items-center gap-3 group/link hover:opacity-90 transition-all cursor-pointer"
                        title={tx(`${wing.nameBn || wing.nameEn} পেজে যান`, `Go to ${wing.nameEn} page`)}
                      >
                        {wing.coverImage ? (
                          <img
                            src={wing.coverImage}
                            alt={wing.nameEn}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100 group-hover/link:ring-2 group-hover/link:ring-[#B62A35] transition-all"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 group-hover/link:bg-rose-50 group-hover/link:text-[#B62A35] transition-all">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm group-hover/link:text-[#B62A35] flex items-center gap-1.5 transition-colors">
                            <span>{lang === 'bn' ? (wing.nameBn || wing.nameEn) : (wing.nameEn || wing.nameBn)}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-[#B62A35] opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <span>{lang === 'bn' ? wing.nameEn : wing.nameBn}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold opacity-0 group-hover/link:opacity-100 transition-opacity">
                              {tx('• পেজে যান →', '• Go to page →')}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        href={`/wings/${wing.slug}`}
                        className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-[#B62A35] rounded-md border border-slate-200 hover:border-rose-200 transition-colors inline-flex items-center gap-1"
                        title={tx(`${wing.nameBn || wing.nameEn} পেজে যান`, `Go to ${wing.nameEn} page`)}
                      >
                        <span>/{wing.slug}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      {wing.leader ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={wing.leader.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                            alt={wing.leader.name}
                            className="w-7 h-7 rounded-full object-cover border border-amber-400"
                          />
                          <div>
                            <span className="font-bold text-slate-800 text-[11px] block">{wing.leader.name}</span>
                            <button
                              onClick={() => handleOpenAssignLeader(wing)}
                              className="text-[10px] text-purple-600 hover:underline font-semibold cursor-pointer"
                            >
                              {tx('পরিবর্তন', 'Change')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenAssignLeader(wing)}
                          className="text-[10px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg cursor-pointer"
                        >
                          {tx('+ লিডার নিয়োগ', '+ Assign Leader')}
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                        {wing.description || <span className="text-slate-400 italic">{tx('কোনো বিবরণ নেই', 'No description provided')}</span>}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {Array.isArray(wing.missionPoints) && wing.missionPoints.length > 0 ? (
                          wing.missionPoints.map((point, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold px-2 py-0.5 bg-rose-50 text-[#B62A35] rounded-md border border-rose-100"
                            >
                              {point}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">{tx('নেই', 'None')}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/wings/${wing.slug}`}
                          className="p-1.5 text-slate-600 hover:text-[#B62A35] hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                          title={tx('উইং পেজ দেখুন', 'View Wing Page')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(wing)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title={tx('উইং সম্পাদনা', 'Edit Wing')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setWingToDelete(wing); setDeleteModalOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title={tx('উইং মুছুন', 'Delete Wing')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWings.map((wing) => (
            <div
              key={wing._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Card Cover */}
              <Link
                href={`/wings/${wing.slug}`}
                className="h-36 bg-gradient-to-r from-slate-900 to-slate-800 relative overflow-hidden flex items-center justify-center cursor-pointer block group/cover"
                title={tx(`${wing.nameBn || wing.nameEn} পেজে যান`, `Go to ${wing.nameEn} page`)}
              >
                {wing.coverImage ? (
                  <img
                    src={wing.coverImage}
                    alt={wing.nameEn}
                    className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="text-white/30 flex flex-col items-center gap-1">
                    <Sparkles className="w-8 h-8" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{tx('WCC উইং', 'WCC Wing')}</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] px-2 py-0.5 bg-black/60 text-white rounded-md backdrop-blur-xs font-bold border border-white/10 flex items-center gap-1">
                    <span>/{wing.slug}</span>
                    <ExternalLink className="w-3 h-3 text-white/80" />
                  </span>
                </div>
              </Link>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <Link
                      href={`/wings/${wing.slug}`}
                      className="group/wtitle flex items-center gap-1.5 hover:text-[#B62A35] transition-colors"
                      title={tx(`${wing.nameBn || wing.nameEn} পেজে যান`, `Go to ${wing.nameEn} page`)}
                    >
                      <h3 className="font-black text-slate-900 text-base group-hover/wtitle:text-[#B62A35]">
                        {lang === 'bn' ? (wing.nameBn || wing.nameEn) : (wing.nameEn || wing.nameBn)}
                      </h3>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/wtitle:text-[#B62A35] transition-colors" />
                    </Link>
                    <span className="text-xs font-bold text-[#B62A35] shrink-0">
                      {lang === 'bn' ? wing.nameEn : wing.nameBn}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {wing.description || tx('এই উইংয়ের কোনো বিবরণ যোগ করা হয়নি।', 'No description provided for this wing.')}
                  </p>
                </div>

                {/* Wing Leader on Card */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">{tx('উইং লিডার', 'Wing Leader')}</span>
                  {wing.leader ? (
                    <div className="flex items-center gap-1.5">
                      <img
                        src={wing.leader.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                        alt={wing.leader.name}
                        className="w-5 h-5 rounded-full object-cover border border-amber-400"
                      />
                      <span className="text-xs font-bold text-slate-800">{wing.leader.name}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">{tx('নিযুক্ত নেই', 'Not Assigned')}</span>
                  )}
                </div>

                {/* Mission Points */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <ListChecks className="w-3.5 h-3.5 text-[#B62A35]" />
                    <span>{tx('মূল লক্ষ্যসমূহ', 'Mission Goals')} ({wing.missionPoints?.length || 0})</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(wing.missionPoints) && wing.missionPoints.length > 0 ? (
                      wing.missionPoints.map((point, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md"
                        >
                          {point}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">{tx('কোনো লক্ষ্য যোগ করা হয়নি', 'No mission points added')}</span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <Link
                    href={`/wings/${wing.slug}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#B62A35] hover:bg-[#9E1F2A] rounded-xl transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{tx('উইং দেখুন', 'View Wing')}</span>
                  </Link>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(wing)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{tx('সম্পাদনা', 'Edit')}</span>
                    </button>
                    <button
                      onClick={() => { setWingToDelete(wing); setDeleteModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title={tx('মুছুন', 'Delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 text-[#B62A35] rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingWing ? tx('উইং সম্পাদনা', 'Edit Wing') : tx('নতুন উইং তৈরি', 'Create New Wing')}
                </h3>
              </div>
              <button
                onClick={() => setFormModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formErrors.submit && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formErrors.submit}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {tx('ইংরেজি নাম', 'English Name')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEn}
                    onChange={(e) => handleNameEnChange(e.target.value)}
                    placeholder={tx('যেমন: Education Wing', 'e.g. Education Wing')}
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden transition-all ${
                      formErrors.nameEn ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#B62A35]'
                    }`}
                  />
                  {formErrors.nameEn && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{formErrors.nameEn}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {tx('বাংলা নাম', 'Bangla Name')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    placeholder={tx('যেমন: শিক্ষা উইং', 'e.g. শিক্ষা উইং')}
                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden transition-all ${
                      formErrors.nameBn ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#B62A35]'
                    }`}
                  />
                  {formErrors.nameBn && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{formErrors.nameBn}</p>}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {tx('ইউআরএল স্লাগ', 'URL Slug')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                    placeholder="e.g. education"
                    className={`w-full p-2.5 font-mono bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden transition-all ${
                      formErrors.slug ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-[#B62A35]'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {tx(
                    'অনন্য পাথ আইডেন্টিফায়ার (যেমন: /wings/' + (formData.slug || 'slug') + ')',
                    'Unique path identifier (e.g. /wings/' + (formData.slug || 'slug') + ')'
                  )}
                </p>
                {formErrors.slug && <p className="text-[10px] text-rose-600 mt-1 font-semibold">{formErrors.slug}</p>}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{tx('বিবরণ', 'Description')}</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={tx('এই উইংয়ের মূল রূপরেখা ও উদ্দেশ্য সংক্ষেপে লিখুন...', 'Summarize the core vision and civic purpose of this wing...')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#B62A35] focus:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{tx('কভার ছবির লিঙ্ক (URL)', 'Cover Image URL')}</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#B62A35] focus:outline-hidden transition-all"
                />
              </div>

              {/* Mission Points Manager */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700">{tx('মূল লক্ষ্যসমূহ', 'Mission Goals')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={missionInput}
                    onChange={(e) => setMissionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMissionPoint();
                      }
                    }}
                    placeholder={tx('একটি লক্ষ্য লিখে Enter চাপুন বা Add ক্লিক করুন...', 'Type a mission goal and press Enter...')}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#B62A35] focus:outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddMissionPoint}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {tx('যোগ করুন', 'Add')}
                  </button>
                </div>

                {formData.missionPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 max-h-28 overflow-y-auto">
                    {formData.missionPoints.map((point, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-slate-800 font-semibold rounded-lg border border-slate-200 shadow-2xs text-[11px]"
                      >
                        <span>{point}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMissionPoint(index)}
                          className="text-slate-400 hover:text-rose-600 font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  {tx('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold bg-[#B62A35] hover:bg-[#9E1F2A] text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{editingWing ? tx('উইং আপডেট করুন', 'Update Wing') : tx('উইং সংরক্ষণ করুন', 'Save Wing')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && wingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">{tx('উইং মুছুন', 'Delete Wing')}</h3>
              <p className="text-xs text-slate-500">
                {tx(
                  `আপনি কি নিশ্চিত যে "${wingToDelete.nameBn || wingToDelete.nameEn}" মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না।`,
                  `Are you sure you want to delete "${wingToDelete.nameEn}"? This action cannot be undone.`
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {tx('বাতিল', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {deleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>{tx('মুছে ফেলুন', 'Confirm Delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Wing Leader Modal */}
      {leaderModalOpen && wingForLeader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-purple-700">
                  {tx('উইং নেতৃত্ব ব্যবস্থাপনা', 'Wing Leadership Assignment')}
                </span>
                <h3 className="font-extrabold text-base text-slate-900">
                  {lang === 'bn' ? (wingForLeader.nameBn || wingForLeader.nameEn) : (wingForLeader.nameEn || wingForLeader.nameBn)}
                </h3>
              </div>
              <button
                onClick={() => setLeaderModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {tx(
                'এই উইংয়ের সার্বিক কার্যক্রম, কোর্স এবং বই আদান-প্রদান তদারকির জন্য একজন উইং লিডার নিয়োগ করুন।',
                'Assign a dedicated Wing Leader to oversee operations, educational courses, and book exchange activities for this wing.'
              )}
            </p>

            <form onSubmit={handleSaveLeader} className="space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {tx('সদস্য নির্বাচন করুন', 'Select Member')}
                </label>
                <select
                  value={selectedLeaderId}
                  onChange={(e) => setSelectedLeaderId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                >
                  <option value="">
                    {tx('-- কোনো লিডার নেই (পদ শূন্য) --', '-- No Leader (Position Vacant) --')}
                  </option>
                  {usersList.map((u) => (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {u.name} ({u.email}) - {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-purple-700" />
                  <span>{tx('উইং লিডারের দায়িত্ব ও ক্ষমতা:', 'Wing Leader Responsibilities & Scope:')}</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-purple-800">
                  <li>{tx('উইংয়ের সকল বই অনুদান অনুমোদন বা বাতিল', 'Review and approve/reject book donations')}</li>
                  <li>{tx('সদস্যদের বই রিকোয়েস্ট যাচাই ও অনুমোদন', 'Moderate and fulfill book requests')}</li>
                  <li>{tx('উইংয়ের অধীনে নতুন ফ্রি কোর্স ও লেকচার প্রকাশ', 'Publish and oversee free courses & syllabus')}</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLeaderModalOpen(false)}
                  disabled={savingLeader}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  {tx('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={savingLeader}
                  className="px-5 py-2.5 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingLeader && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{tx('সংরক্ষণ করুন', 'Save Leader')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
