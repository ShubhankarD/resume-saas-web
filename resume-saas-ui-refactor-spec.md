# Resume SaaS — Premium Consumer UI/UX Refactor Specification

## Role

You are a **Principal Frontend Architect and Senior Product UI/UX Engineer** specializing in:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Responsive product design
- Consumer SaaS UX
- Accessible interaction design
- High-fidelity frontend implementation

Your task is to perform a **complete visual, spatial, typographic, interaction, and presentation-layer refactor** of the existing application:

```text
resume-saas-web
```

The product is a resume-building SaaS application.

The backend APIs, React Query hooks, TypeScript models, mutations, data contracts, and core business logic are already implemented and working.

The current problem is the frontend experience.

The existing UI feels too much like:

- an internal admin tool
- a CRUD application
- a dense settings page
- a collection of raw forms

The new UI must feel like a **modern, polished, consumer-facing SaaS product**.

Use products such as **TealHQ, Resume-Now, Linear, Notion, and other high-quality productivity SaaS applications as references for visual quality and product craftsmanship only**.

Do **not** copy their branding, proprietary layouts, illustrations, exact colors, or visual identity.

The goal is to achieve a comparable level of:

- visual crispness
- hierarchy
- spatial composition
- typography
- interaction polish
- perceived quality
- usability
- responsiveness
- product confidence

This is a **full presentation-layer redesign**, not a cosmetic restyle.

---

# 1. Critical Interpretation of This Task

Do **not** interpret this task as:

> Keep the existing page composition and only change colors, border-radius, shadows, and padding.

That is explicitly insufficient.

You are authorized to **recompose and restructure the presentation layer** wherever necessary to improve UX, while preserving the application's business behavior.

You may:

- reorganize JSX
- change page composition
- move actions into more appropriate toolbars
- convert dense forms into progressive-disclosure workflows
- split long forms into logical sections
- introduce accordion-based editors
- improve navigation structure
- create responsive sidebars or drawers
- introduce sticky contextual controls
- replace admin-style tables with consumer-friendly cards where appropriate
- improve empty states
- improve loading states
- improve error states
- improve responsive layouts
- extract reusable presentational components
- improve labels, instructions, metadata, and information hierarchy

You must **not** alter the core application contracts to achieve these changes.

When there is a conflict between preserving the current visual layout and producing a substantially better user experience:

> **Preserve application behavior. Redesign the presentation.**

The existing visual structure is not sacred.

The backend contracts are.

---

# 2. Product Quality Target

The finished application should feel like a professionally designed commercial product.

The UI should feel:

```text
modern
premium
calm
crisp
spacious
focused
tactile
trustworthy
intentional
consumer-oriented
```

It should not feel:

```text
dense
admin-heavy
bootstrap-like
generic
flat
form-first
over-bordered
over-colored
developer-designed
```

The goal is not maximal decoration.

The goal is **clarity, confidence, polish, and strong product composition**.

---

# 3. Non-Negotiable Engineering Constraints

Before changing code, inspect the repository structure and understand how the application currently works.

Do not blindly replace working logic.

You MUST preserve:

- API request behavior
- API response behavior
- React Query hook signatures
- React Query query keys
- React Query mutation signatures
- TypeScript schemas and models
- form submission payload structures
- routing behavior unless a non-breaking presentation change requires layout adjustment
- authentication behavior
- authorization behavior
- existing persistence behavior
- existing resume/profile/content data flow
- existing add/edit/delete behavior
- existing reorder behavior
- existing export behavior

## Protected directories

Treat these as contract-sensitive:

```text
src/lib/api/*
src/hooks/*
```

Do not:

- rename exported hooks
- change hook parameters
- change mutation parameters
- change API request payloads
- change API response expectations
- rename TypeScript fields used by APIs
- rewrite networking logic without necessity
- duplicate server state into unnecessary local state

You may update imports or presentational usage only when necessary.

Do not introduce `any` to bypass type errors.

Do not suppress TypeScript or ESLint errors as a shortcut.

Do not delete working functionality because it is inconvenient to redesign.

---

# 4. Execution Method

Before implementation, inspect at minimum:

```text
src/app/globals.css
src/app/(app)/layout.tsx
src/components/ui/*
src/components/content/*
src/components/profiles/*
src/components/wordmark.tsx
src/lib/api/*
src/hooks/*
```

