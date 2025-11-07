const enum EffectTag {
  PLACEMENT,
  UPDATE,
  DELETION,
}

const enum AuthTag {
  NONE,
  GUEST,
  LOGGED,
}

type SupportedElement = HTMLElement | SVGElement;

type FWDom = HTMLElement | SVGElement | Text;

interface FWProps {
  children?: Array<FWElement>;
  [key: string]: any;
}

interface FWElement {
  // FW -> frame work (yes, i still got no name for it)
  type: string | Function; // div, span or TEXT_ELEMENT
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
  effect: () => void | (() => void); // fnc that returns void or an other fnc
  deps?: Array<any>;
  cleanup?: () => void; // cleanup fnc to clean effect fnc (free or stop something)
}

interface Fiber {
  // a fiber is a small unit of the tree
  type: string | Function;
  props: FWProps;
  dom: HTMLElement | SVGElement | Text | null;

  // data structure
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;

  alternate?: Fiber; // link to same el from prev render

  effect?: EffectTag;

  hooks?: Array<Hook>;
}

const log = console.log;

const SVG_TAGS = new Set([
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
  "symbol",
]);

const SVG_CAMEL_CASE_ATTRS = new Set([
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
  "stdDeviation",
]);

export {
  EffectTag,
  AuthTag,
  FWElement,
  FWProps,
  Fiber,
  eventCallBack,
  UseStateHook,
  UseEffectHook,
  Hook,
  FWDom,
  log,
  SupportedElement,
  SVG_CAMEL_CASE_ATTRS,
  SVG_TAGS,
};
