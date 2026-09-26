'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import {
  Layers,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Target,
  ArrowLeft
} from 'lucide-react';

export default function WingsPublicPage() {
  const { lang, tx, t } = useLanguage();
  const [wings, setWings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wcc_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadWings() {
      try {
        const data = await api.getWings();
        if (!ignore) {
          setWings(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching wings:', err);
          setError(err.message || tx('উইং তালিকা লোড করতে ব্যর্থ হয়েছে।', 'Failed to load organizational wings. Please try again.'));
          setLoading(false);
        }
      }
    }
    loadWings();
    return () => { ignore = true; };
  }, [tx]);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWings();
      setWings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching wings:', err);
      setError(err.message || tx('উইং তালিকা লোড করতে ব্যর্থ হয়েছে।', 'Failed to load organizational wings. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#B62A35_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#B62A35]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{tx('হোমে ফিরে যান', 'Back to Home')}</span>
            </Link>
            <span>/</span>
            <span className="text-[#F1AD1A]">{tx('উইংসমূহ', 'Wings')}</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur text-xs font-bold text-[#F1AD1A]">
              <Layers className="w-4 h-4 text-[#F1AD1A]" />
              <span>{tx('WCC কৌশলগত স্তম্ভসমূহ', 'WCC STRATEGIC PILLARS')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {tx('আমাদের সাংগঠনিক', 'Our Organizational')} <br />
              <span className="text-[#F1AD1A]">{tx('উইং ও কার্যক্রমসমূহ', 'Wings & Impact Pillars')}</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {tx(
                'ঝালকাঠি জেলা ও দেশের সার্বিক কল্যাণে উই ক্যান চেঞ্জ (WCC)-এর ৫টি বিশেষায়িত উইং তৃণমূল পর্যায় থেকে স্থায়ী ইতিবাচক পরিবর্তন আনয়নে কাজ করছে। প্রতিটি উইং তরুণদের মেধা ও নৈতিক শক্তির সমন্বয়ে পরিচালিত।',
                'We Can Change (WCC) operates five specialized operational wings across Jhalakathi and beyond, mobilizing youth leadership, grassroots empowerment, and sustainable community advancement.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs animate-pulse flex flex-col justify-between"
              >
                <div className="h-48 bg-slate-200 w-full"></div>
                <div className="p-6 space-y-4">
                  <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-4/5"></div>
                  <div className="pt-4 flex gap-2">
                    <div className="h-6 bg-slate-100 rounded-full w-20"></div>
                    <div className="h-6 bg-slate-100 rounded-full w-24"></div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 max-w-xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#B62A35] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">{tx('উইং তালিকা লোড করা যায়নি', 'Failed to Load Wings')}</h3>
              <p className="text-xs sm:text-sm text-slate-600">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{tx('পুনরায় চেষ্টা করুন', 'Retry Loading')}</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && wings.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{tx('কোনো উইং পাওয়া যায়নি', 'No Wings Found')}</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {tx('সাংগঠনিক উইং এখনও তালিকাভুক্ত হয়নি। অনুগ্রহ করে পরবর্তীতে আবার দেখুন।', 'Organizational wings have not been published yet. Please check back shortly.')}
            </p>
          </div>
        )}

        {/* Dynamic Wings Grid */}
        {!loading && !error && wings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wings.map((wing) => (
              <div
                key={wing._id || wing.slug}
                className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Wing Image */}
                  <div className="relative h-52 bg-slate-900 overflow-hidden">
                    {wing.coverImage ? (
                      <img
                        src={wing.coverImage}
                        alt={wing.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-[#1D3557] text-white/40">
                        <Layers className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur text-slate-900 text-[11px] font-bold rounded-full shadow-xs uppercase tracking-wider">
                        {wing.slug}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-xs font-semibold text-[#F1AD1A]">{lang === 'bn' ? wing.nameEn : wing.nameBn}</p>
                      <h2 className="text-2xl font-black text-white tracking-tight">{lang === 'bn' ? (wing.nameBn || wing.nameEn) : (wing.nameEn || wing.nameBn)}</h2>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {lang === 'bn' 
                        ? (wing.description || 'ঝালকাঠি ও সমাজের ইতিবাচক রূপান্তরে যুব সমাজের সক্রিয় উদ্যোগ।') 
                        : (wing.descriptionEn || wing.description || 'Dedicated to civic empowerment, community support, and sustainable social impact.')}
                    </p>

                    {/* Mission Points preview */}
                    {Array.isArray(wing.missionPoints) && wing.missionPoints.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Target className="w-3.5 h-3.5 text-[#B62A35]" />
                          <span>{tx('কৌশলগত লক্ষ্যসমূহ', 'Key Mission Goals')}</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {wing.missionPoints.slice(0, 3).map((mp, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg"
                            >
                              {mp}
                            </span>
                          ))}
                          {wing.missionPoints.length > 3 && (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                              +{wing.missionPoints.length - 3} {tx('টি আরো', 'more')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card CTA */}
                <div className="p-6 pt-0">
                  <Link
                    href={`/wings/${wing.slug}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-[#B62A35] text-white text-xs font-bold rounded-2xl transition-all shadow-xs group-hover:shadow-md cursor-pointer"
                  >
                    <span>{tx('উইংয়ের বিবরণ ও সেবা দেখুন', 'Explore Wing Details & Drives')}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-[#1D3557] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F1AD1A] flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{tx('সামাজিক কার্যক্রম', 'COMMUNITY ACTION')}</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              {tx('উইংয়ের মাধ্যমে সমাজে ইতিবাচক পরিবর্তন আনতে চান?', 'Ready to create real impact with a wing?')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              {tx(
                'ঝালকাঠিতে ১০০+ উদ্যমী তরুণদের সাথে যুক্ত হয়ে সমাজের কল্যাণে সরাসরি ভূমিকা রাখুন।',
                'Join our network of over 100+ passionate volunteers in Jhalokathi to drive grassroots change.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={user ? '/dashboard?tab=requests' : '/register'}
              className="px-6 py-3 bg-[#B62A35] hover:bg-[#9E1F2A] text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              {user ? tx('উইং সদস্যপদ আবেদন', 'Request Wing / Volunteer Assignment') : tx('মেম্বার হিসেবে যুক্ত হোন', 'Join as Member')}
            </Link>
            {!user ? (
              <Link
                href="/login"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs rounded-xl transition-all"
              >
                {tx('মেম্বার লগইন', 'Sign In to Member Portal')}
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs rounded-xl transition-all"
              >
                {tx('ড্যাশবোর্ডে যান', 'Go to My Dashboard')}
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
