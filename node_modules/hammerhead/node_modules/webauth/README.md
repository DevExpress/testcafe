# webauth

The Node.js module implements the main mechanisms of web authentication.
At the moment webauth supports the following types of authentication:
  * NTLM (The implementation of this type uses code written by [SamDecrock](https://github.com/SamDecrock) ([node-http-ntlm](https://github.com/SamDecrock/node-http-ntlm))
  * Basic

## How to install

This project is a Node.js module that you can add to your application via the `npm` packet manager:

  `npm install webauth`

## How to use

To authenticate the request to the server, use the `auth` method:

`auth(reqOptions, credentials, callback, [isHttps=false], [res], [method])`

  * `reqOptions` - The request options object uses signature identical to the [Node.js http/https request options](http://nodejs.org/api/http.html#http_http_request_options_callback);
  * `credentials` - The object to which authentication parameters are passed:

  ````
  {
      username : 'Churkin.Andrey',  // required field 
      password : 'myPass$1',        // required field
      domain : 'CORP',              // is used in the NTLM auth
      workstation: 'CHURKIN-LINUX'  // is used in the NTLM auth
  }
  ````

  * `callback` - The function that will be called after the authentication;
  * `isHttps` - Set `true` to use https protocol (`false` by default);
  * `res` - An optional parameter that you need to pass to the method if you have already received a response from the server with the 401 error;
  * `method` - The authentication type to be used. Possible values are: `NTLM`, `Basic`. If this value is not specified, it will be automatically selected based on the following priorities:
      * NTLM
      * Basic

## Example

````
var webauth = require('webauth');

var reqOptions = {
		host: 'localhost',
		headers: {
			'accept-encoding' : 'gzip,deflate,sdch'
		}
	},
	credentials = {
		username: 'Churkin.Andrey',
		password: 'myPass$1',
		domain: 'CORP',
		workstation: 'CHURKIN-LINUX'
	};

webauth.auth(reqOptions, credentials, function(res) {
	console.log(res.statusCode);
});
````

