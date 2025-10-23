// frontend/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import ScanControl from './ScanControl';
import VulnerabilityFeed from './VulnerabilityFeed';
import ChainAlerts from './ChainAlerts';
import ToolActivity from './ToolActivity';
import StatsCards from './StatsCards';
import ProgressBar from './ProgressBar';
import ScanHistory from './ScanHistory';
import BlueprintViewer from './BlueprintViewer';
import Repeater from './Repeater';
import ScannerIntegration from './ScannerIntegration';
import ScanStatistics from './ScanStatistics';
import SpiderProgress from './SpiderProgress';

const Dashboard = () => {
  const { socket, connected } = useWebSocket();
  const [scanStatus, setScanStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [chains, setChains] = useState([]);
  const [toolActivity, setToolActivity] = useState([]);
  const [stats, setStats] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  const [currentScanId, setCurrentScanId] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('connected', (data) => {
      console.log('Backend ready:', data);
    });

    socket.on('scan_started', (data) => {
      console.log('Scan started:', data);
      setScanStatus('running');
      setProgress(0);
      setVulnerabilities([]);
      setChains([]);
      setToolActivity([]);
      setStats({ critical: 0, high: 0, medium: 0, low: 0 });
      setCurrentScanId(data.scan_id);
    });

    socket.on('scan_progress', (data) => {
      setProgress(data.progress);
      setCurrentPhase(data.phase);
    });

    socket.on('tool_started', (data) => {
      setToolActivity(prev => [{
        tool: data.tool,
        target: data.target,
        status: 'running',
        timestamp: data.timestamp
      }, ...prev].slice(0, 10));
    });

    socket.on('tool_completed', (data) => {
      setToolActivity(prev => 
        prev.map(item => 
          item.tool === data.tool 
            ? { ...item, status: 'completed', findings: data.findings_count }
            : item
        )
      );
    });

    socket.on('vulnerability_found', (data) => {
      const newVuln = {
        ...data,
        id: Date.now() + Math.random()
      };
      
      setVulnerabilities(prev => [newVuln, ...prev]);
      
      setStats(prev => ({
        ...prev,
        [data.severity]: prev[data.severity] + 1
      }));
      
      showNotification(data);
    });

    socket.on('chain_detected', (data) => {
      const newChain = {
        ...data,
        id: Date.now() + Math.random()
      };
      
      setChains(prev => [newChain, ...prev]);
      showChainNotification(data);
    });

    socket.on('scan_completed', (data) => {
      console.log('Scan completed:', data);
      setScanStatus('completed');
      setProgress(100);
      showCompletionNotification(data);
    });

    socket.on('scan_error', (data) => {
      console.error('Scan error:', data);
      setScanStatus('error');
      alert(`Scan error: ${data.error}`);
    });

    return () => {
      socket.off('connected');
      socket.off('scan_started');
      socket.off('scan_progress');
      socket.off('tool_started');
      socket.off('tool_completed');
      socket.off('vulnerability_found');
      socket.off('chain_detected');
      socket.off('scan_completed');
      socket.off('scan_error');
    };
  }, [socket]);

  const showNotification = (vuln) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🔍 Vulnerability Found', {
        body: `${vuln.severity.toUpperCase()}: ${vuln.title}`,
      });
    }
  };

  const showChainNotification = (chain) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('⚠️ Attack Chain Detected!', {
        body: chain.name,
        requireInteraction: true
      });
    }
  };

  const showCompletionNotification = (data) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('✅ Scan Complete', {
        body: `Found ${data.results_summary?.vulnerabilities_count || 0} vulnerabilities`,
      });
    }
  };

  const startScan = (target, mode, options = {}) => {
    if (socket && connected) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      socket.emit('start_scan', {
        target: target,
        mode: mode,
        intensity: options.intensity || 'normal',
        auth: options.auth || {},
        policy: options.policy || {},
        spiderConfig: options.spiderConfig || {},
        tools: options.tools || {
          nmap: true,
          theHarvester: true,
          amass: true,
          whois: true,
          ffuf: true,
          gobuster: true,
          sqlmap: true,
          nikto: true,
          wpscan: true,
          nuclei: true,
          customScanner: true
        }
      });
    } else {
      alert('Not connected to backend. Please check the connection.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                CyberSage v2.0 Professional
              </h1>
              <p className="text-gray-400">Elite Vulnerability Intelligence Platform with Professional Tools</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${connected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">{connected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Warning */}
        {!connected && (
          <div className="mb-8 bg-red-900/30 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 font-medium">
              ⚠️ Not connected to backend. Make sure the backend is running on http://localhost:5000
            </p>
          </div>
        )}

        {/* Scan Control */}
        <div className="mb-8">
          <ScanControl 
            onStartScan={startScan} 
            scanStatus={scanStatus}
            connected={connected}
          />
        </div>

        {/* Progress Bar */}
        {scanStatus === 'running' && (
          <div className="mb-8 animate-slide-in">
            <ProgressBar progress={progress} phase={currentPhase} />
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards stats={stats} chains={chains.length} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <VulnerabilityFeed vulnerabilities={vulnerabilities} />
            
            {/* Chain Alerts */}
            {chains.length > 0 && (
              <ChainAlerts chains={chains} />
            )}
            
            <ScanHistory />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Tool Activity */}
            <ToolActivity activity={toolActivity} />
            
            {/* Blueprint Viewer */}
            <BlueprintViewer scanId={currentScanId} />
            
            {/* Spider Progress */}
            <SpiderProgress scanId={currentScanId} isActive={scanStatus === 'running'} />
            
            {/* Repeater */}
            <Repeater currentScanId={currentScanId} />
            
            {/* Scanner Integration */}
            <ScannerIntegration currentScanId={currentScanId} />
            
            {/* Scan Statistics */}
            <ScanStatistics scanId={currentScanId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;