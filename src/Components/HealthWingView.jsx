'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Stethoscope,
  Heart,
  Droplets,
  Ambulance,
  PhoneCall,
  MessageSquare,
  Users,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  UserCheck,
  AlertTriangle,
  Building2,
  Check,
  X,
  Send,
  UserPlus,
  CheckSquare
} from 'lucide-react';

export default function HealthWingView({
  activeTab,
  setActiveTab,
  isLeaderOrAdmin,
  user,
  wing,
  tx,
  lang,
  showFeedback
}) {
  // =========================================================================
  // 1. FREE HEALTH CAMPS STATE
  // =========================================================================
  const [camps, setCamps] = useState([]);
  const [campsLoading, setCampsLoading] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [registerCampModalOpen, setRegisterCampModalOpen] = useState(false);
  const [campRegisterForm, setCampRegisterForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    age: '',
    gender: 'Male'
  });
  const [submittingCampRegister, setSubmittingCampRegister] = useState(false);
  const [campToDelete, setCampToDelete] = useState(null);
  const [deletingCampId, setDeletingCampId] = useState(null);

  // New Camp Form (Leader)
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

  // =========================================================================
  // 2. BLOOD BANK STATE
  // =========================================================================
  const [donors, setDonors] = useState([]);
  const [donorsLoading, setDonorsLoading] = useState(false);
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [donorLocationFilter, setDonorLocationFilter] = useState('all');
  const [bloodSearch, setBloodSearch] = useState('');
  const [donorModalOpen, setDonorModalOpen] = useState(false);
  const [donorForm, setDonorForm] = useState({
    name: user?.name || '',
    age: '',
    gender: 'Male',
    bloodGroup: 'A+',
    phone: user?.phone || '',
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

  // =========================================================================
  // 3. EMERGENCY HOSPITAL CELL STATE
  // =========================================================================
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [myEmergencyRequests, setMyEmergencyRequests] = useState([]);
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    patientName: '',
    hospital: 'ঝালকাঠি সদর হাসপাতাল',
    ward: '',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    emergencyType: 'admission',
    urgency: 'high',
    description: ''
  });
  const [submittingEmergency, setSubmittingEmergency] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [emergencyResponseText, setEmergencyResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [isEmergencyVolunteer, setIsEmergencyVolunteer] = useState(false);
  const [emergencyFilter, setEmergencyFilter] = useState('all');

  // =========================================================================
  // 4. LEADER PANEL & VOLUNTEER TASKS STATE
  // =========================================================================
  const [healthLeaderTab, setHealthLeaderTab] = useState('manage_camps'); // 'manage_camps' | 'tasks' | 'emergency_team' | 'add_donor'
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

  // =========================================================================
  // DATA LOADERS
  // =========================================================================
  const loadCampsAndDonors = async () => {
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
      console.error('Error loading camps and donors:', err);
    } finally {
      setCampsLoading(false);
      setDonorsLoading(false);
    }
  };

  const loadEmergencyRequests = async () => {
    setEmergencyLoading(true);
    try {
      // 1. My emergency requests
      const myReqs = await api.getMyEmergencyRequests({ phone: user?.phone }).catch(() => []);
      setMyEmergencyRequests(Array.isArray(myReqs) ? myReqs : []);

      // 2. All emergency requests (Only succeeds if Admin, Leader, or in Emergency Team)
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
      console.error('Error loading emergency cell data:', err);
    } finally {
      setEmergencyLoading(false);
    }
  };

  const loadLeaderData = async () => {
    if (!isLeaderOrAdmin) return;
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
      console.error('Error loading leader panel data:', err);
    } finally {
      setTasksLoading(false);
      setTeamLoading(false);
    }
  };

  useEffect(() => {
    loadCampsAndDonors();
    loadEmergencyRequests();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'leader_panel' && isLeaderOrAdmin) {
      loadLeaderData();
    }
    if (activeTab === 'emergency_cell') {
      loadEmergencyRequests();
    }
  }, [activeTab, isLeaderOrAdmin]);

  // Sync user info into forms
  useEffect(() => {
    if (user) {
      setCampRegisterForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || ''
      }));
      setDonorForm(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || ''
      }));
      setEmergencyForm(prev => ({
        ...prev,
        contactName: prev.contactName || user.name || '',
        contactPhone: prev.contactPhone || user.phone || ''
      }));
    }
  }, [user]);

  // =========================================================================
  // HANDLERS
  // =========================================================================
  // 1. Camp Registration
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
      setCampRegisterForm({ name: user?.name || '', phone: user?.phone || '', age: '', gender: 'Male' });
      loadCampsAndDonors();
    } catch (err) {
      showFeedback('error', err.message || tx('রেজিস্ট্রেশন ব্যর্থ হয়েছে।', 'Registration failed.'));
    } finally {
      setSubmittingCampRegister(false);
    }
  };

  // 2. Create Health Camp
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
      loadCampsAndDonors();
      setActiveTab('camps');
    } catch (err) {
      showFeedback('error', err.message || tx('ক্যাম্প তৈরি করতে সমস্যা হয়েছে।', 'Failed to create camp.'));
    } finally {
      setSubmittingCamp(false);
    }
  };

  // Delete Health Camp
  const handleDeleteCamp = async (campId) => {
    setDeletingCampId(campId);
    try {
      await api.deleteHealthCamp(campId);
      showFeedback('success', tx('স্বাস্থ্য ক্যাম্পটি মুছে ফেলা হয়েছে।', 'Health camp deleted.'));
      setCampToDelete(null);
      loadCampsAndDonors();
    } catch (err) {
      showFeedback('error', err.message || tx('ডিলিট করতে ব্যর্থ হয়েছে।', 'Failed to delete camp.'));
    } finally {
      setDeletingCampId(null);
    }
  };

  // 3. Register Blood Donor
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
        name: user?.name || '',
        age: '',
        gender: 'Male',
        bloodGroup: 'A+',
        phone: user?.phone || '',
        alternatePhone: '',
        location: 'ঝালকাঠি সদর',
        district: 'ঝালকাঠি',
        lastDonationDate: '',
        donationCount: 0,
        notes: ''
      });
      loadCampsAndDonors();
    } catch (err) {
      showFeedback('error', err.message || tx('নিবন্ধন ব্যর্থ হয়েছে।', 'Registration failed.'));
    } finally {
      setSubmittingDonor(false);
    }
  };

  // Delete Blood Donor
  const handleDeleteDonor = async (donorId) => {
    setDeletingDonorId(donorId);
    try {
      await api.deleteBloodDonor(donorId);
      showFeedback('success', tx('রক্তদাতার তথ্য মুছে ফেলা হয়েছে।', 'Blood donor removed.'));
      setDonorToDelete(null);
      loadCampsAndDonors();
    } catch (err) {
      showFeedback('error', err.message || tx('ডিলিট করতে ব্যর্থ হয়েছে।', 'Failed to delete donor.'));
    } finally {
      setDeletingDonorId(null);
    }
  };

  // 4. Submit Emergency Hospital Request
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
        contactName: user?.name || '',
        contactPhone: user?.phone || '',
        emergencyType: 'admission',
        urgency: 'high',
        description: ''
      });
      loadEmergencyRequests();
    } catch (err) {
      showFeedback('error', err.message || tx('বার্তা পাঠাতে ব্যর্থ হয়েছে।', 'Failed to submit emergency request.'));
    } finally {
      setSubmittingEmergency(false);
    }
  };

  // 5. Update Emergency Request Status
  const handleUpdateEmergencyStatus = async (id, status, assignedVolunteer = null, message = '') => {
    try {
      await api.updateEmergencyRequestStatus(id, { status, assignedVolunteer, message });
      showFeedback('success', tx('ইমার্জেন্সি সেলের স্ট্যাটাস আপডেট হয়েছে।', 'Emergency status updated.'));
      loadEmergencyRequests();
      if (selectedEmergency && selectedEmergency._id === id) {
        const updatedReq = await api.getEmergencyRequest(id);
        setSelectedEmergency(updatedReq);
      }
    } catch (err) {
      showFeedback('error', err.message || tx('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।', 'Failed to update status.'));
    }
  };

  // 6. Post Emergency Response Message
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
      loadEmergencyRequests();
    } catch (err) {
      showFeedback('error', err.message || tx('মেসেজ পাঠাতে সমস্যা হয়েছে।', 'Failed to post message.'));
    } finally {
      setSubmittingResponse(false);
    }
  };

  // 7. Assign Task to Volunteer (Leader)
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
      loadLeaderData();
    } catch (err) {
      showFeedback('error', err.message || tx('দায়িত্ব অর্পণ ব্যর্থ হয়েছে।', 'Failed to assign task.'));
    } finally {
      setSubmittingTask(false);
    }
  };

  // 8. Update Task Status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.updateHealthTaskStatus(taskId, { status: newStatus });
      showFeedback('success', tx('কাজের অগ্রগতি আপডেট হয়েছে।', 'Task status updated.'));
      loadLeaderData();
    } catch (err) {
      showFeedback('error', err.message || tx('আপডেট ব্যর্থ হয়েছে।', 'Failed to update task.'));
    }
  };

  // 9. Add Volunteer to Emergency Cell Team (Auto Access)
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
      loadLeaderData();
    } catch (err) {
      showFeedback('error', err.message || tx('টিমে যুক্ত করতে সমস্যা হয়েছে।', 'Failed to add team member.'));
    } finally {
      setSubmittingTeamMember(false);
    }
  };

  // 10. Remove Volunteer from Emergency Cell Team
  const handleRemoveTeamMember = async (memberId) => {
    try {
      await api.removeEmergencyTeamMember(memberId);
      showFeedback('success', tx('ইমার্জেন্সি সেল টিম থেকে ভলান্টিয়ার প্রত্যাহার করা হয়েছে।', 'Volunteer removed from Emergency Cell team.'));
      loadLeaderData();
    } catch (err) {
      showFeedback('error', err.message || tx('প্রত্যাহার ব্যর্থ হয়েছে।', 'Failed to remove member.'));
    }
  };

  // Helper date format
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

  // Blood donor filtering
  const filteredDonors = donors.filter(d => {
    const q = bloodSearch.toLowerCase();
    const matchSearch =
      !q ||
      d.name?.toLowerCase().includes(q) ||
      d.phone?.includes(q) ||
      d.location?.toLowerCase().includes(q);
    const matchGroup = bloodGroupFilter === 'all' || d.bloodGroup === bloodGroupFilter;
    const matchLocation = donorLocationFilter === 'all' || (d.location || '').toLowerCase().includes(donorLocationFilter.toLowerCase());
    return matchSearch && matchGroup && matchLocation;
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <>
      {/* ========================================================================= */}
      {/* QUICK SERVICES BANNER (Shown in Overview tab for Health Wing)             */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <section className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
              {tx('WCC স্বাস্থ্য উইং সেবা ও কার্যক্রম', 'WCC Health Wing Services & Facilities')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {tx('নাগরিক স্বাস্থ্য সুরক্ষা ও তাৎক্ষণিক সহায়তা', 'Community Health Security & Urgent Assistance')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Blood Bank Card */}
            <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-xs hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Droplets className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {tx('রক্তদান কেন্দ্র ও ব্লাড ব্যাংক', 'Blood Bank & Donor Network')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {tx('জরুরি রক্তের প্রয়োজনে রক্তের গ্রুপ ও এলাকা অনুযায়ী যাচাইকৃত রক্তদাতাদের তালিকা এবং সরাসরি যোগাযোগ।', 'Find verified blood donors by blood group and area with direct phone & WhatsApp connectivity.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('blood_bank')}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{tx('রক্তদাতা খুঁজুন / রক্ত দিন', 'Search Donors / Register')}</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                  {donors.length}
                </span>
              </button>
            </div>

            {/* Emergency Hospital Cell Card */}
            <div className="bg-gradient-to-br from-rose-900 to-slate-950 text-white rounded-3xl p-6 border border-rose-800 shadow-lg hover:shadow-2xl transition-all space-y-4 flex flex-col justify-between relative overflow-hidden group">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Ambulance className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black tracking-wider uppercase animate-pulse">
                    ২৪/৭ জরুরি সেল
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">
                  {tx('হাসপাতাল ভর্তি ও জরুরি সেবা সেল', 'Hospital Admission Emergency Cell')}
                </h3>
                <p className="text-xs text-rose-200 leading-relaxed">
                  {tx('ঝালকাঠি সদর হাসপাতাল বা বরিশাল শের-ই-বাংলা মেডিকেলে ভর্তি বা জরুরি সংকটে বার্তা পাঠান। আমাদের ভলান্টিয়ার টিম পাশে থাকবে।', 'Emergency admission assistance at Jhalokathi Sadar Hospital & Barishal Sher-e-Bangla Medical.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('emergency_cell')}
                className="w-full py-2.5 px-4 rounded-xl bg-white text-rose-900 font-black text-xs hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 cursor-pointer relative z-10 shadow-md"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{tx('জরুরি বার্তা পাঠান', 'Open Emergency Cell')}</span>
              </button>
            </div>

            {/* Free Health Camps Card */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-xs hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {tx('ফ্রি বিশেষজ্ঞ স্বাস্থ্য ক্যাম্প', 'Free Specialist Medical Camps')}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {tx('অভিজ্ঞ ডাক্তারদের প্রেসক্রিপশন, ডায়াবেটিস টেস্ট ও বিনামূল্যে ওষুধ বিতরণের মাঠপর্যায়ের মেডিকেল ক্যাম্প।', 'Free doctor consultations, blood pressure & diabetes screening, and medicine distribution.')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('camps')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{tx('স্বাস্থ্য ক্যাম্প তালিকা', 'Explore Health Camps')}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                  {camps.length}
                </span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB: FREE HEALTH CAMPS                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'camps' && (
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
                {tx('WCC স্বাস্থ্য উদ্যোগ', 'WCC Health Initiative')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {tx('বিনামূল্যে বিশেষজ্ঞ মেডিকেল ও স্বাস্থ্য ক্যাম্পসমূহ', 'Free Medical & Health Screening Camps')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {tx('ঝালকাঠি ও তৎসংলগ্ন অঞ্চলের সুবিধাবঞ্চিত মানুষের স্বাস্থ্য সুরক্ষায় বিশেষজ্ঞ ডাক্তারদের পরামর্শ, প্রেসক্রিপশন ও ফ্রি ওষুধ বিতরণ।', 'Free doctor consultations, health screenings and medicine distribution for underprivileged community members.')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isLeaderOrAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('leader_panel');
                    setHealthLeaderTab('manage_camps');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{tx('নতুন স্বাস্থ্য ক্যাম্প যোগ করুন', 'Create Health Camp')}</span>
                </button>
              )}
            </div>
          </div>

          {campsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 bg-slate-100 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : camps.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                {tx('শীঘ্রই নতুন স্বাস্থ্য ক্যাম্প ঘোষণা করা হবে', 'New Health Camps Coming Soon')}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {tx('আমাদের স্বাস্থ্য উইং টিম ঝালকাঠি ও আশেপাশের এলাকায় পরবর্তী ফ্রি মেডিকেল ক্যাম্পের প্রস্তুতি নিচ্ছে।', 'Our health wing team is organizing the next medical screening and consultation drive.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {camps.map(camp => (
                <div
                  key={camp._id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-44 bg-slate-900 relative overflow-hidden">
                      <img
                        src={camp.coverImage || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800'}
                        alt={camp.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-black text-[10px] uppercase shadow-xs">
                          FREE
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur text-white font-bold text-[10px]">
                          {camp.district || 'ঝালকাঠি'}
                        </span>
                      </div>
                      {isLeaderOrAdmin && (
                        <button
                          type="button"
                          onClick={() => setCampToDelete(camp)}
                          className="absolute top-3 right-3 p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors cursor-pointer"
                          title={tx('ক্যাম্পটি ডিলিট করুন', 'Delete Camp')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="text-base font-black text-slate-900 line-clamp-1">{camp.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                          {camp.description || tx('বিনামূল্যে সাধারণ স্বাস্থ্য পরীক্ষা ও ওষুধ বিতরণ কর্মসূচি।', 'Free medical consultation and health checkup drive.')}
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{formatDate(camp.date)}</span>
                          <span className="text-slate-300">•</span>
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{camp.time || 'সকাল ৯:০০ - বিকাল ৪:০০'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{camp.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{tx('টার্গেট রোগী:', 'Target Beneficiaries:')} <strong>{camp.targetBeneficiaries}</strong></span>
                        </div>
                      </div>

                      {/* Specialist Doctors */}
                      {Array.isArray(camp.doctors) && camp.doctors.length > 0 && (
                        <div className="p-3 bg-slate-50 rounded-2xl space-y-1 border border-slate-100">
                          <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                            <Stethoscope className="w-3.5 h-3.5 text-rose-600" />
                            <span>{tx('উপস্থিত বিশেষজ্ঞ ডাক্তার:', 'Attending Specialists:')}</span>
                          </p>
                          <div className="space-y-1 pt-1">
                            {camp.doctors.slice(0, 2).map((doc, idx) => (
                              <p key={idx} className="text-xs text-slate-600 truncate">
                                <strong>{doc.name}</strong> ({doc.specialty})
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Free Services Tags */}
                      {Array.isArray(camp.services) && camp.services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {camp.services.slice(0, 3).map((srv, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                              ✓ {srv}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCamp(camp);
                        setRegisterCampModalOpen(true);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{tx('বিনামূল্যে সেবা নিতে নিবন্ধন করুন', 'Register for Free Camp')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB: BLOOD BANK (রক্তদান কেন্দ্র ও ডোনার ডিরেক্টরি)                       */}
      {/* ========================================================================= */}
      {activeTab === 'blood_bank' && (
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
                {tx('জীবন রক্ষাকারী উদ্যোগ', 'Life-Saving Network')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                <Droplets className="w-7 h-7 text-rose-600" />
                <span>{tx('WCC রক্তদান কেন্দ্র ও ডোনার ডিরেক্টরি', 'Blood Bank & Donor Network')}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {tx('ঝালকাঠি ও বরিশাল অঞ্চলের জরুরি রক্তের প্রয়োজনে তাৎক্ষণিক রক্তদাতার তথ্য ও সরাসরি যোগাযোগের মাধ্যম।', 'Instant access to verified blood donors in Jhalokathi & Barishal region.')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDonorModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{tx('রক্তদাতা হিসেবে নিবন্ধন করুন', 'Register as Blood Donor')}</span>
            </button>
          </div>

          {/* Blood Group Filter Chips & Search Bar */}
          <div className="space-y-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setBloodGroupFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  bloodGroupFilter === 'all'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tx('সকল গ্রুপ', 'All Groups')}
              </button>
              {bloodGroups.map(grp => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setBloodGroupFilter(grp)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    bloodGroupFilter === grp
                      ? 'bg-rose-600 text-white shadow-xs scale-105'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  {grp}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={tx('নাম, মোবাইল নম্বর বা এলাকা দিয়ে খুঁজুন...', 'Search by donor name, phone or area...')}
                  value={bloodSearch}
                  onChange={e => setBloodSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600"
                />
              </div>

              <select
                value={donorLocationFilter}
                onChange={e => setDonorLocationFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-600"
              >
                <option value="all">{tx('সকল এলাকা (ঝালকাঠি ও বরিশাল)', 'All Locations')}</option>
                <option value="ঝালকাঠি সদর">{tx('ঝালকাঠি সদর', 'Jhalokathi Sadar')}</option>
                <option value="নলছিটি">{tx('নলছিটি', 'Nalchity')}</option>
                <option value="রাজাপুর">{tx('রাজাপুর', 'Rajapur')}</option>
                <option value="কাঁঠালিয়া">{tx('কাঁঠালিয়া', 'Kathalia')}</option>
                <option value="বরিশাল সদর">{tx('বরিশাল সদর', 'Barishal Sadar')}</option>
              </select>
            </div>
          </div>

          {/* Donors Grid */}
          {donorsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-44 bg-slate-100 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : filteredDonors.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Droplets className="w-12 h-12 text-rose-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                {tx('কোনো রক্তদাতার তথ্য মেলেনি', 'No Donors Found')}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {tx('নির্বাচিত রক্তের গ্রুপ বা এলাকায় এখনও কোনো ডোনার নিবন্ধিত নেই। আপনি নিজে রক্তদাতা হিসেবে নাম লেখাতে পারেন।', 'No donors matched this filter. Be the first to register as a donor!')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonors.map(donor => (
                <div
                  key={donor._id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-slate-900">{donor.name}</h4>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          ({donor.age} {tx('বছর', 'yrs')}, {donor.gender === 'Female' ? tx('নারী', 'F') : tx('পুরুষ', 'M')})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{donor.location || 'ঝালকাঠি সদর'}, {donor.district || 'ঝালকাঠি'}</span>
                      </p>
                      {donor.lastDonationDate && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                          <Clock className="w-3 h-3 text-slate-300 shrink-0" />
                          <span>{tx('সর্বশেষ রক্তদান:', 'Last Donated:')} {formatDate(donor.lastDonationDate)}</span>
                        </p>
                      )}
                    </div>

                    <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex flex-col items-center justify-center font-black shadow-md shrink-0">
                      <span className="text-base leading-none">{donor.bloodGroup}</span>
                      <span className="text-[8px] uppercase tracking-wider text-rose-200 mt-0.5">Blood</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${donor.phone}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{tx('কল দিন', 'Call Now')}</span>
                    </a>

                    <a
                      href={`https://wa.me/88${donor.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      title="WhatsApp Message"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    {isLeaderOrAdmin && (
                      <button
                        type="button"
                        onClick={() => setDonorToDelete(donor)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title={tx('মুছে ফেলুন', 'Delete Donor')}
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
      {/* TAB: HOSPITAL EMERGENCY CELL (ঝালকাঠি ও বরিশাল সদর হাসপাতাল ভর্তি সহায়তা)  */}
      {/* ========================================================================= */}
      {activeTab === 'emergency_cell' && (
        <section className="space-y-8">
          {/* Emergency Hero Banner */}
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 border border-rose-800/60 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-600 text-white text-xs font-black tracking-wide uppercase shadow-md">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>{tx('২৪/৭ জরুরি হাসপাতাল সেল', '24/7 Hospital Emergency Assistance')}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-rose-300">
                <Building2 className="w-4 h-4 text-rose-400" />
                <span>{tx('ঝালকাঠি সদর হাসপাতাল • বরিশাল শের-ই-বাংলা মেডিকেল', 'Jhalokathi Sadar & Barishal Sher-e-Bangla Medical')}</span>
              </div>
            </div>

            <div className="space-y-2 max-w-3xl">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {tx('হাসপাতালে জরুরি রোগী ভর্তি, বেড, রক্ত ও চিকিৎসা সহায়তা', 'Urgent Hospital Admission, Beds, Blood & Medical Aid')}
              </h2>
              <p className="text-xs sm:text-sm text-rose-200 leading-relaxed">
                {tx('যে কোনো সদস্য বা নাগরিক ঝালকাঠি সদর হাসপাতাল বা বরিশাল শের-ই-বাংলা মেডিকেল কলেজ ও সদর হাসপাতালে রোগী ভর্তির ক্ষেত্রে আমাদের সেলে মেসেজ দিলে আমাদের উইং লিডার ও জরুরি ভলান্টিয়ার টিম তাৎক্ষণিক যোগাযোগ করে হাসপাতালে উপস্থিত থাকবে।', 'Submit an emergency alert for hospital admission, blood, oxygen or physician support. Our dedicated wing lead and volunteers will immediately intervene on site.')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setEmergencyModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer scale-100 hover:scale-105"
              >
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span>{tx('🚨 জরুরি সহায়তার বার্তা পাঠান', 'Send Emergency Help Request')}</span>
              </button>

              <div className="text-xs text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{tx('গড় সাড়া দেওয়ার সময়: ১০-১৫ মিনিট', 'Avg. Response Time: 10-15 Minutes')}</span>
              </div>
            </div>
          </div>

          {/* My Emergency Requests (Visible to user) */}
          {myEmergencyRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>{tx('আমার পাঠানো জরুরি বার্তাসমূহ', 'My Emergency Requests')} ({myEmergencyRequests.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myEmergencyRequests.map(req => (
                  <div
                    key={req._id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                          {req.urgency === 'critical' ? tx('অতি জরুরি', 'Critical') : tx('জরুরি', 'Urgent')}
                        </span>
                        <h4 className="text-base font-black text-slate-900 mt-1">{req.patientName}</h4>
                        <p className="text-xs text-slate-500">{req.hospital} • {req.ward || 'সাধারণ বিভাগ'}</p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                        req.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.status === 'resolved' ? tx('সমাধান হয়েছে', 'Resolved') : req.status === 'in_progress' ? tx('টিম কাজ করছে', 'In Progress') : tx('অপেক্ষমাণ', 'Pending')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl leading-relaxed">
                      {req.description}
                    </p>

                    {Array.isArray(req.responses) && req.responses.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{tx('রেসপন্ডারের বার্তা:', 'Volunteer Update:')}</span>
                        </p>
                        <p className="text-xs text-slate-600 bg-emerald-50/50 p-2.5 rounded-xl">
                          &quot;{req.responses[req.responses.length - 1].message}&quot;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Access-Controlled Section for Emergency Cell Team & Leaders */}
          {isLeaderOrAdmin || isEmergencyVolunteer ? (
            <div className="space-y-6 pt-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                      {tx('ইমার্জেন্সি সেল অনুমোদিত রেসপন্ডার প্যানেল', 'Authorized Emergency Cell Responder Feed')}
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      {tx('উইং লিডার বা এডমিন দ্বারা এই সেলে দায়িত্বপ্রাপ্ত হওয়ায় আপনি সকল রোগীর জরুরি বার্তা দেখতে ও সহায়তা প্রদান করতে পারছেন।', 'As an authorized emergency responder, you can view incoming alerts and provide assistance.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEmergencyFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      emergencyFilter === 'all' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white text-emerald-800'
                    }`}
                  >
                    {tx('সকল', 'All')} ({emergencyRequests.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmergencyFilter('pending')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      emergencyFilter === 'pending' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-rose-700'
                    }`}
                  >
                    {tx('নতুন', 'Pending')} ({emergencyRequests.filter(r => r.status === 'pending').length})
                  </button>
                </div>
              </div>

              {emergencyLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
                  {tx('জরুরি বার্তা লোড হচ্ছে...', 'Loading emergency requests...')}
                </div>
              ) : emergencyRequests.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
                  {tx('বর্তমানে কোনো অপেক্ষমাণ জরুরি বার্তা নেই।', 'No active emergency requests.')}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emergencyRequests
                    .filter(r => emergencyFilter === 'all' || r.status === emergencyFilter)
                    .map(req => (
                      <div
                        key={req._id}
                        className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                              {req.urgency === 'critical' ? '🔴 অতি জরুরি' : '🟠 জরুরি'}
                            </span>
                            <h4 className="text-base font-black text-slate-900 mt-1">{req.patientName}</h4>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{req.hospital} • {req.ward || 'সাধারণ ওয়ার্ড'}</span>
                            </p>
                          </div>

                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                            req.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-slate-100 text-slate-700'
                          }`}>
                            {req.status === 'resolved' ? '✓ সমাধান হয়েছে' : req.status === 'in_progress' ? '⏳ প্রসেসিং' : '⚠️ নতুন আবেদন'}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1.5 text-xs text-slate-700">
                          <p className="font-semibold text-slate-900">
                            {tx('যোগাযোগের ব্যক্তি:', 'Contact Person:')} {req.contactName} ({req.contactPhone})
                          </p>
                          <p className="text-slate-600 leading-relaxed">{req.description}</p>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center gap-2 justify-between">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${req.contactPhone}`}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>{tx('কল করুন', 'Call')}</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEmergency(req);
                                setEmergencyResponseText('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{tx('মেসেজ / রেসপন্স', 'Respond')} ({req.responses?.length || 0})</span>
                            </button>
                          </div>

                          {req.status !== 'resolved' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateEmergencyStatus(req._id, 'resolved', null, 'WCC টিম দ্বারা হাসপাতালে রোগীর সহায়তা সম্পন্ন হয়েছে।')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>{tx('সম্পন্ন চিহ্নিত করুন', 'Mark Resolved')}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-bold">✓ সহায়তা সম্পন্ন</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-2 max-w-xl mx-auto">
              <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700">
                {tx('ইমার্জেন্সি সেল গোপনীয়তা ও সুরক্ষা', 'Emergency Cell Privacy & Protocol')}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {tx('রোগীদের ব্যক্তিগত গোপনীয়তা রক্ষা ও জরুরি স্বাস্থ্য শৃঙ্খলা বজায় রাখতে আবেদনসমূহ শুধুমাত্র এডমিন, উইং লিডার ও নির্ধারিত ইমার্জেন্সি ভলান্টিয়ারদের দ্বারা পরিচালিত হয়। আপনার বা আপনার পরিবারের যে কোনো প্রয়োজনে উপরের বাটনে চাপ দিয়ে বার্তা পাঠাতে পারেন।', 'Incoming alerts are strictly visible to admins, health lead and designated hospital volunteers to protect patient privacy.')}
              </p>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB: HEALTH WING LEADER & VOLUNTEER PANEL                                 */}
      {/* ========================================================================= */}
      {activeTab === 'leader_panel' && isLeaderOrAdmin && (
        <section className="space-y-8 bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-md">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-black">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{tx('স্বাস্থ্য উইং লিডার কন্ট্রোল প্যানেল', 'Health Wing Leader Panel')}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 mt-2">
                {tx('স্বাস্থ্য ক্যাম্প, ভলান্টিয়ার টিম ও সেবা ব্যবস্থাপনা', 'Camps, Volunteers & Operations Management')}
              </h2>
              <p className="text-xs text-slate-500">
                {tx('উইং লিডার হিসেবে আপনি সম্পূর্ণ নিয়ন্ত্রণ করতে পারেন—ক্যাম্প আয়োজন, ভলান্টিয়ারদের কাজ বণ্টন ও ইমার্জেন্সি সেল পরিচালনা।', 'Full control over health camps, task assignments, and emergency cell team permissions.')}
              </p>
            </div>

            {/* Leader Sub-Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl overflow-x-auto scrollbar-none">
              <button
                type="button"
                onClick={() => setHealthLeaderTab('manage_camps')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  healthLeaderTab === 'manage_camps' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                {tx('ক্যাম্প তৈরি', 'Create Camp')}
              </button>

              <button
                type="button"
                onClick={() => setHealthLeaderTab('tasks')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  healthLeaderTab === 'tasks' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                {tx('ভলান্টিয়ার কাজ অর্পণ', 'Volunteer Tasks')} ({healthTasks.length})
              </button>

              <button
                type="button"
                onClick={() => setHealthLeaderTab('emergency_team')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  healthLeaderTab === 'emergency_team' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                {tx('ইমার্জেন্সি টিম (Auto Access)', 'Emergency Team')} ({emergencyTeam.length})
              </button>

              <button
                type="button"
                onClick={() => setHealthLeaderTab('add_donor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  healthLeaderTab === 'add_donor' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                {tx('ডোনার যুক্ত করুন', 'Add Donor')}
              </button>
            </div>
          </div>

          {/* Sub-Tab 1: Create Health Camp */}
          {healthLeaderTab === 'manage_camps' && (
            <form onSubmit={handleCreateCampSubmit} className="space-y-4 max-w-2xl bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" />
                <span>{tx('নতুন ফ্রি স্বাস্থ্য ক্যাম্প তৈরি করুন', 'Launch New Free Health Camp')}</span>
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('ক্যাম্পের নাম *', 'Camp Title *')}</label>
                <input
                  type="text"
                  required
                  placeholder={tx('যেমন: WCC ফ্রি মেডিকেল ও ডায়াবেটিস ক্যাম্প – ঝালকাঠি', 'e.g. WCC Free Health Camp – Jhalokathi')}
                  value={newCampForm.title}
                  onChange={e => setNewCampForm({ ...newCampForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('তারিখ *', 'Date *')}</label>
                  <input
                    type="date"
                    required
                    value={newCampForm.date}
                    onChange={e => setNewCampForm({ ...newCampForm, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('সময়সীমা', 'Time')}</label>
                  <input
                    type="text"
                    placeholder="সকাল ৯:০০ - বিকাল ৪:০০"
                    value={newCampForm.time}
                    onChange={e => setNewCampForm({ ...newCampForm, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('স্থান *', 'Location *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="ঝালকাঠি সদর হাসপাতাল সড়ক / পৌরসভা চত্বর"
                    value={newCampForm.location}
                    onChange={e => setNewCampForm({ ...newCampForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('টার্গেট রোগী', 'Target Beneficiaries')}</label>
                  <input
                    type="text"
                    placeholder="৫০০+ মানুষ"
                    value={newCampForm.targetBeneficiaries}
                    onChange={e => setNewCampForm({ ...newCampForm, targetBeneficiaries: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('বিস্তারিত বিবরণ', 'Description')}</label>
                <textarea
                  rows={2}
                  placeholder={tx('ক্যাম্পের কার্যক্রম, সুযোগ-সুবিধা ও সেবা সম্পর্কে বিস্তারিত...', 'Camp activities and details...')}
                  value={newCampForm.description}
                  onChange={e => setNewCampForm({ ...newCampForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('উপস্থিত ডাক্তার (নাম ও ডিগ্রি)', 'Doctor Name & Degree')}</label>
                <input
                  type="text"
                  placeholder="ডা. মোস্তাফিজুর রহমান (MBBS, মেডিসিন বিশেষজ্ঞ)"
                  value={newCampForm.doctors[0]?.name || ''}
                  onChange={e => {
                    const docs = [...newCampForm.doctors];
                    docs[0] = { ...docs[0], name: e.target.value, specialty: 'মেডিসিন বিশেষজ্ঞ' };
                    setNewCampForm({ ...newCampForm, doctors: docs });
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingCamp}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {submittingCamp ? tx('ক্যাম্প তৈরি হচ্ছে...', 'Creating...') : tx('স্বাস্থ্য ক্যাম্প পাবলিশ করুন', 'Publish Health Camp')}
              </button>
            </form>
          )}

          {/* Sub-Tab 2: Volunteer Tasks Management */}
          {healthLeaderTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {tx('ভলান্টিয়ারদের দায়িত্ব ও কর্মপরিকল্পনা', 'Volunteer Task Assignments')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {tx('স্বাস্থ্য ক্যাম্প ও জরুরি সেবার বিভিন্ন দায়িত্ব ভলান্টিয়ারদের অর্পণ করুন।', 'Assign operational tasks to registered wing volunteers.')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAssignTaskModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{tx('নতুন দায়িত্ব দিন', 'Assign New Task')}</span>
                </button>
              </div>

              {tasksLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
                  {tx('কাজের তালিকা লোড হচ্ছে...', 'Loading tasks...')}
                </div>
              ) : healthTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  {tx('বর্তমানে কোনো দায়িত্ব অর্পণ করা নেই।', 'No volunteer tasks assigned yet.')}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {healthTasks.map(task => (
                    <div
                      key={task._id}
                      className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            task.priority === 'urgent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {task.priority === 'urgent' ? 'জরুরি' : 'সাধারণ'}
                          </span>
                          <h4 className="text-base font-black text-slate-900 mt-1">{task.title}</h4>
                          <p className="text-xs text-slate-600">{task.description}</p>
                        </div>

                        <select
                          value={task.status}
                          onChange={e => handleUpdateTaskStatus(task._id, e.target.value)}
                          className="px-2.5 py-1 text-xs rounded-xl border border-slate-300 bg-white font-bold text-slate-700"
                        >
                          <option value="pending">{tx('অপেক্ষমাণ', 'Pending')}</option>
                          <option value="in_progress">{tx('চলমান', 'In Progress')}</option>
                          <option value="completed">{tx('সম্পন্ন', 'Completed')}</option>
                        </select>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                        <span>{tx('দায়িত্বপ্রাপ্ত:', 'Assigned:')} <strong>{task.assignedTo?.name}</strong> ({task.assignedTo?.phone})</span>
                        {task.dueDate && <span>{tx('মেয়াদ:', 'Due:')} {formatDate(task.dueDate)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 3: Emergency Cell Team Management (Auto Access) */}
          {healthLeaderTab === 'emergency_team' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{tx('ইমার্জেন্সি সেল অ্যাক্সেস রুল (স্বয়ংক্রিয় এক্সেস)', 'Emergency Cell Auto-Access Rule')}</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {tx('সাধারণ কোনো ভলান্টিয়ার রোগীর গোপনীয় মেসেজ বা রিকোয়েস্ট দেখতে পারবে না। উইং লিডার বা এডমিন হিসেবে আপনি নিচে যেসকল ভলান্টিয়ারকে যুক্ত করবেন, তারা স্বয়ংক্রিয়ভাবে (Auto Access) ঝালকাঠি ও বরিশাল হাসপাতালের জরুরি সেল দেখতে পাবে এবং রোগীদের তাৎক্ষণিক সাহায্য করতে পারবে।', 'Volunteers do not see hospital admission alerts by default. Adding a volunteer here grants them immediate access to handle emergency requests.')}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {tx('অনুমোদিত ইমার্জেন্সি সেল ভলান্টিয়ার তালিকা', 'Active Emergency Cell Team')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {tx('হাসপাতালে সরাসরি উপস্থিত থাকার জন্য দায়িত্বপ্রাপ্ত সদস্যদের তালিকা।', 'Volunteers deployed for on-site hospital support.')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAddTeamMemberModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{tx('নতুন ভলান্টিয়ার যুক্ত করুন', 'Add Volunteer')}</span>
                </button>
              </div>

              {teamLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
                  {tx('টিম মেম্বার লোড হচ্ছে...', 'Loading team members...')}
                </div>
              ) : emergencyTeam.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  {tx('বর্তমানে কোনো ভলান্টিয়ারকে ইমার্জেন্সি সেলে যুক্ত করা হয়নি।', 'No emergency volunteers assigned yet.')}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emergencyTeam.map(member => (
                    <div
                      key={member._id}
                      className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{member.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            ✓ Auto Access
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <PhoneCall className="w-3 h-3 text-slate-400" />
                          <span>{member.phone}</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {tx('দায়িত্ব:', 'Role:')} {member.roleTitle || 'ইমার্জেন্সি সেল ভলান্টিয়ার'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTeamMember(member._id)}
                        className="p-2 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                        title={tx('টিম থেকে বাদ দিন', 'Remove Member')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 4: Direct Add Donor */}
          {healthLeaderTab === 'add_donor' && (
            <div className="max-w-xl bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                {tx('ব্লাড ব্যাংকে নতুন রক্তদাতার তথ্য যুক্ত করুন', 'Add New Blood Donor')}
              </h3>

              <form onSubmit={handleRegisterDonorSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('রক্তদাতার নাম *', 'Donor Name *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="নাম"
                    value={donorForm.name}
                    onChange={e => setDonorForm({ ...donorForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{tx('রক্তের গ্রুপ *', 'Blood Group *')}</label>
                    <select
                      value={donorForm.bloodGroup}
                      onChange={e => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-bold text-rose-600"
                    >
                      {bloodGroups.map(grp => (
                        <option key={grp} value={grp}>{grp}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{tx('বয়স (১৮-৬৫) *', 'Age (18-65) *')}</label>
                    <input
                      type="number"
                      required
                      min={18}
                      max={65}
                      value={donorForm.age}
                      onChange={e => setDonorForm({ ...donorForm, age: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{tx('মোবাইল নম্বর *', 'Phone Number *')}</label>
                    <input
                      type="tel"
                      required
                      placeholder="017xxxxxxxx"
                      value={donorForm.phone}
                      onChange={e => setDonorForm({ ...donorForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">{tx('এলাকা *', 'Location *')}</label>
                    <input
                      type="text"
                      required
                      placeholder="ঝালকাঠি সদর"
                      value={donorForm.location}
                      onChange={e => setDonorForm({ ...donorForm, location: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingDonor}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {submittingDonor ? tx('যুক্ত হচ্ছে...', 'Saving...') : tx('রক্তদাতা যোগ করুন', 'Save Blood Donor')}
                </button>
              </form>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CAMP REGISTRATION                                                  */}
      {/* ========================================================================= */}
      {registerCampModalOpen && selectedCamp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              onClick={() => setRegisterCampModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 uppercase">
                {tx('ফ্রি স্বাস্থ্য সেবা নিবন্ধন', 'Free Medical Registration')}
              </span>
              <h3 className="text-lg font-black text-slate-900">{selectedCamp.title}</h3>
              <p className="text-xs text-slate-500">
                {formatDate(selectedCamp.date)} • {selectedCamp.location}
              </p>
            </div>

            <form onSubmit={handleCampRegisterSubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('রোগীর নাম *', 'Patient Name *')}</label>
                <input
                  type="text"
                  required
                  placeholder="রোগীর পুরো নাম"
                  value={campRegisterForm.name}
                  onChange={e => setCampRegisterForm({ ...campRegisterForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('মোবাইল নম্বর *', 'Phone Number *')}</label>
                  <input
                    type="tel"
                    required
                    placeholder="017xxxxxxxx"
                    value={campRegisterForm.phone}
                    onChange={e => setCampRegisterForm({ ...campRegisterForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('বয়স', 'Age')}</label>
                  <input
                    type="number"
                    placeholder="যেমন: ৩২"
                    value={campRegisterForm.age}
                    onChange={e => setCampRegisterForm({ ...campRegisterForm, age: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRegisterCampModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {tx('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingCampRegister}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  {submittingCampRegister ? tx('নিবন্ধন হচ্ছে...', 'Registering...') : tx('নিশ্চিত করুন', 'Confirm Registration')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTER AS BLOOD DONOR                                            */}
      {/* ========================================================================= */}
      {donorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setDonorModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-rose-600 uppercase">
                {tx('জীবন বাঁচান, রক্ত দিন', 'Donate Blood, Save Lives')}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {tx('WCC ব্লাড ব্যাংকে রক্তদাতা নিবন্ধন', 'Blood Donor Registration')}
              </h3>
              <p className="text-xs text-slate-500">
                {tx('আপনার দেওয়া রক্ত ঝালকাঠি ও বরিশালের জরুরি সংকটে মানুষের জীবন বাঁচাতে সরাসরি সাহায্য করবে।', 'Your voluntary blood donation will directly save lives across Jhalokathi & Barishal.')}
              </p>
            </div>

            <form onSubmit={handleRegisterDonorSubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('আপনার নাম *', 'Your Name *')}</label>
                <input
                  type="text"
                  required
                  placeholder="পুরো নাম"
                  value={donorForm.name}
                  onChange={e => setDonorForm({ ...donorForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('রক্তের গ্রুপ *', 'Blood Group *')}</label>
                  <select
                    value={donorForm.bloodGroup}
                    onChange={e => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600 font-black text-rose-600"
                  >
                    {bloodGroups.map(grp => (
                      <option key={grp} value={grp}>{grp}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('বয়স (১৮-৬৫) *', 'Age (18-65) *')}</label>
                  <input
                    type="number"
                    required
                    min={18}
                    max={65}
                    placeholder="যেমন: ২৫"
                    value={donorForm.age}
                    onChange={e => setDonorForm({ ...donorForm, age: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('মোবাইল নম্বর *', 'Phone Number *')}</label>
                  <input
                    type="tel"
                    required
                    placeholder="017xxxxxxxx"
                    value={donorForm.phone}
                    onChange={e => setDonorForm({ ...donorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('এলাকা *', 'Area / Upazila *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="ঝালকাঠি সদর / নলছিটি / বরিশাল"
                    value={donorForm.location}
                    onChange={e => setDonorForm({ ...donorForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('সর্বশেষ রক্তদানের তারিখ (যদি থাকে)', 'Last Donation Date')}</label>
                <input
                  type="date"
                  value={donorForm.lastDonationDate}
                  onChange={e => setDonorForm({ ...donorForm, lastDonationDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDonorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {tx('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingDonor}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  {submittingDonor ? tx('নিবন্ধন হচ্ছে...', 'Registering...') : tx('রক্তদাতা হিসেবে নিবন্ধন সম্পন্ন করুন', 'Complete Registration')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SUBMIT EMERGENCY HOSPITAL HELP REQUEST                             */}
      {/* ========================================================================= */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEmergencyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-rose-600 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                <span>{tx('হাসপাতাল ভর্তি ও জরুরি সহায়তা সেল', 'Emergency Cell Hospital Aid')}</span>
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {tx('জরুরি চিকিৎসা ও ভর্তি সহায়তার বার্তা পাঠান', 'Submit Emergency Hospital Request')}
              </h3>
              <p className="text-xs text-slate-500">
                {tx('বার্তা পাঠানোর পর আমাদের উইং লিডার ও জরুরি ভলান্টিয়ার টিম তাৎক্ষণিক রোগীর লোকজনের সাথে ফোনে যোগাযোগ করবে এবং হাসপাতালে সরাসরি সাহায্য করবে।', 'Our leader and hospital volunteer team will immediately call you and arrive on-site.')}
              </p>
            </div>

            <form onSubmit={handleSubmitEmergencyRequest} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('রোগীর নাম *', 'Patient Name *')}</label>
                <input
                  type="text"
                  required
                  placeholder="রোগীর পুরো নাম"
                  value={emergencyForm.patientName}
                  onChange={e => setEmergencyForm({ ...emergencyForm, patientName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('হাসপাতাল নির্বাচন করুন *', 'Select Hospital *')}</label>
                <select
                  value={emergencyForm.hospital}
                  onChange={e => setEmergencyForm({ ...emergencyForm, hospital: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600 font-bold"
                >
                  <option value="ঝালকাঠি সদর হাসপাতাল">{tx('ঝালকাঠি সদর হাসপাতাল', 'Jhalokathi Sadar Hospital')}</option>
                  <option value="বরিশাল শের-ই-বাংলা মেডিকেল কলেজ ও সদর হাসপাতাল">{tx('বরিশাল শের-ই-বাংলা মেডিকেল কলেজ ও সদর হাসপাতাল', 'Barishal Sher-e-Bangla Medical & Sadar Hospital')}</option>
                  <option value="অন্যান্য হাসপাতাল">{tx('অন্যান্য হাসপাতাল', 'Other Hospital')}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('ওয়ার্ড / কেবিন (যদি থাকে)', 'Ward / Cabin / Dept')}</label>
                  <input
                    type="text"
                    placeholder="জরুরি বিভাগ / মেডিসিন ওয়ার্ড"
                    value={emergencyForm.ward}
                    onChange={e => setEmergencyForm({ ...emergencyForm, ward: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('জরুরিতার মাত্রা *', 'Urgency Level *')}</label>
                  <select
                    value={emergencyForm.urgency}
                    onChange={e => setEmergencyForm({ ...emergencyForm, urgency: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600 font-bold text-rose-600"
                  >
                    <option value="critical">{tx('🔴 অতি জরুরি (তাৎক্ষণিক সহায়তা প্রয়োজন)', 'Critical')}</option>
                    <option value="high">{tx('🟠 জরুরি (১-২ ঘন্টার মধ্যে)', 'High')}</option>
                    <option value="moderate">{tx('🟡 সাধারণ ভর্তি সহায়তা', 'Moderate')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('যোগাযোগের ব্যক্তি *', 'Contact Person *')}</label>
                  <input
                    type="text"
                    required
                    placeholder="আপনার নাম"
                    value={emergencyForm.contactName}
                    onChange={e => setEmergencyForm({ ...emergencyForm, contactName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('মোবাইল নম্বর *', 'Mobile Number *')}</label>
                  <input
                    type="tel"
                    required
                    placeholder="017xxxxxxxx"
                    value={emergencyForm.contactPhone}
                    onChange={e => setEmergencyForm({ ...emergencyForm, contactPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('সমস্যা ও কী ধরণের সহায়তা প্রয়োজন *', 'Detailed Emergency Description *')}</label>
                <textarea
                  required
                  rows={3}
                  placeholder={tx('রোগীর বর্তমান অবস্থা, কী সেবা প্রয়োজন (ভর্তি, রক্ত, অক্সিজেন, ডাক্তার বা অন্য কোনো সংকট)...', 'Describe patient condition, bed/blood/oxygen requirements...')}
                  value={emergencyForm.description}
                  onChange={e => setEmergencyForm({ ...emergencyForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEmergencyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {tx('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingEmergency}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingEmergency ? tx('বার্তা পাঠানো হচ্ছে...', 'Sending...') : tx('জরুরি বার্তা পাঠান', 'Send Emergency Alert')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW EMERGENCY REQUEST & RESPONSE THREAD                           */}
      {/* ========================================================================= */}
      {selectedEmergency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedEmergency(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {selectedEmergency.urgency === 'critical' ? '🔴 অতি জরুরি' : '🟠 জরুরি'}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">{selectedEmergency.patientName}</h3>
              <p className="text-xs text-slate-500">{selectedEmergency.hospital} • {selectedEmergency.ward || 'সাধারণ বিভাগ'}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs">
              <p className="text-slate-700"><strong>{tx('যোগাযোগ:', 'Contact:')}</strong> {selectedEmergency.contactName} ({selectedEmergency.contactPhone})</p>
              <p className="text-slate-600 leading-relaxed"><strong>{tx('সমস্যা:', 'Issue:')}</strong> {selectedEmergency.description}</p>
            </div>

            {/* Conversation Responses */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-rose-600" />
                <span>{tx('টিম রেসপন্স ও আপডেট থ্রেড', 'Response & Updates Thread')}</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {Array.isArray(selectedEmergency.responses) && selectedEmergency.responses.length > 0 ? (
                  selectedEmergency.responses.map((resp, idx) => (
                    <div key={idx} className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-2xl space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                        <span>{resp.responderName} ({resp.responderRole})</span>
                        <span className="text-[10px] text-slate-400">{formatDate(resp.createdAt)}</span>
                      </div>
                      <p className="text-slate-700">{resp.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">{tx('এখনও কোনো বার্তা যোগ করা হয়নি।', 'No updates posted yet.')}</p>
                )}
              </div>
            </div>

            {/* Response Input */}
            <form onSubmit={handleSendEmergencyResponse} className="space-y-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder={tx('রেসপন্স বা অগ্রগতি বার্তা লিখুন...', 'Write response or update note...')}
                value={emergencyResponseText}
                onChange={e => setEmergencyResponseText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-rose-600"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="submit"
                  disabled={submittingResponse}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3 h-3" />
                  <span>{submittingResponse ? tx('পাঠানো হচ্ছে...', 'Posting...') : tx('বার্তা যোগ করুন', 'Post Response')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ASSIGN TASK TO VOLUNTEER (LEADER)                                  */}
      {/* ========================================================================= */}
      {assignTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setAssignTaskModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-purple-600 uppercase">
                {tx('ভলান্টিয়ার কর্মবণ্টন', 'Volunteer Task Delegation')}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {tx('ভলান্টিয়ারকে নতুন দায়িত্ব দিন', 'Assign Task to Volunteer')}
              </h3>
            </div>

            <form onSubmit={handleAssignTaskSubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('কাজের শিরোনাম *', 'Task Title *')}</label>
                <input
                  type="text"
                  required
                  placeholder={tx('যেমন: ক্যাম্পের দিন ওষুধ বিতরণ কাউন্টার পরিচালনা', 'e.g. Manage Medicine Counter on Camp Day')}
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('ভলান্টিয়ার নির্বাচন বা নাম লিখুন *', 'Volunteer Name *')}</label>
                {availableVolunteers.length > 0 && (
                  <select
                    onChange={e => {
                      const selectedUser = availableVolunteers.find(u => String(u._id || u.id) === e.target.value);
                      if (selectedUser) {
                        setTaskForm({
                          ...taskForm,
                          assignedToUserId: selectedUser._id || selectedUser.id,
                          assignedToName: selectedUser.name,
                          assignedToPhone: selectedUser.phone || '',
                          assignedToEmail: selectedUser.email || ''
                        });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 mb-1.5"
                  >
                    <option value="">{tx('-- নিবন্ধিত ভলান্টিয়ারদের মধ্য থেকে বাছুন --', '-- Select from Registered Members --')}</option>
                    {availableVolunteers.map(u => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.name} ({u.role || 'Volunteer'} - {u.phone || u.email})
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="text"
                  required
                  placeholder={tx('ভলান্টিয়ারের নাম', 'Volunteer Name')}
                  value={taskForm.assignedToName}
                  onChange={e => setTaskForm({ ...taskForm, assignedToName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('মোবাইল নম্বর', 'Phone')}</label>
                  <input
                    type="tel"
                    placeholder="017xxxxxxxx"
                    value={taskForm.assignedToPhone}
                    onChange={e => setTaskForm({ ...taskForm, assignedToPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{tx('অগ্রাধিকার', 'Priority')}</label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 font-bold"
                  >
                    <option value="urgent">{tx('অতি জরুরি (Urgent)', 'Urgent')}</option>
                    <option value="high">{tx('উচ্চ (High)', 'High')}</option>
                    <option value="medium">{tx('সাধারণ (Medium)', 'Medium')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('কাজের বিবরণ ও নির্দেশিকা', 'Task Details')}</label>
                <textarea
                  rows={2}
                  placeholder={tx('কাজের বিস্তারিত বিবরণ ও সময়সীমা...', 'Instructions for volunteer...')}
                  value={taskForm.description}
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {tx('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingTask}
                  className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  {submittingTask ? tx('দায়িত্ব অর্পণ হচ্ছে...', 'Assigning...') : tx('দায়িত্ব নিশ্চিত করুন', 'Assign Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD VOLUNTEER TO EMERGENCY CELL (AUTO ACCESS)                      */}
      {/* ========================================================================= */}
      {addTeamMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setAddTeamMemberModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-600 uppercase">
                {tx('ইমার্জেন্সি সেল অ্যাক্সেস', 'Emergency Cell Access')}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {tx('ইমার্জেন্সি টিমে ভলান্টিয়ার যুক্ত করুন', 'Add Emergency Cell Volunteer')}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {tx('এখানে ভলান্টিয়ারকে যুক্ত করলে তিনি স্বয়ংক্রিয়ভাবে (Auto Access) ইমার্জেন্সি সেলের মেসেজ দেখার এবং রোগীদের সেবা দেওয়ার অনুমতি পাবেন।', 'Adding a volunteer here grants automatic permission to see emergency alerts.')}
              </p>
            </div>

            <form onSubmit={handleAddTeamMemberSubmit} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('সদস্য নির্বাচন করুন (ঐচ্ছিক)', 'Select Registered Member')}</label>
                {availableVolunteers.length > 0 && (
                  <select
                    onChange={e => {
                      const selectedUser = availableVolunteers.find(u => String(u._id || u.id) === e.target.value);
                      if (selectedUser) {
                        setTeamMemberForm({
                          ...teamMemberForm,
                          userId: selectedUser._id || selectedUser.id,
                          name: selectedUser.name,
                          phone: selectedUser.phone || '',
                          email: selectedUser.email || ''
                        });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 mb-1"
                  >
                    <option value="">{tx('-- নিবন্ধিত মেম্বারদের মধ্য থেকে বাছুন --', '-- Select Member --')}</option>
                    {availableVolunteers.map(u => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.name} ({u.role || 'Member'} - {u.phone || u.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('ভলান্টিয়ারের নাম *', 'Volunteer Name *')}</label>
                <input
                  type="text"
                  required
                  placeholder="পুরো নাম"
                  value={teamMemberForm.name}
                  onChange={e => setTeamMemberForm({ ...teamMemberForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('মোবাইল নম্বর *', 'Phone Number *')}</label>
                <input
                  type="tel"
                  required
                  placeholder="017xxxxxxxx"
                  value={teamMemberForm.phone}
                  onChange={e => setTeamMemberForm({ ...teamMemberForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{tx('দায়িত্বপ্রাপ্ত হাসপাতাল কাভারেজ', 'Hospital Assigned')}</label>
                <select
                  value={teamMemberForm.hospitalAssigned}
                  onChange={e => setTeamMemberForm({ ...teamMemberForm, hospitalAssigned: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-bold"
                >
                  <option value="all">{tx('ঝালকাঠি ও বরিশাল উভয় হাসপাতাল', 'Both Hospitals')}</option>
                  <option value="jhalokathi">{tx('ঝালকাঠি সদর হাসপাতাল টিম', 'Jhalokathi Sadar Hospital Team')}</option>
                  <option value="barishal">{tx('বরিশাল শের-ই-বাংলা মেডিকেল টিম', 'Barishal Sher-e-Bangla Medical Team')}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddTeamMemberModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {tx('বাতিল', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submittingTeamMember}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                >
                  {submittingTeamMember ? tx('যুক্ত হচ্ছে...', 'Adding...') : tx('টিমে যুক্ত করুন ও এক্সেস দিন', 'Add & Grant Access')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION: DELETE HEALTH CAMP                                          */}
      {/* ========================================================================= */}
      {campToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                {tx('স্বাস্থ্য ক্যাম্পটি মুছে ফেলতে চান?', 'Delete this health camp?')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                &quot;<strong>{campToDelete.title}</strong>&quot; {tx('ক্যাম্পটি মুছে ফেললে এটি আর তালিকায় থাকবে না। আপনি কি নিশ্চিত?', 'Once deleted, this camp will be permanently removed. Are you sure?')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCampToDelete(null)}
                disabled={deletingCampId === campToDelete._id}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {tx('বাতিল', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCamp(campToDelete._id)}
                disabled={deletingCampId === campToDelete._id}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deletingCampId === campToDelete._id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{tx('মুছে ফেলা হচ্ছে...', 'Deleting...')}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{tx('হ্যাঁ, মুছে ফেলুন', 'Yes, Delete Camp')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION: DELETE BLOOD DONOR                                          */}
      {/* ========================================================================= */}
      {donorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                {tx('রক্তদাতার তথ্য মুছে ফেলতে চান?', 'Remove this blood donor?')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                &quot;<strong>{donorToDelete.name}</strong>&quot; ({donorToDelete.bloodGroup}) {tx('কে ব্লাড ব্যাংক তালিকা থেকে সরিয়ে ফেলা হবে। আপনি কি নিশ্চিত?', 'will be removed from the blood bank directory. Are you sure?')}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDonorToDelete(null)}
                disabled={deletingDonorId === donorToDelete._id}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {tx('বাতিল', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteDonor(donorToDelete._id)}
                disabled={deletingDonorId === donorToDelete._id}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deletingDonorId === donorToDelete._id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{tx('মুছে ফেলা হচ্ছে...', 'Deleting...')}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{tx('হ্যাঁ, মুছে ফেলুন', 'Yes, Delete Donor')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
