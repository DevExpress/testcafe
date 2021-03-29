> Important! You can not change response body or its headers inside a `RequestHook.onResponse()` call. If you edit properties of `event.headers` or `event.body` inside `onResponse()`, TestCafe ignores these changes.
>
> Learn how to stub response headers in [Stub Response Headers]({{ include.href }}).