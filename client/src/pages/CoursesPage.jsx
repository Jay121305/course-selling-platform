import { useEffect, useState } from "react";

import api from "../api/client";
import CourseCard from "../components/CourseCard";

const CATEGORIES = ["All", "Programming", "Design", "Marketing", "Business", "General"];

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCourses = async (searchText = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/courses", {
        params: searchText ? { search: searchText } : {}
      });
      setCourses(response.data.courses || []);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onSearch = (event) => {
    event.preventDefault();
    fetchCourses(search);
  };

  const filteredCourses =
    selectedCategory === "All"
      ? courses
      : courses.filter(
          (c) =>
            (c.category || "General").toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  return (
    <section>
      <div className="row-between wrap" style={{ marginBottom: "1.2rem" }}>
        <div>
          <h2>Explore Courses</h2>
          <p className="muted" style={{ fontSize: "0.9rem" }}>
            Discover courses from top educators
          </p>
        </div>
        <form onSubmit={onSearch} className="search-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, category..."
          />
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>
      </div>

      <div className="row-gap" style={{ marginBottom: "0.8rem" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${selectedCategory === cat ? "btn-primary" : "btn-ghost"}`}
            type="button"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && (
        <div className="list-view">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 202 }} />
          ))}
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {!loading && !filteredCourses.length && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No courses found. Try a different search or category.</p>
        </div>
      )}

      <div className="list-view">
        {filteredCourses.map((course) => (
          <CourseCard key={course._id} course={course} layout="horizontal" />
        ))}
      </div>
    </section>
  );
};

export default CoursesPage;
