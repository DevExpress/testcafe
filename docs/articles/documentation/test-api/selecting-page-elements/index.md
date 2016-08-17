---
layout: docs
title: Selecting Page Elements
permalink: /documentation/test-api/selecting-page-elements/
---
# Selecting Page Elements

TestCafe runs test code on the server. When you need to refer to a DOM element
to perform an action on it, you normally pass CSS selectors to the appropriate action function.

However, there are many cases when you may need direct access to DOM elements.
For instance, you need to know the state of a certain page element to make an assertion,
or you may find CSS selectors not powerful enough to pick an element on which you need to perform an action.

To address these scenarios, TestCafe provides *selector* functions that are executed on the client side and
whose return value (*DOM node snapshot*) can be used on the server side to identify a DOM node or observe its state.

* [Selectors](selectors.md)
* [Selector Options](selector-options.md)
* [DOM Node Snapshots](dom-node-snapshots.md)