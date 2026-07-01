# Development Coordination Protocol (DCP) — Specification

- **Version:** 1.0 (draft)
- **Status:** Draft
- **License of this document:** CC-BY-4.0 (see `LICENSE-docs`)

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in RFC 2119 and RFC 8174 when, and only when, they appear in all capitals.

---

## 1. Introduction

The Development Coordination Protocol (DCP) is an open, vendor-neutral, machine-readable **semantic** protocol for exchanging *project-coordination information* between AI agents and humans.

DCP defines **only the structure of project communication**. By analogy with HTTP over TCP:

- a **transport layer** (for example AgentixMesh) is responsible for secure transport, identity, permissions, trust, discovery, routing, wake-up, and messaging;
- **DCP** is the **semantic layer**: project status, tasks, dependencies, architecture impact, decisions, review requests, findings, milestones, and the events that record their changes.

### 1.1 Prime directive

> **DCP carries no trust. DCP describes project-state changes only.**

A DCP message is **untrusted data** carried by a transport. DCP itself never authenticates, authorizes, routes, plans, schedules, orchestrates, or executes anything.

### 1.2 Non-goals (out of scope, normative)

DCP **MUST NOT** define or imply any of: transport, signing, identity authority, permissions, routing, delivery guarantees, retry/acknowledgement semantics, a planner, a scheduler, a workflow engine (i.e. enforced or "allowed" state transitions), an approval engine, an orchestration engine, an execution engine, product integrations (e.g. GitHub, Jira), or a user interface. These belong to other layers and implementations.

### 1.3 Design rules

All DCP communication is: machine-readable; language-independent; transport-independent; extensible; backwards-compatible within a major version; and validatable with JSON Schema.

---

## 2. Layering invariant

> **Transport-layer envelope = transport / trust / routing. DCP envelope = semantics / validation / correlation.**

A DCP message travels *inside* a transport envelope but is independent of it and is independently readable and validatable. Moving a DCP message between transports is a **transport swap, not a rewrite**: the DCP message body is never rewritten at a boundary.

Overlap in identifier or correlation fields between the two layers is permitted **only because the purpose differs**: the transport uses its identifiers for delivery and mesh context; DCP uses its identifiers for project meaning and audit. A consumer **MUST NOT** treat a DCP field as a transport guarantee.

---

## 3. Identifiers

A DCP identifier is an opaque string matching `^[a-z]+_[A-Za-z0-9._-]+$`, at most 128 characters.

- The prefix (e.g. `task_`) denotes a **category / readability** only. It is **NOT** an authority, namespace ownership, or routing token.
- Consumers **MUST NOT** derive any meaning from an identifier beyond its prefix category, and **MUST** treat the identifier as an atomic string.
- Identifiers are **producer-asserted**. DCP provides **no** referential-integrity guarantee and does **not** guarantee identifiers are globally unique across independent producers. Scoping (e.g. to a tenant or project namespace) is the consumer's responsibility, using transport context — never DCP fields alone.

Conventional prefixes: `project_`, `task_`, `dep_`, `arch_`, `decision_`, `review_`, `finding_`, `milestone_`, `evt_` (events), `msg_` (messages).

---

## 4. The `DcpMessage` envelope

A `DcpMessage` is a JSON object carrying exactly one `Event`. Schema: `schemas/v1/dcp-message.schema.json`. The envelope core is strict (`additionalProperties: false`); growth happens only via `extensions` (§9).

| Field | Req | Type | Meaning |
|---|---|---|---|
| `dcp_version` | MUST | string `^1\.[0-9]{1,4}$` | Protocol version `major.minor`. Consumers **MUST** parse it as two integers, never as a float. |
| `message_id` | MUST | string `^msg_…` (≤128) | Stable identity for **audit/correlation only**. Uniqueness is producer-asserted and is **NOT** DCP-verifiable. **NOT** a transport/delivery/idempotency identifier. |
| `message_type` | MUST | string `<entity>.<verb>` (≤64) | A **denormalized convenience copy** of `<body.entity_type>.<body.verb>` for human/operator readability. |
| `issued_at` | MUST | UTC timestamp | When this message was **composed** (not delivered). |
| `correlation_id` | MAY | string `^msg_…` (≤128) | A **semantic** link to a prior `message_id`. |
| `body` | MUST | `Event` | Exactly one `Event` (§5). |
| `extensions` | MAY | object | Namespaced extensions (§9). |

### 4.1 `message_type` is not authority (normative)

The normative source of a message's type is **always** the body: `<body.entity_type>.<body.verb>`. `message_type` is a convenience copy.

- A validator **MUST** check that `message_type` equals `<body.entity_type>.<body.verb>`. On conflict, the **body wins** and the message **MUST** be treated as malformed.
- A transport layer **MUST NOT** route, authorize, or trust on `message_type`. *"`message_type` is human/operator convenience, not protocol authority."*

### 4.2 Timestamps

