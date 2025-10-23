import React, { useState } from 'react';

const ImportScan = ({ onImportComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [scannerType, setScannerType] = useState('zap');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('scanner_type', scannerType);

      const response = await fetch(`${backendUrl}/api/scan/import`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert(`Successfully imported ${scannerType} scan: ${data.scan_id}`);
        if (onImportComplete) {
          onImportComplete(data.scan_id);
        }
      } else {
        alert(`Import failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import scan report');
    } finally {
      setUploading(false);
      event.target.value = null;
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
        <span>📥</span>
        <span>Import Scan Report</span>
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Scanner Type
          </label>
          <select
            value={scannerType}
            onChange={(e) => setScannerType(e.target.value)}
            disabled={uploading}
            className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="zap">OWASP ZAP</option>
            <option value="burp">Burp Suite</option>
            <option value="nmap">Nmap</option>
            <option value="nessus">Nessus</option>
            <option value="generic">Generic JSON</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Upload Report File
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".json,.xml"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer disabled:opacity-50"
            />
          </div>
        </div>

        {uploading && (
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-blue-300">Importing scan report...</span>
            </div>
          </div>
        )}

        <div className="bg-gray-900/50 rounded-lg p-4 text-sm text-gray-400">
          <p className="mb-2"><strong className="text-white">Supported Formats:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>OWASP ZAP: JSON export</li>
            <li>Burp Suite: JSON export</li>
            <li>Nmap: XML export</li>
            <li>Nessus: JSON export</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ImportScan;
