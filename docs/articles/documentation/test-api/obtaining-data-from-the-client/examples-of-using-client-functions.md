---
layout: docs
title: Examples of Using Client Functions
permalink: /documentation/test-api/obtaining-data-from-the-client/examples-of-using-client-functions.html
---
# Examples of Using Client Functions

This topic describes examples of using client functions in tests.

* [Checking a Page URL](#checking-a-page-url)
* [Obtaining a Browser Alias Within a Test](#obtaining-a-browser-alias-within-a-test)
* [Injecting External Libraries into a Page from a Test](#injecting-external-libraries-into-a-page-from-a-test)
* [Accessing Child Nodes in the DOM Hierarchy](#accessing-child-nodes-in-the-dom-hierarchy)
* [Complex DOM Queries](#complex-dom-queries)

## Checking a Page URL

When performing certain actions on a tested web page (clicking buttons or links), it can redirect a browser to another page and you need to check if the desired page is open. For example, you are testing your web application's login form and need to verify if a particular web page opens after a user logs in.

You can create a client function and use the [window.location.href](https://www.w3schools.com/jsref/prop_loc_href.asp) property within it to return the URL of a page that is open on the client and then verify if the actual page URL matches the expected one using an [assertion](../assertions/README.md). The sample below demonstrates how to do this.

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

## Obtaining a Browser Alias Within a Test

Sometimes you may need to determine a browser's alias from within a test. For example, you configured a test tasks using the [testCafe.createRunner](../../using-testcafe/programming-interface/testcafe.md#createrunner) function and specified several browsers where the test should run: `runner.browsers(['safari','chrome'])`. However, the test logic should be different for different browsers. To do this, you need to detect which test instance corresponds to `safari` and which one corresponds to `chrome`.

To obtain a browser's alias, create a client function that uses the [navigator.userAgent](https://www.w3schools.com/jsref/prop_nav_useragent.asp) property. This function returns the browser's user-agent header, and you can use external modules (for example, [ua-parser-js](https://github.com/faisalman/ua-parser-js)) to parse this header.

The following sample demonstrates how to create a conditional test logic based on the browser. Before running this test, install *ua-parser-js* by running `npm install ua-parser-js`.

```js
import { ClientFunction } from 'testcafe';
import uaParser from 'ua-parser-js';

fixture `My fixture`
    .page `http://example.com`;

//Returns a user-agent header sent by the browser
const getUA = ClientFunction(() => navigator.userAgent);

test('My test', async t => {
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

Another example is using client functions to inject external libraries like [jQuery](https://jquery.com/) into a tested page.

To work with jQuery from a test, you first need to place the jQuery library file in the test directory. After that, add the library's code to the tested page using the `eval` method and use jQuery in the test within a client function. The following sample demonstrates this.

```js
import { ClientFunction } from 'testcafe';
import fs from 'fs';

fixture `My fixture`
    .page `http://devexpress.github.io/testcafe/example/`;

test('My test', async t => {
    // Adds jQuery code to the page
    await t.eval(new Function(fs.readFileSync('./jquery.js').toString()));

    const getElementText = ClientFunction(() => {
        // Uses the jQuery selector
        return $('div.column.col-2').find('legend').eq(0).text();
    });

    await t.expect(getElementText()).contains('What is your primary Operating System');
});
```

## Accessing Child Nodes in the DOM Hierarchy

You can use client functions to access child nodes in a DOM hierarchy and obtain their properties.

For instance, you are testing the *example.html* page with the following HTML code ...

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

... and you need to obtain the text content of the first child node - *This is my tested page*. You can do this within a client function using the [childNodes](https://developer.mozilla.org/en-US/docs/Web/API/Node/childNodes) property. The following sample demonstrates this.

```js
import { Selector } from 'testcafe';
import { ClientFunction } from 'testcafe';

fixture `My Fixture`
    .page `examplepage.html`;

    const testedPage = Selector('#testedpage');

    const getChildNodeText = ClientFunction(index => {
        return getEl().childNodes[index].textContent;
    },{ dependencies: { getEl: testedPage } });


test('My Test', async t => {
    await t.expect(getChildNodeText(0)).contains('This is my tested page.');
});
```

> Note that the `getChildNodeText` client function uses the `testedPage` selector that is passed to it as a dependency. See [options.dependencies](../obtaining-data-from-the-client.md#optionsdependencies) for more information.

## Complex DOM Queries

Client functions can be helpful for complex DOM queries. For example, a tested page contains a table with some data, and you need to validate data from two columns only. To do this, obtain data from these columns, push them to an array and then compare the returned array with the expected one.

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

test('My test', async t => {
    console.log(await getSaleAmount());
});
```