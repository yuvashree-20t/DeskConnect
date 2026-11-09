
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminTickets() {
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("All");

    const getId = (value) => {
        if (!value) return "";
        if (typeof value === "object") {
            return value._id || value.id || "";
        }
        return value;
    };

    const getTicketList = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.tickets)) return data.tickets;
        return [];
    };

    const getEmployeeList = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.employees)) return data.employees;
        return [];
    };

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const [ticketResponse, employeeResponse] = await Promise.all([
                API.get("/tickets"),
                API.get("/employees")
            ]);

            setTickets(getTicketList(ticketResponse.data));
            setEmployees(getEmployeeList(employeeResponse.data));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load support tickets."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAssign = async (ticketId, employeeId) => {
        try {
            await API.patch(`/tickets/${ticketId}/assign`, {
                assignedTo: employeeId || null
            });

            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to assign this ticket."
            );
        }
    };

    const handleStatusChange = async (ticketId, status) => {
        try {
            await API.put(`/tickets/${ticketId}`, { status });
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update ticket status."
            );
        }
    };

    const handleDelete = async (ticketId) => {
        if (!window.confirm("Are you sure you want to delete this ticket?")) {
            return;
        }

        try {
            await API.delete(`/tickets/${ticketId}`);
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete this ticket."
            );
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const openCount = tickets.filter(
        (ticket) => ticket.status === "Open"
    ).length;

    const progressCount = tickets.filter(
        (ticket) => ticket.status === "In Progress"
    ).length;

    const resolvedCount = tickets.filter(
        (ticket) => ticket.status === "Resolved"
    ).length;

    const closedCount = tickets.filter(
        (ticket) => ticket.status === "Closed"
    ).length;

    const filteredTickets = filter === "All"
        ? tickets
        : tickets.filter((ticket) => ticket.status === filter);

    const employeeName = (assignedTo) => {
        if (!assignedTo) return "Unassigned";

        if (typeof assignedTo === "object") {
            return assignedTo.name || "Assigned employee";
        }

        const employee = employees.find(
            (employee) => getId(employee) === assignedTo
        );

        return employee?.name || "Assigned employee";
    };

    const requesterName = (createdBy) => {
        if (!createdBy) return "Unknown employee";

        if (typeof createdBy === "object") {
            return createdBy.name || createdBy.email || "Employee";
        }

        return "Employee";
    };

    const priorityClass = (priority) => {
        return (priority || "Medium").toLowerCase();
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <h2 className="sidebar-logo">
                    Desk<span>Connect</span>
                </h2>

                <p className="sidebar-label">ADMIN WORKSPACE</p>

                <nav className="sidebar-nav">
                    <Link to="/admin">▦ Dashboard</Link>
                    <Link to="/admin/tasks">✓ All Tasks</Link>
                    <Link to="/admin/tickets" className="active">
                        ▤ Support Tickets
                    </Link>
                    <Link to="/admin/employees">♙ Employees</Link>
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    ↪ Logout
                </button>
            </aside>

            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Support Ticket Management</h1>
                        <p>Review, assign and resolve employee support requests.</p>
                    </div>

                    <button className="secondary-btn" onClick={loadData}>
                        ↻ Refresh
                    </button>
                </div>

                <section className="welcome-banner">
                    <h1>IT Support Center</h1>
                    <p>
                        Manage employee issues, allocate support requests
                        and monitor resolution progress.
                    </p>
                </section>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <section className="stats-grid">
                    <div className="stat-card">
                        <p>Total Tickets</p>
                        <h2>{tickets.length}</h2>
                    </div>

                    <div className="stat-card">
                        <p>Open</p>
                        <h2>{openCount}</h2>
                    </div>

                    <div className="stat-card">
                        <p>In Progress</p>
                        <h2>{progressCount}</h2>
                    </div>

                    <div className="stat-card">
                        <p>Resolved / Closed</p>
                        <h2>{resolvedCount + closedCount}</h2>
                    </div>
                </section>

                <section className="data-section">
                    <div className="section-heading">
                        <div>
                            <h2>All Support Tickets ({filteredTickets.length})</h2>
                            <p>Review employee requests and manage their progress.</p>
                        </div>

                        <select
                            className="filter-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="All">All Tickets</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </div>

                    {loading ? (
                        <p>Loading support tickets...</p>
                    ) : filteredTickets.length === 0 ? (
                        <div className="empty-state">
                            <h3>No support tickets found</h3>
                            <p>There are no tickets matching this filter.</p>
                        </div>
                    ) : (
                        <div className="task-list">
                            {filteredTickets.map((ticket) => (
                                <article
                                    className="data-card admin-task-card"
                                    key={ticket._id}
                                >
                                    <div className="task-card-header">
                                        <div>
                                            <h3>{ticket.title}</h3>
                                            <p>
                                                {ticket.description ||
                                                    "No description provided."}
                                            </p>
                                        </div>

                                        <span
                                            className={`status-badge ${
                                                ticket.status === "Closed" ||
                                                ticket.status === "Resolved"
                                                    ? "completed"
                                                    : ticket.status === "In Progress"
                                                    ? "in-progress"
                                                    : "open"
                                            }`}
                                        >
                                            {ticket.status}
                                        </span>
                                    </div>

                                    <div className="ticket-details">
                                        <span>
                                            Raised by:{" "}
                                            <strong>
                                                {requesterName(ticket.createdBy)}
                                            </strong>
                                        </span>

                                        <span>
                                            Category:{" "}
                                            <strong>{ticket.category}</strong>
                                        </span>

                                        <span>
                                            Priority:{" "}
                                            <strong
                                                className={`priority-${priorityClass(ticket.priority)}`}
                                            >
                                                {ticket.priority}
                                            </strong>
                                        </span>

                                        <span>
                                            Assigned to:{" "}
                                            <strong>
                                                {employeeName(ticket.assignedTo)}
                                            </strong>
                                        </span>

                                        <span>
                                            Created:{" "}
                                            <strong>
                                                {ticket.createdAt
                                                    ? new Date(ticket.createdAt).toLocaleDateString()
                                                    : "Not available"}
                                            </strong>
                                        </span>
                                    </div>

                                    <div className="task-admin-actions">
                                        <div className="form-group">
                                            <label>Assign Support Employee</label>

                                            <select
                                                value={getId(ticket.assignedTo)}
                                                onChange={(e) =>
                                                    handleAssign(
                                                        ticket._id,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Unassigned
                                                </option>

                                                {employees.map((employee) => (
                                                    <option
                                                        key={getId(employee)}
                                                        value={getId(employee)}
                                                    >
                                                        {employee.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="form-group">
                                            <label>Update Ticket Status</label>

                                            <select
                                                value={ticket.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        ticket._id,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="Open">Open</option>
                                                <option value="In Progress">
                                                    In Progress
                                                </option>
                                                <option value="Resolved">
                                                    Resolved
                                                </option>
                                                <option value="Closed">Closed</option>
                                            </select>
                                        </div>

                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDelete(ticket._id)}
                                        >
                                            Delete Ticket
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default AdminTickets;
