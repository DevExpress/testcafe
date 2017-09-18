---
layout: docs
title: Finding Code Issues with Flow Type Checker
permalink: /documentation/recipes/finding-code-issues-with-flow-type-checker.html
---
# Finding Code Issues with Flow Type Checker

[Flow](https://flow.org/en/) is a static type checker for JavaScript. It can help you identify problems in your code
by infering variable types or analyzing [static type annotations](https://flow.org/en/docs/types/). For more information, see the [Flow documentation](https://flow.org/en/docs/).

This recipe describes how to check TestCafe test code with Flow.

## Step 1 - Install Flow

To use Flow with TestCafe, you will need two packages.

The first one is the Flow binary responsible for checking your code. Install it locally to the project.

```sh
npm install --save-dev flow-bin
```

With this module, you can introduce type annotations in your code (or let Flow infer the types implicitly) and run code checks.

However, this only works for your test code. Flow will still treat TestCafe API as untyped and imply that all API members has the type `any`.

To provide type information for third-party libraries (including TestCafe), Flow uses a special module - [flow-typed](https://github.com/flowtype/flow-typed). Install it globally.

```sh
npm install -g flow-typed
```

## Step 2 - Initialize Flow

First, open `package.json` and configure `npm` to run Flow.

```json
"scripts": {
    "flow": "flow"
}
```

Run the following command to initialize Flow with default configuration.

```sh
npm run flow init
```

Install the TestCafe [library definition](https://flow.org/en/docs/libdefs/) to provide type information for TestCafe API.

```sh
flow-typed install testcafe@0.x.x
```

## Step 3 - Prepare Your Test Files

At the beginning of each test file that you wish to check with Flow, place the following comment.

```js
//@flow
```

You can optionally provide [type annotations](https://flow.org/en/docs/types/) for variables in test code.

```js
//@flow

fixture `My Fixture`
    .page `https://example.com`;

test('My Test', async t => {
    function foo(bar: number): string {
        // ...
    };

    var n: number;

    // ...

    n = "foo"; // <- error
});
```

Now when you perform an operation that violates the type annotations, Flow will raise an error.

## Step 4 - Check Test Code

To run the check, simply call Flow with no parameters.

```sh
npm run flow
```