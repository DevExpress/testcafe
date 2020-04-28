Specify the JavaScript file path to inject the content of this file into the tested pages. You can pass a string or object with the `path` property.

{{ include.syntax }}

Argument   | Type   | Description
---------- | ------ | ---------------------------------------------------------------------------
`filePath` | String | The path to the JavaScript file whose content should be injected.

> You cannot combine the `path`, [module](#inject-a-module) and [content](#inject-script-code) properties in a single object. To inject multiple items, pass several arguments or an array.

{% if include.relativePaths == 'cwd' %}
Relative paths are resolved against the *current working directory*.
{% elsif include.relativePaths == 'local' %}
Relative paths are resolved against the *test file location*.
{% endif %}