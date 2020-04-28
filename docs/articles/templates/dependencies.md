### options.dependencies

**Type**: Object

The `dependencies` option contains functions, variables, or objects used by the client function internally.
Properties of the `dependencies` object are added to the client function's scope as variables.

The following code sample demonstrates a client function (`getArticleHeaderHTML`) that
calls a [selector](/testcafe/documentation/reference/test-api/selector/) (`articleHeader`) internally.
TestCafe passes this selector to `getArticleHeaderHTML` as a dependency.

```js
import { Selector, ClientFunction } from 'testcafe';

const articleHeader = Selector('#article-header');

const getArticleHeaderHTML = ClientFunction(() => articleHeader().innerHTML, {
     dependencies: { articleHeader }
});
```

> When a client function calls a [selector](/testcafe/documentation/reference/test-api/selector/) internally,
> the selector does not wait for the element to appear in the DOM
> and is executed at once, like a client function.
