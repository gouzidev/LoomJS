import { EffectTag, FWElement, FWProps, Fiber, eventCallBack, Hook, log} from './types.js'

import { isEventListener, isProperty } from "./helper.js";

function addEvent(node: HTMLElement, prop: string , value: eventCallBack)
{
    switch (prop)
    {
        case "onHover":
            node.addEventListener('mouseover', value as eventCallBack)
            break;
        case "onFocus":
            node.addEventListener('focus', value as eventCallBack)
            break;
        default:
            const name = prop.toLowerCase().slice(2);
            node.addEventListener(name, value as eventCallBack)
    }
}

function removeEvent(node: HTMLElement, prop: string, value: eventCallBack)
{
    switch (prop)
    {
        case "onHover":
            node.removeEventListener('mouseover', value as eventCallBack)
            break;
        case "onFocus":
            node.removeEventListener('focus', value as eventCallBack)
            break;
        default:
            const name = prop.toLowerCase().slice(2);
            node.removeEventListener(name, value as eventCallBack)
    }
}

function FWremAttr(node: HTMLElement, prop: string, value : eventCallBack | string) : void
{
    if (prop == "className" && typeof value == 'string')
        node.className = ""
    else if (["checked", "selected", "disabled"].includes(prop))
    {
        let inputEl = node as HTMLInputElement;
        switch (prop)
        {
            case "checked":
                inputEl.checked = false
                inputEl.removeAttribute('checked')
                break;
            case "selected":
                inputEl.removeAttribute('selected');
                break;
            case "disabled":
                inputEl.disabled = false
                inputEl.removeAttribute('disabled');
                break;
        }
    }
    // event
    else if (isEventListener(prop))
    {
        if (typeof value != 'string') // not str -> eventCB
            removeEvent(node, prop, value);
    }
    else if (isProperty(prop))
    {
        if (prop == "nodeValue")
        {
            node.nodeValue = null;
        }
        else
            node.removeAttribute(prop)
    } 
}

function FWsetAttr(node: HTMLElement, prop: string, value: string | eventCallBack): void
{
    if (prop === "children") return;

    if (prop == "className")
    {
        node.classList.add(value as string)
    }
    else if (["checked", "selected", "disabled"].includes(prop))
    {
        let inputEl = node as HTMLInputElement;
        switch (prop)
        {
            case "checked":
                inputEl.checked = value === "true";
                break;
            case "selected":
                inputEl.setAttribute("selected", value as string);
                break;
            case "disabled":
                inputEl.disabled = Boolean(value);
                break;
        }
    }
    // event
    else if (isEventListener(prop))
    {
        addEvent(node, prop, value as eventCallBack)
    }
    else
    {
        if (prop == "nodeValue")
        {
            node.nodeValue = value as string
        }
        else
            node.setAttribute(prop, value as string)
    }
}

export {FWremAttr, FWsetAttr, addEvent, removeEvent} 