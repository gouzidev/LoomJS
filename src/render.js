import { FWremAttr, FWsetAttr } from "./attribute.js";
import { createDom } from "./createDom.js";
let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = [];
let wipFiber = null;
let hookIndex = 0;
export function useState(initial) {
    const oldHook = wipFiber?.alternate?.hooks?.[hookIndex];
    if (oldHook && oldHook?.type != "state")
        throw Error("cant use useState here");
    let state = oldHook ? oldHook.state : initial;
    const actions = oldHook ? oldHook.queue : [];
    // processing ALL queued actions FIRST
    actions.forEach((action) => {
        if (typeof action === "function")
            state = action(state);
        else
            state = action;
    });
    const hook = {
        type: "state",
        state: state,
        queue: [],
    };
    const setState = (action) => {
        hook.queue.push(action);
        wipRoot = {
            type: currentRoot.type,
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot || undefined,
        };
        nextUnitOfWork = wipRoot;
        deletions = [];
    };
    wipFiber?.hooks?.push(hook);
    hookIndex++;
    return [hook.state, setState];
}
export function useEffect(cb, deps) {
    let hook = {
        type: "effect",
        effect: cb,
        deps: deps,
    };
    wipFiber?.hooks?.push(hook);
    hookIndex++;
}
function commitDeletion(fiber) {
    // find a DOM node in this subtree
    if (fiber.dom) {
        let domParentFiber = fiber.parent;
        while (domParentFiber && !domParentFiber.dom) {
            domParentFiber = domParentFiber.parent;
        }
        if (domParentFiber?.dom instanceof HTMLElement ||
            domParentFiber?.dom instanceof SVGElement) {
            domParentFiber.dom.removeChild(fiber.dom);
        }
    }
    else if (fiber.child) {
        // recursive delete for function components that have no dom
        commitDeletion(fiber.child);
    }
}
function updateDom(dom, prevProps, nextProps) {
    // text nodes
    if (dom instanceof Text) {
        if (nextProps?.nodeValue !== undefined) {
            dom.nodeValue = nextProps.nodeValue;
        }
        return;
    }
    if (dom instanceof Text && nextProps) {
        if (prevProps?.nodeValue !== nextProps.nodeValue)
            dom.nodeValue = nextProps.nodeValue || "";
        return;
    }
    if (prevProps) {
        Object.keys(prevProps).forEach((prevProp) => {
            if (dom instanceof HTMLElement || dom instanceof SVGElement) {
                if (!nextProps ||
                    !(prevProp in nextProps) ||
                    nextProps[prevProp] != prevProps[prevProp])
                    FWremAttr(dom, prevProp, prevProps[prevProp]);
            }
        });
    }
    if (nextProps) {
        Object.keys(nextProps).forEach((nextProp) => {
            if (dom instanceof HTMLElement || dom instanceof SVGElement) {
                if (!prevProps ||
                    !(nextProp in prevProps) ||
                    (nextProp in prevProps && prevProps[nextProp] != nextProps[nextProp]))
                    FWsetAttr(dom, nextProp, nextProps[nextProp]);
            }
        });
    }
}
function depsChanged(odeps, ndeps) {
    if (!odeps || !ndeps)
        return true;
    if (odeps == ndeps)
        return false;
    if (odeps?.length !== ndeps?.length)
        return true;
    for (let i = 0; i < odeps.length; i++) {
        if (odeps[i] !== ndeps[i])
            return true;
    }
    return false;
}
function runEffectsForFiber(fiber) {
    if (!fiber)
        return;
    const hooks = fiber.hooks;
    const oldHooks = fiber.alternate?.hooks;
    if (!hooks)
        return;
    hooks.forEach((hook, indx) => {
        if (hook.type == "effect") {
            let effectHook = hook;
            let oldEffect = oldHooks?.[indx]
                ? oldHooks?.[indx]
                : undefined;
            const deps = effectHook.deps;
            const oldDeps = oldEffect?.deps;
            if (depsChanged(deps, oldDeps)) {
                // cleanup function to clean effect function (free or cancel something)
                if (oldEffect?.cleanup)
                    oldEffect.cleanup();
                const cleanUp = effectHook.effect();
                if (typeof cleanUp === "function")
                    effectHook.cleanup = cleanUp;
                else
                    effectHook.cleanup = undefined;
            }
        }
    });
}
/**
 * a fnc that will take care of
 * - re rendering elements that changed,
 * - and removing ones that are deleted
 **/
