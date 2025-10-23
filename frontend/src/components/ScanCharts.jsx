import React, { useState, useEffect } from 'react';

const ScanCharts = ({ scanId }) => {
  const [statistics, setStatistics] = useState(null);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;

  useEffect(() => {
    if (scanId) {
      loadData();
    }
  }, [scanId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, scanRes] = await Promise.all([
        fetch(`${backendUrl}/api/scan/${scanId}/statistics`),
        fetch(`${backendUrl}/api/scan/${scanId}`)
      ]);

      const statsData = await statsRes.json();
      const scanData = await scanRes.json();

      setStatistics(statsData.statistics);
      setVulnerabilities(scanData.vulnerabilities || []);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityCount = (severity) => {
    return vulnerabilities.filter(v => v.severity === severity).length;
  };

  const getSeverityPercentage = (severity) => {
    const total = vulnerabilities.length;
    if (total === 0) return 0;
    return ((getSeverityCount(severity) / total) * 100).toFixed(1);
  };

  const getTypeDistribution = () => {
    const types = {};
    vulnerabilities.forEach(v => {
      const type = v.type || 'Unknown';
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  if (!scanId) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="text-center text-gray-500">Select a scan to view charts</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="text-center text-gray-400">Loading charts...</div>
      </div>
    );
  }

  const criticalCount = getSeverityCount('critical');
  const highCount = getSeverityCount('high');
  const mediumCount = getSeverityCount('medium');
  const lowCount = getSeverityCount('low');
  const total = vulnerabilities.length;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
        <span>📊</span>
        <span>Scan Analytics</span>
      </h2>

      <div className="space-y-6">
        {/* Severity Distribution Chart */}
        <div>
          <h3 className="text-white font-semibold mb-3">Severity Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Critical', count: criticalCount, color: 'bg-red-500', textColor: 'text-red-400' },
              { label: 'High', count: highCount, color: 'bg-orange-500', textColor: 'text-orange-400' },
              { label: 'Medium', count: mediumCount, color: 'bg-yellow-500', textColor: 'text-yellow-400' },
              { label: 'Low', count: lowCount, color: 'bg-blue-500', textColor: 'text-blue-400' }
            ].map(({ label, count, color, textColor }) => {
              const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-sm font-medium ${textColor}`}>{label}</span>
                    <span className="text-sm text-gray-400">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`${color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pie Chart Alternative (Visual Representation) */}
        <div>
          <h3 className="text-white font-semibold mb-3">Vulnerability Breakdown</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-red-400">{criticalCount}</div>
              <div className="text-xs text-red-300">Critical</div>
              <div className="text-xs text-gray-400 mt-1">{getSeverityPercentage('critical')}%</div>
            </div>
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-400">{highCount}</div>
              <div className="text-xs text-orange-300">High</div>
              <div className="text-xs text-gray-400 mt-1">{getSeverityPercentage('high')}%</div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-400">{mediumCount}</div>
              <div className="text-xs text-yellow-300">Medium</div>
              <div className="text-xs text-gray-400 mt-1">{getSeverityPercentage('medium')}%</div>
            </div>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-400">{lowCount}</div>
              <div className="text-xs text-blue-300">Low</div>
              <div className="text-xs text-gray-400 mt-1">{getSeverityPercentage('low')}%</div>
            </div>
          </div>
        </div>

        {/* Top Vulnerability Types */}
        {getTypeDistribution().length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-3">Top Vulnerability Types</h3>
            <div className="space-y-2">
              {getTypeDistribution().map(([type, count], index) => {
                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                const colors = [
                  'bg-purple-500',
                  'bg-pink-500',
                  'bg-indigo-500',
                  'bg-cyan-500',
                  'bg-teal-500'
                ];
                return (
                  <div key={type} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${colors[index]} rounded flex items-center justify-center text-white text-xs font-bold`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white truncate">{type}</div>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className={`${colors[index]} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">{count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistics Overview */}
        {statistics && (
          <div>
            <h3 className="text-white font-semibold mb-3">Scan Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(statistics).slice(0, 6).map(([key, value]) => (
                <div key={key} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                  <div className="text-2xl font-bold text-white">{value || 0}</div>
                  <div className="text-xs text-gray-400 capitalize">{key.replace(/_/g, ' ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Score */}
        <div>
          <h3 className="text-white font-semibold mb-3">Overall Risk Score</h3>
          <div className="relative">
            {(() => {
              const riskScore = Math.min(100, (criticalCount * 10 + highCount * 7 + mediumCount * 4 + lowCount * 1));
              const getRiskLevel = (score) => {
                if (score >= 80) return { label: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500' };
                if (score >= 60) return { label: 'HIGH', color: 'text-orange-400', bg: 'bg-orange-500' };
                if (score >= 40) return { label: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-500' };
                return { label: 'LOW', color: 'text-green-400', bg: 'bg-green-500' };
              };
              const risk = getRiskLevel(riskScore);

              return (
                <>
                  <div className="bg-gray-700 rounded-full h-8">
                    <div
                      className={`${risk.bg} h-8 rounded-full flex items-center justify-center transition-all duration-1000`}
                      style={{ width: `${riskScore}%` }}
                    >
                      <span className="text-white text-sm font-bold">{riskScore}/100</span>
                    </div>
                  </div>
                  <div className={`text-center mt-2 text-lg font-bold ${risk.color}`}>
                    {risk.label} RISK
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanCharts;
