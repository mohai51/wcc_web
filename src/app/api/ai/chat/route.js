import { NextResponse } from 'next/server';

// Strict knowledge base & intelligent retrieval fallback for We Can Change (WCC)
// Ensures 100% reliable, zero-latency answers even if external AI APIs have rate limits or network issues.

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

// Check if user's question is asking about non-WCC things or financial/money sensitive topics
function checkGuardrailViolations(question) {
  const q = (question || '').toLowerCase().trim();

  // 1. Sensitive money / finance / fund theft / banking / account secrets
  const sensitiveMoneyPatterns = [
    'টাকা দাও', 'টাকা লাগবে', 'ধার দাও', 'টাকা পাঠান', 'টাকা চুরি', 'কত টাকা আছে একাউন্টে',
    'ব্যাংক একাউন্ট', 'ব্যাংক ব্যালেন্স', 'ভল্ট', 'পাসওয়ার্ড', 'টাকা দিন', 'টাকা পাঠান বিকাশ',
    'send money', 'give me money', 'bank balance', 'how much money in wcc account',
    'vault code', 'account balance', 'give money', 'lend me money', 'financial account password',
    'bank details secret', 'atm pin', 'steal fund'
  ];

  for (const pattern of sensitiveMoneyPatterns) {
    if (q.includes(pattern)) {
      return {
        violated: true,
        reason: 'money',
        responseBn: 'দুঃখিত (Sorry), আমি শুধুমাত্র উই ক্যান চেঞ্জ (WCC) সম্পর্কিত সাধারণ তথ্য ও কার্যক্রমের সহায়তা করতে পারি। কোনো আর্থিক লেনদেন, ব্যক্তিগত টাকার অনুরোধ বা গোপন ব্যাংক/অ্যাকাউন্ট সম্পর্কিত তথ্য প্রদান করা সম্ভব নয়।',
        responseEn: 'Sorry, I am the official AI Assistant for We Can Change (WCC). I cannot assist with personal money requests, financial fund transactions, or confidential banking/account details.'
      };
    }
  }

  // 2. Off-topic topics strictly outside WCC: general coding, science, movies, politics, external celebrities, personal advice
  const offTopicPatterns = [
    'python code', 'write code', 'javascript code', 'html code', 'react code',
    'who is messi', 'who is ronaldo', 'cricket score', 'solve equation', 'x + y =',
    'capital of', 'who is president', 'prime minister of', 'weather in',
    'tell me a joke', 'write a poem about love', 'recipe', 'cooking',
    'কোডিং', 'পাইথন কি', 'জাভাস্ক্রিপ্ট কি', 'গণিত সমাধান', 'রান্নার রেসিপি',
    'মেসি কে', 'রোনালদো কে', 'বাংলাদেশের প্রধানমন্ত্রী কে', 'আমেরিকার প্রেসিডেন্ট কে'
  ];

  for (const pattern of offTopicPatterns) {
    if (q.includes(pattern)) {
      return {
        violated: true,
        reason: 'offtopic',
        responseBn: 'দুঃখিত (Sorry), আমি শুধুমাত্র উই ক্যান চেঞ্জ (WCC)-এর কার্যক্রম, উইং, স্বাস্থ্য ক্যাম্প, রক্তদান, শিক্ষা কোর্স, আসন্ন ইভেন্ট ও মেম্বারশিপ সম্পর্কিত প্রশ্নের উত্তর দিতে পারি। WCC-এর বাইরের কোনো বিষয়ের উত্তর দেওয়ার অনুমতি আমার নেই। WCC সম্পর্কে আপনার কোনো প্রশ্ন থাকলে বলুন!',
        responseEn: 'Sorry, I am strictly programmed to answer questions directly related to We Can Change (WCC), its 5 wings, health camps, blood bank, education courses, and upcoming events. I cannot answer queries outside WCC. How may I assist you with WCC today?'
      };
    }
  }

  return { violated: false };
}

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

