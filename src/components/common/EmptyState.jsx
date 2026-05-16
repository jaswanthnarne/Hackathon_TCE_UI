const EmptyState = ({ icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-20 h-20 rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center mb-4">
      {icon || <svg className="w-10 h-10 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>}
    </div>
    <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-1">{title || 'No data found'}</h3>
    <p className="text-dark-500 dark:text-dark-400 text-center max-w-md mb-4">{message || 'There\'s nothing here yet.'}</p>
    {action}
  </div>
);

export default EmptyState;
