import { FWElement, Fiber } from './types.js';
export declare function useState<T>(initial: T): [T, (action: T | ((prev: T) => T)) => void];
export declare function useEffect<T>(cb: (() => void | (() => void)), deps: Array<T>): void;
declare function commitRoot(): void;
declare function commitWork(fiber: Fiber | undefined): void;
declare function updateFncComponent(fiber: Fiber): void;
declare function updateHostComponent(fiber: Fiber): void;
export declare function render(element: FWElement, container: HTMLElement): void;
export { commitRoot, commitWork, updateFncComponent, updateHostComponent };
//# sourceMappingURL=render.d.ts.map