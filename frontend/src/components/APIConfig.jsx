import React, { useState, useEffect } from 'react';

const APIConfig = () => {
  const [apiKey, setApiKey] = useState('');
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;

  useEffect(() => {
    checkConfig();
  }, []);

  const checkConfig = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/config`);
      const data = await response.json();
      setConfigured(data.ai_enabled);
    } catch (error) {
      console.error('Error checking config:', error);
    }
  };

  const updateConfig = async () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          openrouter_api_key: apiKey
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setConfigured(true);
        setApiKey('');
        alert('API key configured successfully!');
      } else {
        alert('Failed to configure API key');
      }
    } catch (error) {
      console.error('Error updating config:', error);
      alert('Error updating configuration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>🤖</span>
          <span>AI Configuration</span>
        </h2>
        {configured && (
          <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-sm font-medium flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Enabled</span>
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            OpenRouter API Key
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <button
              onClick={updateConfig}
              disabled={loading || !apiKey.trim()}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
          <p className="text-sm text-blue-300 mb-2">
            <strong>What is OpenRouter?</strong>
          </p>
          <p className="text-sm text-gray-400 mb-3">
            OpenRouter provides access to AI models for advanced vulnerability analysis and recommendations.
          </p>
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Get your API key at openrouter.ai
          </a>
        </div>
      </div>
    </div>
  );
};

export default APIConfig;
