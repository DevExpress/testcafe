import { BaseRequestPipelineContext } from 'testcafe-hammerhead';
import { NativeAutomationRoleProvider } from '../../test-run/role-provider';

export default class NativeAutomationPipelineContext extends BaseRequestPipelineContext {
    public constructor (requestId: string) {
        super(requestId);
    }
}
