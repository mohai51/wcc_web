'use client';

import { use, useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import HealthWingView from '@/Components/HealthWingView';
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
  X,
  Trash2,
  Heart,
  Activity,
  Stethoscope,
  Ambulance,
  PhoneCall,
  MessageSquare,
  UserPlus,
  Droplets,
  AlertTriangle,
  Building2
} from 'lucide-react';

export function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  let videoId = '';
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) {
    videoId = shortMatch[1];
  }

  if (!videoId) {
    const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch && watchMatch[1]) {
      videoId = watchMatch[1];
    }
  }

  if (!videoId) {
    const embedMatch = trimmed.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch && embedMatch[1]) {
      videoId = embedMatch[1];
    }
  }

  if (!videoId) {
    const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch && shortsMatch[1]) {
      videoId = shortsMatch[1];
    }
  }

  if (!videoId) {
    const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
    if (liveMatch && liveMatch[1]) {
      videoId = liveMatch[1];
    }
  }

  if (!videoId && /^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    videoId = trimmed;
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
}

function WingDetailPageInner({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams?.slug;
  const { lang, tx, t } = useLanguage();
  const searchParams = useSearchParams();
  const queryTab = searchParams ? searchParams.get('tab') : null;

  const [wing, setWing] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Active Tab for Wing
  const [activeTab, setActiveTab] = useState(queryTab || 'overview');

  useEffect(() => {
    if (queryTab && queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newTab && newTab !== 'overview') {
        url.searchParams.set('tab', newTab);
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

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
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // Flash Feedback
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
  };

  // =========================================================================
  // HEALTH WING STATES
  // =========================================================================
  const isHealth = slug === 'health';
  const isEducation = slug === 'education';

  // 1. Health Camps
  const [camps, setCamps] = useState([]);
  const [campsLoading, setCampsLoading] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [registerCampModalOpen, setRegisterCampModalOpen] = useState(false);
  const [campRegisterForm, setCampRegisterForm] = useState({ name: '', phone: '', age: '', gender: 'Male' });
  const [submittingCampRegister, setSubmittingCampRegister] = useState(false);
  const [campToDelete, setCampToDelete] = useState(null);
  const [deletingCampId, setDeletingCampId] = useState(null);

  // 2. Blood Bank
  const [donors, setDonors] = useState([]);
  const [donorsLoading, setDonorsLoading] = useState(false);
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [donorLocationFilter, setDonorLocationFilter] = useState('all');
  const [bloodSearch, setBloodSearch] = useState('');
  const [donorModalOpen, setDonorModalOpen] = useState(false);
  const [donorForm, setDonorForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'A+',
    phone: '',
    alternatePhone: '',
    location: 'ঝালকাঠি সদর',
    district: 'ঝালকাঠি',
    lastDonationDate: '',
    donationCount: 0,
    notes: ''
  });
  const [submittingDonor, setSubmittingDonor] = useState(false);
  const [donorToDelete, setDonorToDelete] = useState(null);
  const [deletingDonorId, setDeletingDonorId] = useState(null);

  // 3. Emergency Cell
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [myEmergencyRequests, setMyEmergencyRequests] = useState([]);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    patientName: '',
    hospital: 'ঝালকাঠি সদর হাসপাতাল',
    ward: '',
    contactName: '',
    contactPhone: '',
    emergencyType: 'admission',
    urgency: 'high',
    description: ''
  });
  const [submittingEmergency, setSubmittingEmergency] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [emergencyResponseText, setEmergencyResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [isEmergencyVolunteer, setIsEmergencyVolunteer] = useState(false);

  // 4. Leader Panel & Volunteer Tasks
  const [healthLeaderTab, setHealthLeaderTab] = useState('camps'); // 'camps' | 'tasks' | 'emergency_team' | 'add_donor'
  const [healthTasks, setHealthTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [assignTaskModalOpen, setAssignTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedToName: '',
    assignedToPhone: '',
    assignedToEmail: '',
    assignedToUserId: '',
    campId: '',
    campTitle: '',
    priority: 'medium',
    dueDate: ''
  });
  const [submittingTask, setSubmittingTask] = useState(false);
  const [newCampForm, setNewCampForm] = useState({
    title: '',
    description: '',
    date: '',
    time: 'সকাল ৯:০০ - বিকাল ৪:০০',
    location: 'ঝালকাঠি সদর হাসপাতাল রোড',
    district: 'ঝালকাঠি',
    targetBeneficiaries: '৫০০+ সুবিধাবঞ্চিত মানুষ',
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    doctors: [
      { name: 'ডা. মোস্তাফিজুর রহমান', specialty: 'মেডিসিন বিশেষজ্ঞ', hospital: 'ঝালকাঠি সদর হাসপাতাল', degree: 'MBBS, FCPS (Medicine)' }
    ],
    services: [
      'বিনামূল্যে সাধারণ স্বাস্থ্য পরীক্ষা',
      'বিনামূল্যে ওষুধ বিতরণ',
      'ব্লাড প্রেসার ও ডায়াবেটিস টেস্ট',
      'রক্তের গ্রুপ নির্ণয় (Blood Grouping)'
    ]
  });
  const [submittingCamp, setSubmittingCamp] = useState(false);
  const [emergencyTeam, setEmergencyTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [addTeamMemberModalOpen, setAddTeamMemberModalOpen] = useState(false);
  const [teamMemberForm, setTeamMemberForm] = useState({
    userId: '',
    name: '',
    phone: '',
    email: '',
    roleTitle: 'ইমার্জেন্সি সেল ভলান্টিয়ার',
    hospitalAssigned: 'all'
  });
  const [submittingTeamMember, setSubmittingTeamMember] = useState(false);
  const [availableVolunteers, setAvailableVolunteers] = useState([]);

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

  // Check if current user is Health / Education Wing Leader or Admin
  const userEmail = (user?.email || '').toLowerCase().trim();
  const isHealthLeader = Boolean(
    isHealth && user && (
      userEmail === 'coordinator.health@wecanchange.org' ||
      userEmail === 'dr.mostafizur@wecanchange.org' ||
      (wing?.leader && (String(wing.leader._id || wing.leader) === String(user.id || user._id) || wing.leader.email?.toLowerCase() === userEmail)) ||
      (user.role === 'wing_leader' && (user.assignedWing === wing?._id || String(user.assignedWing) === String(wing?._id))) ||
      ((user.role === 'wing_leader' || user.role === 'coordinator') && (user.volunteerWing?.includes('স্বাস্থ্য') || user.volunteerWing?.includes('Health') || userEmail.includes('health')))
    )
  );

  const isLeaderOrAdmin = Boolean(
    user &&
    (user.role === 'admin' ||
      isHealthLeader ||
      (wing?.leader && (String(wing.leader._id || wing.leader) === String(user.id || user._id) || wing.leader.email?.toLowerCase() === userEmail)) ||
      (user.role === 'wing_leader' && (user.assignedWing === wing?._id || String(user.assignedWing) === String(wing?._id))) ||
      (isEducation && (userEmail.includes('tanvir') || user.volunteerWing?.includes('শিক্ষা')))
    )
  );

  // 1-Click Auto Login as Health Wing Leader
  const handleHealthLeaderAutoLogin = async () => {
    try {
      showFeedback('info', tx('ডা. মোস্তাফিজুর রহমান (হেলথ উইং লিডার) হিসেবে লগইন হচ্ছে...', 'Logging in as Health Wing Leader...'));
      const res = await api.login({
        email: 'coordinator.health@wecanchange.org',
        password: 'wccmember2026'
      });
      if (res.token) {
        localStorage.setItem('wcc_token', res.token);
        localStorage.setItem('wcc_user', JSON.stringify(res.user));
        setUser(res.user);
        setActiveTab('leader_panel');
        showFeedback('success', tx('ডা. মোস্তাফিজুর রহমান হিসেবে সফলভাবে লগইন হয়েছে! এখন ফুল কন্ট্রোল প্যানেল সচল।', 'Logged in as Dr. Mostafizur Rahman! Full leader controls active.'));
      }
    } catch (err) {
      showFeedback('error', err.message || tx('অটো লগইন ব্যর্থ হয়েছে।', 'Auto login failed.'));
    }
  };

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

  // =========================================================================
  // HEALTH WING LOADERS & EFFECTS
  // =========================================================================
  const loadHealthData = async () => {
    if (slug !== 'health') return;
    setCampsLoading(true);
    setDonorsLoading(true);
    try {
      const [campsData, donorsData] = await Promise.all([
        api.getHealthCamps().catch(() => []),
        api.getBloodDonors().catch(() => [])
      ]);
      setCamps(Array.isArray(campsData) ? campsData : []);
      setDonors(Array.isArray(donorsData) ? donorsData : []);
    } catch (err) {
      console.error('Error loading health data:', err);
    } finally {
      setCampsLoading(false);
      setDonorsLoading(false);
    }
  };

  const loadEmergencyData = async () => {
    if (slug !== 'health') return;
    setEmergencyLoading(true);
    try {
      const myReqs = await api.getMyEmergencyRequests({ phone: user?.phone }).catch(() => []);
      setMyEmergencyRequests(Array.isArray(myReqs) ? myReqs : []);

      try {
        const allReqs = await api.getEmergencyRequests();
        if (Array.isArray(allReqs)) {
          setEmergencyRequests(allReqs);
          setIsEmergencyVolunteer(true);
        }
      } catch (e) {
        setIsEmergencyVolunteer(false);
      }
    } catch (err) {
      console.error('Error loading emergency data:', err);
    } finally {
      setEmergencyLoading(false);
    }
  };

  const loadHealthLeaderData = async () => {
    if (slug !== 'health' || !isLeaderOrAdmin) return;
    setTasksLoading(true);
    setTeamLoading(true);
    try {
      const [tasksData, teamData, usersData] = await Promise.all([
        api.getHealthTasks().catch(() => []),
        api.getEmergencyTeam().catch(() => []),
        api.getUsers().catch(() => [])
      ]);
      setHealthTasks(Array.isArray(tasksData) ? tasksData : []);
      setEmergencyTeam(Array.isArray(teamData) ? teamData : []);
      const uList = Array.isArray(usersData) ? usersData : (usersData?.users || []);
      setAvailableVolunteers(uList);
    } catch (err) {
      console.error('Error loading health leader data:', err);
    } finally {
      setTasksLoading(false);
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    if (slug === 'education' && wing) {
      loadEducationData();
    }
    if (slug === 'health' && wing) {
      loadHealthData();
      loadEmergencyData();
    }
  }, [slug, wing, user]);

  useEffect(() => {
    if (activeTab === 'leader_panel' && isLeaderOrAdmin) {
      if (slug === 'education') loadLeaderData();
      if (slug === 'health') loadHealthLeaderData();
    }
    if (myHistoryTab && user && slug === 'education') {
      loadMyBookHistory();
    }
  }, [activeTab, myHistoryTab, isLeaderOrAdmin, user, slug]);

  // Health Wing Handlers
  const handleCampRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCamp) return;
    if (!campRegisterForm.name || !campRegisterForm.phone) {
      showFeedback('error', tx('নাম এবং মোবাইল নম্বর দেওয়া আবশ্যক।', 'Name and phone number are required.'));
      return;
    }
    setSubmittingCampRegister(true);
    try {
      await api.registerHealthCamp(selectedCamp._id, campRegisterForm);
      showFeedback('success', tx('স্বাস্থ্য ক্যাম্পের জন্য রেজিস্ট্রেশন সফল হয়েছে!', 'Successfully registered for the health camp!'));
      setRegisterCampModalOpen(false);
      setCampRegisterForm({ name: '', phone: '', age: '', gender: 'Male' });
      loadHealthData();
    } catch (err) {
      showFeedback('error', err.message || tx('রেজিস্ট্রেশন ব্যর্থ হয়েছে।', 'Registration failed.'));
    } finally {
      setSubmittingCampRegister(false);
    }
  };

  const handleCreateCampSubmit = async (e) => {
    e.preventDefault();
    if (!newCampForm.title || !newCampForm.date || !newCampForm.location) {
      showFeedback('error', tx('ক্যাম্পের নাম, তারিখ এবং স্থান আবশ্যক।', 'Camp title, date, and location are required.'));
      return;
    }
    setSubmittingCamp(true);
    try {
      await api.createHealthCamp(newCampForm);
      showFeedback('success', tx('নতুন ফ্রি স্বাস্থ্য ক্যাম্প সফলভাবে তৈরি হয়েছে!', 'New Free Health Camp created successfully!'));
      loadHealthData();
      setActiveTab('camps');
    } catch (err) {
      showFeedback('error', err.message || tx('ক্যাম্প তৈরি করতে সমস্যা হয়েছে।', 'Failed to create camp.'));
    } finally {
      setSubmittingCamp(false);
    }
  };

  const handleDeleteCamp = async (campId) => {
    setDeletingCampId(campId);
    try {
      await api.deleteHealthCamp(campId);
      showFeedback('success', tx('স্বাস্থ্য ক্যাম্পটি মুছে ফেলা হয়েছে।', 'Health camp deleted.'));
      setCampToDelete(null);
      loadHealthData();
    } catch (err) {
      showFeedback('error', err.message || tx('ডিলিট করতে ব্যর্থ হয়েছে।', 'Failed to delete camp.'));
    } finally {
      setDeletingCampId(null);
    }
  };

  const handleRegisterDonorSubmit = async (e) => {
    e.preventDefault();
    if (!donorForm.name || !donorForm.age || !donorForm.phone || !donorForm.bloodGroup) {
      showFeedback('error', tx('নাম, বয়স, রক্তের গ্রুপ ও মোবাইল নম্বর আবশ্যক।', 'Name, age, blood group and phone are required.'));
      return;
    }
    setSubmittingDonor(true);
    try {
      await api.createBloodDonor(donorForm);
      showFeedback('success', tx('ধন্যবাদ! ব্লাড ব্যাংকে রক্তদাতা হিসেবে নিবন্ধন সফল হয়েছে।', 'Blood donor registered successfully!'));
      setDonorModalOpen(false);
      setDonorForm({
        name: '',
        age: '',
        gender: 'Male',
        bloodGroup: 'A+',
        phone: '',
        alternatePhone: '',
        location: 'ঝালকাঠি সদর',
        district: 'ঝালকাঠি',
        lastDonationDate: '',
        donationCount: 0,
        notes: ''
      });
      loadHealthData();
    } catch (err) {
      showFeedback('error', err.message || tx('নিবন্ধন ব্যর্থ হয়েছে।', 'Registration failed.'));
    } finally {
      setSubmittingDonor(false);
    }
  };

  const handleDeleteDonor = async (donorId) => {
    setDeletingDonorId(donorId);
    try {
      await api.deleteBloodDonor(donorId);
      showFeedback('success', tx('রক্তদাতার তথ্য মুছে ফেলা হয়েছে।', 'Blood donor removed.'));
      setDonorToDelete(null);
      loadHealthData();
    } catch (err) {
      showFeedback('error', err.message || tx('ডিলিট করতে ব্যর্থ হয়েছে।', 'Failed to delete donor.'));
    } finally {
      setDeletingDonorId(null);
    }
  };

  const handleSubmitEmergencyRequest = async (e) => {
    e.preventDefault();
    if (!emergencyForm.patientName || !emergencyForm.contactName || !emergencyForm.contactPhone || !emergencyForm.description) {
      showFeedback('error', tx('রোগীর নাম, যোগাযোগের নাম, ফোন নম্বর ও বিস্তারিত তথ্য পূরণ করুন।', 'Please fill in patient name, contact details and problem description.'));
      return;
    }
    setSubmittingEmergency(true);
    try {
      await api.createEmergencyRequest(emergencyForm);
      showFeedback('success', tx('জরুরি বার্তা সফলভাবে প্রেরিত হয়েছে! আমাদের উইং লিডার ও জরুরি টিম তাৎক্ষণিক যোগাযোগ করবে।', 'Emergency request sent! Our team will contact you immediately.'));
      setEmergencyModalOpen(false);
      setEmergencyForm({
        patientName: '',
        hospital: 'ঝালকাঠি সদর হাসপাতাল',
        ward: '',
        contactName: '',
        contactPhone: '',
        emergencyType: 'admission',
        urgency: 'high',
        description: ''
      });
      loadEmergencyData();
    } catch (err) {
      showFeedback('error', err.message || tx('বার্তা পাঠাতে ব্যর্থ হয়েছে।', 'Failed to submit emergency request.'));
    } finally {
      setSubmittingEmergency(false);
    }
  };

  const handleUpdateEmergencyStatus = async (id, status, assignedVolunteer = null, message = '') => {
    try {
      await api.updateEmergencyRequestStatus(id, { status, assignedVolunteer, message });
      showFeedback('success', tx('ইমার্জেন্সি সেলের স্ট্যাটাস আপডেট হয়েছে।', 'Emergency status updated.'));
      loadEmergencyData();
      if (selectedEmergency && selectedEmergency._id === id) {
        const updatedReq = await api.getEmergencyRequest(id);
        setSelectedEmergency(updatedReq);
      }
    } catch (err) {
      showFeedback('error', err.message || tx('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।', 'Failed to update status.'));
    }
  };

  const handleSendEmergencyResponse = async (e) => {
    e.preventDefault();
    if (!selectedEmergency || !emergencyResponseText.trim()) return;
    setSubmittingResponse(true);
    try {
      const res = await api.addEmergencyResponse(selectedEmergency._id, { message: emergencyResponseText.trim() });
      showFeedback('success', tx('রেসপন্স পাঠানো হয়েছে।', 'Response posted.'));
      setEmergencyResponseText('');
      if (res?.request) {
        setSelectedEmergency(res.request);
      }
      loadEmergencyData();
    } catch (err) {
      showFeedback('error', err.message || tx('মেসেজ পাঠাতে সমস্যা হয়েছে।', 'Failed to post message.'));
    } finally {
      setSubmittingResponse(false);
    }
  };

  const handleAssignTaskSubmit = async (e) => {
    e.preventDefault();
    if (!taskForm.title || !taskForm.assignedToName) {
      showFeedback('error', tx('কাজের শিরোনাম ও ভলান্টিয়ারের নাম আবশ্যক।', 'Task title and volunteer name are required.'));
      return;
    }
    setSubmittingTask(true);
    try {
      await api.createHealthTask({
        title: taskForm.title,
        description: taskForm.description,
        assignedTo: {
          name: taskForm.assignedToName,
          phone: taskForm.assignedToPhone,
          email: taskForm.assignedToEmail,
          user: taskForm.assignedToUserId || null
        },
        camp: taskForm.campId || null,
        campTitle: taskForm.campTitle || '',
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || null
      });
      showFeedback('success', tx('ভলান্টিয়ারকে দায়িত্ব অর্পণ সম্পন্ন হয়েছে!', 'Task assigned to volunteer successfully!'));
      setAssignTaskModalOpen(false);
      setTaskForm({
        title: '',
        description: '',
        assignedToName: '',
        assignedToPhone: '',
        assignedToEmail: '',
        assignedToUserId: '',
        campId: '',
        campTitle: '',
        priority: 'medium',
        dueDate: ''
      });
      loadHealthLeaderData();
    } catch (err) {
      showFeedback('error', err.message || tx('দায়িত্ব অর্পণ ব্যর্থ হয়েছে।', 'Failed to assign task.'));
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.updateHealthTaskStatus(taskId, { status: newStatus });
      showFeedback('success', tx('কাজের অগ্রগতি আপডেট হয়েছে।', 'Task status updated.'));
      loadHealthLeaderData();
    } catch (err) {
      showFeedback('error', err.message || tx('আপডেট ব্যর্থ হয়েছে।', 'Failed to update task.'));
    }
  };

  const handleAddTeamMemberSubmit = async (e) => {
    e.preventDefault();
    if (!teamMemberForm.name || !teamMemberForm.phone) {
      showFeedback('error', tx('ভলান্টিয়ারের নাম ও মোবাইল নম্বর আবশ্যক।', 'Volunteer name and phone are required.'));
      return;
    }
    setSubmittingTeamMember(true);
    try {
      await api.addEmergencyTeamMember(teamMemberForm);
      showFeedback('success', tx('ইমার্জেন্সি সেল টিমে ভলান্টিয়ার যুক্ত হয়েছে এবং স্বয়ংক্রিয় এক্সেস প্রদান করা হয়েছে!', 'Volunteer added to Emergency Cell team with automatic access!'));
      setAddTeamMemberModalOpen(false);
      setTeamMemberForm({
        userId: '',
        name: '',
        phone: '',
        email: '',
        roleTitle: 'ইমার্জেন্সি সেল ভলান্টিয়ার',
        hospitalAssigned: 'all'
      });
      loadHealthLeaderData();
    } catch (err) {
      showFeedback('error', err.message || tx('টিমে যুক্ত করতে সমস্যা হয়েছে।', 'Failed to add team member.'));
    } finally {
      setSubmittingTeamMember(false);
    }
  };

  const handleRemoveTeamMember = async (memberId) => {
    try {
      await api.removeEmergencyTeamMember(memberId);
      showFeedback('success', tx('ইমার্জেন্সি সেল টিম থেকে ভলান্টিয়ার প্রত্যাহার করা হয়েছে।', 'Volunteer removed from Emergency Cell team.'));
      loadHealthLeaderData();
    } catch (err) {
      showFeedback('error', err.message || tx('প্রত্যাহার ব্যর্থ হয়েছে।', 'Failed to remove member.'));
    }
  };

  // Handle Book Donation Submit
  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showFeedback('error', tx('বই দান করতে অনুগ্রহ করে মেম্বার হিসেবে লগইন করুন।', 'Please sign in to donate a book.'));
      return;
    }
    if (!donateForm.title || !donateForm.author) {
      showFeedback('error', tx('বইয়ের নাম এবং লেখকের নাম দেওয়া আবশ্যক।', 'Book title and author name are required.'));
      return;
    }

    setSubmittingDonate(true);
    try {
      await api.donateBook(donateForm);
      showFeedback('success', tx('ধন্যবাদ! আপনার বই অনুদানের প্রস্তাবটি জমা হয়েছে। শিক্ষা উইং লিডারের অনুমোদনের পর এটি তালিকায় যুক্ত হবে।', 'Thank you! Your donation proposal was submitted. It will appear once approved by the wing leader.'));
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
      showFeedback('error', err.message || tx('বই অনুদান জমা দিতে ব্যর্থ হয়েছে।', 'Failed to submit book donation.'));
    } finally {
      setSubmittingDonate(false);
    }
  };

  // Handle Book Request Submit
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showFeedback('error', tx('বই রিকোয়েস্ট করতে অনুগ্রহ করে মেম্বার হিসেবে লগইন করুন।', 'Please sign in to request a book.'));
      return;
    }
    if (!requestForm.reason || !requestForm.contactPhone) {
      showFeedback('error', tx('রিকোয়েস্টের কারণ এবং যোগাযোগের ফোন নম্বর দেওয়া আবশ্যক।', 'Reason and contact phone are required.'));
      return;
    }

    setSubmittingRequest(true);
    try {
      await api.requestBook(requestModalBook._id, requestForm);
      showFeedback('success', tx(`"${requestModalBook.title}" বইটির জন্য আপনার রিকোয়েস্ট জমা হয়েছে! শিক্ষা উইং লিডার রিভিউ করবেন।`, `Your request for "${requestModalBook.title}" has been submitted for wing leader review.`));
      setRequestModalBook(null);
      setRequestForm({
        reason: '',
        deliveryAddress: 'ঝালকাঠি সদর',
        contactPhone: user?.phone || ''
      });
      loadMyBookHistory();
    } catch (err) {
      showFeedback('error', err.message || tx('বই রিকোয়েস্ট ব্যর্থ হয়েছে।', 'Book request failed.'));
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Moderate Book Donation (Approve/Reject)
  const handleModerateBook = async (bookId, status, reason = '') => {
    try {
      await api.updateBookStatus(bookId, { status, rejectionReason: reason });
      showFeedback('success', tx(`বই অনুদানটি সফলভাবে ${status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} হয়েছে!`, `Book donation was successfully ${status === 'approved' ? 'approved' : 'rejected'}!`));
      loadLeaderData();
      loadEducationData();
      setRejectModalItem(null);
      setRejectionReason('');
    } catch (err) {
      showFeedback('error', err.message || tx('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।', 'Status update failed.'));
    }
  };

  // Moderate Book Request (Approve/Reject)
  const handleModerateRequest = async (requestId, status, reason = '') => {
    try {
      await api.updateBookRequestStatus(requestId, { status, rejectionReason: reason });
      showFeedback('success', tx(`বুক রিকোয়েস্টটি ${status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} হয়েছে!`, `Book request was ${status === 'approved' ? 'approved' : 'rejected'}!`));
      loadLeaderData();
      setRejectModalItem(null);
      setRejectionReason('');
    } catch (err) {
      showFeedback('error', err.message || tx('রিকোয়েস্ট স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।', 'Request status update failed.'));
    }
  };

  // Handle Launch New Course
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.description) {
      showFeedback('error', tx('কোর্সের শিরোনাম ও বিবরণ আবশ্যক।', 'Course title and description are required.'));
      return;
    }

    setSubmittingCourse(true);
    try {
      const processedLessons = (courseForm.lessons || []).map((les, idx) => ({
        ...les,
        videoUrl: getYouTubeEmbedUrl(les.videoUrl),
        order: les.order || idx + 1
      }));

      await api.createCourse({
        ...courseForm,
        lessons: processedLessons,
        instructor: {
          name: courseForm.instructorName || user?.name || 'WCC Instructor',
          title: courseForm.instructorTitle,
          organization: 'উই ক্যান চেঞ্জ (WCC)'
        }
      });
      showFeedback('success', tx('নতুন ফ্রি কোর্সটি সফলভাবে উন্মুক্ত করা হয়েছে!', 'New free course launched successfully!'));
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
      setLeaderTab('manage_courses');
    } catch (err) {
      showFeedback('error', err.message || tx('কোর্স তৈরি করতে ব্যর্থ হয়েছে।', 'Failed to create course.'));
    } finally {
      setSubmittingCourse(false);
    }
  };

  // Handle Delete Course
  const handleDeleteCourse = async (courseId) => {
    if (!courseId) return;
    setDeletingCourseId(courseId);
    try {
      await api.deleteCourse(courseId);
      showFeedback('success', tx('কোর্সটি সফলভাবে মুছে ফেলা হয়েছে!', 'Course deleted successfully!'));
      setCourseToDelete(null);
      if (selectedCourse && selectedCourse._id === courseId) {
        setSelectedCourse(null);
      }
      loadEducationData();
    } catch (err) {
      showFeedback('error', err.message || tx('কোর্সটি মুছতে ব্যর্থ হয়েছে।', 'Failed to delete course.'));
    } finally {
      setDeletingCourseId(null);
    }
  };

  // Handle Enroll in Course
  const handleEnrollCourse = async (courseId) => {
    if (!user) {
      showFeedback('error', tx('কোর্সে এনরোল করতে প্রথমে মেম্বার লগইন করুন।', 'Please sign in as member to enroll in courses.'));
      return;
    }
    try {
      const res = await api.enrollCourse(courseId);
      showFeedback('success', res.message || tx('অভিনন্দন! আপনি সফলভাবে কোর্সে যুক্ত হয়েছেন।', 'Congratulations! Successfully enrolled in course.'));
      loadEducationData();
      if (selectedCourse && selectedCourse._id === courseId) {
        setSelectedCourse(prev => ({
          ...prev,
          isEnrolled: true,
          enrolledMembers: [...(prev.enrolledMembers || []), user.id || user._id]
        }));
      }
    } catch (err) {
      showFeedback('error', err.message || tx('এনরোলমেন্ট ব্যর্থ হয়েছে।', 'Enrollment failed.'));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
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
        <h2 className="text-2xl font-black text-slate-900">{tx('উইং খুঁজে পাওয়া যায়নি', 'Wing Not Found')}</h2>
        <p className="text-sm text-slate-500 max-w-md">
          অনুরোধ করা উইংটি বিদ্যমান নেই অথবা এর নাম পরিবর্তন করা হয়েছে।
        </p>
        <Link
          href="/wings"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B62A35] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#9E1F2A] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{tx('সকল উইং দেখুন', 'View All Wings')}</span>
        </Link>
      </div>
    );
  }
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
            <span className="text-[#F1AD1A] font-bold">{lang === 'bn' ? (wing.nameBn || wing.nameEn) : (wing.nameEn || wing.nameBn)}</span>
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
                {lang === 'bn' ? (wing.description || 'ঝালকাঠি ও সমাজের ইতিবাচক রূপান্তরে যুব সমাজের সক্রিয় উদ্যোগ।') : (wing.descriptionEn || wing.description || 'Youth-driven initiatives for positive social transformation.')}
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
                        <span>{tx('উইং লিডার', 'Wing Leader')}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white">{wing.leader.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{tx('উইং লিডার নিয়োগ প্রক্রিয়াধীন', 'Wing Leader Appointment Pending')}</span>
                  </div>
                )}

                {user && (
                  <span className="text-xs text-slate-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                    {tx('লগইন আছেন:', 'Logged in:')} <strong className="text-emerald-400">{user.name}</strong> ({user.role})
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="lg:col-span-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#F1AD1A]">
                  {tx('উইং এক নজরে', 'Wing At A Glance')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {isEducation ? (
                    <>
                      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">{tx('ফ্রি কোর্স', 'Free Courses')}</p>
                        <p className="text-2xl font-black text-white">{courses.length}</p>
                        <span className="text-[10px] text-emerald-400">{tx('সদস্যদের জন্য ফ্রি', 'Free for Members')}</span>
                      </div>
                      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">{tx('বই ভাণ্ডার', 'Book Bank')}</p>
                        <p className="text-2xl font-black text-white">{books.length}</p>
                        <span className="text-[10px] text-blue-400">{tx('আদান-প্রদান প্রস্তুত', 'Exchange Ready')}</span>
                      </div>
                    </>
                  ) : isHealth ? (
                    <>
                      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">{tx('স্বাস্থ্য ক্যাম্প', 'Health Camps')}</p>
                        <p className="text-2xl font-black text-white">{camps.length}</p>
                        <span className="text-[10px] text-emerald-400">{tx('বিনামূল্যে সেবা', 'Free Services')}</span>
                      </div>
                      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">{tx('ব্লাড ব্যাংক', 'Blood Donors')}</p>
                        <p className="text-2xl font-black text-white">{donors.length}</p>
                        <span className="text-[10px] text-rose-400">{tx('জরুরি প্রস্তুত', 'Ready to Donate')}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">{tx('প্রোগ্রাম', 'Programs')}</p>
                        <p className="text-2xl font-black text-white">{programs.length}</p>
                        <span className="text-[10px] text-emerald-400">{tx('উদ্যোগসমূহ', 'Initiatives')}</span>
                      </div>
                      <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">{tx('ইভেন্টস', 'Events')}</p>
                        <p className="text-2xl font-black text-white">{events.length}</p>
                        <span className="text-[10px] text-blue-400">{tx('মাঠপর্যায়ের কাজ', 'Field Activities')}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="pt-2 border-t border-white/10 text-xs text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{tx('WCC অফিসিয়াল কৌশলগত উইং', 'WCC Official Strategic Wing')}</span>
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
                onClick={() => handleTabChange('overview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#B62A35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{tx('উইং ওভারভিউ ও লক্ষ্য', 'Overview & Goals')}</span>
              </button>

              <button
                onClick={() => handleTabChange('courses')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'courses'
                    ? 'bg-[#B62A35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>{tx('ফ্রি কোর্সসমূহ', 'Free Courses')} ({courses.length})</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  FREE
                </span>
              </button>

              <button
                onClick={() => handleTabChange('books')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'books'
                    ? 'bg-[#B62A35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{tx('বই কর্নার ও লাইব্রেরি', 'Book Corner & Library')} ({books.length})</span>
              </button>

              {isLeaderOrAdmin && (
                <button
                  onClick={() => handleTabChange('leader_panel')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'leader_panel'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{tx('উইং লিডার ড্যাশবোর্ড', 'Wing Leader Dashboard')}</span>
                  {(pendingBooks.length > 0 || allBookRequests.filter(r => r.status === 'pending').length > 0) && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Tabs Navigation for Health Wing */}
      {isHealth && (
        <section className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
              <button
                onClick={() => handleTabChange('overview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{tx('উইং ওভারভিউ', 'Overview')}</span>
              </button>

              <button
                onClick={() => handleTabChange('camps')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'camps'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                <span>{tx('ফ্রি স্বাস্থ্য ক্যাম্প', 'Free Health Camps')} ({camps.length})</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                  FREE
                </span>
              </button>

              <button
                onClick={() => handleTabChange('blood_bank')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'blood_bank'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Droplets className="w-4 h-4 text-rose-500" />
                <span>{tx('ব্লাড ব্যাংক', 'Blood Bank')} ({donors.length})</span>
              </button>

              <button
                onClick={() => handleTabChange('emergency_cell')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'emergency_cell'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Ambulance className="w-4 h-4" />
                <span>{tx('জরুরি হাসপাতাল সেল', 'Hospital Emergency Cell')}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black animate-pulse">
                  ২৪/৭
                </span>
              </button>

              <button
                onClick={() => handleTabChange('leader_panel')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'leader_panel'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : isLeaderOrAdmin
                      ? 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                      : 'text-slate-600 bg-slate-100 hover:bg-purple-50 hover:text-purple-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>{tx('উইং লিডার প্যানেল', 'Wing Leader Panel')}</span>
                {!isLeaderOrAdmin && (
                  <span className="px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                    ১-ক্লিক
                  </span>
                )}
              </button>

              {!isLeaderOrAdmin && (
                <button
                  type="button"
                  onClick={handleHealthLeaderAutoLogin}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer whitespace-nowrap"
                  title="১-ক্লিকে হেলথ উইং লিডার হিসেবে লগইন করুন"
                >
                  <span className="text-sm">🩺</span>
                  <span>{tx('১-ক্লিক লিডার লগইন', '1-Click Leader Login')}</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Body Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* ========================================================================= */}
        {/* HEALTH WING CONTENT & TABS                                                */}
        {/* ========================================================================= */}
        {isHealth && (
          <HealthWingView
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            isLeaderOrAdmin={isLeaderOrAdmin}
            user={user}
            wing={wing}
            tx={tx}
            lang={lang}
            showFeedback={showFeedback}
            onHealthLeaderAutoLogin={handleHealthLeaderAutoLogin}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & INITIATIVES (For General & Education Wings)             */}
        {/* ========================================================================= */}
        {(!isEducation && !isHealth || (isEducation && activeTab === 'overview')) && (
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
                      <span>{tx('দায়িত্বপ্রাপ্ত উইং লিডার', 'Assigned Wing Leader')}</span>
                    </div>
                    <h3 className="text-xl font-black text-white">{wing.leader.name}</h3>
                    <p className="text-xs text-slate-300">
                      {tx(`উই ক্যান চেঞ্জ (${wing.nameBn}) তত্ত্বাবধায়ক ও পরিচালন সমন্বয়ক`, `We Can Change (${wing.nameEn}) Supervisor & Operations Coordinator`)}
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
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">{tx('নেতৃত্ব ও নজরদারি', 'Leadership & Oversight')}</span>
                  <p className="font-bold text-white">{tx('বই অনুদান ও কোর্স অনুমোদন', 'Book Donation & Course Approval')}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">{tx('সক্রিয় তত্ত্বাবধায়ক', 'Active Lead')}</span>
                </div>
              </section>
            )}

            {/* Strategic Mission Goals */}
            {Array.isArray(wing.missionPoints) && wing.missionPoints.length > 0 && (
              <section className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#B62A35]">
                    {tx('কৌশলগত লক্ষ্যসমূহ', 'Strategic Goals')}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                    {lang === 'bn' ? wing.nameBn : wing.nameEn} {tx('-এর মূল কার্যক্রম ও উদ্দেশ্য', 'Core Objectives & Activities')}
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
                          {tx('টেকসই উন্নয়ন ও নাগরিক সেবায় প্রত্যক্ষ সহযোগিতা।', 'Direct contribution to community development and public service.')}
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
                    {tx('চলমান ও সমাপ্ত কর্মসূচি', 'Ongoing & Completed Initiatives')}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                    {tx('উইং প্রোগ্রামসমূহ', 'Wing Programs')} ({programs.length})
                  </h2>
                </div>
                <Link
                  href="/programs"
                  className="text-xs font-bold text-[#B62A35] hover:underline flex items-center gap-1"
                >
                  <span>{tx('সকল প্রোগ্রাম', 'All Programs')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {programs.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                  {tx('বর্তমানে এই উইংয়ের আওতায় কোনো প্রোগ্রাম তালিকাভুক্ত নেই।', 'No programs currently listed under this wing.')}
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
                        {prog.description || tx('ঝালকাঠির স্থানীয় নাগরিকদের জন্য বিশেষ উন্নয়ন কর্মসূচি।', 'Special development program for local community members.')}
                      </p>
                      <div className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#B62A35]" />
                        <span>{tx('শুরু:', 'Starts:')} {formatDate(prog.startDate)}</span>
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
                  {tx('WCC শিক্ষা উদ্যোগ', 'WCC Education Initiative')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  {tx('বিনামূল্যে স্কিল ডেভেলপমেন্ট ও একাডেমিক কোর্সসমূহ', 'Free Skill Development & Academic Courses')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {tx('WCC-এর সকল নিবন্ধিত মেম্বারদের জন্য শতভাগ বিনামূল্যে উন্মুক্ত। যে কেউ ঘরে বসেই প্রফেশনাল স্কিল শিখতে পারবেন।', '100% free for all registered WCC members. Learn in-demand professional skills at your own pace.')}
                </p>
              </div>

              {!user && (
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B62A35] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#9E1F2A] transition-all shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{tx('মেম্বার হয়ে ফ্রি এক্সেস নিন', 'Become Member for Free Access')}</span>
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
                <h3 className="text-base font-bold text-slate-800">{tx('শীঘ্রই নতুন কোর্স লঞ্চ করা হবে', 'New Courses Coming Soon')}</h3>
                <p className="text-xs text-slate-500">
                  {tx('শিক্ষা উইংয়ের মেন্টর টিম নতুন ফ্রি লেকচার ও কোর্স প্রস্তুত করছে।', 'The Education Wing mentor team is preparing free interactive lectures.')}
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
                        {isLeaderOrAdmin && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCourseToDelete(course);
                            }}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white backdrop-blur transition-colors cursor-pointer shadow-md"
                            title={tx('কোর্সটি ডিলিট করুন', 'Delete Course')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
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
                          <span>{course.lessons?.length || 0} {tx('টি মডিউল', 'Modules')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveLessonIndex(0);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-[#B62A35] text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{tx('কোর্সে প্রবেশ করুন', 'Start Course')}</span>
                      </button>
                      {isLeaderOrAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCourseToDelete(course);
                          }}
                          className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer shrink-0"
                          title={tx('কোর্সটি ডিলিট করুন', 'Delete Course')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
                  {tx('WCC বুক ব্যাংক ও এক্সচেঞ্জ', 'WCC Book Bank & Exchange')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  {tx('বই অনুদান ও বিনামূল্যে বই সংগ্রহ কর্নার', 'Book Donation & Free Collection Corner')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {tx('যেকোনো মেম্বার তাদের পুরাতন বা শিক্ষণীয় বই অন্য শিক্ষার্থীর জন্য দান করতে পারেন, এবং যাদের প্রয়োজন তারা সংগ্রহ করতে পারেন।', 'Any member can donate study materials and textbooks for fellow students in need.')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDonateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B62A35] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#9E1F2A] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{tx('বই দান করুন', 'Donate Book')}</span>
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
                    <span>{tx('আমার বই ও রিকোয়েস্ট', 'My Books & Requests')}</span>
                  </button>
                )}
              </div>
            </div>

            {/* My Donations & Requests View */}
            {myHistoryTab && user && (
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900">
                    {tx('আপনার জমাকৃত বই অনুদান ও বইয়ের রিকোয়েস্টসমূহ', 'Your Donated Books & Requests')} 
                  </h3>
                  <button
                    onClick={() => setMyHistoryTab(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    {tx('বন্ধ করুন', 'Close')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* My Book Donations */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                      <Send className="w-3.5 h-3.5 text-[#B62A35]" />
                      <span>{tx('আমার দান করা বই', 'My Donated Books')} ({myDonations.length})</span>
                    </h4>
                    {myDonations.length === 0 ? (
                      <p className="text-xs text-slate-400">{tx('আপনি এখনও কোনো বই দান করেননি।', 'You have not donated any books yet.')}</p>
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
                      <span>{tx('আমার বইয়ের রিকোয়েস্টসমূহ', 'My Book Requests')} ({myRequests.length})</span>
                    </h4>
                    {myRequests.length === 0 ? (
                      <p className="text-xs text-slate-400">{tx('আপনি কোনো বইয়ের জন্য রিকোয়েস্ট করেননি।', 'You have not requested any books yet.')}</p>
                    ) : (
                      <div className="space-y-2">
                        {myRequests.map(r => (
                          <div
                            key={r._id}
                            className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-800">{r.book?.title || 'বই'}</p>
                              <span className="text-[11px] text-slate-500">{tx('ঠিকানা:', 'Address:')} {r.deliveryAddress}</span>
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
                  placeholder={tx('বইয়ের নাম, লেখক বা স্থান দিয়ে খুঁজুন...', 'Search books by title, author, or location...')}
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
                <option value="All">{tx('সকল ক্যাটাগরি', 'All Categories')}</option>
                <option value="Academic">{tx('স্কুল ও কলেজ পাঠ্যবই', 'School & College Textbooks')}</option>
                <option value="BCS & Competitive Exams">{tx('বিসিএস ও চাকরি প্রস্তুতি', 'BCS & Competitive Exams')}</option>
                <option value="Science & Technology">{tx('বিজ্ঞান ও প্রযুক্তি', 'Science & Technology')}</option>
                <option value="Literature & Novels">{tx('সাহিত্য ও উপন্যাস', 'Literature & Novels')}</option>
                <option value="Self Development">{tx('আত্মউন্নয়ন ও অন্যান্য', 'Self Development & Others')}</option>
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
                <h3 className="text-base font-bold text-slate-800">{tx('কোনো বই পাওয়া যায়নি', 'No Books Found')}</h3>
                <p className="text-xs text-slate-500">
                  {tx('আপনার পুরাতন বা বাড়তি বই দান করে অন্য শিক্ষার্থীকে সাহায্য করুন।', 'Help fellow students by donating your read or extra textbooks.')}
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
                        <p className="text-xs text-slate-600 font-medium">{tx('লেখক:', 'Author:')} {b.author}</p>
                        {b.edition && (
                          <p className="text-[11px] text-slate-400">{tx('সংস্করণ:', 'Edition:')} {b.edition}</p>
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
                        <span>{tx('বইটি রিকোয়েস্ট করুন', 'Request This Book')}</span>
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
                  <span>{tx('শিক্ষা উইং লিডার কন্ট্রোল প্যানেল', 'Education Wing Leader Panel')}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-2">
                  {tx('বই অনুদান, বই রিকোয়েস্ট ও কোর্স ব্যবস্থাপনা', 'Book Donations, Requests & Course Management')}
                </h2>
                <p className="text-xs text-slate-500">
                  {tx('আপনি এই উইংয়ের দায়িত্বপ্রাপ্ত কর্মকর্তা হিসেবে সদস্যদের বই আবেদন যাচাই ও কোর্স পরিচালনা করতে পারেন।', 'As the designated wing lead, you can moderate book submissions and manage educational courses.')}
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
                  {tx('পেন্ডিং বই অনুদান', 'Pending Donations')} ({pendingBooks.length})
                </button>
                <button
                  onClick={() => setLeaderTab('requests')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    leaderTab === 'requests' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {tx('পেন্ডিং বই রিকোয়েস্ট', 'Pending Requests')} ({allBookRequests.filter(r => r.status === 'pending').length})
                </button>
                <button
                  onClick={() => setLeaderTab('manage_courses')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    leaderTab === 'manage_courses' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {tx('কোর্স পরিচালনা ও ডিলিট', 'Manage Courses')} ({courses.length})
                </button>
                <button
                  onClick={() => setLeaderTab('new_course')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    leaderTab === 'new_course' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {tx('+ নতুন ফ্রি কোর্স', '+ New Free Course')}
                </button>
              </div>
            </div>

            {/* Moderation Sub-Tab 1: Pending Book Donations */}
            {leaderTab === 'donations' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800">{tx('অনুমোদনের অপেক্ষায় থাকা বইসমূহ', 'Books Awaiting Approval')}</h3>
                {pendingBooks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                    {tx('কোনো পেন্ডিং বই অনুদান নেই।', 'No pending book donations.')}
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
                            {b.category} • {tx('অবস্থা:', 'Condition:')} {b.condition}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                          <p className="text-xs text-slate-600">{tx('লেখক:', 'Author:')} {b.author}</p>
                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                            <span>{tx('দাতা:', 'Donor:')} <strong>{b.donor?.name || tx('অজ্ঞাত', 'Anonymous')}</strong></span>
                            {b.donor?.phone && <span>{tx('ফোন:', 'Phone:')} {b.donor.phone}</span>}
                            <span>{tx('স্থান:', 'Location:')} {b.pickupLocation}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleModerateBook(b._id, 'approved')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{tx('অনুমোদন', 'Approve')}</span>
                          </button>
                          <button
                            onClick={() => setRejectModalItem({ type: 'book', id: b._id, title: b.title })}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 cursor-pointer flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{tx('বাতিল', 'Reject')}</span>
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
                <h3 className="text-sm font-bold text-slate-800">{tx('মেম্বারদের বইয়ের আবেদনসমূহ', 'Member Book Requests')}</h3>
                {allBookRequests.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                    {tx('কোনো বইয়ের আবেদন নেই।', 'No book requests found.')}
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
                              {r.status === 'approved' ? tx('অনুমোদিত', 'Approved') : r.status === 'rejected' ? tx('বাতিল', 'Rejected') : tx('যাচাইাধীন', 'Pending')}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {tx('আবেদনকারী:', 'Requester:')} {r.requester?.name} ({r.requester?.phone})
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900">
                            {tx('বই:', 'Book:')} {r.book?.title || tx('বই', 'Book')} ({tx('লেখক:', 'Author:')} {r.book?.author})
                          </h4>
                          <p className="text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-200">
                            <strong>{tx('প্রয়োজনের কারণ:', 'Reason for Request:')}</strong> {r.reason}
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
                              <span>{tx('অনুমোদন', 'Approve')}</span>
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
                  {tx('WCC শিক্ষা উইং থেকে নতুন ফ্রি কোর্স উন্মুক্ত করুন', 'Launch New Free Course from WCC Education Wing')}
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('কোর্সের শিরোনাম *', 'Course Title *')}</label>
                  <input
                    type="text"
                    required
                    placeholder={tx('যেমন: ফ্রন্টএন্ড ওয়েব ডেভেলপমেন্ট ফান্ডামেন্টালস', 'e.g. Frontend Web Development Fundamentals')}
                    value={courseForm.title}
                    onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{tx('ক্যাটাগরি', 'Category')}</label>
                    <input
                      type="text"
                      placeholder="Web Development / Spoken English"
                      value={courseForm.category}
                      onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{tx('লেভেল', 'Level')}</label>
                    <select
                      value={courseForm.level}
                      onChange={e => setCourseForm({ ...courseForm, level: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                    >
                      <option value="Beginner">{tx('শুরুর পর্যায় (Beginner)', 'Beginner')}</option>
                      <option value="Intermediate">{tx('মধ্যম পর্যায় (Intermediate)', 'Intermediate')}</option>
                      <option value="Advanced">{tx('উন্নত পর্যায় (Advanced)', 'Advanced')}</option>
                      <option value="All Levels">{tx('সকল পর্যায় (All Levels)', 'All Levels')}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{tx('সময়সীমা', 'Duration')}</label>
                    <input
                      type="text"
                      placeholder={tx('৪ সপ্তাহ / ১০ ঘন্টা', '4 Weeks / 10 Hours')}
                      value={courseForm.duration}
                      onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('কোর্সের বিবরণ *', 'Course Description *')}</label>
                  <textarea
                    required
                    rows={3}
                    placeholder={tx('কোর্সের বিস্তারিত বর্ণনা এবং শিক্ষার্থীরা কী শিখবে...', 'Detailed course overview and curriculum topics...')}
                    value={courseForm.description}
                    onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('ভিডিও লেকচার লিঙ্ক (YouTube URL / Embed)', 'Video Lecture YouTube URL')}</label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={courseForm.lessons[0]?.videoUrl || ''}
                    onChange={e => {
                      const lessons = [...courseForm.lessons];
                      lessons[0] = { ...lessons[0], videoUrl: e.target.value };
                      setCourseForm({ ...courseForm, lessons });
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                  />
                  <p className="text-[11px] text-slate-500">
                    {tx('💡 যেকোনো YouTube লিংক (যেমন watch, share বা shorts লিঙ্ক) পেস্ট করলে তা স্বয়ংক্রিয়ভাবে প্লেয়ারের উপযোগী Embed লিংকে পরিবর্তিত হবে।', '💡 Any YouTube link will automatically be converted to a working embed format.')}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submittingCourse}
                  className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {submittingCourse ? tx('লঞ্চ হচ্ছে...', 'Publishing...') : tx('কোর্সটি পাবলিশ করুন', 'Publish Course')}
                </button>
              </form>
            )}

            {/* Moderation Sub-Tab 4: Manage Courses */}
            {leaderTab === 'manage_courses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800">
                    {tx('প্রকাশিত কোর্স তালিকা ও নিয়ন্ত্রণ', 'Published Courses & Controls')}
                  </h3>
                  <button
                    onClick={() => setLeaderTab('new_course')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{tx('নতুন কোর্স যোগ করুন', 'Add New Course')}</span>
                  </button>
                </div>

                {courses.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                    {tx('বর্তমানে কোনো কোর্স প্রকাশিত নেই।', 'No courses published yet.')}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map(c => (
                      <div
                        key={c._id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-4 justify-between"
                      >
                        <div className="flex gap-3 min-w-0">
                          <img
                            src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'}
                            alt={c.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-200"
                          />
                          <div className="min-w-0 space-y-1">
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                              {c.category || 'General'}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {c.title}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {c.lessons?.length || 0} {tx('টি লেকচার', 'Lessons')} • {c.duration || 'Self-paced'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCourse(c);
                              setActiveLessonIndex(0);
                            }}
                            className="p-2 text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
                            title={tx('কোর্স দেখুন', 'View Course')}
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCourseToDelete(c)}
                            className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                            title={tx('কোর্সটি ডিলিট করুন', 'Delete Course')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              <span className="text-[11px] font-bold text-[#B62A35] uppercase">{tx('বই অনুদান করুন', 'Donate Book')}</span>
              <h3 className="text-xl font-black text-slate-900">{tx('অন্য শিক্ষার্থীর পাশে দাঁড়ান', 'Empower Fellow Students')}</h3>
              <p className="text-xs text-slate-500">
                {tx('আপনার দেওয়া বইটি শিক্ষা উইং লিডার যাচাই করে অন্য শিক্ষার্থীর কাছে পৌঁছে দেবেন।', 'Your donated book will be reviewed by the wing leader and provided to learners in need.')}
              </p>
            </div>

            <form onSubmit={handleDonateSubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('বইয়ের নাম *', 'Book Title *')}</label>
                <input
                  type="text"
                  required
                  placeholder={tx('যেমন: উচ্চ মাধ্যমিক পদার্থবিজ্ঞান', 'e.g. Higher Secondary Physics')}
                  value={donateForm.title}
                  onChange={e => setDonateForm({ ...donateForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#B62A35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('লেখক / প্রকাশনী *', 'Author / Publication *')}</label>
                  <input
                    type="text"
                    required
                    placeholder={tx('লেখকের নাম', 'Author name')}
                    value={donateForm.author}
                    onChange={e => setDonateForm({ ...donateForm, author: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#B62A35]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('সংস্করণ / সাল', 'Edition / Year')}</label>
                  <input
                    type="text"
                    placeholder={tx('যেমন: ২০২৪', 'e.g. 2024')}
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
                  <label className="text-xs font-bold text-slate-700">{tx('বইয়ের অবস্থা', 'Book Condition')}</label>
                  <select
                    value={donateForm.condition}
                    onChange={e => setDonateForm({ ...donateForm, condition: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#B62A35]"
                  >
                    <option value="New">{tx('একদম নতুন (New)', 'Brand New')}</option>
                    <option value="Like New">{tx('নতুন প্রায় (Like New)', 'Like New')}</option>
                    <option value="Good">{tx('ভালো (Good)', 'Good')}</option>
                    <option value="Fair">{tx('পড়ার উপযোগী (Fair)', 'Fair / Acceptable')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('বই হস্তান্তরের স্থান', 'Pickup Location')}</label>
                  <input
                    type="text"
                    placeholder={tx('ঝালকাঠি সদর', 'Jhalakathi Sadar')}
                    value={donateForm.pickupLocation}
                    onChange={e => setDonateForm({ ...donateForm, pickupLocation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#B62A35]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('যোগাযোগের ফোন নম্বর', 'Contact Phone')}</label>
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
                <label className="text-xs font-bold text-slate-700">{tx('সংক্ষিপ্ত বিবরণ', 'Short Note / Description')}</label>
                <textarea
                  rows={2}
                  placeholder={tx('বই সম্পর্কে কোনো বিশেষ মন্তব্য...', 'Any special notes about the book condition...')}
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
                  {submittingDonate ? tx('জমা হচ্ছে...', 'Submitting...') : tx('অনুদানের জন্য জমা দিন', 'Submit Donation')}
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
              <span className="text-[11px] font-bold text-emerald-600 uppercase">{tx('বিনামূল্যে বই সংগ্রহ', 'Request Free Book')}</span>
              <h3 className="text-xl font-black text-slate-900">
                &quot;{requestModalBook.title}&quot; {tx('বইটির জন্য রিকোয়েস্ট', 'Book Request')}
              </h3>
              <p className="text-xs text-slate-500">
                {tx('লেখক:', 'Author:')} {requestModalBook.author} • {tx('স্থান:', 'Location:')} {requestModalBook.pickupLocation}
              </p>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('বইটি কেন প্রয়োজন? (শিক্ষাগত কারণ) *', 'Why do you need this book? (Purpose) *')}</label>
                <textarea
                  required
                  rows={3}
                  placeholder={tx('যেমন: আমি এইচএসসি বিজ্ঞান বিভাগের শিক্ষার্থী, এই বইটি আমার পরীক্ষার প্রস্তুতির জন্য খুব দরকার...', 'e.g. Preparing for exams, studying science in high school...')}
                  value={requestForm.reason}
                  onChange={e => setRequestForm({ ...requestForm, reason: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('বই সংগ্রহের ঠিকানা *', 'Delivery / Collection Address *')}</label>
                <input
                  type="text"
                  required
                  placeholder={tx('যেমন: ঝালকাঠি কলেজ মোড়', 'e.g. Jhalakathi College Moor')}
                  value={requestForm.deliveryAddress}
                  onChange={e => setRequestForm({ ...requestForm, deliveryAddress: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('আপনার মোবাইল নম্বর *', 'Your Phone Number *')}</label>
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
                  {submittingRequest ? tx('রিকোয়েস্ট হচ্ছে...', 'Submitting...') : tx('রিকোয়েস্ট জমা দিন', 'Submit Request')}
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
              <div className="flex items-center gap-2">
                {isLeaderOrAdmin && (
                  <button
                    type="button"
                    onClick={() => setCourseToDelete(selectedCourse)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors cursor-pointer"
                    title={tx('কোর্সটি ডিলিট করুন', 'Delete Course')}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{tx('কোর্স মুছুন', 'Delete')}</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video & Lessons Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
              {/* Left: Video Player & Description */}
              <div className="lg:col-span-8 p-4 sm:p-6 space-y-4 border-r border-slate-200">
                {selectedCourse.lessons?.[activeLessonIndex]?.videoUrl ? (
                  <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-md">
                    <iframe
                      src={getYouTubeEmbedUrl(selectedCourse.lessons[activeLessonIndex].videoUrl)}
                      title={selectedCourse.lessons[activeLessonIndex].title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
                    {tx('ভিডিও লেকচার শীঘ্রই আপলোড হবে', 'Video lecture will be uploaded soon')}
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-base font-bold text-slate-900">
                    {selectedCourse.lessons?.[activeLessonIndex]?.title || tx('লেকচার', 'Lecture')}
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
                      {tx('লগইন করে এক্সেস নিন', 'Login for Full Access')}
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleEnrollCourse(selectedCourse._id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{selectedCourse.isEnrolled ? tx('এনরোল্ড (অধ্যয়নরত)', 'Enrolled') : tx('বিনামূল্যে এনরোল করুন', 'Enroll for Free')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right: Modules / Syllabus */}
              <div className="lg:col-span-4 p-4 sm:p-6 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase">{tx('কোর্স মডিউল ও লেকচারসমূহ', 'Course Modules & Lessons')}</h4>
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
                          {les.duration || tx('লেকচার', 'Lecture')}
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
              <span>{tx('আবেদন বাতিলের কারণ উল্লেখ করুন', 'Specify Rejection Reason')}</span>
            </h3>
            <p className="text-xs text-slate-600">
              &quot;{rejectModalItem.title}&quot; {tx('বাতিল করার পেছনের কারণ প্রদান করুন (সদস্যের সুবিধার্থে):', 'Provide a brief explanation for rejection (for the member):')}
            </p>
            <textarea
              rows={3}
              placeholder={tx('যেমন: বইটির পৃষ্ঠা ক্ষতিগ্রস্ত অথবা পর্যাপ্ত তথ্য নেই...', 'e.g. Damaged pages or insufficient contact details...')}
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
                {tx('বাতিল নিশ্চিত করুন', 'Confirm Rejection')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Deletion Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                {tx('কোর্সটি মুছে ফেলতে চান?', 'Delete this course?')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                &quot;<strong>{courseToDelete.title}</strong>&quot; {tx('কোর্সটি মুছে ফেললে শিক্ষার্থীরা আর এই কোর্সের ভিডিও দেখতে পারবে না। আপনি কি নিশ্চিত?', 'Once deleted, this course will no longer be accessible to students. Are you sure you want to proceed?')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                disabled={deletingCourseId === courseToDelete._id}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {tx('বাতিল', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCourse(courseToDelete._id)}
                disabled={deletingCourseId === courseToDelete._id}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deletingCourseId === courseToDelete._id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{tx('মুছে ফেলা হচ্ছে...', 'Deleting...')}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{tx('হ্যাঁ, মুছে ফেলুন', 'Yes, Delete Course')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WingDetailPage(props) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#B62A35] rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500">উইং পোর্টাল লোড হচ্ছে...</p>
        </div>
      }
    >
      <WingDetailPageInner {...props} />
    </Suspense>
  );
}
