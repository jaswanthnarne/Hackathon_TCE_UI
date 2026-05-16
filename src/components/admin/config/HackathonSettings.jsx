import { useState, useEffect, useRef } from 'react';
import adminService from '../../../services/adminService';
import { Loader } from '../../common/Loader';
import toast from 'react-hot-toast';

const HackathonSettings = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const fetchConfig = async () => {
    try {
      const { data } = await adminService.getConfig();
      if (data.data.config) {
        setConfig(data.data.config);
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setConfig(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
        }
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateConfig(config);
      toast.success('Hackathon settings updated successfully');
      fetchConfig();
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append(type, file);
    
    const loadingToast = toast.loading(`Uploading ${type}...`);
    try {
      if (type === 'logo') {
        await adminService.uploadLogo(formData);
      } else {
        await adminService.uploadBanner(formData);
      }
      toast.success(`${type} uploaded successfully`, { id: loadingToast });
      fetchConfig();
    } catch (err) {
      toast.error(`Failed to upload ${type}`, { id: loadingToast });
    }
  };

  if (loading) return <Loader text="Loading settings..." />;
  if (!config) return <div className="text-center p-10">No config found.</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Hackathon Settings</h1>
          <p className="text-dark-500 dark:text-dark-400">Configure global platform properties and rules.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="flex border-b border-dark-100 dark:border-dark-800 overflow-x-auto custom-scrollbar">
        {['general', 'dates', 'venue', 'teams', 'toggles'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300 dark:text-dark-400 dark:hover:text-dark-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="card p-6 md:p-8">
        
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 mb-4 border-b border-dark-100 dark:border-dark-800 pb-2">General Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="label">Hackathon Name</label>
                  <input type="text" name="name" value={config.name || ''} onChange={handleChange} className="input" required />
                </div>
                <div>
                  <label className="label">Tagline</label>
                  <input type="text" name="tagline" value={config.tagline || ''} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea name="description" value={config.description || ''} onChange={handleChange} className="input min-h-[120px]" />
                </div>
              </div>

              <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <label className="label">Logo</label>
                  <div className="mt-1 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-dark-50 dark:bg-dark-800 border-2 border-dashed border-dark-200 dark:border-dark-700 flex items-center justify-center overflow-hidden">
                      {config.logoUrl ? <img src={config.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" /> : <span className="text-xs text-dark-400">No logo</span>}
                    </div>
                    <div>
                      <input type="file" ref={logoInputRef} onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" accept="image/*" />
                      <button type="button" onClick={() => logoInputRef.current?.click()} className="btn-secondary text-xs">Upload Logo</button>
                      <p className="text-xs text-dark-400 mt-1">1:1 square recommended</p>
                    </div>
                  </div>
                </div>

                {/* Banner Upload */}
                <div>
                  <label className="label">Banner (Hero Image)</label>
                  <div className="mt-1">
                    <div className="w-full h-32 rounded-xl bg-dark-50 dark:bg-dark-800 border-2 border-dashed border-dark-200 dark:border-dark-700 flex items-center justify-center overflow-hidden mb-3 relative">
                      {config.bannerUrl ? <img src={config.bannerUrl} alt="Banner" className="w-full h-full object-cover" /> : <span className="text-xs text-dark-400">No banner</span>}
                    </div>
                    <input type="file" ref={bannerInputRef} onChange={(e) => handleFileUpload(e, 'banner')} className="hidden" accept="image/*" />
                    <button type="button" onClick={() => bannerInputRef.current?.click()} className="btn-secondary text-xs w-full justify-center">Upload Banner</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DATES TAB */}
        {activeTab === 'dates' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 mb-4 border-b border-dark-100 dark:border-dark-800 pb-2">Timeline & Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Start Date</label>
                <input type="datetime-local" name="startDate" value={config.startDate ? new Date(config.startDate).toISOString().slice(0, 16) : ''} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">End Date</label>
                <input type="datetime-local" name="endDate" value={config.endDate ? new Date(config.endDate).toISOString().slice(0, 16) : ''} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Registration Deadline</label>
                <input type="datetime-local" name="registrationDeadline" value={config.registrationDeadline ? new Date(config.registrationDeadline).toISOString().slice(0, 16) : ''} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Submission Deadline</label>
                <input type="datetime-local" name="submissionDeadline" value={config.submissionDeadline ? new Date(config.submissionDeadline).toISOString().slice(0, 16) : ''} onChange={handleChange} className="input" />
              </div>
            </div>
          </div>
        )}

        {/* VENUE TAB */}
        {activeTab === 'venue' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 mb-4 border-b border-dark-100 dark:border-dark-800 pb-2">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Mode</label>
                <select name="mode" value={config.mode || 'offline'} onChange={handleChange} className="input">
                  <option value="offline">Offline / In-person</option>
                  <option value="online">Online / Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="label">College / Organization Name</label>
                <input type="text" name="venue.collegeName" value={config.venue?.collegeName || ''} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Hall / Building Name</label>
                <input type="text" name="venue.hallName" value={config.venue?.hallName || ''} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Address</label>
                <input type="text" name="venue.address" value={config.venue?.address || ''} onChange={handleChange} className="input" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Google Maps Link</label>
                <input type="url" name="venue.mapsLink" value={config.venue?.mapsLink || ''} onChange={handleChange} className="input" placeholder="https://maps.google.com/..." />
              </div>
            </div>
          </div>
        )}

        {/* TEAMS TAB */}
        {activeTab === 'teams' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 mb-4 border-b border-dark-100 dark:border-dark-800 pb-2">Team Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Minimum Team Size</label>
                <input type="number" name="teamSettings.minSize" value={config.teamSettings?.minSize || 1} onChange={handleChange} min={1} className="input" />
              </div>
              <div>
                <label className="label">Maximum Team Size</label>
                <input type="number" name="teamSettings.maxSize" value={config.teamSettings?.maxSize || 5} onChange={handleChange} min={1} className="input" />
              </div>
              <div>
                <label className="label">Is Registration Free?</label>
                <div className="flex items-center mt-2">
                  <input type="checkbox" name="fee.isFree" checked={config.fee?.isFree} onChange={handleChange} className="w-5 h-5 rounded text-primary-600" />
                  <span className="ml-2 font-medium">Yes, free for all</span>
                </div>
              </div>
              {!config.fee?.isFree && (
                <div>
                  <label className="label">Registration Fee (₹)</label>
                  <input type="number" name="fee.amount" value={config.fee?.amount || 0} onChange={handleChange} min={0} className="input" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TOGGLES TAB */}
        {activeTab === 'toggles' && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-dark-900 dark:text-dark-100 mb-4 border-b border-dark-100 dark:border-dark-800 pb-2">Platform Master Toggles</h3>
            
            <div className="space-y-4">
              <label className="flex items-start gap-4 p-4 rounded-xl border border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800/30 cursor-pointer transition-colors">
                <input type="checkbox" name="isRegistrationOpen" checked={config.isRegistrationOpen} onChange={handleChange} className="w-5 h-5 mt-0.5 rounded text-primary-600" />
                <div>
                  <span className="font-bold block text-dark-900 dark:text-dark-100">Registrations Open</span>
                  <span className="text-sm text-dark-500">Allow new students to register and form teams.</span>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 rounded-xl border border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800/30 cursor-pointer transition-colors">
                <input type="checkbox" name="isSubmissionOpen" checked={config.isSubmissionOpen} onChange={handleChange} className="w-5 h-5 mt-0.5 rounded text-primary-600" />
                <div>
                  <span className="font-bold block text-dark-900 dark:text-dark-100">Project Submissions Open</span>
                  <span className="text-sm text-dark-500">Allow teams to submit their final github links and demos.</span>
                </div>
              </label>

              <label className="flex items-start gap-4 p-4 rounded-xl border border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-800/30 cursor-pointer transition-colors">
                <input type="checkbox" name="isProblemSelectionOpen" checked={config.isProblemSelectionOpen} onChange={handleChange} className="w-5 h-5 mt-0.5 rounded text-primary-600" />
                <div>
                  <span className="font-bold block text-dark-900 dark:text-dark-100">Problem Selection Open</span>
                  <span className="text-sm text-dark-500">Allow teams to change their selected Problem Statement. If disabled, their selections are locked.</span>
                </div>
              </label>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};

export default HackathonSettings;
