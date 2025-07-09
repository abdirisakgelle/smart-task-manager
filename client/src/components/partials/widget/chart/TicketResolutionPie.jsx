import React from "react";
import Chart from "react-apexcharts";
import useDarkMode from "@/hooks/useDarkMode";

const STATUS_COLORS = {
  Done: "#22c55e", // green
  "In Progress": "#3b82f6", // blue
  Pending: "#f59e42", // orange
  Reopened: "#f43f5e", // red
  default: "#a3a3a3", // gray
};

const TicketResolutionPie = ({ data, height = 335 }) => {
  const [isDark] = useDarkMode();
  const labels = data.map((d) => d.resolution_status || "Unknown");
  const series = data.map((d) => d.count);
  const colors = labels.map((status) => STATUS_COLORS[status] || STATUS_COLORS.default);

  const options = {
    labels,
    dataLabels: {
      enabled: true,
      formatter: (val, opts) => `${Math.round(val)}%`,
      style: {
        fontSize: '14px',
        fontWeight: 600,
      },
    },
    colors,
    legend: {
      position: "bottom",
      fontSize: "12px",
      fontFamily: "Inter",
      fontWeight: 400,
      labels: {
        colors: isDark ? "#CBD5E1" : "#475569",
      },
      markers: {
        width: 6,
        height: 6,
        offsetY: -1,
        offsetX: -5,
        radius: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 0,
      },
    },
    tooltip: {
      y: {
        formatter: (val, opts) => {
          const idx = opts.seriesIndex;
          return `${val} tickets`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return <Chart options={options} series={series} type="pie" height={height} />;
};

export default TicketResolutionPie; 