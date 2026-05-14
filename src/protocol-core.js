import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

export function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), "utf8"));
}

export function loadDesignProtocol() {
  return readJson("protocol/design-protocol.json");
}

export function loadTransformContracts() {
  return readJson("protocol/transform-contracts.json").contracts;
}

export function loadUikitBindings() {
  return readJson("protocol/uikit-bindings.json");
}

export function indexBy(items, key) {
  return new Map(items.map((item) => [item[key], item]));
}

export function validateDesignProtocol(protocol) {
  const errors = [];
  const requiredTopLevel = [
    "protocol",
    "semanticRoles",
    "widgetDefinitions",
    "layoutSemantics",
    "screenArchetypes",
    "heuristics",
    "compatibilityRules",
    "explainabilityTemplates"
  ];

  for (const key of requiredTopLevel) {
    if (!(key in protocol)) errors.push(`DesignProtocol missing required section: ${key}`);
  }

  const widgetTypes = new Set();
  for (const widget of protocol.widgetDefinitions ?? []) {
    const requiredWidgetFields = [
      "widgetType",
      "purpose",
      "supportedInteractions",
      "variants",
      "defaultVariant",
      "semanticNodes",
      "allowedTransforms",
      "constraints",
      "discouragedUsage",
      "rendererContract",
      "explainability"
    ];

    for (const key of requiredWidgetFields) {
      if (!(key in widget)) errors.push(`${widget.widgetType ?? "Unknown widget"} missing field: ${key}`);
    }

    if (widgetTypes.has(widget.widgetType)) errors.push(`Duplicate widgetType: ${widget.widgetType}`);
    widgetTypes.add(widget.widgetType);

    if (!widget.variants?.includes(widget.defaultVariant)) {
      errors.push(`${widget.widgetType} defaultVariant must be listed in variants`);
    }

    if (!widget.semanticNodes?.length) {
      errors.push(`${widget.widgetType} must expose at least one semantic node`);
    }

    for (const node of widget.semanticNodes ?? []) {
      if (!node.suffix || !node.role || typeof node.targetable !== "boolean") {
        errors.push(`${widget.widgetType} semantic node must include suffix, role and targetable`);
      }
      if (!protocol.semanticRoles?.[node.role]) {
        errors.push(`${widget.widgetType}.${node.suffix} references unknown semantic role: ${node.role}`);
      }
    }
  }

  for (const type of protocol.compatibilityRules?.allowedWidgetTypes ?? []) {
    if (!widgetTypes.has(type)) errors.push(`Allowed widget type has no definition: ${type}`);
  }

  return { ok: errors.length === 0, errors };
}

