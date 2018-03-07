---
layout: docs
title: Examples of Using Client Functions
permalink: /documentation/test-api/obtaining-data-from-the-client/examples-of-using-client-functions.html
---
# Examples of Using Client Functions

This topic contains some cases of using client functions in tests.

* [Checking a Page URL](#checking-a-page-url)
* [Obtaining a Browser Alias Within a Test](#obtaining-a-browser-alias-within-a-test)
* [Injecting External Libraries into a Page from a Test](#injecting-external-libraries-into-a-page-from-a-test)
* [Accessing Child Nodes in the DOM Hierarchy](#accessing-child-nodes-in-the-dom-hierarchy)
* [Complex DOM Queries](#complex-dom-queries)

## Checking a Page URL

It is a typical situation when performing some actions on a tested web page (clicking buttons or links) redirects a browser to another page and you need to check whether a desired page is currently opened. For example, you test a login form of your web application and need to verify if a particular web page is opened after a user has logged in.

To return the URL of a page that is currently opened on the client, you can create a client function and use the [window.location.href](https://www.w3schools.com/jsref/prop_loc_href.asp) property within it. Then you can verify if the actual page URL matches the expected one by using an [assertion](../assertions/README.md). The sample below demonstrates how to do this.

```js
import { ClientFunction } from 'testcafe';

fixture `My Fixture`
    .page `http://devexpress.github.io/testcafe/example`;

//Returns the URL of the current web page
const getPageUrl = ClientFunction(() => window.location.href);

test('Check the page URL', async t => {
    await t
        .typeText('#developer-name', 'John Smith')
        .click('#submit-button') //Redirects to the 'Thank you' page
        .expect(getPageUrl()).contains('thank-you'); //Checks if the current page URL contains the 'thank-you' string
});
```

### Obtaining a Browser Alias Within a Test

Sometimes you may need to determine a browser alias from within a test. For example, suppose that you configure test tasks by using the [testCafe.createRunner](../../using-testcafe/programming-interface/testcafe.md#createrunner) function and specify several browsers where a test should be run: `runner.browsers(['safari','chrome'])`. Also suppose that the test logic should be different for different browsers. To implement this, you need to detect which test instance corresponds to `safari` and which one corresponds to `chrome`.

To obtain a browser alias, create a client function that uses the [navigator.userAgent](https://www.w3schools.com/jsref/prop_nav_useragent.asp) property. The function will return a user-agent header sent by the browser. To parse the returned header, you can use external modules, for example, [ua-parser-js](https://github.com/faisalman/ua-parser-js).

The following sample demonstrates how to create conditional test logic based on the used browser. Before running this test, install *ua-parser-js* by running `npm install ua-parser-js`.

```js
import { ClientFunction } from 'testcafe';
import uaParser from 'ua-parser-js';

fixture `My fixture`
   .page `http://example.com`;

//Returns a user-agent header sent by the browser
const getUA = ClientFunction(() => navigator.userAgent);

test('My Test', async t => {
    const ua = await getUA();
    const browserAlias =uaParser(ua).browser.name;

    //Some common actions

    //Conditional logic
    if (browserAlias === 'Chrome'){
        //Test logic for Chrome
        console.log('The browser is Chrome');
    }
    else if (browserAlias === 'Safari'){
        //Test logic for Safari
        console.log('The browser is Safari');
    }
});
```

## Injecting External Libraries into a Page from a Test

One more case of using client functions is injecting external libraries like [jQuery](https://jquery.com/) into a tested page.

In order to work with jQuery from a test, you first need to add jQuery code to the tested page by using the `eval` method.

```js
await t.eval(new Function(fs.readFileSync('./jquery.js').toString()));
```

After that,  you can use jQuery in the test within a client function.

```js
import { ClientFunction } from 'testcafe';
import fs from 'fs';

fixture `My fixture`
   .page `http://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    // Adds jQuery code to the page
    await t.eval(new Function(fs.readFileSync('./jquery.js').toString()));

    const clientFunction = ClientFunction(() => {
        // Uses the jQuery selector
        return $('div.column.col-2').text();
    });

    const text = await clientFunction();
    console.log(text);
});
```

## Accessing Child Nodes in the DOM Hierarchy

To find all child elements (not [nodes](https://developer.mozilla.org/en-US/docs/Web/API/Node)) of nodes in a DOM hierarchy, TestCafe provides the [Selector.child](../selecting-page-elements/selectors/functional-style-selectors.md#child) method. However, you may need to access child nodes of some node. You can do this by using a client function.

Suppose that you test the *example.html* page with the following HTML code.

```js
<!DOCTYPE html>
<html>
    <body id="testedpage">
        This is my tested page. <!--This is the first child node of <body>-->
        <p>My first paragraph.</p>
        <p>My second paragraph.</p>
    </body>
</html>
```

Also suppose that you need to obtain the text *This is my tested page*. This text is considered as a child node, not a child element of the body element. So, you can’t access this text by using `Selector.child`, but can obtain the [childNodes](https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes) property from the client side.

```js
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';

fixture `My Fixture`
    .page `examplepage.html`;

    const getChildNodeText = ClientFunction(index => {
        return getEl().childNodes[index].textContent;
    },{ dependencies: { getEl: Selector('#testedpage') } });


test('My Test', async t => {
    console.log(await getChildNodeText(0));
});
```

## Complex DOM Queries

Client functions can be helpful for complex DOM queries. For example, a tested page contains a table with some data and you need to validate data from particular two columns only. To do this, you can obtain data from these columns, push them to an array and then compare the returned array with the expected one.

Below is a sample test for the [https://js.devexpress.com/](https://js.devexpress.com/) page that contains a grid. The sample demonstrates how to create a client function that returns an array containing data from the grid’s **Customer** and **Sale Amount** columns.

```js
import { ClientFunction} from 'testcafe';

fixture `Get sale amount`
    .page('https://js.devexpress.com/');

    const getSaleAmount = ClientFunction(() => {
        const elements = document.querySelector('.dx-datagrid-rowsview').querySelectorAll('td:nth-child(3),td:nth-child(7)');
        const array = [];

        for (let i = 0; i <= elements.length - 2; i+=2) {
            const customerName  = elements[i+1].textContent;
            const saleAmount = elements[i].textContent;

            if (customerName && saleAmount)
                array.push(`Customer ${customerName}: ${saleAmount}`);
        }

        return array;
    });

test('Test1', async t => {
    console.log(await getSaleAmount());
});
```