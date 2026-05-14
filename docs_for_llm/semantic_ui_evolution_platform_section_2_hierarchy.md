# 2. Иерархия системы

# 2.1 Общая структура

Система организована как semantic hierarchy.

Базовая структура:

```text
Workspace
 └── Projects
      └── Screens
           └── Features
                └── Revisions
                     └── Comments
```

Каждый уровень hierarchy:
- имеет собственный semantic context
- влияет на UX reasoning
- влияет на transform system
- влияет на LLM context
- участвует в explainability

Hierarchy является:
- organizational model
- semantic context model
- permission model
- collaboration model
- navigation model

---

# 2.2 Принципы hierarchy

## 2.2.1 Context inheritance

Каждый уровень наследует semantic context сверху.

Например:

```text
Workspace
  ↓
Project
  ↓
Screen
  ↓
Feature
```

Feature знает:
- context screen
- context project
- context workspace

Это позволяет:
- делать consistent UX
- использовать domain semantics
- уменьшать entropy генерации
- улучшать UX reasoning

---

## 2.2.2 Isolation

Каждый уровень hierarchy изолирован.

Например:
- revisions feature не ломают screen
- screen changes не ломают project
- comments привязаны локально

Isolation нужен для:
- branching
- collaboration
- rollback
- version safety

---

## 2.2.3 Semantic boundaries

Каждый уровень hierarchy является отдельным semantic boundary.

Например:

## Project
Отвечает за:
- domain
- business semantics
- global UX patterns

---

## Screen
Отвечает за:
- конкретный workflow
- UX scenario
- layout composition

---

## Feature
Отвечает за:
- локальную UX capability
- widget composition
- локальную interaction model

---

# 2.3 Workspace

Workspace — верхний уровень платформы.

Workspace представляет собой:
- организацию
- команду
- продуктовую среду
- semantic ecosystem

---

## 2.3.1 Workspace responsibilities

Workspace отвечает за:
- users
- roles
- permissions
- projects
- global settings
- Design Protocol
- widget registry
- organization-wide semantics

---

## 2.3.2 Workspace semantic context

Workspace может содержать:
- design philosophy
- UX guidelines
- terminology
- glossary
- organization patterns
- naming conventions
- preferred interaction patterns

Пример:

```text
Workspace: Enterprise Monitoring Systems

Rules:
- dense layouts preferred
- dark mode default
- operational workflows primary
- tables preferred over cards
```

Этот context используется:
- transform engine
- LLM
- Design Protocol
- screen composition

---

## 2.3.3 Workspace isolation

Workspace полностью изолирован.

Это означает:
- отдельные users
- отдельные roles
- отдельный Design Protocol
- отдельные projects
- отдельная semantic history

---

# 2.4 Projects

Project — основная бизнес-сущность платформы.

Project представляет собой:
- отдельный продукт
- отдельную бизнес-доменную область
- отдельную UX ecosystem

---

## 2.4.1 Project responsibilities

Project отвечает за:
- business context
- domain semantics
- screen organization
- feature grouping
- product goals
- UX consistency

---

## 2.4.2 Project description

Project обязательно содержит semantic description.

Описание проекта используется:
- LLM
- transform engine
- Design Protocol
- UX reasoning

Описание может содержать:
- domain description
- target users
- UX philosophy
- constraints
- workflows
- business rules
- architecture notes
- data characteristics

---

## 2.4.3 Пример project description

```text
Проект: Monitoring Platform

Особенности:
- много dense data
- high-speed analysis
- tables primary
- filters critical
- dark mode primary
- monitoring workflows
- operational UI
```

---

## 2.4.4 Project metadata

Project может содержать:
- tags
- domains
- statuses
- owners
- participants
- review policies
- release stages

---

## 2.4.5 Project-level semantic memory

Project хранит:
- accepted UX decisions
- historical patterns
- common transforms
- preferred archetypes
- semantic history

Это позволяет:
- повышать consistency
- улучшать future transforms
- переиспользовать UX decisions

---

# 2.5 Screens

Screen — главная UX-сущность платформы.

Screen представляет собой:
- отдельный UX scenario
- отдельный workflow
- отдельную semantic composition

---

## 2.5.1 Screen responsibilities

Screen отвечает за:
- UX flow
- layout composition
- widget composition
- interaction structure
- semantic regions
- overlays
- contextual workflows

---

## 2.5.2 Screen description

Screen содержит semantic description.

Описание используется для:
- UX reasoning
- transform analysis
- screen composition
- intent interpretation

Описание может содержать:
- screen goal
- primary workflow
- user tasks
- interaction patterns
- business constraints
- critical UX areas

---

## 2.5.3 Пример screen description

