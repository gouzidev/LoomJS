import { eventCallBack } from "./types.js";
declare function addEvent(node: HTMLElement, prop: string, value: eventCallBack): void;
declare function removeEvent(node: HTMLElement, prop: string, value: eventCallBack): void;
declare function FWremAttr(node: HTMLElement, prop: string, value: eventCallBack | string): void;
declare function FWsetAttr(node: HTMLElement, prop: string, value: string | eventCallBack): void;
export { FWremAttr, FWsetAttr, addEvent, removeEvent };
//# sourceMappingURL=attribute.d.ts.map