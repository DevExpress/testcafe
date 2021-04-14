---
layout: docs
redirect_to: https://testcafe.io/documentation/403067/reference/test-api/testcontroller/scrollintoview
title: t.scrollIntoView Method
permalink: /documentation/reference/test-api/testcontroller/scrollintoview.html
---
# t.scrollIntoView Method

{% include actions/manual-scroll-warning.md %}

Scrolls parent containers of the `target` element until the element is in the viewport. Can be chained with other `TestController` methods.

```text
t.scrollIntoView(target [, options]) → this | Promise<any>
```

Parameter   | Type                                              | Description
----------- | ------------------------------------------------- | --------------------
`target`&#160; | Function &#124; String &#124; Selector &#124; Snapshot &#124; Promise | Identifies the webpage element to scroll to. See [Select Target Elements](#select-target-elements).
`options`&#160;*(optional)* | Object | A set of options with additional parameters for the action. See [Options](#options).

The following example shows how to use the `t.scrollIntoView` action to scroll the webpage until the element is in the viewport:

{% include actions/scrollintoview-example.md %}

## Select Target Elements

{% include actions/selector-parameter.md %}

## Options

{% include actions/offset-options.md %}
