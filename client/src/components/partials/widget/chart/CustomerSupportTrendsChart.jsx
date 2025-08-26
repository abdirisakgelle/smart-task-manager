"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
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

export function CustomerSupportTrendsChart({ data = [] }) {
  // Process data for chart
  const processChartData = (rawData) => {
    if (!rawData || rawData.length === 0) return []
    
    // Group by date and create series for each category
    const groupedData = {}
    const categories = new Set()
    
    rawData.forEach(item => {
      const date = item.date
      const category = item.category
      const count = item.count
      
      categories.add(category)
      
      if (!groupedData[date]) {
        groupedData[date] = { date }
      }
      groupedData[date][category] = count
    })
    
    // Convert to array and ensure all categories are present
    const chartData = Object.values(groupedData).map(item => {
      const processed = { date: item.date }
      categories.forEach(category => {
        processed[category] = item[category] || 0
      })
      return processed
    })
    
    return chartData.sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const chartData = processChartData(data)
  const categories = chartData.length > 0 ? Object.keys(chartData[0]).filter(key => key !== 'date') : []

  // Color palette for categories
  const colors = {
    'App': '#3B82F6', // Blue
    'IPTV': '#10B981', // Green
    'Technical Support': '#F59E0B', // Yellow
    'Billing Issue': '#EF4444', // Red
    'Account Access': '#8B5CF6', // Purple
    'Service Request': '#F97316', // Orange
    'Streaming': '#06B6D4', // Cyan
    'Subscription Issue': '#84CC16', // Lime
    'VOD': '#DC2626', // Red
    'Network Issue': '#7C3AED', // Purple
    'Device Problem': '#059669', // Green
    'Payment Issue': '#EA580C', // Orange
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-lg">
            <Icon icon="ph:chart-line" className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Customer Support Trends</h3>
            <p className="text-sm text-gray-600">Ticket Volume Over the Past Week</p>
          </div>
        </div>
      }
      className="border border-gray-200 shadow-sm"
      bodyClass="p-6"
    >
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {categories.map((category, index) => (
              <Area
                key={category}
                type="monotone"
                dataKey={category}
                stackId="1"
                stroke={colors[category] || `hsl(${index * 60}, 70%, 50%)`}
                fill={colors[category] || `hsl(${index * 60}, 70%, 50%)`}
                fillOpacity={0.6}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-8">
          <Icon icon="ph:chart-line" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No ticket data available</p>
          <p className="text-sm text-gray-400 mt-1">No tickets created in the past 7 days</p>
        </div>
      )}
    </Card>
  )
} 