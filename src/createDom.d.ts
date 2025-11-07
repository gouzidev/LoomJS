import { FWElement, FWProps, Fiber, SupportedElement } from "./types.js";
declare function createElement(type: string | Function, props: FWProps | null, ...children: Array<FWElement> | Array<string>): FWElement;
declare function createTextElement(text: string): FWElement;
declare function createDom(fiber: Fiber): SupportedElement | Text;
export { createDom, createElement, createTextElement };