export function validateTransformContracts(protocol, contracts) {
  const errors = [];
  const widgets = indexBy(protocol.widgetDefinitions ?? [], "widgetType");
  const transformIds = new Set();
  const forbiddenEffects = new Set(protocol.compatibilityRules?.forbiddenEffects ?? []);

  for (const contract of contracts) {
    const requiredFields = [
      "id",
      "version",
      "intent",
      "target",
      "preconditions",
      "effects",
      "invariants",
      "reversibility",
      "reverseStrategy",
      "explainability",
      "validation",
      "revisionLinkage"
    ];

    for (const key of requiredFields) {
      if (!(key in contract)) errors.push(`${contract.id ?? "Unknown transform"} missing field: ${key}`);
    }

    if (transformIds.has(contract.id)) errors.push(`Duplicate transform id: ${contract.id}`);
    transformIds.add(contract.id);

    for (const role of contract.target?.allowedNodeRoles ?? []) {
      if (!protocol.semanticRoles?.[role]) errors.push(`${contract.id} references unknown node role: ${role}`);
    }

    for (const widgetType of contract.target?.allowedWidgetTypes ?? []) {
      if (!widgets.has(widgetType)) errors.push(`${contract.id} references unknown widget type: ${widgetType}`);
    }

    for (const effect of contract.effects ?? []) {
      if (forbiddenEffects.has(effect.type)) {
        errors.push(`${contract.id} uses forbidden effect: ${effect.type}`);
      }
    }

    if (!contract.explainability?.success || !contract.explainability?.failure) {
      errors.push(`${contract.id} must include success and failure explanations`);
    }

    if (typeof contract.revisionLinkage?.linkComment !== "boolean") {
      errors.push(`${contract.id} revisionLinkage.linkComment must be boolean`);
    }
  }

  for (const widget of protocol.widgetDefinitions ?? []) {
    for (const transformId of widget.allowedTransforms ?? []) {
      if (!transformIds.has(transformId)) {
        errors.push(`${widget.widgetType} allows unknown transform: ${transformId}`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export function validateRendererBindings(protocol, bindings) {
  const errors = [];
  const widgetTypes = new Set((protocol.widgetDefinitions ?? []).map((widget) => widget.widgetType));
  const semanticRoles = new Set(Object.keys(protocol.semanticRoles ?? {}));

  if (!bindings.layout?.structure) {
    errors.push("UIKit bindings must define layout.structure");
  }

  if (bindings.layout?.structure?.outerPaddingPx !== 24) {
    errors.push("AppLayout outer padding must be 24px");
  }

  if (bindings.layout?.structure?.innerGapPx !== 16) {
    errors.push("AppLayout inner gap must be 16px");
  }

  for (const attribute of ["data-semantic-node-id", "data-semantic-role"]) {
    if (!bindings.semanticAnchorContract?.requiredAttributes?.includes(attribute)) {
      errors.push(`Semantic anchor contract missing required attribute: ${attribute}`);
    }
  }

  for (const binding of bindings.bindings ?? []) {
    if (!widgetTypes.has(binding.semanticWidget)) {
      errors.push(`Binding references unknown semantic widget: ${binding.semanticWidget}`);
    }

    if (!binding.anchorTargets?.length) {
      errors.push(`${binding.semanticWidget} binding must define anchorTargets`);
    }

    if (!Array.isArray(binding.safeSemanticProps)) {
      errors.push(`${binding.semanticWidget} binding must define safeSemanticProps`);
    }

    if (!Array.isArray(binding.integrationProps)) {
      errors.push(`${binding.semanticWidget} binding must define integrationProps`);
    }

    if (!Array.isArray(binding.forbiddenGeneratedProps)) {
      errors.push(`${binding.semanticWidget} binding must define forbiddenGeneratedProps`);
    }

    if (binding.semanticWidget === "DataTable") {
      if (!binding.anchorTargets.includes("pagination")) {
        errors.push("DataTable binding must expose pagination anchor target");
      }
      if (binding.placementRules?.pagination !== "below_table") {
        errors.push("DataTable pagination must be placed below the table");
      }
      if (binding.mvpRequiredProps?.paginator !== true) {
        errors.push("DataTable MVP binding must require paginator=true");
      }
    }
  }

  const requiredAdditions = new Map((bindings.requiredUikitAdditions ?? []).map((item) => [item.semanticWidget, item]));
  for (const semanticWidget of ["Drawer", "ButtonDrop", "StatsCards"]) {
    const addition = requiredAdditions.get(semanticWidget);
    if (!addition) {
      errors.push(`Required UIKit addition is missing from bindings: ${semanticWidget}`);
    } else if (addition.status !== "required") {
      errors.push(`Required UIKit addition must have status=required: ${semanticWidget}`);
    }
  }

  for (const block of bindings.layout?.structure?.blocks ?? []) {
    if (!semanticRoles.has(block.role)) errors.push(`Layout block references unknown role: ${block.role}`);
    if (block.widget && !widgetTypes.has(block.widget)) errors.push(`Layout block references unknown widget: ${block.widget}`);
    for (const child of block.children ?? []) {
      if (!semanticRoles.has(child.role)) errors.push(`Layout child references unknown role: ${child.role}`);
      if (child.widget && !widgetTypes.has(child.widget)) errors.push(`Layout child references unknown widget: ${child.widget}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export function loadSemanticState(relativePath) {
  return readJson(relativePath);
}

export function toLightweightState(doc) {
  const meta = doc.meta ?? {};
  return {
    revisionId: meta.currentRevisionId ?? doc.revisions?.[0]?.id,
    branchId: meta.currentBranchId ?? doc.branches?.[0]?.id,
    archetype: meta.archetype,
    nodes: doc.nodes ?? [],
    widgets: doc.widgets ?? []
  };
}

export function walkNodes(nodes, visitor) {
  for (const node of nodes) {
    visitor(node);
    if (node.children) walkNodes(node.children, visitor);
  }
}

export function collectNodeIds(nodes) {
  const ids = new Set();
  walkNodes(nodes, (node) => ids.add(node.id));
  return ids;
}

export function validateSemanticState(protocol, doc) {
  const errors = [];
  const state = doc;

  if (!state.meta || !state.meta.workspaceId || !state.meta.projectId || !state.meta.screenId || !state.meta.archetype) {
    errors.push("Semantic state must define meta.workspaceId, meta.projectId, meta.screenId, meta.archetype");
  }

  const archetypes = Object.keys(protocol.screenArchetypes ?? {});
  if (state.meta?.archetype && !archetypes.includes(state.meta.archetype)) {
    errors.push(`Unknown archetype: ${state.meta.archetype}`);
  }

  const knownRoles = new Set(Object.keys(protocol.semanticRoles ?? {}));
  const widgetDefs = indexBy(protocol.widgetDefinitions ?? [], "widgetType");
  const nodeIds = collectNodeIds(state.nodes ?? []);

  if (!state.nodes?.length) {
    errors.push("Semantic state must contain at least one root node");
  }

  walkNodes(state.nodes ?? [], (node) => {
    if (!node.id || !node.role) {
      errors.push(`Node missing id or role: ${JSON.stringify(node)}`);
      return;
    }
    if (!knownRoles.has(node.role)) {
      errors.push(`Node ${node.id} references unknown role: ${node.role}`);
    }
    if (typeof node.targetable !== "boolean") {
      errors.push(`Node ${node.id} must define targetable (boolean)`);
    }
  });

  const widgetIds = new Set();
  for (const widget of state.widgets ?? []) {
    if (widgetIds.has(widget.id)) {
      errors.push(`Duplicate widget id: ${widget.id}`);
    }
    widgetIds.add(widget.id);

    const def = widgetDefs.get(widget.widgetType);
    if (!def) {
      errors.push(`Widget ${widget.id} references unknown widgetType: ${widget.widgetType}`);
    } else if (!def.variants?.includes(widget.variant)) {
      errors.push(`Widget ${widget.id} variant '${widget.variant}' is not in ${widget.widgetType} variants: ${def.variants?.join(", ")}`);
    }

    if (!nodeIds.has(widget.nodeId)) {
      errors.push(`Widget ${widget.id} references unknown nodeId: ${widget.nodeId}`);
    }
  }

  const branchIds = new Set((state.branches ?? []).map((branch) => branch.id));
  const revisionIds = new Set((state.revisions ?? []).map((rev) => rev.id));

  for (const branch of state.branches ?? []) {
    if (!revisionIds.has(branch.baseRevisionId)) {
      errors.push(`Branch ${branch.id} references unknown baseRevisionId: ${branch.baseRevisionId}`);
    }
    if (!revisionIds.has(branch.headRevisionId)) {
      errors.push(`Branch ${branch.id} references unknown headRevisionId: ${branch.headRevisionId}`);
    }
  }

  for (const rev of state.revisions ?? []) {
    if (rev.baseRevisionId !== rev.id && !revisionIds.has(rev.baseRevisionId)) {
      errors.push(`Revision ${rev.id} references unknown baseRevisionId: ${rev.baseRevisionId}`);
    }
    if (!branchIds.has(rev.branchId)) {
      errors.push(`Revision ${rev.id} references unknown branchId: ${rev.branchId}`);
    }
    if (!rev.created) {
      errors.push(`Revision ${rev.id} missing created timestamp`);
    }
  }

  for (const comment of state.comments ?? []) {
    if (!nodeIds.has(comment.targetNodeId)) {
      errors.push(`Comment ${comment.id} references unknown targetNodeId: ${comment.targetNodeId}`);
    }
    if (!revisionIds.has(comment.revisionId)) {
      errors.push(`Comment ${comment.id} references unknown revisionId: ${comment.revisionId}`);
    }
    if (!branchIds.has(comment.branchId)) {
      errors.push(`Comment ${comment.id} references unknown branchId: ${comment.branchId}`);
    }
    const validLifecycles = ["open", "applied", "approved", "rejected", "outdated"];
    if (!validLifecycles.includes(comment.lifecycle)) {
      errors.push(`Comment ${comment.id} has invalid lifecycle: ${comment.lifecycle}`);
    }
    if (!comment.intent || !comment.text) {
      errors.push(`Comment ${comment.id} missing intent or text`);
    }
  }

  return { ok: errors.length === 0, errors };
}

export function findNode(state, targetNodeId) {
  const queue = [...(state.nodes ?? [])];
  while (queue.length > 0) {
    const node = queue.shift();
    if (node.id === targetNodeId) return node;
    queue.push(...(node.children ?? []));
  }
  return null;
}

export function findWidgetForNode(state, node) {
  if (!node) return null;
  const widgets = state.widgets ?? [];
  return widgets.find((widget) => node.id === widget.nodeId || node.id.startsWith(`${widget.nodeId}.`)) ?? null;
}

export function resolveArchetype(state) {
  return state.meta?.archetype ?? state.archetype ?? null;
}

export function resolveRevisionId(state) {
  return state.meta?.currentRevisionId ?? state.revisionId ?? null;
}

export function resolveBranchId(state) {
  return state.meta?.currentBranchId ?? state.branchId ?? null;
}

export function validateTransformCandidate({ protocol, contracts, state, candidate }) {
  const contract = contracts.find((item) => item.id === candidate.transformId);
  if (!contract) {
    return invalid(candidate, `Unknown transform contract: ${candidate.transformId}`);
  }

  if (candidate.requestedCapability) {
    const existing = protocol.widgetDefinitions.find((widget) => widget.widgetType === candidate.requestedCapability);
    if (!existing && contract.id === "add_missing_capability_placeholder") {
      return missingCapability(protocol, contract, candidate);
    }
  }

  const targetNode = findNode(state, candidate.targetNodeId);
  if (!targetNode) {
    return invalid(candidate, `Target semantic node not found: ${candidate.targetNodeId}`);
  }

  const widget = findWidgetForNode(state, targetNode);
  const widgetType = widget?.widgetType ?? "MissingCapabilityWidget";
  const widgetDefinition = protocol.widgetDefinitions.find((item) => item.widgetType === widgetType);

  if (!contract.target.allowedNodeRoles.includes(targetNode.role)) {
    return invalid(candidate, `Transform ${contract.id} cannot target node role ${targetNode.role}`);
  }

  if (!contract.target.allowedWidgetTypes.includes(widgetType)) {
    return invalid(candidate, `Transform ${contract.id} cannot target widget type ${widgetType}`);
  }

  if (!widgetDefinition?.allowedTransforms?.includes(contract.id)) {
    return invalid(candidate, `Widget ${widgetType} does not allow transform ${contract.id}`);
  }

  const archetype = resolveArchetype(state);
  const restriction = protocol.compatibilityRules.archetypeTransformRestrictions?.find((rule) => {
    return rule.archetype === archetype
      && rule.transformId === contract.id
      && rule.targetWidgetType === widgetType
      && rule.allowed === false;
  });

  if (restriction) {
    return invalid(candidate, restriction.reason);
  }

  if (contract.id === "switch_widget_variant" && candidate.requestedVariant) {
    if (!widgetDefinition.variants.includes(candidate.requestedVariant)) {
      return invalid(candidate, `Requested variant ${candidate.requestedVariant} is not available for ${widgetType}`);
    }
  }

  const forbiddenEffects = new Set(protocol.compatibilityRules.forbiddenEffects ?? []);
  for (const effect of contract.effects) {
    if (forbiddenEffects.has(effect.type)) {
      return invalid(candidate, `Transform ${contract.id} contains forbidden effect ${effect.type}`);
    }
  }

  return {
    status: "valid",
    candidate,
    resolvedTransform: {
      transformId: contract.id,
      intent: contract.intent,
      targetNodeId: candidate.targetNodeId,
      targetRole: targetNode.role,
      widgetType,
      semanticEffects: resolveEffects({ contract, widgetDefinition, candidate }),
      explanation: contract.explainability.success,
      revisionLinkage: {
        commentId: candidate.commentId ?? null,
        linkComment: contract.revisionLinkage.linkComment,
        markCommentApplied: contract.revisionLinkage.markCommentApplied
      }
    }
  };
}

export function validateIntent({ protocol, contracts, state, normalizedIntent }) {
  const candidates = normalizedIntent.candidateTransformIds.map((transformId) => {
    return validateTransformCandidate({
      protocol,
      contracts,
      state,
      candidate: {
        transformId,
        targetNodeId: normalizedIntent.targetNodeId,
        commentId: normalizedIntent.commentId,
        requestedVariant: normalizedIntent.requestedVariant,
        requestedCapability: normalizedIntent.requestedCapability
      }
    });
  });

  const missing = candidates.find((result) => result.status === "missing_capability");
  if (missing) return missing;

  const valid = candidates.filter((result) => result.status === "valid");
  if (valid.length > 1) {
    return {
      status: "needs_choice",
      reason: protocol.explainabilityTemplates.needsChoice.replace("{intent}", normalizedIntent.intent),
      candidates: valid.map((result) => result.resolvedTransform)
    };
  }

  if (valid.length === 1) return valid[0];

  return {
    status: "invalid",
    reason: candidates.map((result) => result.reason).join("; ") || "No valid transform candidates.",
    candidates
  };
}

export function createRevisionCandidate(validationResult, state) {
  if (validationResult.status !== "valid") return null;
  const { resolvedTransform } = validationResult;
  return {
    baseRevisionId: resolveRevisionId(state),
    branchId: resolveBranchId(state),
    transform: resolvedTransform,
    appliedCommentIds: resolvedTransform.revisionLinkage.markCommentApplied && resolvedTransform.revisionLinkage.commentId
      ? [resolvedTransform.revisionLinkage.commentId]
      : [],
    explanation: resolvedTransform.explanation
  };
}

export function applyTransform(state, validatedTransform) {
  const next = JSON.parse(JSON.stringify(state));
  const targetNode = findNode(next, validatedTransform.targetNodeId);
  if (!targetNode) return null;

  const widget = findWidgetForNode(next, targetNode);
  const contract = { id: validatedTransform.transformId, effects: validatedTransform.semanticEffects, invariants: validatedTransform.invariants ?? [] };

  applyEffects(next, validatedTransform.semanticEffects, targetNode, widget);

  const invariantErrors = checkInvariants(next, contract, validatedTransform.targetNodeId);
  if (invariantErrors.length > 0) return null;

  return next;
}

export function applyEffects(state, effects, targetNode, targetWidget) {
  for (const effect of effects) {
    switch (effect.type) {
      case "set_widget_variant":
        if (targetWidget && effect.value) {
          targetWidget.variant = effect.value;
        }
        break;

      case "reduce_visual_priority": {
        const roleTarget = effect.targetRole;
        if (roleTarget) {
          const child = findChildByRole(targetNode, roleTarget);
          if (child) ensureMetadata(child).visualPriority = "reduced";
        } else {
          ensureMetadata(targetNode).visualPriority = "reduced";
        }
        break;
      }

      case "collapse_node": {
        applyToTargetOrChild(targetNode, effect.targetRole, (node) => {
          ensureMetadata(node).collapsed = true;
        });
        break;
      }

      case "prioritize_node": {
        applyToTargetOrChild(targetNode, effect.targetRole, (node) => {
          ensureMetadata(node).priority = "high";
        });
        break;
      }

      case "ensure_node_visible": {
        applyToTargetOrChild(targetNode, effect.targetRole, (node) => {
          delete ensureMetadata(node).collapsed;
        });
        break;
      }

      case "change_layout_semantic_role":
        if (effect.to) {
          targetNode.role = effect.to;
        }
        break;

      case "add_placeholder_capability": {
        const placeholderWidget = {
          id: `placeholder_${Date.now()}`,
          widgetType: "MissingCapabilityWidget",
          nodeId: targetNode.id,
          variant: "placeholder",
          featureId: targetNode.featureId ?? null,
          props: {}
        };
        if (!state.widgets) state.widgets = [];
        state.widgets.push(placeholderWidget);
        break;
      }

      case "link_missing_capability_request":
        if (effect.capabilityName) {
          ensureMetadata(targetNode).capabilityRequest = effect.capabilityName;
        }
        break;
    }
  }
}

export function checkInvariants(state, contract, targetNodeId) {
  const errors = [];
  const invariants = contract.invariants ?? [];
  const targetNode = findNode(state, targetNodeId);

  for (const invariant of invariants) {
    switch (invariant) {
      case "preserve_semantic_node_id":
        if (!targetNode || !targetNode.id) {
          errors.push(`Invariant violated: preserve_semantic_node_id`);
        }
        break;

      case "do_not_set_runtime_state": {
        const runtimeKeys = ["hover", "selectedRow", "openDrawer", "focusedField", "activeTab"];
        const stateStr = JSON.stringify(state);
        for (const key of runtimeKeys) {
          if (stateStr.includes(`"${key}"`)) {
            errors.push(`Invariant violated: do_not_set_runtime_state (found "${key}")`);
            break;
          }
        }
        break;
      }

      case "do_not_emit_frontend_code": {
        const stateStr = JSON.stringify(state);
        for (const pattern of ["<div", "</div>", "function(", "=>", "className", "React."]) {
          if (stateStr.includes(pattern)) {
            errors.push(`Invariant violated: do_not_emit_frontend_code`);
            break;
          }
        }
        break;
      }

      case "preserve_interaction_contract":
        break;

      case "preserve_semantic_intent":
        break;

      case "do_not_fake_unsupported_interactions":
        break;

      case "preserve_primary_search_visibility":
        break;

      case "preserve_primary_controls":
        break;
    }
  }

  return errors;
}

export function createRevisionStore() {
  return {
    revisions: new Map(),
    sequence: 0,
    nextId() { return `rev_${String(++this.sequence).padStart(3, "0")}`; },
    add(revision) { this.revisions.set(revision.id, revision); },
    get(id) { return this.revisions.get(id); },
    getAll() { return [...this.revisions.values()]; }
  };
}

export function createRevision(store, state, validatedTransform, commentId) {
  const newId = store.nextId();
  const baseRevisionId = resolveRevisionId(state);
  const branchId = resolveBranchId(state);

  const next = applyTransform(JSON.parse(JSON.stringify(state)), validatedTransform);
  if (!next) return null;

  const revision = {
    id: newId,
    baseRevisionId: baseRevisionId ?? newId,
    branchId: branchId ?? "main",
    featureId: state.meta?.screenId ?? null,
    stateSnapshot: { nodes: next.nodes, widgets: next.widgets },
    transforms: [{
      transformId: validatedTransform.transformId,
      targetNodeId: validatedTransform.targetNodeId,
      intent: validatedTransform.intent,
      widgetType: validatedTransform.widgetType,
      explanation: validatedTransform.explanation
    }],
    appliedCommentIds: commentId ? [commentId] : [],
    created: new Date().toISOString(),
    author: "system",
    rollback: false
  };

  store.add(revision);
  return revision;
}

export function getRevisionChain(store, branchId) {
  const chain = [];
  const allRevs = store.getAll().filter((r) => r.branchId === branchId);
  if (allRevs.length === 0) return chain;

  const byId = new Map(allRevs.map((r) => [r.id, r]));
  let current = allRevs.find((r) => r.baseRevisionId === r.id);
  if (!current) current = allRevs[0];

  while (current) {
    chain.push(current);
    const next = allRevs.find((r) => r.baseRevisionId === current.id && r.id !== current.id);
    current = next ?? null;
  }

  return chain;
}

export function getHeadRevision(store, branchId) {
  const chain = getRevisionChain(store, branchId);
  return chain.length > 0 ? chain[chain.length - 1] : null;
}

export function materializeRevision(store, revisionId, initialWidgets, initialNodes) {
  const rev = store.get(revisionId);
  if (!rev) return null;

  const chain = [];
  const visited = new Set();
  let current = rev;

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    chain.unshift(current);
    if (current.baseRevisionId === current.id) break;
    current = store.get(current.baseRevisionId);
  }

  const state = {
    nodes: JSON.parse(JSON.stringify(initialNodes ?? [])),
    widgets: JSON.parse(JSON.stringify(initialWidgets ?? []))
  };

  for (const r of chain) {
    for (const t of r.transforms) {
      const targetNode = findNode(state, t.targetNodeId);
      if (!targetNode) continue;
      const widget = findWidgetForNode(state, targetNode);
      const effects = [{ type: "set_widget_variant", value: "compact" }];
      state.nodes = r.stateSnapshot?.nodes ?? state.nodes;
      state.widgets = r.stateSnapshot?.widgets ?? state.widgets;
    }
  }

  const last = chain[chain.length - 1];
  return {
    revisionId: last?.id ?? revisionId,
    nodes: last?.stateSnapshot?.nodes ?? state.nodes,
    widgets: last?.stateSnapshot?.widgets ?? state.widgets
  };
}

export function rollbackToRevision(store, state, targetRevisionId) {
  const targetRev = store.get(targetRevisionId);
  if (!targetRev) return null;

  const currentId = resolveRevisionId(state);
  if (!currentId || currentId === targetRevisionId) return null;

  const newId = store.nextId();
  const rollbackRev = {
    id: newId,
    baseRevisionId: currentId,
    branchId: resolveBranchId(state) ?? "main",
    featureId: state.meta?.screenId ?? null,
    stateSnapshot: targetRev.stateSnapshot,
    transforms: [{
      transformId: "rollback",
      targetNodeId: "screen",
      intent: "rollback",
      explanation: `Rollback to revision ${targetRevisionId}`
    }],
    appliedCommentIds: [],
    created: new Date().toISOString(),
    author: "system",
    rollback: true,
    rollbackTargetId: targetRevisionId
  };

  store.add(rollbackRev);
  return rollbackRev;
}

export function createBranch(store, branchId, branchName, baseRevisionId) {
  const baseRev = store.get(baseRevisionId);
  if (!baseRev) return null;

  const branch = {
    id: branchId,
    name: branchName,
    featureId: baseRev.featureId,
    baseRevisionId,
    headRevisionId: baseRevisionId
  };

  return branch;
}

export function createComment(state, targetNodeId, text, intent) {
  const revisionId = resolveRevisionId(state);
  const branchId = resolveBranchId(state);
  const node = findNode(state, targetNodeId);
  if (!node) return null;

  const comment = {
    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    targetNodeId,
    revisionId,
    branchId,
    featureId: node.featureId ?? null,
    intent,
    text,
    lifecycle: "open",
    authorId: "user",
    created: new Date().toISOString(),
    updated: null,
    linkedTransformId: null
  };

  if (!state.comments) state.comments = [];
  state.comments.push(comment);
  return comment;
}

export function resolveCommentsByNode(state, nodeId) {
  return (state.comments ?? []).filter((c) => c.targetNodeId === nodeId);
}

export function resolveCommentsByRevision(state, revisionId) {
  return (state.comments ?? []).filter((c) => c.revisionId === revisionId);
}

export function transitionComment(comment, newLifecycle) {
  const validTransitions = {
    open: ["applied", "rejected", "outdated"],
    applied: ["approved", "outdated"],
    approved: ["outdated"],
    rejected: ["outdated"],
    outdated: []
  };

  const allowed = validTransitions[comment.lifecycle] ?? [];
  if (!allowed.includes(newLifecycle)) return false;

  comment.lifecycle = newLifecycle;
  comment.updated = new Date().toISOString();
  return true;
}

export function linkCommentToTransform(comment, transformId) {
  comment.linkedTransformId = transformId;
  comment.lifecycle = "applied";
  comment.updated = new Date().toISOString();
}

function findChildByRole(node, role) {
  if (!node.children) return null;
  return node.children.find((child) => child.role === role) ?? null;
}

function applyToTargetOrChild(targetNode, targetRole, fn) {
  if (targetRole) {
    const child = findChildByRole(targetNode, targetRole);
    if (child) { fn(child); return; }
  }
  fn(targetNode);
}

function ensureMetadata(node) {
  if (!node.metadata) node.metadata = {};
  return node.metadata;
}

function resolveEffects({ contract, widgetDefinition, candidate }) {
  return contract.effects.map((effect) => {
    if (effect.type === "set_widget_variant") {
      const requested = candidate.requestedVariant;
      const preferred = effect.preferredVariants?.find((variant) => widgetDefinition.variants.includes(variant));
      return { ...effect, value: requested ?? preferred ?? widgetDefinition.defaultVariant };
    }
    return effect;
  });
}

function invalid(candidate, reason) {
  return { status: "invalid", candidate, reason };
}

function missingCapability(protocol, contract, candidate) {
  return {
    status: "missing_capability",
    candidate,
    resolvedTransform: {
      transformId: contract.id,
      intent: contract.intent,
      targetNodeId: candidate.targetNodeId,
      widgetType: "MissingCapabilityWidget",
      semanticEffects: contract.effects,
      explanation: protocol.explainabilityTemplates.missingCapability.replace("{capability}", candidate.requestedCapability),
      revisionLinkage: {
        commentId: candidate.commentId ?? null,
        linkComment: contract.revisionLinkage.linkComment,
        markCommentApplied: contract.revisionLinkage.markCommentApplied
      }
    }
  };
}
