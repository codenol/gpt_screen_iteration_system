# 5. Screens

# 5.1 Роль Screen в системе

Screen — главная UX-сущность платформы.

Screen представляет собой:
- отдельный пользовательский сценарий
- отдельный workflow
- отдельную semantic composition
- отдельную UX-сцену
- единицу проектирования и обсуждения

Именно вокруг Screen строится:
- review
- collaboration
- UX iteration
- semantic evolution
- visual discussion

---

# 5.2 Главная задача Screen

Screen существует для:

```text
решения конкретной пользовательской задачи
```

Например:
- управление пользователями
- просмотр мониторинга
- аналитика
- approval workflow
- управление инцидентами
- поиск сущностей

Screen не является:
- страницей React
- роутом
- DOM tree
- layout configuration

Screen является:

```text
semantic UX workspace
```

---

# 5.3 Screen как semantic context

Каждый Screen имеет собственный semantic context.

Screen context используется:
- Design Protocol
- transform engine
- LLM
- renderer
- intent interpretation

---

## 5.3.1 Screen description

Каждый Screen содержит semantic description.

Описание экрана — обязательная сущность.

Описание используется как:

```text
active UX reasoning context
```

---

## 5.3.2 Что может содержать Screen description

Screen description может содержать:

### Основная задача
- что делает пользователь
- какая цель экрана

---

### Primary workflow
- основной пользовательский сценарий
- expected interaction flow

---

### Critical UX zones
- важные области
- areas requiring visibility
- areas requiring speed

---

### Data characteristics
- dense data
- realtime updates
- hierarchical entities
- analytics blocks

---

### Interaction expectations
- keyboard navigation
- compact layouts
- persistent filters
- quick actions

---

## 5.3.3 Пример Screen description

```text
Экран управления пользователями.

Главная задача:
- быстро находить пользователей
- менять роли
- смотреть активность

Критично:
- быстрый поиск
- compact table
- постоянная видимость фильтров
- drawer вместо modal
```

---

# 5.4 Screen composition

Screen состоит из:
- semantic regions
- widgets
- overlays
- features
- interaction zones

---

## 5.4.1 Semantic regions

Screen разбивается на semantic regions.

Например:

```text
Screen
 ├── Header
 ├── Main Content
 ├── Filters Area
 ├── Analytics Sidebar
 ├── Action Toolbar
 └── Details Drawer
```

---

## 5.4.2 Region semantics

Каждый region имеет:
- semantic role
- visual priority
- UX priority
- interaction purpose
- contextual behavior

---

## 5.4.3 Region hierarchy

ДС знает:
- primary regions
- secondary regions
- contextual regions
- overlays
- temporary regions

Это позволяет:
- consistent layouts
- explainable transforms
- stable UX structure

---

# 5.5 Screen overlays

Screen поддерживает overlays.

Overlays являются частью screen semantics.

---

## 5.5.1 Overlay types

Поддерживаются:
- drawer
- modal
- side panel
- inspector
- floating context panel
- contextual popover

---

## 5.5.2 Overlay semantics

ДС знает:
- когда overlays допустимы
- какие overlays предпочтительны
- какие workflows требуют overlays

Например:

```text
Operational workflows:
- prefer drawer over modal
```

---

# 5.6 Screen layout model

Screen не хранит raw CSS layout.

Screen хранит:
- semantic layout structure
- region relations
- visual hierarchy
- UX priorities

---

## 5.6.1 Layout semantics

Например:

```text
Primary Content
Secondary Context
Persistent Filters
Contextual Actions
```

Вместо:

```text
flex-row gap-12
```

---

## 5.6.2 Layout constraints

ДС может задавать:
- allowed layouts
- density profiles
- region priorities
- adaptive behaviors

---

# 5.7 Screen archetypes

Screen обычно основан на archetype.

Archetype задаёт:
- базовую структуру
- preferred widgets
- interaction model
- layout semantics
- UX priorities

---

## 5.7.1 Примеры archetypes

- CRUD screen
- monitoring screen
- analytics dashboard
- approval workflow
- operational console
- catalog explorer

---

## 5.7.2 Archetype adaptation

Система не генерирует Screen с нуля.

Система:
- выбирает archetype
- адаптирует его
- применяет domain semantics
- применяет transforms

---

# 5.8 Screen Features

Screen состоит из Features.

Feature — independently evolving UX capability.

Например:

```text
Users Screen
 ├── Filters Feature
 ├── Table Feature
 ├── Details Drawer Feature
 └── Analytics Feature
```

---

## 5.8.1 Почему Screen делится на Features

Большинство UX feedback относится:
- не ко всему Screen
- а к конкретной capability

