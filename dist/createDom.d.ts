import { FWElement, FWProps, Fiber } from './types.js';
declare function createElement(type: string, props: FWProps | null, ...children: Array<FWElement> | Array<string>): FWElement;
declare function createTextElement(text: string): FWElement;
declare function createDom(fiber: Fiber): HTMLElement | Text;
export { createDom, createElement, createTextElement };
//# sourceMappingURL=createDom.d.ts.map