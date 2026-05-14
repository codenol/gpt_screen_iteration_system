import assert from "node:assert/strict";
import {
  createRevisionCandidate,
  loadDesignProtocol,
  loadTransformContracts,
  loadUikitBindings,
  validateDesignProtocol,
  validateIntent,
  validateRendererBindings,
  validateTransformCandidate,
  validateTransformContracts
} from "../src/protocol-core.js";

const protocol = loadDesignProtocol();
const contracts = loadTransformContracts();
const uikitBindings = loadUikitBindings();

function baseState(overrides = {}) {
  return {
    revisionId: "rev_001",
    branchId: "main",
    archetype: "crud_management",
    nodes: [
      {
        id: "users_screen",
        role: "screen",
        children: [
          {
            id: "users_screen.table_controls",
            role: "table_controls",
            children: [
              {
                id: "users_screen.table_controls.left",
                role: "table_controls_left",
                children: [
                  { id: "users_screen.table_controls.left.search", role: "primary_filter" },
                  { id: "users_screen.table_controls.left.filters", role: "filters" }
                ]
              },
              {
                id: "users_screen.table_controls.right",
                role: "table_controls_right",
                children: [
                  { id: "users_screen.table_controls.right.secondary_actions", role: "secondary_action" },
                  { id: "users_screen.table_controls.right.cta", role: "primary_cta" }
                ]
              }
            ]
          },
          {
            id: "users_screen.users_table",
            role: "data_table",
            children: [
              { id: "users_screen.users_table.toolbar", role: "toolbar" },
              { id: "users_screen.users_table.pagination", role: "table_pagination" }
            ]
          },
          {
            id: "users_screen.details_drawer",
            role: "details_overlay"
          }
        ]
      }
    ],
    widgets: [
      {
        id: "table_controls_widget",
        widgetType: "TableControls",
        nodeId: "users_screen.table_controls",
        variant: "standard"
      },
      {
        id: "table_widget",
        widgetType: "DataTable",
        nodeId: "users_screen.users_table",
        variant: "comfortable"
      },
      {
        id: "drawer_widget",
        widgetType: "Drawer",
        nodeId: "users_screen.details_drawer",
        variant: "standard"
      }
    ],
    ...overrides
  };
}

