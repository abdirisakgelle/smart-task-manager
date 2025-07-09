import React, { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Icon from "@/components/ui/Icon";

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

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/follow-ups/eligible?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch eligible follow-ups");
      const data = await res.json();
      setTickets(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 60000); // auto-refresh every 60s
    return () => clearInterval(interval);
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
      const res = await fetch("/api/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to submit follow-up");
      
      const result = await res.json();
      
      // Show success message with ticket reopening info if applicable
      if (result.ticket_reopened) {
        alert(`Follow-up submitted successfully. Since the issue was not solved, Ticket #${String(selectedTicket.ticket_id).padStart(4, '0')} has been reopened and reassigned to the original agent.`);
      } else {
        alert("Follow-up submitted successfully.");
      }
      
      setShowModal(false);
      setSelectedTicket(null);
      setForm({
        issue_solved: "",
        customer_location: "",
        satisfied: "",
        repeated_issue: "",
        follow_up_notes: ""
      });
      fetchTickets();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
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
        </div>
      </div>
      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
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
                tickets.map(ticket => (
                  <tr key={ticket.ticket_id} className="border-b">
                    <td className="px-3 py-2">#{String(ticket.ticket_id).padStart(4, '0')}</td>
                    <td className="px-3 py-2">{ticket.customer_phone}</td>
                    <td className="px-3 py-2">{ticket.issue_type}</td>
                    <td className="px-3 py-2">{ticket.resolution_status}</td>
                    <td className="px-3 py-2">{ticket.supervisor_status || '-'}</td>
                    <td className="px-3 py-2">{ticket.review_date ? new Date(ticket.review_date).toLocaleDateString() : new Date(ticket.created_at).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      <button className="btn btn-xs btn-primary" onClick={() => handleOpenModal(ticket)}>
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
      {/* Modal for follow-up form */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4">Follow Up for Ticket #{String(selectedTicket.ticket_id).padStart(4, '0')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1">Was your issue solved?</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="issue_solved"
                      value="yes"
                      checked={form.issue_solved === "yes"}
                      onChange={handleFormChange}
                      className="mr-2"
                      required
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="issue_solved"
                      value="no"
                      checked={form.issue_solved === "no"}
                      onChange={handleFormChange}
                      className="mr-2"
                      required
                    />
                    No
                  </label>
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Customer Location</label>
                <input
                  type="text"
                  name="customer_location"
                  className="input w-full"
                  value={form.customer_location}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Satisfied?</label>
                <select
                  name="satisfied"
                  className="input w-full"
                  value={form.satisfied}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Repeated Issue?</label>
                <select
                  name="repeated_issue"
                  className="input w-full"
                  value={form.repeated_issue}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Notes</label>
                <textarea
                  name="follow_up_notes"
                  className="input w-full min-h-[80px]"
                  value={form.follow_up_notes}
                  onChange={handleFormChange}
                  placeholder="Enter notes..."
                />
              </div>
              {formError && <div className="text-red-500 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Submitting..." : "Submit Follow-Up"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FollowUpsPage; 