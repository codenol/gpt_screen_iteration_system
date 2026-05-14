# Semantic UI Evolution Platform Implementation Plan (v2)

## Current Status

We have created the first executable protocol core. It is intentionally not a UI app yet.

Implemented:
- Design Protocol source of truth: `protocol/design-protocol.json`
- Transform Contracts source of truth: `protocol/transform-contracts.json`
- UIKit renderer bindings draft: `protocol/uikit-bindings.json`
- JSON schemas for protocol and transform contracts: `protocol/schemas/`
- Dependency-free validator and transform validation pipeline: `src/protocol-core.js`
- Conformance tests: `tests/conformance.test.js`
- Test script: `npm test`

Current validation status: **13/13 conformance tests passed**

---

## What Exists

### Design Protocol

Semantic roles, layout semantics, 3 screen archetypes (crud_management, dense_operational, approval_workflow),
10 widget definitions with variants, UX heuristics, compatibility rules, explainability templates.

Key rules: semantic-first, renderer materializes state, runtime is not semantic, AI output goes through transform validation.

### Layout Model

Full-screen wrapper, 24px outer padding, 16px inner gaps.
Left: fixed collapsible SidebarMinibar. Right: vertical workspace (breadcrumbs top, content area bottom).
TableControls above DataTable, pagination below table. No standalone FiltersBar.
Drawer: right-side full-height modal (open/close = runtime only).

### Widgets and UIKit Bindings

| Semantic Widget | UIKit Component | Status |
|---|---|---|
| DataTable | DataTableDynamic | bound |
| Form | FormJSON | bound |
| SidebarMinibar | CombinedNavMenu | bound |
| Breadcrumbs | BreadCrumbs / GenomeBreadCrumbs | bound |
| Tabs | DialogTabs / TabMenuNavLink | bound |
| TableControls | renderer composition | bound |
| AppLayout | renderer composition | bound |
| MissingCapabilityWidget | renderer placeholder | bound |
| Drawer | Drawer | **required UIKit addition** |
| StatsCards | StatsCards | **required UIKit addition** |
| ButtonDrop | ButtonDrop | **required UIKit addition** |

### Transform Contracts (8)

increase_density, simplify_filters, collapse_secondary, prioritize_search, move_to_sidebar, reduce_visual_weight, switch_widget_variant, add_missing_capability_placeholder

### Semantic Anchors

Required: `data-semantic-node-id`, `data-semantic-role`
Recommended: `data-semantic-widget-type`, `data-semantic-feature-id`, `data-semantic-revision-id`

---

## Implementation Plan

### Phase 0: Foundation (DONE) ✓

All of the above. 13/13 conformance tests pass via `npm test`.
- [x] Design Protocol, Transform Contracts, UIKit Bindings
- [x] JSON Schemas for protocol & transform contracts
- [x] Validator (`src/protocol-core.js`)
- [x] Conformance tests (`tests/conformance.test.js`) — 13/13
- [x] `.gitignore`
- [x] Git init, remote set (`github.com/codenol/gpt_screen_iteration_system`), commit, push

---

### Phase 1: Semantic State Model (NEXT)

#### 1.1 -- JSON Schema for Semantic State
Create `protocol/schemas/semantic-state.schema.json`.
Validates: Workspace, Project, Screen, Feature, SemanticNode (tree), WidgetInstance[], Branch[], Revision[], Comment[].

#### 1.2 -- Formal Data Structures
- **Workspace**: org, users, roles, Design Protocol reference
- **Project**: domain semantics, description, screens[]
- **Screen**: UX scenario, archetype reference, features[], layout regions
- **Feature**: minimal independently evolving UX capability, widget composition, semantic nodes, revisions[]
- **SemanticNode**: id, role, children[], targetable, metadata. IDs must be stable, deterministic, hierarchical.
- **WidgetInstance**: widgetType, nodeId, variant, props
- **Branch**: name, baseRevisionId, headRevisionId
- **Revision**: baseRevisionId, branchId, transforms[], appliedCommentIds[], created, author
- **Comment**: targetNodeId, revisionId, branchId, intent (normalized), text, lifecycle (open/applied/approved/rejected/outdated)

