# Semantic UI Evolution Protocol Core

This repository currently contains the first executable core specification for the Semantic UI Evolution Platform:

- `protocol/design-protocol.json` is the Design Protocol source of truth.
- `protocol/transform-contracts.json` contains semantic transform contracts.
- `protocol/uikit-bindings.json` maps semantic widgets and layout regions to production-ready `uikit-main` components.
- `protocol/schemas/` contains stack-agnostic JSON Schema documents for protocol consumers.
- `src/protocol-core.js` contains a minimal dependency-free conformance validator and transform validation pipeline.
- `tests/conformance.test.js` verifies the MVP protocol behavior.

The core intentionally does not contain React, DOM, CSS, arbitrary event handlers, or renderer implementation logic. It describes semantic UX capabilities and validates semantic transforms before a revision candidate can be created.

Current layout rules:

- Full-screen wrapper has 24px outer padding.
- Internal gaps are 16px.
- The layout has a fixed collapsible left `SidebarMinibar` and a right workspace.
- The right workspace always has top `Breadcrumbs` and lower contextual content.
- Table filtering is represented as `TableControls`, not as a standalone `FiltersBar`.
- Drawer is modeled as a right-side full-height modal.
- Renderer bindings must expose `data-semantic-node-id` and `data-semantic-role` anchors.

Run:

```sh
npm test
```
