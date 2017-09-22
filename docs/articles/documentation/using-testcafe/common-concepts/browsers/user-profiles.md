---
layout: docs
title: User Profiles
permalink: /documentation/using-testcafe/common-concepts/browsers/user-profiles.html
---
# User Profiles

By default, TestCafe launches browsers with a clean profile, which means empty local storage, no extensions or bookmarks, etc. This was done to minimize the influence of profile intrinsics on test runs.

However, if you need to start a browser with the current user profile, you can do this by specifying the `:user-profile` browser flag.

```sh
testcafe firefox:user-profile tests/test.js
```

```js
runner
    .src('tests/fixture1.js')
    .browsers('firefox:user-profile')
    .run();
```