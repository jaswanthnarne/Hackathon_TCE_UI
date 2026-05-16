import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import teamService from '../../../services/teamService';
import { Loader } from '../../common/Loader';
import toast from 'react-hot-toast';

const SubmissionForm = () => {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1=form, 2=preview, 3=done
  const [form, setForm] = useState({
    projectTitle: '', projectDescription: '', githubUrl: '', videoUrl: '', liveDemoUrl: '', additionalNotes: '',
  });
  const [zipFile, setZipFile] = useState(null);
  const [pptFile, setPptFile] = useState(null);

  const { config } = useOutletContext();
  const isSubmissionOpen = config?.isSubmissionOpen ?? false;

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await teamService.getSubmission();
        if (data.data.submission) {
          setSubmission(data.data.submission);
          setForm({
            projectTitle: data.data.submission.projectTitle || '',
            projectDescription: data.data.submission.projectDescription || '',
            githubUrl: data.data.submission.githubUrl || '',
            videoUrl: data.data.submission.videoUrl || '',
            liveDemoUrl: data.data.submission.liveDemoUrl || '',
            additionalNotes: data.data.submission.additionalNotes || '',
          });
          setStep(3);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (zipFile) formData.append('file', zipFile);

      let res;
      if (submission) {
        res = await teamService.resubmitProject(formData);
        toast.success('Submission updated!');
      } else {
        res = await teamService.submitProject(formData);
        toast.success('Project submitted! Confirmation email sent.');
      }
      setSubmission(res.data.data.submission);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const handleEdit = () => { setStep(1); };

  if (loading) return <Loader text="Loading submission..." />;

  // Step 3: Submitted view
  if (step === 3 && submission) {
    const evalStatus = submission.evaluation?.status || 'pending';
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Project Submission</h1>
            <p className="text-dark-500 dark:text-dark-400">Your project has been submitted successfully</p>
          </div>
          {isSubmissionOpen && evalStatus === 'pending' ? (
            <div className="flex justify-end gap-4">
              <button onClick={handleEdit} className="btn-secondary flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>Edit Submission</button>
            </div>
          ) : evalStatus !== 'pending' ? (
            <div className="text-sm font-medium text-dark-500 bg-dark-50 dark:bg-dark-800 px-4 py-2 rounded-lg flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>Editing disabled (Already evaluated)</div>
          ) : (
            <div className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>Submissions Closed</div>
          )}
        </div>

        {/* Status Banner */}
        <div className="card p-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-400">Submitted Successfully</h3>
              <p className="text-sm text-green-600 dark:text-green-500">Submitted on {new Date(submission.submittedAt).toLocaleString('en-IN')}</p>
              {submission.isLate && <span className="badge-warning text-xs mt-1 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>Late Submission</span>}
            </div>
          </div>
        </div>

        {/* Submission Details */}
        <div className="card">
          <div className="px-6 py-4 border-b border-dark-100 dark:border-dark-700">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">{submission.projectTitle}</h3>
          </div>
          <div className="p-6 space-y-4">
            {submission.projectDescription && <div><span className="label">Description</span><p className="text-sm text-dark-700 dark:text-dark-300 whitespace-pre-wrap">{submission.projectDescription}</p></div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {submission.githubUrl && <LinkCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>} label="GitHub Repository" url={submission.githubUrl} />}
              {submission.videoUrl && <LinkCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} label="Demo Video" url={submission.videoUrl} />}
              {submission.liveDemoUrl && <LinkCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>} label="Live Demo" url={submission.liveDemoUrl} />}
              {submission.fileUrl && <LinkCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} label="Project Files" url={submission.fileUrl} />}
              {submission.presentationUrl && <LinkCard icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>} label="Presentation" url={submission.presentationUrl} />}
            </div>
            {submission.additionalNotes && <div><span className="label">Notes</span><p className="text-sm text-dark-600 dark:text-dark-400 whitespace-pre-wrap">{submission.additionalNotes}</p></div>}
          </div>
        </div>

        {/* Evaluation Status */}
        <div className="card p-6">
          <h4 className="font-semibold text-dark-900 dark:text-dark-100 mb-3">Evaluation Status</h4>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${evalStatus === 'evaluated' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : evalStatus === 'reviewed' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
            {evalStatus === 'pending' && 'Pending Evaluation'}
            {evalStatus === 'evaluated' && 'Evaluated'}
            {evalStatus === 'reviewed' && 'Under Review'}
          </div>
          {submission.evaluation?.score !== null && submission.evaluation?.score !== undefined && (
            <div className="mt-3 p-4 bg-dark-50 dark:bg-dark-800 rounded-xl">
              <p className="text-3xl font-black text-primary-600">{submission.evaluation.score}<span className="text-lg text-dark-400">/{submission.evaluation.maxScore}</span></p>
              {submission.evaluation.feedback && <p className="text-sm text-dark-500 mt-2">{submission.evaluation.feedback}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Preview
  if (step === 2) {
    return (
      <div className="animate-fade-in space-y-6">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Preview Submission</h1>
        <p className="text-dark-500 dark:text-dark-400">Review your submission before sending.</p>

        <div className="card p-6 space-y-4">
          <div><span className="label">Project Title</span><p className="text-lg font-semibold text-dark-900 dark:text-dark-100">{form.projectTitle}</p></div>
          {form.projectDescription && <div><span className="label">Description</span><p className="text-sm text-dark-600 dark:text-dark-300 whitespace-pre-wrap">{form.projectDescription}</p></div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {form.githubUrl && <div className="p-3 bg-dark-50 dark:bg-dark-800 rounded-lg"><span className="text-xs text-dark-400">GitHub</span><p className="text-sm font-medium text-primary-600 truncate">{form.githubUrl}</p></div>}
            {form.videoUrl && <div className="p-3 bg-dark-50 dark:bg-dark-800 rounded-lg"><span className="text-xs text-dark-400">Demo Video</span><p className="text-sm font-medium text-primary-600 truncate">{form.videoUrl}</p></div>}
            {form.liveDemoUrl && <div className="p-3 bg-dark-50 dark:bg-dark-800 rounded-lg"><span className="text-xs text-dark-400">Live Demo</span><p className="text-sm font-medium text-primary-600 truncate">{form.liveDemoUrl}</p></div>}
          </div>
          {zipFile && <div className="flex items-center gap-2 p-3 bg-dark-50 dark:bg-dark-800 rounded-lg"><svg className="w-5 h-5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg><span className="text-sm">{zipFile.name} ({(zipFile.size / 1024 / 1024).toFixed(2)} MB)</span></div>}
          {form.additionalNotes && <div><span className="label">Notes</span><p className="text-sm text-dark-500 whitespace-pre-wrap">{form.additionalNotes}</p></div>}
        </div>

        <div className="flex gap-3">
          <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back to Edit</button>
          <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1">
            {submitting ? <span className="flex items-center justify-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Submitting...</span> : (submission ? 'Update Submission' : 'Submit Project')}
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Form
  return (
    <div className="animate-fade-in space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Project Submission</h1>
        <p className="text-dark-500 dark:text-dark-400">{submission ? 'Update your existing submission' : 'Fill in the details and submit your project'}</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {['Fill Details', 'Preview', 'Submit'].map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-500 text-white' : 'bg-dark-100 dark:bg-dark-800 text-dark-400'}`}>{i + 1}</div>
            <span className={`text-xs font-medium ${step === i + 1 ? 'text-primary-600' : 'text-dark-400'}`}>{label}</span>
            {i < 2 && <div className="flex-1 h-0.5 bg-dark-100 dark:bg-dark-800" />}
          </div>
        ))}
      </div>

      {!isSubmissionOpen && step === 1 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-2xl p-6 text-center animate-fade-in-up">
          <span className="block mb-3"><svg className="w-10 h-10 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg></span>
          <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Submissions Are Closed</h3>
          <p className="text-red-600 dark:text-red-300">The hackathon organizers have currently disabled project submissions. Please wait until submissions are officially opened.</p>
        </div>
      )}

      {isSubmissionOpen && step === 1 && (
        <div className="card p-6">
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-5">
            {/* Project Title */}
            <div>
              <label className="label">Project Title *</label>
              <input type="text" className="input" value={form.projectTitle} onChange={(e) => setForm({ ...form, projectTitle: e.target.value })} placeholder="My Awesome Hackathon Project" required maxLength={200} />
              <p className="text-xs text-dark-400 mt-1">{form.projectTitle.length}/200</p>
            </div>

            {/* Description */}
            <div>
              <label className="label">Project Description</label>
              <textarea className="input min-h-[120px]" value={form.projectDescription} onChange={(e) => setForm({ ...form, projectDescription: e.target.value })} placeholder="Describe what your project does, the problem it solves, and technologies used..." maxLength={5000} />
              <p className="text-xs text-dark-400 mt-1">{form.projectDescription.length}/5000</p>
            </div>

            {/* GitHub */}
            <div>
              <label className="label flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                GitHub Repository *
              </label>
              <input type="url" className="input" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} placeholder="https://github.com/username/project" required />
            </div>

            {/* Video + Live Demo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Demo Video URL
                </label>
                <input type="url" className="input" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
                  Live Demo URL
                </label>
                <input type="url" className="input" value={form.liveDemoUrl} onChange={(e) => setForm({ ...form, liveDemoUrl: e.target.value })} placeholder="https://myproject.vercel.app" />
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  Project ZIP File
                </label>
                <div className="border-2 border-dashed border-dark-200 dark:border-dark-700 rounded-xl p-4 text-center hover:border-primary-400 transition-colors cursor-pointer" onClick={() => document.getElementById('zipInput').click()}>
                  {zipFile ? (
                    <div className="flex items-center gap-2 justify-center"><span className="text-green-500">✓</span><span className="text-sm font-medium">{zipFile.name}</span><span className="text-xs text-dark-400">({(zipFile.size / 1024 / 1024).toFixed(1)} MB)</span></div>
                  ) : (
                    <><p className="text-dark-400 text-sm">Click to upload ZIP</p><p className="text-xs text-dark-400">Max 50MB</p></>
                  )}
                  <input id="zipInput" type="file" accept=".zip,.rar,.7z" className="hidden" onChange={(e) => setZipFile(e.target.files[0])} />
                </div>
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                  Presentation (PPT/PDF)
                </label>
                <div className="border-2 border-dashed border-dark-200 dark:border-dark-700 rounded-xl p-4 text-center hover:border-primary-400 transition-colors cursor-pointer" onClick={() => document.getElementById('pptInput').click()}>
                  {pptFile ? (
                    <div className="flex items-center gap-2 justify-center"><span className="text-green-500">✓</span><span className="text-sm font-medium">{pptFile.name}</span><span className="text-xs text-dark-400">({(pptFile.size / 1024 / 1024).toFixed(1)} MB)</span></div>
                  ) : (
                    <><p className="text-dark-400 text-sm">Click to upload PPT/PDF</p><p className="text-xs text-dark-400">Max 20MB</p></>
                  )}
                  <input id="pptInput" type="file" accept=".ppt,.pptx,.pdf" className="hidden" onChange={(e) => setPptFile(e.target.files[0])} />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="label">Additional Notes</label>
              <textarea className="input min-h-[100px]" value={form.additionalNotes} onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })} placeholder="Any deployment instructions or extra details for the judges..." maxLength={2000} />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4 border-t border-dark-100 dark:border-dark-800">
              <button type="submit" className="btn-primary">Review Submission →</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const LinkCard = ({ icon, label, url }) => (
  <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-800 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors group">
    <span className="flex-shrink-0">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-dark-400">{label}</p>
      <p className="text-sm font-medium text-primary-600 group-hover:text-primary-500 truncate">{url}</p>
    </div>
    <svg className="w-4 h-4 text-dark-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
  </a>
);

export default SubmissionForm;
