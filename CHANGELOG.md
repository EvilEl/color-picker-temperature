# Changelog

## Unreleased

- Correct initial color positioning, retain pixel coordinates when colors repeat, and sample both gradient endpoints correctly.
- Select the nearest available RGB and reject malformed RGB or unsupported temperature ranges before mounting.
- Refresh geometry during input and redraw when dimensions change, including hidden-to-visible transitions.
- Handle pointer capture, cancellation and loss of focus; release event listeners, resize observation, animation frames, DOM and styles on destruction.
- Preserve bound public methods and provide compatibility adapters for `BuildCanvas` and `Controllers`.
- Make `deleteLink()` a deprecated full-cleanup alias; low-level `BuildCanvas` consumers should call `destroy()` before removing their DOM.
- Correct ESM imports and package entry points; add clean builds, regression tests, browser checks and isolated consumer validation.
