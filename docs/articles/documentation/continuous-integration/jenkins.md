---
layout: docs
title: Integrate TestCafe with Jenkins
permalink: /documentation/continuous-integration/jenkins.html
redirect_from:
  - /documentation/recipes/integrating-testcafe-with-ci-systems/jenkins.html
---
# Integrate TestCafe with Jenkins

TestCafe has an extensive command line interface that allows it to fit well in any popular continuous integration system.

This topic shows how you can integrate TestCafe tests into project build process in [Jenkins](https://jenkins.io/).

## Prerequisites - Install Node.js Plugin

1. Follow the [instructions from Jenkins documentation](https://jenkins.io/doc/book/managing/plugins/#installing-a-plugin) to install a [Node.js plugin](https://plugins.jenkins.io/nodejs).

2. Configure this plugin as described in the [Usage section](https://plugins.jenkins.io/nodejs#NodeJSPlugin-Usage) on the plugin page. Ensure that you have added a Node.js installation on the **Global Tool Configuration** page and checked the **Provide Node & npm bin/ folder to PATH** check box in your build configuration.

## Preparation - Enable Jenkins to Start Browsers

The default Jenkins configuration on macOS and Linux does not allow it to start browsers. Perform the following steps to enable this.

> Important! The Jenkins installer overwrites these changes during upgrade. To avoid repeating these steps, do not upgrade Jenkins with an installer. Instead, download `jenkins.war` and replace it manually.

### macOS

1. Stop Jenkins:

    ```sh
    launchctl unload /Library/LaunchDaemons/org.jenkins-ci.plist
    ```

2. Open the `org.jenkins-ci.plist` file in a text editor:

    ```sh
    sudo nano /Library/LaunchDaemons/org.jenkins-ci.plist
    ```

3. Find the `USER_NAME` option and change its value to the user name under whose account macOS is started:

    ```xml
    <key>USER_NAME</key>
    <string>peter.p</string>
    ```

4. Find the `JENKINS_HOME` key. It specifies the Jenkins home directory. Copy the directory content to a local user's home directory and specify the new path under the `JENKINS_HOME` key:

    ```xml
    <key>JENKINS_HOME</key>
    <string>/users/peter.p/jenkins/</string>
    ```

    Then close the file and save your changes.

5. Change the Jenkins temporary directory:

    ```sh
    sudo defaults write /Library/Preferences/org.jenkins-ci tmpdir "/tmp"
    ```

6. Change the `/var/log/jenkins` file ownership to your account:

    ```sh
    sudo chown peter.p /var/log/jenkins
    ```

7. Start Jenkins:

    ```sh
    launchctl load /Library/LaunchDaemons/org.jenkins-ci.plist
    ```

### Linux

1. Stop Jenkins:

    ```sh
    sudo systemctl stop jenkins.service
    ```

2. Open the `/etc/default/jenkins` file in a text editor:

    ```sh
    sudo nano /etc/default/jenkins
    ```

3. Specify your user name in the `JENKINS_USER` variable:

    ```text
    JENKINS_USER=peter.p
    ```

    Then close the file and save your changes.

4. Change the Jenkins directory ownership to your account:

    ```sh
    sudo chown peter.p /var/log/jenkins
    sudo chown peter.p /var/lib/jenkins
    sudo chown peter.p /var/run/jenkins
    sudo chown peter.p /var/cache/jenkins
    ```

5. Start Jenkins:

    ```sh
    sudo systemctl start jenkins.service
    ```

## Step 1 - Fetching Test Code From a Repository

In this tutorial, we will use tests published in a separate repository on GitHub - [ci-integration-demo](https://github.com/VasilyStrelyaev/ci-integration-demo). If you use a different version control system, search for a plugin that integrates it with Jenkins.

Open your project and choose **Configure** from the right pane.

![Click the Configure Button](../../images/jenkins/project-configure.png)

Scroll down to the **Source Code Management** section and select *Git*, then specify the **Repository URL**.

![Fetch Test Results](../../images/jenkins/check-out-tests.png)

## Step 2 - Adding a Command to Install TestCafe

Go to the **Build** section, find a step that builds you application and add a new step right after it. To do this, click **Add build step** and select a step type that runs a shell command.

![Add a Batch Command](../../images/jenkins/add-batch-command.png)

In the **Command** box, type the following.

```sh
npm install testcafe testcafe-reporter-xunit
```

This command installs the main `testcafe` module and a plugin that saves test run reports in the xUnit format.

![npm install Command](../../images/jenkins/npm-install-command.png)

## Step 3 - Adding a Command to Run TestCafe

Add another step that executes a shell command after the previous one. This step will run TestCafe.

Type the following command.

```sh
node_modules/.bin/testcafe chrome tests/**/* -r xunit:res.xml
```

This runs TestCafe tests from the `tests` directory in Google Chrome. Test results are saved to the `res.xml` file in the xUnit format.

![Run Tests Command](../../images/jenkins/run-tests-command.png)

### Linux

```sh
export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start
sleep 3
fluxbox >/dev/null 2>&1 &
```

```sh
export DISPLAY=:1
```

## Step 4 - Publishing Test Run Reports

Go to the **Post-build Actions** section and click **Add post-build action**. In the drop-down list, select **Publish JUnit test result report**.

![Adding a Post-Build Action](../../images/jenkins/add-post-build-action.png)

In the **Test report XMLs** field, specify the test report file: `res.xml`.

![Publishing Test Report](../../images/jenkins/publish-test-report.png)

## Step 5 - Run the Test

Click **Save** and you will be navigated to the Project page.

Hit **Build Now** to build the project immediately.

![Click the Build Now Button](../../images/jenkins/project-build-now.png)

## Step 6 - View Test Results

In the **Build History** section of the **Project** page, click a build and select **Test Results** from the drop-down menu.

![Build History](../../images/jenkins/build-history.png)

Jenkins will display a test run report where you can see general information about testing results. You can click individual tests for details.

![View Test Results](../../images/jenkins/test-results.png)