#### 1.3 -- Example Semantic State
Create `examples/semantic-state.mvp-users-crud.json`:
- Screen: users_management, archetype: crud_management
- Features: table_feature, drawer_feature
- Full node tree: screen -> table_controls (left.search, left.filters, right.secondary_actions, right.cta) + data_table (pagination) + details_drawer
- WidgetInstances: TableControls(standard), DataTableDynamic(comfortable), Drawer(standard)
- Initial Revision: initial_state_v1

#### 1.4 -- Extend protocol-core.js
- `validateSemanticState(protocol, state)`: checks node roles known, widget types registered, revision/branch references consistent
- `loadSemanticState(path)`

#### 1.5 -- Tests: `tests/semantic-state.test.js`
- Stable node IDs (deterministic, human-readable, hierarchical)
- Widget ownership (widget -> node reference valid)
- Branch references (revision -> branch consistent)
- Comment targets (targetNodeId exists in state)
- Unknown widgetType -> error
- Unknown node role -> error

**Estimated: ~10 new tests. Target: >23 tests passing.**

---

### Phase 2: Transform Engine Apply Step

#### 2.1 -- Apply Functions
- `applyTransform(state, validatedTransform)`: mutates a copy of semantic state per transform effects
- `applyEffects(state, effects)`: effect dispatchers for:
  - `set_widget_variant` -> widget.variant = value
  - `reduce_visual_priority` -> node.metadata.visualPriority = 'reduced'
  - `collapse_node` -> node.metadata.collapsed = true
  - `prioritize_node` -> node.metadata.priority = 'high'
  - `ensure_node_visible` -> clear collapsed flag
  - `change_layout_semantic_role` -> node.role = to (validated)
  - `add_placeholder_capability` -> add MissingCapabilityWidget to state
  - `link_missing_capability_request` -> store capability name in metadata

#### 2.2 -- Invariant Checks
After each apply, verify transform contract invariants:
- `preserve_semantic_node_id`: node.id unchanged
- `do_not_set_runtime_state`: no runtime fields in state
- `do_not_emit_frontend_code`: no JSX/React/CSS strings
- `preserve_interaction_contract`: supportedInteractions unchanged

#### 2.3 -- Tests: `tests/transform-apply.test.js`
- increase_density(TableControls) -> variant becomes compact or collapsible
- simplify_filters -> secondary collapsed, search prioritized
- switch_widget_variant -> variant changed, nothing else touched
- move_to_sidebar rejected on dense_operational (archetype restriction)
- Apply to unknown node -> error
- Chained transforms: simplify_filters + increase_density sequential
- Immutability: applyTransform does not mutate original state

**Estimated: ~8 new tests. Target: >31 tests passing.**

---

### Phase 3: Revision System

#### 3.1 -- Revision Creation
- `createRevision(state, revisionCandidate)`: full version, stores complete state snapshot
- Event-sourced model: Initial State + Transform Chain = Current Revision
- Each revision stores: snapshot state map, parent revisionId, transform chain, appliedCommentIds, created timestamp, author

#### 3.2 -- Revision Storage (in-memory for MVP)
- `revisionStore`: Map<revisionId, Revision>
- `getRevisionChain(featureId, branchId)`: full chain for feature/branch
- `materializeRevision(revisionId)`: replay transform chain from initial state
- `getHeadRevision(featureId, branchId)`: latest revision for branch

#### 3.3 -- Rollback
- `rollbackToRevision(state, targetRevisionId)`: creates a NEW revision based on targetRevision state
- Does NOT delete history
- New revision stores `rollback: true` and `rollbackTargetId`

#### 3.4 -- Branching
- `createBranch(featureId, baseRevisionId, branchName)`: fork a branch
- `switchBranch(featureId, branchId)`: return head revision of branch
- Branch-aware isolation: changes in branch A invisible to branch B

#### 3.5 -- Tests: `tests/revision.test.js`
- Revision chain: initial -> t1 -> t2 -> materialize gives correct state
- Rollback creates new revision, preserves old
- Branch isolation: changes in branch A not in branch B
- Immutability: created revision not mutated by subsequent ops
- Applied comments stored in revision metadata
- Revision metadata (created, author) present

