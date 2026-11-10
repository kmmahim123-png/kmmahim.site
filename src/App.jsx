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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 relative">
        <button
          onClick={() => setShowPinModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4"/>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Lock className="w-5 h-5"/>
          </div>
          <div>
            <h3 className="font-bold text-white">Layer-2 Security Gate</h3>
            <p className="text-xs text-slate-400">Enter Personal OS PIN (Default: 2526)</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoFocus
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full text-center tracking-[0.6em] text-xl font-bold py-3 rounded-xl bg-slate-950 border border-slate-800 text-white"
          />
          {error && <p className="text-xs text-red-400 text-center">Invalid PIN. Try 2526.</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white"
          >
            Unlock Private Life OS
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