const tests = [
  ["Design Protocol validates structurally", () => {
    const result = validateDesignProtocol(protocol);
    assert.deepEqual(result.errors, []);
    assert.equal(result.ok, true);
  }],

  ["Transform contracts validate against protocol", () => {
    const result = validateTransformContracts(protocol, contracts);
    assert.deepEqual(result.errors, []);
    assert.equal(result.ok, true);
  }],

  ["UIKit renderer bindings validate against protocol", () => {
    const result = validateRendererBindings(protocol, uikitBindings);
    assert.deepEqual(result.errors, []);
    assert.equal(result.ok, true);
  }],

  ["Every MVP widget exposes semantic nodes and allowed transforms", () => {
    const requiredWidgets = ["AppLayout", "SidebarMinibar", "Breadcrumbs", "DataTable", "TableControls", "Drawer", "Form", "StatsCards", "Tabs"];
    const definitions = new Map(protocol.widgetDefinitions.map((widget) => [widget.widgetType, widget]));

    for (const widgetType of requiredWidgets) {
      const definition = definitions.get(widgetType);
      assert.ok(definition, `${widgetType} must exist`);
      assert.ok(definition.semanticNodes.length > 0, `${widgetType} must expose semantic nodes`);
      assert.ok(definition.allowedTransforms.length > 0, `${widgetType} must allow transforms`);
      assert.ok(definition.rendererContract.length > 0, `${widgetType} must describe renderer contract`);
    }
  }],

  ["First MVP table requires pagination below the table", () => {
    const dataTableDefinition = protocol.widgetDefinitions.find((widget) => widget.widgetType === "DataTable");
    const dataTableBinding = uikitBindings.bindings.find((binding) => binding.semanticWidget === "DataTable");

    assert.ok(dataTableDefinition.semanticNodes.some((node) => node.suffix === "pagination" && node.role === "table_pagination"));
    assert.ok(dataTableBinding.anchorTargets.includes("pagination"));
    assert.equal(dataTableBinding.placementRules.pagination, "below_table");
    assert.equal(dataTableBinding.mvpRequiredProps.paginator, true);
    assert.equal(dataTableBinding.mvpRequiredProps.rows, "required");
    assert.equal(dataTableBinding.mvpRequiredProps.rowsPerPageOptions, "required");
  }],

  ["Every transform has target rules, effects, invariants and explanations", () => {
    for (const contract of contracts) {
      assert.ok(contract.target.allowedNodeRoles.length > 0, `${contract.id} needs node target rules`);
      assert.ok(contract.target.allowedWidgetTypes.length > 0, `${contract.id} needs widget target rules`);
      assert.ok(contract.effects.length > 0, `${contract.id} needs semantic effects`);
      assert.ok(contract.invariants.length > 0, `${contract.id} needs invariants`);
      assert.ok(contract.explainability.success, `${contract.id} needs success explanation`);
      assert.ok(contract.explainability.failure, `${contract.id} needs failure explanation`);
    }
  }],

  ["increase_density(table controls) resolves TableControls to compact or collapsible", () => {
    const result = validateTransformCandidate({
      protocol,
      contracts,
      state: baseState(),
      candidate: {
        transformId: "increase_density",
        targetNodeId: "users_screen.table_controls",
        commentId: "comment_001"
      }
    });

    assert.equal(result.status, "valid");
    const variantEffect = result.resolvedTransform.semanticEffects.find((effect) => effect.type === "set_widget_variant");
    assert.ok(["compact", "collapsible"].includes(variantEffect.value));
  }],

  ["move_to_sidebar(filters) is rejected when dense_operational forbids sidebar filters", () => {
    const result = validateTransformCandidate({
      protocol,
      contracts,
      state: baseState({ archetype: "dense_operational" }),
      candidate: {
        transformId: "move_to_sidebar",
        targetNodeId: "users_screen.table_controls.left.filters",
        commentId: "comment_002"
      }
    });

    assert.equal(result.status, "invalid");
    assert.match(result.reason, /does not allow transform|sidebar filters/i);
  }],

  ["Unsupported widget request creates MissingCapabilityWidget path", () => {
    const result = validateTransformCandidate({
      protocol,
      contracts,
      state: baseState(),
      candidate: {
        transformId: "add_missing_capability_placeholder",
        targetNodeId: "users_screen",
        requestedCapability: "KanbanAnalytics",
        commentId: "comment_003"
      }
    });

    assert.equal(result.status, "missing_capability");
    assert.equal(result.resolvedTransform.widgetType, "MissingCapabilityWidget");
    assert.match(result.resolvedTransform.explanation, /KanbanAnalytics/);
  }],

  ["Unknown target node returns explainable invalid result", () => {
    const result = validateTransformCandidate({
      protocol,
      contracts,
      state: baseState(),
      candidate: {
        transformId: "increase_density",
        targetNodeId: "users_screen.unknown",
        commentId: "comment_004"
      }
    });

    assert.equal(result.status, "invalid");
    assert.match(result.reason, /Target semantic node not found/);
  }],

  ["Unknown AI transform id is rejected by validator", () => {
    const result = validateIntent({
      protocol,
      contracts,
      state: baseState(),
      normalizedIntent: {
        intent: "invent_layout",
        targetNodeId: "users_screen.table_controls",
        candidateTransformIds: ["write_react_component"],
        commentId: "comment_005"
      }
    });

    assert.equal(result.status, "invalid");
    assert.match(result.reason, /Unknown transform contract/);
  }],

  ["Runtime and frontend effects are forbidden by protocol conformance", () => {
    const forbidden = new Set(protocol.compatibilityRules.forbiddenEffects);
    for (const contract of contracts) {
      for (const effect of contract.effects) {
        assert.equal(forbidden.has(effect.type), false, `${contract.id} must not use forbidden effect ${effect.type}`);
      }
    }
  }],

  ["Applied comment links to transform and revision candidate metadata", () => {
    const validation = validateTransformCandidate({
      protocol,
      contracts,
      state: baseState(),
      candidate: {
        transformId: "simplify_filters",
        targetNodeId: "users_screen.table_controls",
        commentId: "comment_006"
      }
    });
    const revisionCandidate = createRevisionCandidate(validation, baseState());

    assert.equal(validation.status, "valid");
    assert.equal(revisionCandidate.transform.transformId, "simplify_filters");
    assert.deepEqual(revisionCandidate.appliedCommentIds, ["comment_006"]);
    assert.equal(revisionCandidate.baseRevisionId, "rev_001");
  }],

  ["Multiple valid candidates returns needs_choice", () => {
    const result = validateIntent({
      protocol,
      contracts,
      state: baseState(),
      normalizedIntent: {
        intent: "make_filters_compact",
        targetNodeId: "users_screen.table_controls",
        candidateTransformIds: ["increase_density", "simplify_filters"],
        commentId: "comment_007"
      }
    });

    assert.equal(result.status, "needs_choice");
    assert.equal(result.candidates.length, 2);
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

console.log(`${passed}/${tests.length} conformance tests passed`);
