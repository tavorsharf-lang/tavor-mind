import { useEffect } from 'react';

export default function SleepGoodnight({ onExit }) {
  useEffect(() => {
    const id = setTimeout(() => onExit?.(), 6000);
    return () => clearTimeout(id);
  }, [onExit]);

  return (
    <div className="sleep-page">
      <button type="button" className="sleep-skip" onClick={onExit}>סגור</button>
      <div className="sleep-goodnight" onClick={onExit} role="button" tabIndex={-1}>
        <p className="sleep-goodnight-text">לילה טוב</p>
        <p className="sleep-goodnight-sub">תן לעצמך לשקוע</p>
      </div>
    </div>
  );
}
