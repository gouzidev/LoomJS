declare const enum EffectTag {
    PLACEMENT = 0,
    UPDATE = 1,
    DELETION = 2
}
type FWDom = HTMLElement | Text;
interface FWProps {
    children?: Array<FWElement>;
    [key: string]: any;
}
interface FWElement {
    type: string | Function;
    props: FWProps;
}
type eventCallBack = ((e: Event) => void);
type Hook = UseStateHook | UseEffectHook;
interface UseStateHook {
    type: 'state';
    state: any;
    queue: Array<any>;
}
interface UseEffectHook {
    type: 'effect';
    effect: () => (void | (() => void));
    deps?: Array<any>;
    cleanup?: () => void;
}
interface Fiber {
    type: string | Function;
    props: FWProps;
    dom: HTMLElement | Text | null;
    parent?: Fiber;
    child?: Fiber;
    sibling?: Fiber;
    alternate?: Fiber;
    effect?: EffectTag;
    hooks?: Array<Hook>;
}
declare const log: (...data: any[]) => void;
export { EffectTag, FWElement, FWProps, Fiber, eventCallBack, UseStateHook, UseEffectHook, Hook, FWDom, log };
//# sourceMappingURL=types.d.ts.map