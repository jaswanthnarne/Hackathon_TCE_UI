const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', loading = false }) => {
  if (!isOpen) return null;
  const variants = { danger: 'btn-danger', primary: 'btn-primary', warning: 'bg-yellow-500 text-white hover:bg-yellow-600 px-5 py-2.5 rounded-lg font-semibold' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative max-w-md w-full bg-white dark:bg-dark-800 rounded-2xl shadow-2xl animate-scale-in p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary-100 dark:bg-primary-900/30'}`}>
            <svg className={`w-6 h-6 ${variant === 'danger' ? 'text-red-600' : 'text-primary-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">{title}</h3>
        </div>
        <p className="text-dark-600 dark:text-dark-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>{cancelText}</button>
          <button onClick={onConfirm} className={variants[variant]} disabled={loading}>
            {loading ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Processing...</span> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
