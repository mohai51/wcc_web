'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext({
  lang: 'bn',
  setLang: () => {},
  toggleLang: () => {},
  t: () => '',
  tx: () => '',
  tObj: () => ''
});

export const translations = {
  bn: {
    // Brand & General
    brand: {
      name: 'উই ক্যান চেঞ্জ (WCC)',
      shortName: 'WCC',
      tagline: 'ঝালকাঠি ও তারুণ্যের ইতিবাচক পরিবর্তন',
      portalTitle: 'WCC পোর্টাল'
    },
    // Navigation
    nav: {
      home: 'হোম',
      visionMission: 'লক্ষ্য ও উদ্দেশ্য',
      wings: 'উইংসমূহ',
      programs: 'প্রকল্পসমূহ',
      events: 'ইভেন্ট ও ক্যাম্প',
      reportIssue: 'সমস্যা জানান',
      verifyId: 'আইডি যাচাই',
      login: 'লগইন',
      register: 'নিবন্ধন',
      portal: 'ড্যাশবোর্ড',
      logout: 'লগআউট',
      guestSite: 'পাবলিক সাইট',
      joinNow: 'যুক্ত হোন',
      asMember: 'সাধারণ সদস্য হিসেবে',
      asVolunteer: 'স্বেচ্ছাসেবক হিসেবে'
    },
    // Common Action Buttons (short and precise Bengali words)
    btn: {
      submit: 'জমা দিন',
      save: 'সংরক্ষণ',
      cancel: 'বাতিল',
      edit: 'সম্পাদনা',
      delete: 'মুছুন',
      view: 'দেখুন',
      details: 'বিস্তারিত',
      back: 'পেছনে',
      close: 'বন্ধ',
      create: 'তৈরি করুন',
      add: 'যোগ করুন',
      update: 'আপডেট',
      search: 'অনুসন্ধান...',
      filter: 'ফিল্টার',
      confirm: 'নিশ্চিত করুন',
      approve: 'অনুমোদন',
      reject: 'প্রত্যাখ্যান',
      donate: 'দান করুন',
      request: 'রিকোয়েস্ট',
      enroll: 'ক্লাস শুরু করুন',
      enrolled: 'এনরোল্ড',
      download: 'ডাউনলোড',
      open: 'খুলুন',
      signIn: 'সাইন ইন',
      signUp: 'নিবন্ধন করুন',
      loading: 'অপেক্ষা করুন...',
      retry: 'পুনরায় চেষ্টা করুন',
      viewWing: 'উইং পেজে যান',
      assignLeader: 'লিডার নিয়োগ',
      changeLeader: 'পরিবর্তন',
      publishCourse: 'কোর্স প্রকাশ',
      donateBook: 'বই দান করুন',
      requestBook: 'বইয়ের আবেদন'
    },
    // Roles
    roles: {
      admin: 'অ্যাডমিন',
      coordinator: 'সমন্বয়ক',
      wing_leader: 'উইং লিডার',
      volunteer: 'স্বেচ্ছাসেবক',
      member: 'সদস্য',
      finance_officer: 'অর্থ কর্মকর্তা'
    },
    // Wings Names and Subtitles
    wings: {
      title: 'সাংগঠনিক উইং ও স্তম্ভ',
      subtitle: 'ঝালকাঠি ও দেশের সার্বিক কল্যাণে আমাদের ৫টি বিশেষায়িত উইং',
      education: 'শিক্ষা উইং',
      health: 'স্বাস্থ্য উইং',
      sports: 'খেলাধুলা উইং',
      cultural: 'সংস্কৃতি উইং',
      environment: 'পরিবেশ উইং',
      educationDesc: 'বিনামূল্যে স্কিল কোর্স, বই অনুদান ব্যাংক, মেধাভিত্তিক শিক্ষাবৃত্তি ও ক্যারিয়ার মেন্টরশিপ।',
      healthDesc: 'বিনামূল্যে স্বাস্থ্য ও চক্ষু ক্যাম্প, স্বেচ্ছায় রক্তদান নেটওয়ার্ক এবং জরুরি স্বাস্থ্যসেবা।',
      sportsDesc: 'মাদকমুক্ত সমাজ গঠনে ফুটবল, ক্রিকেট টুর্নামেন্ট ও যুব অ্যাথলেটিক্স প্রতিযোগিতা।',
      culturalDesc: 'বাঙালি সংস্কৃতি ও ভাষা আন্দোলনের সঠিক ইতিহাস চর্চা, সাহিত্য ও সৃজনশীল নাট্যকর্ম।',
      environmentDesc: 'সুগন্ধা নদী রক্ষা, ব্যাপক বৃক্ষরোপণ, বর্জ্য নিষ্কাশন ও প্লাস্টিক দূষণ রোধ আন্দোলন।'
    },
    // Education Wing Specific
    education: {
      tabs: {
        overview: 'উইং পরিচিতি',
        courses: 'ফ্রি কোর্সসমূহ',
        books: 'বই কর্ণার (আদান-প্রদান)',
        leaderPanel: 'উইং লিডার প্যানেল'
      },
      hero: {
        badge: 'শিক্ষা ও স্কিল উন্নয়ন',
        title: 'শিক্ষা উইং (Education Wing)',
        subtitle: 'ঝালকাঠির ভবিষ্যৎ প্রজন্ম ও যুবসমাজের দক্ষতা বৃদ্ধিতে WCC-এর শিক্ষা উদ্যোগ।'
      },
      leaderCard: {
        title: 'উইং লিডার (Education Leader)',
        assigned: 'বর্তমান লিডার',
        notAssigned: 'লিডার নিয়োগ প্রক্রিয়াধীন',
        contact: 'যোগাযোগ'
      },
      courses: {
        title: 'মেম্বারদের জন্য উন্মুক্ত ফ্রি কোর্স',
        subtitle: 'WCC নিবন্ধিত যেকোনো মেম্বার সম্পূর্ণ বিনামূল্যে কোর্সগুলোতে অংশ নিতে পারবেন।',
        noCourses: 'বর্তমানে কোনো সক্রিয় কোর্স নেই। নতুন কোর্স শীঘ্রই প্রকাশ করা হবে।',
        lessons: 'টি লেকচার',
        enrollToWatch: 'ক্লাস করতে এনরোল করুন',
        startLearning: 'ক্লাস দেখুন',
        nowPlaying: 'ভিডিও ক্লাস প্লেয়ার',
        lessonList: 'ক্লাসের সূচিপত্র',
        instructor: 'প্রশিক্ষক',
        duration: 'সময়কাল'
      },
      books: {
        title: 'বই আদান-প্রদান ও ডোনেশন কর্ণার',
        subtitle: 'আপনার পড়া পুরোনো বই দান করুন, অথবা প্রয়োজন অনুযায়ী পছন্দের বই বিনামূল্যে পড়ার জন্য আবেদন করুন।',
        donateBtn: '+ বই দান করুন',
        allCategory: 'সব ক্যাটাগরি',
        academic: 'পাঠ্যবই ও একাডেমিক',
        literature: 'সাহিত্য ও গল্প',
        skill: 'দক্ষতা ও বিজ্ঞান',
        competitive: 'বিসিএস ও চাকরির প্রস্তুতি',
        available: 'পড়ার জন্য প্রস্তুত',
        requested: 'বুকড / বিতরণকৃত',
        requestThisBook: 'বইটির জন্য আবেদন করুন',
        pickupAt: 'সংগ্রহের স্থান:',
        donor: 'দাতা:',
        condition: 'অবস্থা:'
      },
      leaderPanel: {
        title: 'শিক্ষা উইং লিডার কন্ট্রোল প্যানেল',
        subtitle: 'বই অনুদান ও বইয়ের আবেদনের অনুমোদন, এবং নতুন কোর্স প্রকাশের একক নিয়ন্ত্রণ ব্যবস্থা।',
        statsPendingDonations: 'অপেক্ষমাণ বই অনুদান',
        statsPendingRequests: 'অপেক্ষমাণ বই আবেদন',
        statsTotalCourses: 'মোট সক্রিয় কোর্স',
        pendingDonationsTab: 'বই অনুদান যাচাই',
        pendingRequestsTab: 'বই আবেদন যাচাই',
        addNewCourseTab: 'নতুন কোর্স প্রকাশ',
        approve: 'অনুমোদন দিন',
        reject: 'বাতিল করুন'
      }
    },
    // Wing Management (Admin)
    adminWings: {
      title: 'উইং ব্যবস্থাপনা (Wing Management)',
      subtitle: 'সংগঠনের সকল উইং, স্লাগ, লিডারশিপ ও কার্যক্রম পরিচালনা করুন',
      directAccess: 'সরাসরি উইং পেজে প্রবেশ করুন:',
      totalWings: 'মোট উইং:',
      searchPlaceholder: 'উইংয়ের নাম দিয়ে খুঁজুন...',
      newWingBtn: '+ নতুন উইং তৈরি',
      colWing: 'উইংয়ের নাম',
      colSlug: 'স্লাগ',
      colLeader: 'উইং লিডার',
      colDesc: 'বিবরণ',
      colGoals: 'লক্ষ্যসমূহ',
      colActions: 'অ্যাকশন',
      assignLeader: '+ লিডার নিয়োগ',
      changeLeader: 'পরিবর্তন',
      viewPageTooltip: 'উইং পেজে প্রবেশ করুন'
    },
    // Login & Register
    auth: {
      loginTitle: 'WCC পোর্টালে সাইন ইন করুন',
      loginSubtitle: 'আপনার ডিজিটাল আইডি ও সদস্য ড্যাশবোর্ডে প্রবেশ করতে লগইন করুন',
      emailLabel: 'ইমেইল ঠিকানা',
      passLabel: 'পাসওয়ার্ড',
      forgotPass: 'পাসওয়ার্ড ভুলে গেছেন?',
      signInBtn: 'সাইন ইন করুন',
      orGoogle: 'অথবা গুগল দিয়ে সরাসরি প্রবেশ করুন',
      continueGoogle: 'Continue with Google',
      quickFill: 'এক ক্লিকে টেস্ট লগইন:',
      noAccount: 'কোনো আইডি নেই?',
      registerNow: 'WCC সদস্যপদের জন্য আবেদন করুন'
    },
    // Sidebar
    sidebar: {
      coreOversight: 'মূল পরিচালনা',
      wingLeadership: 'উইং পরিচালনা',
      volunteerCorps: 'স্বেচ্ছাসেবক শাখা',
      myMembership: 'আমার সদস্যপদ',
      financeAudit: 'অর্থ ও হিসাব',
      publicServices: 'পাবলিক সেবা',
      dashboard: 'ড্যাশবোর্ড ওভারভিউ',
      wingPlatform: 'আমার উইং প্ল্যাটফর্ম',
      wingsManagement: 'উইং ব্যবস্থাপনা',
      eduWingLink: 'শিক্ষা উইং (কোর্স ও বই)',
      allWingsLink: 'সকল উইং তালিকা',
      memberDirectory: 'সদস্য তালিকা',
      registerMember: 'নতুন সদস্য ফরম',
      profile: 'প্রোফাইল সেটিংস',
      logout: 'লগআউট'
    },
    // Footer
    footer: {
      aboutText: 'উই ক্যান চেঞ্জ (WCC) ঝালকাঠি জেলা তথা দেশের তরুণদের আত্মউন্নয়ন, সমাজসেবা ও সার্বিক কল্যাণে একটি অরাজনৈতিক সেবামূলক সামাজিক প্ল্যাটফর্ম।',
      quickLinks: 'দ্রুত লিংক',
      wings: 'উইংসমূহ',
      contact: 'যোগাযোগ ও তথ্য',
      address: 'ঝালকাঠি সদর, ঝালকাঠি, বাংলাদেশ',
      phone: '+৮৮০ ১৭১১-০০০০০০',
      email: 'contact@wecanchange.org',
      copyright: 'সর্বস্বত্ব সংরক্ষিত © ২০২৬ উই ক্যান চেঞ্জ (WCC)।'
    }
  },

  en: {
    // Brand & General
    brand: {
      name: 'We Can Change (WCC)',
      shortName: 'WCC',
      tagline: 'Empowering Youth & Social Transformation in Jhalokathi',
      portalTitle: 'WCC Portal'
    },
    // Navigation
    nav: {
      home: 'Home',
      visionMission: 'Vision & Mission',
      wings: 'Our Wings',
      programs: 'Programs',
      events: 'Events & Camps',
      reportIssue: 'Report Issue',
      verifyId: 'Verify ID',
      login: 'Sign In',
      register: 'Register',
      portal: 'Dashboard',
      logout: 'Sign Out',
      guestSite: 'Public Site',
      joinNow: 'Join Us',
      asMember: 'As General Member',
      asVolunteer: 'As Volunteer'
    },
    // Common Action Buttons
    btn: {
      submit: 'Submit',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      details: 'Details',
      back: 'Back',
      close: 'Close',
      create: 'Create',
      add: 'Add',
      update: 'Update',
      search: 'Search...',
      filter: 'Filter',
      confirm: 'Confirm',
      approve: 'Approve',
      reject: 'Reject',
      donate: 'Donate',
      request: 'Request',
      enroll: 'Start Class',
      enrolled: 'Enrolled',
      download: 'Download',
      open: 'Open',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      loading: 'Please wait...',
      retry: 'Retry',
      viewWing: 'Go to Wing Page',
      assignLeader: 'Assign Leader',
      changeLeader: 'Change',
      publishCourse: 'Publish Course',
      donateBook: 'Donate Book',
      requestBook: 'Request Book'
    },
    // Roles
    roles: {
      admin: 'Admin',
      coordinator: 'Coordinator',
      wing_leader: 'Wing Leader',
      volunteer: 'Volunteer',
      member: 'Member',
      finance_officer: 'Finance Officer'
    },
    // Wings Names and Subtitles
    wings: {
      title: 'Organizational Wings & Pillars',
      subtitle: 'Our 5 dedicated operational wings working for community welfare',
      education: 'Education Wing',
      health: 'Health Wing',
      sports: 'Sports Wing',
      cultural: 'Cultural Wing',
      environment: 'Environment Wing',
      educationDesc: 'Free skill courses, book exchange library, scholarships & student career guidance.',
      healthDesc: 'Free health and eye camps, voluntary blood donation network & primary medical aid.',
      sportsDesc: 'Grassroots football, cricket tournaments, and youth fitness to build drug-free communities.',
      culturalDesc: 'Promoting Bengali cultural heritage, language movement history, art & literature.',
      environmentDesc: 'Sugandha river conservation, mass tree plantation, waste disposal & anti-plastic initiatives.'
    },
    // Education Wing Specific
    education: {
      tabs: {
        overview: 'Overview',
        courses: 'Free Courses',
        books: 'Book Exchange Corner',
        leaderPanel: 'Wing Leader Panel'
      },
      hero: {
        badge: 'Education & Skill Development',
        title: 'Education Wing',
        subtitle: 'Empowering students and youth with free professional skills, scholarships, and books.'
      },
      leaderCard: {
        title: 'Wing Leader',
        assigned: 'Current Leader',
        notAssigned: 'Leader appointment in progress',
        contact: 'Contact'
      },
      courses: {
        title: 'Free Member Courses',
        subtitle: 'All registered WCC members can access full course video lectures free of cost.',
        noCourses: 'No courses published yet. New courses will be announced soon.',
        lessons: 'Lectures',
        enrollToWatch: 'Enroll to Access Lectures',
        startLearning: 'Start Learning',
        nowPlaying: 'Video Classroom Player',
        lessonList: 'Course Syllabus',
        instructor: 'Instructor',
        duration: 'Duration'
      },
      books: {
        title: 'Book Donation & Exchange Corner',
        subtitle: 'Donate your previously read books or request available books free of charge.',
        donateBtn: '+ Donate a Book',
        allCategory: 'All Categories',
        academic: 'Academic Textbooks',
        literature: 'Literature & Fiction',
        skill: 'Skills & Science',
        competitive: 'BCS & Job Exam Prep',
        available: 'Available to Request',
        requested: 'Reserved / Borrowed',
        requestThisBook: 'Request This Book',
        pickupAt: 'Pickup Location:',
        donor: 'Donor:',
        condition: 'Condition:'
      },
      leaderPanel: {
        title: 'Education Wing Leader Panel',
        subtitle: 'Review book donations and borrowing requests, and publish new courses.',
        statsPendingDonations: 'Pending Book Donations',
        statsPendingRequests: 'Pending Book Requests',
        statsTotalCourses: 'Active Courses',
        pendingDonationsTab: 'Verify Book Donations',
        pendingRequestsTab: 'Verify Book Requests',
        addNewCourseTab: 'Publish New Course',
        approve: 'Approve',
        reject: 'Reject'
      }
    },
    // Wing Management (Admin)
    adminWings: {
      title: 'Wings Management',
      subtitle: 'Manage organizational wings, leaders, mission goals, and public pages',
      directAccess: 'Direct Access to Wing Pages:',
      totalWings: 'Total Wings:',
      searchPlaceholder: 'Search wings by name...',
      newWingBtn: '+ New Wing',
      colWing: 'Wing Name',
      colSlug: 'Slug',
      colLeader: 'Wing Leader',
      colDesc: 'Description',
      colGoals: 'Mission Goals',
      colActions: 'Actions',
      assignLeader: '+ Assign Leader',
      changeLeader: 'Change',
      viewPageTooltip: 'Open Wing Page'
    },
    // Login & Register
    auth: {
      loginTitle: 'Sign In to WCC',
      loginSubtitle: 'Access your official digital member card and management portal',
      emailLabel: 'Email Address',
      passLabel: 'Password',
      forgotPass: 'Forgot password?',
      signInBtn: 'Sign In',
      orGoogle: 'Or continue with Google',
      continueGoogle: 'Continue with Google',
      quickFill: 'One-Click Quick Test Login:',
      noAccount: "Don't have an ID?",
      registerNow: 'Apply for WCC Membership'
    },
    // Sidebar
    sidebar: {
      coreOversight: 'CORE OVERSIGHT',
      wingLeadership: 'WING LEADERSHIP',
      volunteerCorps: 'VOLUNTEER CORPS',
      myMembership: 'MY MEMBERSHIP',
      financeAudit: 'FINANCE & AUDIT',
      publicServices: 'PUBLIC SERVICES',
      dashboard: 'Dashboard Overview',
      wingPlatform: 'My Wing Platform',
      wingsManagement: 'Wings Management',
      eduWingLink: 'Education Wing & Courses',
      allWingsLink: 'Explore All Wings',
      memberDirectory: 'Member Directory',
      registerMember: 'Register Member',
      profile: 'Profile Settings',
      logout: 'Sign Out'
    },
    // Footer
    footer: {
      aboutText: 'We Can Change (WCC) is a non-profit youth organization committed to social development, education, and community empowerment in Jhalokathi, Bangladesh.',
      quickLinks: 'Quick Links',
      wings: 'Strategic Wings',
      contact: 'Contact Info',
      address: 'Jhalokathi Sadar, Jhalokathi, Bangladesh',
      phone: '+880 1711-000000',
      email: 'contact@wecanchange.org',
      copyright: 'All Rights Reserved © 2026 We Can Change (WCC).'
    }
  }
};

