import { useState, useEffect, useRef } from 'react';
import volunteerApi from '../../../services/volunteerService';
import toast from 'react-hot-toast';

const Icon = ({ d, className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);

const ICONS = {
  scanner: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm12 4a3 3 0 11-6 0 3 3 0 016 0z',
  camera: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  stop: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 9h6v6H9z',
  mobile: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  manual: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14'
};

const QRScanner = () => {
  const [manualTeamId, setManualTeamId] = useState('');
  const [selectedPass, setSelectedPass] = useState('');
  const [passes, setPasses] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const html5QrRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    volunteerApi.getMealPasses().then(res => {
      const all = res.data.data?.passes || [];
      const active = all.filter(p => {
        const now = new Date();
        return p.isActive && new Date(p.activeFrom) <= now && new Date(p.activeUntil) >= now;
      });
      setPasses(active);
      if (active.length > 0) setSelectedPass(active[0]._id);
    }).catch(() => {});
  }, []);

  const startScanner = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('qr-reader');
      html5QrRef.current = scanner;
      setScanning(true);

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 15, qrbox: { width: 280, height: 280 }, aspectRatio: 1 },
        async (decodedText) => {
          try { await scanner.stop(); } catch {}
          setScanning(false);
          // Haptic feedback on mobile
          if (navigator.vibrate) navigator.vibrate(200);
          handleQRRedeem(decodedText);
        },
        () => {}
      );
    } catch (err) {
      toast.error('Camera access denied or not available');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
    }
    setScanning(false);
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      const el = containerRef.current;
      if (el?.requestFullscreen) el.requestFullscreen();
      else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
    setFullscreen(!fullscreen);
  };

  // Listen for fullscreen exit via Escape key
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, []);

  const handleQRRedeem = async (qrData) => {
    try {
      const { data } = await volunteerApi.redeemByQR(qrData);
      setLastResult({ success: true, message: data.message, data: data.data });
      toast.success(data.message);
    } catch (err) {
      const msg = err.response?.data?.message || 'Redemption failed';
      setLastResult({ success: false, message: msg });
      toast.error(msg);
    }
  };

  const handleManualRedeem = async (e) => {
    e.preventDefault();
    if (!manualTeamId || !selectedPass) return toast.error('Enter team ID and select a pass');
    try {
      const { data } = await volunteerApi.redeemByTeamId(manualTeamId, selectedPass);
      setLastResult({ success: true, message: data.message, data: data.data });
      toast.success(data.message);
      setManualTeamId('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Redemption failed';
      setLastResult({ success: false, message: msg });
      toast.error(msg);
    }
  };

  return (
    <div ref={containerRef} className={`space-y-6 animate-fade-in max-w-lg mx-auto ${fullscreen ? 'fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center p-4 max-w-none' : ''}`}>
      {/* Header */}
      <div className={`flex items-center justify-between ${fullscreen ? 'w-full max-w-lg' : ''}`}>
        <h1 className={`text-2xl font-bold flex items-center gap-3 ${fullscreen ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
          <Icon d={ICONS.scanner} className="w-8 h-8" /> QR Scanner
        </h1>
        <button onClick={toggleFullscreen}
          className={`p-2.5 rounded-xl text-sm font-bold transition ${fullscreen ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
          title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
          {fullscreen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
          )}
        </button>
      </div>

      {/* Camera Scanner Card */}
      <div className={`rounded-2xl overflow-hidden shadow-lg border ${fullscreen ? 'w-full max-w-lg bg-slate-900 border-slate-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
        <div className={`p-4 flex items-center justify-between border-b ${fullscreen ? 'border-slate-700' : 'border-slate-100 dark:border-slate-800'}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${scanning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <h3 className={`font-semibold text-sm ${fullscreen ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {scanning ? 'Scanning... Point at QR Code' : 'Camera Ready'}
            </h3>
          </div>
          {!scanning ? (
            <button onClick={startScanner} className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2">
              <Icon d={ICONS.camera} className="w-5 h-5" /> Start Camera
            </button>
          ) : (
            <button onClick={stopScanner} className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition shadow-md active:scale-95 flex items-center gap-2">
              <Icon d={ICONS.stop} className="w-5 h-5" /> Stop
            </button>
          )}
        </div>

        {/* QR Reader viewport */}
        <div className="relative">
          <div id="qr-reader" className="w-full" style={{ minHeight: scanning ? (fullscreen ? 400 : 320) : 0 }} />
          {!scanning && (
            <div className={`p-10 text-center ${fullscreen ? 'text-slate-400' : 'text-slate-400'}`}>
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Icon d={ICONS.mobile} className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-sm font-medium">Tap "Start Camera" to begin scanning</p>
              <p className="text-xs mt-1 text-slate-400">Position the QR code within the scanner frame</p>
            </div>
          )}
        </div>
      </div>

      {/* Result Indicator */}
      {lastResult && (
        <div className={`rounded-2xl p-5 border-2 animate-fade-in ${fullscreen ? 'w-full max-w-lg' : ''} ${lastResult.success ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20' : 'bg-red-50 border-red-500 dark:bg-red-900/20'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${lastResult.success ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
              {lastResult.success ? <Icon d={ICONS.success} className="w-8 h-8 text-emerald-600" /> : <Icon d={ICONS.warning} className="w-8 h-8 text-red-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-bold text-lg ${lastResult.success ? 'text-emerald-800 dark:text-emerald-300' : 'text-red-800 dark:text-red-300'}`}>
                {lastResult.success ? 'Redemption Successful' : 'Redemption Failed'}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{lastResult.message}</p>
              {lastResult.data && (
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Team: {lastResult.data.teamName} ({lastResult.data.teamId})
                </p>
              )}
            </div>
          </div>
          <button onClick={() => setLastResult(null)} className="mt-3 w-full py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition">
            Dismiss & Scan Next
          </button>
        </div>
      )}

      {/* Manual Entry — hide in fullscreen */}
      {!fullscreen && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
              <Icon d={ICONS.manual} className="w-5 h-5" />
            </span>
            Manual Entry
          </h3>
          <form onSubmit={handleManualRedeem} className="space-y-3">
            <input type="text" value={manualTeamId} onChange={e => setManualTeamId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter Team ID (e.g., TEAM001)" />
            <select value={selectedPass} onChange={e => setSelectedPass(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
              {passes.length === 0 && <option value="">No active passes right now</option>}
              {passes.map(p => <option key={p._id} value={p._id}>{p.name} ({p.category})</option>)}
            </select>
            <button type="submit" disabled={passes.length === 0}
              className="w-full py-3 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-900 transition disabled:opacity-50 active:scale-[0.98]">
              <div className="flex items-center justify-center gap-2">
                <Icon d={ICONS.success} className="w-5 h-5" /> Redeem Pass
              </div>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
