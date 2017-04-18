---
layout: docs
title: Installing TestCafe
permalink: /documentation/using-testcafe/installing-testcafe.html
checked: false
---
# Installing TestCafe

You can install TestCafe through `npm` globally or locally in your project.

* [Globally](#globally)
* [Locally](#locally)
* [Using TestCafe Docker Image](#using-testcafe-docker-image)

## Globally

```bash
npm install -g testcafe
```

After that, you can run TestCafe from a [command line](command-line-interface.md) by using the `testcafe` command.

```bash
testcafe chrome tests/
```

## Locally

The following command will install TestCafe into your project directory and save it on the dependencies list.

```bash
npm install --save-dev testcafe
```

The local installation is preferred for continuous integration scenarios or if you are going to use TestCafe from a Node.js application (see [Programming Interface](programming-interface/README.md)). This kind of installation has two advantages.

* It makes your project setup easier: running `npm install` in the project directory will automatically install TestCafe as well.
* Different projects can depend on different versions of TestCafe.

You can use the local version of TestCafe from a [command line](command-line-interface.md) as well. To run it, use one of the following ways.

* By using [npm scripts](https://docs.npmjs.com/misc/scripts).

    For example, you can add the `testcafe` command to the `scripts` section of the package.json file in the following way.

    ```js
    "scripts": { "test": "testcafe chrome tests/" }
    ```

    After that, you can run TestCafe by using the `npm test` command.

* If TestCafe is installed locally as well as globally, you can simply use the `testcafe` command. The local version will run automatically.

    ```bash
    testcafe chrome tests/
    ```

## Using TestCafe Docker Image

TestCafe provides a preconfigured Docker image with Chromium and Firefox installed.
Therefore, you can avoid manual installation of browsers and the testing framework on the server.

To learn how to install Docker to your system, see [Install Docker](https://docs.docker.com/engine/installation/).

After Docker is installed, download the TestCafe Docker image from the repository.

```sh
docker pull testcafe/testcafe
```

The command above installs a stable version of the image. If you need an alpha version, run the following command.

```sh
docker pull testcafe/testcafe:alpha
```

Now you can run TestCafe from the docker image.

```sh
docker run -v ${TEST_FOLDER}:/tests -it testcafe/testcafe ${TESTCAFE_ARGS}
```

This command takes the following parameters:

* `-v ${TEST_FOLDER}:/tests` - maps the `TEST_FOLDER` directory on the host machine to the `/tests` directory in the container. You can map any host directory to any container directory:

    `-v //c/Users/Username/tests:/tests`

    `-v //d/tests:/myTests`

* `-it testcafe/testcafe` - runs TestCafe in the interactive mode with the console enabled;
* `${TESTCAFE_ARGS}` - arguments passed to the `testcafe` command. You can use any arguments from the TestCafe [CLI](command-line-interface.md);

    `-it testcafe/testcafe 'chromium --no-sandbox,firefox' /tests/test.js`

    You can run tests in the Chromium and Firefox browsers preinstalled to the Docker image. Add the `--no-sandbox` flag to Chromium if the container is run in the unprivileged mode.

    Use the [remote browser](command-line-interface.md#remote-browsers) to run tests on a mobile device. To do this, you need to add the `-P` flag to the `docker run` command and specify the `remote` keyword as the browser name.

    `docker run -v //d/tests:/tests -P -it testcafe/testcafe remote /tests/test.js`

    You can pass a glob instead of the directory path in TestCafe parameters.

    `docker run -v //d/tests:/tests -it testcafe/testcafe firefox /tests/**/*.js`

    > If tests use other Node.js modules, these modules should be located in the tests directory or its child directories. TestCafe will not be able to find modules in the parent directories.