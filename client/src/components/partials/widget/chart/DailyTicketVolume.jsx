import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/hooks/useDarkMode";

const DAY_LABELS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

const DailyTicketVolume = ({ height = 400 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDark] = useDarkMode();

  useEffect(() => {
    setLoading(true);
    
    fetch("/api/dashboard/daily-ticket-volume")
      .then((res) => res.json())
      .then((data) => {
        const allZero = data.every((item) => item.total_tickets === 0);
        if (allZero) {
          return fetch("/api/dashboard/simple-ticket-volume");
        } else {
          setData(data);
          setLoading(false);
          return null;
        }
      })
      .then((fallbackRes) => {
        if (fallbackRes) {
          return fallbackRes.json();
        }
        return null;
      })
      .then((fallbackData) => {
        if (fallbackData) {
          const allZero = fallbackData.every((item) => item.total_tickets === 0);
          if (allZero) {
            return fetch("/api/dashboard/all-ticket-volume");
          } else {
            setData(fallbackData);
            setLoading(false);
            return null;
          }
        }
        return null;
      })
      .then((finalRes) => {
        if (finalRes) {
          return finalRes.json();
        }
        return null;
      })
      .then((finalData) => {
        if (finalData) {
          setData(finalData);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
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
        <p>Failed to load daily ticket volume: {error}</p>
      </div>
    );
  }

  // Map backend data to correct weekday (Sat to Fri)
  // Build a map: { weekdayIndex: ticketCount }
  const weekdayMap = {};
  data.forEach((item) => {
    const date = new Date(item.day);
    // getDay(): 0=Sun, 1=Mon, ..., 6=Sat
    // We want: 0=Sat, 1=Sun, ..., 6=Fri
    let idx = date.getDay();
    idx = idx === 6 ? 0 : idx + 1; // Sat=0, Sun=1, ..., Fri=6
    weekdayMap[idx] = item.total_tickets;
  });

  // Build chart data for Sat-Fri
  const chartDataArr = [];
  for (let i = 0; i < 7; i++) {
    chartDataArr.push(weekdayMap[i] || 0);
  }

  // Check if all data is zero
  const allZero = chartDataArr.every((val) => val === 0);
  if (allZero) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-semibold">No Data Yet</p>
          <p className="text-sm">No tickets found in the database</p>
          <p className="text-xs mt-2">Check server console for debug info</p>
        </div>
      </div>
    );
  }

  const chartData = [
    {
      name: "Total Tickets",
      data: chartDataArr,
    },
  ];

  const options = {
    chart: {
      type: "bar",
      height: height,
      toolbar: {
        show: false,
      },
      background: "transparent",
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
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 6,
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: ["#D2232A"],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val > 0 ? val : '';
      },
      offsetY: -10,
      style: {
        fontSize: "14px",
        fontWeight: "600",
        colors: ["#374151"],
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: DAY_LABELS,
      labels: {
        style: {
          colors: isDark ? "#ffffff" : "#374151",
          fontSize: "14px",
          fontWeight: "600",
        },
      },
      axisBorder: {
        show: true,
        color: isDark ? "#374151" : "#e5e7eb",
      },
      axisTicks: {
        show: true,
        color: isDark ? "#374151" : "#e5e7eb",
      },
    },
    yaxis: {
      title: {
        text: "Number of Tickets",
        style: {
          color: isDark ? "#ffffff" : "#374151",
          fontSize: "16px",
          fontWeight: "600",
        },
      },
      labels: {
        style: {
          colors: isDark ? "#ffffff" : "#374151",
          fontSize: "14px",
          fontWeight: "500",
        },
        formatter: function (val) {
          return val % 5 === 0 ? val : '';
        },
      },
      min: 0,
      max: Math.max(Math.ceil(Math.max(...chartDataArr) / 5) * 5, 10),
      tickAmount: Math.max(Math.ceil(Math.max(...chartDataArr) / 5) * 2, 4),
    },
    fill: {
      opacity: 1,
      colors: ["#D2232A"],
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " tickets";
        },
      },
      theme: isDark ? "dark" : "light",
      style: {
        fontSize: '14px',
      },
      x: {
        formatter: function (val, opts) {
          return DAY_LABELS[opts.dataPointIndex] + " - " + val + " tickets";
        }
      }
    },
    grid: {
      borderColor: isDark ? "#374151" : "#e5e7eb",
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    legend: {
      show: false,
    },
  };

  return (
    <div className="w-full p-4">
      <Chart
        options={options}
        series={chartData}
        type="bar"
        height={height}
      />
    </div>
  );
};

export default DailyTicketVolume; 