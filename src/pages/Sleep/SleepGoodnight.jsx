import { useEffect } from 'react';

export default function SleepGoodnight({ onExit }) {
  // Auto-dismiss after a quiet beat so the screen doesn't linger forever.
  useEffect(() => {
    const id = setTimeout(() => onExit?.(), 6000);
    return () => clearTimeout(id);
  }, [onExit]);

  return (
    <div className="sleep-page" onClick={onExit} role="button" tabIndex={-1}>
      <div className="sleep-goodnight">
        <p className="sleep-goodnight-text">לילה טוב</p>
        <p className="sleep-goodnight-sub">תן לעצמך לשקוע</p>
      </div>
    </div>
  );
}
