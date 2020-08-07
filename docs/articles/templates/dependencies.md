### options.dependencies

**Type**: Object

The `dependencies` option contains functions, variables, or objects used by the client function internally.
Properties of the `dependencies` object are added to the client function's scope as variables.

Dependencies passed to `ClientFunction` must be [Selectors](https://devexpress.github.io/testcafe/documentation/reference/test-api/selector/), [ClientFunctions](https://devexpress.github.io/testcafe/documentation/reference/test-api/clientfunction/) or a serializable object.

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

When dependencies are passed to a client function, [TypeScript](https://www.typescriptlang.org/) cannot find them during compilation. This happens because dependencies are added to the function's scope at runtime and can cause an error:

```sh
Error: TypeScript compilation failed.
Cannot find name 'dependencyFoo'.
```

Add the [`// @ts-ignore`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html#suppress-errors-in-ts-files-using--ts-ignore-comments) TypeScript comment to suppress this error.