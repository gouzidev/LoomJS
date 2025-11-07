import { eventCallBack, SupportedElement } from "./types.js";
declare function addEvent(node: SupportedElement, prop: string, value: eventCallBack): void;
declare function removeEvent(node: SupportedElement, prop: string, value: eventCallBack): void;
declare function FWremAttr(node: SupportedElement, prop: string, value: eventCallBack | string): void;
declare function FWsetAttr(node: SupportedElement, prop: string, value: string | eventCallBack): void;
export { FWremAttr, FWsetAttr, addEvent, removeEvent };
