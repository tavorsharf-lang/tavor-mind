import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

// Stack-based registry for "previous step" handlers. Multi-step flows
// (EmergencyFlow, MoodCheckin, TriggerTracker, CatastropheCheck) register
// a handler that decrements their internal step state. The global NavRail
// uses the topmost registered handler when its "previous" button is pressed,
// so a single button means "go to the previous step within this flow"
// rather than "leave the flow."
const NavContext = createContext({
  back: null,
  pushBack: () => {},
  popBack: () => {},
});

export function NavProvider({ children }) {
  const [stack, setStack] = useState([]);

  const pushBack = useCallback((fn) => {
    setStack((s) => [...s, fn]);
  }, []);

  const popBack = useCallback((fn) => {
    setStack((s) => {
      const i = s.lastIndexOf(fn);
      return i < 0 ? s : [...s.slice(0, i), ...s.slice(i + 1)];
    });
  }, []);

  const back = stack.length > 0 ? stack[stack.length - 1] : null;

  return (
    <NavContext.Provider value={{ back, pushBack, popBack }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}

// Register a back handler for the active screen. The handler runs when the
// user clicks the global "previous" button. Most-recently mounted handler
// wins (stack semantics) — when a sub-screen unmounts, its parent's handler
// becomes active again.
export function useBackHandler(fn) {
  const { pushBack, popBack } = useNav();
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    if (!fnRef.current) return undefined;
    const stable = () => {
      const f = fnRef.current;
      if (typeof f === 'function') f();
    };
    pushBack(stable);
    return () => popBack(stable);
  }, [pushBack, popBack]);
}
