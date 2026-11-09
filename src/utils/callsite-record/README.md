# Callsite record

This directory incorporates the implementation and type declarations from
[DevExpress/callsite-record v4.1.7](https://github.com/DevExpress/callsite-record/tree/v4.1.7),
commit `f746091a7cafec7e4c4f92aef9a03d196c0b362b`. This commit also matches the
published `@devexpress/callsite-record@4.1.7` package's `gitHead`.

The original MIT license and attribution are preserved in `LICENSE`, which is
copied into `lib/utils/callsite-record` for distribution. Formatting is adapted
to TestCafe's lint rules; the CommonJS API and rendering behavior are preserved.
The accompanying declarations describe the same type-only `CallsiteRecord`
export as the original package.

Runtime dependencies are declared directly in TestCafe's `package.json`.
The example lockfiles describe published TestCafe releases, not this local
implementation, and retain those releases' original dependency graphs.
