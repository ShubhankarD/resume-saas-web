# Resume SaaS — Figma-Style Product Design Blueprint

## Purpose

This document is a **visual design handoff and implementation blueprint** for the `resume-saas-web` application.

The goal is to give the coding agent a concrete design target that is much closer to a real Figma handoff than a generic styling prompt.

The application should feel like a modern, polished, consumer-facing productivity SaaS product in the same quality tier as products such as:

- TealHQ
- Resume-Now
- Linear
- Notion
- other premium workflow-oriented SaaS products

These references are for **visual quality, product composition, hierarchy, density, and interaction polish only**.

Do not copy:

- branding
- exact colors
- proprietary layouts
- logos
- illustrations
- distinctive visual identity

The target is not imitation.

The target is **equivalent product maturity and visual crispness**.

---

# 1. Primary Design Goal

The current application should be redesigned so that it feels like **software the user works inside**, not a styled content page or admin form.

The final result should feel:

```text
modern
crisp
precise
productive
premium
consumer-facing
intentional
compact
clear
tactile
```

It should not feel:

```text
editorial
marketing-oriented
admin-heavy
CRUD-like
oversized
sparse
form-first
generic
developer-designed
```

This is not a simple color-and-radius refactor.

The coding agent should be willing to **recompose page structure** when necessary.

---

# 2. Critical Visual Direction

The most important principle is:

> Reduce visual clutter without reducing productive information density.

Do not create a “modern” UI by making everything larger and more spaced out.

Modern productivity applications typically use:

- compact controls
- strong hierarchy
- restrained whitespace
- precise typography
- persistent application chrome
- useful information density
- obvious selected states
- contextual actions
- clear working surfaces

Avoid giant empty areas.

At 1440px wide, the application should feel intentionally occupied.

---

# 3. Typography Direction

## Application UI

All application chrome must use a modern sans-serif typeface.

Preferred options:

```text
Geist
Inter
Manrope
SF Pro-style system font
```

Do not use serif typography for:

- navigation
- page titles
- section titles
- buttons
- inputs
- labels
- toolbars
- filters
- cards
- menus
- app chrome

Serif fonts are allowed only inside actual resume templates if a resume template intentionally uses one.

---

## Typography Scale

### Page Title

```text
18–24px
font-weight: 700
tracking: -0.02em
line-height: 1.2
```

Tailwind target:

```text
text-xl sm:text-2xl font-bold tracking-[-0.02em]
```

Do not use oversized 32–40px application headings unless the screen is a true onboarding or marketing view.

---

### Section Title

```text
14–16px
font-weight: 600–700
```

Tailwind target:

```text
text-sm sm:text-base font-semibold
```

---

### Body Copy

```text
14px
font-weight: 400–500
line-height: 1.5
```

Tailwind target:

```text
text-sm leading-6
```

---

### Metadata

```text
12–13px
font-weight: 400–500
```

Tailwind target:

```text
text-xs text-slate-500
```

---

### Control Labels

```text
12–13px
font-weight: 500–600
```

---

### Button Text

```text
14px
font-weight: 600
```

Do not create hierarchy only through huge text.

Use:

- weight
- contrast
- spacing
- alignment
- grouping
- surfaces

---

# 4. Density System

Use a tighter and more deliberate spacing model.

## Core spacing scale

```text
4px
8px
12px
16px
20px
24px
32px
```

Avoid unnecessary 48–96px gaps inside application screens.

---

## Recommended values

### Page padding

Desktop:

```text
24–32px
```

Mobile:

```text
16px
```

---

### Major section spacing

```text
24px
```

---

### Field spacing

```text
16px
```

---

### Compact control gaps

```text
8–12px
```

---

### Card padding

```text
16–20px
```

Use 24px only for larger summary cards.

Do not default every card to 32px padding.

---

# 5. Application Shell

The product should use a true application shell.

## Desktop composition

```text
┌──────────────────────────────────────────────────────────────────────┐
│ TOP APPLICATION HEADER                                              │
├────────────────┬─────────────────────────────────────────────────────┤
│                │                                                     │
│ LEFT SIDEBAR   │ MAIN WORKSPACE                                      │
│                │                                                     │
│                │                                                     │
│                │                                                     │
└────────────────┴─────────────────────────────────────────────────────┘
```

---

## Suggested dimensions

