const createStore = (initialData) => {
    let state = initialData;
    const store = {
        // for now.
        getState() {
            return state;
        },
        reducer(state, action) { },
        dispatch(action) {
            state = store.reducer(state, action);
            listeners.forEach((listener) => listener(state));
        },
        subscribe(listener) {
            listeners.push(listener);
            return () => {
                // the unsub fnc is returned
                const idx = listeners.indexOf(listener); // get its idx in listeners to remove it
                listeners.splice(idx, 1); // it removes the fnc from the listeners, now it wont be ran
                // when dispatch gives the states for its listeners
            };
        },
    };
    const listeners = []; // arr of funcs that will be notified when state changes
    return store;
};
const store = createStore(undefined);
store.getState();
export { createStore };
//# sourceMappingURL=store.js.map