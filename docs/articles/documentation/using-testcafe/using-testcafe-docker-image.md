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
* `${TESTCAFE_ARGS}` - arguments passed to the `testcafe` command. You can use any arguments from the TestCafe [command line interface](command-line-interface.md);

    `-it testcafe/testcafe 'chromium --no-sandbox,firefox' /tests/test.js`

    You can run tests in the Chromium and Firefox browsers preinstalled to the Docker image. Add the `--no-sandbox` flag to Chromium if the container is run in the unprivileged mode.

    You can pass a glob instead of the directory path in TestCafe parameters.

    `docker run -v //d/tests:/tests -it testcafe/testcafe firefox /tests/**/*.js`

    > If tests use other Node.js modules, these modules should be located in the tests directory or its child directories. TestCafe will not be able to find modules in the parent directories.

## Test on the Host Machine

To run tests in host machine browsers, connect them as [remote browsers](command-line-interface.md#remote-browsers). Do the following:

* pass the `--net=host` parameter to specify that the container should use the `host` network;
* specify the `remote` keyword as the browser name.

```sh
docker run --net=host -v /d/tests:/tests -it testcafe/testcafe remote /tests/test.js
```

Note that the `--net=host` option can weaken container security. If this is important for you, you can follow the instruction in the [Test on Remote Devices](#test-on-remote-devices) section instead. In this case, specify `localhost` as the hostname and omit the `--add-host` parameter.

## Test on Remote Devices

Add the following options to the `docker run` command to run tests on a remote desktop or mobile device:

* map the `1337` and `1338` container ports to the corresponding host ports with the `-p` flag;
* use the [--hostname](command-line-interface.md#--hostname-name) TestCafe flag to specify the host machine name;
* pass the `--add-host` parameter to map the host machine name to the container's localhost IP;
* specify the `remote` keyword as the browser name. See [Remote Browsers](command-line-interface.md#remote-browsers).

The example below shows a command that runs tests in a remote browser.

```sh
docker run --add-host=${EXTERNAL_HOSTNAME}:127.0.0.1 -p 1337:1337 -p 1338:1338 -v /d/tests:/tests -it testcafe/testcafe --hostname ${EXTERNAL_HOSTNAME} remote /tests/test.js
```

where `${EXTERNAL_HOSTNAME}` is the host machine name visible to the remote device.

If Docker reports that the default ports `1337` and `1338` are occupied by some other process, kill this process or choose different ports. Use the `netstat` command to determine which process occupies the default ports.

OS      | Command
------- | ---------
Windows | `netstat -ano`
macOS   | `netstat -anv`
Linux   | `netstat -anp`

If you choose to use different ports, publish them in the Docker container (use the `-p` flag) and specify them to TestCafe (use the [--ports](command-line-interface.md#--ports-port1port2) option).

```sh
docker run --add-host=${EXTERNAL_HOSTNAME}:127.0.0.1 -p ${PORT1}:${PORT1} -p ${PORT2}:${PORT2} -v /d/tests:/tests -it testcafe/testcafe --hostname ${EXTERNAL_HOSTNAME} --ports ${PORT1},${PORT2} remote /tests/test.js
```

where `${PORT1}` and `${PORT2}` are vacant container's ports, `${EXTERNAL_HOSTNAME}` is the host machine name.

## Testing Heavy Websites

If you are testing a heavy website, you may need to allocate extra resources for the Docker image.

The most common case is when the temporary file storage `/dev/shm` runs out of free space. The following example shows how to allow additional space (1GB) for this storage using the `--shm-size` option.

```sh
docker run --shm-size=1g -v /d/tests:/tests -it testcafe/testcafe firefox /tests/test.js
```

You can find a complete list of options that manage runtime constraints on resources in the [Docker documentation](https://docs.docker.com/engine/reference/run/#runtime-constraints-on-resources).