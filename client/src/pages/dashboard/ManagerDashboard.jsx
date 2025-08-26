import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";

const ManagerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [teamData, setTeamData] = useState({
    teamMembers: [],
    teamPerformance: {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0
    },
    recentAssignments: [],
    sectionStats: {
      totalEmployees: 0,
      activeEmployees: 0,
      averageCompletion: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch manager-specific team data
    fetch('/api/dashboard/manager-stats')
      .then(res => res.json())
      .then(data => setTeamData(data))
      .catch(err => console.error('Error fetching manager stats:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Manager Dashboard Header */}
      <div className="mb-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Icon icon="ph:users-three" className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Section Manager Dashboard</h1>
          </div>
          <p className="text-gray-600">Team management and section-level oversight</p>
        </div>
      </div>

      {/* Team Performance Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center py-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-blue-50 mb-4 flex items-center justify-center">
            <Icon icon="ph:users" className="w-8 h-8 text-blue-600" />
          </div>
          <div className="font-bold text-2xl mb-2 text-gray-900">
            {loading ? "..." : teamData.sectionStats.totalEmployees}
          </div>
          <div className="text-sm text-gray-600">Team Members</div>
        </Card>

        <Card className="text-center py-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-green-50 mb-4 flex items-center justify-center">
            <Icon icon="ph:check-circle" className="w-8 h-8 text-green-600" />
          </div>
          <div className="font-bold text-2xl mb-2 text-gray-900">
            {loading ? "..." : teamData.teamPerformance.completedTasks}
          </div>
          <div className="text-sm text-gray-600">Completed Tasks</div>
        </Card>

        <Card className="text-center py-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-orange-50 mb-4 flex items-center justify-center">
            <Icon icon="ph:clock" className="w-8 h-8 text-orange-600" />
          </div>
          <div className="font-bold text-2xl mb-2 text-gray-900">
            {loading ? "..." : teamData.teamPerformance.pendingTasks}
          </div>
          <div className="text-sm text-gray-600">Pending Tasks</div>
        </Card>

        <Card className="text-center py-6">
          <div className="h-16 w-16 mx-auto rounded-full bg-red-50 mb-4 flex items-center justify-center">
            <Icon icon="ph:warning" className="w-8 h-8 text-red-600" />
          </div>
          <div className="font-bold text-2xl mb-2 text-gray-900">
            {loading ? "..." : teamData.teamPerformance.overdueTasks}
          </div>
          <div className="text-sm text-gray-600">Overdue Tasks</div>
        </Card>
      </div>

      {/* Team Management Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card 
          title={
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Icon icon="ph:users" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Team Members</h3>
                <p className="text-sm text-gray-600">Manage your section team</p>
              </div>
            </div>
          }
          className="border border-gray-200 shadow-sm"
          bodyClass="p-6"
        >
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {teamData.teamMembers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {member.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-700">{member.taskCount} tasks</div>
                    <div className="text-xs text-gray-500">{member.completionRate}% complete</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card 
          title={
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-50 rounded-lg">
                <Icon icon="ph:chart-line" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Team Performance</h3>
                <p className="text-sm text-gray-600">Section-level metrics</p>
              </div>
            </div>
          }
          className="border border-gray-200 shadow-sm"
          bodyClass="p-6"
        >
          {loading ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {teamData.sectionStats.averageCompletion}%
                </div>
                <div className="text-sm text-gray-600">Average Completion Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {teamData.sectionStats.activeEmployees}
                </div>
                <div className="text-sm text-gray-600">Active Team Members</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {teamData.teamPerformance.totalTasks}
                </div>
                <div className="text-sm text-gray-600">Total Assigned Tasks</div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Recent Assignments */}
      <Card 
        title={
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 rounded-lg">
              <Icon icon="ph:clipboard" className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Assignments</h3>
              <p className="text-sm text-gray-600">Latest task assignments</p>
            </div>
          </div>
        }
        className="border border-gray-200 shadow-sm"
        bodyClass="p-6"
      >
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {teamData.recentAssignments.map((assignment, index) => (
              <div key={index} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{assignment.title}</p>
                    <p className="text-sm text-gray-500">Assigned to {assignment.assignedTo}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-700">{assignment.priority}</div>
                    <div className="text-xs text-gray-500">{assignment.dueDate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions for Manager */}
      <Card 
        title={
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <Icon icon="ph:gear" className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Team management tasks</p>
            </div>
          </div>
        }
        className="border border-gray-200 shadow-sm"
        bodyClass="p-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
            <Icon icon="ph:plus" className="w-6 h-6 text-blue-600 mb-2" />
            <div className="font-medium text-gray-900">Assign Task</div>
            <div className="text-sm text-gray-600">Create new assignment</div>
          </button>
          
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
            <Icon icon="ph:chart-line" className="w-6 h-6 text-green-600 mb-2" />
            <div className="font-medium text-gray-900">View Reports</div>
            <div className="text-sm text-gray-600">Team performance</div>
          </button>
          
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
            <Icon icon="ph:users" className="w-6 h-6 text-orange-600 mb-2" />
            <div className="font-medium text-gray-900">Manage Team</div>
            <div className="text-sm text-gray-600">Team member settings</div>
          </button>
          
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
            <Icon icon="ph:check-circle" className="w-6 h-6 text-purple-600 mb-2" />
            <div className="font-medium text-gray-900">Approve Content</div>
            <div className="text-sm text-gray-600">Review submissions</div>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ManagerDashboard;