**Estimated: ~7 new tests. Target: >38 tests passing.**

---

### Phase 4: Comment System

#### 4.1 -- Comment Model
- **Comment fields**: id, targetNodeId, branchId, revisionId, intent (normalized transform ID), text (original natural language), lifecycle, authorId, created, updated
- **CommentLifecycle transitions**:
  - `open` -> `applied` (linked to transform that entered a revision)
  - `open` -> `rejected` (explicitly rejected)
  - `applied` -> `approved` (reviewer confirmed)
  - `*` -> `outdated` (target node no longer exists)

#### 4.2 -- Functions
- `createComment(state, targetNodeId, text, intent)`: new comment
- `resolveCommentsByNode(state, nodeId)`: all comments for a node
- `resolveCommentsByRevision(state, revisionId)`: all comments for a revision
- `transitionComment(comment, newLifecycle)`: change lifecycle state
- `linkCommentToTransform(commentId, transformId)`: creates transform linkage

#### 4.3 -- Tests: `tests/comment.test.js`
- Comment lifecycle: open -> applied (via transform linkage)
- Comment to non-existent node -> error
- Outdated: if node removed -> its comments become outdated
- Resolve by node / by revision returns correct lists
- Comment ID stable between revisions

**Estimated: ~5 new tests. Target: >43 tests passing.**

---

### Phase 5: UIKit Component Additions

These are needed BEFORE the Renderer MVP -- renderer needs real components to materialize.

#### 5.1 -- UIKit Drawer
- Path: `uikit-main/Drawer/Drawer.tsx`
- Right-side modal panel, 100vh height
- Props: title, content, actions, width, visible (RUNTIME state, not semantic)
- Semantic anchors on: header, content, actions regions
- Integration props: onClose, onAction

#### 5.2 -- UIKit ButtonDrop
- Path: `uikit-main/ButtonDrop/ButtonDrop.tsx`
- Button with dropdown menu (primary CTA in TableControls)
- Props: label, items (dropdown options), variant, icon, disabled
- Semantic anchors on: button, dropdown

#### 5.3 -- UIKit StatsCards
- Path: `uikit-main/StatsCards/StatsCards.tsx`
- Metric summary cards with trend indicators
- Props: metrics[], density, showTrend, drillTargets
- Semantic anchors on: metrics, trends, drill_targets

