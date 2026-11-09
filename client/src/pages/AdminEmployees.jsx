
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await API.get("/employees");
      setEmployees(response.data.employees || []);
      setError("");
    } catch (err) {
      setError("Unable to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">Desk<span>Connect</span></div>
        <p className="sidebar-label">ADMIN WORKSPACE</p>

        <Link className="nav-link" to="/admin">▦ Dashboard</Link>
        <Link className="nav-link" to="/admin/tasks">✓ All Tasks</Link>
        <Link className="nav-link" to="/admin/tickets">▤ Support Tickets</Link>
        <Link className="nav-link active" to="/admin/employees">♙ Employees</Link>
        <Link className="logout-btn" to="/login">↪ Logout</Link>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h2>Employee Management</h2>
            <p className="muted">View and monitor registered employees.</p>
          </div>

          <button className="secondary-btn" onClick={loadEmployees}>
            ↻ Refresh
          </button>
        </header>

        <section className="welcome">
          <h2>Company Employees</h2>
          <p>Monitor employee accounts, assigned tasks and support requests.</p>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Employees</span>
            <h2>{employees.length}</h2>
          </div>
          <div className="stat-card">
            <span>Total Assigned Tasks</span>
            <h2>{employees.reduce((sum, e) => sum + e.taskCount, 0)}</h2>
          </div>
          <div className="stat-card">
            <span>Total Support Tickets</span>
            <h2>{employees.reduce((sum, e) => sum + e.ticketCount, 0)}</h2>
          </div>
          <div className="stat-card">
            <span>Account Type</span>
            <h2>Administrator</h2>
          </div>
        </section>

        <section className="recent-section">
          <h3>Registered Employees ({employees.length})</h3>

          {loading && <p className="muted">Loading employees...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && employees.length === 0 && (
            <p className="muted">No employees registered yet.</p>
          )}

          {employees.map(employee => (
            <article className="data-card" key={employee._id}>
              <div className="card-heading">
                <div>
                  <h3>{employee.name}</h3>
                  <p className="muted">{employee.email}</p>
                </div>
                <span className="status Completed">
                  {employee.role}
                </span>
              </div>

              <div className="stats-grid">
                <div>
                  <small>Assigned Tasks</small>
                  <h3>{employee.taskCount}</h3>
                </div>
                <div>
                  <small>Raised Tickets</small>
                  <h3>{employee.ticketCount}</h3>
                </div>
              </div>

              <small className="muted">
                Joined: {new Date(employee.createdAt).toLocaleDateString()}
              </small>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default AdminEmployees;
