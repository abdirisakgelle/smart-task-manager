import React, { useState } from "react";
import { getApiUrl } from "@/utils/apiUtils";

const TestAPI = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🧪 Testing API...');
      const url = getApiUrl('/employees');
      console.log('🌐 URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ API Response:', data);
      setResult(data);
    } catch (err) {
      console.error('❌ API Test Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">API Test</h1>
      
      <button 
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <strong>Success!</strong> API returned {result.length} employees
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify(result.slice(0, 2), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestAPI; 