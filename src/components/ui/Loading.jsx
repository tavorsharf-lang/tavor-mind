export function Loading({ label = 'טוען…' }) {
  return (
    <div className="ds2-loading" role="status" aria-live="polite">
      <span className="ds2-loading-pulse" aria-hidden="true" />
      <span className="ds2-loading-label">{label}</span>
    </div>
  );
}

export default Loading;
