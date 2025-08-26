import React, { useState, useEffect } from "react";
import DashboardStats from "@/components/DashboardStats";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { getApiUrl } from "@/utils/apiUtils";

const AgentDashboard = () => {
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('/dashboard/agent'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAgentData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching agent dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <Icon icon="ph:headset" className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-blue-700">Agent Dashboard</h1>
      </div>
      
      <DashboardStats summaryOnly />
      
      {agentData && (
        <>
          {/* Call Center KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Tickets Handled</h3>
                  <p className="text-2xl font-bold text-blue-600">{agentData.data?.tickets?.handled || 0}</p>
                  <p className="text-sm text-gray-500">Today</p>
                </div>
                <Icon icon="ph:ticket" className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Resolved</h3>
                  <p className="text-2xl font-bold text-green-600">{agentData.data?.tickets?.resolved || 0}</p>
                  <p className="text-sm text-gray-500">Successfully</p>
                </div>
                <Icon icon="ph:check-circle" className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Avg Handle Time</h3>
                  <p className="text-2xl font-bold text-purple-600">{agentData.data?.performance?.avg_handle_time || 0}</p>
                  <p className="text-sm text-gray-500">Minutes</p>
                </div>
                <Icon icon="ph:clock" className="w-8 h-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Satisfaction</h3>
                  <p className="text-2xl font-bold text-orange-600">{agentData.data?.performance?.satisfaction_rate || 0}%</p>
                  <p className="text-sm text-gray-500">Customer Rating</p>
                </div>
                <Icon icon="ph:star" className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Recent Tickets */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Tickets</h2>
            {agentData.data?.recent_tickets && agentData.data.recent_tickets.length > 0 ? (
              <div className="space-y-4">
                {agentData.data.recent_tickets.map((ticket, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        ticket.priority === 'high' ? 'bg-red-500' : 
                        ticket.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-700">#{ticket.ticket_id}</h3>
                        <p className="text-sm text-gray-500">{ticket.issue_type} - {ticket.customer_phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon icon="ph:ticket" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent tickets</p>
              </div>
            )}
          </Card>

          {/* Agent Performance */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">My Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Call Center Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">First Call Resolution:</span>
                    <span className="font-semibold">{agentData.data?.performance?.fcr_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Escalation Rate:</span>
                    <span className="font-semibold">{agentData.data?.performance?.escalation_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time:</span>
                    <span className="font-semibold">{agentData.data?.performance?.avg_response_time || 0} min</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Quality Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality Score:</span>
                    <span className="font-semibold">{agentData.data?.performance?.quality_score || 0}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compliance Rate:</span>
                    <span className="font-semibold">{agentData.data?.performance?.compliance_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Knowledge Score:</span>
                    <span className="font-semibold">{agentData.data?.performance?.knowledge_score || 0}/100</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2">Call Center Tools</h2>
        <ul className="list-disc ml-6 text-gray-700">
          <li>Handle Customer Tickets</li>
          <li>Follow-up on Resolved Issues</li>
          <li>Escalate Complex Cases</li>
          <li>Update Ticket Status</li>
          <li>Customer Satisfaction Surveys</li>
        </ul>
      </Card>
    </div>
  );
};

export default AgentDashboard; 