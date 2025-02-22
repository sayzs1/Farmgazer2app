'use client';

import { useEffect, useState } from 'react';

export default function CheckIP() {
  const [ip, setIP] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIP() {
      try {
        const response = await fetch('/api/check-ip');
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setIP(data.ip);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch IP');
      } finally {
        setLoading(false);
      }
    }

    fetchIP();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">IP Address Check</h1>
        
        {loading ? (
          <div className="text-gray-600">Loading IP address...</div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : (
          <div>
            <p className="text-gray-700 mb-2">Your current IP address is:</p>
            <p className="text-lg font-medium text-gray-900 p-3 bg-gray-50 rounded">{ip}</p>
          </div>
        )}
      </div>
    </div>
  );
}