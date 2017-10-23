---
layout: docs
title: React Selectors
permalink: /documentation/test-api/selecting-page-elements/framework-specific-selectors/react-selectors.html
---
# React Selectors

The React selectors module provides the `ReactSelector` class that allows you to select DOM elements by the component name. You can get a root element or search through the nested components or elements. In addition, you can obtain the component props and state.

## Installation

```sh
npm install testcafe-react-selectors
```

## Usage

Suppose you have the following JSX.

```html
<TodoApp className="todo-app">
    <TodoInput />
    <TodoList>
        <TodoItem priority="High">Item 1</TodoItem>
        <TodoItem priority="Low">Item 2</TodoItem>
    </TodoList>

    <div className="items-count">Items count: <span>{this.state.itemCount}</span></div>
</TodoApp>
```

### Selecting React Components

To get a root DOM element for a component, pass the component name to the ReactSelector constructor.

```js
import ReactSelector from 'testcafe-react-selectors';

const todoInput = ReactSelector('TodoInput');
```

To obtain a nested component or DOM element, you can use a combined selector or add DOM element's tag name.

```js
import ReactSelector from 'testcafe-react-selectors';

const TodoList         = ReactSelector('TodoApp TodoList');
const itemsCountStatus = ReactSelector('TodoApp div');
const itemsCount       = ReactSelector('TodoApp div span');
```

To learn more, see the [repository documentation](https://github.com/DevExpress/testcafe-react-selectors/blob/master/README.md#create-selectors-for-reactjs-components).

### Obtaining Component's Props and State

As an alternative to TestCafe [node state properties](../dom-node-state.md), you can obtain state or props of a ReactJS component.

To obtain component properties and state, use the React selector's `.getReact()` method.

The `.getReact()` method returns a [client function](../../obtaining-data-from-the-client.md). This function resolves to an object that contains component's properties (excluding properties of its children) and state.

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

To learn more, see the [repository documentation](https://github.com/DevExpress/testcafe-react-selectors/blob/master/README.md#obtaining-components-props-and-state).