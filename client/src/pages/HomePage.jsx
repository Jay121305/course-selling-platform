import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Build, Teach & Monetize Your Expertise Online</h1>
          <p className="hero-subtitle">
            EduLaunch empowers independent educators to create personalised course
            platforms with video lessons, real payment integration, student tracking,
            and powerful analytics — all in one place.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to="/register">
              Get Started Free
            </Link>
            <Link className="btn btn-ghost btn-lg" to="/courses">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Why EduLaunch?</h2>
        <p className="features-subtitle">
          Everything you need to launch and grow your online teaching business.
        </p>
        <div className="features-grid">
          <article className="panel feature-card">
            <div className="feature-icon">📚</div>
            <h3>Course Management</h3>
            <p>Create rich courses with chapters, YouTube video lessons, and detailed summaries.</p>
          </article>
          <article className="panel feature-card">
            <div className="feature-icon">💳</div>
            <h3>Razorpay Payments</h3>
            <p>Accept real payments through Razorpay integration with seamless checkout.</p>
          </article>
          <article className="panel feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics Dashboard</h3>
            <p>Track enrollments, revenue, and student completion rates in real-time.</p>
          </article>
          <article className="panel feature-card">
            <div className="feature-icon">⭐</div>
            <h3>Reviews & Ratings</h3>
            <p>Students can rate and review courses to build trust and credibility.</p>
          </article>
          <article className="panel feature-card">
            <div className="feature-icon">🎓</div>
            <h3>Progress Tracking</h3>
            <p>Students track their learning progress chapter-by-chapter with visual indicators.</p>
          </article>
          <article className="panel feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Admin Control</h3>
            <p>Full admin panel to manage users, courses, and platform-wide analytics.</p>
          </article>
        </div>
      </section>
    </>
  );
};

export default HomePage;
