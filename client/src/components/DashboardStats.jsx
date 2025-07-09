import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";

const formatTime = (minutes) => {
  if (!minutes || minutes === 0) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const kpiCards = [
  // Call Center KPIs - Today's Performance
  {
    key: 'ticketsToday',
    label: 'Tickets Today',
    icon: 'ph:ticket',
    color: 'text-indigo-500',
    getValue: (call) => call.ticketsToday,
    getDesc: (call) => `${call.ticketsDone} marked as Done`,
  },
  {
    key: 'avgResolutionTime',
    label: 'Avg. Resolution Time',
    icon: 'ph:clock',
    color: 'text-green-500',
    getValue: (call) => formatTime(call.avgResolutionTime),
    getDesc: () => 'For tickets resolved today',
  },
  {
    key: 'escalationCount',
    label: 'Escalations',
    icon: 'ph:arrow-elbow-down-right',
    color: 'text-yellow-500',
    getValue: (call) => call.escalationCount,
    getDesc: () => 'Tickets escalated to supervisors today',
  },
  {
    key: 'reopenedTickets',
    label: 'Reopened Tickets',
    icon: 'ph:arrow-clockwise',
    color: 'text-orange-500',
    getValue: (call) => call.reopenedTickets,
    getDesc: () => 'Tickets reopened today',
  },
  {
    key: 'customerSatisfaction',
    label: 'Customer Satisfaction',
    icon: 'ph:heart',
    color: 'text-purple-500',
    getValue: (call) => `${call.satisfactionRate}%`,
    getDesc: (call) => `${call.satisfactionCount}/${call.satisfactionTotal} satisfied today`,
  },
  // Digital Media KPIs - Today's Performance
  {
    key: 'ideasExecuted',
    label: 'Ideas Generated',
    icon: 'ph:lightbulb',
    color: 'text-yellow-500',
    getValue: (media) => media.ideasExecuted,
    getDesc: () => 'Approved ideas today',
  },
  {
    key: 'contentCompleted',
    label: 'Content Produced',
    icon: 'ph:file-text',
    color: 'text-indigo-500',
    getValue: (media) => media.contentCompleted,
    getDesc: () => 'Contents produced today',
  },
  {
    key: 'avgProductionTime',
    label: 'Productions Completed',
    icon: 'ph:wrench',
    color: 'text-green-500',
    getValue: (media) => media.avgProductionTime,
    getDesc: () => 'Productions completed today',
  },
  {
    key: 'postsPublishedToday',
    label: 'Posts Published',
    icon: 'ph:calendar',
    color: 'text-pink-500',
    getValue: (media) => media.postsPublishedToday,
    getDesc: () => 'Posts published today',
  },
];

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [adminKPIs, setAdminKPIs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fcr, setFcr] = useState({ fcr_rate: 0, fcr_tickets: 0, total_tickets: 0 });
  const [loadingFcr, setLoadingFcr] = useState(true);
  const [otherStats, setOtherStats] = useState(null); // Placeholder for other stats

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [statsRes, kpiRes] = await Promise.all([
          fetch('http://localhost:3000/api/dashboard/stats'),
          fetch('http://localhost:3000/api/dashboard/admin-kpis'),
        ]);
        if (!statsRes.ok) throw new Error('Failed to fetch dashboard stats');
        if (!kpiRes.ok) throw new Error('Failed to fetch admin KPIs');
        const statsData = await statsRes.json();
        const kpiData = await kpiRes.json();
        setStats(statsData);
        setAdminKPIs(kpiData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    fetch("/api/dashboard/fcr-rate")
      .then((res) => res.json())
      .then((data) => setFcr(data))
      .finally(() => setLoadingFcr(false));
    // Fetch other stats as needed
  }, []);

  if (loading) {
    return (
      <div className="grid xl:grid-cols-5 sm:grid-cols-2 grid-cols-1 gap-5">
        {[...Array(9)].map((_, i) => (
          <Card key={i}>
            <div className="animate-pulse">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid xl:grid-cols-5 sm:grid-cols-2 grid-cols-1 gap-5">
        <Card>
          <div className="text-center text-red-500">
            <Icon icon="ph:warning" className="text-2xl mb-2" />
            <p>Error loading stats: {error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!stats || !adminKPIs) {
    return null;
  }

  const call = adminKPIs.callCenter;
  const media = adminKPIs.digitalMedia;

  // Unified grid of 9 KPI cards
  return (
    <div className="grid xl:grid-cols-5 sm:grid-cols-2 grid-cols-1 gap-5">
      {kpiCards.map((kpi, idx) => {
        // Use callCenter for first 5, digitalMedia for last 4
        const data = idx < 5 ? call : media;
        // Insert FCR Rate card after Reopened Tickets (idx === 3)
        if (idx === 4) {
          return [
            // FCR Rate Card
            <Card key="fcr-rate">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-200">FCR Rate</span>
                <Icon icon="ph:check-circle" className="text-[#D2232A] text-2xl" />
              </div>
              {loadingFcr ? (
                <div className="text-lg font-bold text-gray-400">Loading...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold mb-1 text-[#D2232A]">{fcr.fcr_rate}%</div>
                  <div className="text-xs text-gray-500">{fcr.fcr_tickets} of {fcr.total_tickets} tickets</div>
                </>
              )}
            </Card>,
            <Card key={kpi.key}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-200">{kpi.label}</span>
                <Icon icon={kpi.icon} className={`${kpi.color} text-2xl`} />
              </div>
              <div className="text-2xl font-bold mb-1">{kpi.getValue(data)}</div>
              <div className="text-xs text-gray-500">{kpi.getDesc(data)}</div>
            </Card>
          ];
        }
        return (
          <Card key={kpi.key}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700 dark:text-gray-200">{kpi.label}</span>
              <Icon icon={kpi.icon} className={`${kpi.color} text-2xl`} />
            </div>
            <div className="text-2xl font-bold mb-1">{kpi.getValue(data)}</div>
            <div className="text-xs text-gray-500">{kpi.getDesc(data)}</div>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats; 