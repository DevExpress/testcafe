---
layout: docs
title: Integrating TestCafe with AppVeyor
permalink: /documentation/recipes/integrating-testcafe-with-appveyor.html
---
# Integrating TestCafe with AppVeyor

This topic describes how to integrate TestCafe tests into an AppVeyor project's build process.

## Step 1 - Create an AppVeyor Project

If you are using AppVeyor for the first time, you will begin with an empty account without any projects.

To create a project, click **NEW PROJECT**.

![Creating a new project](../../images/appveyor/new-project.png)

AppVeyor will ask you to specify a repository to create a project for. In this tutorial, we will use a GitHub repository, so click **GitHub** and authorize.

You will see a list of repositories associated with your account. Find the project you need to test and click **ADD**.

![Adding a GitHub project](../../images/appveyor/add-project.png)

A new AppVeyor project is created.

## Step 2 - Specify the Commands to Run Tests

On the new project's page, open the **SETTINGS** menu.

![Open the Settings Menu](../../images/appveyor/open-settings.png)

If you are starting from a fresh project that has nothing to build yet, go to the **Build** settings category and disable building by pushing **OFF**.

![Disable building](../../images/appveyor/disable-build.png)

Click **Save**.

Now configure AppVeyor to install TestCafe before running tests.

To this end, go to the **Environment** settings category and find the **Install script** section. Select PowerShell (**PS**) and enter a command that installs TestCafe - `npm install -g testcafe`.

![Install TestCafe](../../images/appveyor/add-install-script.png)

Click **Save**.

Next, specify how tests should be triggered. Go to the **Tests** category and choose to use a custom script to run tests.

![Choose to use a script to run tests](../../images/appveyor/choose-to-use-script.png)

Select **PS** as a shell type and enter a command to run tests.

```sh
testcafe chrome:headless tests/**/*
```

This command starts tests from the `tests` directory in the headless Chrome.

![Enter test run commands](../../images/appveyor/enter-commands.png)

## Step 3 - Trigger the build

Return to the project page and click **NEW BUILD** to trigger the AppVeyor build.

![Start a new build](../../images/appveyor/trigger-build.png)