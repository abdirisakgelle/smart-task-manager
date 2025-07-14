import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/hooks/useDarkMode";
import Icon from "@/components/ui/Icon";

const TicketStates = ({ height = 340 }) => {
  const [isDark] = useDarkMode();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/dashboard/ticket-states")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch ticket states");
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <p>Failed to load ticket states: {error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  // Calculate percentage for the radial chart
  const totalTickets = data.total_tickets;
  const closedTickets = data.closed_tickets;
  const openTickets = data.open_tickets;
  
  // Calculate percentage of closed tickets for the radial chart
  const closedPercentage = totalTickets > 0 ? Math.round((closedTickets / totalTickets) * 100) : 0;

  const series = [closedPercentage];
  
  const options = {
    chart: {
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
    },
    plotOptions: {
      radialBar: {
        size: 200,
        offsetY: -20,
        startAngle: -180,
        endAngle: 150,
        hollow: {
          size: "60%",
        },
        track: {
          background: isDark ? "#374151" : "#e5e7eb",
          strokeWidth: "100%",
        },
        dataLabels: {
          name: {
            fontSize: "20px",
            color: isDark ? "#E2E8F0" : "#374151",
            fontWeight: 600,
          },
          value: {
            fontSize: "28px",
            offsetY: 30,
            fontWeight: 700,
            color: isDark ? "#E2E8F0" : "#374151",
          },
          total: {
            show: true,
            label: "Total Tickets",
            color: isDark ? "#E2E8F0" : "#374151",
            fontWeight: 600,
            fontSize: "16px",
            formatter: function () {
              return totalTickets;
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        shadeIntensity: 0.35,
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 65, 91],
      },
    },
    stroke: {
      dashArray: 8,
    },
    colors: ["#D2232A"], // Brand red color for the arc
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          return `${closedTickets} closed tickets (${closedPercentage}%)`;
        },
      },
      style: {
        fontSize: '14px',
      },
    },
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      <Chart
        series={series}
        options={options}
        type="radialBar"
        height={height}
      />
      {/* Ticket counts below the chart, centered */}
      <div className="flex flex-row justify-center items-center gap-12 mt-6 w-full">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {closedTickets}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Closed Tickets
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {openTickets}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Open Tickets
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketStates; 