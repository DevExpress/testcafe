You can pass an object with the `content` property to provide the injected script as a string.

{{ include.syntax }}

Argument  | Type   | Description
--------- | ------ | ----------------------------------------
`code` | String | JavaScript that should be injected.

> You cannot combine the `content`, [path](#inject-a-javascript-file) and [module](#inject-a-module) properties in a single object. To inject multiple items, pass several arguments or an array.