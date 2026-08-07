/**
 * UDANPATH - Coaching & Course Recommendation Database
 * Multi-dimensional rankings based on success rates, faculty quality, student reviews, affordability, and mentorship.
 */

const COACHING_DATABASE = {
  onlineCourses: [
    {
      id: "pw-gate-parakram",
      name: "GATE 2026 Parakram Batch (Computer Science / IT)",
      institute: "Physics Wallah (PW)",
      price: "₹4,999",
      duration: "12 Months",
      language: "Hinglish / English",
      rating: 4.8,
      successRate: "34.5%",
      pros: ["Comprehensive DPPs & Test Series", "Live & Recorded Classes", "Highly Affordable"],
      cons: ["High student volume in live chat"],
      officialWebsite: "https://pw.live",
      discounts: "Use Code UDANPATH10 for 10% Extra Off"
    },
    {
      id: "drishti-upsc-pre-mains",
      name: "UPSC CSE Foundation Foundation Batch 2026",
      institute: "Drishti IAS",
      price: "₹65,000",
      duration: "18 Months",
      language: "Hindi / English",
      rating: 4.9,
      successRate: "28.2%",
      pros: ["Top-tier Faculty (Vikas Divyakirti Sir)", "Exhaustive Study Material", "Dedicated Mains Answer Writing"],
      cons: ["Premium price point"],
      officialWebsite: "https://drishtiias.com",
      discounts: "Up to ₹5,000 Scholarship via Drishti Test"
    },
    {
      id: "unacademy-ssc-cgl-plus",
      name: "SSC CGL 2025-26 All-Star Target Batch",
      institute: "Unacademy",
      price: "₹3,499 / yr",
      duration: "12 Months Subscription",
      language: "Hinglish",
      rating: 4.7,
      successRate: "31.0%",
      pros: ["Access to all SSC educators (Gagan Pratap, Remo Sir)", "Unlimited Mock Tests"],
      cons: ["Self-discipline required for subscription model"],
      officialWebsite: "https://unacademy.com",
      discounts: "Use Code UNACADEMY20 for 20% Off"
    },
    {
      id: "adda247-bank-mahapack",
      name: "Bank MahaPack (IBPS PO, SBI PO, RRB)",
      institute: "Adda247",
      price: "₹4,599",
      duration: "12 Months",
      language: "English / Hindi",
      rating: 4.7,
      successRate: "33.8%",
      pros: ["Covers all Banking & Insurance exams", "Live Doubt Support", "Daily E-books & Quizzes"],
      cons: ["Fast-paced lectures"],
      officialWebsite: "https://adda247.com",
      discounts: "Flat 77% Off Active"
    }
  ],
  offlineInstitutes: [
    {
      id: "made-easy-delhi",
      name: "MADE EASY Classroom Program (GATE + ESE)",
      institute: "MADE EASY (Kalu Sarai, New Delhi)",
      city: "New Delhi / Hyderabad",
      price: "₹88,000",
      rating: 4.9,
      successRate: "42.0%",
      pros: ["Undisputed #1 in GATE & ESE Ranks", "Rigorous Test Series", "Experienced IISC/IITian Faculty"],
      cons: ["Intense 8-hour daily schedule"],
      officialWebsite: "https://madeeasy.in"
    },
    {
      id: "vision-ias-delhi",
      name: "Vision IAS General Studies Classroom Program",
      institute: "Vision IAS (Rajendra Nagar, New Delhi)",
      city: "New Delhi / Jaipur / Pune",
      price: "₹1,45,000",
      rating: 4.8,
      successRate: "35.4%",
      pros: ["Best Mains Test Series in India", "Personal Mentorship", "Updated Monthly Current Affairs"],
      cons: ["High batch strength"],
      officialWebsite: "https://visionias.in"
    },
    {
      id: "allen-kota-jee-neet",
      name: "ALLEN Career Institute Classroom Program",
      institute: "ALLEN (Kota, Rajasthan)",
      city: "Kota / Ahmedabad / Delhi",
      price: "₹1,35,000",
      rating: 4.9,
      successRate: "39.8%",
      pros: ["Unmatched Competitive Environment", "Periodic National Rank Tests", "Doubt Counters"],
      cons: ["Relocating to Kota required"],
      officialWebsite: "https://allen.ac.in"
    }
  ],
  youtubeChannels: [
    { name: "Physics Wallah - Alakh Pandey", examCategory: "JEE / NEET / GATE", subscribers: "12.4M", freeQuality: "5/5 Star", channelUrl: "https://youtube.com/@PhysicsWallah" },
    { name: "Drishti IAS", examCategory: "UPSC CSE / State PSC", subscribers: "11.2M", freeQuality: "5/5 Star", channelUrl: "https://youtube.com/@DrishtiIASvideos" },
    { name: "Gagan Pratap Maths", examCategory: "SSC CGL / Railways", subscribers: "4.8M", freeQuality: "4.9/5 Star", channelUrl: "https://youtube.com/@GaganPratapMaths" },
    { name: "Gate Smashers", examCategory: "GATE CS / IT / University Exams", subscribers: "1.6M", freeQuality: "5/5 Star", channelUrl: "https://youtube.com/@GateSmashers" },
    { name: "Unacademy Computer Science", examCategory: "GATE CS / ISRO / BARC", subscribers: "850K", freeQuality: "4.8/5 Star", channelUrl: "https://youtube.com/@UnacademyComputerScience" }
  ],
  topBooks: [
    { title: "Indian Polity (7th Edition)", author: "M. Laxmikanth", subject: "General Studies / UPSC", recommendedFor: "UPSC CSE, State PSC, SSC CGL", amazonRating: "4.8/5" },
    { title: "Quantitative Aptitude for Competitive Examinations", author: "R.S. Aggarwal", subject: "Maths / Aptitude", recommendedFor: "SSC CGL, IBPS PO, RRB NTPC, Campus Placements", amazonRating: "4.7/5" },
    { title: "GATE Computer Science & IT (2026 Edition)", author: "MADE EASY Publications", subject: "CS Core Subjects", recommendedFor: "GATE CS, ISRO Scientist, DRDO, BARC", amazonRating: "4.9/5" },
    { title: "Concepts of Physics (Vol 1 & 2)", author: "H.C. Verma", subject: "Physics", recommendedFor: "JEE Main, JEE Advanced, NEET UG", amazonRating: "4.9/5" }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COACHING_DATABASE };
}
