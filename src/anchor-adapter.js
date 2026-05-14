export const ANCHOR_ATTRS = {
  NODE_ID: "data-semantic-node-id",
  ROLE: "data-semantic-role",
  WIDGET_TYPE: "data-semantic-widget-type",
  FEATURE_ID: "data-semantic-feature-id",
  REVISION_ID: "data-semantic-revision-id"
};

export function attachSemanticAnchor(element, { nodeId, role, widgetType, featureId, revisionId } = {}) {
  if (nodeId) element.setAttribute(ANCHOR_ATTRS.NODE_ID, nodeId);
  if (role) element.setAttribute(ANCHOR_ATTRS.ROLE, role);
  if (widgetType) element.setAttribute(ANCHOR_ATTRS.WIDGET_TYPE, widgetType);
  if (featureId) element.setAttribute(ANCHOR_ATTRS.FEATURE_ID, featureId);
  if (revisionId) element.setAttribute(ANCHOR_ATTRS.REVISION_ID, revisionId);
}

export function getSemanticNodeId(element) {
  return element.getAttribute(ANCHOR_ATTRS.NODE_ID);
}

export function getSemanticRole(element) {
  return element.getAttribute(ANCHOR_ATTRS.ROLE);
}

export function validateRendererLayout(bindings, rendered) {
  const errors = [];

  const structure = bindings.layout?.structure;
  if (!structure) return [{ ok: false, errors: ["No layout structure defined"] }];

  if (structure.outerPaddingPx !== 24) {
    errors.push(`Layout outer padding must be 24px, got ${structure.outerPaddingPx}`);
  }
  if (structure.innerGapPx !== 16) {
    errors.push(`Layout inner gap must be 16px, got ${structure.innerGapPx}`);
  }

  for (const block of structure.blocks ?? []) {
    if (block.role === "left_navigation") {
      if (!rendered.leftNavigation) errors.push("Left navigation block not rendered");
    }
    if (block.role === "right_workspace") {
      if (!rendered.rightWorkspace) errors.push("Right workspace not rendered");
      for (const child of block.children ?? []) {
        if (child.role === "breadcrumbs_region" && child.alwaysVisible && !rendered.breadcrumbs) {
          errors.push("Breadcrumbs region must be rendered and always visible");
        }
        if (child.role === "content_area" && !rendered.contentArea) {
          errors.push("Content area not rendered");
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export function validateRendererAnchors(bindings, renderedElements) {
  const errors = [];
  const activeWidgets = new Set();
  for (const elements of Object.values(renderedElements)) {
    for (const el of elements) {
      if (el.semanticWidget) activeWidgets.add(el.semanticWidget);
    }
  }

  for (const binding of bindings.bindings ?? []) {
    if (!activeWidgets.has(binding.semanticWidget)) continue;
    for (const target of binding.anchorTargets ?? []) {
      const elements = renderedElements[target] ?? [];
      if (elements.length === 0) {
        errors.push(`Missing anchor target: ${binding.semanticWidget}.${target}`);
        continue;
      }
      for (const el of elements) {
        if (!el[ANCHOR_ATTRS.NODE_ID]) {
          errors.push(`${binding.semanticWidget}.${target} missing ${ANCHOR_ATTRS.NODE_ID}`);
        }
        if (!el[ANCHOR_ATTRS.ROLE]) {
          errors.push(`${binding.semanticWidget}.${target} missing ${ANCHOR_ATTRS.ROLE}`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export function validatePlacementRules(bindings, renderedElements) {
  const errors = [];

  for (const binding of bindings.bindings ?? []) {
    if (binding.semanticWidget === "DataTable" && binding.placementRules) {
      if (binding.placementRules.controls === "above_table") {
        const controlsRendered = renderedElements.controls ?? [];
        const tableRendered = renderedElements.columns ?? [];
        if (controlsRendered.length > 0 && tableRendered.length > 0) {
          if (controlsRendered[0].index >= tableRendered[0].index) {
            errors.push("TableControls must be rendered above DataTable");
          }
        }
      }
      if (binding.placementRules.pagination === "below_table") {
        const paginationRendered = renderedElements.pagination ?? [];
        const rowsRendered = renderedElements.rows ?? [];
        if (paginationRendered.length > 0 && rowsRendered.length > 0) {
          if (paginationRendered[0].index <= rowsRendered[0].index) {
            errors.push("Pagination must be rendered below the DataTable");
          }
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

export function simulateRender(state, bindings) {
  const elements = {};
  let globalIndex = 0;

  for (const widget of state.widgets ?? []) {
    const binding = bindings.bindings?.find((b) => b.semanticWidget === widget.widgetType);
    if (!binding) continue;

    for (const target of binding.anchorTargets ?? []) {
      if (!elements[target]) elements[target] = [];
      elements[target].push({
        index: globalIndex++,
        [ANCHOR_ATTRS.NODE_ID]: `${widget.nodeId}.${target}`,
        [ANCHOR_ATTRS.ROLE]: "test",
        [ANCHOR_ATTRS.WIDGET_TYPE]: widget.widgetType,
        semanticWidget: widget.widgetType,
        target
      });
    }
  }

  const layout = {
    leftNavigation: true,
    rightWorkspace: true,
    breadcrumbs: true,
    contentArea: true
  };

  return { elements, layout };
}
