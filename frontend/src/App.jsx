import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// ============================================================================
// CYBERSAGE V2.0 - COMPLETE FIXED VERSION WITH ALL COMPONENTS
// ============================================================================

const CyberSageApp = () => {
  // WebSocket connection
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  
  // Navigation
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Scan state
  const [scanStatus, setScanStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [currentScanId, setCurrentScanId] = useState(null);
  
  // Data
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [chains, setChains] = useState([]);
  const [toolActivity, setToolActivity] = useState([]);
  const [stats, setStats] = useState({ critical: 0, high: 0, medium: 0, low: 0 });
  const [aiInsights, setAiInsights] = useState([]);
  const [correlations, setCorrelations] = useState([]);

  // WebSocket setup
  useEffect(() => {
    const backendUrl = 'http://localhost:5000';
    
    const newSocket = io(`${backendUrl}/scan`, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket Connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket Disconnected');
      setConnected(false);
    });

    newSocket.on('scan_started', (data) => {
      setScanStatus('running');
      setProgress(0);
      setVulnerabilities([]);
      setChains([]);
      setToolActivity([]);
      setStats({ critical: 0, high: 0, medium: 0, low: 0 });
      setCurrentScanId(data.scan_id);
      setAiInsights([]);
      setCorrelations([]);
    });

    newSocket.on('scan_progress', (data) => {
      setProgress(data.progress);
      setCurrentPhase(data.phase);
    });

    newSocket.on('tool_started', (data) => {
      setToolActivity(prev => [{
        tool: data.tool,
        target: data.target,
        status: 'running',
        timestamp: data.timestamp
      }, ...prev].slice(0, 10));
    });

    newSocket.on('tool_completed', (data) => {
      setToolActivity(prev => 
        prev.map(item => 
          item.tool === data.tool 
            ? { ...item, status: 'completed', findings: data.findings_count }
            : item
        )
      );
    });

    newSocket.on('vulnerability_found', (data) => {
      const newVuln = { ...data, id: Date.now() + Math.random() };
      setVulnerabilities(prev => {
        const updated = [newVuln, ...prev];
        detectCorrelations(updated);
        return updated;
      });
      setStats(prev => ({
        ...prev,
        [data.severity]: prev[data.severity] + 1
      }));
    });

    newSocket.on('chain_detected', (data) => {
      setChains(prev => [{ ...data, id: Date.now() }, ...prev]);
    });

    newSocket.on('ai_insight', (data) => {
      setAiInsights(prev => [data, ...prev]);
    });

    newSocket.on('scan_completed', (data) => {
      setScanStatus('completed');
      setProgress(100);
    });

    newSocket.on('scan_error', (data) => {
      setScanStatus('error');
      alert(`Scan error: ${data.error}`);
    });

    setSocket(newSocket);
    
    return () => newSocket.close();
  }, []);

  const detectCorrelations = (vulns) => {
    const newCorrelations = [];
    
    const xssVulns = vulns.filter(v => v.type?.includes('XSS'));
    const corsVulns = vulns.filter(v => v.type?.includes('CORS'));
    
    if (xssVulns.length > 0 && corsVulns.length > 0) {
      newCorrelations.push({
        id: 'corr-xss-cors',
        type: 'correlation',
        title: 'XSS + CORS Misconfiguration',
        severity: 'critical',
        description: 'XSS combined with CORS issues enables cross-origin data theft',
        vulns: [...xssVulns.slice(0, 2), ...corsVulns.slice(0, 1)]
      });
    }

    setCorrelations(newCorrelations);
  };

  const startScan = (target, mode, options = {}) => {
    if (socket && connected) {
      socket.emit('start_scan', {
        target,
        mode,
        intensity: options.intensity || 'normal',
        tools: options.tools || { nmap: true }
      });
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'scanner':
        return <ScannerPage startScan={startScan} connected={connected} scanStatus={scanStatus} />;
      case 'vulnerabilities':
        return <VulnerabilitiesPage vulnerabilities={vulnerabilities} />;
      case 'correlation':
        return <CorrelationPage vulnerabilities={vulnerabilities} correlations={correlations} />;
      case 'repeater':
        return <RepeaterPage currentScanId={currentScanId} />;
      case 'tools':
        return <ToolsPage toolActivity={toolActivity} />;
      case 'history':
        return <HistoryPage />;
      default:
        return <DashboardPage 
          stats={stats}
          vulnerabilities={vulnerabilities}
          scanStatus={scanStatus}
          progress={progress}
          currentPhase={currentPhase}
          correlations={correlations}
          chains={chains}
          currentScanId={currentScanId}
          aiInsights={aiInsights}
          toolActivity={toolActivity}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                CyberSage v2.0 Professional
              </h1>
              <div className="flex space-x-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                  { id: 'scanner', label: 'Scanner', icon: '🎯' },
                  { id: 'vulnerabilities', label: 'Vulnerabilities', icon: '⚠️' },
                  { id: 'correlation', label: 'AI Correlation', icon: '🧠' },
                  { id: 'repeater', label: 'Repeater', icon: '🛰️' },
                  { id: 'tools', label: 'Tools', icon: '🔧' },
                  { id: 'history', label: 'History', icon: '📜' }
                ].map(page => (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPage(page.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      currentPage === page.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span className="mr-2">{page.icon}</span>
                    <span className="hidden md:inline">{page.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm ${
              connected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="font-medium">{connected ? 'Connected' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!connected && (
          <div className="mb-6 bg-red-900/30 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 font-medium">⚠️ Backend not connected. Make sure backend is running on http://localhost:5000</p>
          </div>
        )}
        {renderPage()}
      </main>
    </div>
  );
};

// ============================================================================
// COMPLETE DASHBOARD PAGE - ALL COMPONENTS IN ONE VIEW
// ============================================================================
const DashboardPage = ({ stats, vulnerabilities, scanStatus, progress, currentPhase, correlations, chains, currentScanId, aiInsights, toolActivity }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold">Complete Security Dashboard</h2>
    
    {/* Progress Bar */}
    {scanStatus === 'running' && (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <div className="flex justify-between mb-3">
          <span className="text-gray-300 font-medium">{currentPhase}</span>
          <span className="text-purple-400 font-bold text-lg">{progress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div 
            className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(1, progress)}%` }}
          />
        </div>
      </div>
    )}

    {/* Stats Cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { key: 'critical', label: 'Critical', icon: '🔴', color: 'red' },
        { key: 'high', label: 'High', icon: '🟠', color: 'orange' },
        { key: 'medium', label: 'Medium', icon: '🟡', color: 'yellow' },
        { key: 'low', label: 'Low', icon: '🟢', color: 'blue' }
      ].map(stat => (
        <div key={stat.key} className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-purple-500 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{stat.label}</span>
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <p className="text-3xl font-bold">{stats[stat.key]}</p>
        </div>
      ))}
    </div>

    {/* Two Column Layout for Charts and Insights */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Vulnerability Distribution Chart */}
        {currentScanId && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold mb-4">Vulnerability Distribution</h3>
            <div className="space-y-3">
              {[
                { label: 'Critical', count: stats.critical, color: 'bg-red-500' },
                { label: 'High', count: stats.high, color: 'bg-orange-500' },
                { label: 'Medium', count: stats.medium, color: 'bg-yellow-500' },
                { label: 'Low', count: stats.low, color: 'bg-blue-500' }
              ].map(({ label, count, color }) => {
                const total = Object.values(stats).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">{label}</span>
                      <span className="text-sm text-gray-400">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className={`${color} h-3 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {aiInsights.length > 0 && (
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl border-2 border-purple-500 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">🤖</span>
              AI Insights ({aiInsights.length})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {aiInsights.slice(0, 5).map((insight, idx) => (
                <div key={idx} className="bg-black/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{insight.type?.replace(/_/g, ' ')}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      insight.severity === 'critical' ? 'bg-red-500' :
                      insight.severity === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {insight.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{insight.message?.slice(0, 150)}...</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Tool Activity */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-xl font-bold mb-4">Tool Activity</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {toolActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No active tools</div>
            ) : (
              toolActivity.map((item, idx) => (
                <div key={idx} className="flex items-center p-3 bg-gray-800 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    item.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{item.tool}</p>
                    <p className="text-gray-500 text-xs truncate">{item.target}</p>
                  </div>
                  {item.findings !== undefined && (
                    <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                      {item.findings} found
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scan Statistics */}
        {currentScanId && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-xl font-bold mb-4">Scan Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-gray-400 text-xs">Total Vulns</div>
                <div className="text-2xl font-bold">{vulnerabilities.length}</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-gray-400 text-xs">Attack Chains</div>
                <div className="text-2xl font-bold">{chains.length}</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-gray-400 text-xs">Correlations</div>
                <div className="text-2xl font-bold">{correlations.length}</div>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <div className="text-gray-400 text-xs">Status</div>
                <div className={`text-lg font-bold ${
                  scanStatus === 'running' ? 'text-blue-400' :
                  scanStatus === 'completed' ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {scanStatus.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* AI Correlations */}
    {correlations.length > 0 && (
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl border-2 border-purple-500 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">🧠</span>
          AI Detected {correlations.length} Correlation{correlations.length !== 1 ? 's' : ''}
        </h3>
        <div className="space-y-3">
          {correlations.map(corr => (
            <div key={corr.id} className="bg-black/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold">{corr.title}</h4>
                <span className="px-2 py-1 bg-red-500 rounded text-xs font-bold">
                  {corr.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-300">{corr.description}</p>
              <p className="text-xs text-gray-400 mt-2">Involves {corr.vulns.length} vulnerabilities</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Attack Chains */}
    {chains.length > 0 && (
      <div className="bg-gradient-to-br from-red-900/50 to-pink-900/50 rounded-xl border-2 border-red-500 p-6">
        <h3 className="text-xl font-bold mb-4">⚠️ Attack Chains Detected</h3>
        <div className="space-y-3">
          {chains.map(chain => (
            <div key={chain.id} className="bg-black/30 rounded-lg p-4">
              <h4 className="font-bold">{chain.name}</h4>
              <p className="text-sm text-gray-300 mt-1">{chain.impact}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Recent Vulnerabilities */}
    <div className="bg-gray-900 rounded-xl border border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-xl font-bold">Recent Vulnerabilities</h3>
      </div>
      <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
        {vulnerabilities.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No vulnerabilities detected yet. Start a scan to begin.
          </div>
        ) : (
          vulnerabilities.slice(0, 10).map(vuln => (
            <div key={vuln.id} className="p-4 hover:bg-gray-800/50 transition">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="font-semibold">{vuln.type}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      vuln.severity === 'critical' ? 'bg-red-500' :
                      vuln.severity === 'high' ? 'bg-orange-500' :
                      vuln.severity === 'medium' ? 'bg-yellow-500 text-black' : 'bg-blue-500'
                    }`}>
                      {vuln.severity?.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{vuln.title}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                    <span>Confidence: {vuln.confidence}%</span>
                    <span>Tool: {vuln.tool}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

// ============================================================================
// SCANNER PAGE
// ============================================================================
const ScannerPage = ({ startScan, connected, scanStatus }) => {
  const [target, setTarget] = useState('');
  const [scanMode, setScanMode] = useState('elite');

  const handleStartScan = () => {
    if (!target.trim()) {
      alert('Please enter a target URL or domain');
      return;
    }
    startScan(target, scanMode);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold">Security Scanner</h2>
      
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Target URL or IP</label>
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="https://example.com or 192.168.1.1"
          disabled={scanStatus === 'running'}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <label className="block text-sm font-medium text-gray-300 mb-4">Scan Mode</label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'quick', name: 'Quick', icon: '⚡' },
            { id: 'standard', name: 'Standard', icon: '🔍' },
            { id: 'elite', name: 'Elite', icon: '🧠' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setScanMode(mode.id)}
              disabled={scanStatus === 'running'}
              className={`p-4 rounded-lg border-2 transition ${
                scanMode === mode.id 
                  ? 'border-purple-500 bg-purple-900/20' 
                  : 'border-gray-700 hover:border-gray-600'
              } disabled:opacity-50`}
            >
              <div className="text-3xl mb-2">{mode.icon}</div>
              <div className="font-semibold">{mode.name}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleStartScan}
        disabled={!target || !connected || scanStatus === 'running'}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {scanStatus === 'running' ? 'Scanning...' : '🚀 Start Security Scan'}
      </button>
    </div>
  );
};

// ============================================================================
// OTHER PAGES (SIMPLIFIED)
// ============================================================================
const VulnerabilitiesPage = ({ vulnerabilities }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold">Vulnerabilities ({vulnerabilities.length})</h2>
    <div className="space-y-3">
      {vulnerabilities.map(vuln => (
        <div key={vuln.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="text-lg font-bold">{vuln.type}</h3>
          <p className="text-gray-400 text-sm mt-1">{vuln.title}</p>
        </div>
      ))}
    </div>
  </div>
);

const CorrelationPage = ({ correlations }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold">AI Correlations ({correlations.length})</h2>
    {correlations.map(corr => (
      <div key={corr.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-lg font-bold">{corr.title}</h3>
        <p className="text-gray-400 mt-2">{corr.description}</p>
      </div>
    ))}
  </div>
);

const RepeaterPage = () => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
    <h2 className="text-2xl font-bold mb-4">HTTP Repeater</h2>
    <p className="text-gray-400">Manual HTTP request testing tool</p>
  </div>
);

const ToolsPage = ({ toolActivity }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold">Professional Tools</h2>
    <div className="grid grid-cols-3 gap-4">
      {['Nmap', 'SQLMap', 'Nikto', 'Nuclei', 'Ffuf', 'WPScan'].map(tool => (
        <div key={tool} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="font-bold">{tool}</h3>
        </div>
      ))}
    </div>
  </div>
);

const HistoryPage = () => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
    <h2 className="text-2xl font-bold mb-4">Scan History</h2>
    <p className="text-gray-400">View past scan results</p>
  </div>
);

export default CyberSageApp;