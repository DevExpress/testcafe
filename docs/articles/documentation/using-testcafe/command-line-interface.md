---
layout: docs
title: Command Line Interface
permalink: /documentation/using-testcafe/command-line-interface.html
checked: true
---
# Command Line Interface

```sh
testcafe [options] <browser-list-comma-separated> <file-or-glob ...>
```

## Browser List

The `browser-list-comma-separated` argument specifies the list of browsers (separated by commas) where tests will be run.

### Local Browsers

You can specify local browsers by using paths or [aliases](common-concepts/browser-aliases.md).
The list of all the available aliases can be obtained by calling the [--list-browsers](#-b---list-browsers) command.

The following example demonstrates how to run a test in several browsers.
The browsers are specified differently: one by using an alias, the other by using a path.

```sh
testcafe chrome,/applications/safari.app tests/sample-fixture.js
```

To run tests against **all installed browsers**, use the `all` alias.

```sh
testcafe all tests/sample-fixture.js
```

### Remote Browsers

To run tests in a remote browser, specify `remote` as a browser alias.

```sh
testcafe remote tests/sample-fixture.js
```

If you want to connect multiple browsers,
prefix the alias with the number of browsers you want to connect. For example, if you need to use three remote browsers, specify *3remote*.

```sh
testcafe 3remote tests/sample-fixture.js
```

TestCafe will provide URLs to open in required browsers on your remote device.

You can also use the [--qr-code](#--qr-code) option to display QR-codes that represent the same URLs.
Scan the QR-codes by using the device on which you are going to test your application.
As a result, the browsers will be connected to TestCafe and tests will start.

## File Path/Glob Pattern

The `file-or-glob ...` argument specifies files or directories (separated by a space) to run tests from.

For example, this command runs all tests located in the `my-tests` directory.

```sh
testcafe ie my-tests
```

The following command runs tests from specified fixture files.

```sh
testcafe ie my-tests/fixture1.js my-tests/fixture2.js
```

You can also use [globbing patterns](https://github.com/isaacs/node-glob#glob-primer) to specify a set of files.
For example, this command runs tests from files that match `tests/*page*`, namely `tests/example-page.js` and `tests/main-page.js`.

```sh
testcafe ie tests/*page*
```

If you do not specify any file or directory, TestCafe will run tests from the `test` or `tests` directories.

## Options

### -h, --help

Displays usage information for commands.

```sh
testcafe --help
```

### -v, --version

Displays the TestCafe version.

```sh
testcafe --version
```

### -b, --list-browsers

Lists [aliases](common-concepts/browser-aliases.md) of the browsers available on your computer.

```sh
testcafe --list-browsers
```

### -r \<name\>, --reporter \<name\>

Specifies the name of a [built-in](common-concepts/reporters.md) or [custom reporter](../extending-testcafe/custom-reporter-plugin/index.md) that will be used to generate test reports.

The following command runs tests in all available browsers and generates a report in the xunit format.

```sh
testcafe all tests/sample-fixture.js -r xunit
```

The following command runs tests and generates a test report by using the custom plugin reporter.

```sh
testcafe all tests/sample-fixture.js -r my-reporter
```

The generated test report will be displayed in the command prompt window.

If you need to save the report to an external file, you can redirect the command output stream to the file
by using the > redirection operator and specifying the report file path.

```sh
testcafe all tests/sample-fixture.js > tests/test-results.txt
```

### -s \<path\>, --screenshots \<path\>

Enables screenshot capturing and specifies the directory path
to save screenshots to.

```sh
testcafe all tests/sample-fixture.js -s screenshots
```

### -S, --screenshots-on-fails

Takes a screenshot whenever a test fails. Screenshots are saved to the directory
specified by using the **-screenshots \<path\>** option.

For example, the following command runs tests from the
  `sample-fixture.js` file in all browsers, takes screenshots if tests fail,
  and saves the screenshots to the `screenshots` directory.

```sh
testcafe all tests/sample-fixture.js -S -s screenshots
```

### -q, --quarantine-mode

Enables the quarantine mode for tests that fail.
In this mode, a failed test is executed several more times.
The test result depends on the outcome (*passed* or *failed*) that will be at most.
That is, if the test fails on most attempts, the result is *failed*.
And vice versa, if the test is executed successfully on most of the attempts, the result is *passed*.

If the test result differs between test runs, the test is marked as unstable.

```sh
testcafe all tests/sample-fixture.js -q
```

### -e, --skip-js-errors

Prevents tests from failure when a JavaScript error occurs on a tested web page.
By default, in case of such errors, TestCafe stops test execution and posts
an error message to a report. If you want TestCafe to ignore JavaScript errors,
specify this argument.

For example, the following command runs tests from the specified file and forces TestCafe to ignore JavaScript errors.

```sh
testcafe ie tests/sample-fixture.js -e
```

### -t \<name\>,  --test \<name\>

TestCafe will run a test with the specified name.

For example, the following command runs only the `"Click a label"` test from the `sample-fixture.js` file.

```sh
testcafe ie tests/sample-fixture.js -t "Click a label"
```

### -T \<pattern\>, --test-grep \<pattern\>

TestCafe will run tests whose names match the specified pattern.

For example, the following command runs tests whose names match `Click.*`. These can be the `Click a label`, `Click a button` tests, etc.

```sh
testcafe ie my-tests -T "Click.*"
```

### -f \<name\>, --fixture \<name\>

TestCafe will run a fixture with the specified name.

```sh
testcafe ie my-tests -f sample-fixture
```

### -F \<pattern\>, --fixture-grep \<pattern\>

TestCafe will run fixtures whose names match the specified pattern.

For example, the following command runs fixtures whose names match `Page.*`. These can be the `Page1`, `Page2` fixtures, etc.

```sh
testcafe ie my-tests -F "Page.*"
```

### --selector-timeout \<ms\>

Specifies the amount of time, in milliseconds, within which [selectors](../test-api/executing-client-code/index.md#selector-functions) make attempts to obtain a node to be returned.

```sh
testcafe ie my-tests --selector-timeout 500000
```

### --ports \<port1,port2\>

Specifies custom port numbers used by TestCafe to perform testing. The number range is [0-65535].

If ports are not specified, TestCafe selects ports.

### --hostname \<name\>

Specifies the hostname of your computer. It is used when running tests in [remote browsers](#remote-browsers).

If the hostname is not specified, TestCafe will use the operating system hostname or network IP address of the current machine.

### --qr-code

Outputs QR-code that represents URLs used to connect the [remote browsers](#remote-browsers).

```sh
testcafe remote my-tests --qr-code
```

### --color

Enables colors on the command line.

### --no-color

Disables colors on the command line.