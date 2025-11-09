import { FWsetAttr } from "./attribute.js";
import { asStr, cleanChilds, isSVGElement } from "./helper.js";
function createElement(type, props, ...children) {
    // flatten children one level (JSX usually nests one level).
    // use flat (infinity) only if you expect deeply nested arrays, but flat(1) is enough and safer.
    const flat = [].concat(...children.map((c) => (Array.isArray(c) ? c : [c])));
    const childs = cleanChilds(flat);
    return {
        type,
        props: {
            ...props,
            children: childs,
        },
    };
}
function createTextElement(text) {
    let el;
    el = {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    };
    return el;
}
function isInsideSVG(fiber) {
    let parent = fiber.parent;
    while (parent) {
        if (typeof parent.type === "string" && isSVGElement(parent.type)) {
            return true;
        }
        parent = parent.parent;
    }
    return false;
}
function createDom(fiber) {
    // creating the dom node
    const dom = fiber.type == "TEXT_ELEMENT"
        ? document.createTextNode("")
        : isSVGElement(asStr(fiber.type)) || isInsideSVG(fiber)
            ? document.createElementNS("http://www.w3.org/2000/svg", asStr(fiber.type))
            : document.createElement(asStr(fiber.type));
    const isProperty = (key) => key !== "children";
    // adding the attributes
    Object.keys(fiber.props || {})
        .filter(isProperty)
        .forEach((prop) => {
        FWsetAttr(dom, prop, fiber.props[prop]);
    });
    return dom;
}
export { createDom, createElement, createTextElement };
