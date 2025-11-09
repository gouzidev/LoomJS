/** @jsx createElement */
import { createElement } from "./createDom.js";
import { useEffect, useState } from "./render.js";
let getAuthState = null;
const setAuthStateCheck = (checkFn) => {
    getAuthState = checkFn;
};
let FWroutes = [];
export function createRouter(routeList) {
    FWroutes = routeList;
}
let navigateCallback = null;
export function Router() {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);
    // update global reference
    navigateCallback = setCurrentPath;
    useEffect(() => {
        const onPopState = () => {
            if (navigateCallback) {
                navigateCallback(window.location.pathname);
            }
        };
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);
    const route = FWroutes.find((r) => r.path === currentPath);
    const isLogged = getAuthState ? getAuthState() : false;
    if (!route)
        // route not found
        return createElement("div", null, "404 Not Found");
    if (route?.authLvl == 2 /* AuthTag.LOGGED */ && !isLogged)
        // must be logged
        return createElement("div", null, "401 Unauthorized");
    if (route?.authLvl == 1 /* AuthTag.GUEST */ && isLogged)
        // must be guest (not logged)
        return createElement("div", null, "403 Forbidden");
    return createElement(route.component, {});
}
export function navigate(path) {
    // Don't navigate if already on this path
    if (window.location.pathname === path) {
        return;
    }
    // push new history entry with state
    window.history.pushState({ path, timestamp: Date.now() }, "", path);
    // trigger re-render
    if (navigateCallback) {
        navigateCallback(path);
    }
}
export function Link(props) {
    const handleClick = (e) => {
        e.preventDefault();
        navigate(props.to);
    };
    const content = props.children || props.text || props.to;
    let tag;
    if (props.className) {
        tag = (createElement("a", { href: props.to, className: props.className, onClick: handleClick }, content));
    }
    else {
        tag = (createElement("a", { href: props.to, onClick: handleClick }, content));
    }
    return tag;
}
export { FWroutes, setAuthStateCheck };
