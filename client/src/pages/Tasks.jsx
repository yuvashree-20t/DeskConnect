
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Tasks() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState("All");

    const [form, setForm] = useState({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: ""
    });

    const getId = (value) => {
        if (!value) return "";
        if (typeof value === "object") return value._id || value.id || "";
        return value;
    };

    const loadTasks = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await API.get("/tasks");
            const data = response.data;
            setTasks(Array.isArray(data) ? data : data.tasks || []);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load your tasks.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTasks();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const createTask = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            await API.post("/tasks", {
                title: form.title.trim(),
                description: form.description.trim(),
                priority: form.priority,
                dueDate: form.dueDate || null
            });

            setForm({
                title: "",
                description: "",
                priority: "Medium",
                dueDate: ""
            });

            await loadTasks();
            alert("Task created successfully.");
        } catch (err) {
            setError(err.response?.data?.message || "Unable to create task.");
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (taskId, status) => {
        try {
            await API.put(`/tasks/${taskId}`, { status });
            await loadTasks();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to update task status.");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const myId = getId(user.id || user._id);

    const isAssignedToMe = (task) =>
        getId(task.assignedTo) === myId && Boolean(myId);

    const filteredTasks = filter === "All"
        ? tasks
        : filter === "Assigned to Me"
        ? tasks.filter(isAssignedToMe)
        : filter === "Created by Me"
        ? tasks.filter((task) => getId(task.createdBy) === myId)
        : tasks.filter((task) => task.status === filter);

    const openCount = tasks.filter((task) => task.status === "Open").length;
    const progressCount = tasks.filter((task) => task.status === "In Progress").length;
    const completedCount = tasks.filter((task) => task.status === "Completed").length;

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <h2 className="sidebar-logo">Desk<span>Connect</span></h2>
                <p className="sidebar-label">EMPLOYEE WORKSPACE</p>

                <nav className="sidebar-nav">
                    <Link to="/">▦ Dashboard</Link>
                    <Link to="/tasks" className="active">✓ My Tasks</Link>
                    <Link to="/tickets">▤ My Support Tickets</Link>
                </nav>

                <button className="logout-btn" onClick={logout}>↪ Logout</button>
            </aside>

            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>My Tasks</h1>
                        <p>Create tasks and keep track of your work.</p>
                    </div>
                    <button className="secondary-btn" onClick={loadTasks}>↻ Refresh</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <section className="stats-grid">
                    <div className="stat-card"><p>Total Visible Tasks</p><h2>{tasks.length}</h2></div>
                    <div className="stat-card"><p>Open</p><h2>{openCount}</h2></div>
                    <div className="stat-card"><p>In Progress</p><h2>{progressCount}</h2></div>
                    <div className="stat-card"><p>Completed</p><h2>{completedCount}</h2></div>
                </section>

                <section className="data-section">
                    <h2>Create a Task</h2>
                    <form className="data-form" onSubmit={createTask}>
                        <div className="form-group">
                            <label>Task Title</label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Enter task title"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe the task"
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Priority</label>
                                <select name="priority" value={form.priority} onChange={handleChange}>
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
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button className="primary-btn" type="submit" disabled={saving}>
                            {saving ? "Creating..." : "+ Create Task"}
                        </button>
                    </form>
                </section>

                <section className="data-section">
                    <div className="section-heading">
                        <div>
                            <h2>My Work ({filteredTasks.length})</h2>
                            <p>Tasks you created or that were assigned to you.</p>
                        </div>

                        <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="All">All Visible Tasks</option>
                            <option value="Assigned to Me">Assigned to Me</option>
                            <option value="Created by Me">Created by Me</option>
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
                            <p>Create a task or check another filter.</p>
                        </div>
                    ) : (
                        <div className="task-list">
                            {filteredTasks.map((task) => (
                                <article className="data-card admin-task-card" key={task._id}>
                                    <div className="task-card-header">
                                        <div>
                                            <h3>{task.title}</h3>
                                            <p>{task.description || "No description provided."}</p>
                                        </div>
                                        <span className={`status-badge ${
                                            task.status === "Completed"
                                                ? "completed"
                                                : task.status === "In Progress"
                                                ? "in-progress"
                                                : "open"
                                        }`}>
                                            {task.status}
                                        </span>
                                    </div>

                                    <div className="task-details">
                                        <span>Priority: <strong>{task.priority}</strong></span>
                                        <span>Created by: <strong>{task.createdBy?.name || "You"}</strong></span>
                                        <span>Assigned to: <strong>{task.assignedTo?.name || "Unassigned"}</strong></span>
                                        <span>Due: <strong>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Not set"}</strong></span>
                                    </div>

                                    {isAssignedToMe(task) ? (
                                        <div className="form-group task-status-control">
                                            <label>Update Your Task Status</label>
                                            <select
                                                value={task.status}
                                                onChange={(e) => updateStatus(task._id, e.target.value)}
                                            >
                                                <option value="Open">Open</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <p className="permission-note">
                                            {getId(task.createdBy) === myId
                                                ? "You created this task. An administrator can assign it to an employee."
                                                : "This task is visible to you."}
                                        </p>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Tasks;