Also inspect:

- existing icon libraries
- existing accordion primitives
- existing sheet/drawer primitives
- existing sortable/drag-and-drop implementation
- existing form library usage
- existing validation
- existing toast/notification system
- current PDF export implementation
- current resume preview logic

Prefer extending existing patterns over installing redundant libraries.

Do not introduce a second component library if shadcn/ui already covers the need.

Do not introduce a second icon system when the project already has one.

---

# 5. Design Philosophy

## 5.1 Visual hierarchy

Every major view should have a clear visual sequence:

```text
Context / eyebrow
↓
Primary heading
↓
Short supporting copy
↓
Primary action
↓
Main content
↓
Secondary controls
```

Do not let every element compete visually.

There should generally be one obvious primary action per context.

---

## 5.2 Progressive disclosure

Do not display every editable field at once when a section can be summarized and expanded.

Resume editors should expose enough information to identify an entry while collapsed.

Example:

```text
Senior Consultant
PwC · Chicago, IL
Jan 2024 – Present
```

This is preferable to:

```text
Experience 1
```

Long editing workflows should feel manageable rather than overwhelming.

---

## 5.3 Consumer SaaS density

Use deliberate whitespace.

Avoid:

- dense grids
- narrow form rows
- giant blocks of fields
- excessive borders
- tiny labels
- tiny click targets
- unnecessary nested cards
- repeated boxed containers
- action clutter
- toolbars with too many equally prominent buttons

Prefer:

- generous vertical rhythm
- meaningful content grouping
- soft visual separation
- constrained content widths
- 24–32px card padding
- 24–32px section gaps
- consistent alignment
- strong heading hierarchy
- a small number of visual emphasis levels

---

# 6. Global Design Tokens

Replace:

```text
src/app/globals.css
```

