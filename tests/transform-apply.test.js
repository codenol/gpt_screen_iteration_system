import assert from "node:assert/strict";
import {
  loadDesignProtocol,
  loadTransformContracts,
  loadSemanticState,
  toLightweightState,
  findNode,
  validateTransformCandidate,
  applyTransform,
  applyEffects,
  checkInvariants
} from "../src/protocol-core.js";

const protocol = loadDesignProtocol();
const contracts = loadTransformContracts();
const doc = loadSemanticState("examples/semantic-state.mvp-users-crud.json");
const lite = toLightweightState(doc);

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

const tests = [
  ["increase_density on TableControls sets variant to compact or collapsible", () => {
    const result = validateTransformCandidate({
      protocol, contracts, state: lite,
      candidate: { transformId: "increase_density", targetNodeId: "users_screen.table_controls" }
    });
    assert.equal(result.status, "valid");

    const next = applyTransform(cloneState(lite), result.resolvedTransform);
    assert.ok(next, "applyTransform should return new state");

    const widget = next.widgets.find((w) => w.nodeId === "users_screen.table_controls");
    assert.ok(widget);
    assert.ok(["compact", "collapsible"].includes(widget.variant),
      `Expected compact or collapsible variant, got ${widget.variant}`);
  }],

  ["simplify_filters collapses secondary and prioritizes search", () => {
    const result = validateTransformCandidate({
      protocol, contracts, state: lite,
      candidate: { transformId: "simplify_filters", targetNodeId: "users_screen.table_controls.left.filters" }
    });
    assert.equal(result.status, "valid");

    const next = applyTransform(cloneState(lite), result.resolvedTransform);
    assert.ok(next);

    const widget = next.widgets.find((w) => w.nodeId === "users_screen.table_controls");
    assert.ok(["compact", "collapsible"].includes(widget.variant));
  }],

  ["switch_widget_variant changes variant, leaves other fields untouched", () => {
    const stateBefore = cloneState(lite);
    const result = validateTransformCandidate({
      protocol, contracts, state: stateBefore,
      candidate: {
        transformId: "switch_widget_variant",
        targetNodeId: "users_screen.users_table",
        requestedVariant: "compact"
      }
    });
    assert.equal(result.status, "valid");

    const next = applyTransform(cloneState(lite), result.resolvedTransform);
    assert.ok(next);

    const widget = next.widgets.find((w) => w.nodeId === "users_screen.users_table");
    assert.equal(widget.variant, "compact");

    const otherWidget = next.widgets.find((w) => w.nodeId === "users_screen.table_controls");
    assert.equal(otherWidget.variant, "standard", "other widgets should not be affected");
  }],

  ["applyTransform does not mutate original state (immutability)", () => {
    const original = cloneState(lite);
    const result = validateTransformCandidate({
      protocol, contracts, state: original,
      candidate: { transformId: "increase_density", targetNodeId: "users_screen.table_controls" }
    });

    const next = applyTransform(cloneState(original), result.resolvedTransform);
    assert.ok(next);

    const origWidget = original.widgets.find((w) => w.nodeId === "users_screen.table_controls");
    assert.equal(origWidget.variant, "standard", "original state must be unchanged");
  }],

  ["collapse_secondary sets metadata.collapsed on secondary_actions", () => {
    const result = validateTransformCandidate({
      protocol, contracts, state: lite,
      candidate: { transformId: "collapse_secondary", targetNodeId: "users_screen.table_controls.right.secondary_actions" }
    });
    assert.equal(result.status, "valid");

    const next = applyTransform(cloneState(lite), result.resolvedTransform);
    assert.ok(next);

    const secondaryNode = findNode(next, "users_screen.table_controls.right.secondary_actions");
    assert.ok(secondaryNode);
    assert.equal(secondaryNode.metadata?.collapsed, true,
      "secondary_actions node should be collapsed");
  }],

  ["prioritize_search keeps search visible", () => {
    const result = validateTransformCandidate({
      protocol, contracts, state: lite,
      candidate: { transformId: "prioritize_search", targetNodeId: "users_screen.table_controls" }
    });
    assert.equal(result.status, "valid");

    const next = applyTransform(cloneState(lite), result.resolvedTransform);
    assert.ok(next);

    const searchNode = findNode(next, "users_screen.table_controls.left.search");
    assert.ok(searchNode);
    assert.equal(searchNode.metadata?.priority, "high", "search should have high priority");
    assert.equal(searchNode.metadata?.collapsed, undefined, "search should not be collapsed");
  }],

  ["reduce_visual_weight sets visualPriority on target node", () => {
    const result = validateTransformCandidate({
      protocol, contracts, state: lite,
      candidate: { transformId: "reduce_visual_weight", targetNodeId: "users_screen.details_drawer" }
    });
    assert.equal(result.status, "valid");

    const next = applyTransform(cloneState(lite), result.resolvedTransform);
    assert.ok(next);

    const node = findNode(next, "users_screen.details_drawer");
    assert.equal(node.metadata?.visualPriority, "reduced");
  }],

  ["Chained applies produce correct cumulative result", () => {
    let state = cloneState(lite);

    const r1 = validateTransformCandidate({
      protocol, contracts, state,
      candidate: { transformId: "simplify_filters", targetNodeId: "users_screen.table_controls.left.filters" }
    });
    assert.equal(r1.status, "valid");

    state = applyTransform(state, r1.resolvedTransform);
    assert.ok(state);

    const r2 = validateTransformCandidate({
      protocol, contracts, state,
      candidate: { transformId: "increase_density", targetNodeId: "users_screen.table_controls" }
    });
    assert.equal(r2.status, "valid");

    state = applyTransform(state, r2.resolvedTransform);
    assert.ok(state);

    const widget = state.widgets.find((w) => w.nodeId === "users_screen.table_controls");
    assert.ok(["compact", "collapsible"].includes(widget.variant));
  }],

  ["applyTransform with non-existent node returns null", () => {
    const result = {
      targetNodeId: "nonexistent.node",
      transformId: "increase_density",
      semanticEffects: [{ type: "set_widget_variant", value: "compact" }],
      invariants: []
    };
    const next = applyTransform(cloneState(lite), result);
    assert.equal(next, null);
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

console.log(`\n${passed}/${tests.length} transform apply tests passed`);
