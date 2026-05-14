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

  const restriction = protocol.compatibilityRules.archetypeTransformRestrictions?.find((rule) => {
    return rule.archetype === state.archetype
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
    baseRevisionId: state.revisionId,
    branchId: state.branchId,
    transform: resolvedTransform,
    appliedCommentIds: resolvedTransform.revisionLinkage.markCommentApplied && resolvedTransform.revisionLinkage.commentId
      ? [resolvedTransform.revisionLinkage.commentId]
      : [],
    explanation: resolvedTransform.explanation
  };
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
