

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Tickets() {
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All");

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "Software",
        priority: "Medium"
    });

    const loadTickets = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await API.get("/tickets");
            const data = response.data;
            setTickets(Array.isArray(data) ? data : data.tickets || []);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load support tickets.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const createTicket = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            await API.post("/tickets", {
                title: form.title.trim(),
                description: form.description.trim(),
                category: form.category,
                priority: form.priority
            });

            setForm({
                title: "",
                description: "",
                category: "Software",
                priority: "Medium"
            });

            await loadTickets();
            alert("Support ticket submitted successfully.");
        } catch (err) {
            setError(err.response?.data?.message || "Unable to submit support ticket.");
        } finally {
            setSaving(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const openCount = tickets.filter((ticket) => ticket.status === "Open").length;
    const progressCount = tickets.filter((ticket) => ticket.status === "In Progress").length;
    const resolvedCount = tickets.filter(
        (ticket) => ticket.status === "Resolved" || ticket.status === "Closed"
    ).length;

    const filteredTickets = filter === "All"
        ? tickets
        : tickets.filter((ticket) => ticket.status === filter);

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <h2 className="sidebar-logo">Desk<span>Connect</span></h2>
                <p className="sidebar-label">EMPLOYEE WORKSPACE</p>

                <nav className="sidebar-nav">
                    <Link to="/">▦ Dashboard</Link>
                    <Link to="/tasks">✓ My Tasks</Link>
                    <Link to="/tickets" className="active">▤ My Support Tickets</Link>
                </nav>

                <button className="logout-btn" onClick={logout}>↪ Logout</button>
            </aside>

            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>My Support Tickets</h1>
                        <p>Report technical issues and track support progress.</p>
                    </div>
                    <button className="secondary-btn" onClick={loadTickets}>↻ Refresh</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <section className="stats-grid">
                    <div className="stat-card"><p>Total Tickets</p><h2>{tickets.length}</h2></div>
                    <div className="stat-card"><p>Open</p><h2>{openCount}</h2></div>
                    <div className="stat-card"><p>In Progress</p><h2>{progressCount}</h2></div>
                    <div className="stat-card"><p>Resolved / Closed</p><h2>{resolvedCount}</h2></div>
                </section>

                <section className="data-section">
                    <h2>Raise a Support Request</h2>

                    <form className="data-form" onSubmit={createTicket}>
                        <div className="form-group">
                            <label>Issue Title</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Example: WiFi connection not working"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Describe the Issue</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Explain the issue and when it started..."
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={form.category} onChange={handleChange}>
                                    <option value="Hardware">Hardware</option>
                                    <option value="Software">Software</option>
                                    <option value="Network">Network</option>
                                    <option value="Access">Access</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Priority</label>
                                <select name="priority" value={form.priority} onChange={handleChange}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <button className="primary-btn" type="submit" disabled={saving}>
                            {saving ? "Submitting..." : "+ Submit Support Ticket"}
                        </button>
                    </form>
                </section>

                <section className="data-section">
                    <div className="section-heading">
                        <div>
                            <h2>Ticket History ({filteredTickets.length})</h2>
                            <p>Tickets you raised or that were assigned to you.</p>
                        </div>

                        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="All">All Tickets</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    {loading ? (
                        <p>Loading tickets...</p>
                    ) : filteredTickets.length === 0 ? (
                        <div className="empty-state">
                            <h3>No support tickets found</h3>
                            <p>Your submitted support requests will appear here.</p>
                        </div>
                    ) : (
                        <div className="task-list">
                            {filteredTickets.map((ticket) => (
                                <article className="data-card admin-task-card" key={ticket._id}>
                                    <div className="task-card-header">
                                        <div>
                                            <h3>{ticket.title}</h3>
                                            <p>{ticket.description}</p>
                                        </div>

                                        <span className={`status-badge ${
                                            ticket.status === "Resolved" || ticket.status === "Closed"
                                                ? "completed"
                                                : ticket.status === "In Progress"
                                                ? "in-progress"
                                                : "open"
                                        }`}>
                                            {ticket.status}
                                        </span>
                                    </div>

                                    <div className="ticket-details">
                                        <span>Category: <strong>{ticket.category}</strong></span>
                                        <span>Priority: <strong>{ticket.priority}</strong></span>
                                        <span>Assigned to: <strong>{ticket.assignedTo?.name || "Awaiting assignment"}</strong></span>
                                        <span>Submitted: <strong>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "Not available"}</strong></span>
                                    </div>

                                    <p className="permission-note">
                                        Ticket status and assignment are managed by the IT support administrator.
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Tickets;
