---
layout: docs
title: Vue Selectors
permalink: /documentation/test-api/selecting-page-elements/framework-specific-selectors/vue-selectors.html
---
# Vue Selectors

This plugin provides selector extensions that make it easier to test Vue components with TestCafe. These extensions allow you to test Vue component state and result markup together.

## Install

```sh
npm install testcafe-vue-selectors
```

## Usage

### Create selectors for Vue components

`VueSelector` allows you to select page elements by the component `tagName` or the nested component `tagNames`.

Suppose you have the following markup.

```html
<div id="todo-app">
    <todo-input />
    <todo-list>
        <todo-item priority="High">Item 1</todo-item>
        <todo-item priority="Low">Item 2</todo-item>
    </todo-list>
    <div className="items-count">Items count: <span>{{itemCount}}</span></div>
</div>
<script>
    Vue.component('todo-input', {...});
    Vue.component('todo-list', {...});
    Vue.component('todo-item', {...});

    new Vue({
        el:   '#todo-app',
        data: {...}
    });
</script>
```

To get the root Vue node, use the `VueSelector` constructor without parameters.

```js
import VueSelector from 'testcafe-vue-selectors';

const rootVue = VueSelector();
```

The `rootVue` variable will contain the `<div id="todo-app">` element.

To get a root DOM element for a component, pass the component name to the `VueSelector` constructor.

```js
import VueSelector from 'testcafe-vue-selectors';

const todoInput = VueSelector('todo-input');
```

To obtain a nested component, you can use a combined selector.

```js
import VueSelector from 'testcafe-vue-selectors';

const todoItem = VueSelector('todo-list todo-item');
```

To learn more, see the [repository documentation](https://github.com/DevExpress/testcafe-vue-selectors/blob/master/README.md#usage).

#### Obtaining component's props, computed and state

In addition to [DOM Node State](../dom-node-state.md), you can obtain `state`, `computed` or `props` of a Vue component.

To get these data, use the Vue selector’s `.getVue()` method.

The `getVue()` method returns a [client function](../../obtaining-data-from-the-client.md). This function resolves to an object that contains component properties.

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

To learn more, see the [repository documentation](https://github.com/DevExpress/testcafe-vue-selectors/blob/master/README.md#obtaining-components-props-computed-and-state).