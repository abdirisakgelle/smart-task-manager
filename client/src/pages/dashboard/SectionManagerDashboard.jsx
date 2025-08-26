import React, { useState, useEffect } from "react";
import DashboardStats from "@/components/DashboardStats";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { getApiUrl } from "@/utils/apiUtils";

const SectionManagerDashboard = () => {
  const [sectionData, setSectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('/dashboard/section'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSectionData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching section manager dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
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
        <Icon icon="ph:users-three" className="w-8 h-8 text-green-600" />
        <h1 className="text-3xl font-bold text-green-700">Section Manager Dashboard</h1>
      </div>
      
      <DashboardStats summaryOnly />
      
      {sectionData && (
        <>
          {/* Section KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Section Tickets</h3>
                  <p className="text-2xl font-bold text-blue-600">{sectionData.data?.tickets?.total || 0}</p>
                  <p className="text-sm text-gray-500">Today's Volume</p>
                </div>
                <Icon icon="ph:ticket" className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Team Size</h3>
                  <p className="text-2xl font-bold text-green-600">{sectionData.data?.team?.total_employees || 0}</p>
                  <p className="text-sm text-gray-500">Active Members</p>
                </div>
                <Icon icon="ph:users" className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Assignments</h3>
                  <p className="text-2xl font-bold text-purple-600">{sectionData.data?.assignments?.total || 0}</p>
                  <p className="text-sm text-gray-500">Active Tasks</p>
                </div>
                <Icon icon="ph:clipboard-text" className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Section Info */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Section Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Section Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Section ID:</span>
                    <span className="font-semibold">{sectionData.section_id || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-semibold">{sectionData.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scope:</span>
                    <span className="font-semibold">{sectionData.scope}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Performance Metrics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tickets Completed:</span>
                    <span className="font-semibold text-green-600">{sectionData.data?.tickets?.done || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completion Rate:</span>
                    <span className="font-semibold">
                      {sectionData.data?.tickets?.total > 0 
                        ? Math.round((sectionData.data.tickets.done / sectionData.data.tickets.total) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2">Team Performance</h2>
        <ul className="list-disc ml-6 text-gray-700">
          <li>Section KPIs</li>
          <li>Team Assignments</li>
          <li>Task Overview</li>
          <li>Approve Content/Reviews</li>
        </ul>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-2">Assign Tasks</h2>
        <p className="text-gray-600">Assign or reassign tasks to team members.</p>
      </Card>
    </div>
  );
};

export default SectionManagerDashboard;