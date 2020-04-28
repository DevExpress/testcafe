---
layout: docs
title: Extending TestCafe
permalink: /documentation/guides/extend-testcafe/install-plugins.html
redirect_from:
  - /documentation/extending-testcafe/
---
# Install Plugins

The TestCafe functionality can be extended by using plugins and extensions.
You can install existing plugins or develop custom ones that will suit your needs.

You can install plugins from npm in two ways:

* **locally** - if you are going to use plugins within TestCafe installed locally.

    Navigate to your project directory and run the following command.

    ```bash
    npm install --save-dev {pluginName}
    ```

* **globally** - if the TestCafe module is installed globally or you are going to use plugins within other projects as well.

    Run the `npm install` command with a `-g` flag.

    ```bash
    npm install -g {pluginName}
    ```

## Create Plugins

The following topics provide detailed information on creating the most widely used plugins and extensions.

* [Reporter Plugin](reporter-plugin.md)
* [Browser Provider Plugin](browser-provider-plugin.md)