#### 5.4 -- Update uikit-bindings.json
- Add actual component paths after implementation
- Add variant -> prop mappings (like SidebarMinibar's layoutMode)

#### 5.5 -- Tests: `tests/uikit-additions.test.js`
- Each component exports from uikit-main
- Each renders without errors with basic props
- Semantic anchor data-attributes present in DOM (data-semantic-node-id, data-semantic-role)

**Estimated: ~5 new tests. Target: >48 tests passing.**

---

### Phase 6: Semantic Anchor Adapter + Renderer MVP

#### 6.1 -- Semantic Anchor Adapter
- `src/anchor-adapter.js`: helper for attaching data-attributes:
  - `attachSemanticAnchor(element, nodeId, role, widgetType?, featureId?)`: sets data-semantic-node-id, data-semantic-role, data-semantic-widget-type, data-semantic-feature-id
  - `getSemanticNodeId(element)`: reads data-semantic-node-id from DOM

#### 6.2 -- AppLayout Renderer
- `src/renderer/AppLayoutRenderer.jsx`
- Structure: outer wrapper (24px padding, 16px gaps) + left SidebarMinibar + right workspace
- Semantic anchors on: left_navigation, right_workspace, breadcrumbs_region, content_area
- Does NOT make UX decisions -- only materializes semantic state

#### 6.3 -- Widget Renderer Compositions
- `TableControlsRenderer`: left block (search -> filters) + right block (secondary outline actions -> primary CTA/ButtonDrop)
- `DataTableRenderer`: DataTableDynamic + pagination below
- `DrawerRenderer`: right-side full-height modal (open/close = runtime only)

#### 6.4 -- Screen Renderer
- `src/renderer/ScreenRenderer.jsx`: receives semantic state -> renders AppLayout -> all widgets -> anchors
- Selection/highlight overlays: hover on semantic node = highlight
- Revision switching: render different revision states

#### 6.5 -- Layout Constraint Verification
- 24px outer padding enforced
- 16px inner gaps enforced
- SidebarMinibar fixed left
- Breadcrumbs always top of right workspace
- TableControls above DataTable
- Pagination below DataTable
- Drawer right-side, full height, modal
- No standalone FiltersBar present

#### 6.6 -- Tests: `tests/renderer.test.js`
- AppLayout renders semantic anchors on all regions
- Pagination below table (placementRules.pagination == below_table)
- TableControls above DataTable
- Semantic anchors on: layout regions, table controls, columns, rows, pagination
- Drawer open/close does NOT modify semantic state
- No forbidden effects emitted (emit_react, emit_jsx, etc.)
- Widget selection/highlight overlay works

**Estimated: ~8 new tests. Target: >56 tests passing.**

---

### Phase 7: Storybook Import + End-to-End + Final Integration

#### 7.1 -- Storybook Inventory Importer
- `tools/import-storybook-inventory.js`: reads uikit-main exports, generates inventory.json
- Syncs uikit-bindings.json with actual available components

#### 7.2 -- End-to-End Test
- `tests/e2e.test.js`:
  - Load semantic-state.mvp-users-crud.json
  - Run through validateIntent -> applyTransform -> createRevision
  - Load revision state
  - Materialize via Renderer
  - Verify all semantic anchors in rendered output
  - Verify layout constraints

#### 7.3 -- Final Verification
- `npm test` runs ALL test groups
- Expected passing: 60+ tests total

---

## Dependency Order (corrected)

```
Phase 0: Foundation (DONE)
    |
Phase 1: Semantic State Model + Schema + Examples
    |
Phase 2: Transform Engine Apply Step
    |
Phase 3: Revision System
    |             |     Phase 5: UIKit Additions (Drawer, ButtonDrop, StatsCards)
    |         /
Phase 4: Comment System
    |
Phase 6: Semantic Anchor Adapter + Renderer MVP
    |
Phase 7: Storybook Import + E2E + Final verification
```

Key fix from previous plan: **Semantic Anchor Adapter moved from before Transform Engine to Phase 6 (Renderer MVP).** Anchors are renderer-side concern, not a prerequisite for transforms.
**UIKit Additions moved to Phase 5 (before Renderer MVP),** parallel with Revision System. Renderer needs these components to exist.

---

## First MVP Screen Target

```
AppLayout
 ├── SidebarMinibar (CombinedNavMenu)
 └── Right Workspace
      ├── Breadcrumbs (BreadCrumbs / GenomeBreadCrumbs)
      └── Content Area
           ├── TableControls (renderer composition)
           ├── DataTable (DataTableDynamic)
           └── Pagination (below table, paginator=true)
```

## Open Decisions

1. **Dataset for MVP table**: "User Management" CRUD -- users with columns (name, email, role, status, lastActive). This fits the crud_management archetype.
2. **React framework for Renderer MVP**: Vite + React (lightweight, fast to set up). Next.js overkill for MVP.
3. **State storage**: MVP: JSON files on disk (same pattern as protocol files). Production: embedded DB or file-based store.
4. **API mode**: MVP: all in-process (Node.js functions). No REST API yet.
5. **Test runner**: Keep it simple -- native Node.js assert, same pattern as conformance.test.js.
6. **uikit-main integration**: Components already in repo. Use them as-is for initial renderer compositions.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| UIKit components have incompatible props | Medium | High | Adapt bindings or write adapter wrappers |
| Renderer too tightly coupled to UIKit | High | Medium | Follow rendererContract abstractions |
| Transform apply produces inconsistent state | Medium | High | Strict invariant checks after each apply |
| Semantic state model too complex for MVP | Low | Medium | Start simple, iterate. Minimum: Screen + Nodes + WidgetInstances. |