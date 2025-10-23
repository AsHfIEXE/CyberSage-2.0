import React, { useState } from 'react';

const ScanControl = ({ onStartScan, onCancelScan, scanStatus, connected, currentScanId }) => {
  const [target, setTarget] = useState('');
  const [scanMode, setScanMode] = useState('elite');
  const [intensity, setIntensity] = useState('normal');
  const [auth, setAuth] = useState({ username: '', password: '' });
  const [spiderConfig, setSpiderConfig] = useState({
    maxDepth: 2,
    maxPages: 30,
    timeout: 10,
    enableAjax: true,
    enableForms: true,
    enableButtons: true,
    enableNetworkMonitoring: true
  });

  const handleStartScan = (e) => {
    e.preventDefault();
    
    if (!target.trim()) {
      alert('Please enter a target URL or domain');
      return;
    }
    
    if (!connected) {
      alert('Not connected to backend');
      return;
    }
    
    // Policy object can be added here if needed in the future
    onStartScan(target, scanMode, { intensity, auth, policy: {}, spiderConfig });
  };

  const isScanning = scanStatus === 'running';

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 shadow-xl">
      <form onSubmit={handleStartScan} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Target URL or Domain
          </label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="https://example.com or example.com"
            disabled={isScanning}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Scan Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setScanMode('quick')}
              disabled={isScanning}
              className={`px-4 py-3 rounded-lg font-medium transition ${
                scanMode === 'quick'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              ⚡ Quick
            </button>
            <button
              type="button"
              onClick={() => setScanMode('standard')}
              disabled={isScanning}
              className={`px-4 py-3 rounded-lg font-medium transition ${
                scanMode === 'standard'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              🔍 Standard
            </button>
            <button
              type="button"
              onClick={() => setScanMode('elite')}
              disabled={isScanning}
              className={`px-4 py-3 rounded-lg font-medium transition ${
                scanMode === 'elite'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              🧠 Elite
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {scanMode === 'quick' && '~5 mins: Basic vulnerabilities'}
            {scanMode === 'standard' && '~15 mins: Comprehensive scan'}
            {scanMode === 'elite' && '~30 mins: Advanced detection + AI analysis'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Scan Intensity
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setIntensity('light')}
              disabled={isScanning}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                intensity === 'light'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              🟢 Light
            </button>
            <button
              type="button"
              onClick={() => setIntensity('normal')}
              disabled={isScanning}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                intensity === 'normal'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              🟡 Normal
            </button>
            <button
              type="button"
              onClick={() => setIntensity('aggressive')}
              disabled={isScanning}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                intensity === 'aggressive'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              🔴 Aggressive
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Authentication (Optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={auth.username}
              onChange={(e) => setAuth(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Username"
              disabled={isScanning}
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
            <input
              type="password"
              value={auth.password}
              onChange={(e) => setAuth(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Password"
              disabled={isScanning}
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Spider Configuration */}
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-semibold mb-3">🤖 AJAX Spider Settings</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Max Depth</label>
              <input
                type="number"
                min="1"
                max="5"
                value={spiderConfig.maxDepth}
                onChange={(e) => setSpiderConfig(prev => ({ ...prev, maxDepth: parseInt(e.target.value) }))}
                disabled={isScanning}
                className="w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Max Pages</label>
              <input
                type="number"
                min="10"
                max="100"
                value={spiderConfig.maxPages}
                onChange={(e) => setSpiderConfig(prev => ({ ...prev, maxPages: parseInt(e.target.value) }))}
                disabled={isScanning}
                className="w-full px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={spiderConfig.enableAjax}
                onChange={(e) => setSpiderConfig(prev => ({ ...prev, enableAjax: e.target.checked }))}
                disabled={isScanning}
                className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-700 rounded focus:ring-purple-500 disabled:opacity-50"
              />
              <span className="text-gray-300 text-sm">Enable AJAX-aware crawling</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={spiderConfig.enableForms}
                onChange={(e) => setSpiderConfig(prev => ({ ...prev, enableForms: e.target.checked }))}
                disabled={isScanning}
                className="w-4 h-4 text-purple-600 bg-gray-900 border-gray-700 rounded focus:ring-purple-500 disabled:opacity-50"
              />
              <span className="text-gray-300 text-sm">Interact with forms</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            type="submit"
            disabled={isScanning || !connected}
            className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition transform ${
              isScanning
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95'
            } text-white shadow-lg disabled:opacity-50`}
          >
            {isScanning ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scanning in Progress...
              </span>
            ) : (
              '🚀 Start Elite Scan'
            )}
          </button>

          {isScanning && currentScanId && (
            <button
              type="button"
              onClick={() => onCancelScan && onCancelScan(currentScanId)}
              className="w-full px-6 py-3 rounded-lg font-bold text-lg transition transform bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 text-white shadow-lg"
            >
              ⛔ Cancel Scan
            </button>
          )}
        </div>
      </form>

      {scanStatus === 'completed' && (
        <div className="mt-4 p-4 bg-green-900/30 border border-green-700 rounded-lg">
          <p className="text-green-400 font-medium">✅ Scan completed successfully!</p>
        </div>
      )}

      {scanStatus === 'error' && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
          <p className="text-red-400 font-medium">❌ Scan failed. Please try again.</p>
        </div>
      )}
    </div>
  );
};

export default ScanControl;