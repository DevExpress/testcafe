---
layout: post
title: "How TestCafe Can Help You to Deliver Faster"
permalink: /media/team-blog/:title.html
isTeamBlog: true
author: Vasily Strelyaev
---
# How TestCafe Can Help You to Deliver Faster

DevOps teams must make certain that applications ship on time and meet appropriate quality standards. To achieve the latter objective, DevOps must carefully consider what checks to include in the pipeline and what to leave as smoke tests. In this brief article, we argue that end-to-end tests are crucial to product quality and are worth running each time an organization delivers a build. We will illustrate how TestCafe can streamline this process and help you integrate end-to-end tests into your CI/CD workflow with minimum time and effort.

<!--more-->

## Unit Tests are not Enough

As you know, some organizations/dev teams require use of unit tests. Unit tests allow developers to verify whether "small" portions of a solution work as intended, but do so **independent of the whole**. While it may be tempting to use green unit tests as the prime delivery condition within a CI/CD system, unit tests will always remain granular and limited in scope.

Unit tests allow developers to flag problematic code modifications, but unit tests cannot accurately determine whether all parts of a given system are working **together flawlessly**.  Said differently, unit tests cannot establish whether all usage scenarios are fully tested and meet an organization's quality standards.

By contrast, end-to-end tests can check/analyze whether the entire system operates as expected (the whole and not just its parts). End-to-end tests can emulate user actions and determine whether real output matches expected outcomes. Unit tests are important, but we believe that only end-to-end test automation can deliver the reliability users have come to expect from today's top software organizations.

## TestCafe – End-to-End Testing Made Easy

TestCafe is an enterprise-ready end-to-end testing framework with an intuitive API. Unlike legacy frameworks such as Selenium, TestCafe is easy to install, run, and integrate within an organization's CI/CD pipeline. You can install the framework via npm with a single command. Since TestCafe does not require tedious configuration or plugins, it can be wound up in a new CI system within minutes. And yes, with TestCafe, you do not need to locate, install, and configure additional testing software/modules. TestCafe is self-contained and only requires Node.js and your preferred browser (no browser plugins are needed).

In addition, TestCafe allows you to test next-gen web features with absolute ease. TestCafe supports all major modern browsers (either locally or cloud-based) – across a variety of mobile or desktop devices. TestCafe can execute its tests on macOS, Windows, Linux, iOS, and Android. You can use Chrome, Firefox, Safari, Edge and Internet Explorer when and where appropriate – you can even use headless browsers (a great way to decrease testing time and to execute browser tests on VMs with no graphical system).

As you'll see below, we've taken care of everything under the hood so you and your team can avoid configuration hassles and the steep learning curve associated with legacy testing frameworks.

## How to Integrate TestCafe in Your CI/CD

TestCafe can be incorporated into a pipeline with a few simple steps:  

1. **Install Node.js**
2. **Install TestCafe**. As mentioned earlier, TestCafe can be installed with a simple command: `npm install -g testcafe`.
3. **Run TestCafe tests**. Only a single command is required to execute a test (for instance: `testcafe chrome:headless ./tests`). With this simple command, TestCafe will auto detect the browser (if installed), launch it, and run your tests automatically.

TestCafe ships with five reporters – modules that can generate test execution reports for your CI/CD. JSON, JUnit, xUnit, and console output (with rich formatting) are built-in. You can also use reporters developed by the TestCafe user community for [NUnit](https://www.npmjs.com/package/testcafe-reporter-nunit), [TeamCity](https://www.npmjs.com/package/testcafe-reporter-teamcity), [Slack](https://www.npmjs.com/package/testcafe-reporter-slack), etc. Should you require these community plugins, you can:

* Install the desired third-party reporter via npm: `npm install testcafe testcafe-reporter-nunit`;
* Run TestCafe tests much like step 3: `testcafe chrome:headless ./tests -r nunit:report.xml`

You can learn more and about TestCafe and CI system integration via the following links:

* [Jenkins](https://devexpress.github.io/testcafe/documentation/guides/continuous-integration/jenkins.html)
* [GitHub Actions](https://devexpress.github.io/testcafe/documentation/guides/continuous-integration/github-actions.html)
* [Travis](https://devexpress.github.io/testcafe/documentation/guides/continuous-integration/travis.html)
* [CircleCI](https://devexpress.github.io/testcafe/documentation/guides/continuous-integration/circleci.html)
* [TeamCity](https://devexpress.github.io/testcafe/documentation/guides/continuous-integration/teamcity.html)
* [GitLab](https://devexpress.github.io/testcafe/documentation/guides/continuous-integration/gitlab.html)
* [Azure DevOps](https://devexpress.github.io/testcafe/documentation/guides/continuous-integration/azure-devops.html)
* [BitBucket Pipelines](https://devexpress.github.io/testcafe/documentation/guides/continuous-integration/bitbucket-pipelines.html)
* [AppVeyor](https://devexpress.github.io/testcafe/documentation/guides/continuous-integration/appveyor.html)

Note: For Jenkins, TestCafe can post videos and screenshot it captured during test execution. To enable this functionality, you will need to install [the Jenkins plugin](https://plugins.jenkins.io/testcafe/) and use a dedicated [Jenkins reporter](https://www.npmjs.com/package/testcafe-reporter-jenkins).

## Docker Image

TestCafe is easy to install and requires a very basic environment. Of course, you can wind it up even faster with Docker. To get started, download a pre-configured image from Docker Hub:

```sh
docker pull testcafe/testcafe
```

The image is based on ArcLinux and includes Node.js, TestCafe, Chrome, and Firefox. It is ready to execute tests as needed:

```sh
docker run -v //d/tests:/tests -it testcafe/testcafe firefox:headless /tests/**/*.js
```

You can also use this image on your computer to perform tests on a host machine or remote machines within your network. See the following help topic for additional Docker-related information: [Use TestCafe's Docker Image](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/use-testcafe-docker-image.html)

## GitHub Actions

The GitHub Actions CI service is ideal for projects developed on GitHub. To help you quickly integrate TestCafe into your Actions workflows, we created the [Run TestCafe](https://github.com/DevExpress/testcafe-action) action. This action installs TestCafe and runs tests on your behalf. To begin, you simply need to add TestCafe command line arguments:

```yaml
- uses: DevExpress/testcafe-action@latest
  with:
    args: "chrome tests"
```

## TestCafe: Adoption Made Easy

Ready to see TestCafe's capabilities in action? Want to see how quickly you can incorporate test automation into your CI/CD workflow?

[Get Started Today](https://devexpress.github.io/testcafe/documentation/getting-started/) or [Ask Us](https://devexpress.github.io/testcafe/support/) for more information. We are here to help.
