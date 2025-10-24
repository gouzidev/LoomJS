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

export function Router() : null | (() => any)
{
    console.log('Router rendering, currentPath:', window.location.pathname);

    // state tracks current path
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    console.log('currentPath state:', currentPath);


    // register the callback so navigate() can trigger re-renders
    navigateCallback = setCurrentPath;


    useEffect(() => {
        console.log('Router mounted, adding popstate listener');

        const onPopState = () =>
        {
            console.log('Popstate fired! New path:', window.location.pathname);
            setCurrentPath(window.location.pathname);
        }

        window.addEventListener('popstate', onPopState);
        
        // cleanup the event listener
        return () => 
        {
            console.log('Router unmounting, removing listener');
            window.removeEventListener('popstate', onPopState);
        }

    }, []) // no deps, on first mount only

    // find matching route
    const route = FWroutes.find((r: Route) => (r.path === currentPath));
    console.log('Found route:', route);

    // render it
    if (route)
    {
        console.log(route.component());
        return route.component();
    }
    console.log('No route found, returning null');

    return null
}

export function navigate(path: string)
{
    console.log('befor', window.history);
    window.history.pushState({}, '', path);
    
    console.log('after', window.history);
    // tells the router to re render
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

    return (
        <a href={props.to} onclick={handleClick}>
            {props.to}
        </a>
    );}














export { FWroutes }

