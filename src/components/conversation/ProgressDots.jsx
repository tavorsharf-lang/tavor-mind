export default function ProgressDots({ total, current }) {
  if (!total || total < 1) return null;
  const dots = [];
  for (let i = 0; i < total; i++) {
    const isActive = i === current;
    const isDone = i < current;
    dots.push(
      <span
        key={i}
        className={`cs-progress-dot${isActive ? ' is-active' : ''}${isDone ? ' is-done' : ''}`}
        aria-hidden="true"
      />
    );
  }
  return (
    <div className="cs-progress" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
      {dots}
    </div>
  );
}
