# LoomJS - An Elegant React-like Framework from Scratch

A lightweight UI framework that implements core React concepts: fiber architecture, hooks, and efficient DOM reconciliation.

---

## What is this?

This is a **learning project** that rebuilds React's internals from the ground up. it demonstrates how modern frameworks work under the hood.

**Key features:**
- Fiber-based rendering (non-blocking updates)
- Hooks (`useState`, `useEffect`)
- Efficient DOM updates (reconciliation)
- JSX support
- Function components

---

## Quick Start

**1. Install dependencies:**
```bash
npm install
```

**2. Compile TypeScript:**
```bash
npx tsc
```

**3. Run a server:**
```bash
python -m http.server 8000
```

**4. Open in browser:**
```
http://localhost:8000/index.html
```








**0. or simply:**
```bash
./init.sh
```
**and go to:**
```
http://localhost:8000/index.html
```

---

## Example

```tsx
function Counter() {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        console.log('Count changed:', count);
    }, [count]);
    
    return (
        <h1 onClick={() => setCount(c => c + 1)}>
            Clicks: {count}
        </h1>
    );
}

const root = document.getElementById("root");
render(<Counter />, root);
```

---

## How It Works

**Fiber Architecture:**  
Instead of blocking the browser while rendering a huge component tree, we break work into small "fibers" (units). The browser can pause our work to handle user input, then resume later.

**Reconciliation:**  
When state changes, we don't rebuild the entire DOM. We compare the old tree with the new one and only update what changed (like React's virtual DOM).

**Hooks:**  
`useState` and `useEffect` store their data in the fiber's `hooks` array. Each hook has a position (index), so React knows which hook you're calling across renders.

**Two-Phase Rendering:**
1. **Render phase:** Build the fiber tree, detect changes
2. **Commit phase:** Apply changes to the real DOM all at once

---

## Project Structure

```
src/
├── app.tsx          # Main logic, fiber reconciliation, hooks
├── types.tsx        # TypeScript interfaces (Fiber, Hook, etc)
├── createDom.tsx    # JSX → DOM conversion
├── attribute.tsx    # Setting/removing DOM attributes
├── helper.tsx       # Utility functions
└── css/
    └── styles.css   # Tailwind + custom styles
```

---

## What You'll Learn

- How React's fiber architecture prevents UI freezing
- Why hooks must be called in the same order every render
- How virtual DOM diffing works (reconciliation)
- Why effects run after DOM updates, not during render
- How cleanup functions prevent memory leaks

---

## Limitations

- No context API
- No `useRef`, `useMemo`, or `useCallback`
- No error boundaries
- No keys for list reconciliation
- No batching of multiple `setState` calls
- Performance not optimized for large apps

---

## Why Build This?

Understanding React's internals helps you:
- Debug React apps faster
- Write better custom hooks
- Understand why certain patterns exist (like "don't call hooks in loops")
- Appreciate the complexity hidden behind `useState`

---

## Team Notes

**Before contributing:**
- Read through `src/app.tsx` to understand the fiber workflow
- Check `src/types.tsx` for the data structures
- Test changes with `tsc` before committing

**Adding features?** Follow the existing pattern:
1. Update types in `src/types.tsx`
2. Implement logic in `src/app.tsx`
3. Test with a simple component

---

Built by [@sgouzi](https://github.com/sgouzi) as a React internals learning project.
