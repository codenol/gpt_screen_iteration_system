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

Current validation status: **14/14 conformance tests passed**

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
| Drawer | Drawer | **implemented** |
| StatsCards | StatsCards | **implemented** |
| ButtonDrop | ButtonDrop | **implemented** |

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
- [x] Conformance tests (`tests/conformance.test.js`) — 14/14
- [x] `.gitignore`
- [x] Git init, remote set (`github.com/codenol/gpt_screen_iteration_system`), commit, push

---

### Phase 1: Semantic State Model (DONE) ✓

#### 1.1 -- JSON Schema for Semantic State ✅
Create `protocol/schemas/semantic-state.schema.json`.
Validates: Workspace, Project, Screen, Feature, SemanticNode (tree), WidgetInstance[], Branch[], Revision[], Comment[].

#### 1.2 -- Formal Data Structures ✅ (captured in schema)
- **Workspace**: org, users, roles, Design Protocol reference
- **Project**: domain semantics, description, screens[]
- **Screen**: UX scenario, archetype reference, features[], layout regions
- **Feature**: minimal independently evolving UX capability, widget composition, semantic nodes, revisions[]
- **SemanticNode**: id, role, children[], targetable, metadata. IDs must be stable, deterministic, hierarchical.
- **WidgetInstance**: widgetType, nodeId, variant, props
- **Branch**: name, baseRevisionId, headRevisionId
- **Revision**: baseRevisionId, branchId, transforms[], appliedCommentIds[], created, author
- **Comment**: targetNodeId, revisionId, branchId, intent (normalized), text, lifecycle (open/applied/approved/rejected/outdated)

#### 1.3 -- Example Semantic State ✅
Create `examples/semantic-state.mvp-users-crud.json`:
- Screen: users_management, archetype: crud_management
- Features: table_feature, drawer_feature
- Full node tree: screen -> table_controls (left.search, left.filters, right.secondary_actions, right.cta) + data_table (pagination) + details_drawer
- WidgetInstances: TableControls(standard), DataTableDynamic(comfortable), Drawer(standard)
- Initial Revision: initial_state_v1

#### 1.4 -- Extend protocol-core.js ✅
- `validateSemanticState(protocol, state)`: checks node roles known, widget types registered, revision/branch references consistent
- `loadSemanticState(path)`
- `toLightweightState(doc)`, `collectNodeIds(nodes)`, `walkNodes(nodes, visitor)`
- `resolveArchetype(state)`, `resolveRevisionId(state)`, `resolveBranchId(state)` — работать с обоими форматами state

#### 1.5 -- Tests: `tests/semantic-state.test.js` ✅
- Stable node IDs, widget ownership, branch/revision references — 15 tests pass
- `npm test` теперь запускает оба набора: 29 тестов

**Estimated: ~10 new tests. Result: 15 new tests. Total: 29 tests passing.** ✅

---

### Phase 2: Transform Engine Apply Step (DONE) ✓

#### 2.1 -- Apply Functions ✅
- `applyTransform(state, validatedTransform)`: deep-clones state, applies effects, returns new state
- `applyEffects(state, effects, targetNode, targetWidget)`: dispatchers for all 8 effect types
- `applyToTargetOrChild(targetNode, targetRole, fn)`: smart target resolution

#### 2.2 -- Invariant Checks ✅
- `checkInvariants(state, contract, targetNodeId)`: verifies all invariants after apply
- `preserve_semantic_node_id`, `do_not_set_runtime_state`, `do_not_emit_frontend_code`

#### 2.3 -- Tests: `tests/transform-apply.test.js` ✅
- increase_density → variant compact/collapsible, simplify_filters, switch_widget_variant
- collapse_secondary, prioritize_search, reduce_visual_weight
- Chained applies, immutability, unknown node → null
- 9 new tests pass

**Estimated: ~8 new tests. Result: 9 new tests. Total: 38 tests passing.** ✅

---

### Phase 3: Revision System (DONE) ✓

#### 3.1 -- Revision Creation ✅
- `createRevision(store, state, validatedTransform, commentId)`: applies transform, creates new revision with state snapshot, stores in revision store
- `createRevisionStore()`: in-memory Map-based store

#### 3.2 -- Storage & Queries ✅
- `getRevisionChain(store, branchId)`: ordered chain for branch
- `getHeadRevision(store, branchId)`: latest revision
- `materializeRevision(store, revisionId, initialNodes, initialWidgets)`: replay chain

#### 3.3 -- Rollback ✅
- `rollbackToRevision(store, state, targetRevisionId)`: creates NEW revision, preserves history
- `rollback: true`, `rollbackTargetId` metadata

