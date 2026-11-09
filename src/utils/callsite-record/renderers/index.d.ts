// Type definitions for callsite-record v4.0.0
// Project: https://github.com/inikulin/callsite-record
// Definitions by: Alvis HT Tang <https://github.com/alvis>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

import { Chalk } from 'chalk';
import { identity } from 'lodash';

export interface RendererWithoutSyntax {
  codeFrame: typeof identity;

  codeLine: (num: number, base: string, src: string, isLast: boolean) => string;

  stackLine: (name: string, location: string, isLast: boolean) => string;

  stack: (stack: string) => string;
}

export interface RendererWithSyntax extends RendererWithoutSyntax {
  syntax: {
    string: Chalk;
    punctuator: Chalk;
    keyword: Chalk;
    number: Chalk;
    regex: Chalk;
    comment: Chalk;
    invalid: Chalk;
  };
}

export type Renderer = RendererWithoutSyntax | RendererWithSyntax;

export interface Renderers {
  default: RendererWithSyntax;
  html: RendererWithSyntax;
  noColor: RendererWithoutSyntax;
}
