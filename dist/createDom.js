import { FWsetAttr } from "./attribute.js";
import { cleanChilds } from "./helper.js";
function createElement(type, props, ...children) {
    const childs = cleanChilds(children);
    return {
        type,
        props: Object.assign(Object.assign({}, props), { children: childs })
    };
}
function createTextElement(text) {
    let el;
    el = {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: []
        }
    };
    return el;
}
function createDom(fiber) {
    // creating the dom node
    const dom = fiber.type == "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(fiber.type);
    const isProperty = (key) => key !== "children";
    // adding the attributes
    Object.keys(fiber.props || {})
        .filter(isProperty)
        .forEach(prop => {
        FWsetAttr(dom, prop, fiber.props[prop]);
    });
    return dom;
}
export { createDom, createElement, createTextElement };
//# sourceMappingURL=createDom.js.map