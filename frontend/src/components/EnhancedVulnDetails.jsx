import React, { useState, useEffect } from 'react';

const EnhancedVulnDetails = ({ vulnerabilityId, onClose }) => {
  const [vulnerability, setVulnerability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;

  useEffect(() => {
    if (vulnerabilityId) {
      fetchVulnerabilityDetails();
    }
  }, [vulnerabilityId]);

  const fetchVulnerabilityDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/vulnerability/${vulnerabilityId}`);
      const data = await response.json();
      setVulnerability(data.vulnerability);
    } catch (error) {
      console.error('Error fetching vulnerability details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const badges = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-blue-500 text-white'
    };
    return badges[severity] || 'bg-gray-500 text-white';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatHeaders = (headersString) => {
    if (!headersString) return [];
    return headersString.split('\n').filter(h => h.trim());
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md">
          <div className="text-center text-gray-400">Loading vulnerability details...</div>
        </div>
      </div>
    );
  }

  if (!vulnerability) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md">
          <div className="text-center text-red-400">Vulnerability not found</div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-6xl w-full my-8">
        <div className="flex justify-between items-center p-6 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white">Vulnerability Details</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getSeverityBadge(vulnerability.severity)}`}>
              {vulnerability.severity?.toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="flex border-b border-gray-700 sticky top-16 bg-gray-800 z-10">
          {['overview', 'technical', 'http', 'poc', 'remediation'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900/30'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-250px)]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="text-white font-semibold mb-3 text-lg">{vulnerability.title || vulnerability.type}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {vulnerability.description || 'No description available.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-white font-semibold mb-3">Vulnerability Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white font-mono">{vulnerability.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Severity:</span>
                      <span className={`font-semibold ${
                        vulnerability.severity === 'critical' ? 'text-red-400' :
                        vulnerability.severity === 'high' ? 'text-orange-400' :
                        vulnerability.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                      }`}>
                        {vulnerability.severity?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confidence:</span>
                      <span className="text-white">{vulnerability.confidence_score || vulnerability.confidence || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Detected:</span>
                      <span className="text-white">{formatDate(vulnerability.discovered_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-white font-semibold mb-3">Target Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">URL:</span>
                      <div className="text-white font-mono text-xs break-all mt-1">
                        {vulnerability.affected_url || vulnerability.url}
                      </div>
                    </div>
                    {vulnerability.parameter && (
                      <div>
                        <span className="text-gray-400">Parameter:</span>
                        <div className="text-white font-mono text-xs mt-1">
                          {vulnerability.parameter}
                        </div>
                      </div>
                    )}
                    {vulnerability.endpoint && (
                      <div>
                        <span className="text-gray-400">Endpoint:</span>
                        <div className="text-white font-mono text-xs mt-1">
                          {vulnerability.endpoint}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-4">
              {vulnerability.technical_details && (
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-white font-semibold mb-3">Technical Details</h4>
                  <pre className="bg-gray-800 p-3 rounded text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                    {typeof vulnerability.technical_details === 'string'
                      ? vulnerability.technical_details
                      : JSON.stringify(vulnerability.technical_details, null, 2)}
                  </pre>
                </div>
              )}

              {vulnerability.parameter && (
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-white font-semibold mb-3">Vulnerable Parameter</h4>
                  <div className="bg-gray-800 p-3 rounded">
                    <code className="text-blue-400">{vulnerability.parameter}</code>
                  </div>
                </div>
              )}

              {vulnerability.payload && (
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-white font-semibold mb-3">Exploit Payload</h4>
                  <pre className="bg-gray-800 p-3 rounded text-sm text-green-400 overflow-x-auto">
                    {vulnerability.payload}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'http' && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-lg">HTTP Request/Response History</h3>
              {!vulnerability.http_history || vulnerability.http_history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No HTTP history available</div>
              ) : (
                vulnerability.http_history.map((req, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                    <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
                      <div>
                        <span className="text-white font-semibold font-mono">{req.method}</span>
                        <span className="text-gray-400 ml-3 text-sm">{req.url}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className={`px-2 py-1 rounded ${
                          req.response_code < 300 ? 'bg-green-900/30 text-green-400' :
                          req.response_code < 400 ? 'bg-blue-900/30 text-blue-400' :
                          req.response_code < 500 ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {req.response_code}
                        </span>
                        <span className="text-gray-400">{req.response_time_ms}ms</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-gray-700">
                      <div className="p-4">
                        <h5 className="text-sm font-semibold text-gray-400 mb-2">Request Headers</h5>
                        <pre className="bg-gray-800 p-2 rounded text-xs text-gray-300 overflow-x-auto max-h-48">
                          {formatHeaders(req.request_headers).join('\n') || 'No headers'}
                        </pre>
                        {req.request_body && (
                          <>
                            <h5 className="text-sm font-semibold text-gray-400 mb-2 mt-3">Request Body</h5>
                            <pre className="bg-gray-800 p-2 rounded text-xs text-gray-300 overflow-x-auto max-h-48">
                              {req.request_body}
                            </pre>
                          </>
                        )}
                      </div>

                      <div className="p-4">
                        <h5 className="text-sm font-semibold text-gray-400 mb-2">Response Headers</h5>
                        <pre className="bg-gray-800 p-2 rounded text-xs text-gray-300 overflow-x-auto max-h-48">
                          {formatHeaders(req.response_headers).join('\n') || 'No headers'}
                        </pre>
                        {req.response_body && (
                          <>
                            <h5 className="text-sm font-semibold text-gray-400 mb-2 mt-3">Response Body</h5>
                            <pre className="bg-gray-800 p-2 rounded text-xs text-gray-300 overflow-x-auto max-h-48">
                              {req.response_body.substring(0, 1000)}
                              {req.response_body.length > 1000 && '...(truncated)'}
                            </pre>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'poc' && (
            <div className="space-y-4">
              {vulnerability.proof_of_concept && (
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-white font-semibold mb-3">Proof of Concept</h4>
                  <pre className="bg-gray-800 p-3 rounded text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                    {vulnerability.proof_of_concept}
                  </pre>
                </div>
              )}
              {vulnerability.reproduction_steps && (
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-white font-semibold mb-3">Reproduction Steps</h4>
                  <div className="text-gray-300 text-sm whitespace-pre-wrap">
                    {vulnerability.reproduction_steps}
                  </div>
                </div>
              )}
              {!vulnerability.proof_of_concept && !vulnerability.reproduction_steps && (
                <div className="text-center py-8 text-gray-500">No proof of concept available</div>
              )}
            </div>
          )}

          {activeTab === 'remediation' && (
            <div className="space-y-4">
              {vulnerability.remediation && (
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-white font-semibold mb-3">Remediation Steps</h4>
                  <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {vulnerability.remediation}
                  </div>
                </div>
              )}
              {vulnerability.references && (
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <h4 className="text-white font-semibold mb-3">References</h4>
                  <div className="text-gray-300 text-sm space-y-2">
                    {vulnerability.references.split('\n').map((ref, i) => (
                      <div key={i}>
                        {ref.startsWith('http') ? (
                          <a href={ref} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            {ref}
                          </a>
                        ) : (
                          <span>{ref}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!vulnerability.remediation && !vulnerability.references && (
                <div className="text-center py-8 text-gray-500">No remediation information available</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedVulnDetails;
