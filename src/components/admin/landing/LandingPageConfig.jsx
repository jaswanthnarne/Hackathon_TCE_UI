import { useState, useEffect } from 'react';
import adminService from '../../../services/adminService';
import { Loader } from '../../common/Loader';
import toast from 'react-hot-toast';

const FEATURE_ICONS = ['code', 'rocket', 'lightbulb', 'trophy', 'users', 'shield', 'globe', 'zap', 'target', 'cpu', 'layers', 'terminal'];

const IconPreview = ({ icon, className = 'w-5 h-5' }) => {
  const icons = {
    code: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
    rocket: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m0 0a14.926 14.926 0 01-5.96-5.96" />,
    lightbulb: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
    trophy: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
    shield: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    globe: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    zap: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />,
    target: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    cpu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />,
    layers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
    terminal: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  };
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{icons[icon] || icons.code}</svg>;
};

const LandingPageConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  const fetchConfig = async () => {
    try {
      const { data } = await adminService.getConfig();
      if (data.data.config) setConfig(data.data.config);
    } catch { toast.error('Failed to load config'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchConfig(); }, []);

  const lp = config?.landingPage || {};
  const setLp = (key, val) => setConfig(prev => ({ ...prev, landingPage: { ...prev.landingPage, [key]: val } }));
  const setSocial = (key, val) => setConfig(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: val } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateConfig(config);
      toast.success('Landing page config saved!');
      fetchConfig();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  // Feature CRUD
  const addFeature = () => setLp('features', [...(lp.features || []), { _id: Date.now().toString(), icon: 'code', title: '', description: '' }]);
  const updateFeature = (i, field, val) => { const f = [...(lp.features || [])]; f[i] = { ...f[i], [field]: val }; setLp('features', f); };
  const removeFeature = (i) => {
    const newFeatures = (lp.features || []).filter((_, idx) => idx !== i);
    setLp('features', newFeatures);
  };

  // FAQ CRUD
  const addFaq = () => setLp('faqs', [...(lp.faqs || []), { _id: Date.now().toString(), question: '', answer: '', order: (lp.faqs?.length || 0) }]);
  const updateFaq = (i, field, val) => { const f = [...(lp.faqs || [])]; f[i] = { ...f[i], [field]: val }; setLp('faqs', f); };
  const removeFaq = (i) => {
    const newFaqs = (lp.faqs || []).filter((_, idx) => idx !== i);
    setLp('faqs', newFaqs);
  };

  // Sponsor CRUD
  const addSponsor = () => setLp('sponsors', [...(lp.sponsors || []), { _id: Date.now().toString(), name: '', logoUrl: '', website: '', tier: 'partner' }]);
  const updateSponsor = (i, field, val) => { const f = [...(lp.sponsors || [])]; f[i] = { ...f[i], [field]: val }; setLp('sponsors', f); };
  const removeSponsor = (i) => {
    const newSponsors = (lp.sponsors || []).filter((_, idx) => idx !== i);
    setLp('sponsors', newSponsors);
  };

  // Prize CRUD
  const setPrizes = (newPrizes) => setConfig(prev => ({ ...prev, prizes: newPrizes }));
  const addPrize = () => setPrizes([...(config.prizes || []), { _id: Date.now().toString(), rank: (config.prizes?.length || 0) + 1, title: '', amount: 0, description: '' }]);
  const updatePrize = (i, field, val) => { const p = [...(config.prizes || [])]; p[i] = { ...p[i], [field]: val }; setPrizes(p); };
  const removePrize = (i) => {
    const newPrizes = (config.prizes || []).filter((_, idx) => idx !== i);
    setPrizes(newPrizes);
  };

  if (loading) return <Loader text="Loading landing page config..." />;
  if (!config) return <div className="text-center p-10">No config found.</div>;

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z' },
    { id: 'about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'event', label: 'Event Details', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'prizes', label: 'Awards & Prizes', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'features', label: 'Features', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'faqs', label: 'FAQs', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'sponsors', label: 'Sponsors', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'socials', label: 'Social Links', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
    { id: 'toggles', label: 'Visibility', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Landing Page Config</h1>
          <p className="text-dark-500 dark:text-dark-400">Customize your public-facing hackathon landing page.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-100 dark:border-dark-800 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.id ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-dark-500 hover:text-dark-700 dark:text-dark-400'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} /></svg>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card p-6 md:p-8">
        {/* HERO */}
        {activeTab === 'hero' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 mb-4 border-b border-dark-100 dark:border-dark-800 pb-2">Hero Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="label">Hero Title (Line 1)</label><input type="text" className="input" value={lp.heroTitle || ''} onChange={e => setLp('heroTitle', e.target.value)} placeholder="Build the future." /></div>
              <div><label className="label">Hero Subtitle (Line 2)</label><input type="text" className="input" value={lp.heroSubtitle || ''} onChange={e => setLp('heroSubtitle', e.target.value)} placeholder="One commit at a time." /></div>
              <div className="md:col-span-2"><label className="label">Hero Description</label><textarea className="input min-h-[100px]" value={lp.heroDescription || ''} onChange={e => setLp('heroDescription', e.target.value)} placeholder="A compelling description..." /></div>
              <div><label className="label">Primary CTA Text</label><input type="text" className="input" value={lp.ctaPrimaryText || ''} onChange={e => setLp('ctaPrimaryText', e.target.value)} /></div>
              <div><label className="label">Secondary CTA Text</label><input type="text" className="input" value={lp.ctaSecondaryText || ''} onChange={e => setLp('ctaSecondaryText', e.target.value)} /></div>
              <div><label className="label">Sprint Duration Label</label><input type="text" className="input" value={lp.sprintDuration || ''} onChange={e => setLp('sprintDuration', e.target.value)} placeholder="24h" /></div>
              <div><label className="label">Contact Email</label><input type="email" className="input" value={lp.contactEmail || ''} onChange={e => setLp('contactEmail', e.target.value)} /></div>
              <div><label className="label">Contact Phone</label><input type="text" className="input" value={lp.contactPhone || ''} onChange={e => setLp('contactPhone', e.target.value)} /></div>
              <div><label className="label">Footer Text</label><input type="text" className="input" value={lp.footerText || ''} onChange={e => setLp('footerText', e.target.value)} /></div>
            </div>
          </div>
        )}

        {/* ABOUT */}
        {activeTab === 'about' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 mb-4 border-b border-dark-100 dark:border-dark-800 pb-2">About Section</h3>
            <div><label className="label">About Title</label><input type="text" className="input" value={lp.aboutTitle || ''} onChange={e => setLp('aboutTitle', e.target.value)} /></div>
            <div><label className="label">About Description</label><textarea className="input min-h-[150px]" value={lp.aboutDescription || ''} onChange={e => setLp('aboutDescription', e.target.value)} placeholder="Describe your hackathon in detail..." /></div>
          </div>
        )}

        {/* EVENT DETAILS */}
        {activeTab === 'event' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 mb-4 border-b border-dark-100 dark:border-dark-800 pb-2">Event Schedule & Venue</h3>
            <p className="text-sm text-dark-500 mb-4">This information will be displayed explicitly on the landing page.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="label">Schedule Date</label><input type="text" className="input" value={lp.scheduleDate || ''} onChange={e => setLp('scheduleDate', e.target.value)} placeholder="e.g. October 15-16, 2026" /></div>
              <div><label className="label">Schedule Time</label><input type="text" className="input" value={lp.scheduleTime || ''} onChange={e => setLp('scheduleTime', e.target.value)} placeholder="e.g. 9:00 AM - 9:00 AM (24 Hours)" /></div>
              <div><label className="label">Venue Name</label><input type="text" className="input" value={lp.venueName || ''} onChange={e => setLp('venueName', e.target.value)} placeholder="e.g. TCE Main Auditorium" /></div>
              <div><label className="label">Venue Address / Location</label><input type="text" className="input" value={lp.venueAddress || ''} onChange={e => setLp('venueAddress', e.target.value)} placeholder="e.g. Madurai, Tamil Nadu" /></div>
              <div className="md:col-span-2"><label className="label">Google Maps Link</label><input type="url" className="input" value={lp.venueMapUrl || ''} onChange={e => setLp('venueMapUrl', e.target.value)} placeholder="https://maps.google.com/..." /></div>
            </div>
          </div>
        )}

        {/* PRIZES */}
        {activeTab === 'prizes' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-dark-100 dark:border-dark-800 pb-2 mb-4">
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100">Awards & Prizes</h3>
              <button type="button" onClick={addPrize} className="btn-secondary text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Add Prize
              </button>
            </div>
            {(config.prizes || []).map((p, i) => (
              <div key={p._id || i} className="p-4 border border-dark-100 dark:border-dark-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-dark-500">Rank {p.rank || i + 1}</span>
                  <button onClick={() => removePrize(i)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div><label className="label">Award Title</label><input type="text" className="input" value={p.title || ''} onChange={e => updatePrize(i, 'title', e.target.value)} placeholder="e.g. First Place" /></div>
                  <div><label className="label">Prize Amount / Value (₹)</label><input type="number" className="input" value={p.amount || 0} onChange={e => updatePrize(i, 'amount', Number(e.target.value))} /></div>
                  <div><label className="label">Rank Number</label><input type="number" className="input" value={p.rank || 0} onChange={e => updatePrize(i, 'rank', Number(e.target.value))} /></div>
                  <div className="md:col-span-3"><label className="label">Short Description</label><input type="text" className="input" value={p.description || ''} onChange={e => updatePrize(i, 'description', e.target.value)} placeholder="e.g. Winner gets 50k INR and direct internship offers" /></div>
                </div>
              </div>
            ))}
            {(!config.prizes || config.prizes.length === 0) && <p className="text-center text-dark-400 py-6">No prizes configured. Click "Add Prize" to setup awards.</p>}
          </div>
        )}

        {/* FEATURES */}
        {activeTab === 'features' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-dark-100 dark:border-dark-800 pb-2 mb-4">
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100">Features / Highlights</h3>
              <button type="button" onClick={addFeature} className="btn-secondary text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Add Feature
              </button>
            </div>
            {(lp.features || []).map((f, i) => (
              <div key={f._id || i} className="p-4 border border-dark-100 dark:border-dark-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-dark-500">Feature {i + 1}</span>
                  <button onClick={() => removeFeature(i)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="label">Icon</label>
                    <div className="flex flex-wrap gap-1.5">
                      {FEATURE_ICONS.map(ic => (
                        <button key={ic} type="button" onClick={() => updateFeature(i, 'icon', ic)} className={`p-2 rounded-lg border-2 transition-all ${f.icon === ic ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-dark-200 dark:border-dark-700 hover:border-dark-300'}`}>
                          <IconPreview icon={ic} className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div><label className="label">Title</label><input type="text" className="input" value={f.title || ''} onChange={e => updateFeature(i, 'title', e.target.value)} /></div>
                  <div><label className="label">Description</label><input type="text" className="input" value={f.description || ''} onChange={e => updateFeature(i, 'description', e.target.value)} /></div>
                </div>
              </div>
            ))}
            {(!lp.features || lp.features.length === 0) && <p className="text-center text-dark-400 py-6">No features added yet. Click "Add Feature" to get started.</p>}
          </div>
        )}

        {/* FAQS */}
        {activeTab === 'faqs' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-dark-100 dark:border-dark-800 pb-2 mb-4">
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100">Frequently Asked Questions</h3>
              <button type="button" onClick={addFaq} className="btn-secondary text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Add FAQ
              </button>
            </div>
            {(lp.faqs || []).map((f, i) => (
              <div key={f._id || i} className="p-4 border border-dark-100 dark:border-dark-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-dark-500">FAQ {i + 1}</span>
                  <button onClick={() => removeFaq(i)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <div><label className="label">Question</label><input type="text" className="input" value={f.question || ''} onChange={e => updateFaq(i, 'question', e.target.value)} /></div>
                <div><label className="label">Answer</label><textarea className="input min-h-[80px]" value={f.answer || ''} onChange={e => updateFaq(i, 'answer', e.target.value)} /></div>
              </div>
            ))}
            {(!lp.faqs || lp.faqs.length === 0) && <p className="text-center text-dark-400 py-6">No FAQs added yet.</p>}
          </div>
        )}

        {/* SPONSORS */}
        {activeTab === 'sponsors' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-dark-100 dark:border-dark-800 pb-2 mb-4">
              <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100">Sponsors & Partners</h3>
              <button type="button" onClick={addSponsor} className="btn-secondary text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Add Sponsor
              </button>
            </div>
            {(lp.sponsors || []).map((s, i) => (
              <div key={s._id || i} className="p-4 border border-dark-100 dark:border-dark-800 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div><label className="label">Name</label><input type="text" className="input" value={s.name || ''} onChange={e => updateSponsor(i, 'name', e.target.value)} /></div>
                <div><label className="label">Logo URL</label><input type="url" className="input" value={s.logoUrl || ''} onChange={e => updateSponsor(i, 'logoUrl', e.target.value)} /></div>
                <div><label className="label">Tier</label>
                  <select className="input" value={s.tier || 'partner'} onChange={e => updateSponsor(i, 'tier', e.target.value)}>
                    <option value="title">Title</option><option value="gold">Gold</option><option value="silver">Silver</option><option value="bronze">Bronze</option><option value="partner">Partner</option>
                  </select>
                </div>
                <button onClick={() => removeSponsor(i)} className="btn-ghost text-red-500 self-end">Remove</button>
              </div>
            ))}
            {(!lp.sponsors || lp.sponsors.length === 0) && <p className="text-center text-dark-400 py-6">No sponsors added yet.</p>}
          </div>
        )}

        {/* SOCIAL LINKS */}
        {activeTab === 'socials' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 mb-4 border-b border-dark-100 dark:border-dark-800 pb-2">Social Links & Footer</h3>
            <p className="text-sm text-dark-500 mb-4">Add the full URLs (including https://) to show these icons in the footer.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="label">Website / Portal URL</label><input type="url" className="input" value={config.socialLinks?.website || ''} onChange={e => setSocial('website', e.target.value)} placeholder="https://..." /></div>
              <div><label className="label">Instagram URL</label><input type="url" className="input" value={config.socialLinks?.instagram || ''} onChange={e => setSocial('instagram', e.target.value)} placeholder="https://instagram.com/..." /></div>
              <div><label className="label">LinkedIn URL</label><input type="url" className="input" value={config.socialLinks?.linkedin || ''} onChange={e => setSocial('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." /></div>
              <div><label className="label">YouTube URL</label><input type="url" className="input" value={config.socialLinks?.youtube || ''} onChange={e => setSocial('youtube', e.target.value)} placeholder="https://youtube.com/..." /></div>
            </div>
          </div>
        )}

        {/* TOGGLES */}
        {activeTab === 'toggles' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 mb-4 border-b border-dark-100 dark:border-dark-800 pb-2">Section Visibility</h3>
            <p className="text-sm text-dark-500 mb-4">Toggle which sections appear on the public landing page.</p>
            {[
              { key: 'showPrizes', label: 'Prizes / Awards Section', desc: 'Show the prize tiers from your config.' },
              { key: 'showFAQ', label: 'FAQ Section', desc: 'Display frequently asked questions.' },
              { key: 'showSchedule', label: 'Schedule Section', desc: 'Show the event timeline.' },
              { key: 'showRules', label: 'Rules Section', desc: 'Display hackathon rules.' },
              { key: 'showSponsors', label: 'Sponsors Section', desc: 'Show sponsor logos and names.' },
              { key: 'showFeatures', label: 'Features / Highlights', desc: 'Show feature cards on the landing page.' },
            ].map(t => (
              <label key={t.key} className="flex items-start gap-4 p-4 rounded-xl border border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800/30 cursor-pointer transition-colors">
                <input type="checkbox" checked={lp[t.key] ?? true} onChange={e => setLp(t.key, e.target.checked)} className="w-5 h-5 mt-0.5 rounded text-primary-600" />
                <div>
                  <span className="font-bold block text-dark-900 dark:text-dark-100">{t.label}</span>
                  <span className="text-sm text-dark-500">{t.desc}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPageConfig;
