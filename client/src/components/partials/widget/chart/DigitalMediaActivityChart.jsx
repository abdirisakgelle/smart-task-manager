"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"
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

export function DigitalMediaActivityChart({ data = [] }) {
  // Process data for chart
  const processChartData = (rawData) => {
    if (!rawData || rawData.length === 0) return []
    
    // Group by date and create series for each type
    const groupedData = {}
    const types = new Set()
    
    rawData.forEach(item => {
      const date = item.date
      const type = item.type
      const count = item.count
      
      types.add(type)
      
      if (!groupedData[date]) {
        groupedData[date] = { date }
      }
      groupedData[date][type] = count
    })
    
    // Convert to array and ensure all types are present
    const chartData = Object.values(groupedData).map(item => {
      const processed = { date: item.date }
      types.forEach(type => {
        processed[type] = item[type] || 0
      })
      return processed
    })
    
    return chartData.sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const chartData = processChartData(data)
  const types = chartData.length > 0 ? Object.keys(chartData[0]).filter(key => key !== 'date') : []

  // Color palette for types
  const colors = {
    'ideas': '#8B5CF6', // Purple
    'content': '#3B82F6', // Blue
    'social_posts': '#10B981', // Green
  }

  // Type labels for display
  const typeLabels = {
    'ideas': 'Ideas',
    'content': 'Content',
    'social_posts': 'Social Posts',
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 rounded-lg">
            <Icon icon="ph:lightbulb" className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Digital Media Activity</h3>
            <p className="text-sm text-gray-600">Content Output Over the Past Week</p>
          </div>
        </div>
      }
      className="border border-gray-200 shadow-sm"
      bodyClass="p-6"
    >
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            {types.map((type, index) => (
              <Bar
                key={type}
                dataKey={type}
                name={typeLabels[type] || type}
                fill={colors[type] || `hsl(${index * 120}, 70%, 50%)`}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-8">
          <Icon icon="ph:lightbulb" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No content data available</p>
          <p className="text-sm text-gray-400 mt-1">No content created in the past 7 days</p>
        </div>
      )}
    </Card>
  )
} 