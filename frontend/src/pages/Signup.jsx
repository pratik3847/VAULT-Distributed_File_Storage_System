import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

function Signup() {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await signup(form);
      navigate("/dashboard", { replace: true });
    } catch (signupError) {
      setError(
        signupError?.response?.data?.message || "Unable to create account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-shell">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">VAULT</p>
        <h1>Create account</h1>
        <p className="auth-copy">Start storing and organizing your files.</p>

        <label>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

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
          {submitting ? "Creating..." : "Create account"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;