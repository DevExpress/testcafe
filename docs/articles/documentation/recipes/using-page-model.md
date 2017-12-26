---
layout: docs
title: Using Page Model
permalink: /documentation/recipes/using-page-model.html
---
# Using Page Model

[Page Model](http://martinfowler.com/bliki/PageObject.html) is a test automation pattern that allows you to create an abstraction of the tested page
and use it in test code to refer to page elements.

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

## Creating a Page Model

1. Begin with a new `.js` file and declare the `Page` class there.

    ```js
    export default class Page {
        constructor () {
        }
    }
    ```

    This class will contain the Page Model, so name the file `page-model.js`.

2. Add the `Developer Name` input element to the model. To do this,
  introduce the `nameInput` property and assign a [selector](../test-api/selecting-page-elements/selectors/README.md) to it.

    ```js
    import { Selector } from 'testcafe';

    export default class Page {
        constructor () {
            this.nameInput = Selector('#developer-name');
        }
    }
    ```

3. In the test file, import `page-model.js` and create an instance of the `Page` class.
  After that, you can use the `page.nameInput` property to identify the `Developer Name` input element.

    ```js
    import Page from './page-model';

    const page = new Page();

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

4. Add check boxes from the Features section to the Page Model.

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

    export default class Page {
        constructor () {
            this.nameInput = Selector('#developer-name');
        }
    }
    ```

5. In the `Page` class, add the `featureList` property with an array of `Feature` objects.

    ```js
    import { Selector } from 'testcafe';

    const label = Selector('label');

    class Feature {
        constructor (text) {
            this.label    = label.withText(text);
            this.checkbox = this.label.find('input[type=checkbox]');
        }
    }

    export default class Page {
        constructor () {
            this.nameInput = Selector('#developer-name');
            this.featureList = [
                new Feature('Support for testing on remote devices'),
                new Feature('Re-using existing JavaScript code for testing'),
                new Feature('Easy embedding into a Continuous integration system')
            ];
        }
    }
    ```

    Organizing check boxes in an array makes the page model semantically correct and simplifies iterating through the check boxes.

6. The second test now boils down to a single loop.

    ```js
    import Page from './page-model';

    fixture `My fixture`
        .page `https://devexpress.github.io/testcafe/example/`;

    const page = new Page();

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

**Example**

This sample shows a page model for the example page at [https://devexpress.github.io/testcafe/example/](https://devexpress.github.io/testcafe/example/).

```js
import { Selector } from 'testcafe';

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

export default class Page {
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
    }
}
```