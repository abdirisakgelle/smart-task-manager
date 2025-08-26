import React, { useState, useEffect } from "react";
import DashboardStats from "@/components/DashboardStats";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { getApiUrl } from "@/utils/apiUtils";

const FollowUpDashboard = () => {
  const [followUpData, setFollowUpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowUpData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('/dashboard/follow-up'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFollowUpData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching follow-up dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowUpData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <Icon icon="ph:warning" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-6 flex items-center gap-3">
        <Icon icon="ph:phone-call" className="w-8 h-8 text-teal-600" />
        <h1 className="text-3xl font-bold text-teal-700">Follow-Up Dashboard</h1>
      </div>
      
      <DashboardStats summaryOnly />
      
      {followUpData && (
        <>
          {/* Follow-Up KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Follow-ups Done</h3>
                  <p className="text-2xl font-bold text-blue-600">{followUpData.data?.follow_ups?.completed || 0}</p>
                  <p className="text-sm text-gray-500">Today</p>
                </div>
                <Icon icon="ph:phone-call" className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Satisfaction Rate</h3>
                  <p className="text-2xl font-bold text-green-600">{followUpData.data?.satisfaction?.rate || 0}%</p>
                  <p className="text-sm text-gray-500">Customer Happy</p>
                </div>
                <Icon icon="ph:smile" className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Pending Calls</h3>
                  <p className="text-2xl font-bold text-orange-600">{followUpData.data?.follow_ups?.pending || 0}</p>
                  <p className="text-sm text-gray-500">To Call</p>
                </div>
                <Icon icon="ph:clock" className="w-8 h-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Resolution Rate</h3>
                  <p className="text-2xl font-bold text-purple-600">{followUpData.data?.resolution?.rate || 0}%</p>
                  <p className="text-sm text-gray-500">Issues Resolved</p>
                </div>
                <Icon icon="ph:check-circle" className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Recent Follow-ups */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Follow-ups</h2>
            {followUpData.data?.recent_follow_ups && followUpData.data.recent_follow_ups.length > 0 ? (
              <div className="space-y-4">
                {followUpData.data.recent_follow_ups.map((followUp, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        followUp.satisfaction === 'satisfied' ? 'bg-green-500' : 
                        followUp.satisfaction === 'neutral' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-700">{followUp.customer_name}</h3>
                        <p className="text-sm text-gray-500">{followUp.customer_phone} - {followUp.ticket_id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        followUp.satisfaction === 'satisfied' ? 'bg-green-100 text-green-800' :
                        followUp.satisfaction === 'neutral' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {followUp.satisfaction}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon icon="ph:phone-call" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent follow-ups</p>
              </div>
            )}
          </Card>

          {/* Customer Satisfaction */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Customer Satisfaction</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Satisfaction Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Satisfied Customers:</span>
                    <span className="font-semibold text-green-600">{followUpData.data?.satisfaction?.satisfied || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Neutral Customers:</span>
                    <span className="font-semibold text-yellow-600">{followUpData.data?.satisfaction?.neutral || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dissatisfied:</span>
                    <span className="font-semibold text-red-600">{followUpData.data?.satisfaction?.dissatisfied || 0}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Resolution Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fully Resolved:</span>
                    <span className="font-semibold text-green-600">{followUpData.data?.resolution?.fully_resolved || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Partially Resolved:</span>
                    <span className="font-semibold text-yellow-600">{followUpData.data?.resolution?.partially_resolved || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Not Resolved:</span>
                    <span className="font-semibold text-red-600">{followUpData.data?.resolution?.not_resolved || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Follow-up Performance */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Follow-up Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Icon icon="ph:phone-call" className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-blue-700">Calls Made</h3>
                <p className="text-2xl font-bold text-blue-600">{followUpData.data?.performance?.calls_made || 0}</p>
                <p className="text-sm text-blue-500">Today</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Icon icon="ph:clock" className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-700">Avg Call Time</h3>
                <p className="text-2xl font-bold text-green-600">{followUpData.data?.performance?.avg_call_time || 0} min</p>
                <p className="text-sm text-green-500">Per Call</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Icon icon="ph:target" className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-purple-700">Success Rate</h3>
                <p className="text-2xl font-bold text-purple-600">{followUpData.data?.performance?.success_rate || 0}%</p>
                <p className="text-sm text-purple-500">Contact Rate</p>
              </div>
            </div>
          </Card>
        </>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2">Follow-up Tools</h2>
        <ul className="list-disc ml-6 text-gray-700">
          <li>Call Customers for Follow-up</li>
          <li>Record Customer Satisfaction</li>
          <li>Track Issue Resolution</li>
          <li>Generate Satisfaction Reports</li>
          <li>Escalate Unresolved Issues</li>
        </ul>
      </Card>
    </div>
  );
};

export default FollowUpDashboard; 