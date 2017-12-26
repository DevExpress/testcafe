---
layout: docs
title: Framework-Specific Selectors
permalink: /documentation/test-api/selecting-page-elements/framework-specific-selectors.html
---
# Framework-Specific Selectors

TestCafe provides a full-featured set of general purpose [selectors](selectors/README.md). They are based on CSS selectors or client JS code, which works well with any HTML5 website. However, if you use a front-end framework, you may want your tests to be aware of your framework specifics. For instance, the component tree for React or element bindings for Aurelia.

For this purpose, the TestCafe team and community developed libraries of dedicated selectors for the most popular frameworks. So far, the following selectors are available.

* [React](#react)
* [Angular](#angular)
* [Vue](#vue)
* [Aurelia](#aurelia)

## React

The React selectors module provides the `ReactSelector` class that allows you to select DOM elements by the component name. You can get a root element or search through the nested components or elements. In addition, you can obtain the component props and state.

```js
import ReactSelector from 'testcafe-react-selectors';

const TodoList         = ReactSelector('TodoApp TodoList');
const itemsCountStatus = ReactSelector('TodoApp div');
const itemsCount       = ReactSelector('TodoApp div span');
```

```js
const reactComponent      = ReactSelector('MyComponent');
const reactComponentState = await reactComponent.getReact();

// >> reactComponentState
//
// {
//     props:    <component_props>,
//     state:    <component_state>
// }
```

To learn more, see the [repository documentation](https://github.com/DevExpress/testcafe-react-selectors/blob/master/README.md).

## Angular

### AngularJS

`AngularJSSelector` contains a set of static methods to search for an HTML element by the specified binding (`byModel`, `byBinding`, etc.).

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

To learn more, see the [angularJS-selector.md](https://github.com/DevExpress/testcafe-angular-selectors/blob/master/angularJS-selector.md) file in the plugin repository.

### Angular v2+

Use the `AngularSelector` class to select DOM elements by the component name. Call it without parameters to get a root element. You can also search through the nested components or elements. In addition, you can obtain the component state.

```js
import { AngularSelector } from 'testcafe-angular-selectors';

const rootAngular       = AngularSelector();
const listComponent     = AngularSelector('list');
const listItemComponent = AngularSelector('list list-item');
```

```js
import { AngularSelector } from 'testcafe-angular-selectors';

const list        = AngularSelector('list');
const listAngular = await list.getAngular();

await t.expect(listAngular.testProp).eql(1);
```

To learn more, refer to the [plugin repository](https://github.com/DevExpress/testcafe-angular-selectors/blob/master/angular-selector.md).

## Vue

Vue selectors allow you to pick DOM elements by the component name. You can also search through the nested components or elements. In addition, you can obtain the component props, state and computed props.

```js
import VueSelector from 'testcafe-vue-selectors';

const rootVue   = VueSelector();
const todoInput = VueSelector('todo-input');
const todoItem  = VueSelector('todo-list todo-item');
```

```js
const vueComponent      = VueSelector('componentTag');
const vueComponentState = await vueComponent.getVue();

// >> vueComponentState
//
// {
//     props:    <component_props>,
//     state:    <component_state>,
//     computed: <component_computed>
// }
```

To learn more, see the [repository documentation](https://github.com/DevExpress/testcafe-vue-selectors/blob/master/README.md).

## Aurelia

The Aurelia selectors plugin allows you to select page elements by JS expressions to which the element's attributes are bound.

```js
import AureliaSelector from 'testcafe-aurelia-selectors';

fixture `TestFixture`
    .page('http://todomvc.com/examples/aurelia/');

test('add new item', async t => {
    await t
        .typeText(AureliaSelector.byValueBind('newTodoTitle'), 'new item')
        .pressKey('enter')
        .expect(AureliaSelector.byShowBind('items.length').exists).ok();
});
```

To learn about the API, see the [repository documentation](https://github.com/miherlosev/testcafe-aurelia-selectors/blob/master/README.md).