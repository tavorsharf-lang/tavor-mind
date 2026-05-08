import { useEffect, useState } from 'react';
import { getPendingCount, getStuckCount } from '../utils/syncQueue.js';

export function useNetworkStatus() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const [pendingCount, setPendingCount] = useState(() => getPendingCount());
  const [stuckCount, setStuckCount] = useState(() => getStuckCount());

  useEffect(() => {
    const recheck = () => {
      setPendingCount(getPendingCount());
      setStuckCount(getStuckCount());
    };
    const onOnline = () => {
      setOnline(true);
      recheck();
      setTimeout(recheck, 1500);
      setTimeout(recheck, 4000);
    };
    const onOffline = () => {
      setOnline(false);
      recheck();
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    const id = setInterval(recheck, 5000);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      clearInterval(id);
    };
  }, []);

  const activeCount = Math.max(0, pendingCount - stuckCount);
  return { online, pendingCount, stuckCount, activeCount };
}
