---
layout: docs
title: Framework-Specific Selectors
permalink: /documentation/test-api/selecting-page-elements/framework-specific-selectors/
---
# Framework-Specific Selectors

TestCafe provides a full-featured set of general purpose [selectors](../selectors.md). They are based on CSS selectors or client JS code, which works well with any HTML5 website. However, if you use a front-end framework, you may want your tests to be aware of your framework specifics. For instance, the component tree for React or element bindings for Aurelia.

For this purpose, the TestCafe team and community developed libraries of dedicated selectors for the most popular frameworks. So far, the following selectors are available.

* [React](react-selectors.md)
* [Angular](angular-selectors.md)
* [Vue](vue-selectors.md)
* [Aurelia](aurelia-selectors.md)