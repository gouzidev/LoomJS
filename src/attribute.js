import { SVG_CAMEL_CASE_ATTRS, } from "./types.js";
import { camelToKebab, isEventListener, isProperty } from "./helper.js";
function addEvent(node, prop, value) {
    switch (prop) {
        case "onHover":
            node.addEventListener("mouseover", value);
            break;
        case "onFocus":
            node.addEventListener("focus", value);
            break;
        default:
            const name = prop.toLowerCase().slice(2);
            node.addEventListener(name, value);
    }
}
function removeEvent(node, prop, value) {
    switch (prop) {
        case "onHover":
            node.removeEventListener("mouseover", value);
            break;
        case "onFocus":
            node.removeEventListener("focus", value);
            break;
        default:
            const name = prop.toLowerCase().slice(2);
            node.removeEventListener(name, value);
    }
}
function FWremAttr(node, prop, value) {
    if (prop == "className" && typeof value == "string")
        node.classList = "";
    else if (["checked", "selected", "disabled"].includes(prop)) {
        let inputEl = node;
        switch (prop) {
            case "checked":
                inputEl.checked = false;
                inputEl.removeAttribute("checked");
                break;
            case "selected":
                inputEl.removeAttribute("selected");
                break;
            case "disabled":
                inputEl.disabled = false;
                inputEl.removeAttribute("disabled");
                break;
        }
    }
    // event
    else if (isEventListener(prop)) {
        if (typeof value != "string")
            // not str -> eventCB
            removeEvent(node, prop, value);
    }
    else if (isProperty(prop)) {
        if (prop == "nodeValue") {
            node.nodeValue = null;
        }
        else
            node.removeAttribute(prop);
    }
}
function FWsetAttr(node, prop, value) {
    if (prop === "children")
        return;
    if (prop == "className") {
        if (!value)
            return;
        let classes = value.split(" ");
        classes.forEach((cls) => cls.trim() != "" ? node.classList.add(cls.trim()) : null);
    }
    else if (["checked", "selected", "disabled"].includes(prop)) {
        let inputEl = node;
        switch (prop) {
            case "checked":
                inputEl.checked = value === "true";
                break;
            case "selected":
                inputEl.setAttribute("selected", value);
                break;
            case "disabled":
                inputEl.disabled = Boolean(value);
                break;
        }
    }
    // event
    else if (isEventListener(prop)) {
        addEvent(node, prop, value);
    }
    else {
        if (prop == "nodeValue") {
            node.nodeValue = value;
        }
        else {
            const isSvg = node instanceof SVGElement;
            const attrName = isSvg && !SVG_CAMEL_CASE_ATTRS.has(prop) ? camelToKebab(prop) : prop;
            node.setAttribute(attrName, value);
        }
    }
}
export { FWremAttr, FWsetAttr, addEvent, removeEvent };
//# sourceMappingURL=attribute.js.map