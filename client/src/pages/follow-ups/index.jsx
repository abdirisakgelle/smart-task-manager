import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";
import { apiCall } from "@/utils/apiUtils";
import Alert from "@/components/ui/Alert";

const FollowUpsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [form, setForm] = useState({
    issue_solved: "",
    customer_location: "",
    satisfied: "",
    repeated_issue: "",
    follow_up_notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [errorBanner, setErrorBanner] = useState(null);

  // Simple fetch function without polling
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/follow-ups/eligible?days=${days}`);
      setTickets(data);
      setError(null);
      setErrorBanner(null);
    } catch (err) {
      setError(err.message);
      setErrorBanner(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load data when days changes
  useEffect(() => {
    fetchTickets();
  }, [days]);

  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      const payload = {
        ticket_id: selectedTicket.ticket_id,
        follow_up_agent_id: 1, // TODO: Replace with real agent ID from auth
        follow_up_date: new Date().toISOString().slice(0, 19).replace("T", " "),
        issue_solved: form.issue_solved === "yes",
        customer_location: form.customer_location,
        satisfied: form.satisfied === "yes",
        repeated_issue: form.repeated_issue === "yes",
        follow_up_notes: form.follow_up_notes
      };
      
      const result = await apiCall("/follow-ups", {
        method: "POST",
        body: payload
      });
      
      // Show success message with ticket reopening info if applicable
      if (result.ticket_reopened) {
        alert(`Follow-up submitted successfully. Since the issue was not solved, Ticket #${String(selectedTicket.ticket_id).padStart(4, '0')} has been reopened and reassigned to the original agent.`);
      } else {
        alert("Follow-up submitted successfully.");
      }
      
      // Remove the completed ticket from the list
      setTickets(prev => prev.filter(t => t.ticket_id !== selectedTicket.ticket_id));
      
      setShowModal(false);
      setSelectedTicket(null);
      setForm({
        issue_solved: "",
        customer_location: "",
        satisfied: "",
        repeated_issue: "",
        follow_up_notes: ""
      });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      {errorBanner && (
        <Alert type="error" className="mb-4">
          {errorBanner}
        </Alert>
      )}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Pending Follow-Ups</h2>
          <p className="text-sm text-gray-600 mt-1">
            Tickets and supervisor-reviewed cases from the last {days} days, not yet followed up.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Show:</label>
          <select
            className="input input-sm"
            value={days}
            onChange={e => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={3}>Last 3 days</option>
            <option value={1}>Last 1 day</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button 
            onClick={fetchTickets}
            className="btn btn-sm btn-outline"
            disabled={loading}
          >
            <Icon icon="refresh" className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2">Ticket ID</th>
                <th className="px-3 py-2">Customer Phone</th>
                <th className="px-3 py-2">Issue Type</th>
                <th className="px-3 py-2">Resolution Status</th>
                <th className="px-3 py-2">Supervisor Status</th>
                <th className="px-3 py-2">Created/Reviewed Date</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">No eligible tickets found.</td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">#{String(ticket.ticket_id).padStart(4, '0')}</td>
                    <td className="px-3 py-2">{ticket.customer_phone}</td>
                    <td className="px-3 py-2">{ticket.issue_type}</td>
                    <td className="px-3 py-2">{ticket.resolution_status}</td>
                    <td className="px-3 py-2">{ticket.supervisor_status || '-'}</td>
                    <td className="px-3 py-2">
                      {new Date(ticket.review_date || ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={() => handleOpenModal(ticket)}
                        className="btn btn-sm btn-danger"
                        disabled={submitting}
                      >
                        Follow Up
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Follow-up Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Follow Up for Ticket #{String(selectedTicket.ticket_id).padStart(4, '0')}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <Icon icon="x" />
              </button>
            </div>

            {formError && (
              <Alert type="error" className="mb-4">
                {formError}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Was your issue solved?</label>
                  <div className="space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="issue_solved"
                        value="yes"
                        checked={form.issue_solved === "yes"}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="issue_solved"
                        value="no"
                        checked={form.issue_solved === "no"}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Customer Location</label>
                  <input
                    type="text"
                    name="customer_location"
                    value={form.customer_location}
                    onChange={handleFormChange}
                    className="input w-full"
                    placeholder="Enter customer location"
                  />
                </div>

                <div>
                  <label className="block mb-2">Are you satisfied with the resolution?</label>
                  <div className="space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="satisfied"
                        value="yes"
                        checked={form.satisfied === "yes"}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="satisfied"
                        value="no"
                        checked={form.satisfied === "no"}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Is this a repeated issue?</label>
                  <div className="space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="repeated_issue"
                        value="yes"
                        checked={form.repeated_issue === "yes"}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="repeated_issue"
                        value="no"
                        checked={form.repeated_issue === "no"}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Follow-up Notes</label>
                  <textarea
                    name="follow_up_notes"
                    value={form.follow_up_notes}
                    onChange={handleFormChange}
                    className="input w-full h-24"
                    placeholder="Additional notes about the follow-up..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Follow-Up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FollowUpsPage; 