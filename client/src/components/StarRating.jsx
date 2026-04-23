const StarRating = ({ value = 0, onChange, readonly = false, size = "md" }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`star-rating ${readonly ? "readonly" : ""} ${size === "sm" ? "sm" : ""}`}>
      {stars.map((star) => (
        <span
          key={star}
          className={`star ${star <= value ? "filled" : ""}`}
          onClick={() => !readonly && onChange?.(star)}
          role={readonly ? "img" : "button"}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          {star <= value ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
