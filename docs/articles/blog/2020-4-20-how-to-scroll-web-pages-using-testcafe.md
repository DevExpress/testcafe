---
layout: post
title: How to Scroll Web Pages Using TestCafe
permalink: /media/team-blog/:title.html
isTeamBlog: true
author: Alexander Prokhorov, Anastasia Karabanova
---
# How to Scroll Web Pages Using TestCafe

If you're writing functional tests, you may need to scroll tested pages to display specific elements. In this article, we look at several test scenarios to show how TestCafe navigates pages.

<!--more-->

## Built-in TestCafe Actions Scroll the Page Automatically

Each TestCafe API action scrolls a page to show the target element. You don't need to write extra code to click a button or input text. Simply pass a selector to the action method. TestCafe will automatically scroll to the element and execute the action.

```js
// scroll to the "#submit-btn" element and click it
await t.click('#submit-btn');
```

## Scroll to a Rendered DOM Element

If you need to scroll a page to display a specific element or area, but don't need to perform an action on the target element, use the [hover](https://devexpress.github.io/testcafe/documentation/reference/test-api/testcontroller/hover.html) method.

```js
// scroll to the "#country-map" element
await t.hover('#country-map');
```

## Scroll to a Dynamically Generated Element

In certain scenarios, elements cannot be identified by a selector. For instance, a page may contain a dynamically generated list of identical items. Another example is virtual scrolling: the element might not exist on a page when the action starts.

A solution in these cases is to use the browser's native API. For example, you can use the [window.scrollBy](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollBy) method. To access this method, utilize the [ClientFunction](https://devexpress.github.io/testcafe/documentation/reference/test-api/clientfunction/constructor.html) generator. Calculate the offset between the element and the top of the container, and pass these values to the scrollBy method.

```js
import { ClientFunction } from 'testcafe';

fixture `Fixture`
   .page `https://github.com/DevExpress/testcafe`;

const scrollBy = ClientFunction((x, y) => {
   window.scrollBy(x, y);
});

test(`test`, async t => {
   const targetElementPosition = // ...

   await scrollBy(0, targetElementPosition);

   await t.debug();
});
```

Sometimes offset calculation is not an option. If a page uses virtual scrolling, element heights can change. You may not even know the number of elements above the element to be displayed. You might only know the element's content, such as its display text.

To find an element by text, scroll to the last rendered item on the list so that the next portion of elements are loaded. Continue the process until you locate the element. A selector's [exists](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/select-page-elements.html#check-if-an-element-exists) property allows you to scan rendered elements and see if an element with that text exists. If it does exist, the search is over. If not, repeat the cycle.

```js
import { Selector } from 'testcafe';
  
fixture `Getting Started`
    .page('https://bvaughn.github.io/react-virtualized/#/components/List')

test('Test 1', async t => {
    const container  = Selector('._1oXCrgdVudv-QMFo7eQCLb');
    const listItem   = Selector('._113CIjCFcgg_BK6pEtLzCZ');
    const targetItem = listItem.withExactText('Tisha Wurster');

    await t.click(container);

    while (!await targetItem.exists) {
        const bottomItemIndex = await listItem.count -1;
        const bottomItemText  = await listItem.nth(bottomItemIndex).textContent;
        const bottomItem      = await listItem.withExactText(bottomItemText);

        await t.hover(bottomItem);
    }

    await t
        .hover(targetItem)
        .click(targetItem);

    await t.debug();
});
```

We hope you find these tips useful.

Want to learn more about TestCafe? Feel free to mention [@DXTestCafe](https://twitter.com/DXTestCafe) on Twitter and suggest a topic for the next post.