Top header:

```text
56–64px
```

Sidebar:

```text
224–240px
```

Main workspace:

```text
remaining width
max content width where appropriate: 1200–1320px
```

Main page padding:

```text
24–32px
```

---

# 6. Top Application Header

The top header should feel like application chrome.

Example:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ resumeaid                 Resume   Content   Jobs      Help  Profile │
└──────────────────────────────────────────────────────────────────────┘
```

Possible contents:

Left:

- product wordmark
- global navigation

Right:

- notifications if applicable
- help
- account/avatar
- user menu

Do not overload this header with page-specific actions.

Those belong in contextual page headers/toolbars.

---

# 7. Sidebar Navigation

The current large horizontal navigation should be replaced with a compact SaaS navigation architecture where appropriate.

Recommended desktop sidebar:

```text
resumeaid

OVERVIEW
  Overview

CONTENT
  Experience
  Education
  Skills
  Taglines

TOOLS
  Import
  Upload Resume
  Export
```

Do not show section labels if they add visual noise; they are optional.

---

## Sidebar row specification

Height:

```text
40px
```

Horizontal padding:

```text
10–12px
```

Icon:

```text
16–18px
```

Text:

```text
14px
font-medium
```

Radius:

```text
8px
```

Inactive state:

```text
text-slate-500 / slate-600
transparent background
```

Hover:

```text
bg-slate-100
text-slate-900
```

Active:

```text
bg-slate-900
text-white
```

or a similarly restrained selected state.

Do not use strong outlines around each navigation item.

---

# 8. Page Header Pattern

Each working screen should use a compact contextual page header.

Example:

```text
Content Library                                      + Add Content
Manage reusable content across your resumes
```

Structure:

```text
TITLE                                              PRIMARY ACTION
SHORT DESCRIPTION
```

Target height:

```text
64–80px
```

Do not create a giant hero section above the working interface.

Supporting descriptions should be 1–2 lines maximum.

---

# 9. Content Library — Target Design

The current large onboarding cards should not dominate the screen.

The overview should help users quickly understand:

- what content exists
- what sections are complete
- what needs attention
- what they can edit next

---

## Desktop wireframe

```text
┌────────────────────────────────────────────────────────────────────┐
│ Content Library                                  + Add Content     │
│ Manage reusable resume content                                     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ┌──────────────────────────────┐ ┌───────────────────────────────┐ │
│ │ Profile completeness     82% │ │ Content entries          24   │ │
│ │ ████████████████░░░░          │ │ Experience  7 · Skills 12     │ │
│ └──────────────────────────────┘ └───────────────────────────────┘ │
│                                                                    │
│ EXPERIENCE                                           + Add role    │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ ⋮⋮  Senior Consultant                           Edit        ›   │ │
│ │     PwC · Chicago, IL · Jan 2024 – Present                       │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ ⋮⋮  Senior Analyst                              Edit        ›   │ │
│ │     Deloitte · Chicago, IL · 2022 – 2024                         │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ EDUCATION                                           + Add school   │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │     University Name · Degree                       Edit      ›   │ │
│ └────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

---

# 10. Content Overview Metrics

If overview metrics exist, keep them compact.

Good example:

```text
┌────────────────────────────┐
│ Profile completeness   82% │
│ ███████████████░░░░         │
│ 4 sections ready            │
└────────────────────────────┘
```

Avoid giant dashboard statistic cards.

Metrics should support the workflow, not dominate it.

---

# 11. Resume Editor — Core Product Layout

The resume editing experience should use a split-pane productivity layout on desktop.

This is one of the most important design changes.

---

