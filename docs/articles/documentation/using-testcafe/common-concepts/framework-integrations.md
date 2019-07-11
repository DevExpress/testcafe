---
layout: docs
title: Framework Integrations
permalink: /documentation/using-testcafe/common-concepts/framework-integrations.html
---
# Framework Integrations

Testcafe can be integrated in below frameworks, based on third party packages:

* [Angular CLI](#angular-cli-integration)

## Angular CLI integration

A custom Angular builder can be used to serve your Angular application (>= v7), and then run the TestCafe tests.

## Install

```bash
npm install --save-dev @politie/angular-testcafe-builder
```

## Use in angular.json

```json
{
  "projects": {
    "my-project-e2e": {
      "architect": {
        "e2e": {
          "builder": "@politie/angular-testcafe-builder:testcafe",
          "options": {
            "browsers": [
              "chrome --no-sandbox",
              "firefox"
            ],
            "src": "e2e/*.e2e-spec.ts",
            "host": "localhost",
            "port": "4200",
            "reporters": [
              {
                "name": "html",
                "output": "path/to/my/report.html"
              },
              {
                "name": "spec"
              }
            ]
          }
        }
      }
    }
  }
}
```

For more info, see [Github](https://github.com/politie/angular-testcafe/blob/master/README.md)
