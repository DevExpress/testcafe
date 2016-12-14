---
layout: docs
title: Using Page Model
permalink: /documentation/recipes/using-page-model.html
---
# Using Page Model

Page Model is a test automation pattern that allows you to create an abstraction of the tested page
and use it in test code to refer to page elements.

## Why Use Page Model

Consider the following fixture with a test that types and edits the developer name on the [example](https://devexpress.github.io/testcafe/example/) webpage.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

const nameInput = Selector('#developer-name');

test('Text typing basics', async t => {
    await t
        .typeText(nameInput, 'Peter')
        .typeText(nameInput, 'Paker', { replace: true })
        .typeText(nameInput, 'r', { caretPos: 2 })
        .expect(nameInput.value).eql('Parker');
});
```

With just a single test, the code is concise and clean.

Add another test that checks check boxes in the Features section.

```js
import { Selector } from 'testcafe';

fixture `My fixture`
    .page `https://devexpress.github.io/testcafe/example/`;

const label = Selector('label');

const remoteTestingLabel    = label.withText('Support for testing on remote devices');
const remoteTestingCheckbox = remoteTestingLabel.find('input[type=checkbox]');

const reusingCodeLabel    = label.withText('Re-using existing JavaScript code for testing');
const reusingCodeCheckBox = reusingCodeLabel.find('input[type=checkbox]');

const ciCodeLabel    = label.withText('Easy embedding into a Continuous integration system');
const ciCodeCheckBox = ciCodeLabel.find('input[type=checkbox]');

const nameInput = Selector('#developer-name');

test('Text typing basics', async t => {
    await t
        .typeText(nameInput, 'Peter')
        .typeText(nameInput, 'Paker', { replace: true })
        .typeText(nameInput, 'r', { caretPos: 2 })
        .expect(nameInput.value).eql('Parker');
});

test('Click labels and then check their state', async t => {
    await t
        .click(remoteTestingLabel)
        .expect(remoteTestingCheckbox.checked).ok()
        .click(reusingCodeLabel)
        .expect(reusingCodeCheckBox.checked).ok()
        .click(ciCodeLabel)
        .expect(ciCodeCheckBox.checked).ok();
});
```

The section of code where selectors are initialized has grown bigger and gained some excessive code.

In this instance, the Page Model pattern will be helpful. It will provide a structured model of the tested page that is transparent and easy to use.

## Creating a Page Model

Begin with a new `.js` file and declare the `Page` class there.

```js
export default class Page {
    constructor () {
    }
}
```

This class will contain the Page Model, so name this file `page-model.js`.

Now add the `Developer Name` input element to the model. To do this,
introduce the `nameInput` property and assign a proper [selector](../test-api/selecting-page-elements/selectors.md) to it.

```js
import { Selector } from 'testcafe';

export default class Page {
    constructor () {
        this.nameInput = Selector('#developer-name');
    }
}
```

In the test file, reference `page-model.js` and create an instance of the `Page` class.
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

Now add check boxes from the Features section to the Page Model.

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

Hence, the second test now boils down to a single loop.

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

test('Click labels and then check their state', async t => {
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