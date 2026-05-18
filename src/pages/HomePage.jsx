import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import teamService from '../services/teamService';

const Icon = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={d} /></svg>
);

// Safe image component: shows SVG fallback when image fails to load
const SafeImg = ({ src, alt, className, fallbackIcon, fallbackClass }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    if (fallbackIcon) {
      return (
        <div className={fallbackClass || className}>
          <Icon d={fallbackIcon} className="w-full h-full p-1" />
        </div>
      );
    }
    return null;
  }
  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
};

const ICON_MAP = {
  code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  rocket: 'M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m0 0a14.926 14.926 0 01-5.96-5.96',
  lightbulb: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  trophy: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  globe: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  zap: 'M13 10V3L4 14h7v7l9-11h-7z',
  target: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  cpu: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
  layers: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  terminal: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 last:border-0 overflow-hidden bg-white">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-6 flex items-center justify-between text-left focus:outline-none group px-4">
        <span className={`text-lg font-semibold tracking-tight transition-all duration-300 ${isOpen ? 'text-primary-600' : 'text-slate-700 group-hover:text-primary-600'}`}>{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary-50 text-primary-600 rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600'}`}>
          <Icon d="M19 9l-7 7-7-7" className="w-4 h-4" />
        </div>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out px-4 ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-600 leading-relaxed max-w-4xl font-medium">{answer}</p>
      </div>
    </div>
  );
};

