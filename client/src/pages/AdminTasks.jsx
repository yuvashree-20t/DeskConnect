
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminTasks() {
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
        assignedTo: ""
    });

    const [filter, setFilter] = useState("All");

    const getId = (value) => {
        if (!value) return "";
        if (typeof value === "object") {
            return value._id || value.id || "";
        }
        return value;
    };

    const getTasks = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.tasks)) return data.tasks;
        return [];
    };

    const getEmployees = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.employees)) return data.employees;
        return [];
    };

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const [taskResponse, employeeResponse] = await Promise.all([
                API.get("/tasks"),
                API.get("/employees")
            ]);

            setTasks(getTasks(taskResponse.data));
            setEmployees(getEmployees(employeeResponse.data));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load tasks. Please refresh the page."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleFormChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            alert("Please enter a task title.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                priority: form.priority,
                dueDate: form.dueDate || null,
                assignedTo: form.assignedTo || null
            };

            await API.post("/tasks", payload);

            setForm({
                title: "",
                description: "",
                priority: "Medium",
                dueDate: "",
                assignedTo: ""
            });

            await loadData();
            alert("Task created successfully!");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to create task."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleAssign = async (taskId, employeeId) => {
        try {
            await API.patch(`/tasks/${taskId}/assign`, {
                assignedTo: employeeId || null
            });

            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to assign this task."
            );
        }
    };

    const handleStatusChange = async (taskId, status) => {
        try {
            await API.put(`/tasks/${taskId}`, { status });
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update task status."
            );
        }
    };

    const handleDelete = async (taskId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) return;

        try {
            await API.delete(`/tasks/${taskId}`);
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete this task."
            );
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const filteredTasks = filter === "All"
        ? tasks
        : tasks.filter((task) => task.status === filter);

    const completedCount = tasks.filter(
        (task) => task.status === "Completed"
    ).length;

    const activeCount = tasks.filter(
        (task) => task.status === "In Progress"
    ).length;

    const openCount = tasks.filter(
        (task) => task.status === "Open"
    ).length;

    const employeeName = (assignedTo) => {
        if (!assignedTo) return "Unassigned";

        if (typeof assignedTo === "object") {
            return assignedTo.name || "Assigned employee";
        }

        const employee = employees.find(
            (item) => getId(item) === assignedTo
        );

        return employee?.name || "Assigned employee";
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
                    <Link to="/admin/tasks" className="active">✓ All Tasks</Link>
                    <Link to="/admin/tickets">▤ Support Tickets</Link>
                    <Link to="/admin/employees">♙ Employees</Link>
                </nav>

                <button className="logout-btn" onClick={handleLogout}>
                    ↪ Logout
                </button>
            </aside>

            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Task Management</h1>
                        <p>Manage, assign and monitor company tasks.</p>
                    </div>

                    <button className="secondary-btn" onClick={loadData}>
                        ↻ Refresh
                    </button>
                </div>

                <section className="welcome-banner">
                    <h1>Company Tasks</h1>
                    <p>Create tasks, distribute work and monitor progress.</p>
                </section>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <section className="stats-grid">
                    <div className="stat-card">
                        <p>Total Tasks</p>
                        <h2>{tasks.length}</h2>
                    </div>

                    <div className="stat-card">
                        <p>Open Tasks</p>
                        <h2>{openCount}</h2>
                    </div>

                    <div className="stat-card">
                        <p>In Progress</p>
                        <h2>{activeCount}</h2>
                    </div>

                    <div className="stat-card">
                        <p>Completed</p>
                        <h2>{completedCount}</h2>
                    </div>
                </section>

                <section className="data-section">
                    <h2>Create New Task</h2>

                    <form className="data-form" onSubmit={handleCreateTask}>
                        <div className="form-group">
                            <label>Task Title</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleFormChange}
                                placeholder="Enter task title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleFormChange}
                                placeholder="Describe the task"
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Priority</label>
                                <select
                                    name="priority"
                                    value={form.priority}
                                    onChange={handleFormChange}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={form.dueDate}
                                    onChange={handleFormChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Assign Employee</label>
                                <select
                                    name="assignedTo"
                                    value={form.assignedTo}
                                    onChange={handleFormChange}
                                >
                                    <option value="">Unassigned</option>
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
                        </div>

                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={saving}
                        >
                            {saving ? "Creating..." : "+ Create Task"}
                        </button>
                    </form>
                </section>

                <section className="data-section">
                    <div className="section-heading">
                        <div>
                            <h2>All Company Tasks ({filteredTasks.length})</h2>
                            <p>View and manage every registered task.</p>
                        </div>

                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="All">All Tasks</option>
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>

                    {loading ? (
                        <p>Loading tasks...</p>
                    ) : filteredTasks.length === 0 ? (
                        <div className="empty-state">
                            <h3>No tasks found</h3>
                            <p>Create a task above or select another filter.</p>
                        </div>
                    ) : (
                        <div className="task-list">
                            {filteredTasks.map((task) => (
                                <article
                                    className="data-card admin-task-card"
                                    key={task._id}
                                >
                                    <div className="task-card-header">
                                        <div>
                                            <h3>{task.title}</h3>
                                            <p>
                                                {task.description ||
                                                    "No description provided."}
                                            </p>
                                        </div>

                                        <span
                                            className={`status-badge ${
                                                task.status === "Completed"
                                                    ? "completed"
                                                    : task.status === "In Progress"
                                                    ? "in-progress"
                                                    : "open"
                                            }`}
                                        >
                                            {task.status}
                                        </span>
                                    </div>

                                    <div className="task-details">
                                        <span>
                                            Priority: <strong>{task.priority}</strong>
                                        </span>

                                        <span>
                                            Assigned to:{" "}
                                            <strong>
                                                {employeeName(task.assignedTo)}
                                            </strong>
                                        </span>

                                        <span>
                                            Due:{" "}
                                            <strong>
                                                {task.dueDate
                                                    ? new Date(task.dueDate).toLocaleDateString()
                                                    : "Not set"}
                                            </strong>
                                        </span>

                                        <span>
                                            Created by:{" "}
                                            <strong>
                                                {task.createdBy?.name || "Employee"}
                                            </strong>
                                        </span>
                                    </div>

                                    <div className="task-admin-actions">
                                        <div className="form-group">
                                            <label>Assign / Reassign</label>
                                            <select
                                                value={getId(task.assignedTo)}
                                                onChange={(e) =>
                                                    handleAssign(
                                                        task._id,
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
                                            <label>Update Status</label>
                                            <select
                                                value={task.status}
                                                onChange={(e) =>
                                                    handleStatusChange(
                                                        task._id,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="Open">Open</option>
                                                <option value="In Progress">
                                                    In Progress
                                                </option>
                                                <option value="Completed">
                                                    Completed
                                                </option>
                                            </select>
                                        </div>

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                handleDelete(task._id)
                                            }
                                        >
                                            Delete Task
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

export default AdminTasks;
