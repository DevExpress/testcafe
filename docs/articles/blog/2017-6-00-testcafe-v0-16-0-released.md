---
layout: post
title: TestCafe v0.16.0 Released
permalink: /blog/:title.html
---
# TestCafe v0.16.0 Released

TypeScript support, Chrome specific features (headless and device emulation) and numerous bug fixes.

## Enhancements

### ⚙ TypeScript support ([#408](https://github.com/DevExpress/testcafe/issues/408))

### ⚙ Support running in Chrome in headless mode and in device emulation ([#1417](https://github.com/DevExpress/testcafe/issues/1417))

### ⚙ Support HTML5 Drag and Drop ([#897](https://github.com/DevExpress/testcafe/issues/897))

### ⚙ Fixed URL for opening remote browsers ([#1476](https://github.com/DevExpress/testcafe/issues/1476))

### ⚙ No TestCafe UI on screenshots created during testing ([#1357](https://github.com/DevExpress/testcafe/issues/1357))

## Bug Fixes

* 'mouseenter' and 'mouseleave' events are not triggered during cursor moving ([#1426](https://github.com/DevExpress/testcafe/issues/1426))
* Runner's speed option affects the speed of 'doubleClick' action ([#1486](https://github.com/DevExpress/testcafe/issues/1486))
* Press action shortcuts work wrong if input's value ends with '.' or starts with '-.' ([#1499](https://github.com/DevExpress/testcafe/issues/1499))
* Test report has too small line length on travis ([#1469](https://github.com/DevExpress/testcafe/issues/1469))
* Service messages with cookies do not have enough time to come to server before a new page is loaded ([testcafe-hammerhead/#1086](https://github.com/DevExpress/testcafe-hammerhead/issues/1086))
* The window.history.replaceState function is overridden incorrectly ([testcafe-hammerhead/#1146](https://github.com/DevExpress/testcafe-hammerhead/issues/1146))
* Hammerhead crashes if a script file contains a sourcemap comment ([testcafe-hammerhead/#1052](https://github.com/DevExpress/testcafe-hammerhead/issues/1052))
* The proxy should override the 'DOMParser.parseFromString' method ([testcafe-hammerhead/#1133](https://github.com/DevExpress/testcafe-hammerhead/issues/1133))
* The fetch method should emulate the native behaviour on merging headers ([testcafe-hammerhead/#1116](https://github.com/DevExpress/testcafe-hammerhead/issues/1116))
* The EventSource requests are broken when used via proxy ([testcafe-hammerhead/#1106](https://github.com/DevExpress/testcafe-hammerhead/issues/1106))
* The code processing may cause syntax errors in some cases because of wrong 'location' property wrapping ([testcafe-hammerhead/#1101](https://github.com/DevExpress/testcafe-hammerhead/issues/1101))
* When calling the 'fetch' function without parameters, we should return its native result instead of window.Promise.reject ([testcafe-hammerhead/#1099](https://github.com/DevExpress/testcafe-hammerhead/issues/1099))
