---
layout: docs
title: Browser Aliases
permalink: /documentation/using-testcafe/common-concepts/browser-aliases/
---
# Browser Aliases

Browser aliases are short names used to identify popular browsers when working with TestCafe.
They allow you to avoid dealing with paths to browser executables or other awkward ways to refer to a browser.

The following table lists all available browser aliases.

Browser           | Alias
----------------- | ----------
Chromium          | `chromium`
Google Chrome     | `chrome`
Internet Explorer | `ie`
Microsoft Edge    | `edge`
Mozilla Firefox   | `ff`
Opera             | `opera`
Safari            | `safari`

You can use these aliases when working both through the [command line](/testcafe/documentation/using-testcafe/command-line-interface/#local-browsers)
and [programmatically](/testcafe/documentation/using-testcafe/programming-interface/Runner/#browsers).

To obtain the list of browsers installed on the current machine, run TestCafe
from the command line with the [-b option](/testcafe/documentation/using-testcafe/command-line-interface/#b-list-browsers).