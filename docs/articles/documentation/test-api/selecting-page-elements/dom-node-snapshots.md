---
layout: docs
title: DOM Node Snapshots
permalink: /documentation/test-api/selecting-page-elements/dom-node-snapshots.html
---
# DOM Node Snapshots

*DOM node snapshots* are objects that represent the state of a particular document node on the server side.

You can obtain a snapshot from the client by calling a [selector](selectors.md).

Selectors can return snapshots for DOM elements as well as document, fragment, text and comment nodes.

This topic lists members exposed by DOM node snapshots.

## Members Common across All Nodes

Property | Type | Description
------ | ---- | -----
`nodeType` | Number | The type of the node. See [Node.nodeType](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType).
`textContent` | String | The text content of a node and its descendants. See [Node.textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent).
`childNodeCount` | Number | The number of child nodes.
`hasChildNodes` | Boolean | `true` if this node has child nodes.
`childElementCount` | Number | The number of child HTML elements.
`hasChildElements` | Boolean | `true` if this node has child HTML elements.

Method | Type | Description
------ | ---- | -----
`getParentNode` | Selector function | A selector that returns the parent node snapshot. See [Node.parentNode](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentNode).
`getChildNode(idx)` | Selector function | A selector that returns the snapshot of the child node at index `idx`. See [Node.childNodes](https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes).
`getChildElement(idx)` | Selector function | A selector that returns the snapshot of the child element at index `idx`. See [ParentNode.children](https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children).

## Members Specific to Element Nodes

Member | Type | Description
------ | ---- | ----
`tagName` | String | The name of the element. See [Element.tagName](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName).
`visible` | Boolean | `true` if the element is visible.
`focused` | Boolean | `true` if the element is focused.
`attributes` | Object | Attributes of the element as `{ name: value, ... }`.
`boundingClientRect` | Object | The size of an element and its position relative to the viewport. Contains `left`, `right`, `bottom`, `top`, `width` and `height` properties.
`classNames` | Array of String | The list of classes of the element.
`style` | Object | The [computed](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle) values of CSS properties for the element as `{ property: value, ... }`.
`displayText` | String | Element's text content that is actually displayed in the browser. Compared to `textContent`, excludes non-visual nodes and nodes that aren't visible.
`namespaceURI` | String | The namespace URI of the element, or `null` if the element is not in a namespace. See [Element.namespaceURI](https://developer.mozilla.org/en-US/docs/Web/API/Element/namespaceURI).
`id`   | String | The element's identifier. See [Element.id](https://developer.mozilla.org/en-US/docs/Web/API/Element/id).
`value` | String | For input elements, the current value in the control. For other elements, `undefined`.
`checked` | Boolean | For checkbox and radio input elements, their current state. For other elements, `undefined`.
`scrollWidth` | Number | Either the width in pixels of the content of an element or the width of the element itself, whichever is greater. See [Element.scrollWidth](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollWidth).
`scrollHeight` | Number | The height of an element's content, including content not visible on the screen due to overflow. See [Element.scrollHeight](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight).
`scrollLeft` | Number | The number of pixels that an element's content is scrolled to the left. See [Element.scrollLeft](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft).
`scrollTop` | Number | The number of pixels that the content of an element is scrolled upward. See [Element.scrollTop](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop).
`offsetWidth` | Number | The width of the element including vertical padding and borders. See [HTMLElement.offsetWidth](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth).
`offsetHeight` | Number | The height of the element including vertical padding and borders. See [HTMLElement.offsetHeight](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight).
`offsetLeft` | Number | The number of pixels that the upper left corner of the current element is offset to the left within the `offsetParent` node. See [HTMLElement.offsetLeft](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft).
`offsetTop` | Number | The number of pixels that the upper left corner of the current element is offset to the top within the `offsetParent` node. See [HTMLElement.offsetTop](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop).
`clientWidth` | Number | The inner width of an element, including padding but not the vertical scrollbar width, border, or margin. See [Element.clientWidth](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth).
`clientHeight` | Number | The inner height of an element, including padding but not the horizontal scrollbar height, border, or margin. See [Element.clientHeight](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight).
`clientLeft` | Number | The width of the left border of an element. See [Element.clientLeft](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientLeft).
`clientTop` | Number | The width of the top border of an element. See [Element.clientTop](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop).