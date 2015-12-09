---
layout: docs
title: Getting Started
permalink: /documentation/getting-started/
---

1) Install TestCafe

```sh
$ npm install -g testcafe
```

2) Create my first test

```js
fixture `My first fixture`									
	.beforeEach												// Introduces the action to perform prior to each test.
		.go('http://testcafe.devexpress.com/example/');		// Opens the tested web page.
		
test `Good to go`														
	.type('#Developer_Name', 'Peter Parker')							// Types 'Peter Parker' into the input selected by the '#Developer_Name' CSS selector.
	.click('#submit-button')											// Clicks the Submit button (again, uses the CSS selector to locate it).
	.expect.element('.article-header').contains('Peter Parker');		// Asserts that the element whose class is 'article-header' contains 'Peter Parker'.
```

Save this file to '/test/directory/myFirstFixture.js'.

3) Run the test

Through the command line.

```sh
$ testcafe chrome,firefox '/test/directory/myFirstFixture.js'
```

Or by using the javascript API

```js
var TestCafe = require('TestCafe');							
var testCafe = new TestCafe('localhost', 8080, 8181);		// Creates a TestCafe server on 'localhost:8080'. 
															// Additionally, allows the 8181 port to be used internally (specifically, for cross-domain emulation).
testCafe.createRunner()										// Creates the test runner...
	.src('/test/directory/myFirstFixture.js')				// ...specifies the path to the module with our test...
	.browsers(['chrome', 'firefox'])						// ...specifies the browsers against which to test...
	.run();													// ...and finally pulls the trigger.
```