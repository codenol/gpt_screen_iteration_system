# Semantic UI Evolution Platform — Архитектурная концепция

## 1. Суть системы

Система представляет собой collaborative-песочницу для:
- аналитиков
- дизайнеров
- PO
- частично разработчиков

Главная задача системы:
- быстро собирать интерактивные экраны
- обсуждать их
- эволюционно улучшать через feedback loop
- сохранять историю изменений
- сравнивать версии
- подтверждать исправления

Система НЕ является:
- генератором production frontend
- low-code платформой общего назначения
- визуальным React builder
- drag-and-drop конструктором

Система является:
- UX-aware collaborative prototyping platform
- semantic screen evolution system

---

# 2. Основная концепция

Главная сущность системы:

Не экран.
Не YAML.
Не React.

Главная сущность:

## Screen Session

Screen Session — это история эволюции одного экрана.

Внутри:
- initial intent
- generated screen
- comments
- revisions
- transforms
- approvals
- version history

Текущий экран — это materialized projection всей цепочки изменений.

---

# 3. Основной цикл работы

```text
User Intent
  ↓
Initial Screen
  ↓
Comments / Feedback
  ↓
Intent Interpretation
  ↓
Transform Resolution
  ↓
New Revision
  ↓
Updated Screen
```

Повторяется до тех пор, пока экран не будет утверждён.

---

# 4. Базовые принципы

## 4.1 Экран — главная единица

Система работает преимущественно в рамках:
- одного экрана
- модалок
- drawer
- overlay-элементов

Это intentional limitation.

Система не пытается описывать всё приложение целиком.

---

## 4.2 Интерактив встроен в widgets

Интерактив не описывается пользователем вручную.

Каждый widget уже умеет:
- filtering
- sorting
- grouping
- pagination
- tabs
- раскрытие
- selection
- form interactions
- локальные состояния

Система работает на уровне:
- semantic composition
- UX transformations

А не на уровне программирования интерактива.

---

## 4.3 Renderer deterministic

Renderer:
- не принимает UX-решений
- не генерирует layout самостоятельно
- не интерпретирует пользовательские намерения

Renderer:
- получает resolved screen model
- отображает widgets
- отображает semantic anchors
- отображает revisions

---

# 5. Structured Screen Model

Экран хранится как semantic model.

Не как React tree.
Не как HTML.
Не как JSX.

Screen Model описывает:
- semantic regions
- widgets
- layout semantics
- priorities
- relations
- variants

Пример:

```json
{
  "screen": {
    "title": "Users"
  },

  "regions": [
    {
      "id": "main",
      "widgets": [
        {
          "id": "users_table",
          "type": "data_table"
        }
      ]
    }
  ]
}
```

---

# 6. Widget System

Widget — это semantic UI module.

Widget — это НЕ просто React component.

Каждый widget обязан иметь:
- renderer
- semantic tree
- selectable regions
- transform capabilities
- stable anchors
- explainability metadata

---

## 6.1 Widget Registry

Система использует только predefined widgets.

Например:
- DataTable
- Form
- Tabs
- StatsCards
- Chart
- FiltersBar
- DetailPanel
- Timeline
- Kanban
- ActivityFeed

---

## 6.2 Missing Capability Widget

Если системе нужен widget, которого нет:

Показывается специальный placeholder widget.

Он:
- визуально заметен
- показывает отсутствующую capability
- позволяет обсуждать необходимость нового widget

Это не ошибка.
Это механизм развития платформы.

---

# 7. Design Protocol System (ДС)

Главное интеллектуальное ядро системы.

ДС содержит:
- UX heuristics
- widget capabilities
- layout semantics
- screen archetypes
- interaction rules
- transformation rules
- anti-patterns
- responsive behavior
- visual hierarchy rules

ДС — это:

```text
UI grammar + UX knowledge base + transformation engine rules
```

---

# 8. Intent Interpretation

