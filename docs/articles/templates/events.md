You can use `t.dispatchEvent` to trigger a{% if include.name == 'InputEvent'%}n{%endif%} [{{ include.name }}](https://developer.mozilla.org/en-US/docs/Web/API/{{include.name}})

When you dispatch a {{include.name}}, TestCafe passes the `options` properties to the [{{ include.name }} Constructor](https://developer.mozilla.org/en-US/docs/Web/API/{{include.name}}/{{include.name}}).

{{include.name}} Constructor supports the following `options` properties:

* [Event Interface Properties](https://developer.mozilla.org/en-US/docs/Web/API/Event#properties)
* [UIEvent Interface Properties](https://developer.mozilla.org/en-US/docs/Web/API/UIEvent#properties)
* [{{ include.name }} Interface Properties](https://developer.mozilla.org/en-US/docs/Web/API/{{include.name}}#properties)
