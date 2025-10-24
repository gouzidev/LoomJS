import { FWElement } from './types.js';
declare function isEventListener(str: string): boolean;
declare function isProperty(str: string): boolean;
declare function extractEventNameProp(prop: string): string;
declare function cleanChilds(children: Array<FWElement> | Array<string>): Array<FWElement>;
export { isEventListener, isProperty, extractEventNameProp, cleanChilds };
//# sourceMappingURL=helper.d.ts.map