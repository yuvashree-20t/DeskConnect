
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user") || "{}"));

    const loadData = async () => {
      try {
        const [taskRes, ticketRes] = await Promise.all([
          API.get("/tasks"),
          API.get("/tickets")
        ]);

        setTasks(taskRes.data.tasks || []);
        setTickets(ticketRes.data.tickets || []);
      } catch (error) {
        console.error("Dashboard loading failed:", error);
      }
    };

    loadData();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
    navigate("/login");
  };

  const completed = tasks.filter(t => t.status === "Completed").length;
  const activeTickets = tickets.filter(
    t => t.status === "Open" || t.status === "In Progress"
  ).length;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">Desk<span>Connect</span></div>
        <p className="sidebar-label">WORKSPACE</p>
        <Link className="nav-link active" to="/">▦ Dashboard</Link>
        <Link className="nav-link" to="/tasks">✓ My Tasks</Link>
        <Link className="nav-link" to="/tickets">▤ Support Tickets</Link>
        <button className="logout-btn" onClick={logout}>↪ Logout</button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>Dashboard</h2>
            <p className="muted">Your workplace at a glance.</p>
          </div>
          <div className="user-chip">
            <div className="avatar">
              {(user.name || "E").charAt(0).toUpperCase()}
            </div>
            <span>{user.name || "Employee"}</span>
          </div>
        </header>

        <section className="welcome">
          <h2>Welcome back, {user.name || "Employee"} 👋</h2>
          <p>Here's what's happening in your workspace today.</p>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Tasks</span>
            <h2>{tasks.length}</h2>
            <small>Tasks created or assigned to you</small>
          </div>
          <div className="stat-card">
            <span>Completed Tasks</span>
            <h2>{completed}</h2>
            <small>Successfully completed</small>
          </div>
          <div className="stat-card">
            <span>Total Tickets</span>
            <h2>{tickets.length}</h2>
            <small>Support requests</small>
          </div>
          <div className="stat-card">
            <span>Active Tickets</span>
            <h2>{activeTickets}</h2>
            <small>Awaiting resolution</small>
          </div>
        </section>

        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <Link to="/tasks" className="action-card">
              <span>✓</span>
              <strong>Manage Tasks</strong>
              <small>Create and track tasks</small>
            </Link>
            <Link to="/tickets" className="action-card">
              <span>▤</span>
              <strong>Support Tickets</strong>
              <small>Report workplace issues</small>
            </Link>
          </div>
        </section>

        <section className="recent-section">
          <h3>Recent Tasks</h3>
          {tasks.slice(0, 5).map(task => (
            <div className="recent-item" key={task._id}>
              <strong>{task.title}</strong>
              <span className={`status ${task.status?.replace(" ", "-")}`}>
                {task.status}
              </span>
            </div>
          ))}
          {tasks.length === 0 && (
            <p className="muted">No tasks yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