## Desktop wireframe

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ← Resumes     Senior Strategy Resume            Saved      Export PDF   │
├──────────────────────────────────────────────────────────────────────────┤
│ Personal   Experience   Education   Skills   Customize                  │
├────────────────────────────────────┬─────────────────────────────────────┤
│                                    │                                     │
│ EXPERIENCE                         │ Resume Preview                      │
│ Add and refine work history        │                                     │
│                                    │       ┌───────────────────────┐     │
│ ┌────────────────────────────────┐ │       │                       │     │
│ │ ⋮⋮ Senior Consultant       ⌄  │ │       │      JOHN SMITH       │     │
│ │    PwC · 2024 – Present       │ │       │                       │     │
│ └────────────────────────────────┘ │       │                       │     │
│                                    │       │                       │     │
│ ┌────────────────────────────────┐ │       │                       │     │
│ │ ⋮⋮ Senior Analyst          ›  │ │       │                       │     │
│ │    Deloitte · 2022 – 2024     │ │       └───────────────────────┘     │
│ └────────────────────────────────┘ │                                     │
│                                    │             −  100%  +              │
│ + Add experience                   │                                     │
└────────────────────────────────────┴─────────────────────────────────────┘
```

---

## Width target

Editor:

```text
42–48%
```

Preview:

```text
52–58%
```

Exact width may vary depending on content.

The resume preview should remain visible while editing on sufficiently wide screens.

---

# 12. Contextual Resume Toolbar

Above the split workspace, include a compact context bar.

Example:

```text
← Resumes     Senior Strategy Resume           Saved      Export PDF
```

Possible items:

Left:

- back
- resume name

Center/right:

- save state
- undo/redo if available
- preview options
- export

Export PDF should be the strongest CTA.

---

# 13. Resume Section Tabs

Use compact tabs for switching resume sections.

Example:

```text
Personal   Experience   Education   Skills   Customize
           ──────────
