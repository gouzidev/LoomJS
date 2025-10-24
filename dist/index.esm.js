// src/createDom.tsx
function createElement(type, props, ...children) {
  const childs = cleanChilds(children);
  return {
    type,
    props: {
      ...props,
      children: childs
    }
  };
}
function createTextElement(text) {
  let el;
  el = {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  };
  return el;
}
function createDom(fiber) {
  const dom = fiber.type == "TEXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);
  const isProperty2 = (key) => key !== "children";
  Object.keys(fiber.props || {}).filter(isProperty2).forEach((prop) => {
    FWsetAttr(dom, prop, fiber.props[prop]);
  });
  return dom;
}

// src/helper.tsx
function isEventListener(str) {
  return str.startsWith("on");
}
function isProperty(str) {
  return str != "children" && !isEventListener(str);
}
function extractEventNameProp(prop) {
  return prop.toLocaleLowerCase().substring(2);
}
function cleanChilds(children) {
  let childs = children.map((child) => {
    if (typeof child == "string" || typeof child == "number") {
      return createTextElement(child);
    } else {
      return child;
    }
  });
  return childs;
}

// src/attribute.tsx
function addEvent(node, prop, value) {
  switch (prop) {
    case "onHover":
      node.addEventListener("mouseover", value);
      break;
    case "onFocus":
      node.addEventListener("focus", value);
      break;
    default:
      const name = prop.toLowerCase().slice(2);
      node.addEventListener(name, value);
  }
}
function removeEvent(node, prop, value) {
  switch (prop) {
    case "onHover":
      node.removeEventListener("mouseover", value);
      break;
    case "onFocus":
      node.removeEventListener("focus", value);
      break;
    default:
      const name = prop.toLowerCase().slice(2);
      node.removeEventListener(name, value);
  }
}
function FWremAttr(node, prop, value) {
  if (prop == "className" && typeof value == "string")
    node.className = "";
  else if (["checked", "selected", "disabled"].includes(prop)) {
    let inputEl = node;
    switch (prop) {
      case "checked":
        inputEl.checked = false;
        inputEl.removeAttribute("checked");
        break;
      case "selected":
        inputEl.removeAttribute("selected");
        break;
      case "disabled":
        inputEl.disabled = false;
        inputEl.removeAttribute("disabled");
        break;
    }
  } else if (isEventListener(prop)) {
    if (typeof value != "string")
      removeEvent(node, prop, value);
  } else if (isProperty(prop)) {
    if (prop == "nodeValue") {
      node.nodeValue = null;
    } else
      node.removeAttribute(prop);
  }
}
function FWsetAttr(node, prop, value) {
  if (prop === "children") return;
  if (prop == "className") {
    node.classList.add(value);
  } else if (["checked", "selected", "disabled"].includes(prop)) {
    let inputEl = node;
    switch (prop) {
      case "checked":
        inputEl.checked = value === "true";
        break;
      case "selected":
        inputEl.setAttribute("selected", value);
        break;
      case "disabled":
        inputEl.disabled = Boolean(value);
        break;
    }
  } else if (isEventListener(prop)) {
    addEvent(node, prop, value);
  } else {
    if (prop == "nodeValue") {
      node.nodeValue = value;
    } else
      node.setAttribute(prop, value);
  }
}

