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
          const teamName = getVal(row, ['Team Name for Project and Hackathon', 'Team Name']);
          if (!teamName) return; // Skip empty rows

          // Team Lead (P1)
          const leadName = getVal(row, ['Team Lead Name', 'Name of Participant -1', 'Name of Participant 1']);
          const leadEmail = getVal(row, ["Team Lead Mail I'd", 'Team Lead Mail Id', 'Mail P-1', 'Mail P1']);
          const leadUsn = getVal(row, ['Team Lead USN', 'USN P-1', 'USN P1']);
          const leadPhone = getVal(row, ['Team Lead Phone Number', 'Mobile P-1', 'Mobile P1']);
          const collegeDept = getVal(row, ['Department']);

          const members = [];
          
          // Parse P2 to P5
          for (let i = 2; i <= 5; i++) {
            const mName = getVal(row, [`Name of Participant -${i}`, `Name of Participant ${i}`]);
            const mUsn = getVal(row, [`USN P-${i}`, `USN P${i}`]);
            const mEmail = getVal(row, [`Mail P-${i}`, `Mail P${i}`]);
            const mPhone = getVal(row, [`Mobile P-${i}`, `Mobile P${i}`]);

            if (mName || mEmail || mUsn) {
              members.push({
                name: mName,
                email: mEmail,
                usn: mUsn,
                phone: mPhone,
                college: collegeDept
              });
            }
          }

          formattedTeams.push({
            teamName,
            teamLead: {
              name: leadName,
              email: leadEmail,
              usn: leadUsn,
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
        <div className="space-y-6 text-center py-10">
          <p className="text-dark-500">Upload your Google Forms Excel (.xlsx) or CSV export.</p>
          <div className="flex justify-center">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload}
              className="block w-full max-w-sm text-sm text-dark-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900/20 dark:file:text-primary-400
                hover:file:bg-primary-100 transition-all cursor-pointer"
            />
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
