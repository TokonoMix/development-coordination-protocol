# Overview

DCP (Development Coordination Protocol) is a small, machine-readable vocabulary for
saying *what changed in a project*, in a way any agent or human can produce and
consume, over any transport.

## Mental model

- A **transport** (e.g. AgentixMesh) moves bytes securely and decides identity,
  trust, and routing.
- **DCP** rides inside that transport and says, semantically, *"task `task_42`
  was completed"* or *"finding `finding_7` was raised against review `review_3`"*.

DCP is to project coordination what a media type is to HTTP: a shared structure
for the payload, independent of how it is carried.

## The shape of everything

```
DcpMessage (envelope: dcp_version, message_id, message_type, issued_at, correlation_id)
  └── body: Event (what changed)
        ├── entity_type + verb + entity_id     (which thing, what change)
        └── one or more of:
              ├── entity   (a full snapshot)
              ├── delta    (changed fields)
              └── refs     (semantic links)
```

The `entity` (when present) is one of the eight nouns: Project, Task, Dependency,
ArchitectureImpact, Decision, ReviewRequest, Finding, Milestone.

## Why "events", not records

DCP communicates **changes**, not database rows. This keeps the protocol
audit-native (every message is a recorded change), idempotent-friendly at the
semantic level, and honest about the fact that the sender is *reporting* a change,
not commanding a system to perform one.

## Where to go next

- `design-principles.md` — the rules the design follows.
- `srp-boundaries.md` — the single-responsibility line, field by field.
- `versioning.md` — how DCP stays backwards-compatible.
- `extensions.md` — how to add data without touching the core.
- `relationship-to-agentixmesh-and-tokonomix.md` — what DCP is *not* coupled to.
- `../SPEC.md` — the normative specification.
