# Governance

This document describes **who decides** what PCP is, and **how** changes to the
protocol are proposed, reviewed, and recorded. `CONTRIBUTING.md` covers *how to
contribute*; this document covers *who governs*.

## Principles

1. **Single responsibility is non-negotiable.** PCP defines only the structure of
   project communication. Any proposal that adds transport, trust, identity,
   routing, permissions, planning, scheduling, workflow-engine, orchestration, or
   execution semantics is out of scope by definition and will be declined,
   regardless of merit, because it belongs to another layer.
2. **Vendor-neutral.** PCP must remain usable with no dependency on any specific
   vendor, transport, or product. Decisions are made in the interest of the
   protocol as an open standard, not any one implementation.
3. **Backwards compatibility is a promise.** Within a major version, changes are
   additive and optional. Breaking changes require a new major version.

## What "normative" means

Text using RFC 2119 keywords (MUST, SHOULD, MAY, …) in `SPEC.md` and the JSON
Schemas under `schemas/` are **normative**: conformant implementations must obey
them. Everything in `docs/`, `README.md`, examples, and commentary is
**informative** — helpful, but not binding. On any conflict, the schemas and the
normative SPEC text win.

## Roles

- **Maintainers** — review and merge changes, cut releases, and safeguard the
  single-responsibility boundary. Until the project formally elects a broader
  group, the founding maintainers act in this role.
- **Contributors** — anyone who opens an issue or pull request.
- **Spec editors** — maintainers responsible for keeping `SPEC.md`, the schemas,
  and the conformance corpus consistent.

## Change process (RFC-style)

1. **Issue / proposal.** Open an issue. For anything touching schemas,
   vocabularies, or normative text, write it RFC-style: *motivation, proposal,
   alternatives considered, backwards-compatibility impact, security/SRP impact.*
2. **Review.** At least one maintainer reviews. Changes with design or security
   weight should receive an architecture- and security-oriented review focused on
   the SRP boundary. Independent/cross-checked review is encouraged for
   high-impact changes.
3. **Decision of record.** Accepted significant decisions are recorded (an ADR
   under `docs/` and/or the issue/PR thread) so the rationale survives.
4. **Implementation.** A schema/vocabulary change MUST land with an example and
   conformance fixtures (accept + reject) and a green test suite before merge.
5. **Release.** Versioning follows `SPEC.md` §10 and is recorded in `CHANGELOG.md`.

## Versioning authority

Only a major-version bump may introduce breaking changes (including changing the
closed `entity_type` or `rel` vocabularies, or removing/retyping a field).
Additive, optional fields and new controlled-vocabulary values are minor changes.
Editorial/documentation fixes are patch changes.

## Amending this document

Changes to governance follow the same RFC-style process and require maintainer
consensus.
