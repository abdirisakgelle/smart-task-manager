import React, { useState } from "react";

const SimpleTest = () => {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testDirectAPI = async () => {
    setLoading(true);
    setResult("");
    
    try {
      console.log("🧪 Testing direct API call...");
      
      // Test 1: Direct fetch without any utilities
      const response = await fetch("/api/employees");
      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("✅ Data received:", data.length, "employees");
      
      setResult(`✅ SUCCESS: Found ${data.length} employees`);
      
    } catch (error) {
      console.error("❌ Error:", error);
      setResult(`❌ ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithHeaders = async () => {
    setLoading(true);
    setResult("");
    
    try {
      console.log("🧪 Testing with headers...");
      
      const response = await fetch("/api/employees", {
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(`✅ SUCCESS with headers: Found ${data.length} employees`);
      
    } catch (error) {
      console.error("❌ Error with headers:", error);
      setResult(`❌ ERROR with headers: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Simple API Test</h1>
      
      <div className="space-y-2">
        <button
          onClick={testDirectAPI}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Direct API"}
        </button>
        
        <button
          onClick={testWithHeaders}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-2"
        >
          {loading ? "Testing..." : "Test with Headers"}
        </button>
      </div>
      
      {result && (
        <div className={`p-4 rounded-lg ${
          result.includes("SUCCESS") 
            ? "bg-green-100 border border-green-400 text-green-700" 
            : "bg-red-100 border border-red-400 text-red-700"
        }`}>
          <strong>Result:</strong> {result}
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        <p>Check the browser console for detailed logs.</p>
        <p>Current URL: {window.location.href}</p>
      </div>
    </div>
  );
};

export default SimpleTest; 