function reconcileChildren(wipFiber, children) {
    let i = 0;
    let prevSibling = null;
    let oldFiber = wipFiber.alternate?.child;
    while (i < children.length || oldFiber) {
        const element = children[i];
        let newFiber = null;
        let sameType = false;
        if (oldFiber && oldFiber.type)
            sameType = oldFiber && element && element.type == oldFiber.type;
        if (sameType) {
            // case 1 -> update - same type, keep DOM, update
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effect: 1 /* EffectTag.UPDATE */,
            };
        }
        if (element && !sameType) {
            // case 2 -> place - new element, create new DOM
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: undefined,
                effect: 0 /* EffectTag.PLACEMENT */,
            };
        }
        if (oldFiber && !sameType) {
            oldFiber.effect = 2 /* EffectTag.DELETION */;
            deletions.push(oldFiber);
        }
        if (i === 0)
            wipFiber.child = newFiber || undefined;
        else if (prevSibling)
            prevSibling.sibling = newFiber || undefined;
        if (oldFiber)
            oldFiber = oldFiber.sibling;
        prevSibling = newFiber;
        i++;
    }
}
function performUnitOfWork(fiber) {
    // will start at root
    const isFncComponent = fiber.type instanceof Function;
    if (isFncComponent)
        updateFncComponent(fiber);
    else if (fiber.type != undefined)
        updateHostComponent(fiber);
    if (fiber.child)
        return fiber.child;
    // try siblings now
    let currFib = fiber;
    while (currFib) {
        if (currFib.sibling)
            return currFib.sibling;
        currFib = currFib.parent;
    }
    return null;
}
function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot?.child);
    currentRoot = wipRoot; // saving latest tree we just comitted
    wipRoot = null;
}
function commitWork(fiber) {
    let dontRunRelatives = false;
    if (!fiber)
        return;
    let effect = fiber.effect;
    if (effect == 0 /* EffectTag.PLACEMENT */) {
        if (fiber.dom) {
            let domParentFiber = fiber.parent;
            while (!domParentFiber?.dom) {
                domParentFiber = domParentFiber?.parent;
            }
            if (domParentFiber?.dom instanceof HTMLElement ||
                domParentFiber?.dom instanceof SVGElement) {
                domParentFiber.dom.appendChild(fiber.dom);
            }
        }
    }
    else if (effect == 1 /* EffectTag.UPDATE */) {
        if (fiber.dom) {
            updateDom(fiber.dom, fiber.alternate?.props, fiber.props);
        }
    }
    else if (effect == 2 /* EffectTag.DELETION */) {
        commitDeletion(fiber);
        dontRunRelatives = true; // mark a stop here because deleting should be recursive
    }
    runEffectsForFiber(fiber);
    if (dontRunRelatives)
        return; // stoping here, deleting shouldnt be recursive unlike placing and updating
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}
// the workLoop: a fnc that the browser will call when idle
function workLoop(deadline) {
    let shouldYield = false;
    while (!shouldYield && nextUnitOfWork) {
        // do one unit of work
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        // check if we should stop or not
        shouldYield = deadline.timeRemaining() < 1;
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot(); // builds the actual dom (entire tree)
    }
    // schedule next work session
    requestIdleCallback(workLoop);
}
// start the loop
requestIdleCallback(workLoop);
function updateFncComponent(fiber) {
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = [];
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
}
function updateHostComponent(fiber) {
    if (!fiber.dom)
        fiber.dom = createDom(fiber);
    if (fiber.type == "TEXT_ELEMENT")
        return;
    const children = fiber.props.children || [];
    reconcileChildren(fiber, children);
}
export function render(element, container) {
    wipRoot = {
        type: "ROOT",
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot || undefined,
    };
    deletions = []; // reset deletions for new render
    nextUnitOfWork = wipRoot;
}
export { commitRoot, commitWork, updateFncComponent, updateHostComponent };
//# sourceMappingURL=render.js.map