All DCP timestamps are ISO-8601 in UTC with a trailing `Z` (e.g. `2026-06-29T10:00:00Z`). They are **self-reported**. DCP defines no freshness guarantee; consumers with freshness requirements **MUST** enforce time windows using transport-layer delivery timestamps, not DCP fields.

---

## 5. The `Event`

DCP communicates project **changes**, not raw records. Every `DcpMessage.body` is exactly one `Event` describing a change to one entity. Schema: `schemas/v1/event.schema.json`. `additionalProperties: false`.

| Field | Req | Meaning |
|---|---|---|
| `event_id` | MUST | Unique event identifier (`evt_…`). |
| `entity_type` | MUST | One of the eight nouns (§6). Closed set in v1. |
| `verb` | MUST | Lifecycle verb (§7). An **assertion of recorded change**, not a transition authorization. |
| `entity_id` | MUST | Identifier of the affected entity (see §3 — no referential-integrity guarantee). |
| `project_id` | MAY | Untrusted scope hint. |
| `occurred_at` | MAY | When the change actually happened (vs `issued_at` = when the message was composed). |
| `attributed_to` | MAY | Free-form opaque provenance label (§8). |
| `entity` | MAY | A full snapshot of the affected entity (validated against the `entity_type`'s schema). |
| `delta` | MAY | A change set (§5.2). |
| `refs` | MAY | Semantic links (§5.3). |
| `extensions` | MAY | Namespaced extensions (§9). |

### 5.1 Payload constraint (normative)

An `Event` **MUST** contain at least one of `entity`, `delta`, or `refs`. A no-payload event is invalid. A full entity is conventionally shared via a `snapshot` verb (e.g. `task.snapshot`).

### 5.2 `delta`

`delta` is a map from a field name to `{ from?, to }`. `to` is **REQUIRED**; `from` is **OPTIONAL** (the prior value is not always known). Leaf values **MUST** be scalar or null; changes to array- or object-valued fields are communicated via a `snapshot` instead. A `delta` is a **claim about change, not a transaction log**: DCP guarantees no ordering or causality between deltas. `delta` has at most 64 entries.

### 5.3 `refs` and the `rel` vocabulary

`refs` is an array of `{ rel, ref }`. `rel` is drawn from a **CLOSED** semantic project-relation vocabulary; `ref` is an opaque pointer (≤512 chars).

Closed `rel` vocabulary (v1): `relates_to`, `part_of`, `references`, `caused_by`, `derived_from`, `supersedes`, `concerns`, `blocks`.

Routing/permission relations (e.g. `routes_to`, `approved_by`, `delivered_via`, `assigned_to`) are **intentionally excluded and MUST NOT appear**. A consumer **MUST NOT** automatically resolve a `ref` as a network address (see SECURITY.md — SSRF).

---

## 6. Entities

The eight canonical nouns. All entity objects: identifiers per §3; `additionalProperties: false`; an optional namespaced `extensions`. **Status enumerations are a vocabulary of states, NOT a state machine — DCP enforces no transitions.** Field-length bounds are normative baselines (see schemas).

| Entity | Schema | Required core | Notable optional |
|---|---|---|---|
| **Project** | `project.schema.json` | `id`, `name`, `status` | `description` |
| **Task** | `task.schema.json` | `id`, `project_id`, `title`, `status` | `description`, `priority`, `milestone_id`, `responsible_party` |
| **Dependency** | `dependency.schema.json` | `id`, `from_id`, `to_id`, `dependency_type` | `description` |
| **ArchitectureImpact** | `architecture-impact.schema.json` | `id`, `subject_ref`, `impact_level`, `description` | `affected_areas`, `migration_notes` |
| **Decision** | `decision.schema.json` | `id`, `title`, `decision`, `status` | `context`, `alternatives`, `consequences`, `supersedes`, `refs` |
| **ReviewRequest** | `review-request.schema.json` | `id`, `subject_ref`, `status` | `review_type`, `requested_reviewers`, `summary`, `finding_ids` |
| **Finding** | `finding.schema.json` | `id`, `subject_ref`, `severity`, `title`, `status` | `category`, `description`, `location` |
| **Milestone** | `milestone.schema.json` | `id`, `project_id`, `name`, `status` | `description`, `target_date`, `criteria` |

Notes (normative):

- **Dependency** is the **only** representation of inter-entity dependencies; tasks do not carry inline dependency lists. A Dependency *describes* a stated relationship; DCP performs, enforces, orders, or schedules nothing on the basis of it.
- **ReviewRequest** records that a review was requested and its outcome. A status of `approved` is a *record that an approval occurred*, **not** an authorization to proceed; DCP gates nothing.
- **Decision** records a decision that was made; a status of `accepted` is a record, not an authorization token.
- **Milestone.target_date** is descriptive intent only. DCP derives no deadline state and performs no scheduling; `missed` is a reported observation, not a DCP-computed verdict.
- **Finding.location.path** is a descriptive locator only and **MUST NOT** be passed to filesystem, shell, or URL APIs without independent sanitization.

---

## 7. `message_type` and the verb vocabulary

`message_type = "<entity_type>.<verb>"`.

`verb` is an **open** string (`^[a-z][a-z_]*$`, ≤64) with a controlled vocabulary. Consumers **MUST** tolerate unknown verbs (forward-compatibility) and pass them through.

Controlled vocabulary (v1):

- Universal: `created`, `updated`, `status_changed`, `snapshot`, `deleted`.
- Task: `completed`, `blocked`, `unblocked`, `assigned`.
- Finding: `raised`, `resolved`, `acknowledged`.
- Decision: `recorded`, `accepted`, `rejected`, `superseded`.
- ReviewRequest: `requested`, `approved`, `changes_requested`, `rejected`.
- Milestone: `reached`, `missed`.
- ArchitectureImpact: `assessed`.
- Dependency: `created`, `removed`.

A verb communicates that a change was recorded; it **MUST NOT** be interpreted as authorization for a transition.

---

## 8. Provenance, ownership, and review labels (normative)

The fields `attributed_to` (Event), `responsible_party` (Task), and `requested_reviewers` (ReviewRequest) are **descriptive, untrusted project metadata**.

They convey **no** identity, authority, planning, routing, obligation, or authorization. They are free-form opaque labels and **MUST NOT** be treated as authenticated principals, permission grants, or work assignments. They **MUST NOT** carry a `scheme:value` identity structure. Mapping such a label to a real principal is a transport-layer responsibility and **MUST NOT** be done by consuming DCP alone.

---

## 9. Extensions

The DCP core never grows new top-level fields. All growth happens through an optional `extensions` object, present on the envelope, the `Event`, and every entity.

- Every extension key **MUST** match `^x-<vendor>$` (lowercase). Example: `x-tokonomix`, `x-github`.
- Extensions are **ALWAYS** optional. There is no "must-understand" flag; a conformant consumer **MUST** be able to ignore any unknown extension.
- Producers **MUST NOT** smuggle transport, trust, identity, or routing data through extensions. Reserved-looking prefixes (`x-auth-*`, `x-signed-*`, `x-permission-*`, `x-agentixmesh-*`) carry **NO** authority and **MUST NOT** be read as authenticated transport claims.
- Each extension value is an object with at most 20 properties; the `extensions` wrapper is `additionalProperties: false` over the `x-` pattern.

---

## 10. Versioning and backwards compatibility

DCP uses Semantic Versioning at the protocol level. `dcp_version` appears in the envelope. Schemas are namespaced by **major** version in their `$id` (`…/v1/…`).

- Within a major version, only **additive, optional** changes are permitted; an older validator continues to accept newer-but-compatible messages.
- Growable classification fields (`status`, `verb`, `priority`, `severity`, `impact_level`, `dependency_type`, `review_type`) are **open tokens with a controlled vocabulary**, not closed enums, so a new value is not a breaking change. Consumers **MUST** tolerate-and-pass unknown verbs **and** unknown enumerated values.
- `entity_type` and the `rel` vocabulary are **closed** (structural / single-responsibility guards); changing them is a major-version concern.
- Breaking changes go to the next major version (`v2`), published under a new namespace; `v1` remains valid and supported.

### 10.1 Schema `$id` host

The `$id` host `https://schemas.devcopro.org/v1/…` is the **canonical, permanent** namespace for v1 schemas. The `devcopro.org` domain is owned by the project, and the v1 schema files are served at these URLs (`application/schema+json`). These identifiers are **stable and will not be rebased within the v1 major version**; a future major version (`v2`) would use its own `…/v2/…` namespace. Because every `$ref` is absolute against this host, keeping it resolvable is part of the protocol's operational contract; consumers **SHOULD** nonetheless prefer bundled/cached schemas over live fetches.

---

## 11. Conformance

An implementation is **conformant** if, validating a value as a `DcpMessage`, it:

1. validates the value against `schemas/v1/dcp-message.schema.json` (JSON Schema 2020-12); and
2. enforces the §4.1 cross-field rule (`message_type` equals `<entity_type>.<verb>`); and
3. accepts every `accept` case and rejects every `reject` case in `conformance/manifest.json`.

The `conformance/` corpus is language-neutral: any implementation, in any language, can run it to self-certify. The Node/Ajv validator in `reference/` is one reference implementation, not the definition of conformance.

---

## 12. Security considerations

DCP carries no trust; every field is untrusted data. See `SECURITY.md` for the full, normative treatment (untrusted fields, replay/forgery, injection, SSRF, clock skew, denial-of-service bounds). Implementers **MUST** read it before consuming DCP.

---

## 13. Relationship to other systems

DCP has **no dependency** on any other system. AgentixMesh is *one possible* transport that may carry DCP messages. Tokonomix components (e.g. a review council, a status emitter) may *produce* DCP findings/reviews/events, but DCP neither knows nor depends on them. See `docs/relationship-to-agentixmesh-and-tokonomix.md`.
