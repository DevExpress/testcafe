---
layout: docs
title: Use Angular CLI Builder
permalink: /documentation/recipes/integrations/use-angular-cli-builder.html
redirect_from:
  - /documentation/recipes/use-angular-cli-builder.html
---
# Use Angular CLI Builder

The [angular-testcafe](https://github.com/politie/angular-testcafe) builder allows you to integrate TestCafe into the Angular build process. This builder serves your Angular application, and runs TestCafe tests as soon as it is ready.

> Important! The `angular-testcafe-builder` module requires Angular v7 or newer.

## Install the Builder

Install [angular-testcafe-builder](https://github.com/politie/angular-testcafe) from `npm`:

```sh
npm install --save-dev @politie/angular-testcafe-builder
```

## Configure a Target in the Angular Workspace

Open `angular.json` and configure the `e2e` *Architect target* to run TestCafe tests.

To do this, specify the `@politie/angular-testcafe-builder:testcafe` command in the `builder` property and provide TestCafe arguments in the `options` property:

```json
{
  "projects": {
    "my-project": {
      "architect": {
        "e2e": {
          "builder": "@politie/angular-testcafe-builder:testcafe",
          "options": {
            "browsers": ["chrome"],
            "src": "e2e/*.e2e-spec.ts"
          }
        }
      }
    }
  }
}
```

See the [builder configuration schema](https://github.com/politie/angular-testcafe/blob/master/src/testcafe/schema.json) for the list of supported TestCafe options.

## Run the Build

Use `npm run` to run the build:

```sh
npm run build
```

## Builder Documentation

See the `angular-testcafe-builder` [README](https://github.com/politie/angular-testcafe/blob/master/README.md) for more information.

## Configuration Example

The following example shows the `angular.json` workspace configuration file with a TestCafe testing task:

```json
{
  "projects": {
    "my-project": {
      "architect": {
        "e2e": {
          "builder": "@politie/angular-testcafe-builder:testcafe",
          "options": {
            "browsers": [
              "chrome",
              "firefox"
            ],
            "src": "e2e/*.e2e-spec.ts",
            "reporters": [
              {
                "name": "json",
                "output": "reports/report.json"
              },
              {
                "name": "spec"
              }
            ],
            "concurrency": 4,
            "screenshotsPath": "artifacts/screenshots",
            "selectorTimeout": 10000,
            "quarantineMode": true,
            "stopOnFirstFail": true,
            "host": "localhost",
            "port": "4200"
          }
        }
      }
    }
  }
}
```
