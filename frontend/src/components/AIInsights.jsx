import React from 'react';

const AIInsights = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
      info: '🔵'
    };
    return icons[severity] || '🔵';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'border-red-500 bg-red-900/20',
      high: 'border-orange-500 bg-orange-900/20',
      medium: 'border-yellow-500 bg-yellow-900/20',
      low: 'border-blue-500 bg-blue-900/20',
      info: 'border-blue-500 bg-blue-900/20'
    };
    return colors[severity] || 'border-gray-500 bg-gray-900/20';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
        <span>🤖</span>
        <span>AI Insights</span>
      </h2>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 transition-all hover:shadow-lg ${getSeverityColor(insight.severity)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getSeverityIcon(insight.severity)}</span>
                <span className="text-sm font-semibold text-gray-300 uppercase">
                  {insight.type.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {insight.confidence}% confidence
              </span>
            </div>

            <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
              {insight.message}
            </div>

            {insight.data && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-xs text-gray-400">
                  {insight.type === 'severity_analysis' && (
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-gray-900/50 rounded p-2 text-center">
                        <div className="text-red-400 font-bold">{insight.data.critical}</div>
                        <div>Critical</div>
                      </div>
                      <div className="bg-gray-900/50 rounded p-2 text-center">
                        <div className="text-orange-400 font-bold">{insight.data.high}</div>
                        <div>High</div>
                      </div>
                      <div className="bg-gray-900/50 rounded p-2 text-center">
                        <div className="text-yellow-400 font-bold">{insight.data.medium}</div>
                        <div>Medium</div>
                      </div>
                      <div className="bg-gray-900/50 rounded p-2 text-center">
                        <div className="text-blue-400 font-bold">{insight.data.low}</div>
                        <div>Low</div>
                      </div>
                    </div>
                  )}
                  {insight.type === 'attack_surface' && (
                    <div className="flex space-x-4">
                      <span>Subdomains: {insight.data.subdomains}</span>
                      <span>Live Hosts: {insight.data.live_hosts}</span>
                      <span>Endpoints: {insight.data.endpoints}</span>
                      <span>Exposure: {insight.data.exposure_score}/100</span>
                    </div>
                  )}
                  {insight.type === 'overall_risk' && (
                    <div className="flex space-x-4">
                      <span>Risk Score: {insight.data.risk_score}/100</span>
                      <span>Vulnerabilities: {insight.data.vulnerability_count}</span>
                      <span>Chains: {insight.data.chain_count}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsights;
