'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Target,
  Layers,
  Sparkles,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  BookMarked,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Phone,
  Mail,
  Play,
  HeartHandshake,
  Search,
  ExternalLink,
  BookCheck,
  Inbox,
  Send,
  Eye,
  Check,
  X
} from 'lucide-react';

export default function WingDetailPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;

  const [wing, setWing] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Active Tab for Education Wing
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'courses' | 'books' | 'leader_panel'

  // Education Wing Specific States
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  // Book Library States
  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [bookCategory, setBookCategory] = useState('All');
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [requestModalBook, setRequestModalBook] = useState(null);
  const [myHistoryTab, setMyHistoryTab] = useState(false);
  const [myDonations, setMyDonations] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  // Book Donation Form
  const [donateForm, setDonateForm] = useState({
    title: '',
    author: '',
    edition: '',
    category: 'Academic',
    condition: 'Good',
    pickupLocation: 'ঝালকাঠি সদর',
    phone: '',
    description: ''
  });
  const [submittingDonate, setSubmittingDonate] = useState(false);

  // Book Request Form
  const [requestForm, setRequestForm] = useState({
    reason: '',
    deliveryAddress: 'ঝালকাঠি সদর',
    contactPhone: ''
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Leader / Moderation Panel States
  const [pendingBooks, setPendingBooks] = useState([]);
  const [allBookRequests, setAllBookRequests] = useState([]);
  const [leaderTab, setLeaderTab] = useState('donations'); // 'donations' | 'requests' | 'new_course'
  const [rejectModalItem, setRejectModalItem] = useState(null); // { type: 'book'|'request', id }
  const [rejectionReason, setRejectionReason] = useState('');

  // New Course Form State
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Skill Development',
    level: 'Beginner',
    duration: '৪ সপ্তাহ',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    instructorName: '',
    instructorTitle: 'শিক্ষা উইং মেন্টর',
    lessons: [
      { title: 'মডিউল ১: প্রাথমিক পরিচিতি', description: 'কোর্সের মূল বিষয়বস্তু ও উদ্দেশ্য।', videoUrl: 'https://www.youtube.com/embed/pQN-pnXPaVg', duration: '৪৫ মিনিট', order: 1 }
    ]
  });
  const [submittingCourse, setSubmittingCourse] = useState(false);

  // Flash Feedback
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wcc_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        if (parsed.phone) {
          setDonateForm(prev => ({ ...prev, phone: parsed.phone }));
          setRequestForm(prev => ({ ...prev, contactPhone: parsed.phone }));
        }
      }
    } catch (e) {
      setUser(null);
    }
  }, []);

  // Fetch Wing Data
  useEffect(() => {
    let ignore = false;
    async function loadData() {
      if (!slug) return;
      try {
        let currentWing;
        try {
          currentWing = await api.getWing(slug);
        } catch (err) {
          if (err.message?.includes('404') || err.message?.toLowerCase().includes('not found')) {
            if (!ignore) {
              setNotFound(true);
              setLoading(false);
            }
            return;
          }
          throw err;
        }

        if (!currentWing) {
          if (!ignore) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        const wingId = currentWing._id;
        const [programsData, eventsData] = await Promise.all([
          api.getPrograms({ wingId }).catch(() => []),
          api.getEvents({ wingId }).catch(() => [])
        ]);

        if (!ignore) {
          setWing(currentWing);
          setPrograms(Array.isArray(programsData) ? programsData : []);
          setEvents(Array.isArray(eventsData) ? eventsData : []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching wing details:', err);
          setError(err.message || 'Failed to load wing details. Please try again.');
          setLoading(false);
        }
      }
    }
    loadData();
    return () => { ignore = true; };
  }, [slug]);

  // Check if current user is Education Wing Leader or Admin
  const isLeaderOrAdmin = Boolean(
    user &&
    (user.role === 'admin' ||
      (wing?.leader && (String(wing.leader._id || wing.leader) === String(user.id || user._id) || wing.leader.email === user.email)) ||
      (user.role === 'wing_leader' && user.assignedWing === wing?._id)
    )
  );

  // Load Education Wing specific data (Courses & Books)
  const loadEducationData = async () => {
    if (slug !== 'education') return;
    setCoursesLoading(true);
    setBooksLoading(true);
    try {
      const [coursesData, booksData] = await Promise.all([
        api.getCourses().catch(() => []),
        api.getBooks({ status: 'approved' }).catch(() => [])
      ]);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (err) {
      console.error('Error loading education wing data:', err);
    } finally {
      setCoursesLoading(false);
      setBooksLoading(false);
    }
  };

  // Load Leader Moderation Data
  const loadLeaderData = async () => {
    if (!isLeaderOrAdmin || slug !== 'education') return;
    try {
      const [pendingBooksData, allReqsData] = await Promise.all([
        api.getBooks({ status: 'pending' }).catch(() => []),
        api.getBookRequests().catch(() => [])
      ]);
      setPendingBooks(Array.isArray(pendingBooksData) ? pendingBooksData : []);
      setAllBookRequests(Array.isArray(allReqsData) ? allReqsData : []);
    } catch (err) {
      console.error('Error loading leader moderation data:', err);
    }
  };

  // Load User's own Book History
  const loadMyBookHistory = async () => {
    if (!user || slug !== 'education') return;
    try {
      const [myDonationsData, myReqsData] = await Promise.all([
        api.getMyBookDonations().catch(() => []),
        api.getMyBookRequests().catch(() => [])
      ]);
      setMyDonations(Array.isArray(myDonationsData) ? myDonationsData : []);
      setMyRequests(Array.isArray(myReqsData) ? myReqsData : []);
    } catch (err) {
      console.error('Error loading my book history:', err);
    }
  };

  useEffect(() => {
    if (slug === 'education' && wing) {
      loadEducationData();
    }
  }, [slug, wing]);

  useEffect(() => {
    if (activeTab === 'leader_panel' && isLeaderOrAdmin) {
      loadLeaderData();
    }
    if (myHistoryTab && user) {
      loadMyBookHistory();
    }
  }, [activeTab, myHistoryTab, isLeaderOrAdmin, user]);

  // Handle Book Donation Submit
  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showFeedback('error', 'বই দান করতে অনুগ্রহ করে মেম্বার হিসেবে লগইন করুন।');
      return;
    }
    if (!donateForm.title || !donateForm.author) {
      showFeedback('error', 'বইয়ের নাম এবং লেখকের নাম দেওয়া আবশ্যক।');
      return;
    }

    setSubmittingDonate(true);
    try {
      await api.donateBook(donateForm);
      showFeedback('success', 'ধন্যবাদ! আপনার বই অনুদানের প্রস্তাবটি জমা হয়েছে। শিক্ষা উইং লিডারের অনুমোদনের পর এটি তালিকায় যুক্ত হবে।');
      setDonateModalOpen(false);
      setDonateForm({
        title: '',
        author: '',
        edition: '',
        category: 'Academic',
        condition: 'Good',
        pickupLocation: 'ঝালকাঠি সদর',
        phone: user?.phone || '',
        description: ''
      });
      loadMyBookHistory();
    } catch (err) {
      showFeedback('error', err.message || 'বই অনুদান জমা দিতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmittingDonate(false);
    }
  };

  // Handle Book Request Submit
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showFeedback('error', 'বই রিকোয়েস্ট করতে অনুগ্রহ করে মেম্বার হিসেবে লগইন করুন।');
      return;
    }
    if (!requestForm.reason || !requestForm.contactPhone) {
      showFeedback('error', 'রিকোয়েস্টের কারণ এবং যোগাযোগের ফোন নম্বর দেওয়া আবশ্যক।');
      return;
    }

    setSubmittingRequest(true);
    try {
      await api.requestBook(requestModalBook._id, requestForm);
      showFeedback('success', `"${requestModalBook.title}" বইটির জন্য আপনার রিকোয়েস্ট জমা হয়েছে! শিক্ষা উইং লিডার রিভিউ করবেন।`);
      setRequestModalBook(null);
      setRequestForm({
        reason: '',
        deliveryAddress: 'ঝালকাঠি সদর',
        contactPhone: user?.phone || ''
      });
      loadMyBookHistory();
    } catch (err) {
      showFeedback('error', err.message || 'বই রিকোয়েস্ট ব্যর্থ হয়েছে।');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Moderate Book Donation (Approve/Reject)
  const handleModerateBook = async (bookId, status, reason = '') => {
    try {
      await api.updateBookStatus(bookId, { status, rejectionReason: reason });
      showFeedback('success', `বই অনুদানটি সফলভাবে ${status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} হয়েছে!`);
      loadLeaderData();
      loadEducationData();
      setRejectModalItem(null);
      setRejectionReason('');
    } catch (err) {
      showFeedback('error', err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    }
  };

  // Moderate Book Request (Approve/Reject)
  const handleModerateRequest = async (requestId, status, reason = '') => {
    try {
      await api.updateBookRequestStatus(requestId, { status, rejectionReason: reason });
      showFeedback('success', `বুক রিকোয়েস্টটি ${status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} হয়েছে!`);
      loadLeaderData();
      setRejectModalItem(null);
      setRejectionReason('');
    } catch (err) {
      showFeedback('error', err.message || 'রিকোয়েস্ট স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    }
  };

  // Handle Launch New Course
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.description) {
      showFeedback('error', 'কোর্সের শিরোনাম ও বিবরণ আবশ্যক।');
      return;
    }

    setSubmittingCourse(true);
    try {
      await api.createCourse({
        ...courseForm,
        instructor: {
          name: courseForm.instructorName || user?.name || 'WCC Instructor',
          title: courseForm.instructorTitle,
          organization: 'উই ক্যান চেঞ্জ (WCC)'
        }
      });
      showFeedback('success', 'নতুন ফ্রি কোর্সটি সফলভাবে উন্মুক্ত করা হয়েছে!');
      setCourseForm({
        title: '',
        description: '',
        category: 'Skill Development',
        level: 'Beginner',
        duration: '৪ সপ্তাহ',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
        instructorName: '',
        instructorTitle: 'শিক্ষা উইং মেন্টর',
        lessons: [
          { title: 'মডিউল ১: প্রাথমিক পরিচিতি', description: 'কোর্সের মূল বিষয়বস্তু ও উদ্দেশ্য।', videoUrl: 'https://www.youtube.com/embed/pQN-pnXPaVg', duration: '৪৫ মিনিট', order: 1 }
        ]
      });
      loadEducationData();
      setLeaderTab('donations');
    } catch (err) {
      showFeedback('error', err.message || 'কোর্স তৈরি করতে ব্যর্থ হয়েছে।');
    } finally {
      setSubmittingCourse(false);
    }
  };

  // Handle Enroll in Course
  const handleEnrollCourse = async (courseId) => {
    if (!user) {
      showFeedback('error', 'কোর্সে এনরোল করতে প্রথমে মেম্বার লগইন করুন।');
      return;
    }
    try {
      const res = await api.enrollCourse(courseId);
      showFeedback('success', res.message || 'অভিনন্দন! আপনি সফলভাবে কোর্সে যুক্ত হয়েছেন।');
      loadEducationData();
      if (selectedCourse && selectedCourse._id === courseId) {
        setSelectedCourse(prev => ({
          ...prev,
          isEnrolled: true,
          enrolledMembers: [...(prev.enrolledMembers || []), user.id || user._id]
        }));
      }
    } catch (err) {
      showFeedback('error', err.message || 'এনরোলমেন্ট ব্যর্থ হয়েছে।');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('bn-BD', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="bg-slate-950 py-24 animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="h-6 w-32 bg-slate-800 rounded-full"></div>
            <div className="h-12 w-96 bg-slate-800 rounded-2xl"></div>
            <div className="h-4 w-2/3 bg-slate-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (notFound || !wing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">উইং খুঁজে পাওয়া যায়নি</h2>
        <p className="text-sm text-slate-500 max-w-md">
          অনুরোধ করা উইংটি বিদ্যমান নেই অথবা এর নাম পরিবর্তন করা হয়েছে।
        </p>
        <Link
          href="/wings"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B62A35] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#9E1F2A] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>সকল উইং দেখুন</span>
        </Link>
      </div>
    );
  }

  const isEducation = slug === 'education';

  // Filtered books
  const filteredBooks = books.filter(b => {
    const q = bookSearch.toLowerCase();
    const matchSearch =
      !q ||
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.pickupLocation?.toLowerCase().includes(q);
    const matchCategory = bookCategory === 'All' || b.category === bookCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Toast Feedback */}
      {feedback.message && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold transition-all animate-bounce ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800">
        {wing.coverImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={wing.coverImage}
              alt={wing.nameEn}
              className="w-full h-full object-cover opacity-25 filter blur-xs scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60"></div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 relative z-10 space-y-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              হোম
            </Link>
            <span>/</span>
            <Link href="/wings" className="hover:text-white transition-colors">
              উইংসমূহ
            </Link>
            <span>/</span>
            <span className="text-[#F1AD1A] font-bold">{wing.nameBn}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#B62A35]/20 border border-[#B62A35]/40 text-[#F1AD1A] text-xs font-extrabold uppercase tracking-wider">
                  {wing.slug} wing
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur text-slate-300 text-xs font-semibold">
                  {wing.nameEn}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {wing.nameBn} <span className="text-[#F1AD1A]">({wing.nameEn})</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-200 max-w-3xl leading-relaxed">
                {wing.description || 'ঝালকাঠি ও সমাজের ইতিবাচক রূপান্তরে যুব সমাজের সক্রিয় উদ্যোগ।'}
              </p>

              {/* Wing Leader Badge */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                {wing.leader ? (
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
                    <img
                      src={wing.leader.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt={wing.leader.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#F1AD1A]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F1AD1A]">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>উইং লিডার (Wing Leader)</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white">{wing.leader.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>উইং লিডার নিয়োগ প্রক্রিয়াধীন</span>
                  </div>
                )}

                {user && (
                  <span className="text-xs text-slate-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                    লগইন আছেন: <strong className="text-emerald-400">{user.name}</strong> ({user.role})
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="lg:col-span-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F1AD1A]">
                  উইং এক নজরে
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {isEducation ? (
                    <>
                      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">ফ্রি কোর্স</p>
                        <p className="text-2xl font-black text-white">{courses.length}</p>
                        <span className="text-[10px] text-emerald-400">সদস্যদের জন্য ফ্রি</span>
                      </div>
                      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">বই ভাণ্ডার</p>
                        <p className="text-2xl font-black text-white">{books.length}</p>
                        <span className="text-[10px] text-blue-400">আদান-প্রদান প্রস্তুত</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">প্রোগ্রাম</p>
                        <p className="text-2xl font-black text-white">{programs.length}</p>
                        <span className="text-[10px] text-emerald-400">উদ্যোগসমূহ</span>
                      </div>
                      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">ইভেন্টস</p>
                        <p className="text-2xl font-black text-white">{events.length}</p>
                        <span className="text-[10px] text-blue-400">মাঠপর্যায়ের কাজ</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="pt-2 border-t border-white/10 text-xs text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WCC অফিসিয়াল কৌশলগত উইং</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation for Education Wing */}
      {isEducation && (
        <section className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#B62A35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>উইং ওভারভিউ ও লক্ষ্য</span>
              </button>

              <button
                onClick={() => setActiveTab('courses')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'courses'
                    ? 'bg-[#B62A35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>ফ্রি কোর্সসমূহ ({courses.length})</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  FREE
                </span>
              </button>

              <button
                onClick={() => setActiveTab('books')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'books'
                    ? 'bg-[#B62A35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>বই কর্নার ও লাইব্রেরি ({books.length})</span>
              </button>

              {isLeaderOrAdmin && (
                <button
                  onClick={() => setActiveTab('leader_panel')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'leader_panel'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>উইং লিডার ড্যাশবোর্ড</span>
                  {(pendingBooks.length > 0 || allBookRequests.filter(r => r.status === 'pending').length > 0) && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Body Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & INITIATIVES                                            */}
        {/* ========================================================================= */}
        {(!isEducation || activeTab === 'overview') && (
          <>
            {/* Wing Leader Profile Card */}
            {wing.leader && (
              <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-md flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="flex items-center gap-5">
                  <img
                    src={wing.leader.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                    alt={wing.leader.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F1AD1A] shadow-md"
                  />
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F1AD1A]/20 text-[#F1AD1A] text-xs font-black">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>দায়িত্বপ্রাপ্ত উইং লিডার</span>
                    </div>
                    <h3 className="text-xl font-black text-white">{wing.leader.name}</h3>
                    <p className="text-xs text-slate-300">
                      উই ক্যান চেঞ্জ ({wing.nameBn}) তত্ত্বাবধায়ক ও পরিচালন সমন্বয়ক
                    </p>
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                      {wing.leader.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-300" />
                          <span>{wing.leader.email}</span>
                        </span>
                      )}
                      {wing.leader.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-300" />
                          <span>{wing.leader.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 text-center text-xs space-y-1 shrink-0">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">নেতৃত্ব ও নজরদারি</span>
                  <p className="font-bold text-white">বই অনুদান ও কোর্স অনুমোদন</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">সক্রিয় তত্ত্বাবধায়ক</span>
                </div>
              </section>
            )}

            {/* Strategic Mission Goals */}
            {Array.isArray(wing.missionPoints) && wing.missionPoints.length > 0 && (
              <section className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
                    কৌশলগত লক্ষ্যসমূহ
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                    {wing.nameBn}-এর মূল কার্যক্রম ও উদ্দেশ্য
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wing.missionPoints.map((point, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#B62A35] flex items-center justify-center shrink-0 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">{point}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          টেকসই উন্নয়ন ও নাগরিক সেবায় প্রত্যক্ষ সহযোগিতা।
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Wing Programs Section */}
            <section className="space-y-6">
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
                    চলমান ও সমাপ্ত কর্মসূচি
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                    উইং প্রোগ্রামসমূহ ({programs.length})
                  </h2>
                </div>
                <Link
                  href="/programs"
                  className="text-xs font-bold text-[#B62A35] hover:underline flex items-center gap-1"
                >
                  <span>সকল প্রোগ্রাম</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {programs.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  বর্তমানে এই উইংয়ের আওতায় কোনো প্রোগ্রাম তালিকাভুক্ত নেই।
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {programs.map(prog => (
                    <div
                      key={prog._id}
                      className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 hover:shadow-md transition-shadow"
                    >
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {prog.status || 'Active'}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{prog.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {prog.description || 'ঝালকাঠির স্থানীয় নাগরিকদের জন্য বিশেষ উন্নয়ন কর্মসূচি।'}
                      </p>
                      <div className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#B62A35]" />
                        <span>শুরু: {formatDate(prog.startDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: FREE COURSES (Education Wing Only)                                 */}
        {/* ========================================================================= */}
        {isEducation && activeTab === 'courses' && (
          <section className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
                  WCC শিক্ষা উদ্যোগ
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  বিনামূল্যে স্কিল ডেভেলপমেন্ট ও একাডেমিক কোর্সসমূহ
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  WCC-এর সকল নিবন্ধিত মেম্বারদের জন্য শতভাগ বিনামূল্যে উন্মুক্ত। যে কেউ ঘরে বসেই প্রফেশনাল স্কিল শিখতে পারবেন।
                </p>
              </div>

              {!user && (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B62A35] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#9E1F2A] transition-all shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>মেম্বার হয়ে ফ্রি এক্সেস নিন</span>
                </Link>
              )}
            </div>

            {coursesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">শীঘ্রই নতুন কোর্স লঞ্চ করা হবে</h3>
                <p className="text-xs text-slate-500">
                  শিক্ষা উইংয়ের মেন্টর টিম নতুন ফ্রি লেকচার ও কোর্স প্রস্তুত করছে।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <div
                    key={course._id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-44 bg-slate-900 relative overflow-hidden">
                        <img
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase shadow-xs">
                            100% FREE
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur text-white font-bold text-[10px]">
                            {course.category || 'General'}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {course.level || 'All Levels'}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {course.duration || 'Self-paced'}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2">
                          {course.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-2">
                            <img
                              src={course.instructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                              alt={course.instructor?.name || 'Instructor'}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="font-medium text-slate-700 truncate max-w-[120px]">
                              {course.instructor?.name || 'WCC Mentor'}
                            </span>
                          </div>
                          <span>{course.lessons?.length || 0} টি মডিউল</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveLessonIndex(0);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-[#B62A35] text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>কোর্সে প্রবেশ করুন</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: BOOK CORNER (Education Wing Only)                                  */}
        {/* ========================================================================= */}
        {isEducation && activeTab === 'books' && (
          <section className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
                  WCC বুক ব্যাংক ও এক্সচেঞ্জ
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  বই অনুদান ও বিনামূল্যে বই সংগ্রহ কর্নার
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  যেকোনো মেম্বার তাদের পুরাতন বা শিক্ষণীয় বই অন্য শিক্ষার্থীর জন্য দান করতে পারেন, এবং যাদের প্রয়োজন তারা সংগ্রহ করতে পারেন।
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDonateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B62A35] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#9E1F2A] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>বই দান করুন</span>
                </button>

                {user && (
                  <button
                    onClick={() => {
                      setMyHistoryTab(!myHistoryTab);
                      if (!myHistoryTab) loadMyBookHistory();
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      myHistoryTab
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <BookCheck className="w-4 h-4" />
                    <span>আমার বই ও রিকোয়েস্ট</span>
                  </button>
                )}
              </div>
            </div>

            {/* My Donations & Requests View */}
            {myHistoryTab && user && (
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">
                    আপনার জমাকৃত বই অনুদান ও বইয়ের রিকোয়েস্টসমূহ
                  </h3>
                  <button
                    onClick={() => setMyHistoryTab(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    বন্ধ করুন
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* My Book Donations */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                      <Send className="w-3.5 h-3.5 text-[#B62A35]" />
                      <span>আমার দান করা বই ({myDonations.length})</span>
                    </h4>
                    {myDonations.length === 0 ? (
                      <p className="text-xs text-slate-400">আপনি এখনও কোনো বই দান করেননি।</p>
                    ) : (
                      <div className="space-y-2">
                        {myDonations.map(b => (
                          <div
                            key={b._id}
                            className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-800">{b.title}</p>
                              <span className="text-[11px] text-slate-500">{b.author}</span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                b.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : b.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {b.status === 'approved'
                                ? 'অনুমোদিত'
                                : b.status === 'rejected'
                                ? 'বাতিল'
                                : 'যাচাইাধীন'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* My Book Requests */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                      <Inbox className="w-3.5 h-3.5 text-blue-600" />
                      <span>আমার বইয়ের রিকোয়েস্টসমূহ ({myRequests.length})</span>
                    </h4>
                    {myRequests.length === 0 ? (
                      <p className="text-xs text-slate-400">আপনি কোনো বইয়ের জন্য রিকোয়েস্ট করেননি।</p>
                    ) : (
                      <div className="space-y-2">
                        {myRequests.map(r => (
                          <div
                            key={r._id}
                            className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-800">{r.book?.title || 'বই'}</p>
                              <span className="text-[11px] text-slate-500">ঠিকানা: {r.deliveryAddress}</span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : r.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {r.status === 'approved'
                                ? 'অনুমোদিত'
                                : r.status === 'rejected'
                                ? 'বাতিল'
                                : 'যাচাইাধীন'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="বইয়ের নাম, লেখক বা স্থান দিয়ে খুঁজুন..."
                  value={bookSearch}
                  onChange={e => setBookSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#B62A35]"
                />
              </div>

              <select
                value={bookCategory}
                onChange={e => setBookCategory(e.target.value)}
                className="w-full sm:w-48 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#B62A35]"
              >
                <option value="All">সকল ক্যাটাগরি</option>
                <option value="Academic">স্কুল ও কলেজ পাঠ্যবই</option>
                <option value="BCS & Competitive Exams">বিসিএস ও চাকরি প্রস্তুতি</option>
                <option value="Science & Technology">বিজ্ঞান ও প্রযুক্তি</option>
                <option value="Literature & Novels">সাহিত্য ও উপন্যাস</option>
                <option value="Self Development">আত্মউন্নয়ন ও অন্যান্য</option>
              </select>
            </div>

            {/* Books Grid */}
            {booksLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">কোনো বই পাওয়া যায়নি</h3>
                <p className="text-xs text-slate-500">
                  আপনার পুরাতন বা বাড়তি বই দান করে অন্য শিক্ষার্থীকে সাহায্য করুন।
                </p>
                <button
                  onClick={() => setDonateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#B62A35] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>বই দান করুন</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredBooks.map(b => (
                  <div
                    key={b._id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-48 bg-slate-100 relative overflow-hidden">
                        <img
                          src={b.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur text-slate-800 shadow-xs">
                          {b.condition || 'Good'}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <span className="text-[10px] font-bold text-[#B62A35] uppercase">
                          {b.category || 'General'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                          {b.title}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium">লেখক: {b.author}</p>
                        {b.edition && (
                          <p className="text-[11px] text-slate-400">সংস্করণ: {b.edition}</p>
                        )}
                        <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{b.pickupLocation || 'ঝালকাঠি'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => {
                          if (!user) {
                            showFeedback('error', 'বই রিকোয়েস্ট করতে অনুগ্রহ করে লগইন করুন।');
                            return;
                          }
                          setRequestModalBook(b);
                        }}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-[#B62A35] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>বইটি রিকোয়েস্ট করুন</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: WING LEADER / ADMIN MODERATION PANEL                               */}
        {/* ========================================================================= */}
        {isEducation && activeTab === 'leader_panel' && isLeaderOrAdmin && (
          <section className="space-y-8 bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-md">
            <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>শিক্ষা উইং লিডার কন্ট্রোল প্যানেল</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  বই অনুদান, বই রিকোয়েস্ট ও কোর্স ব্যবস্থাপনা
                </h2>
                <p className="text-xs text-slate-500">
                  আপনি এই উইংয়ের দায়িত্বপ্রাপ্ত কর্মকর্তা হিসেবে সদস্যদের বই আবেদন যাচাই ও কোর্স পরিচালনা করতে পারেন।
                </p>
              </div>

              {/* Sub-tabs inside leader panel */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
                <button
                  onClick={() => setLeaderTab('donations')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    leaderTab === 'donations' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  পেন্ডিং বই অনুদান ({pendingBooks.length})
                </button>
                <button
                  onClick={() => setLeaderTab('requests')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    leaderTab === 'requests' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  পেন্ডিং বই রিকোয়েস্ট ({allBookRequests.filter(r => r.status === 'pending').length})
                </button>
                <button
                  onClick={() => setLeaderTab('new_course')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    leaderTab === 'new_course' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  + নতুন ফ্রি কোর্স
                </button>
              </div>
            </div>

            {/* Moderation Sub-Tab 1: Pending Book Donations */}
            {leaderTab === 'donations' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800">অনুমোদনের অপেক্ষায় থাকা বইসমূহ</h3>
                {pendingBooks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                    কোনো পেন্ডিং বই অনুদান নেই।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingBooks.map(b => (
                      <div
                        key={b._id}
                        className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-[#B62A35] uppercase">
                            {b.category} • অবস্থা: {b.condition}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                          <p className="text-xs text-slate-600">লেখক: {b.author}</p>
                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                            <span>দাতা: <strong>{b.donor?.name || 'অজ্ঞাত'}</strong></span>
                            {b.donor?.phone && <span>ফোন: {b.donor.phone}</span>}
                            <span>স্থান: {b.pickupLocation}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleModerateBook(b._id, 'approved')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>অনুমোদন করুন</span>
                          </button>
                          <button
                            onClick={() => setRejectModalItem({ type: 'book', id: b._id, title: b.title })}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 cursor-pointer flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>বাতিল</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Moderation Sub-Tab 2: Pending Book Requests */}
            {leaderTab === 'requests' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800">মেম্বারদের বইয়ের আবেদনসমূহ</h3>
                {allBookRequests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                    কোনো বইয়ের আবেদন নেই।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allBookRequests.map(r => (
                      <div
                        key={r._id}
                        className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : r.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {r.status === 'approved' ? 'অনুমোদিত' : r.status === 'rejected' ? 'বাতিল' : 'যাচাইাধীন'}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              আবেদনকারী: {r.requester?.name} ({r.requester?.phone})
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900">
                            বই: {r.book?.title || 'বই'} (লেখক: {r.book?.author})
                          </h4>
                          <p className="text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-200">
                            <strong>প্রয়োজনের কারণ:</strong> {r.reason}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            ঠিকানা: {r.deliveryAddress}
                          </p>
                        </div>

                        {r.status === 'pending' && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleModerateRequest(r._id, 'approved')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>অনুমোদন</span>
                            </button>
                            <button
                              onClick={() => setRejectModalItem({ type: 'request', id: r._id, title: r.book?.title })}
                              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 cursor-pointer flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>বাতিল</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Moderation Sub-Tab 3: Launch Free Course Form */}
            {leaderTab === 'new_course' && (
              <form onSubmit={handleCourseSubmit} className="space-y-4 max-w-2xl">
                <h3 className="text-sm font-bold text-slate-800">
                  WCC শিক্ষা উইং থেকে নতুন ফ্রি কোর্স উন্মুক্ত করুন
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">কোর্সের শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ফ্রন্টএন্ড ওয়েব ডেভেলপমেন্ট ফান্ডামেন্টালস"
                    value={courseForm.title}
                    onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">ক্যাটাগরি</label>
                    <input
                      type="text"
                      placeholder="Web Development / Spoken English"
                      value={courseForm.category}
                      onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">লেভেল</label>
                    <select
                      value={courseForm.level}
                      onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">সময়সীমা</label>
                    <input
                      type="text"
                      placeholder="৪ সপ্তাহ / ১০ ঘন্টা"
                      value={courseForm.duration}
                      onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">কোর্সের বিবরণ *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="কোর্সের বিস্তারিত বর্ণনা এবং শিক্ষার্থীরা কী শিখবে..."
                    value={courseForm.description}
                    onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ভিডিও লেকচার লিঙ্ক (YouTube Embed / Direct)</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/embed/..."
                    value={courseForm.lessons[0]?.videoUrl || ''}
                    onChange={e => {
                      const lessons = [...courseForm.lessons];
                      lessons[0] = { ...lessons[0], videoUrl: e.target.value };
                      setCourseForm({ ...courseForm, lessons });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingCourse}
                  className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {submittingCourse ? 'লঞ্চ হচ্ছে...' : 'কোর্সটি পাবলিশ করুন'}
                </button>
              </form>
            )}
          </section>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: DONATE BOOK FORM                                                 */}
      {/* ========================================================================= */}
      {donateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setDonateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#B62A35] uppercase">বই অনুদান করুন</span>
              <h3 className="text-xl font-black text-slate-900">অন্য শিক্ষার্থীর পাশে দাঁড়ান</h3>
              <p className="text-xs text-slate-500">
                আপনার দেওয়া বইটি শিক্ষা উইং লিডার যাচাই করে অন্য শিক্ষার্থীর কাছে পৌঁছে দেবেন।
              </p>
            </div>

            <form onSubmit={handleDonateSubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">বইয়ের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: উচ্চ মাধ্যমিক পদার্থবিজ্ঞান"
                  value={donateForm.title}
                  onChange={e => setDonateForm({ ...donateForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#B62A35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">লেখক / প্রকাশনী *</label>
                  <input
                    type="text"
                    required
                    placeholder="লেখকের নাম"
                    value={donateForm.author}
                    onChange={e => setDonateForm({ ...donateForm, author: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#B62A35]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">সংস্করণ / সাল</label>
                  <input
                    type="text"
                    placeholder="যেমন: ২০২৪"
                    value={donateForm.edition}
                    onChange={e => setDonateForm({ ...donateForm, edition: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#B62A35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ক্যাটাগরি</label>
                  <select
                    value={donateForm.category}
                    onChange={e => setDonateForm({ ...donateForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#B62A35]"
                  >
                    <option value="Academic">স্কুল ও কলেজ পাঠ্যবই</option>
                    <option value="BCS & Competitive Exams">বিসিএস ও চাকরি প্রস্তুতি</option>
                    <option value="Science & Technology">বিজ্ঞান ও প্রযুক্তি</option>
                    <option value="Literature & Novels">সাহিত্য ও উপন্যাস</option>
                    <option value="Self Development">আত্মউন্নয়ন ও অন্যান্য</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">বইয়ের অবস্থা</label>
                  <select
                    value={donateForm.condition}
                    onChange={e => setDonateForm({ ...donateForm, condition: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#B62A35]"
                  >
                    <option value="New">একদম নতুন (New)</option>
                    <option value="Like New">নতুন প্রায় (Like New)</option>
                    <option value="Good">ভালো (Good)</option>
                    <option value="Fair">পড়ার উপযোগী (Fair)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">বই হস্তান্তরের স্থান</label>
                  <input
                    type="text"
                    placeholder="ঝালকাঠি সদর"
                    value={donateForm.pickupLocation}
                    onChange={e => setDonateForm({ ...donateForm, pickupLocation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#B62A35]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">যোগাযোগের ফোন নম্বর</label>
                  <input
                    type="text"
                    placeholder="017xxxxxxxx"
                    value={donateForm.phone}
                    onChange={e => setDonateForm({ ...donateForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#B62A35]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">সংক্ষিপ্ত বিবরণ</label>
                <textarea
                  rows={2}
                  placeholder="বই সম্পর্কে কোনো বিশেষ মন্তব্য..."
                  value={donateForm.description}
                  onChange={e => setDonateForm({ ...donateForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#B62A35]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDonateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingDonate}
                  className="px-6 py-2 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {submittingDonate ? 'জমা হচ্ছে...' : 'অনুদানের জন্য জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REQUEST BOOK FORM                                                */}
      {/* ========================================================================= */}
      {requestModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setRequestModalBook(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 uppercase">বিনামূল্যে বই সংগ্রহ</span>
              <h3 className="text-xl font-black text-slate-900">
                &quot;{requestModalBook.title}&quot; বইটির জন্য রিকোয়েস্ট
              </h3>
              <p className="text-xs text-slate-500">
                লেখক: {requestModalBook.author} • স্থান: {requestModalBook.pickupLocation}
              </p>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">বইটি কেন প্রয়োজন? (শিক্ষাগত কারণ) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="যেমন: আমি এইচএসসি বিজ্ঞান বিভাগের শিক্ষার্থী, এই বইটি আমার পরীক্ষার প্রস্তুতির জন্য খুব দরকার..."
                  value={requestForm.reason}
                  onChange={e => setRequestForm({ ...requestForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">বই সংগ্রহের ঠিকানা *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ঝালকাঠি কলেজ মোড়"
                  value={requestForm.deliveryAddress}
                  onChange={e => setRequestForm({ ...requestForm, deliveryAddress: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">আপনার মোবাইল নম্বর *</label>
                <input
                  type="text"
                  required
                  placeholder="017xxxxxxxx"
                  value={requestForm.contactPhone}
                  onChange={e => setRequestForm({ ...requestForm, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRequestModalBook(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {submittingRequest ? 'রিকোয়েস্ট হচ্ছে...' : 'রিকোয়েস্ট জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: COURSE VIEWER & LESSON PLAYER                                    */}
      {/* ========================================================================= */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            {/* Header */}
            <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                  WCC ফ্রি কোর্স
                </span>
                <h3 className="text-base sm:text-lg font-black">{selectedCourse.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video & Lessons Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
              {/* Left: Video Player & Description */}
              <div className="lg:col-span-8 p-4 sm:p-6 space-y-4 border-r border-slate-200">
                {selectedCourse.lessons?.[activeLessonIndex]?.videoUrl ? (
                  <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-md">
                    <iframe
                      src={selectedCourse.lessons[activeLessonIndex].videoUrl}
                      title={selectedCourse.lessons[activeLessonIndex].title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
                    ভিডিও লেকচার শীঘ্রই আপলোড হবে
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-base font-bold text-slate-900">
                    {selectedCourse.lessons?.[activeLessonIndex]?.title || 'লেকচার'}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedCourse.lessons?.[activeLessonIndex]?.description || selectedCourse.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedCourse.instructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                      alt="Instructor"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-slate-800">{selectedCourse.instructor?.name || 'WCC Mentor'}</p>
                      <span className="text-[10px] text-slate-400">{selectedCourse.instructor?.title}</span>
                    </div>
                  </div>

                  {!user ? (
                    <Link
                      href="/login"
                      className="px-4 py-2 bg-[#B62A35] text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      লগইন করে সম্পূর্ণ এক্সেস নিন
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleEnrollCourse(selectedCourse._id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{selectedCourse.isEnrolled ? 'এনরোল্ড (অধ্যয়নরত)' : 'বিনামূল্যে এনরোল করুন'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Modules / Syllabus */}
              <div className="lg:col-span-4 p-4 sm:p-6 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase">কোর্স মডিউল ও লেকচারসমূহ</h4>
                <div className="space-y-2">
                  {selectedCourse.lessons?.map((les, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveLessonIndex(idx)}
                      className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                        activeLessonIndex === idx
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Play className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${activeLessonIndex === idx ? 'fill-white' : 'text-slate-400'}`} />
                      <div className="space-y-0.5">
                        <p className="font-bold line-clamp-1">{les.title}</p>
                        <span className={`text-[10px] ${activeLessonIndex === idx ? 'text-slate-300' : 'text-slate-400'}`}>
                          {les.duration || 'লেকচার'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REJECTION CONFIRMATION WITH REASON                               */}
      {/* ========================================================================= */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-rose-700 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>আবেদন বাতিলের কারণ উল্লেখ করুন</span>
            </h3>
            <p className="text-xs text-slate-600">
              &quot;{rejectModalItem.title}&quot; বাতিল করার পেছনের কারণ প্রদান করুন (সদস্যের সুবিধার্থে):
            </p>
            <textarea
              rows={3}
              placeholder="যেমন: বইটির পৃষ্ঠা ক্ষতিগ্রস্ত অথবা পর্যাপ্ত তথ্য নেই..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                বন্ধ
              </button>
              <button
                onClick={() => {
                  if (rejectModalItem.type === 'book') {
                    handleModerateBook(rejectModalItem.id, 'rejected', rejectionReason);
                  } else {
                    handleModerateRequest(rejectModalItem.id, 'rejected', rejectionReason);
                  }
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                বাতিল নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
