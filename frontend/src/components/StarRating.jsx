// Reusable star rating - read-only display when no onRate is passed,
// interactive click-to-rate input when it is.
export default function StarRating({ rating = 0, onRate, size = "text-base" }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onRate === "function";

  return (
    <span className={`inline-flex items-center gap-0.5 ${size}`}>
      {stars.map((n) => {
        const filled = n <= Math.round(rating);
        return (
          <span
            key={n}
            onClick={interactive ? () => onRate(n) : undefined}
            className={`${filled ? "text-brand" : "text-line"} ${
              interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""
            }`}
          >
            ★
          </span>
        );
      })}
    </span>
  );
}
