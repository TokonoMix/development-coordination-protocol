# Single-Responsibility Boundaries

DCP's hardest design constraint is staying *purely semantic*. This document
records, field by field, why each potentially-suspect field is descriptive
project-coordination metadata and **not** a transport/trust/planning/execution
concern. The test applied throughout: **does DCP define behaviour that acts on
the field, or is the field only reported?** Reported = in scope.

## Fields that look like they might cross the line — and why they don't

| Field | Looks like | Why it stays semantic |
|---|---|---|
| `message_id` | delivery/idempotency id | Audit/correlation identity only. DCP does no dedup/delivery; the spec forbids reading it as a delivery id. |
| `message_type` | a routing key | A denormalized convenience copy of `<entity_type>.<verb>`. Non-authoritative; transports MUST NOT route on it; body wins. |
| `correlation_id` | a transport thread id | A semantic link to a prior DCP message; no delivery meaning, no authenticity guarantee. |
| `attributed_to` | an authenticated identity | Free-form opaque, untrusted provenance label; no `scheme:value`; grants nothing. Renamed from `actor` precisely to avoid the identity reading. |
| `responsible_party`, `requested_reviewers` | assignment / approver authority | Descriptive untrusted labels; not principals, not grants, not work assignments. |
| `priority` | a scheduler input | A descriptive label; DCP defines no scheduler and no behaviour over it. |
| `dependency_type: blocks` | a workflow ordering instruction | States a relationship; DCP enforces, orders, or schedules nothing on it. |
| `milestone.target_date` | a deadline / scheduling directive | Descriptive intent; DCP derives no deadline state and performs no scheduling. |
| status enums | a state machine | A vocabulary of states; DCP enforces no transitions. |
| `ReviewRequest.status: approved` | an authorization to proceed | A record that an approval occurred; DCP gates nothing. A separate system decides what to do. |
| `Finding.location.path` | a file handle | A descriptive locator; never a file-access grant (and a security-hazard string — see SECURITY.md). |
| `refs[].ref` | a dereferenceable URL | An opaque pointer; consumers must not auto-resolve it (SSRF). |
| `refs[].rel` | could carry routing/permission verbs | **Closed** vocabulary; routing/permission relations are intentionally excluded. |

## Structural guards

- `entity_type` and `refs[].rel` are **closed** sets — the two places where an
  open value could let transport/permission semantics leak in. Everything else
  that classifies (status, verb, severity, …) is an open token, because those
  grow and must not become breaking-change points.
- The envelope core and every entity are `additionalProperties: false`. The only
  way to add data is a namespaced, always-optional `extensions` object — which
  must not carry transport/trust data, and whose reserved-looking prefixes carry
  no authority.

## The line, stated plainly

If a change would make DCP *do* something — route, authenticate, authorize,
schedule, enforce a transition, orchestrate, or execute — it is out of scope by
definition, no matter how convenient. DCP only records that something changed.
