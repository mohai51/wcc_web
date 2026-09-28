'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import StatusBadge from '@/Components/StatusBadge';
import { useLanguage } from '@/context/LanguageContext';
import {
  AlertTriangle,
  Send,
  Search,
  CheckCircle2,
  Copy,
  Check,
  UploadCloud,
  Image as ImageIcon,
  X,
  MapPin,
  User,
  Phone,
  FileText,
  Clock,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function ReportIssuePage() {
  const { lang, tx, t } = useLanguage();
  const isBn = lang === 'bn';

  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'track'

  // Form State
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterContact: '',
    location: '',
    title: '',
    description: '',
    photoUrl: ''
  });
  const [filePreview, setFilePreview] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' | 'url'
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null); // { issueCode, title, createdAt }
  const [submitError, setSubmitError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Tracking State
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingError, setTrackingError] = useState(null);

  const fileInputRef = useRef(null);

  // Handle Photo File Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (under 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors((prev) => ({
        ...prev,
        photo: isBn ? 'ছবির আকার ৫ মেগাবাইটের কম হতে হবে' : 'Image file size must be less than 5MB'
      }));
      return;
    }

    // Validate image type
    if (!file.type.startsWith('image/')) {
      setFormErrors((prev) => ({
        ...prev,
        photo: isBn ? 'শুধুমাত্র ছবি ফাইল (PNG, JPG, JPEG, WEBP) সমর্থিত' : 'Only image files (PNG, JPG, JPEG, WEBP) are supported'
      }));
      return;
    }

    setFormErrors((prev) => {
      const copy = { ...prev };
      delete copy.photo;
      return copy;
    });

    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result);
      setFormData((prev) => ({ ...prev, photoUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setFilePreview(null);
    setFormData((prev) => ({ ...prev, photoUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.reporterName.trim()) {
      errors.reporterName = isBn ? 'আপনার নাম প্রদান করা আবশ্যক' : 'Reporter name is required';
    }
    if (!formData.reporterContact.trim()) {
      errors.reporterContact = isBn ? 'যোগাযোগের মোবাইল বা ইমেইল আবশ্যক' : 'Contact phone or email is required';
    } else if (formData.reporterContact.trim().length < 6) {
      errors.reporterContact = isBn ? 'সঠিক মোবাইল নম্বর বা ইমেইল ঠিকানা দিন' : 'Please enter a valid phone number or email';
    }
    if (!formData.location.trim()) {
      errors.location = isBn ? 'এলাকা বা ঠিকানার বিবরণ আবশ্যক' : 'Location / Area is required';
    }
    if (!formData.title.trim()) {
      errors.title = isBn ? 'সমস্যার শিরোনাম আবশ্যক' : 'Issue title is required';
    }
    if (!formData.description.trim()) {
      errors.description = isBn ? 'সমস্যার বিস্তারিত বিবরণ আবশ্যক' : 'Issue description is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Issue
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        reporterName: formData.reporterName.trim(),
        reporterContact: formData.reporterContact.trim(),
        location: formData.location.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        photoUrl: formData.photoUrl || ''
      };

      const res = await api.createIssue(payload);

      setSubmitSuccess({
        issueCode: res.issueCode,
        title: res.issue?.title || payload.title,
        createdAt: res.issue?.createdAt || new Date().toISOString()
      });

      // Reset form
      setFormData({
        reporterName: '',
        reporterContact: '',
        location: '',
        title: '',
        description: '',
        photoUrl: ''
      });
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Issue submission error:', err);
      setSubmitError(
        err.message ||
          (isBn
            ? 'সমস্যাটি জমা দিতে ব্যর্থ হয়েছে। অনুগ্রহ করে ইন্টারনেট সংযোগ পরীক্ষা করুন।'
            : 'Failed to submit issue. Please check your connection.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Copy Tracking Code
  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Jump to tracking tab with prefilled code
  const handleTrackSubmitted = (code) => {
    setTrackingCode(code);
    setActiveTab('track');
    handleTrackIssue(code);
  };

  // Track Issue by Code
  const handleTrackIssue = async (codeToSearch) => {
    const query = (codeToSearch || trackingCode).trim();
    if (!query) {
      setTrackingError(isBn ? 'একটি ট্র্যাকিং কোড লিখুন' : 'Please enter an issue tracking code');
      return;
    }

    setTrackingError(null);
    setTrackingResult(null);
    setTrackingLoading(true);

    try {
      const data = await api.trackIssueByCode(query);
      setTrackingResult(data);
    } catch (err) {
      console.error('Tracking error:', err);
      setTrackingError(
        err.message ||
          (isBn
            ? `'${query}' কোড সম্বলিত কোনো অভিযোগ পাওয়া যায়নি। অনুগ্রহ করে কোডটি পুনরায় চেক করুন।`
            : `No community issue found matching tracking code '${query}'. Please check the code.`)
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  const getStatusDescription = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          label: isBn ? 'পর্যালোচনাধীন' : 'Pending Review',
          desc: isBn
            ? 'আপনার সমস্যাটি নথিবদ্ধ করা হয়েছে এবং সমন্বয়কের যাচাই ও পর্যবেক্ষণের জন্য অপেক্ষায় রয়েছে।'
            : 'Your issue has been logged and queued for coordinator review and triage.',
          color: 'text-amber-700 bg-amber-50 border-amber-200'
        };
      case 'in_progress':
        return {
          label: isBn ? 'চলমান কার্যক্রম' : 'In Progress',
          desc: isBn
            ? 'ডব্লিউসিসি স্বেচ্ছাসেবক দল ঘটনাস্থল পর্যবেক্ষণ করছে বা স্থানীয় কর্তৃপক্ষের সাথে সমন্বয় করছে।'
            : 'WCC volunteer coordinators have dispatched a team or are coordinating with local authorities.',
          color: 'text-sky-700 bg-sky-50 border-sky-200'
        };
      case 'resolved':
        return {
          label: isBn ? 'সমাধান সম্পন্ন' : 'Resolved',
          desc: isBn
            ? 'এই নাগরিক সমস্যাটি সফলভাবে সমাধান করা হয়েছে।'
            : 'This civic issue has been addressed and successfully resolved by the team.',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        };
      default:
        return {
          label: status,
          desc: isBn ? 'সমন্বয়ক দ্বারা স্ট্যাটাস হালনাগাদ করা হয়েছে।' : 'Status updated by coordinator.',
          color: 'text-slate-700 bg-slate-50 border-slate-200'
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F1AD1A_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold tracking-wide">
            <AlertTriangle className="w-3.5 h-3.5 text-[#F1AD1A]" />
            <span>{isBn ? 'ডব্লিউসিসি নাগরিক সেবা ও অভিযোগ হটলাইন' : 'WCC Civic Hotline • Community Action'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            {isBn ? 'নাগরিক সেবা ও অভিযোগ নিবন্ধন' : 'Community Issue Reporting'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isBn
              ? 'ঝালকাঠি জেলা ও আশেপাশের যেকোনো সামাজিক, রাস্তাঘাট, শিক্ষা বা স্বাস্থ্য বিষয়ক সমস্যা সরাসরি রিপোর্ট করুন। একাউন্ট ছাড়াই যে কেউ অভিযোগ জমা দিতে ও রিয়েল-টাইম অগ্রগতি ট্র্যাক করতে পারেন।'
              : 'Report local civic, health, education, or infrastructure issues in Jhalakathi district. Anyone can report without an account and track real-time resolution progress.'}
          </p>

          {/* Tab Switcher */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur shadow-lg">
              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'report'
                    ? 'bg-[#B62A35] text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{isBn ? 'সমস্যা রিপোর্ট করুন' : 'Report an Issue'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'track'
                    ? 'bg-[#B62A35] text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>{isBn ? 'অগ্রগতি ট্র্যাক করুন' : 'Track My Issue'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* TAB 1: REPORT ISSUE FORM */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            {/* SUCCESS CONFIRMATION CARD */}
            {submitSuccess && (
              <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {isBn ? 'সফলভাবে জমা হয়েছে' : 'Submitted Successfully'}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                        {isBn ? 'সমস্যাটি ডব্লিউসিসিতে নথিবদ্ধ হয়েছে' : 'Issue Logged with WCC'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {submitSuccess.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* TRACKING CODE BOX */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/80 rounded-2xl p-5 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      {isBn ? 'আপনার অনন্য ট্র্যাকিং কোড' : 'Your Unique Tracking Code'}
                    </span>
                    <span className="text-xs text-amber-700">
                      {isBn ? 'কোডটি সংরক্ষণ করুন' : 'Save this code'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white rounded-xl p-3 sm:p-4 border border-amber-300/80 shadow-xs">
                    <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-slate-900 select-all">
                      {submitSuccess.issueCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(submitSuccess.issueCode)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-[#B62A35] text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>{isBn ? 'কোড কপি করুন' : 'Copy Code'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-amber-900/80 leading-relaxed">
                    {isBn ? (
                      <>
                        💡 অনুগ্রহ করে এই কোডটি সংরক্ষণ করুন। <strong>অগ্রগতি ট্র্যাক করুন</strong> ট্যাবে যেকোনো সময় এই কোড দিয়ে সমস্যার অবস্থা দেখতে পারবেন।
                      </>
                    ) : (
                      <>
                        💡 Please keep this code safe. You can use it on the <strong>Track My Issue</strong> tab anytime to see when a coordinator is assigned and monitor resolution status.
                      </>
                    )}
                  </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleTrackSubmitted(submitSuccess.issueCode)}
                    className="flex-1 py-3 px-4 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>{isBn ? 'এখনই অগ্রগতি ট্র্যাক করুন' : 'Track This Issue Now'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(null)}
                    className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    {isBn ? 'আরেকটি সমস্যা জমা দিন' : 'Submit Another Issue'}
                  </button>
                </div>
              </div>
            )}

            {/* FORM CONTAINER */}
            {!submitSuccess && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    {isBn ? 'নাগরিক সমস্যার তথ্য প্রদান' : 'Submit Community Issue'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {isBn ? (
                      <>
                        নিচের তথ্যগুলো পূরণ করুন। তারকাচিহ্নিত (<span className="text-rose-500">*</span>) ঘরগুলো পূরণ আবশ্যক।
                      </>
                    ) : (
                      <>
                        Fill in the details below. Required fields are marked with an asterisk (<span className="text-rose-500">*</span>).
                      </>
                    )}
                  </p>
                </div>

                {submitError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{submitError}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Reporter Details (Two Columns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Reporter Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        {isBn ? 'আপনার নাম' : 'Reporter Name'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={formData.reporterName}
                          onChange={(e) => {
                            setFormData({ ...formData, reporterName: e.target.value });
                            if (formErrors.reporterName) {
                              setFormErrors({ ...formErrors, reporterName: null });
                            }
                          }}
                          placeholder={isBn ? 'যেমন: তরিকুল ইসলাম' : 'e.g. Tariqul Islam'}
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-hidden transition-all ${
                            formErrors.reporterName
                              ? 'border-rose-300 focus:border-rose-500'
                              : 'border-slate-200 focus:border-[#B62A35]'
                          }`}
                        />
                      </div>
                      {formErrors.reporterName && (
                        <p className="text-xs text-rose-600 font-medium">
                          {formErrors.reporterName}
                        </p>
                      )}
                    </div>

                    {/* Reporter Contact */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        {isBn ? 'মোবাইল বা ইমেইল' : 'Contact Phone or Email'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          value={formData.reporterContact}
                          onChange={(e) => {
                            setFormData({ ...formData, reporterContact: e.target.value });
                            if (formErrors.reporterContact) {
                              setFormErrors({ ...formErrors, reporterContact: null });
                            }
                          }}
                          placeholder={isBn ? 'যেমন: ০১৭১XXXXXXX বা email@domain.com' : 'e.g. 017XXXXXXXX or email@domain.com'}
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-hidden transition-all ${
                            formErrors.reporterContact
                              ? 'border-rose-300 focus:border-rose-500'
                              : 'border-slate-200 focus:border-[#B62A35]'
                          }`}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {isBn
                          ? 'শুধুমাত্র সমন্বয়কদের সরাসরি যোগাযোগের জন্য ব্যবহৃত হবে। জনসম্মুখে প্রকাশ করা হবে না।'
                          : 'Will only be used by coordinators for dispatch updates. Never displayed publicly.'}
                      </span>
                      {formErrors.reporterContact && (
                        <p className="text-xs text-rose-600 font-medium">
                          {formErrors.reporterContact}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location / Area */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {isBn ? 'এলাকা বা ঠিকানার বিবরণ' : 'Location / Area'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => {
                          setFormData({ ...formData, location: e.target.value });
                          if (formErrors.location) {
                            setFormErrors({ ...formErrors, location: null });
                          }
                        }}
                        placeholder={
                          isBn
                            ? 'যেমন: কলেজ রোড, সরকারি উচ্চ বিদ্যালয় গেটের পাশে, ঝালকাঠি সদর'
                            : 'e.g. College Road, near Govt High School Gate, Jhalakathi Sadar'
                        }
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-hidden transition-all ${
                          formErrors.location
                            ? 'border-rose-300 focus:border-rose-500'
                            : 'border-slate-200 focus:border-[#B62A35]'
                        }`}
                      />
                    </div>
                    {formErrors.location && (
                      <p className="text-xs text-rose-600 font-medium">
                        {formErrors.location}
                      </p>
                    )}
                  </div>

                  {/* Issue Title */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {isBn ? 'সমস্যার শিরোনাম' : 'Issue Title'} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({ ...formData, title: e.target.value });
                          if (formErrors.title) {
                            setFormErrors({ ...formErrors, title: null });
                          }
                        }}
                        placeholder={
                          isBn
                            ? 'যেমন: ভাঙা কালভার্ট ব্রিজ দিয়ে শিক্ষার্থীদের যাতায়াত ঝুঁকিপূর্ণ'
                            : 'e.g. Broken Culvert bridge dangerous for students'
                        }
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-hidden transition-all ${
                          formErrors.title
                            ? 'border-rose-300 focus:border-rose-500'
                            : 'border-slate-200 focus:border-[#B62A35]'
                        }`}
                      />
                    </div>
                    {formErrors.title && (
                      <p className="text-xs text-rose-600 font-medium">
                        {formErrors.title}
                      </p>
                    )}
                  </div>

                  {/* Issue Description */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      {isBn ? 'বিস্তারিত বিবরণ' : 'Detailed Description'} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        if (formErrors.description) {
                          setFormErrors({ ...formErrors, description: null });
                        }
                      }}
                      placeholder={
                        isBn
                          ? 'সমস্যার প্রকৃতি, ঝুঁকির মাত্রা, কতদিন ধরে চলছে এবং প্রয়োজনীয় ব্যবস্থা সম্পর্কে লিখুন...'
                          : 'Describe the issue, hazards, duration, and urgency...'
                      }
                      className={`w-full p-3.5 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-hidden transition-all ${
                        formErrors.description
                          ? 'border-rose-300 focus:border-rose-500'
                          : 'border-slate-200 focus:border-[#B62A35]'
                      }`}
                    />
                    {formErrors.description && (
                      <p className="text-xs text-rose-600 font-medium">
                        {formErrors.description}
                      </p>
                    )}
                  </div>

                  {/* Photo Upload Section */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        {isBn ? 'ছবির প্রমাণ (ঐচ্ছিক)' : 'Photo Evidence (Optional)'}
                      </label>
                      <div className="flex gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setUploadMode('file')}
                          className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                            uploadMode === 'file'
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {isBn ? 'ফাইল আপলোড' : 'Upload File'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode('url')}
                          className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                            uploadMode === 'url'
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {isBn ? 'ছবির ইউআরএল' : 'Image URL'}
                        </button>
                      </div>
                    </div>

                    {uploadMode === 'file' ? (
                      <div>
                        {!filePreview ? (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-300 hover:border-[#B62A35] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-rose-50/20 group"
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-slate-400 group-hover:text-[#B62A35] group-hover:scale-105 transition-all">
                              <UploadCloud className="w-6 h-6" />
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-2">
                              {isBn ? 'ছবি আপলোড করতে ক্লিক করুন বা টেনে আনুন' : 'Click or drag photo here to upload'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              PNG, JPG, JPEG or WEBP ({isBn ? 'সর্বোচ্চ ৫ মেগাবাইট' : 'Max 5MB'})
                            </p>
                          </div>
                        ) : (
                          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-64 flex items-center justify-center group">
                            <img
                              src={filePreview}
                              alt="Uploaded issue evidence"
                              className="max-h-64 object-contain"
                            />
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="absolute top-3 right-3 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-colors cursor-pointer"
                              title={isBn ? 'ছবি মুছে ফেলুন' : 'Remove photo'}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="url"
                            value={formData.photoUrl}
                            onChange={(e) => {
                              setFormData({ ...formData, photoUrl: e.target.value });
                              setFilePreview(e.target.value);
                            }}
                            placeholder="https://images.unsplash.com/... or hosted image URL"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-[#B62A35] focus:outline-hidden transition-all"
                          />
                        </div>
                        {formData.photoUrl && (
                          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-48 flex items-center justify-center">
                            <img
                              src={formData.photoUrl}
                              alt="URL Preview"
                              className="max-h-48 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {formErrors.photo && (
                      <p className="text-xs text-rose-600 font-medium">{formErrors.photo}</p>
                    )}
                  </div>

                  {/* Submission Notice & Submit Button */}
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        {isBn
                          ? 'আপনার সমস্যাটি নথিবদ্ধ করে আমাদের স্থানীয় সমন্বয়ক ও স্বেচ্ছাসেবক দলের কাছে প্রেরণ করা হবে।'
                          : 'Your issue will be registered publicly and assigned to our local volunteer coordinators for action.'}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 px-6 bg-[#B62A35] hover:bg-[#9E1F2A] disabled:bg-slate-400 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>{isBn ? 'সমস্যা জমা দেওয়া হচ্ছে...' : 'Submitting Issue to WCC Dispatch...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>{isBn ? 'নাগরিক সমস্যাটি জমা দিন' : 'Submit Community Issue'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRACK MY ISSUE */}
        {activeTab === 'track' && (
          <div className="space-y-6">
            {/* Search Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {isBn ? 'সমস্যার অগ্রগতি ট্র্যাক করুন' : 'Track Your Issue'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {isBn ? (
                    <>
                      আপনার ট্র্যাকিং কোড (যেমন: <span className="font-mono text-slate-700 font-semibold">ISSUE-2026-XXXXXX</span>) লিখে সার্চ করুন।
                    </>
                  ) : (
                    <>
                      Enter your unique issue tracking code (e.g. <span className="font-mono text-slate-700 font-semibold">ISSUE-2026-XXXXXX</span>) to check the latest status and updates.
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    value={trackingCode}
                    onChange={(e) => {
                      setTrackingCode(e.target.value);
                      if (trackingError) setTrackingError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTrackIssue();
                      }
                    }}
                    placeholder={isBn ? 'ট্র্যাকিং কোড লিখুন (যেমন: ISSUE-2026-657361)' : 'Enter tracking code (e.g. ISSUE-2026-657361)'}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:bg-white focus:border-[#B62A35] focus:outline-hidden transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleTrackIssue()}
                  disabled={trackingLoading}
                  className="py-3 px-6 bg-slate-900 hover:bg-[#B62A35] disabled:bg-slate-400 text-white font-bold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                  {trackingLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isBn ? 'অনুসন্ধান চলছে...' : 'Tracking...'}</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>{isBn ? 'অগ্রগতি দেখুন' : 'Track Status'}</span>
                    </>
                  )}
                </button>
              </div>

              {trackingError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{trackingError}</div>
                </div>
              )}
            </div>

            {/* Tracking Result Card */}
            {trackingResult && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Header with Tracking Code & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {isBn ? 'ট্র্যাকিং কোড' : 'Tracking Code'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-black font-mono tracking-wider text-slate-900">
                        {trackingResult.issueCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(trackingResult.issueCode)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                        title={isBn ? 'কোড কপি করুন' : 'Copy code'}
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={trackingResult.status} />
                  </div>
                </div>

                {/* Status Explanation Banner */}
                {(() => {
                  const statusInfo = getStatusDescription(trackingResult.status);
                  return (
                    <div className={`p-4 rounded-2xl border text-xs sm:text-sm ${statusInfo.color} flex items-start gap-3`}>
                      <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-sm">{statusInfo.label}</span>
                        <p className="mt-0.5 leading-relaxed">{statusInfo.desc}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Issue Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900">
                      {trackingResult.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{trackingResult.location}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {trackingResult.description}
                  </div>

                  {/* Photo Evidence if present */}
                  {trackingResult.photoUrl && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {isBn ? 'সংযুক্ত ছবির প্রমাণ' : 'Photo Evidence Attached'}
                      </span>
                      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-80 flex items-center justify-center">
                        <img
                          src={trackingResult.photoUrl}
                          alt="Issue photo"
                          className="max-h-80 w-full object-contain bg-slate-900"
                        />
                      </div>
                    </div>
                  )}

                  {/* Timeline Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>
                        {isBn ? 'দাখিলের তারিখ: ' : 'Reported: '}
                        {new Date(trackingResult.createdAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>
                        {isBn ? 'সর্বশেষ আপডেট: ' : 'Last Updated: '}
                        {new Date(trackingResult.updatedAt || trackingResult.createdAt).toLocaleString(isBn ? 'bn-BD' : 'en-US')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