```

Specifications:

Height:

```text
44–48px
```

Text:

```text
13–14px
font-medium / semibold
```

Selected state:

- stronger text
- bottom indicator or subtle surface
- no oversized pill unless consistent with the overall design

---

# 14. Editor Section Header

Inside the left editor panel:

```text
EXPERIENCE
Add and refine your work history                         + Add role
```

Use:

Heading:

```text
14–16px semibold
```

Description:

```text
13px muted
```

Action:

compact button

Keep it functional, not decorative.

---

# 15. Collapsible Editor Card

Use a compact accordion pattern.

## Collapsed

```text
┌──────────────────────────────────────────────────────┐
│ ⋮⋮  Senior Consultant                         ›      │
│     PwC · Chicago · Jan 2024 – Present               │
└──────────────────────────────────────────────────────┘
```

Target height:

```text
64–72px
```

---

## Expanded

```text
┌──────────────────────────────────────────────────────┐
│ ⋮⋮  Senior Consultant                         ⌄      │
│     PwC · Chicago · Jan 2024 – Present               │
│                                                      │
│ Role title                                           │
│ [ Senior Consultant                             ]    │
│                                                      │
│ Company                     Location                 │
│ [ PwC                 ]     [ Chicago, IL       ]    │
│                                                      │
│ Start date                  End date                 │
│ [ Jan 2024            ]     [ Present           ]    │
│                                                      │
│ Achievements                                         │
│ [                                                    │
│   Led cross-functional AI transformation...          │
│                                                      │
│ ]                                                    │
│                                                      │
│ ✨ Quantify impact   ✨ Fix verbs   ✨ Tighten        │
│                                                      │
│                           Delete       Save changes  │
└──────────────────────────────────────────────────────┘
```

---

## Editor Card Design

Border:

```text
1px subtle neutral
```

Radius:

```text
10–12px
```

Padding:

```text
16–20px
```

Expanded field spacing:

```text
16px
```

Do not nest cards inside editor cards.

---

# 16. Drag Handle

Use a proper grip icon.

Target:

```text
GripVertical
```

Style:

```text
text-slate-400
hover:text-slate-600
cursor-grab
active:cursor-grabbing
```

Interaction:

- dragging must not toggle accordion
- drag handle should have its own pointer target

---

# 17. Inputs

Inputs should feel precise, compact, and application-like.

Height:

```text
40–44px
```

Radius:

```text
8–10px
```

Padding:

```text
12–14px
```

Font:

```text
14px
```

Background:

```text
white / subtle neutral
```

Focus:

- stronger border
- subtle focus ring
- no excessive glow

---

# 18. Textareas

Default minimum height:

```text
100–120px
```

Use autosizing where already supported.

Keep AI enhancement actions directly below the relevant textarea.

---

# 19. AI Enhancement Actions

Use small chips.

Example:

```text
✨ Quantify impact
✨ Fix action verbs
✨ Tighten brevity
```

Target height:

```text
28–32px
```

Padding:

```text
8–12px horizontal
```

Radius:

```text
9999px
```

They should feel secondary.

Do not make AI tools more visually dominant than save/export actions.

---

# 20. Buttons

## Primary CTA

Height:

```text
40px
```

Radius:

```text
10px
```

Horizontal padding:

```text
16px
```

Font:

```text
14px semibold
```

---

## Secondary Button

Use:

- white or subtle neutral surface
- fine border
- restrained hover state

---

## Icon Button

Size:

```text
36–40px square
```

Radius:

```text
8–10px
```

---

## Avoid

- huge pill CTAs
- giant buttons with excessive horizontal padding
- gradients
- large drop shadows
- multiple equally strong actions

---

# 21. Search and Filter Controls

Where search/filtering exists, use a compact productivity toolbar.

Example:

```text
[ Search content...                     ] [ Type ▾ ] [ Sort ▾ ]
```

Height:

```text
40–44px
```

Gap:

```text
8–12px
```

Radius:

```text
8–10px
```

Filters should feel like part of the application workspace.

---

# 22. Surface Hierarchy

Use three levels of surface hierarchy.

## Surface 1 — App Background

Very light neutral background.

Purpose:

- establishes canvas
- avoids pure-white-everywhere look

---

## Surface 2 — Main Workspace

White or dark elevated surface.

Purpose:

- primary working region
- editor panels
- lists
- grouped content

Use subtle borders.

---

## Surface 3 — Floating / Selected

Use stronger visual treatment only for:

- active editor card
- menus
- dropdowns
- dialogs
- resume page
- focused selections

Do not apply shadows to every card.

---

# 23. Border Strategy

Use borders carefully.

Borders should:

- separate meaningful regions
- identify interactive containers
- define input controls

Do not border:

- every text block
- every layout section
- every navigation item
- every metadata group

Use whitespace as a separator where possible.

---

# 24. Shadow Strategy

Use subtle shadows only where depth is real.

Good use cases:

- resume sheet
- dropdown menu
- modal/dialog
- hover elevation on clearly clickable cards

Avoid decorative shadows across all containers.

---

# 25. Color Strategy

The design should rely primarily on:

```text
neutral canvas
white surfaces
charcoal text
muted slate text
restrained accent colors
```

Suggested hierarchy:

- charcoal/slate: primary text and structure
- neutral gray: secondary copy and borders
- blue: secondary information or selected utility state
- amber: AI or premium emphasis
- red: destructive only

Do not use accent colors to manufacture visual interest.

Modern quality should come from:

- typography
- alignment
- spacing
- interaction states
- hierarchy

---

# 26. Resume Preview Workspace

The preview should feel like a document editor.

Example:

```text
┌───────────────────────────────────────────────┐
│ Resume Preview                               │
│                                               │
│        ┌────────────────────────────┐         │
│        │                            │         │
│        │        JOHN SMITH          │         │
│        │                            │         │
│        │ EXPERIENCE                 │         │
│        │ ...                        │         │
│        │                            │         │
│        └────────────────────────────┘         │
│                                               │
│               −   100%   +                   │
└───────────────────────────────────────────────┘
```

Backdrop:

```text
subtle cool gray
```

Document:

```text
white
soft border
clear shadow
US-letter proportion
```

---

# 27. Resume Preview Dimensions

Document target:

```text
max-width: approximately 800px
min-height: approximately 1050px
```

The exact displayed size may be scaled.

Do not distort aspect ratio.

---

# 28. Resume Zoom Toolbar

Compact toolbar:

```text
[ − ]   100%   [ + ]
```

Optional reset:

```text
Fit
```

Export should remain separate and visually stronger.

---

# 29. Resume Typography

The document is not application chrome.

Use fixed print-oriented sizes.

Name:

```text
text-2xl font-bold
```

Section heading:

```text
text-xs font-bold uppercase tracking-wider
```

Body:

```text
text-xs leading-normal
```

Do not use viewport-based font sizes.

---

# 30. Upload Resume Flow

The upload screen should feel like a focused workflow rather than a giant set of cards.

Recommended:

```text
Upload your resume

Import an existing resume to create your content library.

┌──────────────────────────────────────────────────────┐
│                                                      │
│                  ↑ Upload resume                     │
│                                                      │
│          Drag and drop PDF or DOCX here              │
│                                                      │
│              or choose a file                        │
│                                                      │
│                PDF · DOCX · max XX MB                │
│                                                      │
└──────────────────────────────────────────────────────┘

