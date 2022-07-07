import * as domUtils from '../dom';
import * as styleUtils from '../style';


const isVisibilityHiddenNode = function (node: Node): boolean {
    return !!domUtils.findParent(node, true, (ancestor: Node) =>
        domUtils.isElementNode(ancestor) && styleUtils.get(ancestor, 'visibility') === 'hidden');
};

const isHiddenNode = function (node: Node): boolean {
    return !!domUtils.findParent(node, true, (ancestor: Node) =>
        domUtils.isElementNode(ancestor) && styleUtils.get(ancestor, 'display') === 'none');
};

export function isNotVisibleNode (node: Node): boolean {
    return !domUtils.isRenderedNode(node) || isHiddenNode(node) || isVisibilityHiddenNode(node);
}

export function hasDimensions (el: HTMLElement): boolean {
    //NOTE: it's like jquery ':visible' selector (http://blog.jquery.com/2009/02/20/jquery-1-3-2-released/)
    return el && !(el.offsetHeight <= 0 && el.offsetWidth <= 0);
}

export function isFixedElement (node: Node): boolean {
    return domUtils.isElementNode(node) && styleUtils.get(node, 'position') === 'fixed';
}
