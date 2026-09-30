import { NextResponse } from 'next/server';

// Core WCC Knowledge Base for instant context and fallback
const WCC_CORE_KNOWLEDGE = {
  organization: {
    name: 'উই ক্যান চেঞ্জ (We Can Change - WCC)',
    tagline: 'ঝালকাঠি জেলাকে এগিয়ে নেওয়ার একটি মানবিক, তারুণ্যনির্ভর সামাজিক উদ্যোগ',
    location: 'ঝালকাঠি, বরিশাল বিভাগ, বাংলাদেশ',
    mission: 'শিক্ষা, স্বাস্থ্য, ক্রীড়া, সংস্কৃতি ও পরিবেশগত উন্নয়নের মাধ্যমে একটি ইতিবাচক, স্বনির্ভর ও মানবিক সমাজ গড়ে তোলা।',
    vision: 'দারিদ্র্যমুক্ত, শিক্ষিত, স্বাস্থ্যসম্মত এবং পরিবেশবান্ধব আলোকিত ঝালকাঠি বিনির্মাণ।',
    membership: 'যে কোনো সচেতন নাগরিক বা তরুণ উই ক্যান চেঞ্জের মেম্বার বা ভলান্টিয়ার হিসেবে রেজিস্ট্রেশন করতে পারেন। রেজিস্ট্রেশন লিংক: /register',
    contact: 'ইমেইল: info@wecanchange.org | ফোন: +880 1700-000000 | হেল্পলাইন: +880 1800-000000'
  },
  wings: [
    {
      name: 'স্বাস্থ্য উইং (Health Wing)',
      slug: 'health',
      link: '/wings/health',
      summary: 'বিনামূল্যে স্বাস্থ্য সেবা, ফ্রি মেডিকেল ও চক্ষু শিবির, স্বেচ্ছায় রক্তদান নেটওয়ার্ক (Emergency Blood Bank), হাসপাতাল ইমার্জেন্সি সাপোর্ট সেল এবং প্রান্তিক মানুষের কাছে ওষুধ ও প্রাথমিক চিকিৎসা সেবা পৌঁছে দেওয়া।'
    },
    {
      name: 'শিক্ষা উইং (Education Wing)',
      slug: 'education',
      link: '/wings/education',
      summary: 'স্কুল ড্রপআউট রোধ, ফ্রি ডিজিটাল কম্পিউটার ও আইটি ফ্রিল্যান্সিং কোর্স, মেধা অন্বেষণ বৃত্তি, দরিদ্র শিক্ষার্থীদের মাঝে শিক্ষা উপকরণ ও বই বিতরণ কর্মসূচি।'
    },
    {
      name: 'খেলাধুলা উইং (Sports Wing)',
      slug: 'sports',
      link: '/wings/sports',
      summary: 'যুব সমাজকে মাদক ও অসৎ সঙ্গ থেকে মুক্ত রাখতে আন্তঃউপজেলা ফুটবল, ক্রিকেট টুর্নামেন্ট, মেয়েদের সেলফ ডিফেন্স প্রশিক্ষণ এবং ক্রীড়া প্রতিভা বিকাশ।'
    },
    {
      name: 'সংস্কৃতি উইং (Cultural Wing)',
      slug: 'cultural',
      link: '/wings/cultural',
      summary: 'ঐতিহ্যবাহী কীর্তিপাশা জমিদার বাড়ি ও স্থানীয় ইতিহাস সংরক্ষণ, সাহিত্য উৎসব, আবৃত্তি, বিতর্ক ও বার্ষিক সাংস্কৃতিক মেলবন্ধন।'
    },
    {
      name: 'পরিবেশ উইং (Environment Wing)',
      slug: 'environment',
      link: '/wings/environment',
      summary: 'সুগন্ধা নদী সুরক্ষা, উপকূলীয় দুর্যোগ প্রস্তুতি মহড়া, বৃক্ষরোপণ অভিযান, প্লাস্টিক দূষণ রোধ ও পরিবেশ সচেতনতা।'
    }
  ]
};

