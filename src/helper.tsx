import { createTextElement } from "./createDom.js";
import {
  EffectTag,
  FWElement,
  FWProps,
  Fiber,
  eventCallBack,
  Hook,
  log,
  SVG_TAGS,
} from "./types.js";

function isEventListener(str: string): boolean {
  return str.startsWith("on");
}

function isProperty(str: string): boolean {
  return str != "children" && !isEventListener(str);
}

function extractEventNameProp(prop: string): string {
  return prop.toLocaleLowerCase().substring(2);
}

function cleanChilds(
  children: Array<FWElement> | Array<string>
): Array<FWElement> {
  let childs: Array<FWElement> = children.map((child: FWElement | string) => {
    if (typeof child == "string" || typeof child == "number") {
      return createTextElement(child);
    } else {
      return child;
    }
  });
  return childs;
}

function isSVGElement(type: string): boolean {
  return SVG_TAGS.has(type);
}

const asStr = (x: any): string => {
  return x as string;
};

function camelToKebab(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

export {
  isEventListener,
  isProperty,
  extractEventNameProp,
  cleanChilds,
  isSVGElement,
  asStr,
  camelToKebab,
};
