You are in the phase before the formal Figma developer-handoff audit.

Its purpose is to make the selected Figma source structurally understandable and safe to inspect without disguising unresolved design, responsive, accessibility, content, or implementation problems.

Preparation and audit are separate activities:

- **Preparation** improves organization, naming, component integrity, design-system semantics, and documentation.
- **Audit** evaluates whether the design provides enough reliable evidence for implementation.

A cleanly named file is not automatically ready for developer handoff.

## Operating constraints

During preparation:

- Preserve the existing visual design, layout, interaction behavior, and product content.
- Do not invent missing product, responsive, accessibility, or interaction decisions.
- Do not detach instances, recreate components, or reorganize published resources without evidence that the change is safe.
- Treat prototype connections, component properties, instance overrides, variable aliases, export settings, reading order, and responsive behavior as potentially fragile.
- Record meaningful changes and unresolved risks so normalization does not erase evidence needed by the formal audit.
- Limit changes to the specified scope unless a dependency outside that scope must be inspected to verify component, style, variable, or documentation integrity.

## 1. Capture the baseline

Inspect the requested scope before changing it and record the most important existing problems.

Capture evidence of:

- Generic, visual, positional, or inconsistent layer names.
- Unclear page, section, screen, or component organization.
- Excessive nesting or ambiguous hierarchy.
- Empty layers and apparently unnecessary groups, frames, or wrappers.
- Repeated structures that are not components.
- Detached instances, missing main components, and duplicate components.
- Components stored in product screens, archives, experiments, or unrelated pages.
- Inconsistent component properties and variant names.
- Duplicate or inconsistently applied styles and variables.
- Hard-coded values that bypass the design system.
- Typography styles whose names, properties, usage, or documentation disagree.
- Outdated, incomplete, or misleading documentation.

Preserve a concise change log throughout the preparation work.

## 2. Rename layers semantically

Rename relevant pages, sections, frames, groups, text layers, images, icons, components, component sets, variants, and important nested layers according to responsibility and meaning.

Names should describe what an element represents in the interface rather than its appearance, position, Figma object type, or creation order.

Prefer names such as:

- `Article card`
- `Article card / Content`
- `Article card / Title`
- `Navigation / Primary`
- `Button / Label`
- `Icon / Arrow right`

Avoid names such as:

- `Frame 42`
- `Group 7`
- `Rectangle`
- `Text`
- `Left`
- `Blue box`
- `Component 3`

Keep names systematic and concise. Do not repeat unnecessary parent context in every descendant or create names so long that the layer panel becomes difficult to scan.

## 3. Review page and component architecture

Review the architecture of pages, sections, product screens, resource areas, components, component sets, frames, groups, and nested layers.

Determine whether the file clearly separates:

- Product screens.
- Design-system foundations.
- Components and patterns.
- Assets and resources.
- Documentation.
- Explorations or work in progress.
- Deprecated or archived content.

Review each relevant screen and component hierarchy for unnecessary structure, including:

- Groups that provide no meaningful organization.
- Frames that do not control layout, clipping, constraints, sizing, visual properties, prototyping, or export behavior.
- Nested frames that duplicate the responsibility of a parent.
- Empty frames, groups, sections, or layers.
- Single-child wrappers with no meaningful responsibility.
- Decorative rectangles that could safely be represented by a parent frame's fill, border, or effect.
- Sections that do not provide useful file organization.
- Duplicate resource or documentation pages.
- Excessive nesting that obscures reading order or implementation structure.

Simplify the hierarchy only when the change is safe.

Before removing or merging a layer, verify its effect on:

- Visual appearance.
- Auto Layout.
- Hug, fill, fixed, minimum, and maximum sizing.
- Constraints and responsive resizing.
- Clipping and masks.
- Layer order and reading order.
- Component inheritance and exposed properties.
- Instance overrides.
- Prototype connections and interactions.
- Export settings.

Do not remove a group, frame, or wrapper solely because it appears redundant.

Record structural elements that were reviewed and intentionally retained, especially when their purpose is not visually obvious.

## 4. Review components, component sets, and variants

Review repeated interface patterns and determine whether their component architecture is understandable, reusable, and proportionate to the product.

Check:

- Component boundaries and responsibilities.
- Main components and component sets.
- Nested component use.
- Exposed text, boolean, instance-swap, and variant properties.
- Variant property names and values.
- Instance overrides.
- Detached instances.
- Duplicate or visually equivalent components.
- Components that combine unrelated responsibilities.
- Components that are fragmented into pieces too small to be useful.
- Repeated structures that remain disconnected.
- Components with very limited use that add more complexity than value.

Name properties and values semantically. For example:

- `Variant: Primary | Secondary | Ghost`
- `Size: Small | Medium | Large`
- `State: Default | Hover | Focus | Disabled`
- `Icon: None | Leading | Trailing`

Do not combine unrelated dimensions into one value when they can be modeled independently.

