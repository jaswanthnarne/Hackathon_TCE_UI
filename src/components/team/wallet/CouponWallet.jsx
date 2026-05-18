import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import teamService from '../../../services/teamService';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = { breakfast: '🌅', lunch: '🍛', dinner: '🍽️', snack: '🍿', beverage: '☕', other: '🎫' };
const CATEGORY_GRADIENTS = {
  breakfast: 'from-orange-500/10 to-amber-500/10 border-orange-300 dark:border-orange-800/40',
  lunch: 'from-emerald-500/10 to-teal-500/10 border-emerald-300 dark:border-emerald-800/40',
  dinner: 'from-violet-500/10 to-purple-500/10 border-violet-300 dark:border-violet-800/40',
  snack: 'from-rose-500/10 to-pink-500/10 border-rose-300 dark:border-rose-800/40',
  beverage: 'from-sky-500/10 to-blue-500/10 border-sky-300 dark:border-sky-800/40',
  other: 'from-slate-500/10 to-gray-500/10 border-slate-300 dark:border-slate-800/40',
};

const CouponWallet = () => {
  const [wallet, setWallet] = useState([]);
  const [expandedQR, setExpandedQR] = useState(null);
  const [redeeming, setRedeeming] = useState(null);

  const fetchWallet = async () => {
    try {
      const { data } = await teamService.getWallet();
      setWallet(data.data?.wallet || []);
    } catch {}
  };

  useEffect(() => {
    fetchWallet();
    const interval = setInterval(fetchWallet, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTapRedeem = async (passId) => {
    setRedeeming(passId);
    try {
      await teamService.tapRedeem(passId);
      toast.success('Coupon redeemed successfully!');
      fetchWallet();
    } catch (err) {
      const msg = err.response?.data?.message || 'Redemption failed';
      toast.error(msg);
    } finally {
      setRedeeming(null);
    }
  };

  const active = wallet.filter(w => w.isCurrentlyActive && !w.isRedeemed);
  const redeemed = wallet.filter(w => w.isRedeemed);
  const upcoming = wallet.filter(w => !w.isCurrentlyActive && !w.isRedeemed && new Date(w.activeFrom) > new Date());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">🎫 My Wallet</h1>
          <p className="text-dark-500 dark:text-dark-400">Digital meal passes & coupons</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold">
            {active.length} Active
          </span>
          <span className="px-3 py-1.5 bg-slate-100 text-slate-600 dark:bg-dark-800 dark:text-dark-400 rounded-full text-xs font-bold">
            {redeemed.length} Used
          </span>
        </div>
      </div>

      {/* Active Passes */}
      {active.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Active Now
          </h2>
          {active.map(pass => {
            const grad = CATEGORY_GRADIENTS[pass.category] || CATEGORY_GRADIENTS.other;
            return (
              <div key={pass._id} className={`bg-gradient-to-br ${grad} border-2 rounded-2xl p-5 shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-3xl">{CATEGORY_ICONS[pass.category] || '🎫'}</span>
                      <div>
                        <h3 className="font-bold text-dark-900 dark:text-white text-lg">{pass.name}</h3>
                        {pass.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pass.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        ⏰ {new Date(pass.activeFrom).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} – {new Date(pass.activeUntil).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full font-bold capitalize">{pass.category}</span>
                    </div>

                    {/* Two options: tap redeem OR show QR */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button onClick={() => handleTapRedeem(pass._id)}
                        disabled={redeeming === pass._id}
                        className="py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 text-sm">
                        {redeeming === pass._id ? '⏳ Redeeming...' : '✨ Tap to Redeem'}
                      </button>
                      <button onClick={() => setExpandedQR(expandedQR === pass._id ? null : pass._id)}
                        className="py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition text-sm">
                        {expandedQR === pass._id ? '🔽 Hide QR' : '📱 Show QR'}
                      </button>
                    </div>
                  </div>

                  {/* Small QR always visible on desktop */}
                  <div className="hidden sm:flex flex-col items-center flex-shrink-0">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition"
                      onClick={() => setExpandedQR(expandedQR === pass._id ? null : pass._id)}>
                      <QRCodeSVG value={pass.qrToken || 'invalid'} size={90} level="M" />
                    </div>
                    <p className="text-[9px] text-center text-slate-400 mt-1.5">Tap to enlarge</p>
                  </div>
                </div>

                {/* Expanded QR Overlay */}
                {expandedQR === pass._id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col items-center animate-fade-in">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                      <QRCodeSVG value={pass.qrToken || 'invalid'} size={220} level="H" />
                    </div>
                    <p className="text-xs text-slate-500 mt-3 text-center">Show this QR code to a volunteer for redemption</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Redeemed */}
      {redeemed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">✅ Redeemed</h2>
          {redeemed.map(pass => (
            <div key={pass._id} className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl p-4 opacity-60">
              <div className="flex items-center gap-3">
                <span className="text-xl">{CATEGORY_ICONS[pass.category] || '🎫'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-600 dark:text-slate-400 line-through">{pass.name}</h3>
                  <p className="text-[10px] text-slate-400 capitalize">{pass.category}</p>
                </div>
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Used
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-500">⏰ Upcoming</h2>
          {upcoming.map(pass => (
            <div key={pass._id} className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">{CATEGORY_ICONS[pass.category] || '🎫'}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-dark-900 dark:text-white">{pass.name}</h3>
                  <p className="text-xs text-slate-500">
                    Opens at {new Date(pass.activeFrom).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded-full text-xs font-bold">⏰ Soon</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {wallet.length === 0 && (
        <div className="text-center py-16 text-dark-400">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-dark-800 flex items-center justify-center">
            <span className="text-4xl">🎫</span>
          </div>
          <p className="font-medium text-lg">No meal passes available yet</p>
          <p className="text-sm mt-1">Check back when the organizers publish passes</p>
        </div>
      )}

      {/* Full-screen QR Modal */}
      {expandedQR && (
        <div className="sm:hidden fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setExpandedQR(null)}>
          {/* This shows only on mobile since desktop has inline expand */}
        </div>
      )}
    </div>
  );
};

export default CouponWallet;
