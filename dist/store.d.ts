declare function createStore<T>(initialData: T, reducer: (state: T, action: any) => T): {
    getState(): T;
    dispatch(action: any): void;
    subscribe(listener: (state: any) => void): () => void;
};
export { createStore };
//# sourceMappingURL=store.d.ts.map