Avoid names that encode arbitrary visual values or implementation details unless those values represent an intentional design-system distinction.

Do not detach instances or significantly restructure component architecture merely to make the file look cleaner. Record potentially disruptive changes before applying them.

## 5. Verify every instance has an accessible source component

Review every component instance in the specified scope and verify that it remains linked to an identifiable main component.

For each instance, confirm that:

- The source component exists.
- The instance is not detached.
- The source component is not hidden inside an unrelated product screen.
- The source component is stored in the intended resource page or library.
- The source can be located and understood without searching through unrelated pages.
- Its name matches the instance's semantic responsibility.
- It is not an obsolete duplicate of another source component.
- It is not linked unintentionally to an experimental, archived, or deprecated component.

Unless the file establishes another explicit convention, keep local main components used by the audited screens in one designated resource page, such as:

- `Components`
- `UI Library`
- `Design System`
- `Resources`

Do not create competing resource pages without a clear architectural reason.

When an instance does not have an appropriate source in the designated resource page:

1. Locate the original main component, when it exists.
2. Determine whether it should be moved, reorganized, replaced, or safely recreated.
3. Preserve existing instance relationships whenever possible.
4. Avoid detaching and manually rebuilding instances.
5. Check whether moving the source could affect documentation, variants, prototypes, publishing, or consumers in other files.
6. Record unresolved dependencies separately.

Distinguish between:

- Local instances linked to local main components.
- Instances linked to a published external library.
- Detached instances.
- Missing or inaccessible main components.
- Instances linked to deprecated components.
- Visually similar instances linked to duplicate main components.

Do not duplicate an external-library component locally merely to satisfy the same-page convention. Document the library source and verify that the implementation team is expected to have access to it.

## 6. Rename styles and variables semantically

Review text, color, effect, and grid styles together with variable collections, variables, modes, and aliases.

Rename them according to design-system purpose rather than raw visual value.

Prefer names such as:

- `Color / Background / Page`
- `Color / Background / Surface`
- `Color / Text / Primary`
- `Color / Text / Secondary`
- `Color / Border / Focus`
- `Color / Feedback / Error`
- `Space / 200`
- `Radius / Medium`

When appropriate, preserve a distinction between primitive and semantic tokens:

```text
Primitive / Blue / 500
Primitive / Neutral / 900

Semantic / Background / Brand
Semantic / Text / Primary
```

Identify:

- Duplicate styles or variables.
- Hard-coded values.
- Unclear or broken aliases.
- Inconsistent variable usage.
- Unused or obsolete resources.
- Semantic tokens connected directly to arbitrary values without a clear token model.
- Modes with incomplete coverage.
- Styles and variables that express the same concept inconsistently.

Do not rename or reorganize published resources without recording potential downstream impact on connected files and consumers.

## 7. Normalize typography

Rename text styles according to semantic role and hierarchy.

A suitable structure may include:

- `Typography / Display / Large`
- `Typography / Heading / H1`
- `Typography / Heading / H2`
- `Typography / Heading / H3`
- `Typography / Body / Large`
- `Typography / Body / Medium`
- `Typography / Body / Small`
- `Typography / Label / Medium`
- `Typography / Caption`

Review:

- Font family.
- Font weight.
- Font size.
- Line height.
- Letter spacing.
- Text case.
- Intended use.
- Hierarchy.
- Responsive behavior.
- Consistency across the file.

Update text layers to use the intended styles and consolidate accidental duplicates when safe.

Avoid names based only on visual properties, such as:

- `Inter 16 Medium`
- `Text 24 Bold`
- `Big Heading`
- `Desktop H2`

Use device-specific names only when desktop and mobile styles represent intentionally different design-system roles rather than different implementations of the same semantic role.

## 8. Update Typography documentation

Find the Typography documentation in the Figma file and update it so it accurately represents the normalized typography system.

The documentation should include:

- Current semantic style names.
- Font families.
- Font weights.
- Font sizes.
- Line heights.
- Letter spacing.
- Intended usage.
- Hierarchy.
- Responsive differences.
- Accessibility guidance.
- Intentional exceptions.
- Deprecated or replaced styles.

Documentation examples should use the styles they describe whenever practical.

Each documented role should explain:

- What the style is called.
- Where it should be used.
- Where it should not be used.
- Its typographic properties.
- Whether it changes responsively.
- Its likely semantic HTML relationship when relevant.

Example:

```text
Typography / Body / Medium

Usage:
Default paragraph text, descriptions, form guidance, and supporting content.

Properties:
Font size: 16px
Line height: 24px
Weight: Regular
Letter spacing: 0

Implementation guidance:
Use for standard body copy. Avoid using it for interactive labels or headings.
```

Remove or clearly mark documentation for styles that no longer exist.

## 9. Perform the first verification review

After the preparation pass, review the entire specified scope for completeness and consistency.

Confirm that:

