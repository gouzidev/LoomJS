/** @jsx createElement */

// GLOBAL VAR 

let nextUnitOfWork: Fiber | null = null; // now no work should be done

let wipRoot: Fiber | null = null; // work in progress

let currentRoot: Fiber | null = null;

let deletions: Array<Fiber> = [];

let wipFiber: Fiber | null = null;

let hookIndex: number = 0;

function useState<T>(initial : T) : [T, (action: T | ((prev: T) => T)) => void]
{
    const oldHook : Hook | undefined = wipFiber?.alternate?.hooks?.[hookIndex];

    if (oldHook && oldHook?.type != 'state')
        throw Error('cant use useState here');
    const hook: UseStateHook = {
        type: 'state',
        state: oldHook ? oldHook.state : initial,
        queue: []
    }

    const actions = oldHook ? oldHook.queue : []

    actions.forEach((action: any) => 
    {
        if (typeof action === 'function')
            hook.state = action(hook.state) 
        else
            hook.state = action
    }) 

    const setState = (action: T | ((prev: T) => T)) => {
            hook.queue.push(action);
            
            wipRoot = {
                type: currentRoot!.type,
                dom: currentRoot!.dom,
                props: currentRoot!.props,
                alternate: currentRoot || undefined
            };
            nextUnitOfWork = wipRoot;
            deletions = [];
        };

        wipFiber?.hooks?.push(hook);
        hookIndex++;

        return [hook.state, setState];
}

function useEffect<T>(cb: (() => void), deps: Array<T>)
{
    let hook : UseEffectHook = {
        type: 'effect',
        effect : cb,
        deps: deps,
    }

    wipFiber?.hooks?.push(hook)
    hookIndex++;
}

import {FWremAttr, FWsetAttr} from './attribute.js'
import { createDom, createElement, createTextElement } from './createDom.js';
import { cleanChilds, extractEventNameProp, isEventListener, isProperty } from './helper.js';
import { EffectTag, FWElement, FWProps, Fiber, eventCallBack, Hook, log, UseStateHook, UseEffectHook} from './types.js'


/**
 * decider of wether the fiber is:
 * - new , needs to be added to DOM
 * - same, but props changed, needs to be updated
 * - old , no longer needed, needs to be deleted
 */

type FWDom = HTMLElement | Text

function updateDom(dom: FWDom, prevProps: FWProps | undefined, nextProps: FWProps | undefined) : void
{
    // remove old properties
    // add new properties

    // text nodes
    if (dom instanceof Text && nextProps)
    {
        if (prevProps?.nodeValue !== nextProps.nodeValue)
            dom.nodeValue = nextProps.nodeValue as string;
        return;
    }
    if (prevProps)
    {
        Object.keys(prevProps).forEach(prevProp => {
            if (dom instanceof HTMLElement)
            {
                if (!nextProps || !(prevProp in nextProps) || nextProps[prevProp] != prevProps[prevProp])
                    FWremAttr(dom, prevProp, prevProps[prevProp]);
            }
        })
    }

    if (nextProps)
    {
        Object.keys(nextProps).forEach(nextProp =>
        {
            if (dom instanceof HTMLElement)
            {
                if (!prevProps || !(nextProp in prevProps) || (nextProp in prevProps && prevProps[nextProp] != nextProps[nextProp]))
                    FWsetAttr(dom, nextProp, nextProps[nextProp])
            }
        })
    }
}



/**
 * a fnc that will take care of 
 * - re rendering elements that changed,
 * - and removing ones that are deleted
**/
function reconcileChildren(wipFiber: Fiber, children: Array<FWElement>) : void
{
    let i = 0;
    let prevSibling: Fiber | null = null;
    let oldFiber = wipFiber.alternate?.child

    while (i < children.length || oldFiber)
    {
        const element = children[i];
        let newFiber : Fiber | null = null;
        let sameType: boolean = false
        if (oldFiber && oldFiber.type)
            sameType = oldFiber && element && element.type == oldFiber.type;
        if (sameType)
        {
            // case 1 -> update - same type, keep DOM, update
            newFiber =
            {
                type : oldFiber!.type,
                props: element.props,
                dom : oldFiber!.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effect: EffectTag.UPDATE
            }
        }

        if (element && !sameType)
        {
            // case 2 -> place - new element, create new DOM
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: oldFiber,
                effect: EffectTag.PLACEMENT
            }
        }

        if (oldFiber && !sameType)
        {
            oldFiber.effect = EffectTag.DELETION
            deletions.push(oldFiber);
        }

        if (i === 0)
            wipFiber.child = newFiber || undefined;
        else if (prevSibling)
            prevSibling.sibling = newFiber || undefined

        if (oldFiber)
            oldFiber = oldFiber.sibling

        prevSibling = newFiber
        i++;
    }
}


function performUnitOfWork(fiber: Fiber) : Fiber | null // will start at root
{
    const isFncComponent = fiber.type instanceof Function

    if (isFncComponent)
        updateFncComponent(fiber);
    else if (fiber.type != undefined)
        updateHostComponent(fiber);

    if (fiber.child)
        return fiber.child
    // try siblings now
    let currFib : Fiber | undefined = fiber;
    while (currFib)
    {
        if (currFib.sibling)
            return currFib.sibling;

        currFib = currFib.parent
    }
    
    return null;
}

