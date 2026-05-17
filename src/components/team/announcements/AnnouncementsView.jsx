import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import EmptyState from '../../common/EmptyState';

const PRIORITY_MAP = {
  high: { color: 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10', badge: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400', dot: 'bg-red-500' },
  normal: { color: 'border-l-primary-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400', dot: 'bg-blue-500' },
  low: { color: 'border-l-dark-300', badge: 'bg-dark-100 text-dark-600 dark:bg-dark-800 dark:text-dark-400', dot: 'bg-dark-400' },
};

const AnnouncementsView = () => {
  const { announcements } = useOutletContext();
  const [expanded, setExpanded] = useState(null);


  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString('en-IN', { dateStyle: 'medium' });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Announcements</h1>
        <p className="text-dark-500 dark:text-dark-400">Latest updates from the organizers</p>
      </div>

      {announcements.length === 0 ? (
        <EmptyState title="No announcements yet" message="Check back later for updates from the organizers." />
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => {
            const ps = PRIORITY_MAP[ann.priority] || PRIORITY_MAP.normal;
            const isExpanded = expanded === ann._id;
            const isLong = ann.message.length > 200;

            return (
              <div key={ann._id} className={`card overflow-hidden border-l-4 ${ps.color} transition-all hover:shadow-md`}>
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ann.isPinned ? 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' : 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'} /></svg></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {ann.isPinned && <span className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>Pinned</span>}
                        {ann.priority === 'high' && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ps.badge} flex items-center gap-1`}><span className="w-2 h-2 rounded-full bg-red-500" />Important</span>}
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-2">{ann.title}</h3>

                      {/* Message */}
                      <div className="text-sm text-dark-600 dark:text-dark-400 whitespace-pre-wrap leading-relaxed">
                        {isLong && !isExpanded ? (
                          <>
                            {ann.message.substring(0, 200)}...
                            <button onClick={() => setExpanded(ann._id)} className="text-primary-600 hover:text-primary-500 ml-1 font-medium">Read more</button>
                          </>
                        ) : (
                          <>
                            {ann.message}
                            {isLong && <button onClick={() => setExpanded(null)} className="block text-primary-600 hover:text-primary-500 mt-1 font-medium">Show less</button>}
                          </>
                        )}
                      </div>

                      {/* Footer */}
                      <p className="text-xs text-dark-400 mt-3">{timeAgo(ann.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsView;
