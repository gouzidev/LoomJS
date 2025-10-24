interface Route
{
    path: string, // '/about'
    component: () => any; // () => <About />
}

let FWroutes: Route[] = [];


export function createRouter(routeList: Route[])
{
    FWroutes = routeList;
}




















export { FWroutes }

