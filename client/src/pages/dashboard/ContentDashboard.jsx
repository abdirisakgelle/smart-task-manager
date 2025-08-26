import React, { useState, useEffect } from "react";
import DashboardStats from "@/components/DashboardStats";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { getApiUrl } from "@/utils/apiUtils";

const ContentDashboard = () => {
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('/dashboard/content'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setContentData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching content dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
        <Icon icon="ph:lightbulb" className="w-8 h-8 text-green-600" />
        <h1 className="text-3xl font-bold text-green-700">Content Creator Dashboard</h1>
      </div>
      
      {contentData ? (
        <>
          {/* Content-Specific KPIs - Replacing generic DashboardStats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Ideas Submitted</h3>
                  <p className="text-2xl font-bold text-blue-600">{contentData.data?.ideas?.submitted || 0}</p>
                  <p className="text-sm text-gray-500">This Month</p>
                </div>
                <Icon icon="ph:lightbulb" className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Content Produced</h3>
                  <p className="text-2xl font-bold text-green-600">{contentData.data?.content?.produced || 0}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <Icon icon="ph:folders" className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Social Posts</h3>
                  <p className="text-2xl font-bold text-purple-600">{contentData.data?.social?.posts || 0}</p>
                  <p className="text-sm text-gray-500">Published</p>
                </div>
                <Icon icon="ph:share-network" className="w-8 h-8 text-purple-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Engagement Rate</h3>
                  <p className="text-2xl font-bold text-orange-600">{contentData.data?.social?.engagement || 0}%</p>
                  <p className="text-sm text-gray-500">Avg Rate</p>
                </div>
                <Icon icon="ph:trend-up" className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Content Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Performance Metrics</h3>
                <Icon icon="ph:chart-line" className="w-6 h-6 text-blue-500" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Approval Rate</span>
                  <span className="font-semibold text-green-600">{contentData.data?.performance?.approval_rate || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Avg Production Time</span>
                  <span className="font-semibold text-blue-600">{contentData.data?.performance?.avg_production_time || 0} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quality Score</span>
                  <span className="font-semibold text-purple-600">{contentData.data?.performance?.quality_score || 0}%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Workflow Status</h3>
                <Icon icon="ph:workflow" className="w-6 h-6 text-green-500" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Ideas</span>
                  <span className="font-semibold text-yellow-600">{contentData.data?.workflow?.ideas || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">In Production</span>
                  <span className="font-semibold text-blue-600">{contentData.data?.workflow?.production || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Published This Week</span>
                  <span className="font-semibold text-green-600">{contentData.data?.workflow?.published || 0}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Social Media Reach</h3>
                <Icon icon="ph:users" className="w-6 h-6 text-purple-500" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Reach</span>
                  <span className="font-semibold text-purple-600">{contentData.data?.social?.reach?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Likes</span>
                  <span className="font-semibold text-red-600">{contentData.data?.social?.likes?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Shares</span>
                  <span className="font-semibold text-blue-600">{contentData.data?.social?.shares?.toLocaleString() || 0}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Ideas */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Recent Ideas</h2>
            {contentData.data?.recent_ideas && contentData.data.recent_ideas.length > 0 ? (
              <div className="space-y-4">
                {contentData.data.recent_ideas.map((idea, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        idea.priority === 'high' ? 'bg-red-500' : 
                        idea.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-700">{idea.title}</h3>
                        <p className="text-sm text-gray-500">Submitted: {new Date(idea.submission_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        idea.status === 'approved' ? 'bg-green-100 text-green-800' :
                        idea.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        idea.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {idea.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon icon="ph:lightbulb" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent ideas</p>
              </div>
            )}
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <Icon icon="ph:lightbulb" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Content Data Available</h3>
          <p className="text-gray-500">Start creating content to see your dashboard metrics</p>
        </div>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2">Content Creation Tools</h2>
        <ul className="list-disc ml-6 text-gray-700">
          <li>Submit Creative Ideas</li>
          <li>Manage Content Production</li>
          <li>Schedule Social Media Posts</li>
          <li>Track Engagement Metrics</li>
          <li>Collaborate with Team</li>
        </ul>
      </Card>
    </div>
  );
};

export default ContentDashboard; 