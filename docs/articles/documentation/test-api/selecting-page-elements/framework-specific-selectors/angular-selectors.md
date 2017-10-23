---
layout: docs
title: Angular Selectors
permalink: /documentation/test-api/selecting-page-elements/framework-specific-selectors/angular-selectors.html
---
# Angular Selectors

The Angular selectors module allows you to select page elements in AngularJS (v1.x) and Angular (v2+) websites in a native way.

* [AngularJS (v1.x) Selectors](#angularjs-v1x-selectors)
* [Angular (v2+) Selectors](#angular-v2-selectors)

## Install

Both AngularJS and Angular 2+ selectors are shipped in a single module.

```sh
npm install testcafe-angular-selectors
```

## AngularJS (v1.x) Selectors

`AngularJSSelector` contains a set of static methods to search for an HTML element by the specified binding (`byModel`, `byBinding`, etc.).

Import `AngularJSSelector` from the `testcafe-angular-selectors` module and use it to call the required static method.

### Example

```js
import { AngularJSSelector } from 'testcafe-angular-selectors';
import { Selector } from 'testcafe';

fixture `TestFixture`
    .page('http://todomvc.com/examples/angularjs/');

test('add new item', async t => {
    await t
        .typeText(AngularJSSelector.byModel('newTodo'), 'new item')
        .pressKey('enter')
        .expect(Selector('#todo-list').visible).ok();
});
```

See more examples in the [plugin repository](https://github.com/DevExpress/testcafe-angular-selectors/blob/master/test/angularjs-selector-test.js).

### API

To learn about the API, see the [angularJS-selector.md](https://github.com/DevExpress/testcafe-angular-selectors/blob/master/angularJS-selector.md) file in the plugin repository.

## Angular (v2+) Selectors

### Prerequisites

Ensure that your application is bootstrapped in the development mode.
By default, this is true, unless the code contains the [enableProdMode](https://angular.io/api/core/enableProdMode) method call.

If your application runs in the production mode, you won't be able to use `AngularSelector`.

### Usage

#### Wait for Application to be Ready to Run Tests

To wait until the Angular's component tree is loaded, add the `waitForAngular` method to fixture's `beforeEach` hook.

```text
waitForAngular(timeout)
```

Parameter | Type    | Description                      | Default
--------- | ------- | -------------------------------- | ---
`timeout`&#160;*(optional)* | Number  | Time to wait, in milliseconds. | `10000`

```js
import { waitForAngular } from 'testcafe-angular-selectors';

fixture `App tests`
    .page('http://angular-app-url')
    .beforeEach(async () => {
        await waitForAngular();
    });
```

#### Create Selectors for Angular Components

`AngularSelector` allows you to select an HTML element by Angular's component selector or nested component selectors.

Suppose you have the following markup.

```html
<my-app id="data">
    <list id="list1"></list>
    <list id="list2"></list>
</my-app>
```

To get the root Angular element, use the `AngularSelector` constructor without parameters.

```js
import { AngularSelector } from 'testcafe-angular-selectors';
...
const rootAngular = AngularSelector();
```

The rootAngular variable will contain the `<my-app>` element.

> If your application has multiple roots, `AngularSelector` will return the first root returned by the `window.getAllAngularRootElements` function

To get a root DOM element for a component, pass the component selector to the `AngularSelector` constructor.

```js
import { AngularSelector } from 'testcafe-angular-selectors';

const listComponent = AngularSelector('list');
```

To obtain a nested component, you can use a combined selector.

```js
import { AngularSelector } from 'testcafe-angular-selectors';

const listItemComponent = AngularSelector('list list-item');
```

To learn more, refer to the [plugin repository](https://github.com/DevExpress/testcafe-angular-selectors/blob/master/angular-selector.md#create-selectors-for-angular-components).

### Obtaining Component's State

As an alternative to [DOM Node State properties](../dom-node-state.md), you can obtain the state of an Angular component.

To obtain the component state, use the Angular selector's `.getAngular()` method.

The `.getAngular()` method returns a [client function](../../obtaining-data-from-the-client.md). This function resolves to an object that contains component's state.

```js
import { AngularSelector } from 'testcafe-angular-selectors';

const list        = AngularSelector('list');
const listAngular = await list.getAngular();
...
await t.expect(listAngular.testProp).eql(1);
```

To learn more, see the [plugin repository](https://github.com/DevExpress/testcafe-angular-selectors/blob/master/angular-selector.md#obtaining-components-state).