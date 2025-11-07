import { FWsetAttr } from "./attribute.js";
import { cleanChilds } from "./helper.js";
import { EffectTag, FWElement, FWProps, Fiber, eventCallBack, Hook, log} from './types.js'

function createElement(
        type: string | Function,
        props: FWProps | null,
        ...children: Array<FWElement> | Array<string>
        )
    : FWElement
{
    // flatten children one level (JSX usually nests one level).
    // use flat (infinity) only if you expect deeply nested arrays, but flat(1) is enough and safer.
    const flat = ([] as any).concat(...children.map(c => Array.isArray(c) ? c : [c]));
    const childs = cleanChilds(flat);

    return {
        type,
        props: {
            ...props,
            children: childs
        }
    };
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