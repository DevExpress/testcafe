Specify the Node.js module's name to inject its content into the tested pages. Use an object with the `module` property.

{{ include.syntax }}

Argument  | Type   | Description
--------- | ------ | ----------------
`moduleName`  | String | The module name.

> You cannot combine the `module`, [path](#inject-a-javascript-file) and [content](#inject-script-code) properties in a single object. To inject multiple items, pass several arguments or an array.

TestCafe uses Node.js mechanisms to search for the module's entry point and injects its content into the tested page.

Note that the browser must be able to execute the injected module. For example, modules that implement the [UMD](https://github.com/umdjs/umd) API can run in most modern browsers.

> If the injected module has dependencies, ensure that the dependencies can be loaded as global variables and these variables are initialized in the page's code.
