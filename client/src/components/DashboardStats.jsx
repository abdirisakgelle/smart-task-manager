import React, { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { apiCall } from "@/utils/apiUtils";

const formatTime = (minutes) => {
  if (!minutes || minutes === 0) return "0m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const kpiCards = [
  // Call Center KPIs - Today's Performance
  {
    key: 'ticketsToday',
    label: 'Tickets Today',
    icon: 'ph:ticket',
    color: 'text-white',
    bgColor: 'bg-purple-500',
    getValue: (call) => call.ticketsToday,
    getPrev: (call) => call.ticketsYesterday,
    getDesc: () => `Since yesterday`,
  },
  {
    key: 'avgResolutionTime',
    label: 'Resolution Time',
    icon: 'ph:clock',
    color: 'text-white',
    bgColor: 'bg-yellow-500',
    getValue: (call) => call.avgResolutionTime,
    getPrev: (call) => call.avgResolutionTimeYesterday,
    getDesc: () => 'Since yesterday',
    format: formatTime,
    reverse: true, // Lower is better
  },
  {
    key: 'escalationCount',
    label: 'Escalations',
    icon: 'ph:arrow-elbow-down-right',
    color: 'text-white',
    bgColor: 'bg-red-500',
    getValue: (call) => call.escalationCount,
    getPrev: (call) => call.escalationCountYesterday,
    getDesc: () => 'Since yesterday',
  },
  {
    key: 'reopenedTickets',
    label: 'Reopened',
    icon: 'ph:arrow-clockwise',
    color: 'text-white',
    bgColor: 'bg-orange-500',
    getValue: (call) => call.reopenedTickets,
    getPrev: (call) => call.reopenedTicketsYesterday,
    getDesc: () => 'Since yesterday',
  },
  // FCR Rate is not available for yesterday, so keep as is
  {
    key: 'fcrRate',
    label: 'FCR Rate',
    icon: 'ph:check-circle',
    color: 'text-white',
    bgColor: 'bg-green-500',
    getValue: (fcr) => `${fcr.fcr_rate}%`,
    getPrev: () => null,
    getDesc: () => 'Since yesterday',
  },
  {
    key: 'customerSatisfaction',
    label: 'Satisfaction',
    icon: 'ph:heart',
    color: 'text-white',
    bgColor: 'bg-pink-500',
    getValue: (call) => `${call.satisfactionRate}%`,
    getPrev: (call) => call.satisfactionRateYesterday,
    getDesc: () => 'Since yesterday',
  },
  // Digital Media KPIs - Today's Performance
  {
    key: 'ideasExecuted',
    label: 'Ideas Generated',
    icon: 'ph:lightbulb',
    color: 'text-white',
    bgColor: 'bg-indigo-500',
    getValue: (media) => media.ideasExecuted,
    getPrev: (media) => media.ideasExecutedYesterday,
    getDesc: () => 'Since yesterday',
  },
  {
    key: 'contentCompleted',
    label: 'Content Produced',
    icon: 'ph:file-text',
    color: 'text-white',
    bgColor: 'bg-blue-500',
    getValue: (media) => media.contentCompleted,
    getPrev: (media) => media.contentCompletedYesterday,
    getDesc: () => 'Since yesterday',
  },
  {
    key: 'avgProductionTime',
    label: 'Productions',
    icon: 'ph:wrench',
    color: 'text-white',
    bgColor: 'bg-teal-500',
    getValue: (media) => media.avgProductionTime,
    getPrev: (media) => media.avgProductionTimeYesterday,
    getDesc: () => 'Since yesterday',
  },
  {
    key: 'postsPublishedToday',
    label: 'Posts Published',
    icon: 'ph:calendar',
    color: 'text-white',
    bgColor: 'bg-emerald-500',
    getValue: (media) => media.postsPublishedToday,
    getPrev: (media) => media.postsPublishedYesterday,
    getDesc: () => 'Since yesterday',
  },
];

function getChangePercent(today, yesterday, reverse = false) {
  if (yesterday === null || yesterday === undefined) return null;
  if (today === null || today === undefined) return null;
  if (yesterday === 0 && today === 0) return 0;
  if (yesterday === 0) return 100;
  let change = ((today - yesterday) / Math.abs(yesterday)) * 100;
  if (reverse) change = -change;
  return Math.round(change * 10) / 10;
}

function getChangeColor(change) {
  if (change === null) return 'bg-gray-100 text-gray-500';
  if (change > 0) return 'bg-green-100 text-green-700';
  if (change < 0) return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-500';
}

function getArrowIcon(change) {
  if (change === null) return null;
  if (change > 0) return (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
  );
  if (change < 0) return (
    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
  );
  return null;
}

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [adminKPIs, setAdminKPIs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fcr, setFcr] = useState({ fcr_rate: 0, fcr_tickets: 0, total_tickets: 0 });
  const [loadingFcr, setLoadingFcr] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [statsData, kpiData] = await Promise.all([
          apiCall('/dashboard/stats'),
          apiCall('/dashboard/admin-kpis')
        ]);
        
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
    const fetchFcrData = async () => {
      try {
        setLoadingFcr(true);
        const fcrData = await apiCall('/dashboard/fcr-rate');
        setFcr(fcrData);
      } catch (err) {
        console.error('Error fetching FCR data:', err);
      } finally {
        setLoadingFcr(false);
      }
    };
    
    fetchFcrData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="p-4 border border-gray-200 shadow-sm">
            <div className="animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-2/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="col-span-full border border-red-200 shadow-sm">
          <div className="text-center text-red-600 p-4">
            <Icon icon="ph:warning" className="text-2xl mb-2 mx-auto" />
            <p className="font-semibold text-sm mb-1">Error loading stats</p>
            <p className="text-gray-600 text-xs">{error}</p>
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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {kpiCards.map((kpi, idx) => {
        // Determine data source based on card type
        let data, prev, reverse, format;
        if (kpi.key === 'fcrRate') {
          data = fcr;
          prev = null;
          reverse = false;
          format = null;
        } else if (idx < 6) {
          data = call;
          prev = kpi.getPrev ? kpi.getPrev(call) : null;
          reverse = kpi.reverse || false;
          format = kpi.format;
        } else {
          data = media;
          prev = kpi.getPrev ? kpi.getPrev(media) : null;
          reverse = kpi.reverse || false;
          format = kpi.format;
        }
        const value = kpi.getValue(data);
        const displayValue = format ? format(value) : value;
        const change = getChangePercent(value, prev, reverse);
        const changeColor = getChangeColor(change);
        const arrowIcon = getArrowIcon(change);
        return (
          <Card 
            key={kpi.key} 
            className="p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 bg-white"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-700 text-xs">
                {kpi.label}
              </h3>
              <div className={`w-8 h-8 ${kpi.bgColor} rounded-full flex items-center justify-center`}>
                <Icon icon={kpi.icon} className={`${kpi.color} text-sm`} />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900 mb-2">
              {loadingFcr && kpi.key === 'fcrRate' ? '...' : displayValue}
            </div>
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${changeColor}`}>
                {arrowIcon}
                {change !== null ? `${change > 0 ? '+' : ''}${change}%` : '--'}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {kpi.getDesc(data)}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardStats; 