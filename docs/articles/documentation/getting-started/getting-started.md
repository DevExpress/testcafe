---
layout: docs
title: Getting Started
permalink: /documentation/getting-started/
---
# Getting Started

#### 1. Install TestCafe

```sh
npm install -g testcafe
```

#### 2. Create your first test

```js
fixture `My first fixture`

    // Introduces the action to perform prior to each test.
    .beforeEach

        // Opens the tested web page.
        .go('http://testcafe.devexpress.com/example/');

test `Good to go`

    // Types 'Peter Parker' into the input
    // selected by the '#Developer_Name' CSS selector.
    .type('#Developer_Name', 'Peter Parker')

    // Clicks the Submit button (again,
    // uses the CSS selector to locate it).
    .click('#submit-button')

    // Checks that the element whose class
    // is 'article-header' contains 'Peter Parker'.
    .expect.element('.article-header').contains('Peter Parker');
```

Save this code to a file at `/tests/myFirstFixture.js`.

#### 3. Run the test

You can run it through the command line...

```sh
testcafe chrome,firefox '/tests/myFirstFixture.js'
```

...or by using the JavaScript API.

```js
var createTestCafe = require('testcafe');

// Creates a TestCafe server on 'localhost:1337'.
// Reserves the 1338 port to be used for internal needs.
var testCafe = await createTestCafe('localhost', 1337, 1338);

await testCafe

    // Creates the test runner...
    .createRunner()

    // ...specifies the path to the module with our test...
    .src('/tests/myFirstFixture.js')

    // ...specifies the browsers against which to test...
    .browsers(['chrome', 'firefox'])

    // ...and finally pulls the trigger.
    .run();
```