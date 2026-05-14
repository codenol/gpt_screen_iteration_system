# 4. Projects

# 4.1 Роль Project в системе

Project — основная бизнес-сущность платформы.

Project представляет собой:
- отдельный продукт
- отдельную доменную область
- отдельную UX ecosystem
- отдельный semantic context
- контейнер экранов и UX knowledge

Project является:
- business boundary
- semantic boundary
- UX boundary
- collaboration boundary

---

# 4.2 Главная задача Project

Project существует для:

```text
формирования domain-aware UX context
```

Project задаёт:
- что проектируется
- для кого проектируется
- какие UX priorities важны
- какие interaction patterns допустимы
- какие archetypes предпочтительны

Без Project система теряет:
- domain semantics
- UX consistency
- contextual reasoning
- explainability

---

# 4.3 Project как semantic context

Project — главный источник domain context.

Этот context используется:
- LLM
- Design Protocol
- transform engine
- screen composition
- intent interpretation

---

## 4.3.1 Project semantic description

Каждый Project содержит semantic description.

Описание проекта — обязательная сущность.

Это не documentation block.

Это:

```text
active semantic context for UX reasoning
```

---

## 4.3.2 Что может содержать Project description

Project description может содержать:

### Domain description
- что это за система
- какая бизнес-область
- какие сущности существуют

---

### User types
- операторы
- аналитики
- менеджеры
- администраторы
- инженеры

---

### UX priorities
- speed
- density
- simplicity
- discoverability
- analytics
- operational efficiency

---

### Interaction philosophy
- keyboard-first
- mouse-first
- dense operational UI
- wizard flows
- dashboard-centric

---

### Data characteristics
- large datasets
- realtime data
- sparse entities
- hierarchical structures
- monitoring streams

---

### Domain constraints
- strict workflows
- regulatory requirements
- accessibility requirements
- operational limitations

---

## 4.3.3 Пример Project description

```text
Проект: Monitoring Platform

Тип системы:
Платформа мониторинга ПАК.

Пользователи:
- инженеры
- операторы
- аналитики

UX priorities:
- высокая плотность информации
- минимальное количество кликов
- быстрый поиск
- постоянная видимость фильтров

Data characteristics:
- большие таблицы
- realtime updates
- hierarchical entities

Interaction philosophy:
- tables first
- compact layouts
- dark mode preferred
```

---

# 4.4 Project semantic memory

Project хранит UX knowledge.

Например:
- approved patterns
- accepted transforms
- preferred layouts
- common workflows
- historical UX decisions

---

## 4.4.1 Зачем нужна semantic memory

Semantic memory позволяет:
- повышать consistency
- переиспользовать решения
- уменьшать entropy
- улучшать transforms
- делать UX evolution explainable

---

## 4.4.2 Примеры reusable knowledge

Например:

```text
В этом проекте:
- filters всегда compact
- cards discouraged
- tables primary
- details open in drawer
```

или:

```text
Approval workflows всегда используют:
- right-side drawer
- timeline block
- sticky actions
```

---

# 4.5 Project UX identity

Каждый Project имеет собственную UX identity.

UX identity формируется через:
- Design Protocol
- semantic memory
- historical decisions
- approved revisions
- preferred archetypes

---

## 4.5.1 Почему UX identity важна

Без Project UX identity:
- transforms становятся inconsistent
- screens начинают diverge
- UX reasoning деградирует
- semantic continuity теряется

---

# 4.6 Project screens

Project состоит из Screens.

Screens внутри Project:
- наследуют semantic context
- используют shared UX rules
- используют shared terminology
- используют shared archetypes

---

## 4.6.1 Screen grouping

Project может группировать Screens:
- по workflows
- по business domains
- по user roles
- по release stages

Например:

```text
Project
 ├── Monitoring
 ├── Analytics
 ├── Administration
 └── Approval Flows
```

---

# 4.7 Project archetypes

Project может иметь preferred archetypes.

Например:

```text
Monitoring Project:
- operational dashboards
- dense tables
- monitoring timelines
- compact filter layouts
```

---

## 4.7.1 Archetype influence

Preferred archetypes влияют на:
- initial screen composition
- transform suggestions
- widget prioritization
- UX recommendations

---

# 4.8 Project widget preferences

Project может задавать:
- preferred widgets
- discouraged widgets
- mandatory widgets
- widget variants

---

## 4.8.1 Примеры widget preferences

```text
Project rules:
- DataTable preferred
- cards discouraged
- compact filters mandatory
- details via drawer
```

---

# 4.9 Project terminology system

Project содержит domain terminology.

Например:
- сущности
- аббревиатуры
- aliases
- business language

---

## 4.9.1 Почему terminology важна

Terminology влияет на:
- screen naming
- widget labels
- transform interpretation
- semantic reasoning
- LLM understanding

---

## 4.9.2 Пример terminology

```text
ПАК = программно-аппаратный комплекс
МБД = модуль баз данных
Инцидент = operational event
```

---

# 4.10 Project collaboration

Project — collaboration boundary.

Project управляет:
- participants
- reviews
- approvals
- ownership
- review workflows

---

## 4.10.1 Project participants

Project может содержать:
- designers
- analysts
- frontend engineers
- backend engineers
- QA
- PO
- guests

---

## 4.10.2 Project ownership

Project может иметь:
- UX owners
- business owners
- technical reviewers
- approval chains

---

# 4.11 Project review workflows

Project может задавать:
- review stages
- approval rules
- mandatory reviewers
- revision policies

Например:

```text
Flow:
Designer Review
 → Analyst Review
   → PO Approval
```

---

# 4.12 Project branching

Project поддерживает:
- parallel UX exploration
- alternative revisions
- experimental flows
- feature branches

---

## 4.12.1 Пример branching

```text
Users Screen
 ├── Dense Layout Branch
 ├── Sidebar Filters Branch
 └── Analytics Variant Branch
```

---

# 4.13 Project search

Project поддерживает semantic search.

Поиск может работать по:
- screens
- widgets
- transforms
- comments
- UX patterns
- revisions
- archetypes

---

## 4.13.1 Примеры search

```text
Найти все approval workflows
```

```text
Найти все compact table implementations
```

```text
Найти screens с analytics sidebar
```

---

# 4.14 Project sharing

Project поддерживает sharing.

Можно делиться:
- project overview
- screen links
- feature links
- revision links
- review snapshots

---

## 4.14.1 Sharing modes

Sharing может быть:
- internal
- invite-only
- public review
- read-only
- comment-enabled

---

# 4.15 Project lifecycle

Project имеет lifecycle.

Например:
- draft
- active
- review
- approved
- archived

---

## 4.15.1 Lifecycle influence

Lifecycle влияет на:
- transforms
- approvals
- editing permissions
- sharing policies
- review workflows

---

# 4.16 Project integrations

Project может использовать integrations.

Например:
- Jira
- Confluence
- GitHub
- internal APIs
- documentation systems

---

## 4.16.1 Integration usage

Integrations могут использоваться для:
- importing requirements
- linking tickets
- exporting revisions
- syncing documentation
- review notifications

---

# 4.17 Project analytics

Project может собирать:
- UX iteration counts
- transform statistics
- unresolved comments
- review timings
- most problematic features
- most used archetypes

---

## 4.17.1 UX intelligence

Project analytics позволяет:
- находить unstable UX areas
- выявлять problematic widgets
- улучшать Design Protocol
- улучшать workflows

---

# 4.18 Project architectural importance

Project — главный domain context layer.

Project определяет:
- как система понимает domain
- как система reasoning about UX
- какие transforms допустимы
- какие archetypes предпочтительны

Project связывает:
- business semantics
- UX semantics
- collaboration
- evolution history

Без Project система теряет:
- contextual UX reasoning
- domain consistency
- reusable UX identity
- explainable UX evolution

