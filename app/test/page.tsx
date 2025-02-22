'use client';

import { useEffect, useState } from 'react';

interface TestResult {
  status: 'loading' | 'success' | 'error';
  message?: string;
  count?: number;
  error?: string;
}

export default function TestConnection() {
  const [result, setResult] = useState<TestResult>({ status: 'loading' });

  useEffect(() => {
    async function testConnection() {
      try {
        const response = await fetch('/api/test-db');
        const data = await response.json();
        
        if (data.status === 'success') {
          setResult({ 
            status: 'success',
            message: data.message,
            count: data.count
          });
        } else {
          throw new Error(data.error || data.message || '连接测试失败');
        }
      } catch (err) {
        setResult({ 
          status: 'error',
          error: err instanceof Error ? err.message : '发生未知错误'
        });
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">数据库连接测试</h1>
        
        {result.status === 'loading' && (
          <div className="text-gray-600">正在测试数据库连接...</div>
        )}
        
        {result.status === 'success' && (
          <div className="text-green-600">
            <p className="font-medium">{result.message}</p>
            <p className="mt-2 text-sm">数据库中的图片数量: {result.count}</p>
          </div>
        )}
        
        {result.status === 'error' && (
          <div className="text-red-600">
            <p className="font-medium">连接错误</p>
            {result.error && <p className="mt-2 text-sm">{result.error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}