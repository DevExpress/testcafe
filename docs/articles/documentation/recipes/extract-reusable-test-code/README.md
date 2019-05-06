---
layout: docs
title: Extract Reusable Test Code
permalink: /documentation/recipes/extract-reusable-test-code/
---
# Extract Reusable Test Code

It is a good practice to extract reusable test code to separate files. We recommend that you use a [page model](use-page-model.md) pattern for this. It allows you to abstract out both page structure and test logic.

* [Use Page Model](use-page-model.md)

However, if you need to extract only the helper functions, you can export them from a separate script file.

* [Create Helpers](create-helpers.md)