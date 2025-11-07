import { FWElement } from "./types.js";
declare function isEventListener(str: string): boolean;
declare function isProperty(str: string): boolean;
declare function extractEventNameProp(prop: string): string;
declare function cleanChilds(children: Array<FWElement> | Array<string>): Array<FWElement>;
declare function isSVGElement(type: string): boolean;
declare const asStr: (x: any) => string;
declare function camelToKebab(str: string): string;
export { isEventListener, isProperty, extractEventNameProp, cleanChilds, isSVGElement, asStr, camelToKebab, };
//# sourceMappingURL=helper.d.ts.map