import assert from "node:assert/strict";
import {
  loadUikitBindings,
  loadSemanticState,
  toLightweightState,
  loadDesignProtocol,
  loadTransformContracts,
  validateTransformCandidate,
  applyTransform
} from "../src/protocol-core.js";
import {
  ANCHOR_ATTRS,
  simulateRender,
  validateRendererLayout,
  validateRendererAnchors,
  validatePlacementRules
} from "../src/anchor-adapter.js";

const bindings = loadUikitBindings();
const protocol = loadDesignProtocol();
const contracts = loadTransformContracts();
const doc = loadSemanticState("examples/semantic-state.mvp-users-crud.json");
const lite = toLightweightState(doc);

const tests = [
  ["Simulated render produces layout with required regions", () => {
    const { layout } = simulateRender(lite, bindings);
    const result = validateRendererLayout(bindings, layout);
    assert.deepEqual(result.errors, []);
    assert.equal(result.ok, true);
  }],

  ["Simulated render has valid semantic anchors on all widgets", () => {
    const { elements } = simulateRender(lite, bindings);
    const result = validateRendererAnchors(bindings, elements);
    assert.deepEqual(result.errors, []);
    assert.equal(result.ok, true);
  }],

  ["Pagination is placed below table in simulated render", () => {
    const { elements } = simulateRender(lite, bindings);
    const result = validatePlacementRules(bindings, elements);
    assert.deepEqual(result.errors, []);
    assert.equal(result.ok, true);
  }],

  ["Anchor attribute names match contract", () => {
    assert.equal(ANCHOR_ATTRS.NODE_ID, "data-semantic-node-id");
    assert.equal(ANCHOR_ATTRS.ROLE, "data-semantic-role");
    assert.equal(ANCHOR_ATTRS.WIDGET_TYPE, "data-semantic-widget-type");
    assert.equal(ANCHOR_ATTRS.FEATURE_ID, "data-semantic-feature-id");
    assert.equal(ANCHOR_ATTRS.REVISION_ID, "data-semantic-revision-id");

    const required = bindings.semanticAnchorContract.requiredAttributes;
    assert.ok(required.includes("data-semantic-node-id"));
    assert.ok(required.includes("data-semantic-role"));
  }],

  ["Transform apply + re-render produces updated anchors", () => {
    const result = validateTransformCandidate({
      protocol, contracts, state: lite,
      candidate: { transformId: "increase_density", targetNodeId: "users_screen.table_controls" }
    });
    assert.equal(result.status, "valid");

    const nextState = applyTransform(JSON.parse(JSON.stringify(lite)), result.resolvedTransform);
    assert.ok(nextState);

    const { elements } = simulateRender(nextState, bindings);
    const widget = nextState.widgets.find((w) => w.nodeId === "users_screen.table_controls");
    const anchors = elements.controls ?? [];
    assert.ok(anchors.length > 0, "Controls should have anchors after re-render");
  }],

  ["Missing anchor target is caught by validator", () => {
    const badElements = {
      controls: [{ index: 0, semanticWidget: "TableControls" }]
    };
    const result = validateRendererAnchors(bindings, badElements);
    assert.equal(result.ok, false);
    assert.ok(result.errors.length > 0);
  }],

  ["Bad placement (pagination above table) is caught", () => {
    const badElements = {
      controls: [{ index: 5, "data-semantic-node-id": "test.controls", "data-semantic-role": "test", semanticWidget: "DataTable" }],
      columns: [{ index: 2, "data-semantic-node-id": "test.columns", "data-semantic-role": "test", semanticWidget: "DataTable" }],
      rows: [{ index: 3, "data-semantic-node-id": "test.rows", "data-semantic-role": "test", semanticWidget: "DataTable" }],
      pagination: [{ index: 1, "data-semantic-node-id": "test.pagination", "data-semantic-role": "test", semanticWidget: "DataTable" }]
    };
    const result = validatePlacementRules(bindings, badElements);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes("below")));
  }],

  ["No forbidden effects in simulated render output", () => {
    const { elements } = simulateRender(lite, bindings);
    const allAnchors = Object.values(elements).flat();
    const str = JSON.stringify(allAnchors);
    const forbidden = protocol.compatibilityRules.forbiddenEffects;
    for (const effect of forbidden) {
      assert.equal(str.includes(effect), false, `Render output should not contain forbidden effect: ${effect}`);
    }
  }]
];

let passed = 0;

for (const [name, fn] of tests) {
  try {
    fn();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

console.log(`\n${passed}/${tests.length} renderer tests passed`);
