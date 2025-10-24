/** @jsx createElement */
import { createElement } from "./createDom.js";
import { useEffect, useState } from "./render.js";

interface Route
{
    path: string, // '/about'
    component: () => any; // () => <About />
}

interface LinkProps
{
    to: string;
    text?: string;
    children?: any;
}

let FWroutes: Route[] = [];


export function createRouter(routeList: Route[])
{
    FWroutes = routeList;
}


let navigateCallback: ((path: string) => void) | null = null

export function Router()
{
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // update global reference
  navigateCallback = setCurrentPath;

  useEffect(() => {
    const onPopState = () => {
      console.log('Popstate fired! now path:', window.location.pathname);
      if (navigateCallback) {
        navigateCallback(window.location.pathname);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const route = FWroutes.find((r) => r.path === currentPath);
  console.log('Found route:', route);

  if (route) {
    return createElement(route.component, {}); // ✅ fixes both navigation + typing
  }

  return createElement('div', null, '404 Not Found');
}


export function navigate(path: string)
{
    // Don't navigate if already on this path
    if (window.location.pathname === path) {
        console.log('Already on', path, '- skipping navigation');
        return;
    }
    
    console.log('Navigating:', window.location.pathname, '→', path);
    
    // Push new history entry with state
    window.history.pushState({ path, timestamp: Date.now() }, '', path);
    
    console.log('New history length:', window.history.length);
    
    // Trigger re-render
    if (navigateCallback)
    {
        navigateCallback(path);
    }
}


export function Link(props: LinkProps)
{
    const handleClick = (e: Event) =>
    {
        console.log('Link clicked!', props.to);
        e.preventDefault();
        console.log('Calling navigate...');
        navigate(props.to);
    }

    const content = props.children || props.text || props.to;

    const tag = <a href={props.to} onClick={handleClick}>{content}</a>
    console.log(tag);
    return tag;

}









export { FWroutes }

