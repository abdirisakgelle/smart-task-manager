import React from 'react';
import Card from '@/components/ui/Card';

const ContentAnalytics = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#D2232A]">Content Analytics</h1>
      
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Content Analytics Dashboard</h2>
          <p className="text-gray-600 mb-4">
            This page will contain the content analytics and reporting functionality.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              <strong>Coming Soon:</strong> This feature is under development.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContentAnalytics; 