with the following token system:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 40% 98%;          /* #F8FAFC - Crisp Frost Canvas */
    --foreground: 222 47% 11%;          /* #0B1120 - Deep Carbon Ink */

    --card: 0 0% 100%;                  /* #FFFFFF */
    --card-foreground: 222 47% 11%;

    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    --primary: 222 47% 11%;             /* #0B1120 */
    --primary-foreground: 210 40% 98%;

    --secondary: 221 83% 53%;           /* #2563EB - Electric Azure */
    --secondary-foreground: 0 0% 100%;

    --muted: 210 40% 96.1%;             /* #F1F5F9 */
    --muted-foreground: 215 16% 47%;    /* #64748B */

    --accent: 38 92% 50%;               /* #F59E0B - Solar Amber */
    --accent-foreground: 222 47% 11%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214 32% 91%;               /* #E2E8F0 */
    --input: 214 32% 91%;
    --ring: 38 92% 50%;                  /* Solar Amber Focus Ring */

    --radius: 0.75rem;
  }

  .dark {
    --background: 222 47% 7%;
    --foreground: 210 40% 98%;

    --card: 222 47% 11%;
    --card-foreground: 210 40% 98%;

    --popover: 222 47% 11%;
    --popover-foreground: 210 40% 98%;

    --primary: 210 40% 98%;
    --primary-foreground: 222 47% 11%;

    --secondary: 217 91% 60%;
    --secondary-foreground: 0 0% 100%;

    --muted: 217 33% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217 33% 17.5%;
    --input: 217 33% 17.5%;
    --ring: 38 92% 50%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground antialiased selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-200;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

Do not substitute a different palette unless required by an existing accessibility constraint.

Solar Amber should be a deliberate accent, not a dominant page color.

---

# 7. Typography System

Use a fixed semantic scale for application UI.

Do not invent arbitrary typography when one of these styles applies.

## Eyebrow / overline

```text
text-[11px]
font-semibold
uppercase
tracking-wider
text-slate-500 dark:text-slate-400
mb-1.5
```

## Main view heading

```text
text-2xl sm:text-3xl
font-bold
tracking-tight
text-slate-900 dark:text-slate-50
```

## Section / card heading

```text
text-base sm:text-lg
font-semibold
tracking-tight
text-slate-900 dark:text-slate-100
```

## Supporting body copy

```text
text-sm
text-slate-600 dark:text-slate-400
leading-relaxed
max-w-2xl
```

## Form label

```text
text-xs
font-semibold
uppercase
tracking-wider
text-slate-600 dark:text-slate-400
block
mb-2
```

## Metric number

```text
text-3xl
font-extrabold
tracking-tight
tabular-nums
text-slate-900 dark:text-slate-50
```

Normal application copy should generally remain `text-sm`.

Do not make the UI look modern by simply making everything tiny.

---

# 8. Spatial Scale

The current interface is too dense.

Use consistent spacing.

## Standard card interior

```text
p-6 sm:p-8 space-y-6
```

## Major page sections

```text
space-y-8
```

## Compact related groups

```text
space-y-4
```

or:

```text
gap-4
```

## Form grids

Typical:

```text
grid grid-cols-1 md:grid-cols-2 gap-5
```

Do not force long-form textareas into two columns.

---

# 9. Button System

Refactor:

```text
src/components/ui/button.tsx
```

Preserve the existing shadcn-compatible Button API.

All buttons should include tactile, fast transitions.

## CTA

```text
bg-amber-500
font-semibold
text-slate-950
shadow-sm shadow-amber-500/20
hover:bg-amber-400
active:scale-[0.98]
```

## Default

```text
bg-slate-900
text-white
shadow-sm
hover:bg-slate-800
dark:bg-slate-50
dark:text-slate-900
dark:hover:bg-slate-200
active:scale-[0.98]
```

## Secondary

```text
bg-blue-50
text-blue-700
hover:bg-blue-100
dark:bg-blue-950/40
dark:text-blue-300
active:scale-[0.98]
```

## Outline

```text
border border-slate-200
bg-white
hover:bg-slate-50
text-slate-900
dark:border-slate-800
dark:bg-slate-900
dark:text-slate-100
active:scale-[0.98]
```

## Ghost

```text
hover:bg-slate-100
text-slate-700
hover:text-slate-900
dark:hover:bg-slate-800
dark:text-slate-300
```

## Destructive

```text
bg-red-600
text-white
hover:bg-red-700
active:scale-[0.98]
```

## Sizes

Default:

```text
h-10 px-4 py-2 text-sm rounded-xl
```

Large:

```text
h-12 px-6 text-base font-semibold rounded-xl
```

Small:

```text
h-8 px-3 text-xs rounded-lg
```

Also preserve visible focus states and disabled states.

Icon-only buttons must have accessible labels.

---

# 10. Input and Textarea System

Refactor:

```text
src/components/ui/input.tsx
src/components/ui/textarea.tsx
```

Use:

```text
rounded-xl
border border-slate-200
bg-slate-50/50
px-4 py-2
text-sm
text-slate-900
transition-all
placeholder:text-slate-400

focus:border-amber-500
focus:bg-white
focus:outline-none
focus:ring-4
focus:ring-amber-500/10

dark:border-slate-800
dark:bg-slate-900/50
dark:text-slate-100
dark:focus:bg-slate-900
```

Inputs:

```text
h-11
```

Textareas:

```text
min-h-[110px]
```

Do not apply fixed input height to textareas.

Error and disabled states must remain functional and accessible.

---

# 11. Card System

Refactor:

```text
src/components/ui/card.tsx
```

Base treatment:

```text
rounded-2xl
border border-slate-200/80
bg-white
text-slate-900
shadow-[0_2px_12px_rgba(0,0,0,0.04)]

dark:border-slate-800
dark:bg-slate-900
dark:text-slate-100
```

Do not use deep shadows on every container.

Depth should be subtle.

---

# 12. Wordmark

Update:

```text
src/components/wordmark.tsx
```

Preserve the existing component structure and semantics.

Render:

```tsx
<span className="font-semibold tracking-tight text-slate-900 dark:text-slate-100">
  resume
  <span className="font-bold text-amber-500 dark:text-amber-400">
    ai
  </span>
  d
</span>
```

---

# 13. Application Shell

Refactor:

```text
src/app/(app)/layout.tsx
```

The shell should feel like a polished productivity SaaS product.

## Desktop sidebar

Use:

```text
w-64
border-r border-slate-200/80
bg-white dark:bg-slate-950
p-5
flex flex-col justify-between
h-screen
sticky top-0
```

Navigation should have:

- at least 40px interaction height
- consistent icon placement
- comfortable horizontal padding
- restrained inactive styling
- clearly visible active state
- no excessive borders
- no oversized pills
- no bright accent color on every item

The active state should be obvious but refined.

## Top header

Use:

```text
h-16
px-6 md:px-8
border-b border-slate-200/80
bg-white/70 dark:bg-slate-950/70
backdrop-blur-md
sticky top-0
z-30
flex items-center justify-between
```

## Main content

Use:

```text
max-w-6xl
mx-auto
w-full
px-6 py-8
md:px-10 md:py-10
space-y-8
```

Do not let forms stretch across the entire viewport at large screen sizes.

---

# 14. Responsive Navigation

The desktop sidebar must not remain permanently visible on narrow screens.

If the project already contains a mobile navigation pattern, reuse and refine it.

Otherwise introduce a responsive drawer/sheet pattern.

Target behavior:

### Desktop

Persistent sidebar.

### Tablet

Sidebar may collapse or become compact depending on current architecture.

### Mobile

Use a drawer/sheet or equivalent accessible mobile navigation.

Do not create horizontal page overflow.

---

# 15. Standard Page Header

Create or standardize a reusable page header pattern.

Preferred composition:

```tsx
<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
  <div>
    <p>{eyebrow}</p>
    <h1>{title}</h1>
    <p>{description}</p>
  </div>

  <div>
    {primaryAction}
  </div>
</div>
```

The primary action should be visually clear.

Secondary actions should use lower-emphasis variants.

Avoid putting several equal-weight buttons beside the title.

---

# 16. Resume Editing Experience

Refactor relevant files under:

```text
src/components/content/*
src/components/profiles/*
```

The editing experience should no longer feel like a raw form.

It should feel like a guided resume-building workspace.

---

# 17. Collapsible Editor Cards

Repeated resume sections should use collapsible editor cards.

Examples:

- work experience
- education
- projects
- certifications
- skills
- achievements
- summary/profile sections
- bullet groups

Collapsed cards should surface identifying information.

Example:

```text
Senior Consultant
PwC · Chicago, IL
Jan 2024 – Present
```

Do not use generic labels such as:

```text
Experience 1
Education 2
```

unless no meaningful data exists yet.

Preferred anatomy:

```text
[drag handle] [entry summary] [metadata] [actions/chevron]
---------------------------------------------------------
expanded editable content
```

Expanded content:

```text
pt-5
space-y-5
```

Do not wrap every field inside another card.

---

# 18. Sortable Rows

Sortable/editor rows should use:

```text
p-4 sm:p-5
rounded-xl
border border-slate-200/80
bg-white dark:bg-slate-900
shadow-xs
mb-3
flex items-start gap-4
```

Use the existing drag-and-drop system if one exists.

Do not replace working reorder logic unnecessarily.

Use an obvious grip/drag affordance.

Example visual concept:

```text
⋮⋮
```

The drag control should use:

```text
cursor-grab
active:cursor-grabbing
```

It should remain visually muted until hover.

Dragging should not accidentally toggle the accordion.

---

# 19. Form Layout

Use responsive grouping for fields that belong together.

Examples:

```text
First name | Last name
City       | State
Start date | End date
Company    | Role
Degree     | Institution
```

Typical layout:

```text
grid grid-cols-1 md:grid-cols-2 gap-5
```

Long-form text fields remain full width.

Avoid:

- three-column cramped forms
- unnecessary field cards
- tiny form labels
- excessive instructional text
- very wide textareas on desktop

---

# 20. AI Enhancement Chips

Under bullet/responsibility/accomplishment textareas, add compact AI assistance actions.

Required labels:

```text
✨ Quantify impact
✨ Fix action verbs
✨ Tighten brevity
```

They should look like lightweight AI tools, not primary actions.

Suggested treatment:

```text
inline-flex
items-center
rounded-full
border border-amber-200
bg-amber-50
px-3 py-1.5
text-xs font-medium
text-amber-800
transition-colors
hover:bg-amber-100

dark:border-amber-900/60
dark:bg-amber-950/30
dark:text-amber-300
```

If equivalent AI actions already exist, connect these controls to them.

If no backend action exists, do not fabricate API calls or change protected API contracts.

The UI may be presentational only until a compatible handler exists.

---

# 21. Live Resume Preview

Refactor:

```text
src/components/profiles/live-preview.tsx
```

This is a core product experience.

The editor UI and the resume document must feel visually distinct.

---

# 22. Preview Workspace

The resume should sit inside a document workspace.

Use:

```text
bg-slate-100/80
dark:bg-slate-950
p-4 sm:p-6 lg:p-8
rounded-2xl
flex
justify-center
items-start
overflow-auto
```

This backdrop should make the white resume sheet visually obvious.

---

# 23. Resume Sheet

Use:

```text
w-full
max-w-[800px]
min-h-[1050px]
bg-white
text-slate-900
shadow-2xl
rounded-sm
p-12
border border-slate-200/60
print:shadow-none
print:border-none
```

The resume document must remain:

```text
bg-white text-slate-900
```

even in dark application mode.

Do not darken the document itself.

---

# 24. Resume Typography

Do not apply dashboard typography to the resume document.

Use stable print-oriented sizes.

Name:

```text
text-2xl font-bold
```

Section headings:

```text
text-xs font-bold uppercase tracking-wider
```

Bullet/body copy:

```text
text-xs leading-normal
```

Do not use:

```text
vw
vh
clamp(...vw...)
```

for document typography.

The resume should scale as a document.

---

# 25. Resume Zoom

Do not resize every text style separately.

Zoom the entire document surface.

Use:

```tsx
style={{
  transform: `scale(${zoom})`,
  transformOrigin: "top center",
}}
```

Support:

```text
75%
100%
125%
```

Default to `100%` unless existing behavior intentionally remembers a zoom preference.

Zooming must not mutate resume data.

---

# 26. Preview Toolbar

Add a polished utility toolbar above the resume canvas.

Include:

- zoom out
- zoom selector or current zoom
- zoom in
- Export PDF

The Export PDF action should be the high-value action.

Use:

```tsx
<Button variant="cta">
  Export PDF
</Button>
```

If an existing export handler exists, reuse it exactly.

Do not invent a second export implementation.

The toolbar may be sticky when appropriate.

---

# 27. Empty States

Replace plain empty text such as:

```text
No data
Nothing here
No experiences
```

with purposeful empty states.

Typical structure:

```text
[icon]

No experience added yet

Add roles, internships, freelance projects, or contract work to build your professional history.

[ Add experience ]
```

Empty states should be concise.

Avoid giant illustrations unless the project already contains an illustration system.

---

# 28. Loading States

Preserve existing loading semantics.

Improve visual polish where appropriate.

Prefer:

- subtle skeletons
- stable layout while loading
- loading states inside buttons
- disabled duplicate submissions

Avoid:

- page jumps
- giant global spinners for small mutations
- replacing an entire page when only one local component is loading

---

# 29. Error States

Errors should be readable and contextual.

Use:

- concise error copy
- clear relation to the failed action
- destructive styling only where appropriate
- retry actions when existing logic supports them

Do not expose raw server errors directly unless this is already intentional behavior.

Do not remove existing validation logic.

---

# 30. Interaction Quality

Every interactive component should have appropriate:

- hover state
- active state
- focus-visible state
- disabled state
- loading state where applicable
- selected state where applicable
- expanded/collapsed state where applicable

Buttons should feel tactile without being animated excessively.

Use transitions such as:

```text
transition-colors
transition-shadow
transition-transform
duration-150
duration-200
```

Avoid:

- bouncy interactions
- long fades
- page entrance animations
- decorative motion with no usability benefit

---

# 31. Iconography

Use the icon system already present in the repository.

If `lucide-react` is already installed, prefer it.

Do not add another icon package unnecessarily.

Typical sizes:

```text
h-4 w-4
```

or:

```text
h-5 w-5
```

Use icons consistently for:

- navigation
- drag handles
- add
- delete
- export
- expand/collapse
- zoom
- AI actions
- settings
- overflow menus

Decorative icons should not create redundant screen-reader output.

---

# 32. Dark Mode

Application components must be fully usable in dark mode.

Dark mode should preserve hierarchy, not merely invert colors.

Review:

- text contrast
- border contrast
- muted surfaces
- hover states
- focus rings
- input backgrounds
- cards
- dropdowns
- modals
- navigation
- editor cards

The resume document itself must remain white.

---

# 33. Accessibility

Maintain or improve accessibility.

Requirements:

- preserve semantic HTML
- preserve label/control associations
- icon-only controls require `aria-label`
- focus states must remain visible
- accordion controls should expose expanded state
- all major flows must work with keyboard input
- avoid color-only state communication
- ensure reasonable contrast
- avoid tiny click targets

Aim for at least approximately 40px interaction height for common controls.

---

# 34. Responsive Quality

Validate at these approximate viewport widths:

```text
375px
768px
1024px
1440px
```

At 375px:

- no application-level horizontal overflow
- forms stack correctly
- nav is usable
- toolbars wrap intelligently
- buttons remain tappable
- cards remain readable
- actions do not compress into unusable rows

At 1440px:

- content does not look stretched
- forms remain constrained
- whitespace feels intentional
- the layout feels premium rather than empty

The resume preview may scroll horizontally when necessary.

Do not distort document proportions merely to fit the viewport.

---

# 35. Suggested Reusable Presentational Components

Where repetition exists, consider creating:

```text
PageHeader
SectionHeader
EditorCard
SortableEditorCard
FormField
EmptyState
StatusBadge
AiActionChip
PreviewToolbar
```

Only extract a component when it meaningfully reduces duplication or creates consistent behavior.

Do not create abstractions solely for theoretical purity.

---

# 36. Visual Composition Rules

These rules are important.

## Do not over-card the UI

A modern SaaS interface does not mean every section gets:

```text
border + background + shadow + radius
```

Use cards for meaningful containment.

Use whitespace for secondary grouping.

## Do not overuse amber

Solar Amber is primarily for:

- high-value CTA
- AI affordance
- focus emphasis
- small premium accents

Do not make:

- sidebar active state
- every badge
- every icon
- every heading
- every hover state

amber simultaneously.

## Do not overuse borders

Prefer whitespace and subtle background changes where possible.

## Do not overuse shadows

Use shadows primarily to establish actual depth.

Examples:

- resume sheet
- floating menu
- modal
- primary card surfaces when appropriate

---

# 37. Product-Like Page Composition

Each major page should answer these questions immediately:

1. Where am I?
2. What is this page for?
3. What is the primary action?
4. What should I work on next?
5. What information matters most?

The interface should not require the user to visually parse a wall of controls.

---

# 38. Resume Builder UX Principles

Resume creation is a content-authoring workflow.

Treat it more like a productivity/editor product than an admin application.

Prioritize:

- editing context
- clear section organization
- easy reorder
- rapid add/remove
- meaningful collapsed summaries
- visible document feedback
- easy AI assistance
- fast export
- reduced cognitive load

The user should feel like they are **building a document**, not editing database rows.

---

# 39. Reference Products — What to Learn From Them

References such as TealHQ and Resume-Now are quality benchmarks only.

Learn from characteristics such as:

### TealHQ-style qualities

- strong content hierarchy
- clean resume editing workflows
- modern SaaS navigation
- contextual guidance
- progressive disclosure
- useful side-by-side workflows
- calm, intentional surfaces

### Resume-Now-style qualities

- clear task progression
- strong primary action emphasis
- document-focused editing
- helpful guidance near inputs
- approachable consumer UX
- visually obvious completion flow

### Linear-style qualities

- precision
- typography
- spacing discipline
- restrained color
- polished interaction states
- excellent navigation composition

Do not replicate exact screens.

Extract the principles.

---

# 40. Visual Review Standard

For every major screen, review the finished implementation using these questions:

1. Is there one clear visual focal point?
2. Is the primary action immediately understandable?
3. Is the page hierarchy obvious within two seconds?
4. Is there sufficient whitespace between unrelated concepts?
5. Are related controls visually grouped?
6. Does the interface feel calm rather than dense?
7. Does the UI look polished at 1440px?
8. Does it remain intentionally designed at 375px?
9. Does any region still resemble a generic admin dashboard?
10. Does the screen feel credible next to a commercial resume SaaS application?
11. Are borders or cards being used where whitespace would be better?
12. Are there too many equal-weight buttons?
13. Are labels, metadata, and body copy visually differentiated?
14. Does dark mode feel deliberately designed?
15. Does the page feel like a consumer product rather than a developer tool?

If the answer to #9 is yes, continue refining.

If the answer to #10 is no, continue refining.

Do not stop merely because the required classes have been added.

---

# 41. Implementation Priority

Work in this order.

## Phase 1 — Foundation

1. `globals.css`
2. Button
3. Input
4. Textarea
5. Card
6. Wordmark
7. Shared typography conventions

## Phase 2 — Application Shell

8. App layout
9. Sidebar
10. Header
11. Mobile navigation
12. Main content container
13. Reusable page headers

## Phase 3 — Resume Editing Workflow

14. Profile editor
15. Content editors
16. Editor cards
17. Accordion behavior
18. Sortable rows
19. Form layout
20. Add/delete interactions
21. AI enhancement chips

## Phase 4 — Resume Preview

22. Preview workspace
23. Resume sheet
24. Print typography
25. Zoom system
26. Preview toolbar
27. Export action

## Phase 5 — Product Polish

28. Empty states
29. Loading states
30. Error presentation
31. Disabled states
32. Hover/active/focus states
33. Dark mode
34. Responsive behavior
35. Accessibility
36. Remove obsolete styles

Do not stop after updating primitives.

This is an application-wide UI refactor.

---

# 42. No-Regression Rules

The following are failures:

- hook signatures change
- API payloads change
- response contracts change
- TypeScript schemas change unnecessarily
- save functionality breaks
- delete functionality breaks
- reorder behavior breaks
- form validation breaks
- authentication behavior changes
- authorization behavior changes
- export functionality disappears
- mobile layouts overflow horizontally
- dark mode becomes unreadable
- resume text uses viewport units
- resume preview stops resembling a printed sheet
- editor workflows still look like dense CRUD forms
- duplicated styling replaces reusable primitives
- the agent updates colors and radius but leaves page composition unchanged

---

# 43. Code Quality Requirements

While refactoring:

- keep components reasonably focused
- preserve server/client boundaries
- do not mark large trees `"use client"` merely for convenience
- avoid unnecessary state
- reuse existing server state
- keep imports clean
- remove obsolete styling
- remove dead JSX
- do not leave commented-out legacy UI
- avoid duplicate variants
- avoid adding libraries unless needed
- preserve current data ownership
- keep TypeScript strictness intact

---

# 44. Validation Requirements

Before declaring completion:

1. run TypeScript checks
2. run linting if configured
3. run the production build
4. fix errors introduced by the refactor
5. verify existing forms still save
6. verify existing delete actions
7. verify reorder behavior
8. verify resume preview
9. verify zoom
10. verify PDF export
11. verify mobile navigation
12. verify 375px layout
13. verify 768px layout
14. verify 1024px layout
15. verify 1440px layout
16. verify light mode
17. verify dark mode
18. verify keyboard accessibility for key interactions
19. verify no obvious console/runtime errors
20. verify protected API/hook contracts remain unchanged

Do not claim success when known build or runtime regressions remain.

---

# 45. Required Completion Report

When the implementation is complete, return a concise report using this exact structure.

## Modified

List the primary existing files/components changed.

## Added

List new reusable presentation components.

## Preserved

Explicitly confirm:

- API request/response contracts unchanged
- React Query hook signatures unchanged
- TypeScript API/data schemas unchanged
- existing business logic preserved

## Validation

Report:

```text
TypeScript:
Lint:
Build:
Responsive:
Light mode:
Dark mode:
Resume zoom:
PDF export:
```

Use `PASS`, `FAIL`, or `NOT RUN`.

Do not claim a check passed if it was not actually executed.

## Notable UX Improvements

Provide no more than 8 concise bullets describing the most meaningful product improvements.

## Remaining Issues

List any known incomplete areas or regressions.

If none:

```text
None known.
```

---

# 46. Final Definition of Done

The task is complete only when the application feels substantially different from the original dense admin-form experience.

The finished product should communicate:

> This is a polished resume-building SaaS application designed for end users.

It should not communicate:

> This is an internal data-management interface with nicer Tailwind classes.

The implementation should demonstrate actual product design judgment.

Do not simply satisfy the individual CSS requirements mechanically.

Use them as the foundation for a coherent, premium, modern consumer SaaS interface.

Inspect the repository.

Understand the current workflows.

Redesign the presentation layer.

Preserve the application contracts.

Validate the implementation.

Then provide the completion report.
