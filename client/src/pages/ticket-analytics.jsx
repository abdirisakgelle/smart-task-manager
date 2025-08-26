import React from 'react';
import Card from '@/components/ui/Card';

const TicketAnalytics = () => {
  return (
    <div className="p-6">
      <h1 className="text-heading-2 mb-6 text-red-600">Ticket Analytics</h1>
      
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Ticket Analytics Dashboard</h2>
          <p className="text-gray-600 mb-4">
            This page will contain the ticket analytics and reporting functionality.
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

export default TicketAnalytics; 