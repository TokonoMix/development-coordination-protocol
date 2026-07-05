# DCP as an A2A extension (normative)

**Status:** Normative, additive within DCP v1. Defines how a DCP coordination event travels
between agents speaking the **A2A protocol** (Agent2Agent, Linux Foundation), so DCP lives
inside the incumbent agent↔agent ecosystem rather than beside it.

**Extension URI (identity of this extension):** `https://devcopro.org/a2a/dcp/v1`
Per A2A best practice the extension specification is hosted at that URI. A2A's governance
allows any party to define and publish a *community extension* under its own URI — no
Linux Foundation approval is required or claimed; this is not an "official" A2A extension.

**Target A2A version:** v1.0 (ProtoJSON shapes). The legacy v0.3 JSON-RPC shape is noted in §5.

---

## 1. Model

A DCP event rides in an A2A `Message` as a **data part** whose `data` is a complete,
unchanged `DcpMessage`. The A2A layer authenticates, routes, and correlates
(tasks/contexts); DCP supplies the coordination meaning. No DCP schema or rule changes.

## 2. Declaring the extension (AgentCard)

An agent that emits or understands DCP declares the extension in its AgentCard capabilities:

```json
{
  "capabilities": {
    "extensions": [
      {
        "uri": "https://devcopro.org/a2a/dcp/v1",
        "description": "Emits and consumes DCP v1 coordination events (Development Coordination Protocol).",
        "required": false
      }
    ]
  }
}
```

`required` SHOULD be `false`: DCP is descriptive coordination data; a counterpart that
ignores it loses nothing but the coordination signal (mirrors SPEC §9: extensions are always
ignorable).

## 3. Carrying an event (Message)

Rules:

- The `DcpMessage` goes in a part's `data` member, **unchanged** (same additivity guarantee
  as the CloudEvents binding: the extracted `data` validates against
  `schemas/v1/dcp-message.schema.json` as-is).
- The part's `mediaType` MUST be `application/json`.
- The Message `extensions` array MUST include `https://devcopro.org/a2a/dcp/v1` so receivers
  can recognize the part without probing its shape.
- One part carries exactly one `DcpMessage`; multiple events are multiple parts.
- A2A `taskId`/`contextId` do A2A's correlation job; DCP `correlation_id` stays a semantic
  link between DCP messages. They MUST NOT be conflated.

Example (`examples/v1/bindings/a2a-task.completed.json`, validated — see §6):

```json
{
  "messageId": "a2a-8c2f6e1d-5b0a-4f3e-9d47-1c2b3a4d5e6f",
  "role": "ROLE_AGENT",
  "extensions": ["https://devcopro.org/a2a/dcp/v1"],
  "parts": [
    {
      "data": { "…": "complete DcpMessage — see the example file" },
      "mediaType": "application/json"
    }
  ]
}
```

## 4. Trust boundary (normative)

A2A authenticates the **peer**, not the **claims**. A DCP event received over authenticated
A2A is still untrusted data in every field (SECURITY.md): `attributed_to` is a label, a
`review_request.approved` is a record and not an authorization, and a consumer MUST validate
the extracted `DcpMessage` before use and treat validation failure as malformed. The A2A
layer's identity of the sending agent MAY be recorded by the consumer alongside the event,
but MUST NOT be written into the DCP fields (provenance discipline, SPEC §8).

## 5. Legacy A2A v0.3 shape

Pre-1.0 A2A (JSON-RPC style) used a `kind` discriminator on parts. The same binding applies
with the part written as:

```json
{ "kind": "data", "data": { "…": "DcpMessage" } }
```

New integrations SHOULD target the v1.0 shape (§3).

## 6. Proof obligations

Checked before publication (CI-runnable):

1. `parts[0].data` of `examples/v1/bindings/a2a-task.completed.json` validates as a
   `DcpMessage` via `reference/validate.mjs` → PASS.
2. Shape plausibility: `messageId` non-empty; `role` a valid enum value; `extensions`
   contains the extension URI; every DCP part has `mediaType: application/json`.
