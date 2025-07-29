"use client"

import * as React from "react"
import Card from "@/components/ui/Card"
import Icon from "@/components/ui/Icon"

const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getPriorityIcon = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'ph:warning'
    case 'medium':
      return 'ph:info'
    case 'low':
      return 'ph:check'
    default:
      return 'ph:circle'
  }
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'in review':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'implemented':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'ph:clock'
    case 'in review':
      return 'ph:eye'
    case 'approved':
      return 'ph:check-circle'
    case 'rejected':
      return 'ph:x-circle'
    case 'implemented':
      return 'ph:star'
    default:
      return 'ph:circle'
  }
}

export function IdeasProducedTodayWidget() {
  const [ideas, setIdeas] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  const fetchIdeas = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/dashboard/ideas-produced-today')
      if (!response.ok) {
        throw new Error('Failed to fetch ideas')
      }
      const data = await response.json()
      setIdeas(data.slice(0, 5)) // Show only 5 recent ideas
    } catch (err) {
      setError(err.message)
      console.error('Error fetching ideas:', err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchIdeas()
  }, [])

  if (loading) {
    return (
      <Card
        title={
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 rounded-lg">
              <Icon icon="ph:lightbulb" className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ideas Produced Today</h3>
              <p className="text-sm text-gray-600">Latest creative ideas and innovations</p>
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
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contributor</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3 px-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
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
              <h3 className="text-lg font-bold text-gray-900">Ideas Produced Today</h3>
              <p className="text-sm text-gray-600">Latest creative ideas and innovations</p>
            </div>
          </div>
        }
        className="border border-gray-200 shadow-sm"
        bodyClass="p-6"
      >
        <div className="text-center text-red-500 py-8">
          <Icon icon="ph:warning" className="w-12 h-12 mx-auto mb-3 text-red-300" />
          <p className="font-medium">Error loading ideas</p>
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
            <h3 className="text-lg font-bold text-gray-900">Ideas Produced Today</h3>
            <p className="text-sm text-gray-600">Latest creative ideas and innovations</p>
          </div>
        </div>
      }
      className="border border-gray-200 shadow-sm"
      bodyClass="p-6"
    >
      {ideas.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Icon icon="ph:lightbulb" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No ideas produced today</p>
          <p className="text-sm text-gray-400 mt-1">New ideas will appear here when submitted</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contributor</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ideas.map((idea, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center border border-purple-200">
                        <Icon icon="ph:lightbulb" className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">
                        {idea.title || 'Untitled Idea'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Icon icon="ph:user" className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {idea.submitted_by || 'Anonymous'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(idea.priority)}`}>
                      <Icon icon={getPriorityIcon(idea.priority)} className="w-3 h-3 mr-1" />
                      {idea.priority || 'Normal'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(idea.status)}`}>
                      <Icon icon={getStatusIcon(idea.status)} className="w-3 h-3 mr-1" />
                      {idea.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
} 