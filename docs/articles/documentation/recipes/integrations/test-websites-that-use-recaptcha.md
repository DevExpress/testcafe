---
layout: docs
title: Test Websites That Use reCAPTCHA
permalink: /documentation/recipes/integrations/test-websites-that-use-recaptcha.html
---
# Test Websites That Use reCAPTCHA

TestCafe does not implement mechanisms that circumvent CAPTCHA challenges. However, many CAPTCHA providers allow you to disable or simulate the verification in test environments.

This topic describes how to configure reCAPTCHA for TestCafe tests.

## reCAPTCHA v3

Create a separate key for testing environments in the [reCAPTCHA admin console](https://www.google.com/recaptcha/admin/create). Then follow the instructions on the page to use this key when you build the site for testing.

> Scores may not be accurate in testing environments as reCAPTCHA v3 relies on real traffic.

Alternatively, you can change the `score` threshold or disable the reCAPTCHA check in your development build.

## reCAPTCHA v2

Use the following test keys that generate the `No CAPTCHA` response and pass all verification requests:

**Site key**: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`  
**Secret key**: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

With these keys, the reCAPTCHA widget shows a warning message that indicates reCAPTCHA is not used for production traffic.