- All relevant pages, sections, screens, and resource areas were inspected.
- Relevant layers, components, component sets, variants, and properties use semantic names.
- Generic names do not remain unintentionally.
- Page and component architecture is understandable.
- Unnecessary groups, frames, wrappers, and empty layers were removed where safe.
- Structural layers that remain have a clear responsibility.
- Repeated patterns were reviewed for componentization.
- Component boundaries, variants, and properties are coherent.
- Every local instance is connected to an identifiable main component.
- Local main components are stored in the intended resource page.
- External-library dependencies are documented.
- Detached, missing, duplicated, deprecated, or inaccessible component relationships are recorded.
- Styles and variables use consistent semantic naming.
- Primitive and semantic token responsibilities are clear.
- Typography styles are normalized and applied correctly.
- Typography documentation matches the current system.
- Deprecated or replaced resources are identified.
- The change log is complete.

Search specifically for omissions rather than reviewing only the elements changed during the first pass.

## 10. Perform the second verification review

Perform a separate safety and regression review focused on unintended consequences and inaccurate documentation.

Confirm that preparation did not unintentionally change:

- Visual appearance.
- Layout, spacing, or alignment.
- Auto Layout behavior.
- Hug, fill, fixed, minimum, or maximum sizing.
- Constraints or responsive resizing.
- Clipping, masks, or layer order.
- Component inheritance.
- Variant behavior or exposed properties.
- Instance overrides.
- Prototype connections or interaction behavior.
- Export settings.
- Visibility or reading order.
- Product content.

Compare the normalized result with the captured baseline wherever practical.

Also verify that:

- No required structural layer was removed because it merely appeared redundant.
- No component was recreated when its existing source could have been preserved.
- No instance was detached unnecessarily.
- No local component was duplicated only to satisfy resource-page organization.
- No external-library component was copied into the local file unnecessarily.
- No published style, variable, or component was renamed without recording possible downstream impact.
- No documentation claims behavior that is absent from the design.
- No unresolved problem was hidden by normalization.
- The readiness assessment will reflect actual design and implementation gaps rather than file cleanliness alone.

Correct issues discovered during either verification review.

When a correction materially affects component architecture, instance relationships, variables, typography, responsive behavior, or documentation, repeat the relevant checks before continuing.

Do not proceed to the readiness assessment while known preparation inconsistencies remain unresolved unless:

- The issue cannot be corrected safely.
- It depends on an external library or unavailable resource.
- It requires a product or design decision.
- The correction could cause significant downstream changes.

Record these exceptions as unresolved risks requiring human confirmation.

Add both review results to the change log, including:

- Problems found.
- Corrections made.
- Elements intentionally retained.
- Risks that remain unresolved.
- Areas that could not be verified.

## 11. Assess developer-handoff readiness

After preparation and both verification reviews, assess how ready the file is for developer handoff.

Evaluate:

- File and page organization.
- Page and component architecture.
- Hierarchy depth and structural clarity.
- Unnecessary layers, groups, frames, sections, and wrappers.
- Semantic naming.
- Component architecture and source organization.
- Instance-to-component integrity.
- Variants and component properties.
- Styles and variables.
- Typography and documentation.
- Responsive behavior.
- Interaction states.
- Accessibility.
- Content and edge-case states.
- Asset readiness.
- Documentation quality.
- Implementation ambiguity.

Classify the file as one of the following:

- **Ready:** implementation can begin with only minor clarification.
- **Mostly ready:** implementation can begin, but documented gaps remain.
- **Partially ready:** major responsive, state, accessibility, component, or specification gaps remain.
- **Not ready:** developers would need to reconstruct significant design decisions.

Explain the rating with concrete evidence.

Do not classify the file as ready solely because it is clean, consistently named, or well organized. A ready file must communicate enough responsive, interaction, accessibility, content, state, and implementation behavior for development to proceed without substantial guessing.

## 12. Report the result

Provide:

1. A concise summary of the preparation work.
2. The baseline problems recorded before normalization.
3. The naming conventions applied.
4. Page and component architecture changes.
5. Unnecessary layers, groups, frames, wrappers, or sections removed.
6. Structural elements reviewed and intentionally retained.
7. Components, variants, styles, or variables consolidated or restructured.
8. The status of instance-to-component relationships.
9. Instances whose sources are missing, detached, duplicated, deprecated, external, or stored in the wrong location.
10. Changes made to Typography documentation.
11. Findings and corrections from both verification reviews.
12. Remaining inconsistencies, limitations, and risks.
13. The developer-handoff readiness rating and supporting evidence.
14. A prioritized list of issues for the formal developer-handoff audit.

Clearly distinguish between:

- Changes made during preparation.
- Issues intentionally left for the formal audit.
- Structural elements reviewed but retained.
- External-library dependencies.
- Unverified areas.
- Assumptions requiring human confirmation.

Include a concise change log identifying renamed, moved, consolidated, recreated, retained, or removed resources.
