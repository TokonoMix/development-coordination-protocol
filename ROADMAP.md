# Roadmap

PCP evolves conservatively. The protocol's value is stability and a sharp scope,
so the roadmap favours *not* growing the core.

## Scope (a fixed given)

PCP is intentionally scoped to **project coordination**. It may, in the future,
become **one protocol in a broader family of Agentix protocols** — but PCP itself
will remain focused on project coordination. Other concerns (transport, identity,
trust, routing, planning, orchestration, execution) are explicitly *other
protocols / other layers*, never folded into PCP.

## v1 (current)

Scope deliberately limited to the structure of project communication:

- The `PcpMessage` envelope and the `Event` change-wrapper.
- Eight entities: Project, Task, Dependency, ArchitectureImpact, Decision,
  ReviewRequest, Finding, Milestone.
- Identifiers, controlled vocabularies, the namespaced `extensions` model.
- JSON Schema 2020-12 schemas, examples, a language-neutral conformance corpus,
  and a reference validator.

### Possible additive v1.x work (backwards-compatible only)

- More worked examples and language-neutral conformance cases.
- Additional controlled-vocabulary verbs / status values (open tokens, so
  non-breaking).
- Reference validators in additional languages (Python, Go) — tooling only.
- A documented set of standard `extensions` namespaces (still optional).

## Candidate v2 topics (breaking; require a new major namespace)

Recorded as *candidates*, not commitments. Each must still respect the prime
directive — none of these may add transport/trust/routing/execution semantics.

- Revisiting the closed `entity_type` set (e.g. a new coordination noun) if a
  real, recurring need appears that cannot be expressed via existing entities +
  extensions.
- Revisiting the closed `rel` vocabulary for `refs`.
- A richer (but still descriptive) `delta` form, if scalar-leaf deltas prove
  insufficient and a non-injecting structured form is found.

## Explicit non-goals (will not be built here)

Planner · scheduler · workflow engine · approval engine · orchestration engine ·
execution engine · transport · signing/identity · routing · GitHub/Jira product
integrations · UI. These belong to implementations and other layers.
