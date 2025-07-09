import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/hooks/useDarkMode";

const STATUS_COLORS = {
  Done: "#22c55e", // green
  "In Progress": "#f59e42", // orange
  Pending: "#D2232A", // Nasiye red
  Reopened: "#6366f1", // blue (optional)
};

const DAY_LABELS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

const WeeklyTicketTrends = ({ height = 400 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDark] = useDarkMode();

  useEffect(() => {
    setLoading(true);
    fetch("/api/dashboard/weekly-ticket-trends")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch weekly ticket trends");
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-center text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!data || data.length === 0) return <div className="p-4 text-center text-gray-400">No Data Yet</div>;

  // Prepare chart data
  const categories = data.map((d, i) => DAY_LABELS[i]);
  const statuses = ["Done", "In Progress", "Pending"];
  const series = statuses.map((status) => ({
    name: status,
    data: data.map((d) => d[status] || 0),
    color: STATUS_COLORS[status],
  }));

  // Debug: log chart data
  console.log("WeeklyTicketTrends data:", data, series);

  // Check if all values are zero
  const allZero = series.every(s => s.data.every(v => v === 0));
  if (allZero) return <div className="p-4 text-center text-gray-400">No Data Yet</div>;

  // Find max value for y-axis
  const maxY = Math.max(10, ...series.flatMap(s => s.data));

  const fontColor = "#222";

  const options = {
    chart: {
      type: "bar",
      stacked: false,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
      foreColor: fontColor,
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 4,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -10,
      style: {
        fontSize: "16px",
        fontWeight: 700,
        colors: [fontColor],
      },
      formatter: function (val) {
        return val > 0 ? val.toLocaleString() : '';
      },
    },
    xaxis: {
      categories,
      labels: {
        style: {
          fontSize: "16px",
          fontWeight: 700,
          colors: [fontColor],
        },
      },
      axisBorder: {
        show: true,
        color: fontColor,
      },
      axisTicks: {
        show: true,
        color: fontColor,
      },
    },
    yaxis: {
      max: maxY,
      min: 0,
      forceNiceScale: true,
      title: { text: "# Tickets", style: { fontSize: "18px", fontWeight: 700, color: fontColor } },
      labels: {
        style: {
          fontSize: "15px",
          fontWeight: 600,
          colors: [fontColor],
        },
        formatter: function (val) {
          return val.toLocaleString();
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "16px",
      fontWeight: 700,
      offsetY: 0,
      labels: {
        colors: fontColor,
      },
      markers: {
        width: 18,
        height: 18,
        radius: 4,
      },
      itemMargin: {
        horizontal: 16,
        vertical: 0,
      },
    },
    colors: statuses.map((s) => STATUS_COLORS[s]),
    grid: {
      borderColor: fontColor,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} tickets`,
      },
      style: {
        fontSize: '15px',
        color: '#222',
      },
    },
    responsive: [
      {
        breakpoint: 600,
        options: {
          plotOptions: { bar: { columnWidth: "60%" } },
          legend: { fontSize: "13px" },
          xaxis: { labels: { style: { fontSize: "13px", colors: [fontColor] } } },
        },
      },
    ],
  };

  return <Chart options={options} series={series} type="bar" height={height} />;
};

export default WeeklyTicketTrends; 