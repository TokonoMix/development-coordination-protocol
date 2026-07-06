# DCP-over-CloudEvents binding (normative)

**Status:** Normative, additive within DCP v1. Shipping this binding changes no schema and no
existing rule; a bare `DcpMessage` (SPEC §4) remains the standalone form for transports that
carry raw JSON. This document defines the **first-class way to carry DCP on CloudEvents
infrastructure** (CNCF CloudEvents 1.0).

**Provenance:** shaped by an external design review and an independent multi-model
review round before publication (2026-07).

---

## 1. Model

A DCP-over-CloudEvents message is a CloudEvent whose `data` is a **complete, unchanged
`DcpMessage`**. The CloudEvents envelope does the transport-envelope job (labeling, routing,
idempotent delivery); the DCP message inside `data` carries the coordination meaning.

Nothing about the `DcpMessage` changes: the same validator that accepts a bare message accepts
the extracted `data` of a bound one. That is the additivity guarantee.

```text
CloudEvent
├── id, source, type, time, subject, dataschema, datacontenttype   ← transport/labeling layer
└── data: { DcpMessage }                                           ← coordination layer (unchanged)
```

## 2. Attribute mapping (normative)

| CE attribute | Value | Rule |
|---|---|---|
| `specversion` | `"1.0"` | MUST. |
| `id` | CE-layer delivery/idempotency id | MUST. Unique **per `source`** (CE semantics). It is **not** derived from `message_id` — see §3 dedup rule. |
| `source` | Producer-controlled URI-reference identifying the emitting context | MUST (CE requires it). Origin lives in the **carrying layer**; the bare DCP envelope deliberately has no `source` (SPEC §8 provenance discipline) and does not gain one. |
| `type` | `org.devcopro.v1.<entity_type>.<verb>` | MUST. Reverse-DNS per CE convention, derived from the **body** (`body.entity_type`, `body.verb`), never from the `message_type` convenience copy (SPEC §4.1: body wins). Example: `org.devcopro.v1.task.completed`. |
| `datacontenttype` | `application/json` | MUST. Plain JSON keeps every CE SDK interoperable; `dataschema` is the semantic pointer. (A `application/vnd.devcopro.dcp+json` registration remains a possible later refinement; it is **not** part of this binding.) |
| `dataschema` | `https://schemas.devcopro.org/v1/dcp-message.schema.json` | SHOULD. A schema URI — never the `dcp_version` literal. |
| `subject` | `body.entity_id` | MAY. Lets CE-layer consumers filter on the affected entity without parsing `data`. |
| `time` | `body.occurred_at` | MAY — **only if `occurred_at` is present**. CE `time` means "when the occurrence happened"; `issued_at` is composition time and **MUST NOT** be used as a fallback. If `occurred_at` is absent, **omit `time`**. |
| `data` | The complete `DcpMessage` | MUST. Unchanged, including `dcp_version`, `message_id`, `message_type`, `issued_at`, optional `correlation_id` / `extensions`. |

`correlation_id` is **not** promoted to a CE extension attribute: CE extension attribute names
are limited to `[a-z0-9]` (max 20 chars), which cannot express it, and it is a semantic (not
transport) link. It stays inside `data`.

## 3. Identity and dedup (normative)

CE `id` and DCP `message_id` answer different questions and **MUST NOT** be conflated:

- **CE `id`** is the delivery-layer idempotency token, unique per `source`. Consumers that
  dedup deliveries **MUST** dedup on the pair (`source`, `id`).
- **DCP `message_id`** is a producer-asserted audit/correlation label (SPEC §4). It is not
  verifiable, not delivery-scoped, and **MUST NOT** be used for transport dedup. The same
  `message_id` may legitimately arrive under different (`source`, `id`) pairs (relay, fan-out,
  re-publication); that is not a protocol violation.

## 4. Data immutability (normative)

`DcpMessage` and `Event` are `additionalProperties: false`. Broker-side interceptors that
inject fields into payloads (tracing decorators, Kafka/EventBridge mutators, schema-registry
wrappers) will make the message **invalid**.

