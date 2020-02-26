// -------------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// -------------------------------------------------------------

export const NODE_SNAPSHOT_PROPERTIES = [
    'nodeType',
    'textContent',
    'childNodeCount',
    'hasChildNodes',
    'childElementCount',
    'hasChildElements'
];

export const ELEMENT_ACTION_SNAPSHOT_PROPERTIES = [
    'tagName',
    'attributes'
];

export const ELEMENT_SNAPSHOT_PROPERTIES = [
    'tagName',
    'visible',
    'focused',
    'attributes',
    'boundingClientRect',
    'classNames',
    'style',
    'innerText',
    'namespaceURI',
    'id',
    'value',
    'checked',
    'selected',
    'selectedIndex',
    'scrollWidth',
    'scrollHeight',
    'scrollLeft',
    'scrollTop',
    'offsetWidth',
    'offsetHeight',
    'offsetLeft',
    'offsetTop',
    'clientWidth',
    'clientHeight',
    'clientLeft',
    'clientTop'
];

export const SNAPSHOT_PROPERTIES = NODE_SNAPSHOT_PROPERTIES.concat(ELEMENT_SNAPSHOT_PROPERTIES);
