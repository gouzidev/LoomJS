/** @jsx createElement */
// GLOBAL VAR 
let nextUnitOfWork = null; // now no work should be done
let wipRoot = null; // work in progress
let currentRoot = null;
let deletions = [];
let wipFiber = null;
let hookIndex = 0;
function useState(initial) {
    var _a, _b, _c;
    const oldHook = (_b = (_a = wipFiber === null || wipFiber === void 0 ? void 0 : wipFiber.alternate) === null || _a === void 0 ? void 0 : _a.hooks) === null || _b === void 0 ? void 0 : _b[hookIndex];
    if (oldHook && (oldHook === null || oldHook === void 0 ? void 0 : oldHook.type) != 'state')
        throw Error('cant use useState here');
    const hook = {
        type: 'state',
        state: oldHook ? oldHook.state : initial,
        queue: []
    };
    const actions = oldHook ? oldHook.queue : [];
    actions.forEach((action) => {
        if (typeof action === 'function')
            hook.state = action(hook.state);
        else
            hook.state = action;
    });
    const setState = (action) => {
        hook.queue.push(action);
        wipRoot = {
            type: currentRoot.type,
            dom: currentRoot.dom,
            props: currentRoot.props,
            alternate: currentRoot || undefined
        };
        nextUnitOfWork = wipRoot;
        deletions = [];
    };
    (_c = wipFiber === null || wipFiber === void 0 ? void 0 : wipFiber.hooks) === null || _c === void 0 ? void 0 : _c.push(hook);
    hookIndex++;
    return [hook.state, setState];
}
function useEffect(cb, deps) {
    var _a;
    let hook = {
        type: 'effect',
        effect: cb,
        deps: deps,
    };
    (_a = wipFiber === null || wipFiber === void 0 ? void 0 : wipFiber.hooks) === null || _a === void 0 ? void 0 : _a.push(hook);
    hookIndex++;
}
import { FWremAttr, FWsetAttr } from './attribute.js';
import { createDom, createElement } from './createDom.js';
function updateDom(dom, prevProps, nextProps) {
    // remove old properties
    // add new properties
    // text nodes
    if (dom instanceof Text && nextProps) {
        if ((prevProps === null || prevProps === void 0 ? void 0 : prevProps.nodeValue) !== nextProps.nodeValue)
            dom.nodeValue = nextProps.nodeValue;
        return;
    }
    if (prevProps) {
        Object.keys(prevProps).forEach(prevProp => {
            if (dom instanceof HTMLElement) {
                if (!nextProps || !(prevProp in nextProps) || nextProps[prevProp] != prevProps[prevProp])
                    FWremAttr(dom, prevProp, prevProps[prevProp]);
            }
        });
    }
    if (nextProps) {
        Object.keys(nextProps).forEach(nextProp => {
            if (dom instanceof HTMLElement) {
                if (!prevProps || !(nextProp in prevProps) || (nextProp in prevProps && prevProps[nextProp] != nextProps[nextProp]))
                    FWsetAttr(dom, nextProp, nextProps[nextProp]);
            }
        });
    }
}
/**
 * a fnc that will take care of
 * - re rendering elements that changed,
 * - and removing ones that are deleted
**/
function reconcileChildren(wipFiber, children) {
    var _a;
    let i = 0;
    let prevSibling = null;
    let oldFiber = (_a = wipFiber.alternate) === null || _a === void 0 ? void 0 : _a.child;
    while (i < children.length || oldFiber) {
        const element = children[i];
        let newFiber = null;
        let sameType = false;
        if (oldFiber && oldFiber.type)
            sameType = oldFiber && element && element.type == oldFiber.type;
        if (sameType) {
            // case 1 -> update - same type, keep DOM, update
            newFiber =
                {
                    type: oldFiber.type,
                    props: element.props,
                    dom: oldFiber.dom,
                    parent: wipFiber,
                    alternate: oldFiber,
                    effect: 1 /* EffectTag.UPDATE */
                };
        }
        if (element && !sameType) {
            // case 2 -> place - new element, create new DOM
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: oldFiber,
                effect: 0 /* EffectTag.PLACEMENT */
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
    commitWork(wipRoot === null || wipRoot === void 0 ? void 0 : wipRoot.child);
    currentRoot = wipRoot; // saving latest tree we just comitted
    wipRoot = null;
}
function depsChanged(odeps, ndeps) {
    if (!odeps || !ndeps)
        return true;
    if (odeps == ndeps)
        return false;
    if ((odeps === null || odeps === void 0 ? void 0 : odeps.length) !== (ndeps === null || ndeps === void 0 ? void 0 : ndeps.length))
        return true;
    for (let i = 0; i < odeps.length; i++) {
        if (odeps[i] !== ndeps[i])
            return true;
    }
    return false;
}
function runEffectsForFiber(fiber) {
    var _a;
    if (!fiber)
        return;
    const hooks = fiber.hooks;
    const oldHooks = (_a = fiber.alternate) === null || _a === void 0 ? void 0 : _a.hooks;
    if (!hooks)
        return;
    hooks.forEach((hook, indx) => {
        if (hook.type == 'effect') {
            let effectHook = hook;
            let oldEffect = ((oldHooks === null || oldHooks === void 0 ? void 0 : oldHooks[indx]) ? oldHooks === null || oldHooks === void 0 ? void 0 : oldHooks[indx] : undefined);
            const deps = effectHook.deps;
            const oldDeps = oldEffect === null || oldEffect === void 0 ? void 0 : oldEffect.deps;
            if (depsChanged(deps, oldDeps)) {
                // cleanup function to clean effect function (free or cancel something)
                if (oldEffect === null || oldEffect === void 0 ? void 0 : oldEffect.cleanup)
                    oldEffect.cleanup();
                const cleanUp = effectHook.effect();
                if (typeof cleanUp === 'function')
                    effectHook.cleanup = cleanUp;
                else
                    effectHook.cleanup = undefined;
            }
        }
    });
}
function commitWork(fiber) {
    var _a;
    let dontRunRelatives = false;
    if (!fiber)
        return;
    let effect = fiber.effect;
    if (effect == 0 /* EffectTag.PLACEMENT */) {
        if (fiber.dom) {
            let domParentFiber = fiber.parent;
            while (!(domParentFiber === null || domParentFiber === void 0 ? void 0 : domParentFiber.dom)) {
                domParentFiber = domParentFiber === null || domParentFiber === void 0 ? void 0 : domParentFiber.parent;
            }
            if ((domParentFiber === null || domParentFiber === void 0 ? void 0 : domParentFiber.dom) instanceof HTMLElement) {
                domParentFiber.dom.appendChild(fiber.dom);
            }
        }
    }
    else if (effect == 1 /* EffectTag.UPDATE */) {
        if (fiber.dom) {
            updateDom(fiber.dom, (_a = fiber.alternate) === null || _a === void 0 ? void 0 : _a.props, fiber.props);
        }
    }
    else if (effect == 2 /* EffectTag.DELETION */) {
        if (fiber.dom) {
            let domParentFiber = fiber.parent;
            while (!(domParentFiber === null || domParentFiber === void 0 ? void 0 : domParentFiber.dom)) {
                domParentFiber = domParentFiber === null || domParentFiber === void 0 ? void 0 : domParentFiber.parent;
            }
            if ((domParentFiber === null || domParentFiber === void 0 ? void 0 : domParentFiber.dom) instanceof HTMLElement) {
                domParentFiber.dom.removeChild(fiber.dom);
            }
        }
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
function render(element, container) {
    wipRoot = {
        type: "ROOT",
        dom: container,
        props: {
            children: [element]
        },
        alternate: currentRoot || undefined
    };
    deletions = []; // reset deletions for new render
    nextUnitOfWork = wipRoot;
}
function Counter() {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
        // return a cleanup function to clean effect function (free or cancel something)
        return () => {
            clearInterval(interval); // stop the old interval
        };
    }, [seconds]);
    return createElement("h1", null,
        seconds,
        " seconds");
}
const app = createElement(Counter, null);
const root = document.getElementById("root");
if (root) {
    render(app, root);
}
//# sourceMappingURL=app.js.map