- Intermediaries **MUST NOT** add, remove, or rewrite fields inside `data`.
- Consumers **MUST** extract `data` and validate it as a `DcpMessage` (e.g.
  `reference/validate.mjs`), treating validation failure as malformed (SPEC §4.1).
- Where a pipeline cannot guarantee payload immutability, producers **MAY** use CE
  `data_base64` with the JSON bytes of the `DcpMessage` as an escape hatch (byte-exact
  transport at the cost of CE-layer inspectability). This is an escape hatch, not the
  recommended form.

Extract-and-validate, in one line:

```js
import { buildValidator, validateMessage } from "./reference/validate.mjs";
const dcp = ce.data ?? JSON.parse(Buffer.from(ce.data_base64, "base64"));
const { valid, errors } = validateMessage(dcp, buildValidator());
```

## 5. Verb discipline in `type` (guideline)

DCP verbs are an **open** set (SPEC §7); CE `type` is commonly used as a routing key. To keep
the `org.devcopro.v1.*` type space routable:

- Producers SHOULD prefer the controlled verb vocabulary before minting new verbs.
- Custom verbs MUST already match `^[a-z][a-z_]*$` (schema rule); additionally they SHOULD
  name a *kind* of change, never an instance (`review_escalated`, not `review_escalated_to_bob`).
- CE-layer routing SHOULD match on the entity prefix (`org.devcopro.v1.task.`) when the verb
  tail is open-ended, mirroring the SPEC §7 tolerate-unknown-verbs rule at the CE layer.

## 6. Conflict rule (normative)

CE attributes label and route; they carry **no DCP authority** (the same stance as SPEC §4.1's
`message_type` rule, lifted to the CE layer). If `type` does not equal
`org.devcopro.v1.<body.entity_type>.<body.verb>` of the message in `data`, the event **MUST**
be treated as malformed. On any disagreement between CE attributes and the `DcpMessage`, the
body wins.

## 7. Security considerations

- The CE layer is where transport concerns live: authenticate/authorize **there** (broker ACLs,
  channel auth). Nothing in `data` becomes trusted because the channel is (SECURITY.md).
- CE `source` is producer-asserted unless the transport authenticates it; treat it as a label,
  not an identity, exactly like `attributed_to` (SPEC §8).
- Confidentiality: CE intermediaries can read `data`. If the coordination content is
  confidential, encrypt at the transport/broker layer or use `data_base64` +
  channel encryption; DCP itself defines no confidentiality mechanism.

## 8. Validated example

`examples/v1/bindings/cloudevents-task.completed.json` — a structured-mode CloudEvent whose
`data` is `examples/v1/task.completed.json` unchanged:

```json
{
  "specversion": "1.0",
  "id": "d7a80f4e-8f3a-4a5e-9b6e-2f1c33a90210",
  "source": "https://ci.example.com/pipelines/42",
  "type": "org.devcopro.v1.task.completed",
  "subject": "task_schema_validation",
  "time": "2026-06-29T12:29:30Z",
  "datacontenttype": "application/json",
  "dataschema": "https://schemas.devcopro.org/v1/dcp-message.schema.json",
  "data": { "…": "complete DcpMessage — see the example file" }
}
```

Proof obligations (both are CI-checkable and were run before publication):

1. `node reference/validate.mjs <(jq .data examples/v1/bindings/cloudevents-task.completed.json)` → PASS
2. CE plausibility: `specversion` = "1.0"; `id`/`source`/`type` non-empty; `type` reverse-DNS;
   `time` RFC3339; `subject` = `data.body.entity_id`; `type` tail = `data.body.entity_type` +
   "." + `data.body.verb`.

## 9. Protocol bindings

This document binds DCP to the CloudEvents **event format** (JSON). Concrete protocol bindings
(HTTP binary/structured mode, Kafka, MQTT, AMQP…) are inherited from CloudEvents itself — in
HTTP binary mode the `DcpMessage` is the HTTP body with `Content-Type: application/json` and
`ce-*` headers carrying the attributes above. DCP adds no protocol-binding rules of its own.
