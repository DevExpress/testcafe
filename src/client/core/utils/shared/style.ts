import adapter from './adapter/index';


const isVisibilityHiddenNode = function (node: Node): boolean {
    return !!adapter.dom.findParent(node, true, (ancestor: Node) =>
        adapter.dom.isElementNode(ancestor) && adapter.style.get(ancestor, 'visibility') === 'hidden');
};

const isHiddenNode = function (node: Node): boolean {
    return !!adapter.dom.findParent(node, true, (ancestor: Node) =>
        adapter.dom.isElementNode(ancestor) && adapter.style.get(ancestor, 'display') === 'none');
};

export function isNotVisibleNode (node: Node): boolean {
    return !adapter.dom.isRenderedNode(node) || isHiddenNode(node) || isVisibilityHiddenNode(node);
}

export function hasDimensions (el: HTMLElement): boolean {
    //NOTE: it's like jquery ':visible' selector (http://blog.jquery.com/2009/02/20/jquery-1-3-2-released/)
    return el && !(el.offsetHeight <= 0 && el.offsetWidth <= 0);
}
