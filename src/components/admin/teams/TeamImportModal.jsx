import { useState } from 'react';
import * as XLSX from 'xlsx';
import Modal from '../../common/Modal';
import { Loader } from '../../common/Loader';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

const TeamImportModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview
  const [parsedTeams, setParsedTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const resetState = () => {
    setStep(1);
    setParsedTeams([]);
    setSendEmail(false);
    setImportResults(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Helper to flexibly find column names ignoring exact spaces/casing
  const getVal = (row, possibleKeys) => {
    const normalizedRow = {};
    Object.keys(row).forEach(k => {
      const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      normalizedRow[normK] = row[k];
    });
    
    for (let key of possibleKeys) {
      const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedRow[normKey] !== undefined) return String(normalizedRow[normKey]).trim();
    }
    return '';
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const formattedTeams = [];

        data.forEach(row => {
          // Team Name
          const teamName = getVal(row, ['Team Name for Project and Hackathon', 'Team Name', 'Team Name / Project Name', 'Project Name', 'Title of Project', 'Project Title']);
          if (!teamName) return; // Skip empty rows

          // Team Lead (P1)
          const leadName = getVal(row, ['Team Lead Name', 'Name of Participant -1', 'Name of Participant 1', 'Participant 1 Name', 'Participant 1', 'Leader Name', 'P1 Name', 'Team Leader Name', 'Lead Name', 'Full Name']);
          const leadEmail = getVal(row, ["Team Lead Mail I'd", 'Team Lead Mail Id', 'Mail P-1', 'Mail P1', 'Participant 1 Email', 'Participant 1 Mail', 'Leader Email', 'Lead Email', 'P1 Email', 'Email', 'Email Address']);
          const leadUsn = getVal(row, ['Team Lead USN', 'USN P-1', 'USN P1', 'Participant 1 USN', 'Leader USN', 'Lead USN', 'P1 USN', 'USN', 'Roll Number', 'Register Number']);
          const leadPhone = getVal(row, ['Team Lead Phone Number', 'Team Lead Phone', 'Mobile P-1', 'Mobile P1', 'Participant 1 Phone', 'Participant 1 Mobile', 'Leader Phone', 'Lead Phone', 'P1 Phone', 'P1 Mobile', 'Phone', 'Mobile', 'Phone Number', 'WhatsApp Number']);
          const collegeDept = getVal(row, ['Department', 'College', 'College Name', 'Institution', 'University', 'College/Institution Name']);

          const members = [];
          
          // Parse P2 to P6
          for (let i = 2; i <= 6; i++) {
            const mName = getVal(row, [`Name of Participant -${i}`, `Name of Participant ${i}`, `Participant ${i} Name`, `Participant ${i}`, `Member ${i} Name`, `Team Member ${i} Name`, `P${i} Name`, `Name P${i}`, `Member ${i}`]);
            const mUsn = getVal(row, [`USN P-${i}`, `USN P${i}`, `Participant ${i} USN`, `Member ${i} USN`, `P${i} USN`, `USN (P${i})`]);
            const mEmail = getVal(row, [`Mail P-${i}`, `Mail P${i}`, `Participant ${i} Email`, `Participant ${i} Mail`, `Member ${i} Email`, `P${i} Email`, `Email P${i}`, `Email (P${i})`]);
            const mPhone = getVal(row, [`Mobile P-${i}`, `Mobile P${i}`, `Participant ${i} Phone`, `Participant ${i} Mobile`, `Member ${i} Phone`, `Member ${i} Mobile`, `P${i} Phone`, `P${i} Mobile`, `Phone P${i}`, `Mobile P${i}`, `Phone (P${i})`]);

            if (mName || mEmail || mUsn) {
              const cleanTeamName = teamName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'team';
              const cleanUsn = mUsn ? mUsn.toLowerCase() : '';
              const randomPart = Math.random().toString(36).substring(2,6);
              const fallbackEmail = mEmail || `${cleanUsn || 'member' + i + '_' + randomPart}@${cleanTeamName}.com`;

              members.push({
                name: mName || `Member ${i}`,
                email: fallbackEmail,
                usn: mUsn ? mUsn.toUpperCase() : '',
                phone: mPhone || '',
                college: collegeDept
              });
            }
          }

          formattedTeams.push({
            teamName,
            teamLead: {
              name: leadName || 'Team Lead',
              email: leadEmail || `lead_${Math.random().toString(36).substring(2,6)}@${teamName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'team'}.com`,
              usn: leadUsn ? leadUsn.toUpperCase() : '',
              phone: leadPhone,
              college: collegeDept
            },
            members
          });
        });

        setParsedTeams(formattedTeams);
        setStep(2);
      } catch (err) {
        console.error(err);
        toast.error('Failed to parse file. Make sure it is a valid Excel/CSV file.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCellEdit = (index, field, value, isLead = false) => {
    const updated = [...parsedTeams];
    if (field === 'teamName') {
      updated[index].teamName = value;
    } else if (isLead) {
      updated[index].teamLead[field] = value;
    }
    setParsedTeams(updated);
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const payload = {
        teams: parsedTeams,
        sendEmail
      };
      const { data } = await adminService.bulkImportTeamsJson(payload);
      setImportResults(data.data);
      setStep(3);
      onSuccess(); // Refresh table in parent
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk import failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Teams from Google Forms" size="5xl">
      {loading && <div className="py-10"><Loader text="Processing..." /></div>}

      {!loading && step === 1 && (
        <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-6 shadow-sm border border-primary-100 dark:border-primary-800">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">Upload Data File</h3>
          <p className="text-dark-500 max-w-md mx-auto mb-8">
            Select your Google Forms Excel (.xlsx) or CSV export file to begin bulk importing teams and generating accounts automatically.
          </p>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
            <div className="relative bg-white dark:bg-dark-900 px-6 py-4 rounded-lg border-2 border-dashed border-primary-300 dark:border-primary-700 flex flex-col items-center hover:border-primary-500 dark:hover:border-primary-500 transition-colors">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <svg className="w-8 h-8 text-primary-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-primary-700 dark:text-primary-400 font-semibold">Click or drag file here</span>
              <span className="text-xs text-dark-400 mt-1">Supports .xlsx, .csv</span>
            </div>
          </div>
        </div>
      )}

      {!loading && step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center bg-primary-50 dark:bg-primary-900/10 p-4 rounded-lg border border-primary-100 dark:border-primary-800">
            <div>
              <h3 className="font-semibold text-primary-700 dark:text-primary-400">Preview Data ({parsedTeams.length} teams found)</h3>
              <p className="text-sm text-primary-600 dark:text-primary-500">Participant 1 has been automatically mapped as the Team Lead.</p>
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="sendEmailCheck"
                checked={sendEmail} 
                onChange={(e) => setSendEmail(e.target.checked)} 
                className="w-4 h-4 text-primary-600 bg-dark-100 border-dark-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="sendEmailCheck" className="text-sm font-medium text-dark-700 dark:text-dark-300">
                Send Account Creation Email to Team Leads
              </label>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[50vh] border border-dark-200 dark:border-dark-700 rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-dark-700 uppercase bg-dark-50 dark:bg-dark-800 sticky top-0 shadow-sm">
                <tr>
                  <th className="px-3 py-2 whitespace-nowrap">#</th>
                  <th className="px-3 py-2 whitespace-nowrap">Team Name</th>
                  <th className="px-3 py-2 whitespace-nowrap bg-blue-50/50 dark:bg-blue-900/10">Lead Name</th>
                  <th className="px-3 py-2 whitespace-nowrap bg-blue-50/50 dark:bg-blue-900/10">Lead Email</th>
                  <th className="px-3 py-2 whitespace-nowrap bg-blue-50/50 dark:bg-blue-900/10">Lead USN</th>
                  <th className="px-3 py-2 whitespace-nowrap">Other Members</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-200 dark:divide-dark-700">
                {parsedTeams.map((t, idx) => (
                  <tr key={idx} className="hover:bg-dark-50 dark:hover:bg-dark-800/50">
                    <td className="px-3 py-2 text-dark-400">{idx + 1}</td>
                    <td className="px-1 py-1">
                      <input 
                        className="w-full bg-transparent border border-transparent hover:border-dark-300 focus:border-primary-500 px-2 py-1 rounded"
                        value={t.teamName} 
                        onChange={(e) => handleCellEdit(idx, 'teamName', e.target.value)}
                      />
                    </td>
                    <td className="px-1 py-1 bg-blue-50/20 dark:bg-blue-900/5">
                      <input 
                        className="w-full bg-transparent border border-transparent hover:border-dark-300 focus:border-primary-500 px-2 py-1 rounded"
                        value={t.teamLead.name} 
                        onChange={(e) => handleCellEdit(idx, 'name', e.target.value, true)}
                      />
                    </td>
                    <td className="px-1 py-1 bg-blue-50/20 dark:bg-blue-900/5">
                      <input 
                        className="w-full bg-transparent border border-transparent hover:border-dark-300 focus:border-primary-500 px-2 py-1 rounded"
                        value={t.teamLead.email} 
                        onChange={(e) => handleCellEdit(idx, 'email', e.target.value, true)}
                      />
                    </td>
                    <td className="px-1 py-1 bg-blue-50/20 dark:bg-blue-900/5">
                      <input 
                        className="w-full bg-transparent border border-transparent hover:border-dark-300 focus:border-primary-500 px-2 py-1 rounded uppercase"
                        value={t.teamLead.usn} 
                        onChange={(e) => handleCellEdit(idx, 'usn', e.target.value, true)}
                      />
                    </td>
                    <td className="px-3 py-2 text-dark-500">
                      {t.members.length} members
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 dark:border-dark-700">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button>
            <button onClick={handleImport} className="btn-primary bg-green-600 hover:bg-green-700 border-none">
              Proceed and Create Accounts
            </button>
          </div>
        </div>
      )}

      {!loading && step === 3 && importResults && (
        <div className="space-y-6 text-center py-6 animate-fade-in">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Import Complete!</h2>
          <div className="flex justify-center gap-8 py-4">
            <div className="bg-dark-50 dark:bg-dark-800 p-4 rounded-xl min-w-[120px]">
              <div className="text-3xl font-bold text-green-600">{importResults.importedCount}</div>
              <div className="text-sm font-medium text-dark-500 mt-1">Successfully<br/>Created</div>
            </div>
            <div className="bg-dark-50 dark:bg-dark-800 p-4 rounded-xl min-w-[120px]">
              <div className="text-3xl font-bold text-red-500">{importResults.skippedCount}</div>
              <div className="text-sm font-medium text-dark-500 mt-1">Skipped<br/>(Duplicates/Errors)</div>
            </div>
          </div>
          
          {importResults.errors && importResults.errors.length > 0 && (
            <div className="mt-6 text-left border border-red-200 dark:border-red-900/30 rounded-lg overflow-hidden">
              <div className="bg-red-50 dark:bg-red-900/10 px-4 py-3 border-b border-red-200 dark:border-red-900/30">
                <h4 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Error Details (Skipped Rows)
                </h4>
              </div>
              <ul className="max-h-48 overflow-y-auto p-4 space-y-2 bg-white dark:bg-dark-950">
                {importResults.errors.map((err, i) => (
                  <li key={i} className="text-sm flex gap-3 pb-2 border-b border-dark-100 dark:border-dark-800 last:border-0 last:pb-0">
                    <span className="font-medium text-dark-700 dark:text-dark-300 min-w-[60px]">Row {err.row}:</span>
                    <span className="font-semibold text-dark-600 dark:text-dark-400 w-1/4 truncate">{err.team}</span>
                    <span className="text-red-600 dark:text-red-400 flex-1">{err.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4">
            <button onClick={handleClose} className="btn-primary w-full">Done</button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TeamImportModal;
