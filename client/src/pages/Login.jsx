import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      onLogin();
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleLogin}>
        <div className="brand">
          Desk<span>Connect</span>
        </div>

        <p className="muted">Your workplace, organized.</p>

        <h2>Welcome back</h2>
        <p className="muted">Sign in to your employee account.</p>

        {error && <div className="error">{error}</div>}

        <label>Email address</label>
        <input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;