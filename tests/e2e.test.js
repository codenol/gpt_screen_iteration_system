import assert from "node:assert/strict";
import {
  loadDesignProtocol,
  loadTransformContracts,
  loadUikitBindings,
  loadSemanticState,
  toLightweightState,
  validateIntent,
  createRevisionStore,
  createRevision,
  getHeadRevision,
  findNode
} from "../src/protocol-core.js";
import {
  simulateRender,
  validateRendererLayout,
  validateRendererAnchors,
  validatePlacementRules
} from "../src/anchor-adapter.js";

const protocol = loadDesignProtocol();
const contracts = loadTransformContracts();
const bindings = loadUikitBindings();
const doc = loadSemanticState("examples/semantic-state.mvp-users-crud.json");
const lite = toLightweightState(doc);

const tests = [
  ["E2E: load state -> validate intent -> apply transform -> create revision -> simulate render", () => {
    const intent = validateIntent({
      protocol,
      contracts,
      state: lite,
      normalizedIntent: {
        intent: "make_filters_compact",
        targetNodeId: "users_screen.table_controls",
        candidateTransformIds: ["increase_density"],
        commentId: "cmt_e2e_1"
      }
    });

    assert.equal(intent.status, "valid", `Expected valid, got ${intent.status}`);
    assert.equal(intent.resolvedTransform.transformId, "increase_density");
    assert.equal(intent.resolvedTransform.targetNodeId, "users_screen.table_controls");

    const store = createRevisionStore();
    const initialId = store.nextId();
    store.add({
      id: initialId,
      baseRevisionId: initialId,
      branchId: "branch_main",
      featureId: "users_management",
      stateSnapshot: { nodes: lite.nodes, widgets: lite.widgets },
      transforms: [],
      appliedCommentIds: [],
      created: new Date().toISOString(),
      author: "system",
      rollback: false
    });

    const rev = createRevision(store, lite, intent.resolvedTransform, "cmt_e2e_1");
    assert.ok(rev, "Revision should be created");
    assert.equal(rev.appliedCommentIds[0], "cmt_e2e_1");

    const head = getHeadRevision(store, "branch_main");
    assert.ok(head);
    assert.ok(head.id !== initialId, "Head should differ from initial");

    const widget = head.stateSnapshot.widgets.find((w) => w.nodeId === "users_screen.table_controls");
    assert.ok(widget);
    assert.ok(["compact", "collapsible"].includes(widget.variant),
      `Expected compact/collapsible variant after increase_density, got ${widget.variant}`);

    const renderState = { nodes: head.stateSnapshot.nodes, widgets: head.stateSnapshot.widgets };
    const { elements, layout } = simulateRender(renderState, bindings);

    const layoutResult = validateRendererLayout(bindings, layout);
    assert.deepEqual(layoutResult.errors, [], "Layout validation should pass");

    const anchorResult = validateRendererAnchors(bindings, elements);
    assert.deepEqual(anchorResult.errors, [], "Anchor validation should pass");

    const placementResult = validatePlacementRules(bindings, elements);
    assert.deepEqual(placementResult.errors, [], "Placement validation should pass");
  }],

  ["E2E: multi-step transform chain", () => {
    const store = createRevisionStore();
    const initialId = store.nextId();
    let currentState = JSON.parse(JSON.stringify(lite));
    currentState.revisionId = initialId;
    currentState.branchId = "branch_main";

    store.add({
      id: initialId,
      baseRevisionId: initialId,
      branchId: "branch_main",
      featureId: "users_management",
      stateSnapshot: { nodes: currentState.nodes, widgets: currentState.widgets },
      transforms: [],
      appliedCommentIds: [],
      created: new Date().toISOString(),
      author: "system",
      rollback: false
    });

    const step1 = validateIntent({
      protocol, contracts, state: currentState,
      normalizedIntent: {
        intent: "simplify",
        targetNodeId: "users_screen.table_controls.left.filters",
        candidateTransformIds: ["simplify_filters"],
        commentId: "cmt_step1"
      }
    });
    assert.equal(step1.status, "valid");

    const rev1 = createRevision(store, currentState, step1.resolvedTransform, "cmt_step1");
    assert.ok(rev1);

    currentState = {
      ...currentState,
      revisionId: rev1.id,
      nodes: rev1.stateSnapshot.nodes,
      widgets: rev1.stateSnapshot.widgets
    };

    const step2 = validateIntent({
      protocol, contracts, state: currentState,
      normalizedIntent: {
        intent: "reduce_weight",
        targetNodeId: "users_screen.details_drawer",
        candidateTransformIds: ["reduce_visual_weight"],
        commentId: "cmt_step2"
      }
    });
    assert.equal(step2.status, "valid");

    const rev2 = createRevision(store, currentState, step2.resolvedTransform, "cmt_step2");
    assert.ok(rev2);

    const head = getHeadRevision(store, "branch_main");
    assert.ok(head);
    assert.notEqual(head.id, initialId);
    assert.notEqual(head.id, rev1.id);

    const renderState = { nodes: head.stateSnapshot.nodes, widgets: head.stateSnapshot.widgets };
    const { elements } = simulateRender(renderState, bindings);
    const anchorResult = validateRendererAnchors(bindings, elements);
    assert.deepEqual(anchorResult.errors, []);
  }],

  ["E2E: full pipeline from semantic state file", () => {
    const fullState = toLightweightState(doc);
    assert.ok(fullState.nodes.length > 0);
    assert.ok(fullState.widgets.length > 0);
    assert.equal(fullState.archetype, "crud_management");

    const { elements } = simulateRender(fullState, bindings);
    assert.ok(elements.controls, "Table controls should be rendered");
    assert.ok(elements.pagination, "Pagination should be rendered");
    assert.ok(elements.columns, "Table columns should be rendered");

    const drawResult = validateRendererAnchors(bindings, elements);
    assert.deepEqual(drawResult.errors, []);
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

console.log(`\n${passed}/${tests.length} E2E tests passed`);
