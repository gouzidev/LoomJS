// Core rendering
export { render, useState, useEffect } from './render';

// DOM creation
export { createElement, createTextElement, createDom } from './createDom';

// Types
export type { 
  FWElement, 
  FWProps, 
  Fiber, 
  EffectTag 
} from './types';

// Helpers (optional)
export * from './helper';

/** @jsx createElement */
import { createElement, render, useState, useEffect } from '../src/index';

function Counter() {
  const [count, setCount] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <h1>Counter Demo</h1>
      <div>
        <p>Count: {count}</p>
        <button onclick={() => setCount(count + 1)}>Increment</button>
        <button onclick={() => setCount(count - 1)}>Decrement</button>
      </div>
      <div>
        <p>Timer: {seconds}s</p>
      </div>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  render(<Counter />, root);
}