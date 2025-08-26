import React, { useState, useEffect } from "react";
import DashboardStats from "@/components/DashboardStats";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { getApiUrl } from "@/utils/apiUtils";

const SupervisorDashboard = () => {
  const [supervisorData, setSupervisorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupervisorData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('/dashboard/supervisor'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSupervisorData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching supervisor dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisorData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
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
        <Icon icon="ph:users-three" className="w-8 h-8 text-orange-600" />
        <h1 className="text-3xl font-bold text-orange-700">Supervisor Dashboard</h1>
      </div>
      
      <DashboardStats summaryOnly />
      
      {supervisorData && (
        <>
          {/* Team Oversight KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Team Members</h3>
                  <p className="text-2xl font-bold text-blue-600">{supervisorData.data?.team?.members || 0}</p>
                  <p className="text-sm text-gray-500">Under Supervision</p>
                </div>
                <Icon icon="ph:users" className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Reviews Pending</h3>
                  <p className="text-2xl font-bold text-orange-600">{supervisorData.data?.reviews?.pending || 0}</p>
                  <p className="text-sm text-gray-500">Awaiting Approval</p>
                </div>
                <Icon icon="ph:clipboard-text" className="w-8 h-8 text-orange-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Quality Score</h3>
                  <p className="text-2xl font-bold text-green-600">{supervisorData.data?.quality?.score || 0}%</p>
                  <p className="text-sm text-gray-500">Team Average</p>
                </div>
                <Icon icon="ph:star" className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Escalations</h3>
                  <p className="text-2xl font-bold text-red-600">{supervisorData.data?.escalations?.total || 0}</p>
                  <p className="text-sm text-gray-500">This Week</p>
                </div>
                <Icon icon="ph:warning" className="w-8 h-8 text-red-500" />
              </div>
            </Card>
          </div>

          {/* Team Performance */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Team Performance Overview</h2>
            {supervisorData.data?.team_performance && supervisorData.data.team_performance.length > 0 ? (
              <div className="space-y-4">
                {supervisorData.data.team_performance.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {member.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700">{member.name}</h3>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Tickets</p>
                          <p className="font-semibold text-blue-600">{member.tickets_handled}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Quality</p>
                          <p className="font-semibold text-green-600">{member.quality_score}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Satisfaction</p>
                          <p className="font-semibold text-orange-600">{member.satisfaction_rate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon icon="ph:users" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No team data available</p>
              </div>
            )}
          </Card>

          {/* Quality Assurance */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Quality Assurance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Review Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reviews Completed:</span>
                    <span className="font-semibold">{supervisorData.data?.reviews?.completed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Review Time:</span>
                    <span className="font-semibold">{supervisorData.data?.reviews?.avg_time || 0} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approval Rate:</span>
                    <span className="font-semibold">{supervisorData.data?.reviews?.approval_rate || 0}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Quality Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Compliance Rate:</span>
                    <span className="font-semibold">{supervisorData.data?.quality?.compliance_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Error Rate:</span>
                    <span className="font-semibold">{supervisorData.data?.quality?.error_rate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Training Needs:</span>
                    <span className="font-semibold">{supervisorData.data?.quality?.training_needed || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Reviews */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Reviews</h2>
            {supervisorData.data?.recent_reviews && supervisorData.data.recent_reviews.length > 0 ? (
              <div className="space-y-4">
                {supervisorData.data.recent_reviews.map((review, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        review.priority === 'high' ? 'bg-red-500' : 
                        review.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-700">#{review.review_id}</h3>
                        <p className="text-sm text-gray-500">By: {review.agent_name} - {review.ticket_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.status === 'approved' ? 'bg-green-100 text-green-800' :
                        review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon icon="ph:clipboard-text" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent reviews</p>
              </div>
            )}
          </Card>
        </>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2">Supervision Tools</h2>
        <ul className="list-disc ml-6 text-gray-700">
          <li>Review Agent Performance</li>
          <li>Quality Assurance Checks</li>
          <li>Team Training Management</li>
          <li>Escalation Handling</li>
          <li>Performance Reports</li>
        </ul>
      </Card>
    </div>
  );
};

export default SupervisorDashboard; 