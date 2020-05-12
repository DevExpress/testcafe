---
layout: docs
title: Page Model
permalink: /documentation/guides/concepts/page-model.html
redirect_from:
  - /documentation/recipes/using-page-model.html
  - /documentation/recipes/use-page-model.html
  - /documentation/recipes/extract-reusable-test-code/use-page-model.html
---
# Page Model

[Page Model](http://martinfowler.com/bliki/PageObject.html) is a test automation pattern that allows you to create an abstraction of the tested page and use it in test code to refer to page elements.

* [Why Use Page Model](#why-use-page-model)
* [Create a Page Model](#create-a-page-model)
  * [Step 1 - Declare a Page Model Class](#step-1---declare-a-page-model-class)
  * [Step 2 - Add a Page Element to the Page Model](#step-2---add-a-page-element-to-the-page-model)
  * [Step 3 - Write a Test That Uses the Page Model](#step-3---write-a-test-that-uses-the-page-model)
  * [Step 4 - Add a New Class for Check Boxes](#step-4---add-a-new-class-for-check-boxes)
  * [Step 5 - Add a List of Check Boxes to the Page Model](#step-5---add-a-list-of-check-boxes-to-the-page-model)
  * [Step 6 - Write a Test That Iterates Through Check Boxes](#step-6---write-a-test-that-iterates-through-check-boxes)
  * [Step 7 - Add Actions to the Page Model](#step-7---add-actions-to-the-page-model)
  * [Step 8 - Write a Test That Calls Actions From the Page Model](#step-8---write-a-test-that-calls-actions-from-the-page-model)
* [Page Model Example](#page-model-example)

## Why Use Page Model

Consider the following fixture with two tests: one that types and edits
the developer name on the [example](https://devexpress.github.io/testcafe/example/) webpage and the other that
checks check boxes in the Features section.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Text typing basics', async t => {
    await t
        .typeText('#developer-name', 'Peter')
        .typeText('#developer-name', 'Paker', { replace: true })
        .typeText('#developer-name', 'r', { caretPos: 2 })
        .expect(Selector('#developer-name').value).eql('Parker');
});

test('Click check boxes and then verify their state', async t => {
    await t
        .click('input[id=remote-testing]')
        .expect(Selector('input[id=remote-testing]').checked).ok()
        .click('input[id=reusing-js-code]')
        .expect(Selector('input[id=reusing-js-code]').checked).ok()
        .click('input[id=continuous-integration-embedding]')
        .expect(Selector('input[id=continuous-integration-embedding]').checked).ok();
});
```

Note that both tests contain excessive code.
In the first test, the `#developer-name` CSS selector is duplicated in code each time the test refers to the input element.
In the second test, test logic is duplicated for each check box.

In a rapidly developing web application, page markup and design may change often. When this happens, you need to modify selectors in all your tests.
The Page Model allows you to keep all selectors in one place, so the next time the webpage changes,
you will only need to modify the page model.

Generally speaking, the Page Model pattern allows you to follow
the separation of concerns principle - you keep page representation in the Page Model,
while tests remain focused on the behavior.

## Create a Page Model

### Step 1 - Declare a Page Model Class

Begin with a new `.js` file, declare the `Page` class there, and export its instance.

```js
class Page {
    constructor () {
    }
}

export default new Page();
```

This class will contain the Page Model, so name the file `page-model.js`.

### Step 2 - Add a Page Element to the Page Model

Add the `Developer Name` input element to the model. To do this,
introduce the `nameInput` property and assign a [selector](../basic-guides/select-page-elements.md) to it.

```js
import { Selector } from 'testcafe';

class Page {
    constructor () {
        this.nameInput = Selector('#developer-name');
    }
}

export default new Page();
```

### Step 3 - Write a Test That Uses the Page Model

In the test file, import the page model instance from `page-model.js`.
After that, you can use the `page.nameInput` property to identify the `Developer Name` input element.

```js
import page from './page-model';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Text typing basics', async t => {
    await t
        .typeText(page.nameInput, 'Peter')
        .typeText(page.nameInput, 'Paker', { replace: true })
        .typeText(page.nameInput, 'r', { caretPos: 2 })
        .expect(page.nameInput.value).eql('Parker');
});
```

### Step 4 - Add a New Class for Check Boxes

Add check boxes from the Features section to the Page Model.

As long as each item in the Features section contains a check box and a label,
introduce a new class `Feature` with two properties: `label` and `checkbox`.

```js
import { Selector } from 'testcafe';

const label = Selector('label');

class Feature {
    constructor (text) {
        this.label    = label.withText(text);
        this.checkbox = this.label.find('input[type=checkbox]');
    }
}

class Page {
    constructor () {
        this.nameInput = Selector('#developer-name');
    }
}

export default new Page();
```

### Step 5 - Add a List of Check Boxes to the Page Model

In the `Page` class, add the `featureList` property with an array of `Feature` objects.

```js
import { Selector } from 'testcafe';

const label = Selector('label');

class Feature {
    constructor (text) {
        this.label    = label.withText(text);
        this.checkbox = this.label.find('input[type=checkbox]');
    }
}

class Page {
    constructor () {
        this.nameInput = Selector('#developer-name');
        this.featureList = [
            new Feature('Support for testing on remote devices'),
            new Feature('Re-using existing JavaScript code for testing'),
            new Feature('Easy embedding into a Continuous integration system')
        ];
    }
}

export default new Page();
```

Organizing check boxes in an array makes the page model semantically correct and simplifies iterating through the check boxes.

### Step 6 - Write a Test That Iterates Through Check Boxes

The second test now boils down to a single loop.

```js
import page from './page-model';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

test('Text typing basics', async t => {
    await t
        .typeText(page.nameInput, 'Peter')
        .typeText(page.nameInput, 'Paker', { replace: true })
        .typeText(page.nameInput, 'r', { caretPos: 2 })
        .expect(page.nameInput.value).eql('Parker');
});

test('Click check boxes and then verify their state', async t => {
    for (const feature of page.featureList) {
        await t
            .click(feature.label)
            .expect(feature.checkbox.checked).ok();
    }
});
```

### Step 7 - Add Actions to the Page Model

Add an action that enters the developer name and clicks the Submit button.

1. Import `t`, a [test controller](../../reference/test-api/testcontroller/README.md), from the `testcafe` module.

    ```js
    import { Selector, t } from 'testcafe';
    ```

2. Add a Submit button to the page model.

    ```js
    this.submitButton = Selector('#submit-button');
    ```

3. Declare an [asynchronous function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) in the `Page` class. This function uses the test controller to perform several actions on the tested page: enter the developer name and click the Submit button.

    ```js
    async submitName (name) {
        await t
            .typeText(this.nameInput, name)
            .click(this.submitButton);
    }
    ```

Here is how the page model looks now.

```js
import { Selector, t } from 'testcafe';

const label = Selector('label');

class Feature {
    constructor (text) {
        this.label    = label.withText(text);
        this.checkbox = this.label.find('input[type=checkbox]');
    }
}

class Page {
    constructor () {
        this.nameInput = Selector('#developer-name');

        this.featureList = [
            new Feature('Support for testing on remote devices'),
            new Feature('Re-using existing JavaScript code for testing'),
            new Feature('Easy embedding into a Continuous integration system')
        ];

        this.submitButton = Selector('#submit-button');
    }

    async submitName (name) {
        await t
            .typeText(this.nameInput, name)
            .click(this.submitButton);
    }
}

export default new Page();
```

### Step 8 - Write a Test That Calls Actions From the Page Model

Now write a test that calls `page.submitName` and checks the message on the Thank You page.

```js
test('Submit a developer name and check the header', async t => {
    const header = Selector('#article-header');

    await page.submitName('Peter');

    await t.expect(header.innerText).eql('Thank you, Peter!');
});
```

This test works with a different page for which there is no page model. That is why it uses a selector. Don't forget to import it to the test file.

```js
import { Selector } from 'testcafe';
```

## Page Model Example

This sample shows a page model for the example page at [https://devexpress.github.io/testcafe/example/](https://devexpress.github.io/testcafe/example/).

[Full Example Code](https://github.com/DevExpress/testcafe-examples/tree/master/examples/use-page-model)

```js
import { Selector, t } from 'testcafe';

const label = Selector('label');

class Feature {
    constructor (text) {
        this.label    = label.withText(text);
        this.checkbox = this.label.find('input[type=checkbox]');
    }
}

class OperatingSystem {
    constructor (text) {
        this.label       = label.withText(text);
        this.radioButton = this.label.find('input[type=radio]');
    }
}

class Page {
    constructor () {
        this.nameInput             = Selector('#developer-name');
        this.triedTestCafeCheckbox = Selector('#tried-test-cafe');
        this.populateButton        = Selector('#populate');
        this.submitButton          = Selector('#submit-button');
        this.results               = Selector('.result-content');
        this.commentsTextArea      = Selector('#comments');

        this.featureList = [
            new Feature('Support for testing on remote devices'),
            new Feature('Re-using existing JavaScript code for testing'),
            new Feature('Running tests in background and/or in parallel in multiple browsers'),
            new Feature('Easy embedding into a Continuous integration system'),
            new Feature('Advanced traffic and markup analysis')
        ];

        this.osList = [
            new OperatingSystem('Windows'),
            new OperatingSystem('MacOS'),
            new OperatingSystem('Linux')
        ];

        this.slider = {
            handle: Selector('.ui-slider-handle'),
            tick:   Selector('.slider-value')
        };

        this.interfaceSelect       = Selector('#preferred-interface');
        this.interfaceSelectOption = this.interfaceSelect.find('option');
        this.submitButton          = Selector('#submit-button');
    }

    async submitName (name) {
        await t
            .typeText(this.nameInput, name)
            .click(this.submitButton);
    }
}

export default new Page();
```
