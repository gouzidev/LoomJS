import { createTextElement } from "./createDom.js";
import { SVG_TAGS, } from "./types.js";
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
        }
        else {
            return child;
        }
    });
    return childs;
}
function isSVGElement(type) {
    return SVG_TAGS.has(type);
}
const asStr = (x) => {
    return x;
};
function camelToKebab(str) {
    return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}
export { isEventListener, isProperty, extractEventNameProp, cleanChilds, isSVGElement, asStr, camelToKebab, };
//# sourceMappingURL=helper.js.map