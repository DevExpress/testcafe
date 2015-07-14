exports.auth = function(credentials, bodyChunks, callback, reqOptions, protocolInterface) {
	var authReqStr = credentials.username + ':' + credentials.password,
		authReqHeader = 'Basic ' + new Buffer(authReqStr).toString('base64');

	reqOptions.headers['Authorization'] = authReqHeader;
	
	var req = protocolInterface.request(reqOptions, function(res) {
		callback(res);
	});

    if(bodyChunks) {
        bodyChunks.forEach(function (chunk) {
            req.write(chunk);
        });
    }

    req.end();
};
