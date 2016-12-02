---
layout: docs
title: DOM Node Snapshots
permalink: /documentation/test-api/selecting-page-elements/dom-node-snapshots.html
checked: false
---
# DOM Node Snapshots

A *DOM node snapshot* is an object that represents the state of a particular document node server side.
This node can be a DOM element, document, fragment, text or comment node. DOM node snapshots are returned by [selectors](selectors.md).

This topic lists API members exposed by DOM node snapshots.

> Selectors and promises returned by them also expose this API (except for
snapshot's `getChildElement`, `getChildNode` and `getParentNode` methods).
> See [Snapshot API Shorthands](selectors.md#snapshot-api-shorthands).

## Members Common Across All Nodes

Property | Type | Description
------ | ---- | -----
`childElementCount` | Number | The number of child HTML elements.
`childNodeCount` | Number | The number of child nodes.
`hasChildElements` | Boolean | `true` if this node has child HTML elements.
`hasChildNodes` | Boolean | `true` if this node has child nodes.
`nodeType` | Number | The type of the node. See [Node.nodeType](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType).
`textContent` | String | The text content of the node and its descendants. See [Node.textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent).

Method | Type | Description
------ | ---- | -----
`getChildElement(idx)` | Selector | A selector that returns the snapshot of the child element at index `idx`. See [ParentNode.children](https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children).
`getChildNode(idx)` | Selector | A selector that returns the snapshot of the child node at index `idx`. See [Node.childNodes](https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes).
`getParentNode` | Selector | A selector that returns the parent node snapshot. See [Node.parentNode](https://developer.mozilla.org/en-US/docs/Web/API/Node/parentNode).
`hasClass(className)` | Boolean | `true` if the element has the specified class name.

## Members Specific to Element Nodes

Property | Type | Description
------ | ---- | ----
`attributes` | Object | Attributes of the element as `{ name: value, ... }`. You can also use the `getAttribute` method to access attribute values.
`boundingClientRect` | Object | The size of the element and its position relative to the viewport. Contains the `left`, `right`, `bottom`, `top`, `width` and `height` properties.  You can also use the `getBoundingClientRectProperty` method to access these properties.
`checked` | Boolean | For checkbox and radio input elements, their current state. For other elements, `undefined`.
`classNames` | Array of String | The list of element's classes.
`clientHeight` | Number | The inner height of the element, including padding but not the horizontal scrollbar height, border, or margin. See [Element.clientHeight](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientHeight).
`clientLeft` | Number | The width of the left border of the element. See [Element.clientLeft](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientLeft).
`clientTop` | Number | The width of the top border of the element. See [Element.clientTop](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientTop).
`clientWidth` | Number | The inner width of the element, including padding but not the vertical scrollbar width, border, or margin. See [Element.clientWidth](https://developer.mozilla.org/en-US/docs/Web/API/Element/clientWidth).
`focused` | Boolean | `true` if the element is focused.
`id`   | String | The element's identifier. See [Element.id](https://developer.mozilla.org/en-US/docs/Web/API/Element/id).
`innerText` | String | The element's text content "as rendered". See [The innerText IDL attribute](https://html.spec.whatwg.org/multipage/dom.html#the-innertext-idl-attribute).
`namespaceURI` | String | The namespace URI of the element. If the element does not have a namespace, this property is set to `null`. See [Element.namespaceURI](https://developer.mozilla.org/en-US/docs/Web/API/Element/namespaceURI).
`offsetHeight` | Number | The height of the element including vertical padding and borders. See [HTMLElement.offsetHeight](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight).
`offsetLeft` | Number | The number of pixels that the upper left corner of the element is offset by to the left within the `offsetParent` node. See [HTMLElement.offsetLeft](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetLeft).
`offsetTop` | Number | The number of pixels that the upper left corner of the element is offset by to the top within the `offsetParent` node. See [HTMLElement.offsetTop](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetTop).
`offsetWidth` | Number | The width of the element including vertical padding and borders. See [HTMLElement.offsetWidth](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetWidth).
`scrollHeight` | Number | The height of the element's content, including content not visible on the screen due to overflow. See [Element.scrollHeight](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight).
`scrollLeft` | Number | The number of pixels that the element's content is scrolled to the left. See [Element.scrollLeft](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeft).
`scrollTop` | Number | The number of pixels that the element's content is scrolled upward. See [Element.scrollTop](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop).
`scrollWidth` | Number | Either the width in pixels of the element's content or the width of the element itself, whichever is greater. See [Element.scrollWidth](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollWidth).
`style` | Object | The [computed](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle) values of element's CSS properties as `{ property: value, ... }`. You can also use the `getStyleProperty` method to access CSS properties.
`tagName` | String | The name of the element. See [Element.tagName](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName).
`value` | String | For input elements, the current value in the control. For other elements, `undefined`.
`visible` | Boolean | `true` if the element is visible.

Method | Type | Description
------ | ---- | -----
`getStyleProperty(propertyName)` | Object | Returns the computed value of the CSS `propertyName` property. You can also use the `style` property to access a hash table of CSS properties.
`getAttribute(attributeName)` | String | Returns the value of the `attributeName` attribute. You can also use the `attributes` property to access a hash table of attributes.
`getBoundingClientRectProperty(propertyName)` | Number | Returns the value of the `propertyName` property from the `boundingClientRect` object.