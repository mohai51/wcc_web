'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import {
  CalendarDays,
  Calendar,
  MapPin,
  Users,
  Layers,
  ArrowRight,
  ArrowLeft,
  Filter,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Clock,
  FolderOpen
} from 'lucide-react';

export default function PublicEventsPage() {
  const { lang, tx, t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [wings, setWings] = useState([]);
  const [selectedWing, setSelectedWing] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Wings for filtering dropdown
  useEffect(() => {
    async function loadWings() {
      try {
        const data = await api.getWings();
        setWings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load wings for filter:', err);
      }
    }
    loadWings();
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadEvents() {
      try {
        const params = {};
        if (selectedWing) {
          params.wingId = selectedWing;
        }
        if (selectedStatus && selectedStatus !== 'all') {
          params.status = selectedStatus;
        }
        const data = await api.getEvents(params);
        if (!ignore) {
          setEvents(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching events:', err);
          setError(err.message || tx('ইভেন্ট লোড করতে ব্যর্থ হয়েছে।', 'Failed to load events. Please try again.'));
          setLoading(false);
        }
      }
    }
    loadEvents();
    return () => { ignore = true; };
  }, [selectedWing, selectedStatus, tx]);

  const handleRetry = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedWing) params.wingId = selectedWing;
      if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;
      const data = await api.getEvents(params);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || tx('ইভেন্ট লোড করতে ব্যর্থ হয়েছে।', 'Failed to load events. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return tx('তারিখ নির্ধারণাধীন', 'TBA');
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return { text: tx('আসন্ন / চলমান', 'Published'), color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'completed':
        return { text: tx('সম্পন্ন হয়েছে', 'Completed'), color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'cancelled':
        return { text: tx('স্থগিত', 'Cancelled'), color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'draft':
      default:
        return { text: tx('পরিকল্পনাধীন', 'Draft'), color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 sm:py-24 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#B62A35_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#B62A35]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{tx('মূল ওয়েবসাইটে ফিরুন', 'Back to Home')}</span>
            </Link>
            <span>/</span>
            <span className="text-[#F1AD1A]">{tx('ইভেন্ট ও ক্যাম্প', 'Events')}</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur text-xs font-bold text-[#F1AD1A]">
              <CalendarDays className="w-4 h-4 text-[#F1AD1A]" />
              <span>{tx('WCC মাঠপর্যায়ের কার্যক্রম', 'WCC FIELD ACTIONS')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {tx('আসন্ন ইভেন্ট ও', 'Upcoming Events &')} <br />
              <span className="text-[#F1AD1A]">{tx('সমাজকল্যাণ ক্যাম্পসমূহ', 'Community Camps')}</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {tx(
                'ঝালকাঠি জেলার বিভিন্ন প্রান্তে রক্তদান কর্মসূচি, চক্ষু ও স্বাস্থ্য ক্যাম্প, বৃক্ষরোপণ এবং যুব প্রশিক্ষণ কর্মশালার বিস্তারিত সময়সূচি।',
                'Schedules for free medical drives, blood donations, youth sports leagues, and environmental drives organized across Jhalakathi.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Filter Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Wing Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-thin">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{tx('উইং:', 'Wing:')}</span>
            </span>
            <button
              onClick={() => setSelectedWing('')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedWing === ''
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tx('সকল উইং', 'All Wings')}
            </button>
            {wings.map((wing) => (
              <button
                key={wing._id}
                onClick={() => setSelectedWing(wing._id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedWing === wing._id
                    ? 'bg-[#B62A35] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lang === 'bn' ? (wing.nameBn || wing.nameEn) : (wing.nameEn || wing.nameBn)}
              </button>
            ))}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="status-filter" className="text-xs font-bold text-slate-500">{tx('স্ট্যাটাস:', 'Status:')}</label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#B62A35]"
            >
              <option value="all">{tx('সকল স্ট্যাটাস', 'All Statuses')}</option>
              <option value="published">{tx('আসন্ন / চলমান', 'Published')}</option>
              <option value="completed">{tx('সম্পন্ন হয়েছে', 'Completed')}</option>
              <option value="draft">{tx('পরিকল্পনাধীন', 'Draft')}</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200 h-80 overflow-hidden flex flex-col justify-between">
                <div className="h-44 bg-slate-200 w-full"></div>
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                </div>
                <div className="p-6 pt-0">
                  <div className="h-8 bg-slate-100 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 max-w-md mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#B62A35] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{tx('ইভেন্ট লোড করা যায়নি', 'Failed to Load Events')}</h3>
            <p className="text-xs text-slate-600">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B62A35] hover:bg-[#9E1F2A] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{tx('পুনরায় চেষ্টা করুন', 'Retry')}</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <CalendarDays className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{tx('কোনো ইভেন্ট পাওয়া যায়নি', 'No Events Found')}</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {tx(
                'নির্বাচিত ফিল্টারে কোনো ইভেন্ট পাওয়া যায়নি। "সকল উইং" নির্বাচন করে আবার দেখুন।',
                'No community events match the selected criteria. Try changing the wing filter or check back soon.'
              )}
            </p>
            {selectedWing && (
              <button
                onClick={() => setSelectedWing('')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <span>{tx('ফিল্টার রিসেট করুন', 'Clear Wing Filter')}</span>
              </button>
            )}
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => {
              const wingInfo = evt.wingId && typeof evt.wingId === 'object' ? evt.wingId : null;
              const programInfo = evt.programId && typeof evt.programId === 'object' ? evt.programId : null;
              const statusObj = getStatusDisplay(evt.status);

              return (
                <div
                  key={evt._id}
                  className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Image */}
                    {evt.coverImage ? (
                      <div className="relative h-48 bg-slate-900 overflow-hidden">
                        <img
                          src={evt.coverImage}
                          alt={evt.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                        {wingInfo && (
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold rounded-lg shadow-xs">
                              {lang === 'bn' ? (wingInfo.nameBn || wingInfo.nameEn) : `${wingInfo.nameEn} Wing`}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-slate-900 to-[#1D3557] flex items-center justify-center text-white/40 relative">
                        <CalendarDays className="w-10 h-10" />
                        {wingInfo && (
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 bg-white/15 backdrop-blur text-white text-[10px] font-bold rounded-lg border border-white/20">
                              {lang === 'bn' ? (wingInfo.nameBn || wingInfo.nameEn) : `${wingInfo.nameEn} Wing`}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${statusObj.color}`}>
                          {statusObj.text}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#B62A35]" />
                          <span>{formatDate(evt.date)}</span>
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
                        {evt.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {evt.description || tx('তৃণমূল ক্ষমতায়ন ও সামাজিক উন্নয়নে মাঠপর্যায়ের কর্মসূচি।', 'Community driven event focused on grassroots empowerment and engagement.')}
                      </p>

                      <div className="space-y-1.5 pt-2 text-xs text-slate-500 border-t border-slate-100">
                        {evt.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{evt.location}</span>
                          </div>
                        )}
                        {evt.capacity > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{tx('ধারণক্ষমতা:', 'Capacity:')} {evt.capacity} {tx('জন', 'attendees')}</span>
                          </div>
                        )}
                        {programInfo && (
                          <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <FolderOpen className="w-3.5 h-3.5 text-[#B62A35] shrink-0" />
                            <span className="truncate">{tx('মূল প্রকল্প:', 'Under Program:')} {programInfo.title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="p-6 pt-0 border-t border-slate-100 mt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 font-medium">{tx('আয়োজক উইং:', 'Organizing Wing:')}</span>
                      {wingInfo?.slug ? (
                        <Link
                          href={`/wings/${wingInfo.slug}`}
                          className="text-[#B62A35] hover:underline font-bold text-[11px] truncate max-w-[200px]"
                          title={`${wingInfo.nameEn} Wing`}
                        >
                          {lang === 'bn' ? (wingInfo.nameBn || wingInfo.nameEn) : `${wingInfo.nameEn} Wing`}
                        </Link>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-500">{tx('সার্বিক কার্যক্রম', 'General Action')}</span>
                      )}
                    </div>

                    <Link
                      href={`/events/${evt._id}`}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-[#B62A35] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs group-hover:bg-[#B62A35] whitespace-nowrap cursor-pointer"
                    >
                      <span>{tx('বিস্তারিত দেখুন ও অংশ নিন', 'View & Register')}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
