import { useEffect, useState } from "react";

import api from "../api/client";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes, coursesRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/courses")
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
      setCourses(coursesRes.data.courses || []);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete user");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to remove this course?")) return;
    try {
      await api.delete(`/admin/courses/${courseId}`);
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete course");
    }
  };

  const tabs = [
    { key: "overview", label: "📊 Overview" },
    { key: "users", label: "👥 Users" },
    { key: "courses", label: "📚 Courses" }
  ];

  const statCards = stats
    ? [
        { icon: "👥", label: "Total Users", value: stats.totalUsers },
        { icon: "📚", label: "Total Courses", value: stats.totalCourses },
        { icon: "🎓", label: "Enrollments", value: stats.totalEnrollments },
        { icon: "💰", label: "Platform Revenue", value: `₹${stats.totalRevenue.toFixed(0)}` }
      ]
    : [];

  const getRoleBadge = (role) => {
    const colors = {
      admin: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" },
      educator: { bg: "rgba(99, 102, 241, 0.15)", color: "#818cf8" },
      student: { bg: "rgba(16, 185, 129, 0.15)", color: "#10b981" }
    };
    const c = colors[role] || colors.student;
    return (
      <span style={{
        padding: "0.15rem 0.5rem",
        borderRadius: "var(--radius-full)",
        fontSize: "0.72rem",
        fontWeight: 700,
        textTransform: "uppercase",
        background: c.bg,
        color: c.color
      }}>
        {role}
      </span>
    );
  };

  return (
    <section className="admin-layout">
      <div className="panel">
        <h2 style={{ marginBottom: "0.3rem" }}>🛡️ Admin Dashboard</h2>
        <p className="muted" style={{ fontSize: "0.9rem" }}>
          Manage users, courses, and monitor platform analytics.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="row-gap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`btn ${activeTab === tab.key ? "btn-primary" : "btn-ghost"}`}
            type="button"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="panel">
          {loading ? (
            <div className="stats-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ height: 100 }} />
              ))}
            </div>
          ) : (
            <div className="stats-grid">
              {statCards.map((stat) => (
                <article key={stat.label} className="stat-card">
                  <div className="stat-icon">{stat.icon}</div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="panel">
          <h3 style={{ marginBottom: "0.8rem" }}>All Users ({users.length})</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {user.name}
                      </td>
                      <td>{user.email}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        {user.role !== "admin" && (
                          <button
                            className="btn btn-danger btn-sm"
                            type="button"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <div className="panel">
          <h3 style={{ marginBottom: "0.8rem" }}>All Courses ({courses.length})</h3>
          {loading ? (
            <div className="skeleton" style={{ height: 200 }} />
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <p>No courses on the platform yet.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Educator</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course._id}>
                      <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                        {course.title}
                      </td>
                      <td>{course.educator?.name || "Unknown"}</td>
                      <td><span className="label">{course.category}</span></td>
                      <td>₹{Number(course.price).toFixed(0)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          type="button"
                          onClick={() => handleDeleteCourse(course._id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default AdminDashboardPage;
