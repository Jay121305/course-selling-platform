import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const AuthPage = ({ mode }) => {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
      navigate("/");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel auth-panel">
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ marginBottom: "0.3rem" }}>
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="muted" style={{ fontSize: "0.9rem" }}>
          {isLogin
            ? "Sign in to access your dashboard and continue learning."
            : "Join as a student or educator in under a minute."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="stacked-form">
        {!isLogin && (
          <label>
            Full Name
            <input
              type="text"
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="John Doe"
              required
            />
          </label>
        )}

        <label>
          Email Address
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange("email", event.target.value)}
            placeholder="hello@example.com"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => onChange("password", event.target.value)}
            placeholder="Min. 6 characters"
            required
            minLength={6}
          />
        </label>

        {!isLogin && (
          <label>
            I want to join as
            <select
              value={form.role}
              onChange={(event) => onChange("role", event.target.value)}
            >
              <option value="student">Student</option>
              <option value="educator">Educator</option>
            </select>
          </label>
        )}

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary btn-lg" disabled={submitting} type="submit"
          style={{ width: "100%", marginTop: "0.5rem" }}>
          {submitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="muted" style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.88rem" }}>
        {isLogin ? (
          <>Don't have an account? <Link to="/register" style={{ color: "var(--accent-dark)", fontWeight: 600 }}>Register</Link></>
        ) : (
          <>Already have an account? <Link to="/login" style={{ color: "var(--accent-dark)", fontWeight: 600 }}>Sign In</Link></>
        )}
      </p>
    </section>
  );
};

export default AuthPage;
