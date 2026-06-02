# GradFlow Design System

## Overview

GradFlow is a student productivity dashboard for university students who need to manage academic tasks, calendar events, daily focus sessions, thesis / TTU progress, internship applications, goals, and saved learning resources.

GradFlow should feel like a calm academic productivity workspace, not a generic admin dashboard. The visual direction is inspired by Notion's editorial clarity, pastel workspace cards, and clean typography, but adapted into a real student productivity app.

GradFlow must support two visual modes:

1. Light Mode — warm, calm, clean, academic workspace.
2. Night Mode — low-eye-strain study cockpit for late-night productivity.

The product should feel:

- organized
- calm
- premium
- student-focused
- supportive
- personal
- motivating
- slightly playful, but not childish

GradFlow is not a corporate admin panel. It is a personal academic command center.

---

## Design Philosophy

GradFlow combines:

- Notion-inspired editorial clarity
- soft academic dashboard layout
- pastel productivity cards
- dark sidebar navigation
- Focus Flight identity
- calm light/night theme system

The interface should help the user feel:

- “I know what to do today.”
- “My academic life is organized.”
- “I can track my progress gently.”
- “Studying can feel structured and emotionally supportive.”

---

## Product Identity

### Product Name

GradFlow

### Product Meaning

GradFlow represents academic progress that flows steadily from small daily actions into graduation, career readiness, and personal growth.

### Core Metaphors

- Flow — steady academic progress
- Flight — focused study sessions through Focus Flight
- Control Center — dashboard for thesis, internship, goals, and assets
- Academic Journey — progress over time

---

## Visual Direction

GradFlow uses a Notion-inspired system, but should not copy Notion directly.

### Inspired by Notion

Use:

- clean typography
- soft cards
- editorial spacing
- pastel card tints
- subtle borders
- clear hierarchy
- calm workspace feeling

Do not use:

- Notion marketing hero structure
- Notion pricing layout
- Notion brand copy
- Notion logo style
- large 80px landing-page hero text
- over-decorated marketing illustrations

GradFlow is an app dashboard, not a marketing landing page.

---

## Theme System

GradFlow must support:

- Light Mode
- Night Mode

Theme should be controlled through CSS variables.

Recommended structure:

```css
:root,
.theme-light {
  --gf-bg: ...;
}

.theme-dark {
  --gf-bg: ...;
}
```