// Built-in intelligent response generator if Gemini API key is missing or fails
function generateSmartWccResponse(userQuestion, liveData) {
  const q = userQuestion.toLowerCase();

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
    return `🩺 **উই ক্যান চেঞ্জ স্বাস্থ্য উইং (Health Wing):**\n\nস্বাস্থ্য উইং ঝালকাঠি জেলায় বিনামূল্যে বিশেষজ্ঞ ডাক্তার সেবা, ফ্রি ওষুধ বিতরণ ও জরুরি রক্তদান সহায়তা প্রদান করে।\n\n১. **ইমার্জেন্সি ব্লাড ব্যাংক:** ঝালকাঠির রক্তের গ্রুপভিত্তিক ডোনার তালিকা ও ডিরেক্ট কল সুবিধা।\n২. **ফ্রি মেডিকেল ও চক্ষু ক্যাম্প:** বিশেষজ্ঞ ডাক্তারদের নিয়মিত ক্যাম্প।${campInfo}\n৩. **হাসপাতাল ইমার্জেন্সি সেল:** জরুরি রোগী পরিবহন ও সাপোর্ট।\n\n👉 সরাসরি স্বাস্থ্য সেবা পেতে ভিজিট করুন: [স্বাস্থ্য উইং পোর্টাল](/wings/health)`;
  }

  // Education / Courses
  if (q.includes('শিক্ষা') || q.includes('education') || q.includes('কোর্স') || q.includes('বই') || q.includes('কম্পিউটার') || q.includes('ফ্রিল্যান্সিং') || q.includes('course')) {
    return `📚 **উই ক্যান চেঞ্জ শিক্ষা উইং (Education Wing):**\n\nশিক্ষা উইং সুবিধাবঞ্চিত শিক্ষার্থীদের ঝরে পড়া রোধ, বই সহায়তা এবং তরুণদের বিনামূল্যে ফ্রিল্যান্সিং ও আইটি প্রশিক্ষণ প্রদান করে।\n\n• **ফ্রি ডিজিটাল আইটি ও কম্পিউটার কোর্স:** গ্রাফিক্স, ওয়েব ও ফ্রিল্যান্সিং গাইডলাইন।\n• **বই উৎসব ও শিক্ষা উপকরণ বিতরণ:** দরিদ্র মেধাবী শিক্ষার্থীদের জন্য সহায়তা।\n\n👉 বিস্তারিত জানতে ও কোর্সে যুক্ত হতে ভিজিট করুন: [শিক্ষা উইং পোর্টাল](/wings/education)`;
  }

  // Membership / Registration / Volunteer
  if (q.includes('মেম্বার') || q.includes('সদস্য') || q.includes('member') || q.includes('volunteer') || q.includes('ভলান্টিয়ার') || q.includes('জয়েন') || q.includes('যোগদান') || q.includes('registration') || q.includes('রেজিস্ট্রেশন')) {
    return `🤝 **উই ক্যান চেঞ্জ (WCC)-এর মেম্বার বা ভলান্টিয়ার হওয়ার নিয়ম:**\n\nআপনি খুব সহজেই আমাদের সাথে যুক্ত হয়ে সমাজের জন্য কাজ করতে পারেন:\n১. আমাদের রেজিস্ট্রেশন পেজে যান: [অনলাইন রেজিস্ট্রেশন](/register)\n২. আপনার নাম, ইমেইল, মোবাইল ও পছন্দের উইং নির্বাচন করে ফর্ম পূরণ করুন (মাত্র ২ মিনিট সময় লাগে)।\n৩. রেজিস্ট্রেশন সম্পন্ন হলে আপনার নিজস্ব মেম্বার ড্যাশবোর্ড ও ডিজিটাল মেম্বারশিপ কার্ড পাবেন।\n\n👉 এখনই যুক্ত হোন: [এখানে ক্লিক করে নিবন্ধন করুন](/register)`;
  }

  // Sports Wing
  if (q.includes('খেলাধুলা') || q.includes('sports') || q.includes('ফুটবল') || q.includes('ক্রিকেট') || q.includes('টুর্নামেন্ট')) {
    return `⚽ **উই ক্যান চেঞ্জ খেলাধুলা উইং (Sports Wing):**\n\nযুব সমাজকে সুস্থ রাখতে আন্তঃউপজেলা ফুটবল ও ক্রিকেট টুর্নামেন্ট, মেয়েদের সেলফ ডিফেন্স প্রশিক্ষণ এবং স্থানীয় ক্রীড়াবিদদের সহায়তা করে।\n\n👉 বিস্তারিত দেখুন: [খেলাধুলা উইং](/wings/sports)`;
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

  // General Intro about WCC
  return `স্বাগতম! আমি **উই ক্যান চেঞ্জ (WCC)** এর অফিসিয়াল এআই সহকারী।\n\nউই ক্যান চেঞ্জ ঝালকাঠি জেলা ভিত্তিক একটি মানবিক, যুবনির্ভর সামাজিক সংগঠন। আমরা ৫টি উইং (স্বাস্থ্য, শিক্ষা, খেলাধুলা, সংস্কৃতি ও পরিবেশ)-এর মাধ্যমে তৃণমূল পর্যায়ে বিভিন্ন উন্নয়নমূলক ও জনকল্যাণমূলক কর্মকাণ্ড পরিচালনা করছি।\n\nআপনি আমাকে উই ক্যান চেঞ্জের যে কোনো বিষয় যেমন: **আসন্ন ইভেন্টসমূহ, ফ্রি স্বাস্থ্য ক্যাম্প, ব্লাড ব্যাংক ও ডোনার খোঁজা, শিক্ষা কোর্স, অথবা কীভাবে মেম্বার/ভলান্টিয়ার হবেন** সে সম্পর্কে প্রশ্ন করতে পারেন। কীভাবে সাহায্য করতে পারি?`;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const trimmedMessage = message.trim();

    // 1. Enforce strict Guardrails (Block off-topic and money/vault questions)
    const guardrail = checkGuardrailViolations(trimmedMessage);
    if (guardrail.violated) {
      return NextResponse.json({
        reply: guardrail.responseBn,
        guardrailBlocked: true,
        guardrailReason: guardrail.reason
      });
    }

    // 2. Fetch live WCC context (Events, Camps, Wings, Programs)
    const liveData = await fetchLiveWccContext();

    // 3. Check for Google Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const systemPrompt = `You are the official AI Assistant for "We Can Change (WCC)" (উই ক্যান চেঞ্জ), a youth-led social impact organization operating in Jhalokathi, Bangladesh.

STRICT INSTRUCTIONS:
1. ONLY answer questions directly related to WCC, its 5 wings (Health, Education, Sports, Cultural, Environment), upcoming events, health camps, blood bank, member registration, and volunteer initiatives.
2. If asked about ANYTHING outside WCC (e.g. general coding, mathematics, world politics, cinema, personal dating, science, etc.) OR asked about sensitive money/banking transactions (e.g. asking for personal money, bank account balances, vault passcodes, fund theft):
   YOU MUST REFUSE AND SAY: "Sorry, I am the official AI Assistant for We Can Change (WCC). I can only answer questions related to WCC activities, wings, camps, and upcoming events. / দুঃখিত (Sorry), আমি শুধুমাত্র উই ক্যান চেঞ্জ (WCC) সম্পর্কিত তথ্যের উত্তর দিতে পারি।"
3. Always maintain a warm, welcoming, respectful, and helpful tone.
4. Reply primarily in clear, natural Bengali (বাংলা), unless the user specifically asks in English.
5. Provide relevant internal website links in markdown format where applicable:
   - Health Wing: [স্বাস্থ্য উইং](/wings/health)
   - Education Wing: [শিক্ষা উইং](/wings/education)
   - Sports Wing: [খেলাধুলা উইং](/wings/sports)
   - Cultural Wing: [সংস্কৃতি উইং](/wings/cultural)
   - Environment Wing: [পরিবেশ উইং](/wings/environment)
   - Register / Membership: [রেজিস্ট্রেশন](/register)
   - Events: [ইভেন্টসমূহ](/events)

LIVE ORGANIZATIONAL DATA:
- 5 Wings: Health (Leader: Dr. Mostafizur / Health Coordinator), Education (Leader: Tanvir Ahmed Chowdhury), Sports, Cultural, Environment.
- Upcoming & Recent Events:
${liveData.events.map(e => `  * ${e.title} (${e.date ? new Date(e.date).toLocaleDateString('bn-BD') : 'TBA'}) at ${e.location}`).join('\n') || '  * নিয়মিত সামাজিক ও মানবিক কার্যক্রম'}
- Ongoing Health Camps:
${liveData.camps.map(c => `  * ${c.title} at ${c.venue || c.location}`).join('\n') || '  * ঝালকাঠি সদর ফ্রি মেডিকেল ও চক্ষু শিবির'}
- Active Programs:
${liveData.programs.map(p => `  * ${p.title}`).join('\n') || '  * বিনামূল্যে স্বাস্থ্যসেবা, যুব আইটি বুটক্যাম্প, বৃক্ষরোপণ'}`;

        const contents = [];
        // Add past conversation turns
        if (Array.isArray(conversationHistory)) {
          conversationHistory.slice(-4).forEach(item => {
            if (item.sender === 'user') {
              contents.push({ role: 'user', parts: [{ text: item.text }] });
            } else if (item.sender === 'bot') {
              contents.push({ role: 'model', parts: [{ text: item.text }] });
            }
          });
        }
        // Current user message
        contents.push({ role: 'user', parts: [{ text: trimmedMessage }] });

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 600
              }
            })
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return NextResponse.json({ reply: generatedText });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to smart WCC knowledge generator:', geminiError.message);
      }
    }

    // 4. Smart Local Knowledge Engine fallback (Fast, 100% reliable, zero external dependency)
    const reply = generateSmartWccResponse(trimmedMessage, liveData);
    return NextResponse.json({ reply });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI chat request' },
      { status: 500 }
    );
  }
}
