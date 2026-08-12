import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
      const nextPath = location.state?.from?.pathname || "/dashboard";
      navigate(nextPath, { replace: true });
    } catch (loginError) {
      setError(
        loginError?.response?.data?.message || "Unable to sign in right now."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">VAULT</p>
        <h1>Sign in</h1>
        <p className="auth-copy">Access your files, folders, and uploads.</p>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="auth-button" type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>

        <p className="auth-switch">
          No account yet? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;