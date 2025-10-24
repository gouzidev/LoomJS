import { FWsetAttr } from "./attribute.js";
import { cleanChilds } from "./helper.js";
import { EffectTag, FWElement, FWProps, Fiber, eventCallBack, Hook, log} from './types.js'

function createElement(type: string, props: FWProps | null, ...children: Array<FWElement> | Array <string>) : FWElement
{
    const childs = cleanChilds(children);

    return {
        type, 
        props: {
            ...props,
            children: childs
        }
    }
}

function createTextElement(text: string): FWElement
{
    let el: FWElement;
    el =  {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: []
        }
    }
    return el;
}


function createDom(fiber: Fiber) : HTMLElement | Text
{
    // creating the dom node
    const dom = fiber.type == "TEXT_ELEMENT" 
        ? document.createTextNode("")
        : document.createElement(fiber.type as string)
    
    const isProperty = (key: string) => key !== "children";
    
    // adding the attributes
    Object.keys(fiber.props || {})
    .filter(isProperty)
    .forEach(prop =>
    {
        FWsetAttr(dom as HTMLElement, prop, fiber.props[prop]);
    });

    return dom;
}

export {createDom, createElement, createTextElement}