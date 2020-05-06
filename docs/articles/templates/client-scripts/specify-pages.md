You can also specify pages into which a script should be injected. This will allow you to mock browser API on specified pages and use the default behavior everywhere else.

To specify target pages for a script, add the `page` property to the object you pass to `clientScripts`.

{{ include.syntax }}

Property  | Type                | Description
--------- | ------------------- | ---------------------------------------------------------------------------
`url`    | String{% if include.regexp %} &#124; RegExp{% endif %} | Specify a page URL to add scripts to a page{% if include.regexp %}, or a regular expression to add scripts to pages whose URLs match this expression{% endif %}.

> If the target page redirects to a different URL, ensure that the `page` property matches the destination URL. Otherwise, scripts are not injected.
