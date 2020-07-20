import testRunTracker from '../../api/test-run-tracker';
import prerenderCallsite from '../../utils/prerender-callsite';

import { TestRunDispatcherProtocol } from './protocol';
import TestController from '../../api/test-controller';
import ObservedCallsitesStorage from '../../test-run/observed-callsites-storage';


class TestRunMock {
    public readonly id: string;
    public readonly controller: TestController;
    public readonly observedCallsites: ObservedCallsitesStorage;

    private readonly dispatcher: TestRunDispatcherProtocol;
    private readonly fixtureCtx: unknown;
    private readonly ctx: unknown;

    public constructor (dispatcher: TestRunDispatcherProtocol, id: string, fixtureCtx: unknown) {
        this.dispatcher = dispatcher;

        this.id = id;

        this.ctx        = Object.create(null);
        this.fixtureCtx = fixtureCtx;

        this.controller = new TestController();
        this.observedCallsites = new ObservedCallsitesStorage();

        testRunTracker.activeTestRuns[id] = this;
    }

    public async executeAction (apiMethodName: string, command: unknown, callsite: unknown): Promise<unknown> {
        if (callsite)
            callsite = prerenderCallsite(callsite);

        return await this.dispatcher.executeAction({ apiMethodName, command, callsite, id: this.id });
    }
}

export default TestRunMock;


