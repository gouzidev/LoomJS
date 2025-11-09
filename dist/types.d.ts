declare const enum EffectTag {
    PLACEMENT = 0,
    UPDATE = 1,
    DELETION = 2
}
declare const enum AuthTag {
    NONE = 0,
    GUEST = 1,
    LOGGED = 2
}
type SupportedElement = HTMLElement | SVGElement;
type FWDom = HTMLElement | SVGElement | Text;
interface FWProps {
    children?: Array<FWElement>;
    [key: string]: any;
}
interface FWElement {
    type: string | Function;
    props: FWProps;
}
type eventCallBack = (e: Event) => void;
type Hook = UseStateHook | UseEffectHook;
interface UseStateHook {
    type: "state";
    state: any;
    queue: Array<any>;
}
interface UseEffectHook {
    type: "effect";
    effect: () => void | (() => void);
    deps?: Array<any>;
    cleanup?: () => void;
}
interface Fiber {
    type: string | Function;
    props: FWProps;
    dom: HTMLElement | SVGElement | Text | null;
    parent?: Fiber;
    child?: Fiber;
    sibling?: Fiber;
    alternate?: Fiber;
    effect?: EffectTag;
    hooks?: Array<Hook>;
}
declare const log: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
};
declare const SVG_TAGS: Set<string>;
declare const SVG_CAMEL_CASE_ATTRS: Set<string>;
export { EffectTag, AuthTag, FWElement, FWProps, Fiber, eventCallBack, UseStateHook, UseEffectHook, Hook, FWDom, log, SupportedElement, SVG_CAMEL_CASE_ATTRS, SVG_TAGS, };
//# sourceMappingURL=types.d.ts.map