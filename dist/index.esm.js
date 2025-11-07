// src/types.js
var SVG_TAGS = /* @__PURE__ */ new Set([
  "svg",
  "path",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "g",
  "text",
  "tspan",
  "defs",
  "clipPath",
  "mask",
  "linearGradient",
  "radialGradient",
  "stop",
  "use",
  "symbol"
]);
var SVG_CAMEL_CASE_ATTRS = /* @__PURE__ */ new Set([
  "viewBox",
  "preserveAspectRatio",
  "gradientTransform",
  "gradientUnits",
  "clipPathUnits",
  "patternUnits",
  "patternContentUnits",
  "baseFrequency",
  "calcMode",
  "clipPath",
  "stdDeviation"
]);

// src/createDom.js
function createElement(type, props, ...children) {
  const flat = [].concat(...children.map((c) => Array.isArray(c) ? c : [c]));
  const childs = cleanChilds(flat);
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
function isInsideSVG(fiber) {
  let parent = fiber.parent;
  while (parent) {
    if (typeof parent.type === "string" && isSVGElement(parent.type)) {
      return true;
    }
    parent = parent.parent;
  }
  return false;
}
function createDom(fiber) {
  const dom = fiber.type == "TEXT_ELEMENT" ? document.createTextNode("") : isSVGElement(asStr(fiber.type)) || isInsideSVG(fiber) ? document.createElementNS("http://www.w3.org/2000/svg", asStr(fiber.type)) : document.createElement(asStr(fiber.type));
  if (fiber.type === "svg") {
    console.log("SVG fiber:", fiber);
    console.log("SVG props:", fiber.props);
    console.log("SVG children:", fiber.props?.children);
  }
  const isProperty2 = (key) => key !== "children";
  Object.keys(fiber.props || {}).filter(isProperty2).forEach((prop) => {
    FWsetAttr(dom, prop, fiber.props[prop]);
  });
  return dom;
}

// src/helper.js
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
function isSVGElement(type) {
  return SVG_TAGS.has(type);
}
var asStr = (x) => {
  return x;
};
function camelToKebab(str) {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

// src/attribute.js
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
    node.classList = "";
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
  if (prop === "children")
    return;
  if (prop == "className") {
    if (!value)
      return;
    let classes = value.split(" ");
    classes.forEach((cls) => cls.trim() != "" ? node.classList.add(cls.trim()) : null);
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
    } else {
      const isSvg = node instanceof SVGElement;
      const attrName = isSvg && !SVG_CAMEL_CASE_ATTRS.has(prop) ? camelToKebab(prop) : prop;
      node.setAttribute(attrName, value);
    }
  }
}

// src/render.js
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
  let state = oldHook ? oldHook.state : initial;
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    if (typeof action === "function")
      state = action(state);
    else
      state = action;
  });
  const hook = {
    type: "state",
    state,
    queue: []
  };
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
function commitDeletion(fiber) {
  if (fiber.dom) {
    let domParentFiber = fiber.parent;
    while (domParentFiber && !domParentFiber.dom) {
      domParentFiber = domParentFiber.parent;
    }
    if (domParentFiber?.dom instanceof HTMLElement || domParentFiber?.dom instanceof SVGElement) {
      domParentFiber.dom.removeChild(fiber.dom);
    }
  } else if (fiber.child) {
    commitDeletion(fiber.child);
  }
}
function updateDom(dom, prevProps, nextProps) {
  if (dom instanceof Text) {
    if (nextProps?.nodeValue !== void 0) {
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
        if (!nextProps || !(prevProp in nextProps) || nextProps[prevProp] != prevProps[prevProp])
          FWremAttr(dom, prevProp, prevProps[prevProp]);
      }
    });
  }
  if (nextProps) {
    Object.keys(nextProps).forEach((nextProp) => {
      if (dom instanceof HTMLElement || dom instanceof SVGElement) {
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
        effect: 1
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber2,
        alternate: void 0,
        effect: 0
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effect = 2;
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
  if (effect == 0) {
    if (fiber.dom) {
      let domParentFiber = fiber.parent;
      while (!domParentFiber?.dom) {
        domParentFiber = domParentFiber?.parent;
      }
      if (domParentFiber?.dom instanceof HTMLElement || domParentFiber?.dom instanceof SVGElement) {
        domParentFiber.dom.appendChild(fiber.dom);
      }
    }
  } else if (effect == 1) {
    if (fiber.dom) {
      updateDom(fiber.dom, fiber.alternate?.props, fiber.props);
    }
  } else if (effect == 2) {
    commitDeletion(fiber);
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

// src/router.js
var FWroutes = [];
function createRouter(routeList) {
  FWroutes = routeList;
}
var navigateCallback = null;
function Router() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  navigateCallback = setCurrentPath;
  useEffect(() => {
    const onPopState = () => {
      if (navigateCallback) {
        navigateCallback(window.location.pathname);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const route = FWroutes.find((r) => r.path === currentPath);
  if (route) {
    return createElement(route.component, {});
  }
  return createElement("div", null, "404 Not Found");
}
function navigate(path) {
  if (window.location.pathname === path) {
    return;
  }
  window.history.pushState({ path, timestamp: Date.now() }, "", path);
  if (navigateCallback) {
    navigateCallback(path);
  }
}
function Link(props) {
  const handleClick = (e) => {
    e.preventDefault();
    navigate(props.to);
  };
  const content = props.children || props.text || props.to;
  let tag;
  if (props.className) {
    tag = createElement("a", { href: props.to, className: props.className, onClick: handleClick }, content);
  } else {
    tag = createElement("a", { href: props.to, onClick: handleClick }, content);
  }
  return tag;
}

// src/store.js
var createStore = (initialData) => {
  let state = initialData;
  const store2 = {
    // for now.
    getState() {
      return state;
    },
    reducer(state2, action) {
    },
    dispatch(action) {
      state = store2.reducer(state, action);
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener) {
      listeners.push(listener);
      return () => {
        const idx = listeners.indexOf(listener);
        listeners.splice(idx, 1);
      };
    }
  };
  const listeners = [];
  return store2;
};
var store = createStore(void 0);
store.getState();
export {
  Link,
  Router,
  asStr,
  camelToKebab,
  cleanChilds,
  createDom,
  createElement,
  createRouter,
  createStore,
  createTextElement,
  extractEventNameProp,
  isEventListener,
  isProperty,
  isSVGElement,
  navigate,
  render,
  useEffect,
  useState
};