const TermsPrivacyModal = ({ activeModal, onClose, config }) => {
  if (!activeModal) return null;

  const isTerms = activeModal === 'terms';
  const c = config || {};
  const orgName = c.name || 'TCE Hackathon';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 flex flex-col max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
          <div>
            <div className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-[#004b9b] text-xs font-bold uppercase tracking-wider mb-1.5">
              {isTerms ? 'Legal Information' : 'Privacy & Data'}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isTerms ? 'Terms of Service & Conditions' : 'Privacy Policy'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <Icon d="M6 18L18 6M6 6l12 12" className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto space-y-8 text-slate-600 leading-relaxed text-sm">
          {isTerms ? (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#004b9b] flex items-center justify-center text-xs font-bold">1</span>
                  Acceptance of Terms
                </h3>
                <p className="pl-8 text-slate-600">
                  By accessing, registering for, or participating in the {orgName} platform powered by Ethnotech Academy, you agree to be bound by these Terms of Service, all applicable laws, and regulations. If you do not agree with any part of these terms, you are prohibited from using or accessing this platform.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#004b9b] flex items-center justify-center text-xs font-bold">2</span>
                  Eligibility & Registration
                </h3>
                <p className="pl-8 text-slate-600">
                  Participation is open to eligible students and professionals as outlined in the official event guidelines. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#004b9b] flex items-center justify-center text-xs font-bold">3</span>
                  Code of Conduct & Ethics
                </h3>
                <p className="pl-8 text-slate-600">
                  Participants are expected to conduct themselves with the highest standards of integrity, professionalism, and respect. Any form of harassment, discrimination, disruptive behavior, or academic dishonesty—including plagiarism or unauthorized use of third-party code—will result in immediate disqualification and account termination.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#004b9b] flex items-center justify-center text-xs font-bold">4</span>
                  Intellectual Property Rights
                </h3>
                <p className="pl-8 text-slate-600">
                  All intellectual property rights in the projects, source code, and materials developed during the hackathon remain the exclusive property of the respective creator teams, unless explicitly stated otherwise under specific sponsor track agreements. You grant {orgName} and Ethnotech Academy a non-exclusive, royalty-free license to showcase project descriptions, team names, and presentation media for promotional and archival purposes.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#004b9b] flex items-center justify-center text-xs font-bold">5</span>
                  Platform Integrity & Security
                </h3>
                <p className="pl-8 text-slate-600">
                  The assessment and hackathon platform is provided on an "as is" and "as available" basis. Attempting to probe, scan, test the vulnerability of the system, breach security measures, or engage in automated scraping or reverse engineering of the assessment algorithms is strictly prohibited.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#004b9b] flex items-center justify-center text-xs font-bold">6</span>
                  Limitation of Liability
                </h3>
                <p className="pl-8 text-slate-600">
                  In no event shall {orgName}, TCE College, Ethnotech Academy, or its partners be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your participation in the event or inability to use the platform.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#004b9b] flex items-center justify-center text-xs font-bold">1</span>
                  Information We Collect
                </h3>
                <p className="pl-8 text-slate-600">
                  We collect personal identification information during the registration and team formation process. This includes, but is not limited to, your full name, email address, phone number, institutional affiliation (such as University/College USN or Roll Number), academic details, and assessment performance metrics.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#004b9b] flex items-center justify-center text-xs font-bold">2</span>
                  How We Use Your Information
                </h3>
                <p className="pl-8 text-slate-600">
                  The data we collect is used strictly to facilitate the hackathon lifecycle. This includes verifying participant eligibility, managing team structures, administering online coding assessments, sending critical event notifications, providing technical support, and awarding certificates and prizes.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#004b9b] flex items-center justify-center text-xs font-bold">3</span>
                  Data Protection & Security Measures
                </h3>
                <p className="pl-8 text-slate-600">
                  We adopt robust data collection, storage, and processing practices alongside industry-standard security measures. We utilize secure socket layer (SSL) encryption and advanced server safeguards to protect your personal information, username, password, and transaction data against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#004b9b] flex items-center justify-center text-xs font-bold">4</span>
                  Sharing of Personal Information
                </h3>
                <p className="pl-8 text-slate-600">
                  We do not sell, trade, or rent participant personal identification information to outside third parties. We may share generic aggregated demographic information not linked to any personal identification information with our business partners. Necessary participant data may be shared with official event judges, mentors, and sponsoring organizations solely for evaluation, mentoring, and award fulfillment purposes.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#004b9b] flex items-center justify-center text-xs font-bold">5</span>
                  Cookies & Session Tracking
                </h3>
                <p className="pl-8 text-slate-600">
                  Our platform utilizes essential cookies and session tokens to maintain user authentication, preserve assessment states, and ensure seamless navigation across the portal. You may choose to set your web browser to refuse cookies; however, doing spiral may prevent certain core functionalities of the platform from operating correctly.
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#004b9b] flex items-center justify-center text-xs font-bold">6</span>
                  Your Rights & Data Control
                </h3>
                <p className="pl-8 text-slate-600">
                  You have the right to access, review, update, or request the deletion of your personal information maintained on our platform. If you wish to exercise any of these rights or have inquiries regarding our data privacy practices, please contact our administrative support team.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between sticky bottom-0 z-10 backdrop-blur-sm">
          <div className="text-xs text-slate-500 font-medium">
            Last updated: May 2026 • Ethnotech Academy
          </div>
          <button 
            onClick={onClose}
            className="h-10 px-6 rounded-lg bg-[#004b9b] text-white font-medium text-sm flex items-center justify-center hover:bg-[#003d80] transition-colors shadow-sm cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  useEffect(() => {
    teamService.getHackathonInfo()
      .then(res => { setConfig(res.data.data.config); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080d] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const c = config || {};
  const lp = c.landingPage || {};

  const defaultFaqs = [
    { question: "Who can participate?", answer: c.fee?.isFree === false ? `Registration fee: ₹${c.fee?.amount}. ${c.fee?.paymentInstructions || ''}` : "It's absolutely FREE! No registration charges." },
    { question: "What is the team size?", answer: `Teams: ${c.teamSettings?.minSize || 2}–${c.teamSettings?.maxSize || 5} members.` },
    { question: "Is it online or offline?", answer: `${c.mode || 'offline'} format at ${c.venue?.collegeName || 'TBA'}.` },
  ];
  const faqs = lp.faqs?.length > 0 ? lp.faqs : defaultFaqs;
  const features = lp.features || [];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-primary-500/20 selection:text-primary-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {c.logoUrl ? (
              <SafeImg src={c.logoUrl} alt="Logo" className="w-8 h-8 object-contain" fallbackIcon={ICON_MAP.zap} fallbackClass="w-8 h-8 text-primary-600" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center"><Icon d={ICON_MAP.zap} className="w-5 h-5" /></div>
            )}
            <span className="text-xl font-bold tracking-tight text-slate-900">{c.name || 'TCE Hackathon'}</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors hidden md:block">About</a>
            {(lp.showFeatures !== false) && <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors hidden md:block">Features</a>}
            {(lp.showFAQ !== false) && <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors hidden md:block">FAQ</a>}
            <Link to="/team/login" className="h-10 px-6 rounded-lg bg-[#004b9b] text-white font-medium text-sm flex items-center justify-center hover:bg-[#003d80] transition-all active:scale-95 shadow-sm">Portal Login &rarr;</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 bg-[#F8F9FA] overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="z-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-wider text-primary-700 mb-8">
              <Icon d="M13 10V3L4 14h7v7l9-11h-7z" className="w-3 h-3" />
              {c.tagline || 'CODE. CREATE. CONQUER.'}
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-slate-900 leading-[1.1]">
              {lp.heroTitle || 'Collaborating for'}<br />
              <span className="text-[#004b9b]">{lp.heroSubtitle || 'Educational Excellence'}</span>
            </h1>

            <p className="text-lg text-slate-600 mb-10 max-w-xl font-normal leading-relaxed">
              {lp.heroDescription || c.description || 'Annual hackathon organized by TCE College, Gadag in collaboration with Ethnotech. 50 hours of programming followed by an exciting hackathon challenge!'}
            </p>

            <div className="flex gap-4 items-center flex-wrap">
              <Link to="/team/login" className="h-12 px-8 rounded-lg bg-[#004b9b] text-white font-medium text-base flex items-center justify-center hover:bg-[#003d80] transition-colors shadow-sm">
                {lp.ctaPrimaryText || 'Take Assessment'} &rarr;
              </Link>
              <a href="#about" className="h-12 px-8 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-base flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
                {lp.ctaSecondaryText || 'View Details'}
              </a>
            </div>

            {lp.stats && lp.stats.length > 0 && (
              <div className="mt-12 flex items-center gap-6 text-sm font-medium text-slate-500 flex-wrap">
                {lp.stats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div><span className="text-slate-900 font-bold">{stat.value}</span> {stat.label}</div>
                    {i < lp.stats.length - 1 && <div className="h-4 w-px bg-slate-300"></div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-blue-100 rounded-[2.5rem] transform translate-x-4 translate-y-4"></div>
            <div className="relative w-full h-[500px] rounded-[2.5rem] shadow-xl border-4 border-white overflow-hidden">
              {c.bannerUrl ? (
                <SafeImg src={c.bannerUrl} alt="Hero Banner" className="w-full h-full object-cover" />
              ) : null}
              {/* Always show gradient overlay with icons as visual fallback */}
              <div className={`${c.bannerUrl ? 'hidden' : 'flex'} absolute inset-0 bg-gradient-to-br from-[#4F46E5] to-[#2563EB] flex-col items-center justify-center text-white`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="grid grid-cols-4 gap-8 p-12 opacity-40">
                    {[ICON_MAP.code, ICON_MAP.cpu, ICON_MAP.terminal, ICON_MAP.zap, ICON_MAP.globe, ICON_MAP.shield, ICON_MAP.lightbulb, ICON_MAP.rocket].map((d, i) => (
                      <Icon key={i} d={d} className="w-16 h-16" />
                    ))}
                  </div>
                </div>
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-6">
                    <Icon d={ICON_MAP.code} className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold">Innovation Awaits</h3>
                  <p className="text-blue-200 mt-2 text-sm">Build • Ship • Scale</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { val: c.teamSettings?.maxSize || 5, label: 'Max Team Size' },
            { val: lp.sprintDuration || '24h', label: 'Duration' },
            { val: c.mode === 'online' ? 'Online' : 'On-Site', label: 'Mode' },
            { val: c.prizes?.length || 3, label: 'Prizes' },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">{s.val}</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-widest">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-5 tracking-tight">{lp.aboutTitle || 'About The Hackathon'}</h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              {lp.aboutDescription || `${c.name || 'TCE Hackathon'} brings together the sharpest minds to push the boundaries of what's possible. Build robust applications, automate workflows, and design scalable architectures. Powered by Ethnotech.`}
            </p>
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4 text-sm text-slate-600">
                <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 text-primary-600 flex-shrink-0">
                  <Icon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Venue</div>
                  <div className="text-slate-500 mt-1">{lp.venueName || c.venue?.collegeName || 'TCE College'}</div>
                  <div className="text-slate-500">{lp.venueAddress || c.venue?.address || 'Gadag, Karnataka'}</div>
                </div>
              </div>
              <div className="flex items-start gap-4 text-sm text-slate-600">
                <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 text-primary-600 flex-shrink-0">
                  <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Schedule</div>
                  <div className="text-slate-500 mt-1">{lp.scheduleDate ? `${lp.scheduleDate}${lp.scheduleTime ? ` • ${lp.scheduleTime}` : ''}` : c.startDate ? new Date(c.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'To be announced'}</div>
                </div>
              </div>
              {(lp.contactEmail || lp.contactPhone) && (
                <div className="flex items-start gap-4 text-sm text-slate-600">
                  <div className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center bg-slate-50 text-primary-600 flex-shrink-0">
                    <Icon d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Contact</div>
                    {lp.contactEmail && <div className="text-slate-500 mt-1">{lp.contactEmail}</div>}
                    {lp.contactPhone && <div className="text-slate-500">{lp.contactPhone}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Social links card */}
          <div className="space-y-6">
            {c.socialLinks && Object.values(c.socialLinks).some(v => v) && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Connect</h3>
                <div className="flex flex-wrap gap-3">
                  {c.socialLinks.website && <a href={c.socialLinks.website} target="_blank" rel="noopener noreferrer" className="h-10 px-4 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-sm"><Icon d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-4 h-4" />Website</a>}
                  {c.socialLinks.github && <a href={c.socialLinks.github} target="_blank" rel="noopener noreferrer" className="h-10 px-4 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-sm"><Icon d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" className="w-4 h-4" />GitHub</a>}
                  {c.socialLinks.instagram && <a href={c.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="h-10 px-4 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-sm"><Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" className="w-4 h-4" />Instagram</a>}
                  {c.socialLinks.linkedin && <a href={c.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="h-10 px-4 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 flex items-center gap-2 hover:bg-slate-100 transition-colors shadow-sm"><Icon d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" className="w-4 h-4" />LinkedIn</a>}
                </div>
              </div>
            )}
            {(lp.venueMapUrl || c.venue?.mapsLink) && (
              <a href={lp.venueMapUrl || c.venue?.mapsLink} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-slate-200 bg-white p-6 hover:bg-slate-50 transition-colors shadow-sm group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Icon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">View on Google Maps</div>
                    <div className="text-xs text-slate-500 mt-1">{lp.venueAddress || c.venue?.address || 'Get Directions'}</div>
                  </div>
                </div>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      {(lp.showFeatures !== false) && features.length > 0 && (
        <section id="features" className="py-24 px-6 bg-[#F8F9FA] relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight max-w-2xl">
                Features & Highlights
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={f._id || i} className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                    <Icon d={ICON_MAP[f.icon] || ICON_MAP.code} className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prizes */}
      {(lp.showPrizes !== false) && c.prizes?.length > 0 && (
        <section className="py-24 px-6 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Prizes & Rewards</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {c.prizes.map((prize, i) => (
                <div key={i} className={`p-8 rounded-2xl border transition-all ${i === 0 ? 'border-amber-200 bg-amber-50 shadow-md' : 'border-slate-200 bg-white shadow-sm'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{i === 0 ? '1st Place' : i === 1 ? '2nd Place' : '3rd Place'}</span>
                  </div>
                  <div className={`text-4xl font-bold mb-3 ${i === 0 ? 'text-amber-700' : 'text-slate-900'}`}>₹{prize.amount?.toLocaleString()}</div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{prize.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{prize.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sponsors */}
      {(lp.showSponsors !== false) && lp.sponsors?.length > 0 && (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-12 tracking-tight">Supported By</h2>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
              {lp.sponsors.map((s, i) => (
                <div key={s._id || i} className="group flex flex-col items-center">
                  {s.website ? (
                    <a href={s.website} target="_blank" rel="noopener noreferrer" className="block w-40 h-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                      {s.logoUrl ? <SafeImg src={s.logoUrl} alt={s.name} className="w-full h-full object-contain" fallbackIcon={ICON_MAP.layers} fallbackClass="w-full h-full flex items-center justify-center text-slate-400" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xl text-slate-400 group-hover:text-primary-600 transition-colors">{s.name}</div>}
                    </a>
                  ) : (
                    <div className="w-40 h-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                      {s.logoUrl ? <SafeImg src={s.logoUrl} alt={s.name} className="w-full h-full object-contain" fallbackIcon={ICON_MAP.layers} fallbackClass="w-full h-full flex items-center justify-center text-slate-400" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xl text-slate-400 group-hover:text-primary-600 transition-colors">{s.name}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {(lp.showFAQ !== false) && faqs.length > 0 && (
        <section id="faq" className="py-24 px-6 bg-[#F8F9FA]">
          <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">Frequently Asked Questions</h2>
            <div className="divide-y divide-slate-100 border-y border-slate-100">
              {faqs.map((faq, i) => <FAQItem key={faq._id || i} question={faq.question || faq.q} answer={faq.answer || faq.a} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-6 bg-[#004b9b] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ready to participate?
          </h2>
          <p className="text-blue-100 mb-10 max-w-2xl mx-auto font-medium text-lg">
            Registrations are closing soon. Join the challenge and showcase your skills!
          </p>
          <Link to="/team/login" className="inline-flex h-14 px-8 rounded-lg bg-white text-[#004b9b] font-bold text-base items-center justify-center hover:bg-slate-50 transition-all active:scale-95 shadow-md">
            Go to Assessment Portal &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 px-6 bg-[#0B1120] text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-6">
              {c.logoUrl ? (
                <SafeImg src={c.logoUrl} alt="Logo" className="w-8 h-8 object-contain brightness-0 invert" fallbackIcon={ICON_MAP.zap} fallbackClass="w-8 h-8 text-blue-400" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-blue-900 text-blue-400 flex items-center justify-center"><Icon d={ICON_MAP.zap} className="w-5 h-5" /></div>
              )}
              <div>
                <div className="text-xl font-bold tracking-tight text-white">{c.name || 'TCE Hackathon'}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Powered by Ethnotech</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Equipping the next generation of professionals with the skills and knowledge required to thrive in today's fast-paced global job market.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Contact</h4>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex gap-3">
                <Icon d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" className="w-5 h-5 flex-shrink-0 text-[#004b9b]" />
                <span>{lp.venueAddress || c.venue?.address || 'SK Arena Building, BDA Link Rd, Channasandra, Rajarajeshwari Nagar, Bengaluru, Karnataka 560098'}</span>
              </div>
              <div className="flex gap-3">
                <Icon d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" className="w-5 h-5 flex-shrink-0 text-[#004b9b]" />
                <span>{lp.contactEmail || 'info@tcehack.in'}</span>
              </div>
            </div>

            {c.socialLinks && (c.socialLinks.instagram || c.socialLinks.linkedin || c.socialLinks.youtube) && (
              <>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-8 mb-4">Connect With Us</h4>
                <div className="flex gap-3">
                  {c.socialLinks.instagram && (
                    <a href={c.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors" title="Instagram">
                      <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" className="w-5 h-5" />
                    </a>
                  )}
                  {c.socialLinks.youtube && (
                    <a href={c.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors" title="YouTube">
                      <Icon d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5" />
                    </a>
                  )}
                  {c.socialLinks.linkedin && (
                    <a href={c.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#0077b5] hover:text-white transition-colors" title="LinkedIn">
                      <Icon d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
          <div>&copy; {new Date().getFullYear()} {c.name || 'TCE Hackathon'}. All Rights Reserved.</div>
          <div className="flex gap-6 items-center">
            <button onClick={() => setActiveModal('terms')} className="bg-transparent border-none p-0 text-slate-400 hover:text-white transition-colors cursor-pointer font-medium text-xs">Terms</button>
            <button onClick={() => setActiveModal('privacy')} className="bg-transparent border-none p-0 text-slate-400 hover:text-white transition-colors cursor-pointer font-medium text-xs">Privacy</button>
            {/* <a href="/console/admin/login" className="hover:text-white transition-colors">Admin Login</a> */}
          </div>
        </div>
      </footer>

      {/* Terms & Privacy Modal */}
      <TermsPrivacyModal 
        activeModal={activeModal} 
        onClose={() => setActiveModal(null)} 
        config={config} 
      />
    </div>
  );
};

export default HomePage;