export function LanguageProvider({ children }) {
  // Default language is 'bn' (Bangla)
  const [lang, setLangState] = useState('bn');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wcc_lang');
      if (stored === 'bn' || stored === 'en') {
        setLangState(stored);
        applyLanguageDom(stored);
      } else {
        applyLanguageDom('bn');
      }
    } catch (e) {
      applyLanguageDom('bn');
    }
  }, []);

  const applyLanguageDom = (newLang) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
      document.body.classList.remove('lang-bn', 'lang-en');
      document.body.classList.add(newLang === 'bn' ? 'lang-bn' : 'lang-en');
    }
  };

  const setLang = (newLang) => {
    const validLang = newLang === 'en' ? 'en' : 'bn';
    setLangState(validLang);
    try {
      localStorage.setItem('wcc_lang', validLang);
    } catch (e) {}
    applyLanguageDom(validLang);
  };

  const toggleLang = () => {
    const nextLang = lang === 'bn' ? 'en' : 'bn';
    setLang(nextLang);
  };

  // Helper function to resolve dot-notated key e.g. "nav.home"
  const t = (pathKey, fallback = '') => {
    if (!pathKey) return fallback;
    const parts = pathKey.split('.');
    let curr = translations[lang];
    for (const p of parts) {
      if (!curr || typeof curr !== 'object') {
        curr = undefined;
        break;
      }
      curr = curr[p];
    }
    if (curr !== undefined && curr !== null) return curr;

    // Fallback to English if missing in Bengali
    let enCurr = translations.en;
    for (const p of parts) {
      if (!enCurr || typeof enCurr !== 'object') {
        enCurr = undefined;
        break;
      }
      enCurr = enCurr[p];
    }
    return enCurr !== undefined && enCurr !== null ? enCurr : fallback || pathKey;
  };

  // Quick inline bilingual helper: tx('বাংলা টেক্সট', 'English text')
  const tx = (bnText, enText) => {
    return lang === 'bn' ? bnText : enText;
  };

  // Helper for objects like { bn: '...', en: '...' }
  const tObj = (obj, fallback = '') => {
    if (!obj || typeof obj !== 'object') return fallback;
    return obj[lang] || obj.en || obj.bn || fallback;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, tx, tObj }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
