A **`DESIGN.md` file is a project-specific design reference written in Markdown**. It documents how a product, page, or component is intended to look, behave, and adapt—especially when the source of truth begins as a Figma design.

## What `DESIGN.md` should answer

A useful `DESIGN.md` explains:

* What is being designed?
* What is the visual structure?
* Which design-system rules are being used?
* How should the interface behave?
* What changes across viewport sizes?
* What states and variants exist?
* What accessibility expectations are visible or implied?
* Which details are confirmed, inferred, or still unclear?

It should capture the **design intent**, not merely list pixel measurements copied from the design source.

## Typical relationship with other files

In your workflow, the files can have distinct responsibilities:

| File        | Main question                                              |
| ----------- | ---------------------------------------------------------- |
| `DESIGN.md` | What is the design, and how is it intended to work?        |
| `SPEC.md`   | What precise requirements must the implementation satisfy? |
| `PLAN.md`   | How will we build it in the repository?                    |

For example:

* `DESIGN.md`: “The navigation collapses into a menu on small screens.”
* `SPEC.md`: “Below 768 px, hide the desktop navigation and expose a keyboard-accessible menu button.”
* `PLAN.md`: “Create `MobileNavigation.tsx`, add menu state, and use the existing `useMediaQuery` utility.”

## Recommended format

```md
# Component or Page Name

## 1. Overview

Briefly explain what the design represents, its purpose, and where it appears.

## 2. Source

- Design source:
- Analyzed node:
- Relevant pages or frames:
- Analysis date:

## 3. Design Intent

Explain the user goal, visual direction, hierarchy, and important design decisions.

## 4. Structure

Describe the interface from top to bottom.

- Header
- Main content
- Supporting content
- Actions
- Footer

## 5. Layout

Document:

- Container behavior
- Grid or column structure
- Alignment
- Spacing relationships
- Maximum widths
- Fixed versus fluid dimensions
- Overflow behavior

## 6. Visual Hierarchy

Explain:

- Primary and secondary elements
- Reading order
- Emphasis
- Grouping
- Density

## 7. Typography

Document the observed typography roles.

| Role | Font | Weight | Size | Line height | Usage |
|---|---|---:|---:|---:|---|
| Page title | ... | ... | ... | ... | ... |
| Body | ... | ... | ... | ... | ... |

## 8. Colors and Visual Tokens

Document semantic usage rather than only raw values.

| Token or role | Value | Usage |
|---|---|---|
| Surface | ... | Main background |
| Primary text | ... | Headings and body |
| Accent | ... | Primary actions |

## 9. Components

For each important component, describe:

- Purpose
- Anatomy
- Variants
- States
- Content rules
- Reuse expectations

## 10. Interaction Behavior

Document:

- Click or tap behavior
- Hover behavior
- Focus behavior
- Keyboard behavior
- Transitions
- Open and closed states
- Validation or feedback behavior

## 11. Responsive Behavior

### Small screens

Describe stacking, resizing, hiding, reordering, and navigation changes.

### Medium screens

Describe transitional layout behavior.

### Large screens

Describe maximum widths, columns, and expanded navigation.

## 12. States and Edge Cases

Include relevant states such as:

- Default
- Hover
- Focus
- Active
- Selected
- Disabled
- Loading
- Empty
- Error
- Success
- Long content
- Missing image

## 13. Accessibility Intent

Document:

- Semantic structure
- Heading hierarchy
- Keyboard access
- Visible focus
- Contrast expectations
- Touch-target expectations
- Alternative text
- Reduced-motion considerations
- Screen-reader behavior

## 14. Assets and Iconography

List:

- Images
- Logos
- Icons
- Illustrations
- Export requirements
- Aspect-ratio behavior

## 15. Design-System Mapping

Identify:

- Existing components
- Tokens
- Reusable patterns
- New patterns that may be required
- Deviations from the current design system

## 16. Assumptions and Inferences

Clearly distinguish details inferred from the design from confirmed requirements.

## 17. Open Questions

List anything that cannot be determined safely from the design source.

## 18. Risks and Potential Inconsistencies

Document contradictions, incomplete states, unusual dimensions, or implementation concerns.
```

## What it should not become

A `DESIGN.md` should not be:

* A dump of every design source property.
* A replacement for the design source.
* A component implementation plan.
* A list of CSS declarations.
* A requirements document disguised as design documentation.
* A place where uncertain behavior is presented as confirmed fact.

For instance, avoid writing only:

> Card width: 384 px. Padding: 24 px. Gap: 16 px.

A better explanation would be:

> Cards use a fixed-width presentation in the desktop composition, but the surrounding layout suggests they should become fluid on smaller screens. Internal spacing follows an apparent 8 px scale, with 24 px container padding and 16 px separation between content groups.

The second version preserves both the observed values and the design intent.

## Observation versus inference

This distinction is especially important when generating `DESIGN.md` from design sources.

Use language such as:

* **Observed:** directly visible or explicitly defined in the design source.
* **Inferred:** strongly suggested but not explicitly demonstrated.
* **Recommended:** proposed to resolve a missing design decision.
* **Open question:** requires confirmation.

Example:

```md
### Mobile navigation

- **Observed:** The supplied node contains only the desktop navigation.
- **Inferred:** The navigation cannot fit unchanged below approximately 700 px.
- **Recommended:** Replace the links with a menu button on narrow screens.
- **Open question:** Should the mobile menu use a drawer, dropdown, or full-screen overlay?
```

This prevents invented responsive behavior from being confused with the original design.

## Concentrate on:

1. **Visual interpretation** — layout, typography, spacing, colors, hierarchy, assets.
2. **Behavioral intent** — interactions, states, variants, and content behavior.
3. **Responsive interpretation** — what changes and what remains consistent.
4. **Uncertainty management** — observations, assumptions, contradictions, and open questions.

That makes `DESIGN.md` a durable explanation of the design rather than a temporary design source inspection report.
