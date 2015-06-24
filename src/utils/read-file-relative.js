import path from 'path';
import fs from 'fs';
import callSite from 'callsite';

export default function (relativePath, binary = false) {
    var caller     = callSite()[1];
    var callerPath = caller.getFileName();
    var basePath   = path.dirname(callerPath);
    var filePath   = path.join(basePath, relativePath);
    var content    = fs.readFileSync(filePath);

    return binary ? content : content.toString();
}