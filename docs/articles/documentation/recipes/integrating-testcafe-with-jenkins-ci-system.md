---
layout: docs
title: Integrating TestCafe with Jenkins CI System
permalink: /documentation/recipes/integrating-testcafe-with-jenkins-ci-system.html
---
# Integrating TestCafe with Jenkins CI System

TestCafe has an extensive command line interface that allows it to fit well in any popular continuous integration system.

This topic shows how you can integrate TestCafe tests into project build process in Jenkins.

## Step 1 - Adding a Command to Install TestCafe

Open your project and choose **Configure** from the right pane.

![Click the Configure Button](../../images/jenkins/project-configure.png)

Go to the **Build** section, find a step that builds you application and add a new step right after it. To do this, click **Add build step** and select a step type that runs a shell command.

![Add a Batch Command](../../images/jenkins/add-batch-command.png)

In the **Command** box, type the following.

```sh
npm install testcafe
```

![npm install Command](../../images/jenkins/npm-install-command.png)

## Step 2 - Adding a Command to Run TestCafe

Add another step that executes a shell command after the previous one. This step will run TestCafe.

Type the following command.

```sh
node_modules/.bin/testcafe chrome tests/**/* -r xunit:res.xml
```

This runs TestCafe tests from the `tests` directory in Google Chrome. Test results are saved to the `res.xml` file in the xUnit format.

![Run Tests Command](../../images/jenkins/run-tests-command.png)

## Step 3 - Publishing Test Run Reports

Go to the **Post-build Actions** section and click **Add post-build action**. In the drop-down list, select **Publish JUnit test result report**.

![Adding a Post-Build Action](../../images/jenkins/add-post-build-action.png)

In the **Test report XMLs** field, specify the test report file: `res.xml`.

![Publishing Test Report](../../images/jenkins/publish-test-report.png)

## Step 4 - Run the Test

Click **Save** and you will be navigated to the Project page.

Hit **Build Now** to build the project immediately.

![Click the Build Now Button](../../images/jenkins/project-build-now.png)