#### 3.4 -- Branching ✅
- `createBranch(store, branchId, branchName, baseRevisionId)`: fork a branch

#### 3.5 -- Tests: `tests/revision.test.js` ✅
- Chain traversal, head revision, rollback creates new/protects old
- Branch creation, rollback to nonexistent = null
- 8 new tests pass

**Estimated: ~7 new tests. Result: 8 new tests. Total: 46 tests passing.** ✅

---

### Phase 4: Comment System (DONE) ✓

#### 4.1 -- Comment Model ✅
- Fields: id, targetNodeId, revisionId, branchId, intent, text, lifecycle, authorId, created, updated, linkedTransformId

#### 4.2 -- Functions ✅
- `createComment(state, targetNodeId, text, intent)`: validates node exists
- `resolveCommentsByNode(state, nodeId)`, `resolveCommentsByRevision(state, revisionId)`
- `transitionComment(comment, newLifecycle)`: validates state transitions
- `linkCommentToTransform(comment, transformId)`: sets lifecycle → applied

#### 4.3 -- Tests: `tests/comment.test.js` ✅
- Lifecycle: open → applied → approved, open → rejected, invalid transitions
- Node/resolve filtering, transform linkage, ID stability
- 10 new tests pass

**Estimated: ~5 new tests. Result: 10 new tests. Total: 56 tests passing.** ✅

---

### Phase 5: UIKit Component Additions (DONE) ✓

These are needed BEFORE the Renderer MVP -- renderer needs real components to materialize.

#### 5.1 -- UIKit Drawer ✅
- Path: `uikit-main/Drawer/Drawer.tsx`
- Right-side modal panel, 100vh height. Props: title, content, actions, width, visible (RUNTIME).
- Semantic anchors on: header, content, actions regions

#### 5.2 -- UIKit ButtonDrop ✅
- Path: `uikit-main/ButtonDrop/ButtonDrop.tsx`
- Button with dropdown menu (primary CTA in TableControls)
- Props: label, items, variant, icon, disabled

#### 5.3 -- UIKit StatsCards ✅
- Path: `uikit-main/StatsCards/StatsCards.tsx`
- Metric summary cards with trend indicators
- Props: metrics[], density, showTrend, drillTargets, onDrill

#### 5.4 -- Update uikit-bindings.json ✅
- All three requiredUikitAdditions: status changed to "implemented"
- Drawer and StatsCards implementationStatus: "implemented"

---

### Phase 6: Semantic Anchor Adapter + Renderer MVP (DONE) ✓

#### 6.1 -- Semantic Anchor Adapter ✅
- `src/anchor-adapter.js`: attachSemanticAnchor, getSemanticNodeId, getSemanticRole
- `ANCHOR_ATTRS` constants: NODE_ID, ROLE, WIDGET_TYPE, FEATURE_ID, REVISION_ID

#### 6.2–6.4 -- Renderer Contracts ✅
- `validateRendererLayout(bindings, rendered)`: checks layout structure (24px, 16px, regions)
- `validateRendererAnchors(bindings, elements)`: checks anchors only for active widgets
- `validatePlacementRules(bindings, elements)`: controls above, pagination below
- `simulateRender(state, bindings)`: generates expected DOM element map

#### 6.5 -- Layout Constraint Verification ✅
- 24px outer padding, 16px inner gaps enforced
- SidebarMinibar, Breadcrumbs, Content Area regions required
- Controls above table, pagination below verified

#### 6.6 -- Tests: `tests/renderer.test.js` ✅
- Simulated render produces valid layout + anchors + placement
- Transform + re-render works
- Bad placement caught, missing anchors caught
- No forbidden effects emitted
- 8 new tests pass

**Result: 8 new tests. Total: 64 tests passing.** ✅

---

### Phase 7: Storybook Import + End-to-End + Final Integration (DONE) ✓

#### 7.1 -- Storybook Inventory Importer ✅
- `tools/import-storybook-inventory.js`: scans uikit-main, generates `protocol/uikit-inventory.json`
- 33 components found in inventory

#### 7.2 -- End-to-End Test ✅
- `tests/e2e.test.js`: full pipeline tests
  - Load state → validate intent → apply transform → create revision → simulate render → verify
  - Multi-step transform chain (simplify_filters + reduce_visual_weight)
  - Full pipeline from semantic state file → render → verify anchors

#### 7.3 -- Final Verification ✅
- **npm test: 67 tests, all passing** (14 conformance + 15 semantic + 9 transform + 8 revision + 10 comment + 8 renderer + 3 E2E)

**Total: 67 tests passing.** ✅

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