// src/render.tsx
var nextUnitOfWork = null;
var wipRoot = null;
var currentRoot = null;
var deletions = [];
var wipFiber = null;
var hookIndex = 0;
function useState(initial) {
  const oldHook = wipFiber?.alternate?.hooks?.[hookIndex];
  if (oldHook && oldHook?.type != "state")
    throw Error("cant use useState here");
  const hook = {
    type: "state",
    state: oldHook ? oldHook.state : initial,
    queue: []
  };
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    if (typeof action === "function")
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
      alternate: currentRoot || void 0
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };
  wipFiber?.hooks?.push(hook);
  hookIndex++;
  return [hook.state, setState];
}
function useEffect(cb, deps) {
  let hook = {
    type: "effect",
    effect: cb,
    deps
  };
  wipFiber?.hooks?.push(hook);
  hookIndex++;
}
function updateDom(dom, prevProps, nextProps) {
  console.log("updateDom called:", {
    dom,
    prevProps,
    nextProps,
    isText: dom instanceof Text
  });
  if (dom instanceof Text) {
    console.log("Updating text:", prevProps?.nodeValue, "\u2192", nextProps?.nodeValue);
    if (nextProps?.nodeValue !== void 0) {
      dom.nodeValue = nextProps.nodeValue;
    }
    return;
  }
  if (dom instanceof Text && nextProps) {
    console.log("Updating text node:", prevProps?.nodeValue, "\u2192", nextProps.nodeValue);
    if (prevProps?.nodeValue !== nextProps.nodeValue)
      dom.nodeValue = nextProps.nodeValue || "";
    return;
  }
  if (prevProps) {
    Object.keys(prevProps).forEach((prevProp) => {
      if (dom instanceof HTMLElement) {
        if (!nextProps || !(prevProp in nextProps) || nextProps[prevProp] != prevProps[prevProp])
          FWremAttr(dom, prevProp, prevProps[prevProp]);
      }
    });
  }
  if (nextProps) {
    Object.keys(nextProps).forEach((nextProp) => {
      if (dom instanceof HTMLElement) {
        if (!prevProps || !(nextProp in prevProps) || nextProp in prevProps && prevProps[nextProp] != nextProps[nextProp])
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
      let oldEffect = oldHooks?.[indx] ? oldHooks?.[indx] : void 0;
      const deps = effectHook.deps;
      const oldDeps = oldEffect?.deps;
      if (depsChanged(deps, oldDeps)) {
        if (oldEffect?.cleanup)
          oldEffect.cleanup();
        const cleanUp = effectHook.effect();
        if (typeof cleanUp === "function")
          effectHook.cleanup = cleanUp;
        else
          effectHook.cleanup = void 0;
      }
    }
  });
}
function reconcileChildren(wipFiber2, children) {
  let i = 0;
  let prevSibling = null;
  let oldFiber = wipFiber2.alternate?.child;
  while (i < children.length || oldFiber) {
    const element = children[i];
    let newFiber = null;
    let sameType = false;
    if (oldFiber && oldFiber.type)
      sameType = oldFiber && element && element.type == oldFiber.type;
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber2,
        alternate: oldFiber,
        effect: 1 /* UPDATE */
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber2,
        alternate: void 0,
        effect: 0 /* PLACEMENT */
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effect = 2 /* DELETION */;
      deletions.push(oldFiber);
    }
    if (i === 0)
      wipFiber2.child = newFiber || void 0;
    else if (prevSibling)
      prevSibling.sibling = newFiber || void 0;
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
  else if (fiber.type != void 0)
    updateHostComponent(fiber);
  if (fiber.child)
    return fiber.child;
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
  currentRoot = wipRoot;
  wipRoot = null;
}
function commitWork(fiber) {
  let dontRunRelatives = false;
  if (!fiber)
    return;
  let effect = fiber.effect;
  if (effect == 0 /* PLACEMENT */) {
    if (fiber.dom) {
      let domParentFiber = fiber.parent;
      while (!domParentFiber?.dom) {
        domParentFiber = domParentFiber?.parent;
      }
      if (domParentFiber?.dom instanceof HTMLElement) {
        domParentFiber.dom.appendChild(fiber.dom);
      }
    }
  } else if (effect == 1 /* UPDATE */) {
    if (fiber.dom) {
      updateDom(fiber.dom, fiber.alternate?.props, fiber.props);
    }
  } else if (effect == 2 /* DELETION */) {
    if (fiber.dom) {
      let domParentFiber = fiber.parent;
      while (!domParentFiber?.dom) {
        domParentFiber = domParentFiber?.parent;
      }
      if (domParentFiber?.dom instanceof HTMLElement) {
        domParentFiber.dom.removeChild(fiber.dom);
      }
    }
    dontRunRelatives = true;
  }
  runEffectsForFiber(fiber);
  if (dontRunRelatives)
    return;
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
function workLoop(deadline) {
  let shouldYield = false;
  while (!shouldYield && nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
  requestIdleCallback(workLoop);
}
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
    alternate: currentRoot || void 0
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

// src/index.tsx
function Counter() {
  const [count, setCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1e3);
    return () => clearInterval(timer);
  }, []);
  return /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("h1", null, "Counter Demo"), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("p", null, "Count: ", count), /* @__PURE__ */ createElement("button", { onclick: () => setCount(count + 1) }, "Increment"), /* @__PURE__ */ createElement("button", { onclick: () => setCount(count - 1) }, "Decrement")), /* @__PURE__ */ createElement("div", null, /* @__PURE__ */ createElement("p", null, "Timer: ", seconds, "s")));
}
var root = document.getElementById("root");
if (root) {
  render(/* @__PURE__ */ createElement(Counter, null), root);
}
export {
  cleanChilds,
  createDom,
  createElement,
  createTextElement,
  extractEventNameProp,
  isEventListener,
  isProperty,
  render,
  useEffect,
  useState
};
