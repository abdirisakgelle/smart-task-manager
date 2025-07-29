import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";

import DashboardStats from "@/components/DashboardStats";
import TicketResolutionPie from "@/components/partials/widget/chart/TicketResolutionPie";
import { TicketVolumeAreaChart } from "@/components/partials/widget/chart/TicketVolumeAreaChart";
import { DailyTicketDistribution } from "@/components/partials/widget/chart/DailyTicketDistribution";
import { RecentTicketsWidget } from "@/components/partials/widget/RecentTicketsWidget";
import { IdeasProducedTodayWidget } from "@/components/partials/widget/IdeasProducedTodayWidget";

const Dashboard = () => {
  const [topContributors, setTopContributors] = useState([]);
  const [topIssues, setTopIssues] = useState([]);
  const [ticketResolution, setTicketResolution] = useState([]);
  const [loadingContrib, setLoadingContrib] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [loadingResolution, setLoadingResolution] = useState(true);

  useEffect(() => {
    // Fetch top contributors
    fetch('/api/dashboard/top-contributors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTopContributors(data);
        } else {
          setTopContributors([]);
        }
      })
      .finally(() => setLoadingContrib(false));

    // Fetch top complained issues
    fetch('/api/dashboard/top-complained-issues')
      .then(res => res.json())
      .then(data => setTopIssues(data))
      .finally(() => setLoadingIssues(false));

    // Fetch ticket resolution overview
    fetch('/api/dashboard/ticket-resolution-overview')
      .then(res => res.json())
      .then(data => setTicketResolution(data))
      .finally(() => setLoadingResolution(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Dashboard Stats */}
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your key performance indicators and operational metrics</p>
        </div>
        <DashboardStats />
      </div>

      {/* Main Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TicketVolumeAreaChart />
        <DailyTicketDistribution />
      </div>

      {/* Bottom grid: Top Contributors, Top Complained Issues, Ticket Resolution Overview */}
      <div className="grid xl:grid-cols-3 gap-7">
        <Card 
          title={
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-lg">
                <Icon icon="ph:users" className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top Contributors</h3>
                <p className="text-sm text-gray-600">Ideas submitted this week</p>
              </div>
            </div>
          }
          className="border border-gray-200 shadow-sm"
          bodyClass="p-6"
        >
          {loadingContrib ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-8"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(topContributors) && topContributors.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Icon icon="ph:users" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No contributors this week</p>
                  <p className="text-sm text-gray-400 mt-1">Contributors will appear here when they submit ideas</p>
                </div>
              ) : (
                Array.isArray(topContributors) && topContributors.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center border border-blue-200">
                        <span className="text-sm font-bold text-blue-700">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{c.name}</span>
                        <p className="text-xs text-gray-500">Active contributor</p>
                      </div>
                    </div>
                    <span className="text-gray-700 font-bold bg-blue-50 px-3 py-1 rounded-full text-sm border border-blue-200">
                      {c.total_ideas}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
        
        <Card 
          title={
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-50 rounded-lg">
                <Icon icon="ph:warning" className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Top Complained Issues</h3>
                <p className="text-sm text-gray-600">Based on today's tickets</p>
              </div>
            </div>
          }
          className="border border-gray-200 shadow-sm"
          bodyClass="p-6"
        >
          {loadingIssues ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-8"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {topIssues.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <Icon icon="ph:check-circle" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No issues reported today</p>
                  <p className="text-sm text-gray-400 mt-1">Great job! All systems are running smoothly</p>
                </div>
              ) : (
                topIssues.slice(0, 3).map((issue, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        i === 0 ? 'bg-red-500' :
                        i === 1 ? 'bg-orange-500' :
                        i === 2 ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`}></div>
                      <div>
                        <span className="text-gray-900 font-semibold">{issue.issue_type}</span>
                        <p className="text-xs text-gray-500">Customer reported</p>
                      </div>
                    </div>
                    <span className="text-gray-700 font-bold bg-red-50 px-3 py-1 rounded-full text-sm border border-red-200">
                      {issue.issue_count}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>
        
        <Card 
          title={
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-50 rounded-lg">
                <Icon icon="ph:chart-pie" className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Ticket Resolution Overview</h3>
                <p className="text-sm text-gray-600">Breakdown of today's tickets by status</p>
              </div>
            </div>
          }
          className="border border-gray-200 shadow-sm"
          bodyClass="p-6"
        >
          {loadingResolution ? (
            <div className="flex flex-col items-center py-8">
              <div className="animate-pulse">
                <div className="w-40 h-40 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="mb-6">
                <TicketResolutionPie data={ticketResolution} height={200} />
              </div>
              <div className="w-full space-y-3">
                {ticketResolution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-gray-900 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-full text-sm border border-gray-200">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* New Section: Recent Tickets and Ideas Produced Today */}
      <div className="grid lg:grid-cols-2 gap-7">
        <RecentTicketsWidget />
        <IdeasProducedTodayWidget />
      </div>
    </div>
  );
};

export default Dashboard;
