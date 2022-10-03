import { BaseRequestPipelineContext } from 'testcafe-hammerhead';

export default class ProxylessPipelineContext extends BaseRequestPipelineContext {
    public constructor (requestId: string) {
        super(requestId);
    }
}
