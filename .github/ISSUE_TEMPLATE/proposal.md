---
name: Change proposal (RFC-style)
about: Propose a change to PCP schemas, vocabularies, or normative text
title: "[Proposal] "
labels: proposal
---

> Before filing: PCP defines ONLY the structure of project communication. It does
> not do transport, trust, identity, routing, permissions, planning, scheduling,
> workflow enforcement, orchestration, or execution. Proposals adding those are
> out of scope (see GOVERNANCE.md).

## Motivation
What project-coordination information cannot be expressed today, and why it
matters.

## Proposal
The concrete change (fields, vocabulary, or normative text).

## Single-responsibility check
Confirm the change is *descriptive project-coordination metadata* — PCP reports
it, never acts on it. Note any field that could be mistaken for
transport/trust/planning/execution and how the wording prevents that.

## Alternatives considered
Other shapes you weighed and why you rejected them.

## Backwards-compatibility impact
Additive/optional (minor) or breaking (next major)? Does it touch the closed
`entity_type` / `rel` sets?

## Security impact
Any new untrusted field, injection surface, or trust-confusion risk (see
SECURITY.md).
