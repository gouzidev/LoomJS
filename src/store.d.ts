declare const createStore: (initialData: any) => {
    getState(): any;
    reducer(state: any, action: any): void;
    dispatch(action: any): void;
    subscribe(listener: (state: any) => void): () => void;
};
export { createStore };