Например:
- filters
- table
- drawer
- analytics panel

Это позволяет:
- granular comments
- localized revisions
- independent transforms
- parallel review

---

# 5.9 Screen semantic nodes

Screen содержит semantic node tree.

Semantic nodes используются для:
- comments
- targeting
- transforms
- explainability
- review

---

## 5.9.1 Пример semantic tree

```text
users_screen
 ├── filters
 │    ├── search
 │    ├── status_filter
 │    └── advanced_filters
 │
 ├── users_table
 │    ├── toolbar
 │    ├── rows
 │    └── pagination
 │
 └── details_drawer
```

---

## 5.9.2 Stable anchors

Каждый semantic node обязан иметь:
- stable id
- semantic role
- selectable region

Это необходимо для:
- comments
- revisions
- transforms
- visual review

---

# 5.10 Screen interaction model

Интерактив встроен в widgets.

Screen не описывает low-level logic.

Screen описывает:
- semantic interactions
- contextual relations
- UX behavior expectations

---

## 5.10.1 Built-in interactions

Например:

### DataTable
Уже умеет:
- filtering
- sorting
- grouping
- selection
- pagination

---

### Form
Уже умеет:
- validation
- grouped fields
- dirty state

---

### Chart
Уже умеет:
- hover
- zoom
- legend interactions

---

# 5.11 Screen evolution

Screen является evolving entity.

Screen развивается через:
- comments
- transforms
- revisions
- approvals
- branching

---

## 5.11.1 Screen revisions

Screen revisions формируются как:

```text
Initial Screen
 + Transform Chain
 = Current Revision
```

---

## 5.11.2 Screen evolution goals

Evolution направлена на:
- UX refinement
- workflow optimization
- clarity
- density optimization
- interaction simplification

---

# 5.12 Screen comments

Comments всегда привязываются:
- к semantic nodes
- к widget regions
- к Features

Чем granular targeting — тем лучше.

---

## 5.12.1 Примеры comments

```text
users_table.filters.status
→ Слишком большой select
```

```text
details_drawer
→ Нужно больше контекста
```

---

# 5.13 Screen transforms

Screen изменяется через semantic transforms.

Например:
- increase_density
- simplify_filters
- prioritize_search
- reduce_visual_noise
- move_to_sidebar

---

## 5.13.1 Candidate transforms

ДС может предлагать несколько вариантов.

Например:

```text
Сделать фильтры компактнее:

1. Toolbar mode
2. Sidebar mode
3. Collapsible mode
```

---

# 5.14 Screen explainability

Screen evolution должна быть explainable.

Система должна показывать:
- что изменилось
- почему изменилось
- какие comments учтены
- какие transforms применены

---

## 5.14.1 Revision explanations

Например:

```text
Изменения:
- filters collapsed
- spacing reduced
- toolbar simplified

Причина:
- feedback от дизайнера
- operational density heuristic
```

---

# 5.15 Screen review workflow

Screen — основная review entity.

Review включает:
- visual comparison
- comments
- approvals
- semantic discussions
- UX validation

---

## 5.15.1 Version review

Пользователи:
- переключаются между revisions
- смотрят applied comments
- approve/reject changes
- продолжают iteration loop

---

# 5.16 Screen branching

Screen поддерживает alternative UX branches.

Например:

```text
Users Screen
 ├── Dense Variant
 ├── Sidebar Filters Variant
 └── Analytics Variant
```

---

## 5.16.1 Зачем branching нужен

Branching позволяет:
- сравнивать UX approaches
- проводить experiments
- делать parallel exploration
- обсуждать альтернативы

---

# 5.17 Screen sharing

Можно делиться:
- screen links
- feature links
- revision links
- review snapshots

---

## 5.17.1 Review sharing

Sharing может быть:
- read-only
- comment-enabled
- approval-enabled
- public review
- invite-only

---

# 5.18 Screen lifecycle

Screen имеет lifecycle.

Например:
- draft
- active exploration
- review
- approved
- archived

---

## 5.18.1 Lifecycle influence

Lifecycle влияет на:
- transforms
- editing permissions
- review policies
- sharing rules

---

# 5.19 Screen analytics

Screen может собирать:
- transform counts
- unresolved comments
- review timings
- problematic features
- UX instability areas

---

# 5.20 Screen architectural importance

Screen — главная UX operating unit платформы.

Именно на уровне Screen происходят:
- UX discussions
- visual review
- semantic evolution
- collaboration
- transform application
- approvals

Screen связывает:
- domain semantics
- Design Protocol
- widgets
- transforms
- collaboration
- renderer

Screen является:

```text
central semantic UX workspace
```

