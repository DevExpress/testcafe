---
layout: docs
title: Use TestCafe Docker Image
permalink: /documentation/guides/advanced-guides/use-testcafe-docker-image.html
redirect_from:
  - /documentation/using-testcafe/using-testcafe-docker-image.html
---
# Use TestCafe Docker Image

TestCafe provides a preconfigured Docker image with Chromium and Firefox installed.
Therefore, you can avoid manual installation of browsers and the testing framework on the server.

* [Install Docker and Download TestCafe Image](#install-docker-and-download-testcafe-image)
* [Test in Docker Containers](#test-in-docker-containers)
* [Test on the Host Machine](#test-on-the-host-machine)
* [Test on Remote Devices](#test-on-remote-devices)
* [Proxy Settings](#proxy-settings)
* [Troubleshooting](#troubleshooting)

## Install Docker and Download TestCafe Image

To learn how to install Docker on your system, see [Install Docker](https://docs.docker.com/engine/installation/).

After Docker is installed, download the TestCafe Docker image from the repository.

```sh
docker pull testcafe/testcafe
```

The command above installs a stable version of the image. If you need an alpha version, run the following command.

```sh
docker pull testcafe/testcafe:alpha
```

## Test in Docker Containers

Use the `docker run` command to run TestCafe in the Docker container:

```sh
docker run -v ${TEST_FOLDER}:/tests -it testcafe/testcafe ${TESTCAFE_ARGS}
```

This command takes the following parameters:

* `-v ${TEST_FOLDER}:/tests` - maps the `TEST_FOLDER` directory on the host machine to the `/tests` directory in the container. You can map any host directory to any container directory:

    ```sh
    -v //c/Users/Username/tests:/tests
    ```

    ```sh
    -v //d/tests:/myTests
    ```

    Files referenced in tests (page models, utilities, Node.js modules) should be located in the mapped host directory or its subdirectories. Otherwise, they could not be accessed from the container.

    If you are running a Windows machine with Docker Toolbox, note that Docker containers can only access the `C:\Users` directory by default. If you need to run tests from other directories, share these directories as described in the [Docker documentation](https://docs.docker.com/toolbox/toolbox_install_windows/#optional-add-shared-directories).

    In modern Docker for Windows, you also need to share a drive to reach it from Docker containers. For more information, see [Docker for Windows documentation](https://docs.docker.com/docker-for-windows/#file-sharing).

* `-it testcafe/testcafe` - runs TestCafe in the interactive mode with the console enabled;
* `${TESTCAFE_ARGS}` - arguments passed to the `testcafe` command. You can use any arguments from the TestCafe [command line interface](../../reference/command-line-interface.md);

    ```sh
    -it testcafe/testcafe chromium,firefox /tests/test.js
    ```

    You can pass a glob instead of the directory path in TestCafe parameters.

    ```sh
    docker run -v //d/tests:/tests -it testcafe/testcafe firefox /tests/**/*.js
    ```

    > If tests use other Node.js modules, these modules should be located in the tests directory or its child directories. TestCafe will not be able to find modules in the parent directories.

## Test on the Host Machine

To run tests in host machine browsers, connect them as [remote browsers](../../reference/command-line-interface.md#remote-browsers). Do the following:

* pass the `--net=host` parameter to specify that the container should use the `host` network;
* specify the `remote` keyword as the browser name.

```sh
docker run --net=host -v /d/tests:/tests -it testcafe/testcafe remote /tests/test.js
```

Note that the `--net=host` option can weaken container security. If this is important for you, you can follow the instruction in the [Test on Remote Devices](#test-on-remote-devices) section instead. In this case, specify `localhost` as the hostname and omit the `--add-host` parameter.

## Test on Remote Devices

Add the following options to the `docker run` command to run tests on a remote desktop or mobile device:

* map the `1337` and `1338` container ports to the corresponding host ports with the `-p` flag;
* use the [--hostname](../../reference/command-line-interface.md#--hostname-name) TestCafe flag to specify the host machine name;
* pass the `--add-host` parameter to map the host machine name to the container's localhost IP;
* specify the `remote` keyword as the browser name. See [Remote Browsers](../../reference/command-line-interface.md#remote-browsers).

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

If you choose to use different ports, publish them in the Docker container (use the `-p` flag) and specify them to TestCafe (use the [--ports](../../reference/command-line-interface.md#--ports-port1port2) option).

```sh
docker run --add-host=${EXTERNAL_HOSTNAME}:127.0.0.1 -p ${PORT1}:${PORT1} -p ${PORT2}:${PORT2} -v /d/tests:/tests -it testcafe/testcafe --hostname ${EXTERNAL_HOSTNAME} --ports ${PORT1},${PORT2} remote /tests/test.js
```

where `${PORT1}` and `${PORT2}` are vacant container's ports, `${EXTERNAL_HOSTNAME}` is the host machine name.

## Proxy Settings

Use the TestCafe [--proxy](../../reference/command-line-interface.md#--proxy-host) and [--proxy-bypass](../../reference/command-line-interface.md#--proxy-bypass-rules) options to configure proxy settings.

```sh
docker run -v /d/tests:/tests -it testcafe/testcafe remote /tests/test.js --proxy proxy.mycorp.com
```

> TestCafe ignores the [container's proxy settings](https://docs.docker.com/network/proxy/) specified in the Docker configuration file (`httpProxy`, `httpsProxy` and `noProxy`) or the environment variables (`HTTP_PROXY`, `HTTPS_PROXY` and `NO_PROXY`).

## Troubleshooting

### 'Unable to establish one or more of the specified browser connections' error when running Chrome/Chromium in a CI system

Chromium cannot run in an unprivileged container without the `--no-sandbox` flag. TestCafe automatically detects if Chromium runs in Docker and adds `--no-sandbox`. Additionally, TestCafe specifies the `--disable-dev-shm-usage` flag to prevent the `/dev/shm` storage overflow.

However, some CI systems' configurations interfere with this detection logic, so that it fails to identify Docker and does not add the flags. In this instance, TestCafe throws the **Unable to establish one or more of the specified browser connections** error. If you see this error, try to add the flags in the `docker run` command:

```sh
docker run -v /d/tests:/tests -it testcafe/testcafe 'chrome --no-sandbox --disable-dev-shm-usage' /tests/test.js
```
