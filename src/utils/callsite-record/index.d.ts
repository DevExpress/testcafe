// Type definitions for callsite-record v4.0.0
// Project: https://github.com/inikulin/callsite-record
// Definitions by: Alvis HT Tang <https://github.com/alvis>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

import { Renderer, Renderers } from './renderers';
import 'error-stack-parser';

declare namespace createCallsiteRecord {
  const renderers: Renderers;

  type StackFrame = StackFrame.StackFrameOptions;
  type isCallSiteFrame = (stackFrame: StackFrame) => boolean;
  type processFrameFn = (stackFrame: StackFrame) => StackFrame;
  type stackFilter = (
    stackFrame: StackFrame,
    idx: number,
    isV8StackFrame: boolean
  ) => boolean;

  interface RenderOptions {
    codeFrame?: boolean;
    frameSize?: number;
    renderer?: Renderer;
    stack?: boolean;
    stackFilter?: stackFilter;
  }

  class CallsiteRecord {
      public static fromError(
      error: Error,
      isCallsiteFrame: isCallSiteFrame,
      processFrameFn: processFrameFn
    ): CallsiteRecord | null;

      public static fromStackFrames(
      stackFrames: StackFrame[],
      fnName: string,
      typeName: string,
      processFrameFn: processFrameFn
    ): CallsiteRecord | null;

      public render(options: RenderOptions): Promise<string>;
      public renderSync(options: RenderOptions): string;
  }

  interface CreateCallsiteRecordOptions {
    forError: Error;
    isCallsiteFrame?: isCallSiteFrame;
    byFunctionName: string;
    typeName?: string;
    processFrameFn?: processFrameFn;
  }
}

declare function createCallsiteRecord(
  options:
    | Pick<
        createCallsiteRecord.CreateCallsiteRecordOptions,
        'forError' | 'isCallsiteFrame' | 'processFrameFn'
      >
    | Pick<
        createCallsiteRecord.CreateCallsiteRecordOptions,
        'byFunctionName' | 'typeName' | 'processFrameFn'
      >
): createCallsiteRecord.CallsiteRecord | null;

export = createCallsiteRecord;
