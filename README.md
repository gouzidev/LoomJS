# LoomJS

A lightweight, reactive JSX-based UI library.

## Installation

```bash
npm install loomjs
```

## Usage

```typescript
import { createDom, Attribute } from 'loomjs';

// Create reactive state
const count = new Attribute(0);

// Create your component
const Counter = () => (
  <div>
    <h1>Count: {count}</h1>
    <button onclick={() => count.value++}>Increment</button>
  </div>
);

// Mount to DOM
document.body.appendChild(createDom(Counter()));
```

## Features

- Lightweight and fast
- JSX support
- Reactive attributes
- Zero dependencies