function commitRoot() : void
{
    deletions.forEach(commitWork);
    commitWork(wipRoot?.child)

   
    currentRoot = wipRoot // saving latest tree we just comitted
    wipRoot = null
}

function depsChanged(odeps: Array<any> | undefined, ndeps: Array<any> | undefined)
{
    if (!odeps || !ndeps)
        return true;
    if (odeps == ndeps)
        return false;

    if (odeps?.length !== ndeps?.length)
        return true;

    for (let i = 0; i < odeps.length; i++)
    {
        if (odeps[i] !== ndeps[i])
                return true;
    }
    return false;
}

function runEffectsForFiber(fiber: Fiber | undefined)
{
    if (!fiber)
        return;

    const hooks = fiber.hooks;
    const oldHooks = fiber.alternate?.hooks

    if (!hooks)
        return ;

    hooks.forEach((hook : Hook, indx: number) =>
    {
        if (hook.type == 'effect')
        {
            let effectHook = hook as UseEffectHook;
            let oldEffect = ((oldHooks?.[indx]) ? oldHooks?.[indx] as UseEffectHook :  undefined)
            const deps = effectHook.deps;
            const oldDeps = oldEffect?.deps;
            if (depsChanged(deps, oldDeps))
            {
                // cleanup function to clean effect function (free or cancel something)
                if (oldEffect?.cleanup)
                    oldEffect.cleanup();
                
                const cleanUp = effectHook.effect();
                if (typeof cleanUp === 'function')
                    effectHook.cleanup = cleanUp
                else
                    effectHook.cleanup = undefined;
            }
        }
    })
}

function commitWork(fiber: Fiber | undefined) : void
{
    let dontRunRelatives = false;
    if (!fiber)
        return ;

    let effect : EffectTag | undefined = fiber.effect;
    if (effect == EffectTag.PLACEMENT)
    {
        if (fiber.dom)
        {
            let domParentFiber = fiber.parent;
            while (!domParentFiber?.dom)
            {
                domParentFiber = domParentFiber?.parent;
            }
            if (domParentFiber?.dom instanceof HTMLElement)
            {
                domParentFiber.dom.appendChild(fiber.dom);
            }
        }
    }
    else if (effect == EffectTag.UPDATE)
    {
        if (fiber.dom)
        {
            updateDom(fiber.dom, fiber.alternate?.props, fiber.props)
        }
    }
    else if (effect == EffectTag.DELETION)
    {
        if (fiber.dom)
        {
            let domParentFiber = fiber.parent;
            while (!domParentFiber?.dom)
            {
                domParentFiber = domParentFiber?.parent;
            }
            if (domParentFiber?.dom instanceof HTMLElement)
            {
                domParentFiber.dom.removeChild(fiber.dom);
            }
        }
        dontRunRelatives = true; // mark a stop here because deleting should be recursive
    }

    runEffectsForFiber(fiber);

    if (dontRunRelatives)
        return ; // stoping here, deleting shouldnt be recursive unlike placing and updating
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}



// the workLoop: a fnc that the browser will call when idle
function workLoop(deadline: IdleDeadline)
{
    let shouldYield = false;

    while (!shouldYield && nextUnitOfWork)
    {
        // do one unit of work
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
        
        // check if we should stop or not
        shouldYield = deadline.timeRemaining() < 1;
        
    }

    if (!nextUnitOfWork && wipRoot)
    {
        commitRoot(); // builds the actual dom (entire tree)
    }
    // schedule next work session
    requestIdleCallback(workLoop);
}

// start the loop
requestIdleCallback(workLoop);

function updateFncComponent(fiber: Fiber) : void
{
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = [];

    const children = [(fiber.type as Function)(fiber.props)]
    reconcileChildren(fiber, children);
}

function updateHostComponent(fiber: Fiber) : void
{
    if (!fiber.dom)
        fiber.dom = createDom(fiber);

    if (fiber.type == "TEXT_ELEMENT")
        return
    const children = fiber.props.children || []
    reconcileChildren(fiber, children);
}

function render(element: FWElement, container: HTMLElement): void
{
    wipRoot = {
        type: "ROOT",
        dom : container,
        props : {
            children: [element]
        },
        alternate: currentRoot || undefined
    }
    deletions = [] // reset deletions for new render
    nextUnitOfWork = wipRoot
}

function Counter()
{
    const [seconds, setSeconds] = useState(0);
    
    useEffect(() => {
    const interval = setInterval(() => {
        setSeconds(s => s + 1);
    }, 1000);
    
    // return a cleanup function to clean effect function (free or cancel something)
    return () => {
        clearInterval(interval);  // stop the old interval
    };
}, [seconds]);
    
    return <h1>{seconds} seconds</h1>

}

const app = <Counter />
const root = document.getElementById("root");
if (root) {
    render(app, root);
}
