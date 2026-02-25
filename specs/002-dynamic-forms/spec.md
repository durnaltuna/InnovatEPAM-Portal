# Feature Specification: Smart Submission Forms (Dynamic Fields)

**Feature Branch**: `002-dynamic-forms`  
**Created**: February 25, 2026  
**Status**: Draft  
**Input**: Smart Submission Forms with dynamic fields that adapt based on user selections and idea categories

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit Idea with Category-Dependent Fields (Priority: P1)

A submitter creates a new idea and sees form fields that are specifically relevant to their chosen idea category. When they select a category (e.g., "Process Improvement," "Product Innovation," "Cost Reduction"), the form dynamically displays only the required and optional fields for that category, hiding irrelevant fields.

**Why this priority**: This is the core value of the feature. It directly improves the user experience by reducing cognitive load and form complexity. Users see only what they need, leading to faster submission and higher completion rates. This is essential for the Phase 2 feature.

**Independent Test**: A submitter can independently complete the entire idea submission workflow with a category-specific form and successfully submit it. The test validates that the correct fields appear/disappear based on category selection.

**Acceptance Scenarios**:

1. **Given** a submitter is on the idea submission form, **When** they select a category from the dropdown, **Then** the form re-renders to show only fields configured for that category
2. **Given** a form is displaying category-specific fields, **When** the user selects a different category, **Then** existing field values are preserved where applicable (for shared fields), and category-specific fields are swapped
3. **Given** a submitter completes all required fields for their selected category, **When** they click submit, **Then** the idea is created successfully with all captured field values
4. **Given** a form with optional category-specific fields, **When** a submitter skips optional fields and submits, **Then** the submission succeeds with only required fields populated

---

### User Story 2 - Form Validation Adapts to Category Rules (Priority: P2)

Form validation rules (required/optional, format constraints, min/max values) adapt dynamically based on the selected category. A field that is required for one category might be optional for another, ensuring submitters only need to meet the validation rules for their context.

**Why this priority**: Validation is critical for data quality and user experience. If validation rules don't adapt, users will be blocked by irrelevant requirements. This feature prevents frustration and ensures all collected data is valid for its context.

**Independent Test**: A submitter can independently complete submissions for different categories and verify that category-specific validation rules are enforced. An attempt to submit without required (but not optional) category fields fails appropriately.

**Acceptance Scenarios**:

1. **Given** a category where "expected impact" is required, **When** a submitter selects that category and leaves the impact field empty, **Then** form validation displays an error preventing submission
2. **Given** a category where "timeline" is optional, **When** a submitter selects that category and submits without a timeline, **Then** the submission succeeds
3. **Given** a field with a format constraint (e.g., numeric), **When** a submitter enters invalid data, **Then** real-time validation feedback is provided before submission

---

### User Story 3 - Admin Configures Category-Field Mappings (Priority: P3)

**PHASE 2 SCOPE**: Form field configuration is implemented via hardcoded TypeScript seed script (`src/config/formConfigs.ts`) with 3-5 predefined categories: "Process Improvement", "Product Innovation", "Cost Reduction", "Business Process", "Other". The admin configuration UI is deferred to Phase 3.

An administrator can define which form fields are associated with each idea category and specify their required/optional status. For Phase 2, admins update the seed configuration in code; a configuration UI with runtime updates is planned for Phase 3.

**Why this priority**: Configuration flexibility is important for long-term scalability and supporting new categories without engineering effort. However, it's not critical for the initial Phase 2 launch—a seeded configuration in the database is acceptable for MVP. Phase 3 will add the admin UI.

**Independent Test**: An admin can verify that the seeded categories (Process Improvement, Product Innovation, Cost Reduction, Business Process, Other) appear correctly in the form and that field mappings are applied. The feature is "done" for Phase 2 when the seed configuration is deployed and forms render correctly per category.

**Acceptance Scenarios (Phase 2)**:

1. **Given** the form seed configuration includes "Process Improvement" category, **When** a submitter selects it, **Then** the configured fields for that category appear
2. **Given** a form seed with category-field mappings, **When** a submitter selects different categories, **Then** the appropriate fields appear/disappear per configuration
3. **Given** the seeded configuration, **When** forms are submitted for each category, **Then** all required field data is captured correctly for that category

**Acceptance Scenarios (Future Phase 3 - Runtime Admin UI)**:

1. **Given** an admin accesses the category configuration UI (Phase 3), **When** they toggle a field as "required" for a specific category, **Then** new form submissions for that category enforce the requirement
2. **Given** a category with existing field mappings, **When** an admin removes a field (Phase 3 UI), **Then** that field no longer appears in form submissions for that category
3. **Given** a new idea category created via Phase 3 admin UI, **When** it is configured with default fields, **Then** submitters see appropriate fields when selecting that category

---

### User Story 4 - Form State Persists During Dynamic Changes (Priority: P2)

When a form dynamically updates (e.g., category change), previously entered values in shared fields are preserved, preventing data loss and frustration from re-entry.

**Why this priority**: Data preservation is a quality-of-life feature that significantly impacts user satisfaction. Losing data when changing categories would be frustrating and discourage form completion.

**Independent Test**: A submitter can fill in shared fields, change categories, and verify that shared field values are retained while category-specific fields reset appropriately.

**Acceptance Scenarios**:

