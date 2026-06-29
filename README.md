# Project Coordination Protocol (PCP)

**Project Coordination Protocol (PCP) is an open, vendor-neutral protocol initiated by the TokonoMix project** — a machine-readable semantic protocol for exchanging project-coordination information between AI agents and humans.

> **Status: Draft — v1.0.0-draft (pre-release).** This is an early, pre-release draft published for review and feedback. It is **not** a finalized standard; schemas and vocabularies may change before the v1.0.0 freeze.

It defines *only the structure of project communication* — project status, tasks, dependencies, architecture impact, decisions, review requests, findings, milestones, and the events that record their changes — as JSON Schemas.

> **PCP carries no trust. PCP describes project-state changes only.**

PCP **never** decides, executes, plans, schedules, orchestrates, routes, or authenticates. Think HTTP over TCP:

```
  ┌─────────────────────────────────────────────┐
  │  PCP            semantics / validation / corr.│  ← this project
  ├─────────────────────────────────────────────┤
  │  Transport      transport / trust / routing   │  ← e.g. AgentixMesh (separate)
  └─────────────────────────────────────────────┘
```

A PCP message travels *inside* a transport envelope but is independent of it and independently readable and validatable. Moving between transports is a **transport swap, not a rewrite**.

## What's in a message

Every PCP message is a thin envelope carrying exactly one **Event** — a recorded change to one entity:

```json
{
  "pcp_version": "1.0",
  "message_id": "msg_01HZ0TASKDONE0001",
  "message_type": "task.completed",
  "issued_at": "2026-06-29T12:30:00Z",
  "correlation_id": "msg_01HZ0TASKCREATED1",
  "body": {
    "event_id": "evt_01HZ0TASKDONE0001",
    "entity_type": "task",
    "verb": "completed",
    "entity_id": "task_schema_validation",
    "attributed_to": "agent-builder",
    "delta": { "status": { "from": "in_progress", "to": "completed" } }
  }
}
```

The envelope carries only **semantic** fields (version, ids, type, correlation). Identity, signing, routing, trust, and delivery belong to the transport layer.

## The eight entities

`Project` · `Task` · `Dependency` · `ArchitectureImpact` · `Decision` · `ReviewRequest` · `Finding` · `Milestone` — plus the `Event` wrapper that records their changes.

## Quickstart

```bash
npm install
node reference/validate.mjs examples/v1/task.completed.json   # → PASS
npm test                                                       # examples + conformance + schema-lint
```

The schemas are language-neutral **JSON Schema 2020-12**. The Node/Ajv validator under `reference/` is one reference implementation; any language can validate PCP. The `conformance/` corpus lets any implementation self-certify.

## Repository layout

| Path | What |
|---|---|
| `SPEC.md` | The normative specification. |
| `schemas/v1/` | JSON Schemas: envelope, event, eight entities, common types. |
| `examples/v1/` | Example messages, one per entity/verb. |
| `conformance/` | Language-neutral accept/reject corpus + `manifest.json`. |
| `reference/` | Ajv reference validator (tooling). |
| `docs/` | Design principles, SRP boundaries, versioning, extensions, relationships. |
| `tests/` | Schema-lint, example validation, conformance runner. |
| `SECURITY.md` | The carry-no-trust security model (read before consuming PCP). |
| `GOVERNANCE.md` · `CONTRIBUTING.md` | How the standard is governed and how to contribute. |

## Scope

PCP is intentionally scoped to **project coordination**. It may, in the future, become one protocol in a broader family of Agentix protocols — but PCP itself will remain focused on project coordination.

PCP has **no dependency** on any other system. AgentixMesh is *one possible* transport; Tokonomix components *may* produce PCP events; PCP knows about neither. See `docs/relationship-to-agentixmesh-and-tokonomix.md`.

## License

Dual-licensed: **Apache-2.0** for code, schemas, examples, conformance, and tests (`LICENSE`); **CC-BY-4.0** for the specification text and docs (`LICENSE-docs`). See `NOTICE`.
