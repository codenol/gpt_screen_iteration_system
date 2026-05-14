import assert from "node:assert/strict";
import {
  loadDesignProtocol,
  loadTransformContracts,
  loadSemanticState,
  toLightweightState,
  validateTransformCandidate,
  createRevisionStore,
  createRevision,
  getRevisionChain,
  getHeadRevision,
  materializeRevision,
  rollbackToRevision,
  createBranch
} from "../src/protocol-core.js";

const protocol = loadDesignProtocol();
const contracts = loadTransformContracts();
const doc = loadSemanticState("examples/semantic-state.mvp-users-crud.json");
const lite = toLightweightState(doc);

const store = createRevisionStore();
const initialId = store.nextId();
const initial = {
  id: initialId,
  baseRevisionId: initialId,
  branchId: "branch_main",
  featureId: "users_management",
  stateSnapshot: { nodes: lite.nodes, widgets: lite.widgets },
  transforms: [],
  appliedCommentIds: [],
  created: "2026-05-14T10:00:00.000Z",
  author: "system",
  rollback: false
};
store.add(initial);

const tests = [
  ["createRevision applies transform and stores new revision", () => {
    const result = validateTransformCandidate({
      protocol, contracts, state: lite,
      candidate: { transformId: "increase_density", targetNodeId: "users_screen.table_controls", commentId: "cmt_1" }
    });
    assert.equal(result.status, "valid");

    const rev = createRevision(store, lite, result.resolvedTransform, "cmt_1");
    assert.ok(rev);
    assert.equal(rev.branchId, "branch_main");
    assert.equal(rev.rollback, false);
    assert.deepEqual(rev.appliedCommentIds, ["cmt_1"]);
    assert.ok(rev.transforms.length > 0);
    assert.equal(rev.transforms[0].transformId, "increase_density");

    const widget = rev.stateSnapshot.widgets.find((w) => w.nodeId === "users_screen.table_controls");
    assert.ok(["compact", "collapsible"].includes(widget.variant));
  }],

  ["getRevisionChain returns ordered chain for branch", () => {
    const chain = getRevisionChain(store, "branch_main");
    assert.ok(chain.length >= 1, `Expected at least 1 revision, got ${chain.length}`);
    assert.equal(chain[0].id, initialId, "First revision should be the initial one");
  }],

  ["getHeadRevision returns latest revision", () => {
    const head = getHeadRevision(store, "branch_main");
    assert.ok(head);
    assert.ok(head.id !== initialId, "Head should be a new revision, not the initial one");
    assert.equal(head.branchId, "branch_main");
  }],

  ["rollbackToRevision creates a new rollback revision", () => {
    const head = getHeadRevision(store, "branch_main");
    const currentState = { ...lite, revisionId: head.id, branchId: "branch_main" };
    const beforeCount = store.getAll().length;

    const rollback = rollbackToRevision(store, currentState, initialId);
    assert.ok(rollback);
    assert.equal(rollback.rollback, true);
    assert.equal(rollback.rollbackTargetId, initialId);
    assert.equal(store.getAll().length, beforeCount + 1, "Rollback adds a new revision");
    assert.ok(store.get(rollback.id), "Rollback revision stored");
  }],

  ["rollback does not delete previous revisions", () => {
    assert.ok(store.get(initialId), "Initial revision still exists after rollback");
    const head = getHeadRevision(store, "branch_main");
    assert.ok(head);
    assert.ok(store.get(head.id), "Head revision still exists");
  }],

  ["createBranch creates branch from base revision", () => {
    const branch = createBranch(store, "branch_experiment", "experiment", initialId);
    assert.ok(branch);
    assert.equal(branch.id, "branch_experiment");
    assert.equal(branch.name, "experiment");
    assert.equal(branch.headRevisionId, initialId);
  }],

  ["Revision metadata present", () => {
    const head = getHeadRevision(store, "branch_main");
    assert.ok(head.created, "created timestamp must exist");
    assert.ok(head.author, "author must exist");
  }],

  ["Rollback to non-existent revision returns null", () => {
    const head = getHeadRevision(store, "branch_main");
    const currentState = { ...lite, revisionId: head.id, branchId: "branch_main" };
    const result = rollbackToRevision(store, currentState, "rev_nonexistent");
    assert.equal(result, null);
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

console.log(`\n${passed}/${tests.length} revision system tests passed`);
