---
layout: post
title: "Introducing the TestCafe Jenkins plugin"
permalink: /media/team-blog/:title.html
isTeamBlog: true
author: Pavel Redrukhin, Eugene Titerman
---
# Introducing the TestCafe Jenkins plugin

TestCafe can capture videos and screenshots so you can debug your tests and examine page UI. You can record all the tests or only those that failed, generate multiple video files or stitch them together, and even single out specific interactions (see [the documentation](https://devexpress.github.io/testcafe/documentation/guides/advanced-guides/screenshots-and-videos.html) for the full list of available options).

Many TestCafe users take advantage of Jenkins — a CI/CD solution — to automate their tests. Until recently, they had to manually match the screenshots and videos taken by TestCafe to the individual test reports. The newly implemented [TestCafe Jenkins plugin](https://plugins.jenkins.io/testcafe/) simplifies this process. Links to screenshots and videos taken during the test now automatically appear on the Jenkins test results page. You don't even need to keep your testing server running — all the necessary files are stored right inside the Jenkins build folder.

<!--more-->

The test results page should look like this with our plugin enabled:

![The updated test results page](/testcafe/images/jenkins-plugin/test-results-page.png)

## Test case: the disappearing button

Let's say the 'Add to Cart' button disappears on the mobile version of your website.

![The 'Add To Cart' button is absent from the mobile version of the website](/testcafe/images/jenkins-plugin/button-example.png)

TestCafe supports several mobile device emulation methods. You can:

* [Resize the browser window](https://devexpress.github.io/testcafe/documentation/guides/basic-guides/interact-with-the-page.html#resize-window) during testing
* Run the test through a [3rd party cloud testing service](https://devexpress.github.io/testcafe/documentation/guides/concepts/browsers.html#browsers-in-cloud-testing-services)
* Take advantage of [Chromium's built-in emulation mode](https://devexpress.github.io/testcafe/documentation/guides/concepts/browsers.html#use-chromium-device-emulation)

The third option offers greater speed and stability. We describe it going forward and recommend that you use it if possible.

First, let's write a simple test that checks if the 'Add to Cart' button exists:

```js
test('`Add To Cart` button should exist', async t => {
    await t
        .click(Selector('button').withText('Add To Cart'));
});
```

Now let's configure Jenkins to launch this test every time we build our project.

## Basic setup

### Step 1. Take care of the prerequisites

TestCafe requires a working Node.js installation to run. If your testing environment does not contain node.js, [this Jenkins plugin](https://plugins.jenkins.io/nodejs/) can install it for you. Make sure you have Chromium too: TestCafe cannot function without a browser.

### Step 2. Install the TestCafe Jenkins plugin

To install the TestCafe Jenkins plugin, press the "Manage Plugins" link on the Manage Jenkins page, select the "Available" tab, and enter "testcafe" into the search field. Check the box next to our plugin and press the 'Install without restart' button below it.

![Jenkins plugin search UI](/testcafe/images/jenkins-plugin/plugin-search-ui.png)

### Step 3. Install the necessary Node packages

Install the main testcafe library, as well as the [testcafe-reporter-jenkins](https://www.npmjs.com/package/testcafe-reporter-jenkins) package. The latter is needed to generate Jenkins-friendly JUnit format reports.

To do this, add the following *build step* to your Jenkins project:

```bash
npm i testcafe testcafe-reporter-jenkins
```

### Step 4. Configure the tests

You can configure your tests via:

* the [command line interface](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html)
* the JavaScript/TypeScript API
* the .testcaferc.json [configuration file](https://devexpress.github.io/testcafe/documentation/reference/configuration-file.html)

The last option provides an easy, declarative way to define your test settings. You can store this file in the same folder as your tests.  Below is the configuration we're going to use in this tutorial:

```js
{
    "browsers": [
        "chromium:headless:emulation:device=iPhone 4",
        "chromium:headless:emulation:device=iPad Mini",
        "chromium:headless"
    ],
    "src": "test/e2e/**/*",
    "screenshots": {
        "takeOnFails": true,
        "fullPage": true
    },
    "videoPath": "videos",
    "reporter": {
        "name": "jenkins",
        "output": "report.xml"
    },
    "appCommand": "node server.js"
}
```

The *Browser* array contains the list of browsers TestCafe will use to run our test. The [TestCafe browser syntax](https://devexpress.github.io/testcafe/documentation/guides/concepts/browsers.html#use-chromium-device-emulation) allows us to specify the mobile devices we want Chromium to emulate. 

The *name* property of the *reporter* object is set as *jenkins*, which ensures that the reports generated by TestCafe can be properly parsed by the server.

If you decide against using a config file, don't forget to [manually set](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html#-r-nameoutput---reporter-nameoutput) the report format when launching your tests, like so:

```bash
testcafe chrome test.js -r jenkins:report.xml
```

Otherwise, just run the following command:

```bash
npx testcafe
```

### Step 5. Configure the reporter

Turn on the [JUnit](https://plugins.jenkins.io/junit/) reporter plugin: add the "Publish JUnit test result report" *post-build action*. To display screenshots and videos alongside your test results, select the option "Include links to TestCafe artifacts" from the "Additional test report features" drop-down.

Important: Don't forget to check the "Retain long standard output/error" box. Otherwise the plugin will automatically truncate information concerning test screenshots and videos.

![JUnit reporter configuration screen](/testcafe/images/jenkins-plugin/junit-reporter-configuration.png)

### Step 6. Run the build

Save the changes to your project and press the "Build now" button on the project page:

![Jenkins Project menu with the Build Now Button highlighted](/testcafe/images/jenkins-plugin/build-now-button.png)

## Review the results

After the tests are completed, press the following link on the build page to view the results:

![Test results link](/testcafe/images/jenkins-plugin/test-results-link.png)

There you'll see links to screenshots and videos taken during the test.

![Test results view](/testcafe/images/jenkins-plugin/test-results-view.png)

These artifacts instantly indicate if the Cart button is present on the page.

## Jenkins Pipeline integration

If you don't want to use the Jenkins GUI to launch these tests, you can always make use of [Jenkins Pipeline](https://www.jenkins.io/doc/book/pipeline/). It lets you declaratively configure your CI/CD setup via a Jenkinsfile, a text file checked into the project's source control repository. Here's a sample Jenkinsfile to be used with TestCafe:

```java
pipeline {
    agent any

    stages {
        stage('Run E2E tests') {
            steps {
                sh 'npm install'
                sh 'npm run test-e2e'
            }
            post {
                always {
                          junit keepLongStdio: true,
                          testDataPublishers: [[$class: 'TestCafePublisher']],
                          testResults: '*.xml'
                }
            }
        }
    }
}
```

Note: The `test-e2e` npm script in this example is responsible for launching TestCafe. See the [TestCafe CLI](https://devexpress.github.io/testcafe/documentation/reference/command-line-interface.html) documentation for more information on the subject, and don't forget to manually set the reporter option as outlined earlier in this article.

--

If you enjoyed this guide, you might like our other articles on the subject of debugging: [How to Debug Tests in TestCafe: Quick Guide](https://devexpress.github.io/testcafe/media/team-blog/how-to-debug-tests-in-testcafe-quick-guide.html) and [How to speed up debugging in TestCafe: Tips and Tricks](https://devexpress.github.io/testcafe/media/team-blog/how-to-speed-up-debugging-in-testcafe-tips-and-tricks.html).
