interface Route {
    path: string;
    component: () => any;
}
declare let FWroutes: Route[];
export declare function createRouter(routeList: Route[]): void;
export { FWroutes };
//# sourceMappingURL=router.d.ts.map