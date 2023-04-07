import { BaseRequestPipelineContext } from 'testcafe-hammerhead';

export default class NativeAutomationPipelineContext extends BaseRequestPipelineContext {
    public constructor (requestId: string) {
        super(requestId);
    }
}
