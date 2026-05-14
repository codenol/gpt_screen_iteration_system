import assert from "node:assert/strict";
import {
  loadDesignProtocol,
  loadSemanticState,
  validateSemanticState,
  toLightweightState,
  findNode,
  collectNodeIds
} from "../src/protocol-core.js";

const protocol = loadDesignProtocol();
const doc = loadSemanticState("examples/semantic-state.mvp-users-crud.json");
const lite = toLightweightState(doc);

const tests = [
  ["Full semantic state document validates against protocol", () => {
    const result = validateSemanticState(protocol, doc);
    assert.deepEqual(result.errors, []);
    assert.equal(result.ok, true);
  }],

  ["Meta contains required fields", () => {
    assert.ok(doc.meta.workspaceId);
    assert.ok(doc.meta.projectId);
    assert.ok(doc.meta.screenId);
    assert.ok(doc.meta.archetype);
  }],

  ["Archetype is known to protocol", () => {
    const archetypes = Object.keys(protocol.screenArchetypes);
    assert.ok(archetypes.includes(doc.meta.archetype));
  }],

  ["All node roles are known to protocol", () => {
    const knownRoles = new Set(Object.keys(protocol.semanticRoles));
    const nodeErrors = [];
    function check(nodes) {
      for (const node of nodes) {
        if (!knownRoles.has(node.role)) nodeErrors.push(`Unknown role: ${node.role} at ${node.id}`);
        if (node.children) check(node.children);
      }
    }
    check(doc.nodes);
    assert.deepEqual(nodeErrors, []);
  }],

  ["All widget types are known to protocol", () => {
    const widgetDefs = new Set(protocol.widgetDefinitions.map((w) => w.widgetType));
    for (const widget of doc.widgets) {
      assert.ok(widgetDefs.has(widget.widgetType), `${widget.widgetType} must exist in widgetDefinitions`);
    }
  }],

  ["Widget variants match widget definition", () => {
    const widgetDefs = new Map(protocol.widgetDefinitions.map((w) => [w.widgetType, w]));
    for (const widget of doc.widgets) {
      const def = widgetDefs.get(widget.widgetType);
      assert.ok(def.variants.includes(widget.variant), `${widget.widgetType} variant '${widget.variant}' not in ${def.variants}`);
    }
  }],

  ["Widget nodeId references an existing node", () => {
    const nodeIds = collectNodeIds(doc.nodes);
    for (const widget of doc.widgets) {
      assert.ok(nodeIds.has(widget.nodeId), `Widget ${widget.id} nodeId ${widget.nodeId} not found`);
    }
  }],

  ["Branch references valid revisions", () => {
    const revisionIds = new Set(doc.revisions.map((r) => r.id));
    for (const branch of doc.branches) {
      assert.ok(revisionIds.has(branch.baseRevisionId), `Branch ${branch.id} baseRevisionId not found`);
      assert.ok(revisionIds.has(branch.headRevisionId), `Branch ${branch.id} headRevisionId not found`);
    }
  }],

  ["Revision references valid branch", () => {
    const branchIds = new Set(doc.branches.map((b) => b.id));
    for (const rev of doc.revisions) {
      assert.ok(branchIds.has(rev.branchId), `Revision ${rev.id} branchId ${rev.branchId} not found`);
    }
  }],

  ["toLightweightState extracts correctly", () => {
    assert.equal(lite.revisionId, "rev_001");
    assert.equal(lite.branchId, "branch_main");
    assert.equal(lite.archetype, "crud_management");
    assert.ok(lite.nodes.length > 0);
    assert.ok(lite.widgets.length > 0);
  }],

  ["findNode finds deep nodes in full doc", () => {
    const node = findNode(doc, "users_screen.table_controls.left.search");
    assert.ok(node);
    assert.equal(node.role, "primary_filter");
  }],

  ["Unknown widgetType fails validation", () => {
    const bad = JSON.parse(JSON.stringify(doc));
    bad.widgets.push({ id: "bad", widgetType: "NonExistentWidget", nodeId: "users_screen", variant: "standard" });
    const result = validateSemanticState(protocol, bad);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes("unknown widgetType")));
  }],

  ["Unknown node role fails validation", () => {
    const bad = JSON.parse(JSON.stringify(doc));
    bad.nodes.push({ id: "bad_node", role: "non_existent_role", targetable: true });
    const result = validateSemanticState(protocol, bad);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes("unknown role")));
  }],

  ["Comment to non-existent node fails validation", () => {
    const bad = JSON.parse(JSON.stringify(doc));
    bad.comments.push({
      id: "bad_comment",
      targetNodeId: "nonexistent.node",
      revisionId: "rev_001",
      branchId: "branch_main",
      intent: "increase_density",
      text: "Make it denser",
      lifecycle: "open",
      authorId: "user_1",
      created: "2026-05-14T10:00:00Z"
    });
    const result = validateSemanticState(protocol, bad);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes("unknown targetNodeId")));
  }],

  ["Invalid comment lifecycle fails validation", () => {
    const bad = JSON.parse(JSON.stringify(doc));
    bad.comments.push({
      id: "bad_lifecycle",
      targetNodeId: "users_screen.table_controls",
      revisionId: "rev_001",
      branchId: "branch_main",
      intent: "increase_density",
      text: "Test",
      lifecycle: "invalid_state",
      authorId: "user_1",
      created: "2026-05-14T10:00:00Z"
    });
    const result = validateSemanticState(protocol, bad);
    assert.equal(result.ok, false);
    assert.ok(result.errors.some((e) => e.includes("invalid lifecycle")));
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

console.log(`\n${passed}/${tests.length} semantic state tests passed`);
