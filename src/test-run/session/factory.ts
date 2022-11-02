import SessionController from './';
import { ProxylessSessionController } from '../../proxyless/session-controller';

export default class SessionControllerFactory {
    static create (uploadRoots: string[], options: Partial<SessionOptions>): SessionController {
        return options.proxyless ? new ProxylessSessionController(uploadRoots, options) : new SessionController(uploadRoots, options);
    }
}