Пользователь НЕ управляет системой техническими командами.

Пользователь пишет естественный feedback:

```text
Сделай фильтры компактнее
```

или:

```text
Тут нужен график
```

Система:
- интерпретирует feedback
- нормализует intent
- определяет target
- ищет допустимые transformations

---

# 9. Targeting System

Комментарии всегда привязываются к конкретному semantic node.

Чем более мелкий элемент можно выбрать — тем лучше.

Пример semantic tree:

```text
users_table
 ├── toolbar
 ├── filters
 ├── pagination
 └── rows
```

Пользователь может оставить комментарий на:

```text
users_table.filters.status
```

---

# 10. Semantic Anchors

Renderer обязан поддерживать:
- stable node ids
- semantic mapping
- DOM-to-semantic binding
- visual selection

Это необходимо для:
- comments
- revisions
- approvals
- transforms
- visual tracking

---

# 11. Event-Sourced Architecture

Система использует event-sourced подход.

Источник истины:
- не snapshot
- не React tree

Источник истины:

```text
history of semantic transformations
```

---

## 11.1 Revision Chain

```text
Initial Screen
 + Transform
 + Transform
 + Transform
 = Current Screen
```

---

## 11.2 Преимущества

Event sourcing даёт:
- rollback
- replay
- branching
- approvals
- explainability
- collaboration
- semantic diff
- version reconstruction

---

# 12. Transform System

Система использует единый transform contract.

Пользователь не знает:
- внутренние операции
- технические patches
- structural changes

Пользователь работает только через feedback.

---

## 12.1 Transform Pipeline

```text
Feedback
  ↓
Intent normalization
  ↓
DS analysis
  ↓
Candidate generation
  ↓
Transform apply
  ↓
New revision
```

---

## 12.2 Explainability

Каждый transform должен быть explainable.

Система должна уметь объяснить:
- что изменилось
- почему изменилось
- какой feedback был учтён

---

# 13. Collaboration Model

Система multi-user by design.

Поддерживаются:
- совместное обсуждение
- comments
- approvals
- review flow
- version switching
- semantic discussions

---

## 13.1 Роли

Пример ролей:
- Viewer
- Reviewer
- Editor
- Design System Owner

---

# 14. Работа с версиями

Дизайнеры и PO не работают с git-style diffs.

Основная модель:
- переключение между revisions
- визуальное сравнение
- просмотр учтённых comments
- просмотр applied changes

---

## 14.1 Comment Lifecycle

Comment может быть:
- open
- applied
- approved
- rejected

---

## 14.2 Applied Changes

В новой revision:
- видно какие comments были учтены
- видно какие изменения внесены
- можно продолжить feedback loop
- можно approve изменения

---

# 15. Renderer Responsibilities

Renderer отвечает только за:
- rendering widgets
- rendering layouts
- semantic mapping
- visual highlighting
- comment overlays
- revision rendering

Renderer НЕ отвечает за:
- UX reasoning
- intent interpretation
- transform decisions

---

# 16. Architectural Positioning

Система ближе к:
- Figma review workflow
- Notion block system
- collaborative design sandbox
- semantic UI composition engine

Система НЕ ближе к:
- React code generators
- no-code builders
- universal frontend frameworks

---

# 17. MVP Scope

MVP должен включать:

## Core
- Screen Sessions
- Structured Screen Model
- Widget Registry
- Renderer
- Comments
- Revisions
- Transform pipeline

## UX
- Semantic node selection
- Version switching
- Applied comments tracking
- Explainability

## Widgets
- DataTable
- FiltersBar
- Form
- Drawer
- Tabs
- Cards
- Chart

## Collaboration
- Multi-user sessions
- Roles
- Review flow

---

# 18. Ключевая идея

Система не генерирует frontend.

Система управляет:

```text
semantic evolution of UI
```

UI является:
- производной
- materialized projection
- визуализацией semantic history

