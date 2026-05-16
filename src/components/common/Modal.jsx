import { useState, useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md', showClose = true }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) { setShow(true); document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
      <div className={`relative ${sizes[size]} w-full bg-white dark:bg-dark-800 rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] flex flex-col`} onClick={(e) => e.stopPropagation()}>
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100 dark:border-dark-700">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100">{title}</h3>
            {showClose && (
              <button onClick={onClose} className="p-1 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
