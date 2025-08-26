import React, { useState, useEffect } from "react";
import DashboardStats from "@/components/DashboardStats";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { getApiUrl } from "@/utils/apiUtils";
import TicketResolutionPie from "@/components/partials/widget/chart/TicketResolutionPie";
import { CustomerSupportTrendsChart } from "@/components/partials/widget/chart/CustomerSupportTrendsChart";
import { DigitalMediaActivityChart } from "@/components/partials/widget/chart/DigitalMediaActivityChart";
import { RecentTicketsWidget } from "@/components/partials/widget/RecentTicketsWidget";
import { IdeasProducedTodayWidget } from "@/components/partials/widget/IdeasProducedTodayWidget";
import { TopContributorsWidget } from "@/components/partials/widget/TopContributorsWidget";
import { BestPerformersWidget } from "@/components/partials/widget/BestPerformersWidget";

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl('/dashboard/admin'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAdminData(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
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
        <Icon icon="ph:shield-check" className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-blue-700">Admin Dashboard</h1>
      </div>
      
      {adminData && (
        <>
          {/* Row 1: Customer Support KPIs */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Tickets Today</h3>
                    <p className="text-2xl font-bold text-blue-600">{adminData.data?.kpis?.tickets_today || 0}</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:ticket" className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Avg Resolution Time</h3>
                    <p className="text-2xl font-bold text-yellow-600">{adminData.data?.kpis?.avg_resolution_time || 0}m</p>
                    <p className="text-sm text-gray-500">Minutes</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:clock" className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Escalations</h3>
                    <p className="text-2xl font-bold text-red-600">{adminData.data?.kpis?.escalations || 0}</p>
                    <p className="text-sm text-gray-500">Today</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:warning" className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Reopened Tickets</h3>
                    <p className="text-2xl font-bold text-orange-600">{adminData.data?.kpis?.reopened_tickets || 0}</p>
                    <p className="text-sm text-gray-500">Follow-up Reports Today</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:arrow-clockwise" className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Row 2: Customer Experience Insights */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">FCR Rate</h3>
                    <p className="text-2xl font-bold text-green-600">{adminData.data?.kpis?.fcr_rate || 0}%</p>
                    <p className="text-sm text-gray-500">First Call Resolution</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:check-circle" className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Satisfaction</h3>
                    <p className="text-2xl font-bold text-pink-600">{adminData.data?.kpis?.satisfaction || 0}%</p>
                    <p className="text-sm text-gray-500">Customer Rating</p>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:heart" className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Total Tasks</h3>
                    <p className="text-2xl font-bold text-rose-600">{adminData.data?.kpis?.total_tasks || 0}</p>
                    <p className="text-sm text-gray-500">Created Today</p>
                  </div>
                  <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:list-checks" className="w-6 h-6 text-rose-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Overdue Tasks</h3>
                    <p className="text-2xl font-bold text-slate-600">{adminData.data?.kpis?.overdue_tasks || 0}</p>
                    <p className="text-sm text-gray-500">Created Today & Past Due</p>
                  </div>
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:clock-countdown" className="w-6 h-6 text-slate-600" />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Row 3: Digital Media & Content Output */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Ideas Today</h3>
                    <p className="text-2xl font-bold text-indigo-600">{adminData.data?.kpis?.ideas_today || 0}</p>
                    <p className="text-sm text-gray-500">Submitted</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:lightbulb" className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Content Produced</h3>
                    <p className="text-2xl font-bold text-purple-600">{adminData.data?.kpis?.content_produced || 0}</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:file-text" className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Productions</h3>
                    <p className="text-2xl font-bold text-teal-600">{adminData.data?.kpis?.productions || 0}</p>
                    <p className="text-sm text-gray-500">Completed Today</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:gear" className="w-6 h-6 text-teal-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Posts Published</h3>
                    <p className="text-2xl font-bold text-cyan-600">{adminData.data?.kpis?.posts_published || 0}</p>
                    <p className="text-sm text-gray-500">Social Media</p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:megaphone" className="w-6 h-6 text-cyan-600" />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Row 4: Organization & System Overview */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Active Users</h3>
                    <p className="text-2xl font-bold text-emerald-600">{adminData.data?.kpis?.active_users || 0}</p>
                    <p className="text-sm text-gray-500">System Users</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:users" className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Employees</h3>
                    <p className="text-2xl font-bold text-lime-600">{adminData.data?.kpis?.employees || 0}</p>
                    <p className="text-sm text-gray-500">Total Staff</p>
                  </div>
                  <div className="w-12 h-12 bg-lime-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:user-plus" className="w-6 h-6 text-lime-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Sections</h3>
                    <p className="text-2xl font-bold text-amber-600">{adminData.data?.kpis?.sections || 0}</p>
                    <p className="text-sm text-gray-500">Departments</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:buildings" className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">Departments</h3>
                    <p className="text-2xl font-bold text-violet-600">{adminData.data?.kpis?.departments || 0}</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                  <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Icon icon="ph:office-chair" className="w-6 h-6 text-violet-600" />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-6">
            <CustomerSupportTrendsChart data={adminData.data?.charts?.customer_support_trends || []} />
            <DigitalMediaActivityChart data={adminData.data?.charts?.digital_media_activity || []} />
          </div>

          {/* Recent Activity Widgets */}
          <div className="grid lg:grid-cols-2 gap-7">
            <RecentTicketsWidget />
            <IdeasProducedTodayWidget />
          </div>

          {/* Weekly Performance Widgets */}
          <div className="grid lg:grid-cols-2 gap-7">
            <TopContributorsWidget data={adminData.data?.widgets?.top_contributors || []} />
            <BestPerformersWidget data={adminData.data?.widgets?.best_performers || []} />
          </div>

        </>
      )}
    </div>
  );
};

export default AdminDashboard;