// Fetch live dynamic events, wings, programs, and health camps from local API
async function fetchLiveWccContext() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  try {
    const [eventsRes, wingsRes, programsRes, campsRes] = await Promise.allSettled([
      fetch(`${apiUrl}/events`, { cache: 'no-store' }),
      fetch(`${apiUrl}/wings`, { cache: 'no-store' }),
      fetch(`${apiUrl}/programs`, { cache: 'no-store' }),
      fetch(`${apiUrl}/health/camps`, { cache: 'no-store' })
    ]);

    const events = eventsRes.status === 'fulfilled' && eventsRes.value.ok ? await eventsRes.value.json() : [];
    const wings = wingsRes.status === 'fulfilled' && wingsRes.value.ok ? await wingsRes.value.json() : [];
    const programs = programsRes.status === 'fulfilled' && programsRes.value.ok ? await programsRes.value.json() : [];
    const camps = campsRes.status === 'fulfilled' && campsRes.value.ok ? await campsRes.value.json() : [];

    return {
      events: Array.isArray(events) ? events.slice(0, 10) : [],
      wings: Array.isArray(wings) ? wings : [],
      programs: Array.isArray(programs) ? programs.slice(0, 10) : [],
      camps: Array.isArray(camps) ? camps.slice(0, 5) : []
    };
  } catch (err) {
    console.warn('WCC live context fetch error:', err.message);
    return { events: [], wings: [], programs: [], camps: [] };
  }
}

