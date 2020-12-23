---
layout: post
title: "Randomize Your End-to-End Tests: How to Generate Input Data for TestCafe"
permalink: /media/team-blog/:title.html
isTeamBlog: true
author: Vladimir Airikh, Eugene Titerman
---
# Randomize Your End-to-End Tests: How to Generate Input Data for TestCafe

User input can be truly unpredictable, so it's important to use a wide sample of random input data when testing web forms. In this article, we'll take a look at three Node libraries that generate data: [nanoid](https://github.com/ai/nanoid), [faker](https://github.com/marak/Faker.js/), and [generate-password](https://github.com/brendanashworth/generate-password). We'll see how TestCafe can leverage their features to help you improve your test coverage.

<!--more-->

The [farfurix/generating-input-data](https://github.com/Farfurix/Generating-input-data) git repo contains the custom demo page and the test examples created specifically for this article. Clone the repository to follow along.

## The Basics (nanoid)

[This example page](https://devexpress.github.io/testcafe/example/) contains a text input field. We can use the `t.typeText` method to populate it:

```js
import { Selector } from 'testcafe';

fixture `Random Input Data: example 1`
    .page('https://devexpress.github.io/testcafe/example/');

test('Generate a random name', async t => {
    await t
        .typeText('#developer-name', 'Developer Name');
});
```

`Nanoid` generates random strings when you call the `nanoid()` method. We can call this method to randomize our input data.

Import the `nanoid` module in the beginning of the file:

```js
import { nanoid } from 'nanoid';
```

Declare a constant with a randomly generated name:

```js
const randomDeveloperName = 'testuser_' + nanoid();
```

Replace the `'Developer Name'` string with the constant we just declared:

```js
await t
    .typeText('#developer-name', randomDeveloperName);
```

Now every time you run the test, the input value will be unique.

## Input validation (faker, generate-password)

Imagine a more complicated scenario: testing a sign-up form's ability to validate user passwords. We need to make sure that the password chosen by the user contains:

* At least eight symbols
* At least one digit
* A lowercase letter
* An uppercase letter.

First, we're going to need a valid email address to serve as our username. `Faker` — a Node.js library that specializes in generating realistic-looking data, such as home addresses, business details, and emails — can help us. Import the library and call the `faker.internet.email()` method to create a valid email address.

```js
import faker from 'faker';

const validEmail = faker.internet.email();
```

The `generate-password` library will give us the passwords we need. We can set password requirements by passing arguments to the generate method of the generator object. Let's import the library:

```js
import generator from 'generate-password';
```

We're ready to create an array of random, yet valid, passwords. The `faker` library will, once again, prove itself useful — this time, it will help us determine the password length.

```js
let validPasswords = [];

for (let i = 0; i < 5; i++) {
    let newRandomPassword = generator.generate({
        length: faker.random.number({ 'min': 10, 'max': 20 }), // 10-20 characters long
        numbers: true,
        uppercase: true,
        lowercase: true,
        strict: true
    });

    validPasswords.push(newRandomPassword);
};
```

It's just as easy to generate invalid credentials. Let's use the `generateMultiple` method to generate invalid passwords of varying length:

```js
// These passwords are too short
const shortPasswords = generator.generateMultiple(5, {
    length: 7,
    numbers: true,
    strict: true
});

// These passwords lack uppercase characters
const passwordsWithoutUppercase = generator.generateMultiple(5, {
    length: 8,
    numbers: true,
    uppercase: false,
    strict: true
});

// These passwords lack lowercase characters
const passwordsWithoutLowercase = generator.generateMultiple(5, {
    length: 8,
    numbers: true,
    lowercase: false,
    strict: true
});

// These passwords lack digits
const passwordsWithoutDigits = generator.generateMultiple(5, {
    length: 8,
    strict: true
});

const invalidPasswords = shortPasswords.concat(passwordsWithoutUppercase, passwordsWithoutLowercase, passwordsWithoutDigits);
```

Now that we have our fake credentials, we can test the web form.

The first test will feed the form valid passwords. To do this, let's iterate over the `validPasswords` array and enter the data it contains into the form. A confirmation of the password's validity should appear every time we click the `#submit` button.

```js
test('Successful password validation', async t => {
    for (const validPassword of validPasswords) {
        await t
            .typeText('#email', validEmail, { replace:true })
            .typeText('#password', validPassword, { replace: true })
            .click('#submit')
            .expect(Selector('#password-status').value).eql('Valid password with a length of ' + validPassword.length);
    };
});
```

The second test will iterate over the `invalidPasswords` array. The main difference between this test and the previous is the content of the password status message. The message should read: "Invalid password".

```js
test('Invalid password warning', async t => {
    for (const invalidPassword of invalidPasswords) {
        await t
            .typeText('#email', validEmail, { replace: true })
            .typeText('#password', invalidPassword, { replace: true })
            .click(submit)
            .expect(Selector('#password-status').value).eql('Invalid password');
    }
});
```

The [farfurix/generating-input-data](https://github.com/Farfurix/Generating-input-data) git repo contains full versions of the examples above, as well as a demo page to run these tests against.

As we just demonstrated, it's easy to use third-party data generators in conjunction with TestCafe to randomize your tests' user input. Just remember: not all data generators are created equal. Select one based on your website's unique needs.

Related Topics:

* [Intercept HTTP Requests](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/intercept-http-requests.html)
* [Obtain Client-Side Info](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/obtain-client-side-info.html)
* [Interact with the Page](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/interact-with-the-page.html)
