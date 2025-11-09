function createStore(initialData, reducer) {
    let state = initialData;
    const store = {
        // for now.
        getState() {
            return state;
        },
        dispatch(action) {
            state = reducer(state, action);
            listeners.forEach((listener) => {
                listener(state);
                console.log("state from reducer -> ", state);
            });
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
}
export { createStore };