What happens next
✓ We extract your experience
✓ You review the content
✓ Nothing is published automatically
```

Keep it focused.

---

# 31. Import / Export Screen

Use a utility-management layout.

Example:

```text
Import & Export

Move content into or out of ResumeAid.

IMPORT
┌──────────────────────────────────────────────────────┐
│ Import content.yaml                           Import │
│ Restore or migrate structured resume content         │
└──────────────────────────────────────────────────────┘

EXPORT
┌──────────────────────────────────────────────────────┐
│ Export content.yaml                         Download │
│ Download your structured content library             │
└──────────────────────────────────────────────────────┘
```

Do not use oversized feature cards.

---

# 32. Skills Screen

Prefer a manageable token/group editor.

Example:

```text
Skills                                           + Add Skill

Search skills...

TECHNICAL
Python ×   TypeScript ×   SQL ×   AWS ×   GCP ×

STRATEGY
AI Strategy ×   Operating Model ×   Transformation ×
```

If skill categories exist, use grouped sections.

Avoid a giant freeform form.

---

# 33. Taglines Screen

Use editable compact rows.

Example:

```text
Taglines                                      + Add tagline

┌──────────────────────────────────────────────────────┐
│ AI & Data Strategy Leader                     Edit  │
│ Executive-oriented · Used in 3 resumes              │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Technology Transformation Consultant          Edit  │
│ Consulting-oriented · Used in 1 resume               │
└──────────────────────────────────────────────────────┘
```

---

# 34. Empty States

Empty states should be useful and compact.

Example:

```text
No experience added yet

Add a role, internship, or project to start building your work history.

