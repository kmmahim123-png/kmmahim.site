import React, { useState } from 'react';
import { OSProvider, useOS } from './context/OSContext';
import Layer1Public from './components/Layer1Public';
import Layer2Shell from './components/Layer2Shell';
import { Lock, X, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App Error Caught by Boundary:', error, errorInfo);
  }
  handleReset = () => {
    try {
      localStorage.removeItem('KM_MAHIM_LIFE_OS_V1');
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#05070e] text-slate-100 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
              OS
            </div>
            <h2 className="text-xl font-bold text-white">System Handshake Protocol</h2>
            <p className="text-xs text-slate-400">
              The application recovered from an unexpected state. Click below to refresh the workspace cleanly.
            </p>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 mx-auto transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh & Restore OS</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function SecretPinModal() {
  const { showPinModal, setShowPinModal, verifyPin } = useOS();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!showPinModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (verifyPin(pin)) {
      setPin('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-black/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.12)] rounded-[28px] max-w-sm w-full p-7 space-y-5 relative text-[#1d1d1f]">
        <button
          onClick={() => setShowPinModal(false)}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#f5f5f7] border border-black/[0.06] flex items-center justify-center text-[#1d1d1f]">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-base text-[#1d1d1f]">Private Workspace</h3>
            <p className="text-xs text-[#6e6e73]">Enter passcode to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoFocus
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full text-center tracking-[0.6em] text-xl font-semibold py-3.5 rounded-2xl bg-[#f5f5f7] border border-transparent focus:border-[#1d1d1f] focus:bg-white text-[#1d1d1f] outline-none transition-all"
          />
          {error && <p className="text-xs text-[#ff3b30] text-center font-medium">Incorrect passcode.</p>}
          <button
            type="submit"
            className="w-full py-3.5 rounded-full bg-[#1d1d1f] hover:bg-black font-medium text-sm text-white transition-all active:scale-[0.99]"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}

function MainRouter() {
  const { activeLayer } = useOS();
  return (
    <>
      <SecretPinModal/>
      {activeLayer === 'private' ? <Layer2Shell/> : <Layer1Public/>}
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <OSProvider>
        <MainRouter/>
      </OSProvider>
    </ErrorBoundary>
  );
}
