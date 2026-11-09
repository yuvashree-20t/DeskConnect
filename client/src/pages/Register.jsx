
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await API.post("/auth/register", form);

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleRegister}>
        <div className="brand">
          Desk<span>Connect</span>
        </div>

        <p className="muted">Create your employee account.</p>

        <h2>Get started</h2>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <label>Full name</label>
        <input
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>Email address</label>
        <input
          name="email"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          placeholder="Minimum 8 characters"
          value={form.password}
          onChange={handleChange}
          minLength={8}
          required
        />

        <button className="primary-btn" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
