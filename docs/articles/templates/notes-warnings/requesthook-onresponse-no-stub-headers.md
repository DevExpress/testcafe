> Important! You can not change response body or its headers inside a `RequestHook.onResponse()` call. If you edit properties of `event.headers` or `event.body` inside `onResponse()`, TestCafe ignores these changes.
>
> Learn how to Change or Delete Response Headers in [Change or Delete Response Headers]({{ include.href }}).