1. **Given** a submitter has filled in the title field (which is present across all categories), **When** they change the category, **Then** the title value persists
2. **Given** a field is specific to the original category and disappears when switching categories, **When** switching back to the original category, **Then** the previously entered value for that field is restored
3. **Given** a submitter has partially filled a form, **When** they navigate away and return, **Then** all previously entered values are still present (requires session/local storage handling)

---

### Edge Cases

- What happens when a required field for a category is removed from configuration while a user is editing that form?
- How does the system handle field type mismatches if configuration changes between page load and submission?
- How are existing Phase 1 submissions (without category-specific metadata) handled when viewed in the admin panel?
- What happens if a submitter's saved draft references a category that no longer exists?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display form fields dynamically based on the selected idea category
- **FR-002**: System MUST persist submitted values in fields that remain visible across category changes
- **FR-003**: System MUST validate form submissions using category-specific validation rules
- **FR-004**: System MUST support the following field types: text input, textarea, dropdown/select, checkbox, radio button, file upload
- **FR-005**: System MUST include metadata in the form submission indicating which category was selected
- **FR-006**: Form configuration for category-field mappings MUST be persisted in the database
- **FR-007**: System MUST provide an admin interface or configuration mechanism to define/modify category-field associations
- **FR-008**: System MUST maintain backward compatibility with Phase 1 idea submissions (they should remain accessible)
- **FR-009**: Field visibility rules engine MUST support simple category-based conditions (no complex conditional logic for Phase 2 MVP)
- **FR-010**: System MUST provide clear validation error messages specific to the category context

### Database & Data Model

- **DM-001**: Extend the "categories" table to include field metadata (JSON structure of field definitions)
- **DM-002**: Extend the "ideas" table to include a "category_id" foreign key if not already present
- **DM-003**: Add a new "form_fields" table storing field definitions with attributes: name, type, required flag, category association, validation rules
- **DM-004**: Add a new "form_configurations" table linking categories to their configured fields

### Constitution Alignment *(mandatory)*

- **CA-001 Product Intent**: Each user story maps directly to the PRD objective of "improving form usability through contextual fields" and to success criteria measuring form completion time and submission success rate
- **CA-002 Stack Consistency**: Implementation will use React for dynamic form rendering, Tailwind CSS for styling, and Supabase for configuration persistence. No stack deviations anticipated
- **CA-003 Test-First Scope**: Business logic areas requiring test-first approach include (a) field visibility rules engine, (b) validation rule application, and (c) form state management during category changes
- **CA-004 Architecture Traceability**: Dynamic form rendering may require updates to the form component architecture; impacts the IdeaForm component and validation service. ADR may be needed if moving to a form builder library
- **CA-005 Human Accountability**: Code review required for validation rules engine logic and database migration strategy

### Key Entities

- **Category**: Represents an idea category (e.g., "Process Improvement", "Innovation"). Attributes: id, name, description, field_mappings (JSON)
- **FormField**: Represents a form field definition. Attributes: id, field_key, field_type, label, required, validation_rules, applicable_categories
- **FormConfiguration**: Represents the grouping of fields for a category. Attributes: id, category_id, field_ids (array/JSON), created_at, updated_at
- **Idea** (existing, extended): Added category_id foreign key and dynamic_form_data (JSON) to store values for dynamic fields

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Form completion time decreases by 30% for submitters using dynamic category-specific forms compared to Phase 1 static forms
- **SC-002**: Form submission success rate (valid submissions on first attempt) increases to 95% or higher for category-dependent forms
- **SC-003**: Zero data loss when users change categories during form filling (100% of applicable field values preserved)
- **SC-004**: 100% of configuration changes (new/modified category-field mappings) are reflected in form submissions within 1 minute
- **SC-005**: Backward compatibility: 100% of Phase 1 ideas remain accessible and viewable without errors
- **SC-006**: Admin configuration interface is usable by at least 90% of admin users without additional training (measured via usability testing) **[Phase 3 - UI not in Phase 2 scope; Phase 2 uses seeded config only]**

## Assumptions

- **A-001**: Phase 1 MVP is complete and deployed; we can extend the existing idea submission form
- **A-002**: Submitters will select a category for every idea submission (category field is always visible and required)
- **A-003**: Initial Phase 2 launch will use seeded/hardcoded category-field configurations; a full admin configuration UI is deferred to Phase 3 or later if needed
- **A-004**: Field types are limited to the six common types listed (text, textarea, select, checkbox, radio, file)—exotic field types are deferred
- **A-005**: Form validation is synchronous; asynchronous validation (e.g., checking for duplicate titles via API) is out of scope for Phase 2
- **A-006**: Categories are created/managed by admins via database or admin panel; submitters can only select from existing categories
- **A-007**: Session management for draft data is handled separately; Phase 2 assumes form state is preserved in React component state during a single session
- **A-008**: Phase 2 seed categories are exactly: "Process Improvement", "Product Innovation", "Cost Reduction", "Business Process", "Other"
- **A-009**: Form configuration is cached client-side (SWR) for 5 minutes; users may see stale config briefly after admin changes in Phase 3. Cache revalidation can be forced via manual refresh.

## Out of Scope (Deferred to Later Phases)

- Advanced conditional logic (e.g., "show field B if field A equals X")
- Complex workflow rules (e.g., branching paths based on multiple criteria)
- Field reordering/customization per user
- Multi-language field labels
- Rich text editing (markdown, WYSIWYG)
- Real-time collaboration on draft forms
- Form templates or form duplication
