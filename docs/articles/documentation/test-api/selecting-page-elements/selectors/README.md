---
layout: docs
title: Selectors
permalink: /documentation/test-api/selecting-page-elements/selectors/
checked: false
---
# Selectors

A selector is a function that identifies a webpage element in the test.
The selector API provides methods and properties to select elements on the page and get their state.
You can use selectors to [inspect elements state on the page](using-selectors.md#obtain-element-state), define [action targets](using-selectors.md#define-action-targets) and
[assertion actual values](using-selectors.md#define-assertion-actual-value).

> Important! Do not modify the tested webpage within selectors.
> To interact with the page, use [test actions](../../actions/README.md).

This section contains the following documents.

* [Creating Selectors](creating-selectors.md)
* [Functional-Style Selectors](functional-style-selectors.md)
* [Using Selectors](using-selectors.md)
* [Selector Options](selector-options.md)
* [Extending Selectors](extending-selectors.md)
* [Edge Cases and Limitations](edge-cases-and-limitations.md)