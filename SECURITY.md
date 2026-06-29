# Security Model & Considerations

PCP is a **carry-no-trust** protocol. This document is normative for implementers
and **MUST** be read before consuming PCP. The key words MUST/SHOULD/MAY follow
RFC 2119.

## 1. Foundational statement

**PCP carries no trust. Every PCP field is untrusted data.** The transport layer
(for example AgentixMesh) is the sole authority for identity, authentication,
authorization, and message integrity. PCP provides **no** mechanism to verify
who produced a message or whether its content is truthful. A PCP message is data
to be validated and then treated as a *claim*, never as an authenticated fact.

## 2. Untrusted fields (do not authorize on these)

The following are **self-asserted** and **MUST NOT** be used for authorization,
access control, audit attribution, or identity decisions without independent,
transport-layer binding:

`attributed_to`, `responsible_party`, `requested_reviewers`, `correlation_id`,
`message_id`, `entity_id`, `project_id`, `delta`, `refs[].ref`, and all
`extensions` values.

In particular, `attributed_to` / `responsible_party` / `requested_reviewers` are
descriptive labels — **never** authenticated principals, permission grants, or
work assignments. Mapping a label to a real principal is the transport's job.

## 3. Replay and forgery

PCP provides **no** replay protection and **no** message authentication.

- `message_id` uniqueness is **producer-asserted** and **cannot** be verified by
  a PCP consumer. Systems requiring deduplication **MUST** use transport-layer
  message identity, not `message_id`.
- `correlation_id` carries no guarantee that the referenced message exists, was
  authentic, or came from the same source. Consumers **MUST NOT** suppress,
  apply, or authorize on `correlation_id` alone.
- Non-repudiation, if required, **MUST** come from transport-layer signing.

## 4. Injection — treat free strings as untrusted input

Free-string fields (`delta` values, `description`, `summary`, `path`, `category`,
`attributed_to`, `refs[].ref`, extension values, etc.) **MUST** be treated as
untrusted user input by every consumer: sanitize before rendering in a UI,
parameterize before database insertion, and validate before using as a key in
any routing/lookup. The schemas impose length and character bounds as a baseline;
they are not a substitute for consumer-side sanitization.

## 5. `Finding.location.path`

`path` is a **descriptive locator only**. It **MUST NOT** be passed to filesystem
APIs, shell commands, or URL constructors without independent sanitization, and
provides no guarantee of referring to an actual file. Treat it as a hostile
string (path traversal, injection, control characters).

## 6. `refs[].ref` — no auto-dereference (SSRF)

`ref` is an opaque descriptive pointer. Consumers **MUST NOT** automatically
resolve it as a network address or URL. Auto-dereferencing untrusted refs invites
SSRF, credential leakage via redirects, and DNS rebinding.

## 7. Extensions trust boundary

Extension namespaces carry **no** authority within PCP. Reserved-looking prefixes
(`x-auth-*`, `x-signed-*`, `x-permission-*`, `x-agentixmesh-*`, and similar)
**MUST NOT** be interpreted as authenticated transport claims. Producers **MUST
NOT** smuggle transport/trust/identity/routing data through `extensions`; the
schema bounds extension keys (`^x-<vendor>$`) and value size, but cannot judge
intent.

## 8. Clock skew

`issued_at` and `occurred_at` are self-reported and may be arbitrarily skewed.
Consumers with freshness requirements **MUST** enforce time windows using
transport-layer delivery timestamps, not PCP fields. PCP defines no required
freshness window.

## 9. Denial of service

The schemas define maximum field lengths, array sizes, and object property counts
as a baseline. Consumers **MUST** additionally enforce a total message-size limit
at the transport boundary; PCP schema bounds are not a substitute for an ingestion
size cap. `delta` leaf values are restricted to scalars/null to prevent
nested-object parsing amplification.

## 10. Reporting a vulnerability

This repository is a protocol specification, not a running service; it lists no
live endpoints. To report a security issue in the specification or the reference
tooling, email **security@project-coordination-protocol.org** with a description
and, if possible, a minimal reproducing message. Please use coordinated
disclosure and allow reasonable time for a fix before public disclosure.
