
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminDashboard({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);

    const loadData = async () => {
      try {
        const [taskRes, ticketRes] = await Promise.all([
          API.get("/tasks"),
          API.get("/tickets")
        ]);

        setTasks(taskRes.data.tasks || []);
        setTickets(ticketRes.data.tickets || []);
      } catch (error) {
        console.error("Admin dashboard loading failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (onLogout) {
      onLogout();
    }

    navigate("/login");
  };

  const completedTasks = tasks.filter(
    task => task.status === "Completed"
  ).length;

  const pendingTasks = tasks.filter(
    task => task.status !== "Completed"
  ).length;

  const openTickets = tickets.filter(
    ticket => ticket.status === "Open"
  ).length;

  const activeTickets = tickets.filter(
    ticket =>
      ticket.status === "Open" ||
      ticket.status === "In Progress"
  ).length;

  const resolvedTickets = tickets.filter(
    ticket =>
      ticket.status === "Resolved" ||
      ticket.status === "Closed"
  ).length;

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          Desk<span>Connect</span>
        </div>

        <p className="sidebar-label">ADMIN WORKSPACE</p>

        <Link className="nav-link active" to="/admin">
          ▦ Dashboard
        </Link>

        <Link className="nav-link" to="/admin/tasks">
          ✓ All Tasks
        </Link>

        <Link className="nav-link" to="/admin/tickets">
          ▤ Support Tickets
        </Link>

        <Link className="nav-link" to="/admin/employees">
          ♙ Employees
        </Link>

        <button className="logout-btn" onClick={logout}>
          ↪ Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* HEADER */}
        <header className="topbar">
          <div>
            <h2>Admin Dashboard</h2>
            <p className="muted">
              Company workspace overview.
            </p>
          </div>

          <div className="user-chip">
            <div className="avatar">
              {(user.name || "A").charAt(0).toUpperCase()}
            </div>

            <span>{user.name || "Administrator"}</span>
          </div>
        </header>

        {/* WELCOME */}
        <section className="welcome">
          <h2>
            Welcome back, {user.name || "Administrator"} 👋
          </h2>

          <p>
            Manage employee tasks and IT support requests
            from one place.
          </p>
        </section>

        {/* STATISTICS */}
        <section className="stats-grid">

          <div className="stat-card">
            <span>Total Tasks</span>
            <h2>{loading ? "..." : tasks.length}</h2>
            <small>Tasks visible to your account</small>
          </div>

          <div className="stat-card">
            <span>Completed Tasks</span>
            <h2>{loading ? "..." : completedTasks}</h2>
            <small>Successfully completed</small>
          </div>

          <div className="stat-card">
            <span>Total Support Tickets</span>
            <h2>{loading ? "..." : tickets.length}</h2>
            <small>Employee support requests</small>
          </div>

          <div className="stat-card">
            <span>Active Tickets</span>
            <h2>{loading ? "..." : activeTickets}</h2>
            <small>{openTickets} awaiting attention</small>
          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section className="quick-actions">
          <h3>Administration</h3>

          <div className="action-grid">

            <Link to="/admin/tickets" className="action-card">
              <span>▤</span>
              <strong>Manage Support Tickets</strong>
              <small>
                Review, assign and resolve employee issues
              </small>
            </Link>

            <Link to="/admin/tasks" className="action-card">
              <span>✓</span>
              <strong>Manage All Tasks</strong>
              <small>
                View and assign work to employees
              </small>
            </Link>

            <Link to="/admin/employees" className="action-card">
              <span>♙</span>
              <strong>Employee Management</strong>
              <small>
                View registered employees
              </small>
            </Link>

            <Link to="/" className="action-card">
              <span>↗</span>
              <strong>Employee Portal</strong>
              <small>
                Open the employee workspace
              </small>
            </Link>

          </div>
        </section>

        {/* RECENT TICKETS */}
        <section className="recent-section">
          <div className="section-heading">
            <h3>Recent Support Tickets</h3>

            <Link to="/admin/tickets">
              View all
            </Link>
          </div>

          {loading ? (
            <p className="muted">Loading tickets...</p>
          ) : tickets.length > 0 ? (
            tickets.slice(0, 5).map(ticket => (
              <div className="recent-item" key={ticket._id}>
                <div>
                  <strong>{ticket.title}</strong>

                  <p className="muted">
                    Raised by: {ticket.createdBy?.name || "Employee"}
                  </p>
                </div>

                <span className={`status ${ticket.status?.replace(" ", "-")}`}>
                  {ticket.status}
                </span>
              </div>
            ))
          ) : (
            <p className="muted">No support tickets yet.</p>
          )}
        </section>

        {/* TASK OVERVIEW */}
        <section className="recent-section">
          <div className="section-heading">
            <h3>Task Overview</h3>

            <Link to="/admin/tasks">
              View all
            </Link>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span>Pending Tasks</span>
              <h2>{loading ? "..." : pendingTasks}</h2>
            </div>

            <div className="stat-card">
              <span>Resolved Tickets</span>
              <h2>{loading ? "..." : resolvedTickets}</h2>
            </div>
          </div>

          {tasks.slice(0, 5).map(task => (
            <div className="recent-item" key={task._id}>
              <div>
                <strong>{task.title}</strong>
                <p className="muted">
                  Assigned to: {task.assignedTo?.name || "Unassigned"}
                </p>
              </div>

              <span className={`status ${task.status?.replace(" ", "-")}`}>
                {task.status}
              </span>
            </div>
          ))}

          {!loading && tasks.length === 0 && (
            <p className="muted">No tasks available.</p>
          )}
        </section>

      </main>
    </div>
  );
}

export default AdminDashboard;
