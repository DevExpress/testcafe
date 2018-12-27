---
layout: docs
title: User Profiles
permalink: /documentation/using-testcafe/common-concepts/browsers/user-profiles.html
---
# User Profiles

By default, TestCafe launches browsers (Google Chrome and Mozilla Firefox so far) with a clean profile, i.e. without extensions, bookmarks and other profile settings. This was done to minimize the influence of profile parameters on test runs.

However, if you need to start a browser with the current user profile, you can do this by specifying the `:userProfile` flag after the [browser alias](browser-support.md#locally-installed-browsers).

```sh
testcafe firefox:userProfile tests/test.js
```

```js
runner
    .src('tests/fixture1.js')
    .browsers('firefox:userProfile')
    .run();
```

When you pass the `:userProfile` flag to a portable browser, also use the [browser alias](browser-support.md#locally-installed-browsers). The `path:` prefix does not work in this case.

```sh
testcafe chrome:d:\chrome_portable\chrome.exe:userProfile tests/test.js
```