```text
Экран управления пользователями.

Главная задача:
- быстро находить пользователей
- менять роли
- смотреть активность

Критично:
- быстрые фильтры
- compact table
- высокая плотность данных
```

---

## 2.5.4 Screen composition

Screen состоит из:
- semantic regions
- widgets
- overlays
- features

Например:

```text
Screen
 ├── Header
 ├── Main Content
 ├── Filters Sidebar
 ├── Drawer
 └── Action Toolbar
```

---

## 2.5.5 Screen overlays

Screen поддерживает overlays:
- modal
- drawer
- context panel
- tooltip systems
- floating inspectors

Overlays являются частью screen context.

---

# 2.6 Features

Feature — минимальная independently evolving UX capability.

Feature представляет собой:
- semantic interaction block
- отдельную UX capability
- отдельный review target

---

## 2.6.1 Почему feature является ключевой сущностью

Большинство feedback относится:
- не ко всему экрану
- а к конкретной UX capability

Например:
- filters
- analytics panel
- user table
- timeline
- drawer

Поэтому evolution происходит primarily на feature-level.

---

## 2.6.2 Feature responsibilities

Feature отвечает за:
- widget composition
- local UX behavior
- semantic regions
- local revisions
- local comments
- local transforms

---

## 2.6.3 Feature composition

Feature может состоять из:
- одного widget
- нескольких widgets
- nested semantic nodes

Пример:

```text
Filters Feature
 ├── Search Input
 ├── Status Filter
 ├── Date Filter
 └── Advanced Filters
```

---

## 2.6.4 Feature independence

Feature должен быть:
- independently reviewable
- independently transformable
- independently versioned

Это позволяет:
- granular comments
- localized revisions
- safer transforms
- parallel collaboration

---

# 2.7 Revisions

Revision — semantic version feature.

Revision представляет собой:
- transform result
- новое semantic state
- новую UX iteration

---

## 2.7.1 Revision responsibilities

Revision хранит:
- applied transforms
- revision state
- explainability data
- applied comments
- revision metadata
- author information
- timestamps

---

## 2.7.2 Revision model

Источник истины:

Не snapshot.

А:

```text
transform history
```

Current revision вычисляется как:

```text
Initial State
 + Transform Chain
 = Current Revision
```

---

## 2.7.3 Revision metadata

Revision может содержать:
- revision title
- revision notes
- accepted comments
- rejected comments
- transform explanations
- semantic reasoning

---

## 2.7.4 Revision branching

Система поддерживает branching.

Например:

```text
Revision A:
Compact filters

Revision B:
Sidebar filters
```

Это позволяет:
- сравнивать UX approaches
- проводить review
- тестировать варианты

---

# 2.8 Comments

Comment — semantic feedback unit.

Comment всегда:
- привязан к semantic node
- относится к конкретной revision
- участвует в transform system

---

## 2.8.1 Comment structure

Comment содержит:
- target node
- semantic intent
- feedback text
- author
- timestamps
- lifecycle state

---

## 2.8.2 Comment targeting

Комментарии могут быть привязаны:
- к feature
- к widget
- к widget region
- к nested semantic node

Чем granular targeting — тем лучше UX review.

---

## 2.8.3 Comment lifecycle

Comment может быть:
- open
- applied
- approved
- rejected
- outdated

---

# 2.9 Semantic Context Flow

Hierarchy формирует semantic context flow.

Например:

```text
Workspace Context
  ↓
Project Context
  ↓
Screen Context
  ↓
Feature Context
  ↓
Revision Context
```

Этот context используется:
- LLM
- transform engine
- Design Protocol
- semantic reasoning

---

# 2.10 Permission Model

Hierarchy также формирует permission boundaries.

Permissions могут назначаться на:
- workspace
- project
- screen
- feature
- revision

Например:
- designer может review screen
- frontend может comment feature
- guest может смотреть revision link

---

# 2.11 Navigation Model

Hierarchy является navigation model.

Пользователь перемещается:

```text
Workspace
 → Project
   → Screen
     → Feature
       → Revision
```

Каждый уровень:
- имеет собственный URL
- имеет собственный context
- может быть shared independently

---

# 2.12 Sharing Model

Система поддерживает sharing:
- project links
- screen links
- feature links
- revision links

Sharing может быть:
- public
- role-restricted
- invite-only
- review-only

---

# 2.13 Architectural Importance

Hierarchy является:
- semantic backbone платформы
- collaboration backbone
- context backbone
- permission backbone
- UX reasoning backbone

Без hierarchy невозможно:
- стабильное semantic reasoning
- explainable transforms
- scalable collaboration
- reusable UX knowledge

