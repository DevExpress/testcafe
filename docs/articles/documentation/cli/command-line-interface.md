---
layout: docs
title: Command Line Interface
permalink: /documentation/command-line-interface/
---

TestCafe command line interface is pretty simple. It consists of a single command that runs tests with a number of options.

####Synopsis

```sh
$ testcafe [options] <browser-list-comma-separated> <file-or-glob ...>
```

####Browser List

Specify the list of browsers where tests will be ran. You can specify a browser alias or path.

To run tests against all installed browsers, use the *all* alias.

To use remote browser connection (to run tests on a remote device), specify "remote" as a browser alias. If you want to connect multiple devices, prefix alias with the number of browsers you want to connect (e.g. "3remote").

####File Path/GLOB Pattern

You can specify one or more file path or globbing pattern to run tests from.

####Options

**-h**
**-help**
Display usage information for commands.

**-b**  
**--list-browsers** 
Lists all browsers available on your system.

**-r \<name\>**  
**--reporter \<name\>**  
Specify the reporter (*json*, *list*, *minimal*, *spec*, *xunit*) that will be used to generate test reports. 

**-s \<path\>**  
**--screenshots \<path\>**  
Enable screenshot capturing and specify the directory path to save the screenshots to.

**-S**  
**--screenshots-on-fails**  
Take a screenshot whenever a test fails. Screenshots are saved to the directory specified via **-s \<path\>** or **-screenshots \<path\>** argument.

**-q**  
**--quarantine-mode**  
Enable the quarantine mode for tests that fail. In this mode, a failed test runs five more times, and if it fails in all attempts, the test is marked as failed. If the test passes in any run, it is marked as unstable.

**-e**  
**--skip-js-errors**  
Make tests not fail when a JavaScript error occurs on a tested web page. By default, in case of such errors, TestCafe stops test execution and posts an error message to a report. If you want TestCafe to ignore JavaScript errors, specify this argument.

**-t \<name\>**  
**--test \<name\>**  
TestCafe will run a test with the specified name.

**-T \<pattern\>**  
**--test-grep \<pattern\>**  
TestCafe will run tests whose name matches the specified pattern.

**-f \<name\>**  
**--fixture \<name\>**  
TestCafe will run a fixture with the specified name.
    
**-F \<pattern\>**  
**--fixture-grep \<pattern\>**  
TestCafe will run fixtures whose name matches the specified pattern.

**--ports \<port1,port2\>**  
Specify the custom port numbers used by TestCafe to perform testing. Number [0-65535].

**--hostname \<name\>**
If you need to enable remote testing, specify a hostname of your computer. If it is not specified, localhost is used.

**--qr-code**  
Output QR-code that represents URLs used to connect the remote browsers.

**--color**
Force colors in command line.

**--no-color**
Disable colors in command line.


####Examples

Below are several examples of running TestCafe via the command line.

* The following command tells TestCafe to run tests from the specified file (*samplefixture.test.js*) in all available browsers and generate a report in the xunit format.

```sh
$ testcafe all "c:\Users\TestUser\Documents\TestCafe\Tests\SampleFixture.test.js" -r xunit```

* The following command launches the Internet Explorer browser, run only the *"Click a label"* test from the *samplefixture.test.js* file in it and tells TestCafe to ignore JavaScript errors.
 
```sh
$ testcafe ie "c:\Users\TestUser\Documents\TestCafe\Tests\ SampleFixture.test.js" -t "Click a label" -e```

* The following command tells TestCafe to run tests from the *samplefixture.test.js* file in the Internet Explorer and Google Chrome browsers, take screenshots if tests fail and save the screenshots to the *C:/Screenshots* folder.

```sh
$ testcafe ie,chrome "c:\Users\TestUser\Documents\TestCafe\Tests\ SampleFixture.test.js" -S -s "c:/Screenshots"```

