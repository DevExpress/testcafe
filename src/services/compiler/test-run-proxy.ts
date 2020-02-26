import testRunTracker from '../../api/test-run-tracker';
import prerenderCallsite from '../../utils/prerender-callsite';

import { TestRunDispatcherProtocol } from './protocol';


class TestRunMock {
    public readonly id: string;

    private readonly dispatcher: TestRunDispatcherProtocol;
    private readonly fixtureCtx: unknown;
    private readonly ctx: unknown;

    public constructor (dispatcher: TestRunDispatcherProtocol, id: string, fixtureCtx: unknown) {
        this.dispatcher = dispatcher;

        this.id = id;

        this.ctx        = Object.create(null);
        this.fixtureCtx = fixtureCtx;

        testRunTracker.activeTestRuns[id] = this;
    }

    public async executeAction (apiMethodName: string, command: unknown, callsite: unknown): Promise<unknown> {
        if (callsite)
            callsite = prerenderCallsite(callsite);

        return await this.dispatcher.executeAction({ apiMethodName, command, callsite, id: this.id });
    }
}

export default TestRunMock;


