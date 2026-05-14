import assert from "node:assert/strict";
import {
  loadSemanticState,
  toLightweightState,
  findNode,
  createComment,
  resolveCommentsByNode,
  resolveCommentsByRevision,
  transitionComment,
  linkCommentToTransform
} from "../src/protocol-core.js";

const doc = loadSemanticState("examples/semantic-state.mvp-users-crud.json");
const lite = toLightweightState(doc);

const tests = [
  ["createComment creates open comment on valid node", () => {
    const state = JSON.parse(JSON.stringify(lite));
    state.comments = [];
    state.revisionId = "rev_001";
    state.branchId = "branch_main";

    const comment = createComment(state, "users_screen.table_controls.left.filters", "Make filters more compact", "increase_density");
    assert.ok(comment);
    assert.equal(comment.lifecycle, "open");
    assert.equal(comment.targetNodeId, "users_screen.table_controls.left.filters");
    assert.equal(comment.intent, "increase_density");
    assert.equal(comment.text, "Make filters more compact");
    assert.equal(state.comments.length, 1);
  }],

  ["createComment on non-existent node returns null", () => {
    const state = JSON.parse(JSON.stringify(lite));
    state.comments = [];
    state.revisionId = "rev_001";
    state.branchId = "branch_main";

    const comment = createComment(state, "nonexistent.node", "test", "increase_density");
    assert.equal(comment, null);
  }],

  ["Comment lifecycle: open -> applied -> approved", () => {
    const state = JSON.parse(JSON.stringify(lite));
    state.comments = [];
    state.revisionId = "rev_001";
    state.branchId = "branch_main";

    const comment = createComment(state, "users_screen.table_controls", "Simplify", "simplify_filters");
    assert.equal(comment.lifecycle, "open");

    const applied = transitionComment(comment, "applied");
    assert.equal(applied, true);
    assert.equal(comment.lifecycle, "applied");

    const approved = transitionComment(comment, "approved");
    assert.equal(approved, true);
    assert.equal(comment.lifecycle, "approved");
  }],

  ["Comment lifecycle: open -> rejected", () => {
    const state = JSON.parse(JSON.stringify(lite));
    state.comments = [];
    state.revisionId = "rev_001";
    state.branchId = "branch_main";

    const comment = createComment(state, "users_screen.users_table", "Too many columns", "reduce_visual_weight");
    const result = transitionComment(comment, "rejected");
    assert.equal(result, true);
    assert.equal(comment.lifecycle, "rejected");
  }],

  ["Invalid lifecycle transition returns false", () => {
    const state = JSON.parse(JSON.stringify(lite));
    state.comments = [];
    state.revisionId = "rev_001";
    state.branchId = "branch_main";

    const comment = createComment(state, "users_screen.table_controls", "Test", "increase_density");
    const result = transitionComment(comment, "approved");
    assert.equal(result, false);
    assert.equal(comment.lifecycle, "open");
  }],

  ["Any lifecycle -> outdated is allowed", () => {
    const state = JSON.parse(JSON.stringify(lite));
    state.comments = [];
    state.revisionId = "rev_001";
    state.branchId = "branch_main";

    const comment = createComment(state, "users_screen.table_controls", "Test", "increase_density");
    transitionComment(comment, "applied");
    const result = transitionComment(comment, "outdated");
    assert.equal(result, true);
    assert.equal(comment.lifecycle, "outdated");
  }],

  ["resolveCommentsByNode returns only comments for that node", () => {
    const state = JSON.parse(JSON.stringify(lite));
    state.comments = [];
    state.revisionId = "rev_001";
    state.branchId = "branch_main";

    createComment(state, "users_screen.table_controls", "Comment A", "increase_density");
    createComment(state, "users_screen.table_controls", "Comment B", "simplify_filters");
    createComment(state, "users_screen.details_drawer", "Comment C", "reduce_visual_weight");

    const tableComments = resolveCommentsByNode(state, "users_screen.table_controls");
    assert.equal(tableComments.length, 2);
    assert.ok(tableComments.every((c) => c.targetNodeId === "users_screen.table_controls"));

    const drawerComments = resolveCommentsByNode(state, "users_screen.details_drawer");
    assert.equal(drawerComments.length, 1);
  }],

  ["resolveCommentsByRevision filters by revision", () => {
    const state = JSON.parse(JSON.stringify(lite));
    state.comments = [];
    state.revisionId = "rev_001";
    state.branchId = "branch_main";

    createComment(state, "users_screen.table_controls", "Comment 1", "increase_density");
    state.revisionId = "rev_002";
    createComment(state, "users_screen.table_controls", "Comment 2", "simplify_filters");

    const rev1Comments = resolveCommentsByRevision(state, "rev_001");
    assert.equal(rev1Comments.length, 1);
    assert.equal(rev1Comments[0].text, "Comment 1");

    const rev2Comments = resolveCommentsByRevision(state, "rev_002");
    assert.equal(rev2Comments.length, 1);
    assert.equal(rev2Comments[0].text, "Comment 2");
  }],

  ["linkCommentToTransform sets lifecycle to applied", () => {
    const state = JSON.parse(JSON.stringify(lite));
    state.comments = [];
    state.revisionId = "rev_001";
    state.branchId = "branch_main";

    const comment = createComment(state, "users_screen.table_controls", "Simplify filters", "simplify_filters");
    assert.equal(comment.lifecycle, "open");

    linkCommentToTransform(comment, "simplify_filters");
    assert.equal(comment.lifecycle, "applied");
    assert.equal(comment.linkedTransformId, "simplify_filters");
  }],

  ["Comment ID is stable", () => {
    const state = JSON.parse(JSON.stringify(lite));
    state.comments = [];
    state.revisionId = "rev_001";
    state.branchId = "branch_main";

    const comment1 = createComment(state, "users_screen.table_controls", "Test A", "increase_density");
    const comment2 = createComment(state, "users_screen.table_controls", "Test B", "simplify_filters");
    assert.notEqual(comment1.id, comment2.id);
    assert.ok(comment1.id.startsWith("cmt_"));
    assert.ok(comment2.id.startsWith("cmt_"));
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

console.log(`\n${passed}/${tests.length} comment system tests passed`);