// Call Google Gemini API across supported models
async function callGemini(apiKey, systemPrompt, contents) {
  const models = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 1000
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { text, model };
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.error?.message || res.statusText;
        console.warn(`Gemini model ${model} returned ${res.status} (${errMsg}), trying next available model...`);
        lastError = new Error(`Model ${model} returned ${res.status}: ${errMsg}`);
      }
    } catch (err) {
      console.warn(`Gemini model ${model} network error: ${err.message}, trying next...`);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

// Built-in intelligent response generator if Gemini API key has network delay
function generateSmartWccResponse(userQuestion, liveData) {
  const q = (userQuestion || '').toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|সালাম|আসসালামু আলাইকুম|নমস্কার|কেমন আছেন|hola)/i.test(q)) {
    return `আসসালামু আলাইকুম! আমি **উই ক্যান চেঞ্জ (WCC)** এবং **ঝালকাঠি জেলা**র জন্য নিবেদিত স্মার্ট এআই সহকারী। 

আমি আপনাকে WCC-এর ৫টি উইং (স্বাস্থ্য, শিক্ষা, খেলাধুলা, সংস্কৃতি ও পরিবেশ), ফ্রি স্বাস্থ্য ক্যাম্প, ব্লাড ব্যাংক, আসন্ন ইভেন্টসমূহ কিংবা ঐতিহ্যবাহী ঝালকাঠি জেলা সম্পর্কিত যেকোনো তথ্যে সহায়তা করতে পারি।

আজ আপনাকে কীভাবে সাহায্য করতে পারি?`;
  }

  // Upcoming Events query
  if (q.includes('event') || q.includes('ইভেন্ট') || q.includes('কর্মসূচি') || q.includes('আসন্ন') || q.includes('অনুষ্ঠান')) {
    if (liveData.events && liveData.events.length > 0) {
      const eventList = liveData.events
        .map(e => `• **${e.title}** (${new Date(e.date).toLocaleDateString('bn-BD')}) - স্থান: ${e.location}`)
        .join('\n');
      return `উই ক্যান চেঞ্জ (WCC)-এর আসন্ন ও সাম্প্রতিক ইভেন্টসমূহ:\n\n${eventList}\n\n👉 বিস্তারিত দেখতে ও ইভেন্টে রেজিস্ট্রেশন করতে ভিজিট করুন: [ইভেন্ট পেজ](/events)`;
    }
    return `উই ক্যান চেঞ্জ (WCC) নিয়মিত স্বাস্থ্য শিবির, বৃক্ষরোপণ, রক্তদান ও যুব প্রশিক্ষণ আয়োজন করে থাকে। আসন্ন সব ইভেন্ট দেখতে ভিজিট করুন আমাদের [ইভেন্ট পাতা](/events)।`;
  }

  // Health / Blood / Camps
  if (q.includes('রক্ত') || q.includes('blood') || q.includes('ডাক্তার') || q.includes('ক্যাম্প') || q.includes('হাসপাতাল') || q.includes('স্বাস্থ্য') || q.includes('health') || q.includes('donor')) {
    let campInfo = '';
    if (liveData.camps && liveData.camps.length > 0) {
      campInfo = `\n\n📌 **চলমান/আসন্ন স্বাস্থ্য ক্যাম্প:**\n` + liveData.camps.map(c => `• **${c.title}** (${c.date ? new Date(c.date).toLocaleDateString('bn-BD') : 'তারিখ নির্ধারিত'}) - ${c.venue || c.location || 'ঝালকাঠি'}`).join('\n');
    }
    return `🩺 **উই ক্যান চেঞ্জ স্বাস্থ্য উইং (Health Wing):**\n\nস্বাস্থ্য উইং ঝালকাঠি জেলায় বিনামূল্যে বিশেষজ্ঞ ডাক্তার সেবা, ফ্রি ওষুধ বিতরণ ও জরুরি রক্তদান সহায়তা প্রদান করে। উইং সমন্বয়ক ডা. মোস্তাফিজুর এবং একদল নিবেদিত ভলান্টিয়ার এটি পরিচালনা করছেন।\n\n১. **ইমার্জেন্সি ব্লাড ব্যাংক:** ঝালকাঠির রক্তের গ্রুপভিত্তিক ডোনার তালিকা ও সরাসরি কল সুবিধা।\n২. **ফ্রি মেডিকেল ও চক্ষু ক্যাম্প:** বিশেষজ্ঞ ডাক্তারদের নিয়মিত ক্যাম্প।${campInfo}\n৩. **হাসপাতাল ইমার্জেন্সি সেল:** জরুরি রোগী পরিবহন ও সহায়তা।\n\n👉 সরাসরি স্বাস্থ্য সেবা পেতে ভিজিট করুন: [স্বাস্থ্য উইং পোর্টাল](/wings/health)`;
  }

  // Education / Courses
  if (q.includes('শিক্ষা') || q.includes('education') || q.includes('কোর্স') || q.includes('বই') || q.includes('কম্পিউটার') || q.includes('ফ্রিল্যান্সিং') || q.includes('course')) {
    return `📚 **উই ক্যান চেঞ্জ শিক্ষা উইং (Education Wing):**\n\nশিক্ষা উইং সুবিধাবঞ্চিত শিক্ষার্থীদের ঝরে পড়া রোধ, বই সহায়তা এবং তরুণদের বিনামূল্যে ফ্রিল্যান্সিং ও আইটি প্রশিক্ষণ প্রদান করে। উইং সমন্বয়ক তানভীর আহমেদ চৌধুরী।\n\n• **ফ্রি ডিজিটাল আইটি ও কম্পিউটার কোর্স:** গ্রাফিক্স, ওয়েব ও ফ্রিল্যান্সিং গাইডলাইন।\n• **বই উৎসব ও শিক্ষা উপকরণ বিতরণ:** দরিদ্র মেধাবী শিক্ষার্থীদের জন্য সহায়তা।\n\n👉 বিস্তারিত জানতে ও কোর্সে যুক্ত হতে ভিজিট করুন: [শিক্ষা উইং পোর্টাল](/wings/education)`;
  }

  // Membership / Registration / Volunteer
  if (q.includes('মেম্বার') || q.includes('সদস্য') || q.includes('member') || q.includes('volunteer') || q.includes('ভলান্টিয়ার') || q.includes('জয়েন') || q.includes('যোগদান') || q.includes('registration') || q.includes('রেজিস্ট্রেশন')) {
    return `🤝 **উই ক্যান চেঞ্জ (WCC)-এর মেম্বার বা ভলান্টিয়ার হওয়ার নিয়ম:**\n\nআপনি খুব সহজেই আমাদের সাথে যুক্ত হয়ে সমাজের জন্য কাজ করতে পারেন:\n১. আমাদের রেজিস্ট্রেশন পেজে যান: [অনলাইন রেজিস্ট্রেশন](/register)\n২. আপনার নাম, ইমেইল, মোবাইল ও পছন্দের উইং নির্বাচন করে ফর্ম পূরণ করুন।\n৩. রেজিস্ট্রেশন সম্পন্ন হলে আপনার নিজস্ব মেম্বার ড্যাশবোর্ড ও ডিজিটাল আইডি কার্ড পাবেন।\n\n👉 এখনই যুক্ত হোন: [এখানে ক্লিক করে নিবন্ধন করুন](/register)`;
  }

  // Sports Wing
  if (q.includes('খেলাধুলা') || q.includes('sports') || q.includes('ফুটবল') || q.includes('ক্রিকেট') || q.includes('টুর্নামেন্ট')) {
    return `⚽ **উই ক্যান চেঞ্জ খেলাধুলা উইং (Sports Wing):**\n\nযুব সমাজকে সুস্থ ও মাদকমুক্ত রাখতে আন্তঃউপজেলা ফুটবল ও ক্রিকেট টুর্নামেন্ট, মেয়েদের সেলফ ডিফেন্স প্রশিক্ষণ এবং স্থানীয় ক্রীড়াবিদদের সহায়তা করে।\n\n👉 বিস্তারিত দেখুন: [খেলাধুলা উইং](/wings/sports)`;
  }

  // Cultural Wing
  if (q.includes('সংস্কৃতি') || q.includes('cultural') || q.includes('কীর্তিপাশা') || q.includes('জমিদার') || q.includes('সাহিত্য') || q.includes('বিতর্ক')) {
    return `🎨 **উই ক্যান চেঞ্জ সংস্কৃতি উইং (Cultural Wing):**\n\nঝালকাঠির ঐতিহাসিক কীর্তিপাশা জমিদার বাড়ি সংরক্ষণ সচেতনতা, বার্ষিক সাহিত্য উৎসব, বিতর্ক প্রতিযোগিতা ও সাংস্কৃতিক ঐতিহ্য রক্ষা এই উইংয়ের মূল কাজ।\n\n👉 বিস্তারিত দেখুন: [সংস্কৃতি উইং](/wings/cultural)`;
  }

  // Environment Wing
  if (q.includes('পরিবেশ') || q.includes('environment') || q.includes('গাছ') || q.includes('বৃক্ষ') || q.includes('সুগন্ধা') || q.includes('নদী')) {
    return `🌱 **উই ক্যান চেঞ্জ পরিবেশ উইং (Environment Wing):**\n\nসুগন্ধা নদীর তীর সুরক্ষা, প্লাস্টিক বর্জন প্রচারণা, উপকূলীয় দুর্যোগ প্রস্তুতি মহড়া ও ব্যাপক বৃক্ষরোপণ কর্মসূচি পরিচালনা করে।\n\n👉 বিস্তারিত দেখুন: [পরিবেশ উইং](/wings/environment)`;
  }

  // Wings in general
  if (q.includes('উইং') || q.includes('wing') || q.includes('কয়টি উইং') || q.includes('শাখা')) {
    return `উই ক্যান চেঞ্জ (WCC)-এর মোট ৫টি প্রধান উইং রয়েছে:\n\n1. 🩺 [স্বাস্থ্য উইং (Health Wing)](/wings/health)\n2. 📚 [শিক্ষা উইং (Education Wing)](/wings/education)\n3. ⚽ [খেলাধুলা উইং (Sports Wing)](/wings/sports)\n4. 🎨 [সংস্কৃতি উইং (Cultural Wing)](/wings/cultural)\n5. 🌱 [পরিবেশ উইং (Environment Wing)](/wings/environment)\n\nপ্রতিটি উইং নির্দিষ্ট লক্ষ্য ও সমাজকল্যাণমূলক পরিকল্পনা নিয়ে ঝালকাঠিতে কাজ করছে।`;
  }

  // Jhalokathi places and history
  if (q.includes('ঝালকাঠি') || q.includes('jhalokathi') || q.includes('ভিমরুলি') || q.includes('পেয়ারা') || q.includes('কীর্তিপাশা') || q.includes('গাবখান') || q.includes('সুগন্ধা') || q.includes('ধানসিঁড়ি')) {
    return `🌾 **ঐতিহাসিক ঝালকাঠি জেলা ও দর্শনীয় স্থান:**\n\nঝালকাঠি বাংলাদেশের বরিশাল বিভাগের একটি নদীমাতৃক ও ঐতিহ্যমণ্ডিত জেলা।\n\n১. **ভিমরুলির ভাসমান পেয়ারা বাজার:** বাংলাদেশের বৃহত্তম ভাসমান বাজার, যা বাংলার ভেনিস নামেও খ্যাত।\n২. **কীর্তিপাশা জমিদার বাড়ি:** শতবর্ষী ঐতিহাসিক রাজপ্রাসাদ ও পুরাকীর্তি।\n৩. **গাবখান সেতু:** দক্ষিণাঞ্চলের দীর্ঘতম ও দৃষ্টিনন্দন সেতু, যা গাবখান চ্যানেলের উপর অবস্থিত।\n৪. **সুগন্ধা ও ধানসিঁড়ি নদী:** কবি জীবনানন্দ দাশের অমর কবিতার নদী ধানসিঁড়ি এই ঝালকাঠিতেই অবস্থিত।\n\nউই ক্যান চেঞ্জ (WCC) এই ঝালকাঠি জেলার মানবিক উন্নয়ন ও ইতিহাস সংরক্ষণে নিবেদিত। [আমাদের ভিশন ও মিশন জানুন](/vision-mission)।`;
  }

  // Off-topic polite decline fallback
  return `আমি **উই ক্যান চেঞ্জ (WCC)** এবং **ঝালকাঠি জেলা**র জন্য নিবেদিত অফিসিয়াল এআই সহকারী। 

আমি শুধুমাত্র WCC-এর কার্যক্রম (স্বাস্থ্য উইং, ফ্রি মেডিকেল ক্যাম্প, ব্লাড ব্যাংক, শিক্ষা ও আইটি কোর্স, মেম্বারশিপ) এবং ঝালকাঠি জেলা সংক্রান্ত তথ্যের উত্তর দিতে পারি। 

WCC বা ঝালকাঠি সম্পর্কিত আপনার কোনো প্রশ্ন থাকলে সানন্দে বলুন, আমি আপনাকে বিস্তারিত তথ্য দিয়ে সাহায্য করতে প্রস্তুত!`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const trimmedMessage = message.trim();

    // 1. Fetch live WCC context (Events, Camps, Wings, Programs)
    const liveData = await fetchLiveWccContext();

    // 2. Check for Google Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (apiKey) {
      try {
        const systemPrompt = `You are the official, dedicated AI Assistant for "We Can Change (WCC)" (উই ক্যান চেঞ্জ) and Jhalokathi District (ঝালকাঠি জেলা), Bangladesh.

YOUR IDENTITY & PERSONA:
- You are warm, polite, articulate, culturally respectful, and deeply knowledgeable about community service in Jhalokathi.
- You represent WCC and Jhalokathi district with pride and helpfulness.
- ALWAYS respond in the language used by the user: default to natural, elegant Bengali (বাংলা), or English if the user asks in English.

STRICT DOMAIN PERSONALIZATION & SCOPE:
1. WHAT YOU MUST ANSWER:
   A) "We Can Change (WCC)":
      - Mission, vision, core values, history, and social impact.
      - 5 specialized Wings:
        * Health Wing (Leader: Dr. Mostafizur / Health Coordinator) - Free medical camps, eye camps, emergency blood bank with group-wise donor matching, hospital emergency cell, free medicine aid.
        * Education Wing (Leader: Tanvir Ahmed Chowdhury) - School dropout prevention, free IT/freelancing bootcamps, book distribution, scholarships.
        * Sports Wing - Youth sports tournaments, anti-drug awareness, girls' self-defense.
        * Cultural Wing - Kirtipasha zamindar palace heritage conservation, annual literature festival, debate.
        * Environment Wing - Sugandha river protection, tree plantation, coastal disaster preparedness drills.
      - Upcoming & ongoing events, camps, programs, and volunteer/member registration.
   B) "Jhalokathi District (ঝালকাঠি জেলা)":
      - History, geography, upazilas (Jhalokathi Sadar, Nalchity, Rajapur, Kathalia).
      - Iconic places: Kirtipasha Zamindar Bari (কীর্তিপাশা জমিদার বাড়ি), Bhimruli Floating Guava Market (ভিমরুলির ভাসমান পেয়ারা বাজার), Gabkhan Bridge (গাবখান সেতু), Sujabad Fort (সুজাবাদ কেল্লা), Ponabalia Temple.
      - Famous rivers: Sugandha (সুগন্ধা), Bishkhali (বিষখালী), Dhanshiri (ধানসিঁড়ি - poet Jibanananda Das).
      - Local agriculture (guava, amra, betel nut) and local culture.
   C) Warm greetings, polite introductions, and courteous pleasantries.

2. STRICT REFUSAL OF OFF-TOPIC QUESTIONS:
   - If the user asks about ANYTHING outside WCC or Jhalokathi (for example: general computer programming/code, quantum physics, global celebrity gossip, foreign country politics, video games, movie plots, baking recipes, mathematics problems, random foreign news):
   - You MUST POLITELY AND RESPECTFULLY DECLINE to answer off-topic queries, clearly stating that you are dedicated solely to WCC and Jhalokathi.
   - Example polite decline in Bengali:
     "আমি উই ক্যান চেঞ্জ (WCC) এবং ঝালকাঠি জেলার জন্য নিবেদিত এআই সহকারী। আমি শুধুমাত্র WCC-এর কার্যক্রম (যেমন: ৫টি উইং, ফ্রি স্বাস্থ্য ক্যাম্প, ব্লাড ব্যাংক, শিক্ষা ও আইটি কোর্স, আসন্ন ইভেন্ট) এবং ঝালকাঠি জেলা সংক্রান্ত তথ্যের উত্তর দিতে পারি। WCC বা ঝালকাঠি নিয়ে আপনার কোনো জিজ্ঞাসা থাকলে সানন্দে জানান!"
   - Example polite decline in English:
     "I am the dedicated AI Assistant for We Can Change (WCC) and Jhalokathi District. I only answer inquiries related to WCC initiatives, our 5 wings, health camps, blood bank, upcoming events, and Jhalokathi district. Please feel free to ask anything about WCC or Jhalokathi!"

3. INTERNAL MARKDOWN LINKS (Include where appropriate):
   - Health Wing: [স্বাস্থ্য উইং](/wings/health)
   - Education Wing: [শিক্ষা উইং](/wings/education)
   - Sports Wing: [খেলাধুলা উইং](/wings/sports)
   - Cultural Wing: [সংস্কৃতি উইং](/wings/cultural)
   - Environment Wing: [পরিবেশ উইং](/wings/environment)
   - Register / Membership: [রেজিস্ট্রেশন করুন](/register)
   - Events: [আসন্ন ইভেন্টসমূহ](/events)
   - Vision & Mission: [ভিশন ও মিশন](/vision-mission)

LIVE WCC PLATFORM CONTEXT:
- Upcoming & Recent Events:
${liveData.events.map(e => `  * ${e.title} (${e.date ? new Date(e.date).toLocaleDateString('bn-BD') : 'TBA'}) at ${e.location}`).join('\n') || '  * নিয়মিত সামাজিক ও মানবিক কার্যক্রম'}
- Ongoing Health Camps:
${liveData.camps.map(c => `  * ${c.title} at ${c.venue || c.location}`).join('\n') || '  * ঝালকাঠি সদর ফ্রি মেডিকেল ও চক্ষু শিবির'}
- Active Programs:
${liveData.programs.map(p => `  * ${p.title}`).join('\n') || '  * বিনামূল্যে স্বাস্থ্যসেবা, যুব আইটি বুটক্যাম্প, বৃক্ষরোপণ'}`;

        const contents = [];
        // Add past conversation turns for multi-turn dialogue context
        if (Array.isArray(conversationHistory)) {
          conversationHistory.slice(-6).forEach(item => {
            if (item.sender === 'user' && item.text) {
              contents.push({ role: 'user', parts: [{ text: item.text }] });
            } else if (item.sender === 'bot' && item.text) {
              contents.push({ role: 'model', parts: [{ text: item.text }] });
            }
          });
        }
        // Current user message
        contents.push({ role: 'user', parts: [{ text: trimmedMessage }] });

        const geminiResult = await callGemini(apiKey, systemPrompt, contents);
        if (geminiResult && geminiResult.text) {
          return NextResponse.json({
            reply: geminiResult.text,
            model: geminiResult.model,
            poweredBy: 'gemini'
          });
        }
      } catch (geminiError) {
        console.error('Gemini API call failed:', geminiError.message);
      }
    } else {
      console.warn('GEMINI_API_KEY is not set in environment. Falling back to local smart engine.');
    }

    // 3. Smart Local Knowledge Engine fallback (Fast, reliable if API key has issues)
    const reply = generateSmartWccResponse(trimmedMessage, liveData);
    return NextResponse.json({
      reply,
      poweredBy: 'local-smart-engine'
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI chat request' },
      { status: 500 }
    );
  }
}

