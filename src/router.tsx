/** @jsx createElement */
import { createElement } from "./createDom.js";
import { useEffect, useState } from "./render.js";
import { AuthTag } from "./types.js";

interface Route {
  path: string; // '/about'
  component: () => any; // () => <About />
  authLvl: AuthTag; // does this route require, no privlage, guest or logged privlage?
}

let getAuthState: (() => boolean) | null = null;

const setAuthStateCheck = (checkFn: () => boolean) => {
  getAuthState = checkFn;
};

interface LinkProps {
  to: string;
  text?: string;
  className?: string;
  children?: any;
}

let FWroutes: Route[] = [];

export function createRouter(routeList: Route[]) {
  FWroutes = routeList;
}

let navigateCallback: ((path: string) => void) | null = null;

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

  if (route?.authLvl == AuthTag.LOGGED && !isLogged)
    // must be logged
    return createElement("div", null, "401 Unauthorized");
  if (route?.authLvl == AuthTag.GUEST && isLogged)
    // must be guest (not logged)
    return createElement("div", null, "403 Forbidden");

  return createElement(route.component, {});
}

export function navigate(path: string) {
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

export function Link(props: LinkProps) {
  const handleClick = (e: Event) => {
    e.preventDefault();
    navigate(props.to);
  };

  const content = props.children || props.text || props.to;
  let tag;
  if (props.className) {
    tag = (
      <a href={props.to} className={props.className} onClick={handleClick}>
        {content}
      </a>
    );
  } else {
    tag = (
      <a href={props.to} onClick={handleClick}>
        {content}
      </a>
    );
  }
  return tag;
}

export { FWroutes, setAuthStateCheck };
