# Contributing to PCP

Thank you for helping improve the Project Coordination Protocol (PCP). PCP is a
vendor-neutral, machine-readable **semantic** protocol: it defines **only the
structure of project communication**. Please read this guide and `SPEC.md`
before opening a pull request.

## The prime directive

> **PCP carries no trust. PCP describes project-state changes only.**

PCP is a *semantic* layer. Transport, trust, identity, permissions, routing,
delivery/retry, planning, scheduling, workflow/state-machine enforcement,
approval, orchestration, and execution belong to **other layers** (for example a
transport such as AgentixMesh) — never to PCP.

Pull requests that add transport, trust, identity, routing, permissions,
planning, scheduling, workflow-engine, orchestration, or execution semantics
**will be rejected on single-responsibility grounds.** Every new field MUST be
justifiable as *descriptive project-coordination metadata*: PCP reports that
something is so; it never acts on it.

### Scope (a fixed given)

PCP is intentionally scoped to **project coordination**. It may, in the future,
become one protocol in a broader family of Agentix protocols — but PCP itself
will remain focused on project coordination. Proposals to broaden PCP beyond
project coordination are out of scope for this repository.

## Proposing a change

1. Open an issue describing the problem and the smallest change that solves it.
   For anything touching schemas, vocabularies, or normative text, write it up
   RFC-style (motivation, proposal, alternatives, backwards-compatibility).
2. `GOVERNANCE.md` describes who reviews and accepts changes and how decisions
   are recorded.
3. For non-trivial design questions, expect an architecture- and
   security-oriented review focused on the single-responsibility boundary.

## Backwards compatibility

- Within a major version, only **additive, optional** changes are allowed. An
  older validator must keep accepting newer-but-compatible messages.
- New classification values (status, verb, severity, etc.) are added to the
  controlled vocabulary in `SPEC.md`; they are *not* breaking because these are
  open tokens and consumers tolerate unknown values.
- `entity_type` and the `rel` vocabulary are **closed** (structural / SRP
  guards). Changing them is a major-version concern.
- Breaking changes go to the next major version under a new `schemas/vN/`
  namespace; the previous major stays valid and supported.

## Development setup

```bash
npm install                              # installs Ajv (tooling only)
node reference/validate.mjs <file.json>  # validate a PcpMessage
node reference/validate.mjs --schema task <file.json>   # validate a bare entity
npm test                                 # runs the schema/example/conformance tests
```

The schemas are language-neutral JSON Schema 2020-12; the Node/Ajv validator is
a reference implementation and tooling only — not a runtime dependency of PCP.

## Every schema change needs proof

A change to any schema or vocabulary MUST come with:

- at least one **example** under `examples/v1/` (if a new message shape), and
- **conformance fixtures** under `conformance/` — both an `accept` case and at
  least one `reject` case — registered in `conformance/manifest.json`, and
- green `npm test` (examples validate, conformance corpus passes, schema-lint
  invariants hold).

## Commit & PR hygiene

- One logical change per commit; clear, imperative commit messages.
- Keep the diff scoped to the change; don't reformat unrelated files.
- A Developer Certificate of Origin sign-off (`git commit -s`) is encouraged.

## Licensing of contributions

By contributing you agree that your contributions are licensed under the
project's terms: **Apache-2.0** for code, schemas, examples, conformance, and
tests; **CC-BY-4.0** for the specification text (`SPEC.md`) and `docs/`. See
`LICENSE`, `LICENSE-docs`, and `NOTICE`.
