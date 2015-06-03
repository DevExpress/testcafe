import serviceCmd from './../shared/service_msg_cmd';
import Cookies from './cookies';
import { parseProxyUrl } from './url_util';

// Global instance counter used to generate ID's
var instanceCount = 0;


// Session
export default class Session {
    constructor () {
        this.id      = ++instanceCount;
        this.cookies = new Cookies();
        this.proxy   = null;
    }

    async handleServiceMessage (msg) {
        if (this[msg.cmd])
            return await this[msg.cmd](msg);

        else
            throw new Error('Malformed service message or message handler is not implemented');
    }
}


// Service message handlers
var ServiceMessages = Isolate.prototype;

ServiceMessages[serviceCmd.SET_COOKIE] = function (msg) {
    var parsedUrl = parseProxyUrl(msg.url);
    var cookieUrl = parsedUrl ? parsedUrl.dest.url : msg.url;

    this.cookies.setByClient(originUrl, msg.cookie);

    return this.cookies.getClientString(cookieUrl);
};



