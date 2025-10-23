const enum EffectTag
{
    PLACEMENT,
    UPDATE,
    DELETION
}

interface FWProps
{
    children?: Array<FWElement>
    [key: string]: any;
}

interface FWElement // FW -> frame work (yes, i still got no name for it)
{
    type: string | Function; // div, span or TEXT_ELEMENT
    props : FWProps
}

type eventCallBack = ((e: Event) => void)

type Hook = UseStateHook | UseEffectHook


interface UseStateHook
{
    type: 'state'
    state: any;
    queue: Array<any>;
}

interface UseEffectHook
{
    type: 'effect'
    effect: () => (void | (() => void)) // fnc that returns void or an other fnc
    deps?: Array<any>
    cleanup?: () => void; // cleanup fnc to clean effect fnc (free or stop something)
}

interface Fiber // a fiber is a small unit of the tree
{
    type: string | Function
    props: FWProps
    dom: HTMLElement | Text | null

    // data structure
    parent?: Fiber
    child?: Fiber
    sibling?: Fiber

    alternate? : Fiber // link to same el from prev render

    effect?: EffectTag

    hooks?: Array <Hook>;
    
}

const log = console.log;

export {EffectTag, FWElement, FWProps, Fiber, eventCallBack, UseStateHook, UseEffectHook, Hook, log}
