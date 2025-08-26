"use client"

import * as React from "react"
import Card from "@/components/ui/Card"
import Icon from "@/components/ui/Icon"

export function TopContributorsWidget({ data = [] }) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  if (loading) {
    return (
      <Card
        title={
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <Icon icon="ph:lightbulb" className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Top Contributors</h3>
              <p className="text-sm text-gray-600">Most ideas submitted this week</p>
            </div>
          </div>
        }
        className="border border-gray-200 shadow-sm"
        bodyClass="p-6"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Ideas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3 px-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card
        title={
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <Icon icon="ph:lightbulb" className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Top Contributors</h3>
              <p className="text-sm text-gray-600">Most ideas submitted this week</p>
            </div>
          </div>
        }
        className="border border-gray-200 shadow-sm"
        bodyClass="p-6"
      >
        <div className="text-center text-red-500 py-8">
          <Icon icon="ph:warning" className="w-12 h-12 mx-auto mb-3 text-red-300" />
          <p className="font-medium">Error loading data</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 rounded-lg">
            <Icon icon="ph:lightbulb" className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Top Contributors</h3>
            <p className="text-sm text-gray-600">Most ideas submitted this week</p>
          </div>
        </div>
      }
      className="border border-gray-200 shadow-sm"
      bodyClass="p-6"
    >
      {data && data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Ideas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((contributor, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:user" className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">{contributor.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">Digital Media</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-purple-600">{contributor.ideas_submitted}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon icon="ph:lightbulb" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No contributors this week</p>
          <p className="text-sm text-gray-400 mt-1">No ideas submitted in the past 7 days</p>
        </div>
      )}
    </Card>
  )
} 