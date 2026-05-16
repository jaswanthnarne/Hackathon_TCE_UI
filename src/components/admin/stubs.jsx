// Stub pages for admin sections

export const EmailComposer = () => (
  <div className="animate-fade-in">
    <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-4">Email Composer</h1>
    <div className="card p-8 text-center">
      <span className="block mb-3"><svg className="w-10 h-10 mx-auto text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
      <p className="text-dark-500 dark:text-dark-400">Send emails to teams</p>
    </div>
  </div>
);

export const AuditLogs = () => (
  <div className="animate-fade-in">
    <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100 mb-4">Audit Logs</h1>
    <div className="card p-8 text-center">
      <span className="block mb-3"><svg className="w-10 h-10 mx-auto text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></span>
      <p className="text-dark-500 dark:text-dark-400">View all admin actions</p>
    </div>
  </div>
);
