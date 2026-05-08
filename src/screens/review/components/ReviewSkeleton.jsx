export default function ReviewSkeleton() {
  return (
    <div className="rs-skeleton" aria-hidden="true" role="status" aria-label="טוען סקירה">
      <section className="rs-section">
        <span className="rs-title rs-shimmer" style={{ width: '38%' }} />
        <div className="rs-rhythm">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="rs-dot rs-shimmer" />
          ))}
        </div>
      </section>

      <section className="rs-section">
        <span className="rs-title rs-shimmer" style={{ width: '52%' }} />
        <div className="rs-chips">
          {[64, 88, 52, 76, 60, 70].map((w, i) => (
            <span key={i} className="rs-chip rs-shimmer" style={{ width: `${w}px` }} />
          ))}
        </div>
      </section>

      <section className="rs-section">
        <span className="rs-title rs-shimmer" style={{ width: '32%' }} />
        <div className="rs-rows">
          {[100, 78, 64].map((w, i) => (
            <span key={i} className="rs-row rs-shimmer" style={{ width: `${w}%` }} />
          ))}
        </div>
      </section>

      <section className="rs-section">
        <span className="rs-title rs-shimmer" style={{ width: '46%' }} />
        <div className="rs-bars">
          {[72, 58, 40, 28].map((w, i) => (
            <div key={i} className="rs-bar-row">
              <span className="rs-bar-label rs-shimmer" style={{ width: `${30 + (i * 6)}%` }} />
              <span className="rs-bar rs-shimmer" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
