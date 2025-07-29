"use client"

import * as React from "react"
import Card from "@/components/ui/Card"
import Icon from "@/components/ui/Icon"

export function RecentTicketsWidget() {
  const [tickets, setTickets] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/dashboard/recent-tickets')
      if (!response.ok) {
        throw new Error('Failed to fetch recent tickets')
      }
      const data = await response.json()
      // Only include tickets created today
      const today = new Date().toISOString().split('T')[0]
      const todaysTickets = data.filter(ticket => {
        if (!ticket.created_at) return false;
        const ticketDate = new Date(ticket.created_at).toISOString().split('T')[0];
        return ticketDate === today;
      })
      setTickets(todaysTickets.slice(0, 5)) // Show only 5 recent tickets from today
    } catch (err) {
      setError(err.message)
      console.error('Error fetching recent tickets:', err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchTickets()
  }, [])

  if (loading) {
    return (
      <Card
        title={
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-lg">
              <Icon icon="ph:ticket" className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Tickets</h3>
              <p className="text-sm text-gray-600">Latest customer support tickets</p>
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
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3 px-4">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
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
            <div className="p-2.5 bg-indigo-50 rounded-lg">
              <Icon icon="ph:ticket" className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Tickets</h3>
              <p className="text-sm text-gray-600">Latest customer support tickets</p>
            </div>
          </div>
        }
        className="border border-gray-200 shadow-sm"
        bodyClass="p-6"
      >
        <div className="text-center text-red-500 py-8">
          <Icon icon="ph:warning" className="w-12 h-12 mx-auto mb-3 text-red-300" />
          <p className="font-medium">Error loading tickets</p>
          <p className="text-sm text-gray-400 mt-1">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-lg">
            <Icon icon="ph:ticket" className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Tickets</h3>
            <p className="text-sm text-gray-600">Latest customer support tickets</p>
          </div>
        </div>
      }
      className="border border-gray-200 shadow-sm"
      bodyClass="p-6"
    >
      {tickets.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <Icon icon="ph:check-circle" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No recent tickets</p>
          <p className="text-sm text-gray-400 mt-1">All tickets have been processed</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center border border-indigo-200">
                        <Icon icon="ph:phone" className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">
                        {ticket.customer_phone || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {ticket.issue_category || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-900 font-medium">
                      {ticket.issue_type || 'Unknown Issue'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <Icon icon="ph:clock" className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                      ticket.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      ticket.status?.toLowerCase() === 'in progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      ticket.status?.toLowerCase() === 'resolved' || ticket.status?.toLowerCase() === 'done' ? 'bg-green-100 text-green-800 border-green-200' :
                      ticket.status?.toLowerCase() === 'escalated' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      <Icon icon={
                        ticket.status?.toLowerCase() === 'pending' ? 'ph:clock' :
                        ticket.status?.toLowerCase() === 'in progress' ? 'ph:gear' :
                        ticket.status?.toLowerCase() === 'resolved' || ticket.status?.toLowerCase() === 'done' ? 'ph:check-circle' :
                        ticket.status?.toLowerCase() === 'escalated' ? 'ph:warning' :
                        'ph:circle'
                      } className="w-3 h-3 mr-1" />
                      {ticket.status || 'Unknown'}
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