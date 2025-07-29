"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Card from "@/components/ui/Card"
import Icon from "@/components/ui/Icon"

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow text-xs">
        <p className="font-semibold text-gray-900">
          {new Date(label).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function DailyTicketDistribution() {
  // Remove timeRange state
  // const [timeRange, setTimeRange] = React.useState("7d")
  const [chartData, setChartData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/dashboard/ticket-volume-by-category')
      if (!response.ok) {
        throw new Error('Failed to fetch ticket data')
      }
      const data = await response.json()
      setChartData(data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching ticket data:', err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchData()
  }, [])

  // Remove filteredData and use chartData directly
  // const filteredData = ...

  if (loading) {
    return (
      <Card
        title={
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Icon icon="ph:chart-bar" className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Daily Distribution</h3>
              <p className="text-xs text-gray-600">Ticket distribution by day</p>
            </div>
          </div>
        }
        className="border border-gray-200 shadow-sm"
        bodyClass="p-4"
      >
        <div className="h-[200px] w-full flex items-center justify-center">
          <div className="animate-pulse text-gray-500 text-xs">Loading...</div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card
        title={
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Icon icon="ph:chart-bar" className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Daily Distribution</h3>
              <p className="text-xs text-gray-600">Ticket distribution by day</p>
            </div>
          </div>
        }
        className="border border-gray-200 shadow-sm"
        bodyClass="p-4"
      >
        <div className="h-[200px] w-full flex items-center justify-center">
          <div className="text-red-500 text-xs">Error: {error}</div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-50 rounded-lg">
            <Icon icon="ph:chart-bar" className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Daily Distribution</h3>
            <p className="text-xs text-gray-600">Ticket distribution by day</p>
          </div>
        </div>
      }
      className="border border-gray-200 shadow-sm"
      bodyClass="p-4"
    >
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              tick={{ fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="app"
              fill="#3b82f6"
              name="App Issues"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="iptv"
              fill="#ef4444"
              name="IPTV Issues"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Compact Legend */}
      <div className="flex items-center justify-center space-x-4 mt-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600">App</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600">IPTV</span>
        </div>
      </div>
    </Card>
  )
} 