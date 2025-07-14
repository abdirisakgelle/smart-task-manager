import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import History from "@/components/partials/widget/chart/history";
import TicketStates from "@/components/partials/widget/chart/TicketStates";
import DashboardStats from "@/components/DashboardStats";
import TicketResolutionPie from "@/components/partials/widget/chart/TicketResolutionPie";
import WeeklyTicketTrends from "@/components/partials/widget/chart/WeeklyTicketTrends";
import DailyTicketVolume from "@/components/partials/widget/chart/DailyTicketVolume";

// image import
import Usa from "@/assets/images/flags/usa.svg";
import Brasil from "@/assets/images/flags/bra.svg";
import Japan from "@/assets/images/flags/japan.svg";
import Italy from "@/assets/images/flags/italy.svg";
import Chin from "@/assets/images/flags/chin.svg";
import India from "@/assets/images/flags/india.svg";
import Earnings from "@/components/partials/widget/chart/Earnings";
import RecentOrderTable from "@/components/partials/Table/order-table";
import RecentTicketsTable from "@/components/partials/Table/ticket-table";

const country = [
  {
    name: "Usa",
    flag: Usa,
    count: "$6.41",
    icon: "heroicons:arrow-small-up",
  },
  {
    name: "Brazil",
    flag: Brasil,
    count: "$2.33",
    icon: "heroicons:arrow-small-up",
  },
  {
    name: "Japan",
    flag: Japan,
    count: "$7.12",
    icon: "heroicons:arrow-small-down",
  },
  {
    name: "Italy",
    flag: Italy,
    count: "$754",
    icon: "heroicons:arrow-small-down",
  },
  {
    name: "India",
    flag: India,
    count: "$699",
    icon: "heroicons:arrow-small-up",
  },
  {
    name: "India",
    flag: India,
    count: "$624",
    icon: "heroicons:arrow-small-up",
  },
];
const source = [
  {
    name: "Direct Source",
    flag: "ph:circle-half",
    count: "1.2k",
    icon: "heroicons:arrow-small-down",
  },
  {
    name: "Social Network",
    flag: "ph:share-network",
    count: "0.33k",
    icon: "heroicons:arrow-small-down",
  },
  {
    name: "Email Newsletter",
    flag: "ph:chat-text",
    count: "31.12k",
    icon: "heroicons:arrow-small-up",
  },
  {
    name: "Referrals",
    flag: "ph:arrow-square-out",
    count: "890",
    icon: "heroicons:arrow-small-down",
  },
  {
    name: "ADVT",
    flag: "ph:percent",
    count: "765",
    icon: "heroicons:arrow-small-up",
  },
  {
    name: "Other",
    flag: "ph:star-four",
    count: "3.4k",
    icon: "heroicons:arrow-small-up",
  },
];

const Dashboard = () => {
  // State for new widgets
  const [topContributors, setTopContributors] = useState([]);
  const [topIssues, setTopIssues] = useState([]);
  const [loadingContrib, setLoadingContrib] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [ticketResolution, setTicketResolution] = useState([]);
  const [loadingResolution, setLoadingResolution] = useState(true);
  // State for today's production ideas
  const [ideasToday, setIdeasToday] = useState([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);

  useEffect(() => {
    // Fetch top contributors
    fetch("/api/dashboard/top-contributors")
      .then((res) => res.json())
      .then((data) => setTopContributors(data))
      .finally(() => setLoadingContrib(false));
    // Fetch top complained issues
    fetch("/api/dashboard/top-complained-issues")
      .then((res) => res.json())
      .then((data) => setTopIssues(data))
      .finally(() => setLoadingIssues(false));
    fetch("/api/dashboard/ticket-resolution-overview")
      .then((res) => res.json())
      .then((data) => setTicketResolution(data))
      .finally(() => setLoadingResolution(false));
    // Fetch today's production ideas
    fetch('/api/ideas?status=production&date=today')
      .then((res) => res.json())
      .then((data) => setIdeasToday(data))
      .finally(() => setLoadingIdeas(false));
  }, []);

  return (
    <div className="space-y-5">
      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Main Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card
          title="Daily Ticket Volume"
          titleClass="text-xl font-semibold text-gray-800 dark:text-white mb-4"
          className="h-full"
        >
          <div className="h-full flex flex-col">
            <DailyTicketVolume height={400} />
          </div>
        </Card>
        <Card 
          title="Ticket States" 
          titleClass="text-xl font-semibold text-gray-800 dark:text-white mb-4"
          className="h-full"
        >
          <div className="h-full flex flex-col">
            <TicketStates height={400} />
          </div>
        </Card>
      </div>

      {/* Bottom grid: Top Contributors, Top Complained Issues, Ticket Resolution Overview */}
      <div className="grid xl:grid-cols-3 gap-5 ">
        <Card title="Top Contributors" subtitle="Ideas submitted this week">
          {loadingContrib ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : (
            <ul className="space-y-3">
              {topContributors.length === 0 ? (
                <li className="text-gray-400 text-center">No data</li>
              ) : (
                topContributors.slice(0, 5).map((c, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 dark:text-white">{c.name}</span>
                    <span className="text-gray-700 dark:text-gray-200 font-semibold">{c.total_ideas}</span>
                  </li>
                ))
              )}
            </ul>
          )}
        </Card>
        <Card title="Top Complained Issues" subtitle="Based on today's tickets">
          {loadingIssues ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-left font-medium pb-1">Issue Type</th>
                  <th className="text-right font-medium pb-1">Count</th>
                </tr>
              </thead>
              <tbody>
                {topIssues.length === 0 ? (
                  <tr><td colSpan={2} className="text-center text-gray-400 py-2">No data</td></tr>
                ) : (
                  topIssues.slice(0, 5).map((issue, i) => (
                    <tr key={i}>
                      <td className="py-1 text-gray-800 dark:text-white">{issue.issue_type}</td>
                      <td className="py-1 text-right font-semibold text-gray-700 dark:text-gray-200">{issue.issue_count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Ticket Resolution Overview" subtitle="Breakdown of today's tickets by status">
          {loadingResolution ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : (
            <TicketResolutionPie data={ticketResolution} />
          )}
        </Card>
      </div>
      {/* end grid */}
      <div>
        <div className="card-title mb-5">Recent Tickets</div>
        <RecentTicketsTable />
      </div>
      {/* Ideas Produced Today Table */}
      <div className="mt-8">
        <Card title="Ideas Produced Today" subtitle="All ideas moved to production today">
          {loadingIdeas ? (
            <div className="p-4 text-center text-gray-400">Loading...</div>
          ) : ideasToday.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No production ideas today.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="px-3 py-2 text-left font-semibold">Title</th>
                    <th className="px-3 py-2 text-left font-semibold">Contributor</th>
                    <th className="px-3 py-2 text-left font-semibold">Script Writer</th>
                    <th className="px-3 py-2 text-left font-semibold">Deadline</th>
                    <th className="px-3 py-2 text-left font-semibold">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {ideasToday.map((idea) => (
                    <tr key={idea.idea_id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{idea.title}</td>
                      <td className="px-3 py-2">{idea.contributor_name || idea.contributor_id}</td>
                      <td className="px-3 py-2">{idea.script_writer_name || idea.script_writer_id}</td>
                      <td className="px-3 py-2">{idea.script_deadline ? new Date(idea.script_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</td>
                      <td className="px-3 py-2 capitalize">{idea.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
