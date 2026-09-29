'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Wallet,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Search,
  CheckCircle2,
  Activity,
  HeartHandshake,
  BookOpen,
  Laptop,
  TreePine,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Trophy,
  Landmark,
  Check,
  ExternalLink,
  PhoneCall,
  LogIn
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

const heroImages = [
  '/landing/image1.jpg',
  '/landing/image2.jpg',
  '/landing/image3.jpg',
  '/landing/image5.jpg',
  '/landing/image6.jpg',
  '/landing/image7.jpg',
  '/landing/image8.jpg',
  '/landing/image9.jpg',
  '/landing/image10.jpg',
  '/landing/image12.jpg'
];

export default function HomePage() {
  const router = useRouter();
  const { lang, tx, t } = useLanguage();

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [user, setUser] = useState(null);

  // Live Stats from MongoDB
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalLiquidity: 0,
    totalActivities: 0
  });

  // Check login state
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem('wcc_user');
        if (stored) setUser(JSON.parse(stored));
      } catch (e) {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [wings, setWings] = useState([]);

  // Live Stats & Wings from MongoDB via wcc_api
  useEffect(() => {
    async function fetchData() {
      try {
        const [memStats, finDash, acts, wingsData] = await Promise.all([
          api.getMemberStats().catch(() => ({ total: 0, active: 0 })),
          api.getFinanceDashboard().catch(() => ({ totalLiquidity: 0 })),
          api.getActivities().catch(() => []),
          api.getWings().catch(() => [])
        ]);

        setStats({
          totalMembers: memStats.total || 0,
          activeMembers: memStats.active || 0,
          totalLiquidity: finDash.totalLiquidity || 0,
          totalActivities: Array.isArray(acts) ? acts.length : 0
        });
        setWings(Array.isArray(wingsData) ? wingsData : []);
      } catch (err) {
        console.error('Data loading error:', err);
      }
    }
    fetchData();
  }, []);

  // Hero auto-slider timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const getWingVisual = (slug) => {
    switch (slug) {
      case 'education':
        return { icon: BookOpen, color: 'bg-rose-50 text-[#B62A35]' };
      case 'health':
        return { icon: Stethoscope, color: 'bg-emerald-50 text-emerald-600' };
      case 'sports':
        return { icon: Trophy, color: 'bg-amber-50 text-[#A6772A]' };
      case 'cultural':
      case 'culture':
        return { icon: Landmark, color: 'bg-purple-50 text-purple-600' };
      case 'environment':
      case 'heritage':
        return { icon: TreePine, color: 'bg-teal-50 text-teal-600' };
      default:
        return { icon: Sparkles, color: 'bg-blue-50 text-blue-600' };
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ========================================================= */}
      {/* 1. HERO SECTION WITH IMAGE SLIDER                        */}
      {/* ========================================================= */}
      <section className="relative min-h-[620px] lg:min-h-[700px] flex items-center overflow-hidden bg-slate-950 text-white">
        {/* Background Slides */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((src, index) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'opacity 1s ease-in-out, transform 8s ease'
              }}
            />
          ))}
          {/* Dark gradient overlay for ultra-crisp readable typography */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/50"></div>
          <div className="absolute inset-0 bg-radial-at-c from-transparent to-slate-950/70"></div>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <button
          onClick={handlePrevSlide}
          aria-label="Previous image"
          className="absolute left-4 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-[#B62A35] border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hidden sm:flex cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNextSlide}
          aria-label="Next image"
          className="absolute right-4 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-[#B62A35] border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all hidden sm:flex cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-[#F1AD1A]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Vision & Call to Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur text-xs font-bold text-[#F1AD1A]">
                <ShieldCheck className="w-4 h-4 text-[#F1AD1A]" />
                <span>{tx('উই ক্যান চেঞ্জ (WCC) • অফিসিয়াল পোর্টাল', 'We Can Change (WCC) • Official Portal')}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                {lang === 'bn' ? (
                  <>
                    <span className="text-[#F1AD1A]">তরুণদের শক্তি ও সুশাসনই</span> <br />
                    গড়ে তুলবে আগামীর <span className="text-[#B62A35]">বাংলাদেশ</span>
                  </>
                ) : (
                  <>
                    The Power of <br />
                    <span className="text-[#F1AD1A]">Youth & Good Governance</span> <br />
                    Can Build the <span className="text-[#B62A35]">Bangladesh</span> of Tomorrow.
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl">
                {tx(
                  'ঝালকাঠি জেলাভিত্তিক একটি অগ্রণী অরাজনৈতিক সামাজিক সংগঠন। সততা, স্বচ্ছতা ও তরুণ প্রজন্মের সম্মিলিত ক্ষমতায়নে আমরা গঠন করছি এক বৈষম্যহীন ও স্বনির্ভর সমাজ।',
                  'A leading civic impact initiative based in Jhalakathi. Driven by integrity, accountability, and the boundless potential of the next generation to empower grassroots communities.'
                )}
              </p>

              {/* Action Buttons for Guest / Logged In */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold text-sm shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <span>{tx('আমার ড্যাশবোর্ডে প্রবেশ করুন', `Go to My ${user.role.toUpperCase()} Portal`)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold text-sm shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{tx('লগইন করুন', 'Sign In')}</span>
                    </Link>

                    <Link
                      href="/register"
                      className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950 font-bold text-sm shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{tx('নতুন মেম্বার নিবন্ধন', 'Register Here')}</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl text-center space-y-5 max-w-sm w-full">
                <div className="w-28 h-28 mx-auto rounded-full bg-white p-2 shadow-xl border-2 border-[#F1AD1A] overflow-hidden">
                  <img
                    src="/landing/wcc.png"
                    alt="We Can Change"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">We Can Change</h3>
                  <p className="text-xs text-[#F1AD1A] font-bold tracking-wider uppercase mt-0.5">
                    {tx('আমরাই আনব পরিবর্তন', 'Together We Build Tomorrow')}
                  </p>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {tx(
                    'ঝালকাঠি সদর, নলছিটি, রাজাপুর ও কাঠালিয়াসহ সমগ্র বাংলাদেশের তরুণদের একত্রিত করে জনকল্যাণ ও সুশাসনের শক্ত ভিত গড়ে তোলাই আমাদের লক্ষ্য।',
                    'Uniting purposeful youth across Jhalakathi Sadar, Nalchity, Rajapur, and Kathalia to forge enduring social progress and ethical leadership.'
                  )}
                </p>
                <div className="pt-3 border-t border-white/15 flex items-center justify-center text-center">
                  <div>
                    <div className="text-xl font-black text-[#F1AD1A]">2026</div>
                    <div className="text-[10px] text-slate-300 uppercase font-semibold">{tx('প্রতিষ্ঠা বর্ষ', 'Charter Year')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. REAL-TIME LIVE STATS BAR FROM MONGODB                  */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#B62A35] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{tx('নিবন্ধিত সদস্য', 'Registered Members')}</p>
              <h3 className="text-2xl font-black text-slate-900">{stats.totalMembers}</h3>
              <span className="text-[11px] text-emerald-600 font-semibold">{stats.activeMembers} {tx('যাচাইকৃত সক্রিয়', 'Verified Active')}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#A6772A] flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{tx('তহবিল ব্যালেন্স', 'Treasury Balance')}</p>
              <h3 className="text-2xl font-black text-slate-900">৳ {stats.totalLiquidity.toLocaleString()}</h3>
              <span className="text-[11px] text-slate-500 font-medium">{tx('১০০% অডিটেড হিসাব', '100% Audited Fund')}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D3557] flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{tx('সামাজিক কার্যক্রম', 'Social Activities')}</p>
              <h3 className="text-2xl font-black text-slate-900">{stats.totalActivities}</h3>
              <span className="text-[11px] text-blue-600 font-semibold">{tx('ক্যাম্প ও ফিল্ড ড্রাইভ', 'Health Camps & Drives')}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{tx('ডিজিটাল পরিচয়পত্র', 'Public Credentials')}</p>
              <h3 className="text-2xl font-black text-slate-900">{tx('স্মার্ট কিউআর', 'Live QR')}</h3>
              <span className="text-[11px] text-emerald-600 font-semibold">{tx('যাচাইযোগ্য আইডি কার্ড', 'Tamper-Proof ID Cards')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. CORE PRINCIPLES                                        */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full space-y-12" id="about">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            {tx('আমাদের মূলনীতি', 'OUR GUIDING PRINCIPLES')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {tx('মূলনীতির ভিত্তিতে', 'Building a')} <span className="text-[#B62A35]">{tx('সমাজ বিনির্মাণ', 'Nation on Principles')}</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {tx(
              'WCC কেবল একটি প্রতিষ্ঠান নয়; এটি একটি অঙ্গীকার। তরুণ সমাজ যাতে মর্যাদা ও ন্যায়ের সাথে ভবিষ্যতের নেতৃত্ব দিতে পারে, সেই সুদৃঢ় শপথ।',
              'WCC is more than an organization; it’s a promise. A promise to hold power accountable and to build a society where the young generation can lead the future with dignity and justice.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#B62A35] text-white flex items-center justify-center mx-auto shadow-md">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{tx('নৈতিক শক্তি (Moral Power)', 'Moral Power')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {tx(
                'সততা ও নীতিবোধের দৃঢ় ভিত্তির ওপর দাঁড়িয়ে সমাজ সংস্কারের প্রত্যয়। ব্যক্তিগত স্বার্থের ঊর্ধ্বে উঠে গণকল্যাণকে সর্বোচ্চ অগ্রাধিকার দেওয়া।',
                'Uncompromising ethics forming the bedrock of social reform. Placing public welfare unequivocally above personal gain.'
              )}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1D3557] text-white flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{tx('জবাবদিহিতা (Accountability)', 'Accountability')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {tx(
                'প্রতিটি সিদ্ধান্ত, কার্যক্রম ও আর্থিক হিসাবের উন্মুক্ত স্বচ্ছতা। শতভাগ ডিজিটাল লেজার ও জনসম্মুখে সার্বিক খরচের নিরপেক্ষ হিসাব প্রদান।',
                'Full transparency across decisions, operations, and finances. 100% digitized double-entry ledgers audited for public trust.'
              )}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F1AD1A] text-slate-950 flex items-center justify-center mx-auto shadow-md">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{tx('যুব নেতৃত্ব (Youth Leadership)', 'Youth Leadership')}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {tx(
                'তরুণদের মেধা, প্রযুক্তিগত দক্ষতা ও সৃষ্টিশীলতাকে দেশের মূল চালিকাশক্তিতে রূপান্তর। নেতৃত্বের অগ্রভাগে সৎ ও সাহসী যুবসমাজ।',
                'Transforming youth technical ability, creativity, and conviction into our country’s primary engine of lasting development.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. KEY FOCUS AREAS                                        */}
      {/* ========================================================= */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-20" id="focus-areas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
                {tx('আমাদের কর্মপরিকল্পনা', 'OUR AGENDA')}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                {tx('মূল কর্মক্ষেত্র ও উইংসমূহ', 'Key Focus Areas & Wings')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {tx('সমগ্র ঝালকাঠি জেলায় তৃণমূল পর্যায়ে বাস্তবমুখী সমাজকল্যাণ উদ্যোগ', 'Practical grassroots community advancement across Jhalakathi district')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/wings"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-[#B62A35]/30 hover:text-[#B62A35] px-3.5 py-2 rounded-full shadow-xs transition-all cursor-pointer"
              >
                <span>{tx('সকল উইং দেখুন', 'Browse All Wings')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B62A35] hover:underline cursor-pointer"
              >
                <span>{tx('ভলান্টিয়ার হিসেবে যুক্ত হোন', 'Join as a volunteer')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wings.map((wing) => {
              const visual = getWingVisual(wing.slug);
              const Icon = visual.icon;
              return (
                <Link
                  key={wing.slug}
                  href={`/wings/${wing.slug}`}
                  className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-[#B62A35]/30 transition-all flex flex-col justify-between space-y-4 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className={`w-12 h-12 rounded-2xl ${visual.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#B62A35] transition-colors">
                      {lang === 'bn' ? (wing.nameBn || wing.nameEn) : (wing.nameEn || wing.nameBn)}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {lang === 'bn' ? (wing.description || 'সমাজ রূপান্তরে যুব সমাজের সক্রিয় উদ্যোগ।') : (wing.descriptionEn || wing.description || 'Dedicated to civic empowerment and social impact.')}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center text-xs font-bold text-[#B62A35] group-hover:translate-x-1 transition-transform">
                    <span>{tx('উইংয়ের বিবরণ দেখুন', 'Explore Wing Details')}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. MEET OUR CHAIRMAN                                      */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full" id="chairman">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-[#1D3557] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#B62A35]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Chairman Photo */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative">
                <div className="w-52 h-64 sm:w-60 sm:h-72 rounded-2xl overflow-hidden border-4 border-[#F1AD1A] shadow-2xl bg-slate-800">
                  <img
                    src="/landing/image4.jpg"
                    alt="Professor Dr SM Khalid Mahmud Shakil"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-[#B62A35] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {tx('চেয়ারম্যান, WCC', 'Chairman, WCC')}
                </div>
              </div>
            </div>

            {/* Chairman Bio & Statement */}
            <div className="lg:col-span-8 space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F1AD1A]">
                  {tx('নেতৃত্ব ও দৃষ্টিভঙ্গি', 'LEADERSHIP & VISION')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {tx('অধ্যাপক ডা. এস এম খালিদ মাহমুদ শাকিল', 'Professor Dr. SM Khalid Mahmud Shakil')}
                </h2>
                <div className="text-xs sm:text-sm text-slate-300 space-y-0.5 pt-1">
                  <p className="font-semibold text-[#F1AD1A]">MBBS, MS (Paediatric Surgery)</p>
                  <p>{tx('ডব্লিউএইচও ফেলো (চীন), উচ্চতর প্রশিক্ষণ (ভারত)', 'WHO Fellow (China), Advanced Training (India)')}</p>
                  <p>{tx('অধ্যাপক, শিশু সার্জারি বিভাগ, বাংলাদেশ মেডিকেল কলেজ ও হাসপাতাল', 'Professor, Department of Paediatric Surgery, Bangladesh Medical College & Hospital')}</p>
                </div>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-300 italic border-l-2 border-[#F1AD1A] pl-4 leading-relaxed">
                {tx(
                  '“আমাদের প্রিয় ঝালকাঠি ও এই দেশের যুবসমাজের সততা, সৃজনশীলতা এবং অদম্য ইচ্ছাশক্তিকে কাজে লাগাতে পারলে যেকোনো সংকট দূর করা সম্ভব। আমরা চাই প্রতিটি তরুণকে দক্ষ, শিক্ষিত এবং আত্মপ্রত্যয়ী নাগরিক হিসেবে গড়ে তুলতে। পরিবর্তনের পথে আপনাদের সবাইকে আমাদের সাথে আহ্বান জানাই।”',
                  '“With the integrity, creative courage, and steadfast resolve of our youth in Jhalakathi and across Bangladesh, no obstacle is insurmountable. We are committed to nurturing skilled, self-reliant, and morally grounded leaders. We welcome everyone to join hands on this transformative journey.”'
                )}
              </blockquote>

              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="px-5 py-2.5 bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                >
                  {tx('WCC-তে যোগদান করুন', 'Join Under WCC Leadership')}
                </Link>
                <Link
                  href="/#about"
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {tx('আমাদের ইতিহাস জানুন', 'Learn Organization History')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. OUR COMMITMENTS TO THE NATION                           */}
      {/* ========================================================= */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
              {tx('আমাদের অঙ্গীকার', 'OUR PLEDGE')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {tx('WCC-এর প্রাতিষ্ঠানিক প্রতিশ্রুতিসমূহ', 'Institutional Commitments of WCC')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {tx('সুশাসন, জবাবদিহিতা ও যুব সমাজের স্বতঃস্ফূর্ত অংশগ্রহণে আমাদের অঙ্গীকার', 'Good governance, unreserved accountability, and dynamic youth mobilization')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#B62A35] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{tx('ডিজিটাল রেজিস্ট্রি ও ভেরিফিকেশন', 'Digital Registry & Verification')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {tx(
                  'প্রতিটি সদস্য ও ভলান্টিয়ারের তথ্য সরাসরি সেন্ট্রাল ডাটাবেজে সংরক্ষিত। কিউআর কোড স্ক্যানের মাধ্যমে তাৎক্ষণিক পরিচয়পত্র যাচাইয়ের উন্মুক্ত ব্যবস্থা।',
                  'Member records are stored in a secured cloud database. Instant public credential verification through unique encrypted dynamic QR codes.'
                )}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#A6772A] flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{tx('সম্পূর্ণ আর্থিক স্বচ্ছতা', 'Total Financial Transparency')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {tx(
                  'তহবিলের প্রতিটি টাকা ডাবল-এন্ট্রি অ্যাকাউন্টিং লেজারে লিপিবদ্ধ। কেন্দ্রীয় অডিট ও রসিদ ছাড়া কোনো লেনদেন অনুমোদিত হয় না।',
                  'Every contribution and expenditure is registered in real-time double-entry ledgers with zero unauthorized off-book cash handling.'
                )}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1D3557] flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{tx('জনকল্যাণমূলক মাঠপর্যায়ের কাজ', 'Community-Driven Action')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {tx(
                  'স্বাস্থ্য, শিক্ষা, বৃক্ষরোপণ ও সমাজকল্যাণে তৃণমূল পর্যায়ে সরাসরি ফিল্ড কর্মসূচি। তরুণদের মেধা ও শ্রম সরাসরি জনকল্যাণে নিয়োজিত।',
                  'Hands-on field drives across free healthcare, academic support, environmental reforestation, and immediate disaster relief.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. WHY JOIN WCC                                           */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
              {tx('সদস্যপদ ও কমিউনিটি', 'MEMBERSHIP & COMMUNITY')}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {tx('কেন উই ক্যান চেঞ্জে', 'Why Join')} <span className="text-[#B62A35]">{tx('যুক্ত হবেন?', 'We Can Change?')}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {tx(
                'আমরা দিচ্ছি প্ল্যাটফর্ম, আপনি দেবেন আপনার অনুপ্রেরণা। শিক্ষক, প্রকৌশলী, চিকিৎসক ও সমাজকর্মীদের সমন্বয়ে এক শক্তিশালী নাগরিক ফ্রন্ট।',
                'We provide the platform, you provide the passion. WCC brings together youth, academicians, engineers, doctors, and community builders into a unified engine for social good.'
              )}
            </p>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>{tx('ক্ষমতায়ন ও ন্যায়বিচার:', 'Empowerment & Justice:')}</strong> {tx('সততা যেখানে পদ্ধতিগত দুর্নীতিকে পরাস্ত করে এবং যুব সমাজের কণ্ঠস্বর প্রাধান্য পায়।', 'A platform where honesty beats systematic corruption and youth voices lead.')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>{tx('একসাথে শেখা ও নেতৃত্ব বিকাশ:', 'Learn, Lead, and Grow Together:')}</strong> {tx('সাংগঠনিক দক্ষতা, নেতৃত্ব ও ডিজিটাল প্রযুক্তির বাস্তব অভিজ্ঞতা অর্জন করুন।', 'Master valuable leadership, organizing, and digital technology skills.')}</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span><strong>{tx('অফিসিয়াল ডিজিটাল পরিচয়পত্র:', 'Official Credentials:')}</strong> {tx('লাইভ কিউআর ভেরিফাইড স্মার্ট ডিজিটাল সদস্য কার্ড লাভ করুন।', 'Receive a verified Digital ID card with live QR code and public credibility.')}</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="px-6 py-3 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{tx('লগইন করুন', 'Sign In')}</span>
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{tx('অনলাইন মেম্বারশিপ নিবন্ধন', 'Register Online')}</span>
              </Link>
            </div>
          </div>

          {/* Side Image Montage */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="h-44 sm:h-52 rounded-2xl overflow-hidden shadow-md border border-slate-200">
                <img src="/landing/image10.jpg" alt="WCC Community" className="w-full h-full object-cover" />
              </div>
              <div className="h-32 sm:h-36 rounded-2xl overflow-hidden shadow-md border border-slate-200">
                <img src="/landing/image8.jpg" alt="WCC Drives" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="space-y-4 pt-6">
              <div className="h-32 sm:h-36 rounded-2xl overflow-hidden shadow-md border border-slate-200">
                <img src="/landing/image6.jpg" alt="WCC Camps" className="w-full h-full object-cover" />
              </div>
              <div className="h-44 sm:h-52 rounded-2xl overflow-hidden shadow-md border border-slate-200">
                <img src="/landing/image3.jpg" alt="WCC Youth" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. CALL TO ACTION SECTION                                 */}
      {/* ========================================================= */}
      <section className="bg-gradient-to-r from-[#B62A35] via-[#8E1A23] to-[#1D3557] text-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            {tx('আর অপেক্ষা নয়। এখনই পরিবর্তনের সময়।', 'Enough Talk. Time for Action.')}
          </h2>
          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed">
            {tx(
              'আমাদের দেশের প্রয়োজন আপনার মেধা, শক্তি ও দৃষ্টিভঙ্গি। আজই যুক্ত হোন এবং পরিবর্তনের অংশীদার হিসেবে আপনার পদচিহ্ন রাখুন।',
              'Our communities need your intellect, passion, and vision. Step forward today to shape an enduring legacy.'
            )}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="px-8 py-3.5 bg-[#F1AD1A] hover:bg-[#D9980F] text-slate-950 font-bold rounded-xl text-sm shadow-xl transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{tx('লগইন করুন', 'Sign In')}</span>
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold rounded-xl text-sm backdrop-blur transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{tx('নিবন্ধন করুন', 'Register Here')}</span>
            </Link>
          </div>
          <span className="block text-xs text-slate-300 pt-2">
            {tx('অনলাইন রেজিস্ট্রেশনে সময় লাগে মাত্র ২ মিনিট।', 'Takes less than 2 minutes to register online.')}
          </span>
        </div>
      </section>
    </div>
  );
}
