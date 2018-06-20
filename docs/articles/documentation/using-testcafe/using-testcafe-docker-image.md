---
layout: docs
title: Using TestCafe Docker Image
permalink: /documentation/using-testcafe/using-testcafe-docker-image.html
---
# Using TestCafe Docker Image

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

    If you are running a Windows machine with Docker Toolbox, note that Docker containers can only access the `C:\Users` directory by default. If you need to run tests from other directories, share these directories as described in the [Docker documentation](https://docs.docker.com/toolbox/toolbox_install_windows/#optional-add-shared-directories).

    In modern Docker for Windows, you also need to share a drive to reach it from Docker containers. For more information, see [Docker for Windows documentation](https://docs.docker.com/docker-for-windows/#shared-drives).

* `-it testcafe/testcafe` - runs TestCafe in the interactive mode with the console enabled;
* `${TESTCAFE_ARGS}` - arguments passed to the `testcafe` command. You can use any arguments from the TestCafe [CLI](command-line-interface.md);

    `-it testcafe/testcafe 'chromium --no-sandbox,firefox' /tests/test.js`

    You can run tests in the Chromium and Firefox browsers preinstalled to the Docker image. Add the `--no-sandbox` flag to Chromium if the container is run in the unprivileged mode.

    Use the [remote browser](command-line-interface.md#remote-browsers) to run tests on a mobile device. To do this, you need to add the `-P` flag to the `docker run` command and specify the `remote` keyword as the browser name.

    `docker run -v //d/tests:/tests -P -it testcafe/testcafe remote /tests/test.js`

    You can pass a glob instead of the directory path in TestCafe parameters.

    `docker run -v //d/tests:/tests -it testcafe/testcafe firefox /tests/**/*.js`

    > If tests use other Node.js modules, these modules should be located in the tests directory or its child directories. TestCafe will not be able to find modules in the parent directories.

## Testing Heavy Websites

If you are testing a heavy website, you may need to allocate extra resources for the Docker image.

The most common case is when the temporary file storage `/dev/shm` runs out of free space. It usually happens when you run tests in Chromium. The following example shows how to allow additional space (1GB) for this storage using the `--shm-size` option.

```sh
docker run --shm-size=1g -v ${TEST_FOLDER}:/tests -it testcafe/testcafe ${TESTCAFE_ARGS}
```

You can find a complete list of options that manage runtime constraints on resources in the [Docker documentation](https://docs.docker.com/engine/reference/run/#runtime-constraints-on-resources).