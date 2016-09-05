---
layout: docs
title: DOM Node Snapshots
permalink: /documentation/test-api/selecting-page-elements/dom-node-snapshots.html
checked: true
---
# DOM Node Snapshots

A *DOM node snapshot* is an object that represents the state of a particular document node server side.
This node can be a DOM element, document, fragment, text or comment node. DOM node snapshots are returned by [selectors](selectors.md).

This topic lists members exposed by DOM node snapshots.

## Members Common Across All Nodes

Property | Type | Description
------ | ---- | -----
`nodeType` | Number | The type of the node. See [Node.nodeType](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType).
`textContent` | String | The text content of the node and its descendants. See [Node.textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent).
`childNodeCount` | Number | The number of child nodes.
`hasChildNodes` | Boolean | `true` if this node has child nodes.
`childElementCount` | Number | The number of child HTML elements.
`hasChildElements` | Boolean | `true` if this node has child HTML elements.

Method | Type | Description
------ | ---- | -----
`getParentNode` | Selector | A selector that returns the parent node snapshot. See [Node.parentNode](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentNode).
`getChildNode(idx)` | Selector | A selector that returns the snapshot of the child node at index `idx`. See [Node.childNodes](https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes).
`getChildElement(idx)` | Selector | A selector that returns the snapshot of the child element at index `idx`. See [ParentNode.children](https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children).

## Members Specific to Element Nodes

Property | Type | Description
------ | ---- | ----
`tagName` | String | The name of the element. See [Element.tagName](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName).
`visible` | Boolean | `true` if the element is visible.
`focused` | Boolean | `true` if the element is focused.
`attributes` | Object | Attributes of the element as `{ name: value, ... }`.
`boundingClientRect` | Object | The size of the element and its position relative to the viewport. Contains the `left`, `right`, `bottom`, `top`, `width` and `height` properties.
`classNames` | Array of String | The list of element's classes.
`style` | Object | The [computed](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle) values of element's CSS properties as `{ property: value, ... }`.
`displayText` | String | The element's text content that is actually displayed in the browser. Compared to `textContent`, excludes non-visual nodes and nodes that aren't currently visible.
`namespaceURI` | String | The namespace URI of the element. If the element does not have a namespace, this property is set to `null`. See [Element.namespaceURI](https://developer.mozilla.org/en-US/docs/Web/API/Element/namespaceURI).
`id`   | String | The element's identifier. See [Element.id](https://developer.mozilla.org/en-US/docs/Web/API/Element/id).
`value` | String | For input elements, the current value in the control. For other elements, `undefined`.
`checked` | Boolean | For checkbox and radio input elements, their current state. For other elements, `undefined`.
`scrollWidth` | Number | Either the width in pixels of the element's content or the width of the element itself, whichever is greater. See [Element.scrollWidth](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollWidth).
`scrollHeight` | Number | The height of the element's content, including content not visible on the screen due to overflow. See [Element.scrollHeight](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight).
`scrollLeft` | Number | The number of pixels that the element's content is scrolled to the left. See [Element.scrollLeft](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft).
`scrollTop` | Number | The number of pixels that the element's content is scrolled upward. See [Element.scrollTop](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop).
`offsetWidth` | Number | The width of the element including vertical padding and borders. See [HTMLElement.offsetWidth](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth).
`offsetHeight` | Number | The height of the element including vertical padding and borders. See [HTMLElement.offsetHeight](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight).
`offsetLeft` | Number | The number of pixels that the upper left corner of the element is offset by to the left within the `offsetParent` node. See [HTMLElement.offsetLeft](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft).
`offsetTop` | Number | The number of pixels that the upper left corner of the element is offset by to the top within the `offsetParent` node. See [HTMLElement.offsetTop](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop).
`clientWidth` | Number | The inner width of the element, including padding but not the vertical scrollbar width, border, or margin. See [Element.clientWidth](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth).
`clientHeight` | Number | The inner height of the element, including padding but not the horizontal scrollbar height, border, or margin. See [Element.clientHeight](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight).
`clientLeft` | Number | The width of the left border of the element. See [Element.clientLeft](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientLeft).
`clientTop` | Number | The width of the top border of the element. See [Element.clientTop](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop).