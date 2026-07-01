# Relationship to AgentixMesh, Tokonomix, and others

DCP is an independent open standard. It has **no dependency** on any other system.
This document clarifies how DCP relates to systems it is sometimes mentioned
alongside — and, importantly, how it does *not*.

## The layering, restated

- **AgentixMesh** (or any transport) is a **transport layer**: secure transport,
  identity, permissions, trust, discovery, routing, wake-up, messaging.
- **DCP** is the **semantic layer**: the structure of project-coordination
  messages.

AgentixMesh may *carry* DCP messages. DCP does not know or require AgentixMesh; it
can ride any transport, or none (a file, a queue, a database row). AgentixMesh
will be *an implementation that uses* DCP, not the other way around.

## Direction of dependency

```
  Tokonomix components ──produce──▶  DCP messages  ◀──carry──  AgentixMesh (transport)
                                         │
                                         ▼
                                independently valid,
                                no dependency on either
```

- A review **council** may *produce* DCP Findings and ReviewRequests.
- A status/automation component may *produce* DCP status Events.
- A transport may *carry* DCP messages.

In every case the arrow points **toward** DCP as data. DCP knows about none of
these components and depends on none of them. Removing Tokonomix or AgentixMesh
entirely leaves DCP fully usable.

## What this means in practice

- You can adopt DCP without adopting AgentixMesh or Tokonomix.
- A DCP message produced by one ecosystem is consumable by any other, because the
  meaning lives in the (vendor-neutral) DCP structure, not in a vendor's runtime.
- The internal development location of this repository
  (`iipnprojects/development-coordination-protocol/`) is just where the work happens;
  it is not a submodule relationship and implies no coupling.

## Scope, going forward

DCP is intentionally scoped to **project coordination**. It may, in the future,
become one protocol in a broader family of Agentix protocols — but DCP itself
will remain focused on project coordination, and will keep its single
responsibility regardless of what is built around it.
