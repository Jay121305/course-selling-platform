import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import ReviewSection from "../components/ReviewSection";

const extractEmbedUrl = (url) => {
  const rawUrl = String(url || "").trim();
  if (!rawUrl) return "";
  if (rawUrl.includes("/embed/")) return rawUrl;

  const watchIndex = rawUrl.indexOf("v=");
  if (watchIndex !== -1) {
    const id = rawUrl.slice(watchIndex + 2).split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  if (rawUrl.includes("youtu.be/")) {
    const id = rawUrl.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  return rawUrl;
};

const CourseDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("loading");
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [paying, setPaying] = useState(false);

  const isStudent = user?.role === "student";
  const userId = user?.id || user?._id;
  const isOwner = user?.role === "educator" && course?.educator?._id === userId;
  const canAccessCourseContent = Boolean(enrollment || isOwner);

  const loadCourse = async () => {
    setStatus("loading");
    setError("");
    try {
      const response = await api.get(`/courses/${id}`);
      setCourse(response.data.course);
      setStatus("ready");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not load course");
      setStatus("error");
    }
  };

  const loadEnrollment = async () => {
    if (!isAuthenticated || !isStudent) return;
    try {
      const response = await api.get(`/enrollments/course/${id}`);
      setEnrollment(response.data.enrollment);
    } catch {
      setEnrollment(null);
    }
  };

  const loadPaymentConfig = async () => {
    try {
      const response = await api.get("/enrollments/payment-config");
      setPaymentConfig(response.data);
    } catch {
      setPaymentConfig({ razorpayConfigured: false });
    }
  };

  useEffect(() => {
    loadCourse();
    loadPaymentConfig();
  }, [id]);

  useEffect(() => {
    loadEnrollment();
  }, [id, isAuthenticated, isStudent]);

  const selectedChapterData = useMemo(() => {
    if (!course?.chapters?.length) return null;
    return course.chapters[selectedChapter] || course.chapters[0];
  }, [course, selectedChapter]);

  const completedIndexes = enrollment?.progress?.completedChapterIndexes || [];

  // Razorpay real payment flow
  const startRazorpayPayment = async () => {
    setError("");
    setPaying(true);
    try {
      const response = await api.post("/enrollments/razorpay/order", { courseId: id });
      const { order, razorpayKeyId } = response.data;

      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "EduLaunch",
        description: `Enroll in: ${course.title}`,
        order_id: order.id,
        handler: async (paymentResponse) => {
          try {
            await api.post("/enrollments/razorpay/verify", {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              courseId: id
            });
            await loadEnrollment();
          } catch (verifyError) {
            setError(verifyError.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || ""
        },
        theme: { color: "#6366f1" }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setError(`Payment failed: ${resp.error.description}`);
      });
      rzp.open();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not create order");
    } finally {
      setPaying(false);
    }
  };

  // Mock payment flow (fallback)
  const startMockPayment = async () => {
    setError("");
    setPaying(true);
    try {
      await api.post("/enrollments/mock-payment/intent", { courseId: id });
      await api.post("/enrollments/mock-payment/confirm", { courseId: id });
      await loadEnrollment();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Mock payment failed");
    } finally {
      setPaying(false);
    }
  };

  const handleEnroll = () => {
    if (paymentConfig?.razorpayConfigured) {
      startRazorpayPayment();
    } else {
      startMockPayment();
    }
  };

  const toggleChapterCompletion = async (chapterIndex, checked) => {
    try {
      const response = await api.patch(`/enrollments/course/${id}/progress`, {
        chapterIndex,
        completed: checked
      });
      setEnrollment((prev) => ({
        ...prev,
        progress: response.data.progress,
        status: response.data.status
      }));
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not update progress");
    }
  };

  if (status === "loading") {
    return (
      <div style={{ display: "grid", gap: "1rem" }}>
        <div className="skeleton" style={{ height: 200 }} />
        <div className="skeleton" style={{ height: 400 }} />
      </div>
    );
  }

  if (status === "error") {
    return <p className="error">{error}</p>;
  }

  return (
    <section className="course-details">
      {/* Course Header */}
      <div className="panel">
        <div className="row-between wrap">
          <div>
            <span className="label">{course.category}</span>
            <h2 style={{ marginTop: "0.5rem", marginBottom: "0.3rem" }}>{course.title}</h2>
            <p className="muted">{course.description}</p>
            <p className="muted" style={{ marginTop: "0.3rem" }}>
              By <strong style={{ color: "var(--text-primary)" }}>{course.educator?.name}</strong>
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: "2rem",
              fontWeight: 800,
              background: "var(--accent-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              ₹{Number(course.price).toFixed(0)}
            </div>
            <p className="muted" style={{ fontSize: "0.82rem" }}>
              {course.chapters?.length || 0} chapters
            </p>
          </div>
        </div>
      </div>

      {/* Enrollment CTA */}
      {!enrollment && isStudent && (
        <div className="panel payment-panel">
          <h3>🎯 Enroll in this Course</h3>
          <p className="muted" style={{ fontSize: "0.9rem" }}>
            {paymentConfig?.razorpayConfigured
              ? "Secure checkout powered by Razorpay."
              : "Demo mode — payment is simulated."}
          </p>
          <div>
            <button
              className="btn btn-primary btn-lg"
              type="button"
              onClick={handleEnroll}
              disabled={paying}
            >
              {paying ? "Processing..." : paymentConfig?.razorpayConfigured ? "💳 Pay with Razorpay" : "🧪 Enroll (Demo Payment)"}
            </button>
          </div>
        </div>
      )}

      {/* Owner badge */}
      {isOwner && (
        <div className="panel subtle">
          <p style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            ✨ You are the creator of this course.
          </p>
        </div>
      )}

      {/* Progress */}
      {enrollment && (
        <div className="panel">
          <div className="row-between">
            <h3>📈 My Progress</h3>
            <span style={{ fontWeight: 700, color: "var(--accent-hover)" }}>
              {enrollment.progress?.completedPercent || 0}%
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${enrollment.progress?.completedPercent || 0}%` }}
            />
          </div>
          {enrollment.status === "completed" && (
            <p className="success" style={{ marginTop: "0.8rem" }}>
              🎉 Congratulations! You've completed this course.
            </p>
          )}
        </div>
      )}

      {/* Chapters + Video */}
      <div className="grid-main">
        <div className="panel">
          <h3 style={{ marginBottom: "0.8rem" }}>Chapters</h3>
          <div className="chapter-menu">
            {course.chapters.map((chapter, index) => (
              <div key={index} className="chapter-row">
                <button
                  className={`chapter-nav ${index === selectedChapter ? "active" : ""}`}
                  type="button"
                  onClick={() => setSelectedChapter(index)}
                >
                  <span style={{ color: "var(--text-muted)", marginRight: "0.4rem" }}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {chapter.title}
                </button>
                {enrollment && (
                  <label className="checkbox-inline">
                    <input
                      type="checkbox"
                      checked={completedIndexes.includes(index)}
                      onChange={(event) =>
                        toggleChapterCompletion(index, event.target.checked)
                      }
                    />
                  </label>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          {!canAccessCourseContent ? (
            <div className="empty-state">
              <div className="empty-icon">🔒</div>
              <h3>Content Locked</h3>
              <p>Enroll in this course to unlock chapter videos and progress tracking.</p>
            </div>
          ) : selectedChapterData ? (
            <>
              <h3>{selectedChapterData.title}</h3>
              <p className="muted" style={{ marginBottom: "0.5rem" }}>
                {selectedChapterData.summary || "No summary provided."}
              </p>
              <div className="video-wrap">
                <iframe
                  src={extractEmbedUrl(selectedChapterData.youtubeUrl)}
                  title={selectedChapterData.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </>
          ) : (
            <p className="muted">No chapters available.</p>
          )}
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Reviews Section */}
      <ReviewSection courseId={id} isEnrolled={Boolean(enrollment)} />
    </section>
  );
};

export default CourseDetailsPage;
