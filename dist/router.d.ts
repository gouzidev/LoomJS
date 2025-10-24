interface Route {
    path: string;
    component: () => any;
}
interface LinkProps {
    to: string;
    text?: string;
    children?: any;
}
declare let FWroutes: Route[];
export declare function createRouter(routeList: Route[]): void;
export declare function Router(): import("./types.js").FWElement;
export declare function navigate(path: string): void;
export declare function Link(props: LinkProps): any;
export { FWroutes };
//# sourceMappingURL=router.d.ts.map