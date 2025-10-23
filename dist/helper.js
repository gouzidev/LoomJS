import { createTextElement } from "./createDom.js";
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
export { isEventListener, isProperty, extractEventNameProp, cleanChilds };
//# sourceMappingURL=helper.js.map