+ Add experience
```

Use:

- small icon
- short title
- single sentence
- one action

Avoid oversized empty state artwork unless already part of the design system.

---

# 35. Loading States

Use local loading states.

Good:

- skeleton rows
- disabled button with spinner
- stable layout

Avoid:

- blank screens
- giant centered spinners
- full-page loading for small mutations

---

# 36. Error States

Errors should be contextual.

Example:

```text
Couldn’t save this experience.
Try again.
```

Place the error near the affected area.

Use destructive styling sparingly.

---

# 37. Mobile Design

Do not shrink the desktop design.

Recompose it.

---

## Mobile app shell

- sidebar becomes drawer/sheet
- top header remains compact
- primary page action remains visible
- overflow actions go into menu if necessary

---

## Mobile resume editor

Use tabs or segmented controls:

```text
[ Edit ] [ Preview ]
```

Do not force split-pane layout on 375px screens.

---

## Mobile editor

Cards become full width.

Actions stack when necessary.

Inputs stack to one column.

---

# 38. Breakpoint Behavior

Validate these widths:

```text
375px
768px
1024px
1440px
```

---

## 375px

Requirements:

- no page-level horizontal overflow
- navigation accessible
- cards fit naturally
- toolbars wrap
- primary actions remain visible
- touch targets remain usable

---

## 768px

Requirements:

- one or two-column layout depending on screen
- sidebar may collapse
- editor/preview may switch modes

---

## 1024px

Requirements:

- desktop productivity layout begins to emerge
- split editor/preview allowed if usable

---

## 1440px

Requirements:

- content is intentionally occupied
- interface does not feel empty
- panels are not stretched unnecessarily
- visual hierarchy remains strong

---

# 39. Figma-Style Component Dimensions

Use these as implementation targets.

## Button

```text
height: 40px
radius: 10px
horizontal padding: 16px
```

## Small Button

```text
height: 32px
radius: 8px
horizontal padding: 12px
```

## Icon Button

```text
36–40px square
```

## Input

```text
height: 42px
radius: 10px
```

## Sidebar item

```text
height: 40px
radius: 8px
```

## Tab

```text
height: 44px
```

## Collapsed editor row

```text
64–72px
```

## Card radius

```text
10–12px
```

## Workspace panel radius

```text
12–16px
```

---

# 40. Interaction States

Every interactive element should have:

```text
default
hover
active
focus-visible
disabled
loading where relevant
selected where relevant
```

Use subtle transitions:

```text
150–200ms
```

Avoid bouncy motion.

---

# 41. Hover Strategy

Hover should clarify interactivity.

Examples:

Clickable card:

```text
border slightly stronger
very subtle shadow
optional translateY(-1px)
```

Navigation:

```text
soft background
stronger text
```

Icon button:

```text
soft neutral background
```

Avoid large transforms.

---

# 42. Accessibility

Maintain:

- semantic HTML
- accessible labels
- visible focus indicators
- keyboard navigation
- non-color-only state indication
- useful hit targets
- correct accordion ARIA state

Icon-only buttons require an accessible label.

---

# 43. Reusable Components to Build

Where appropriate, introduce reusable presentation components.

Suggested:

```text
AppShell
SidebarNav
PageHeader
PageToolbar
SectionHeader
EditorCard
SortableEditorCard
EmptyState
MetricCard
AiActionChip
PreviewToolbar
ResumeWorkspace
CompactTabs
```

Do not over-abstract.

Only create components when repetition or consistency benefits from them.

---

# 44. Visual Anti-Patterns

Do not produce these:

## Oversized Editorial Heading

Bad:

```text
LET'S BUILD YOUR RESUME CONTENT
```

at 36–48px with serif typography.

Better:

```text
Content Library
```

at 20–24px with a modern sans-serif.

---

## Giant Feature Cards

Bad:

Three huge cards taking most of the viewport with little content.

Better:

Compact workflow cards or actionable rows.

---

## Excessive Empty Space

Bad:

Large blank bands between navigation, title, description, and content.

Better:

24–32px deliberate section rhythm.

---

## Marketing Page Composition

Bad:

```text
NAV
BIG HEADLINE
PARAGRAPH
THREE CARDS
```

Better:

```text
APP CHROME
CONTEXTUAL HEADER
WORKSPACE
INTERACTIVE CONTENT
```

---

## Overuse of Rounded Pills

Not every button, navigation item, tab, and filter should be a pill.

Prefer 8–12px radii for application controls.

---

# 45. Visual QA Checklist

For every major screen, ask:

1. Does this look like modern application software?
2. Is the typography crisp and sans-serif?
3. Is productive information visible without scrolling unnecessarily?
4. Is whitespace deliberate rather than excessive?
5. Are related controls grouped?
6. Is the primary action obvious?
7. Are secondary actions visually subordinate?
8. Are cards sized according to their content?
9. Is there a clear selected state?
10. Does the screen feel compact but breathable?
11. Is the app visually credible beside TealHQ or Resume-Now?
12. Does any area still look like a generic admin form?
13. Does any area look like a marketing webpage?
14. Is the interface intentionally occupied at 1440px?
15. Is the mobile version genuinely recomposed?

If #12 or #13 is yes, redesign that region.

If #11 is no, continue iterating.

---

# 46. Implementation Guidance for the Coding Agent

Do not judge success by whether design tokens were applied.

Judge success by the rendered composition.

The first refactor should not be treated as sacred.

If the current JSX structure prevents the desired layout, change the presentation structure.

Preserve:

- APIs
- hooks
- schemas
- business logic
- mutations
- query behavior
- data contracts

But feel free to redesign:

- page layout
- component composition
- navigation
- toolbar placement
- field grouping
- accordion structure
- panel sizing
- responsive behavior
- surface hierarchy
- visual states

---

# 47. Recommended Implementation Sequence

## Phase 1 — App Chrome

1. typography
2. app header
3. sidebar
4. responsive navigation
5. global content width

## Phase 2 — Shared UI

6. buttons
7. inputs
8. tabs
9. toolbars
10. cards
11. accordions
12. compact rows

## Phase 3 — Content Library

13. overview
14. experience
15. education
16. skills
17. taglines
18. import/export

## Phase 4 — Resume Builder

19. resume contextual toolbar
20. resume tabs
21. split workspace
22. editor cards
23. AI actions
24. live preview
25. zoom
26. export

## Phase 5 — Polish

27. responsive behavior
28. empty states
29. loading states
30. error states
31. dark mode
32. accessibility
33. interaction states

---

# 48. Definition of Done

The redesign is successful when the product feels like:

> a polished resume-building SaaS workspace designed for real users

and not like:

> a collection of forms with improved Tailwind styles

The strongest signal of success should be visible before reading any text.

A user should be able to look at the screen and immediately perceive:

- professional software
- clear workflow
- strong hierarchy
- deliberate density
- modern interaction patterns
- trustworthy visual quality

Continue iterating until the rendered product reaches that standard.
