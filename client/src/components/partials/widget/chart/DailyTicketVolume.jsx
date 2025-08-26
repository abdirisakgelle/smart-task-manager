import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/hooks/useDarkMode";
import Icon from "@/components/ui/Icon";

const DailyTicketVolume = ({ height = 340 }) => {
  const [isDark] = useDarkMode();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3000/api/dashboard/daily-ticket-volume")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch daily ticket volume");
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
        <p>Failed to load ticket volume: {error}</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  // Prepare chart data
  const categories = data.map(item => item.dayName);
  const series = [
    {
      name: "Tickets",
      data: data.map(item => item.total_tickets),
    },
  ];

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
      // Add proper margins to prevent cutoff
      margin: {
        top: 20,
        right: 50,
        bottom: 60,
        left: 20
      },
      // Ensure chart fits properly
      width: '100%',
      height: '100%',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        endingShape: "rounded",
        columnWidth: "40%",
        borderRadius: 6,
        distributed: false,
        dataLabels: {
          position: 'top',
        },
      },
    },
          colors: ["#D2232A"], // Primary brand red color
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val;
      },
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: [isDark ? "#E2E8F0" : "#374151"]
      },
      offsetY: -10,
    },
    legend: {
      show: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    grid: {
      borderColor: isDark ? "#374151" : "#e5e7eb",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontSize: '11px',
          fontWeight: 500,
        },
        rotate: -45,
        rotateAlways: false,
        maxHeight: 60,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tickPlacement: 'on',
      // Ensure proper spacing for all bars
      range: undefined,
      floating: false,
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#CBD5E1" : "#475569",
          fontSize: '12px',
        },
        formatter: function (val) {
          return Math.round(val);
        },
      },
      title: {
        text: "Number of Tickets",
        style: {
          color: isDark ? "#CBD5E1" : "#475569",
          fontSize: '14px',
          fontWeight: 600,
        },
      },
    },
    fill: {
      opacity: 1,
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.25,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 0.85,
        stops: [50, 0, 100],
      },
    },
    tooltip: {
      enabled: true,
      theme: isDark ? 'dark' : 'light',
      style: {
        fontSize: '14px',
      },
      y: {
        formatter: function (val) {
          return `${val} tickets`;
        },
      },
      x: {
        formatter: function (val, opts) {
          const dataPoint = data[opts.dataPointIndex];
          return `${dataPoint.dayName} (${dataPoint.day})`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            margin: {
              top: 20,
              right: 60,
              bottom: 70,
              left: 20
            },
          },
          plotOptions: {
            bar: {
              columnWidth: "45%",
            },
          },
          xaxis: {
            labels: {
              rotate: -45,
              fontSize: '10px',
            },
          },
        },
      },
      {
        breakpoint: 480,
        options: {
          chart: {
            margin: {
              top: 20,
              right: 70,
              bottom: 80,
              left: 20
            },
          },
          plotOptions: {
            bar: {
              columnWidth: "50%",
            },
          },
          xaxis: {
            labels: {
              rotate: -45,
              fontSize: '9px',
            },
          },
        },
      },
    ],
  };

  // Calculate summary statistics for the tooltip
  const totalTickets = data.reduce((sum, item) => sum + item.total_tickets, 0);
  const maxTickets = Math.max(...data.map(item => item.total_tickets));
  const minTickets = Math.min(...data.map(item => item.total_tickets));
  const avgTickets = data.length > 0 ? Math.round(totalTickets / data.length) : 0;
  const busiestDay = data.find(item => item.total_tickets === maxTickets);
  const quietestDay = data.find(item => item.total_tickets === minTickets);

  return (
    <div className="chart-container w-full">
      {/* Chart */}
      <Chart
        options={options}
        series={series}
        type="bar"
        height={height - 100}
      />

      {/* Summary Stats */}
      <div className="flex items-center justify-center gap-8 mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{totalTickets}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Tickets</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 dark:text-white">{avgTickets}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Avg/Day</div>
        </div>
      </div>
    </div>
  );
};

export default DailyTicketVolume; 