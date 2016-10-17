---
layout: post
title: Introducing TestCafe Testing Framework
permalink: /blog/:title.html
---
# Introducing TestCafe – Open Source Testing Framework

We are happy to announce that DevExpress has released the core library of TestCafe – our automated in-browser
testing tool – as an open-source framework for node.js. Now everyone in the open-source community can benefit
from the technologies we developed for the commercial version.

<!--more-->

## The Problem

If you are a front-end web developer who uses node.js tools
then you know how difficult it is to set up automated in-browser testing for your web app.

To begin with, even installing a testing framework can be challenging.
Most existing frameworks require Selenium, which brings JDK and browser plugins with it.

![Will It Work comic by xkcd](http://imgs.xkcd.com/comics/will_it_work.png)  
(Credit to xkcd: [http://xkcd.com/1742/](http://xkcd.com/1742/))

Before you can launch your first test, you also need to set up a test harness,
which means dealing with configuration files. Then you'll discover that some parts of the
harness – such as reporting – might be missing and you need to install them separately.
The likelihood to get functional testing in your web app will go down.

## The Solution

The TestCafe framework simply allows you to skip the hassles mentioned above:

* Pure node.js - TestCafe doesn't use Selenium and doesn't need plugins
  to run tests in real browsers. It's built on top of node.js so it integrates
  and works great with modern development tools
* No additional setup or configuration - TestCafe is all set to run
  tests right after `npm install`
* Complete test harness - With a single launch command, TestCafe
  starts the browsers, runs tests, gathers the results and generates the reports

Learn more about TestCafe – take a look at the [feature list](https://devexpress.github.io/testcafe/#features)
and the [getting started](https://devexpress.github.io/testcafe/documentation/getting-started/) section.
If you want to hack with us, visit our [GitHub page](https://github.com/DevExpress/testcafe).

Try TestCafe now and tell us what you think on our [discussion board](https://testcafe-discuss.devexpress.com/).
