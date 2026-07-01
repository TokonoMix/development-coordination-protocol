# DCP Conformance Corpus

A language-neutral set of fixtures that lets **any** implementation, in any
language, self-certify against DCP v1. This corpus — not the Node validator — is
the practical definition of conformance.

## Structure

- `valid/` — messages that a conformant validator MUST **accept**.
- `invalid/` — messages that a conformant validator MUST **reject**.
- `manifest.json` — the index: each case lists its `file`, the `schema` to
  validate against (`dcp-message`), the expected outcome (`accept` / `reject`),
  and a human-readable `note` explaining what it tests.

## How to run it

For each case in `manifest.json`:

1. Validate `file` against `schemas/v1/<schema>.schema.json` (JSON Schema
   2020-12).
2. Additionally enforce the normative cross-field rule: `message_type` equals
   `<body.entity_type>.<body.verb>`.
3. Compare the result to `expect`. A conformant implementation accepts every
   `accept` case and rejects every `reject` case.

The bundled runner does exactly this:

```bash
npm test            # includes tests/conformance-runner.test.mjs
```

## What the corpus covers

- **Accept**, including forward-compatibility: unknown verbs and unknown status
  values must be tolerated; namespaced extensions are allowed; an Event may carry
  only `refs` or only `delta`.
- **Reject**, including the single-responsibility guards: a forbidden `rel`
  (e.g. `approved_by`), a `message_type` that disagrees with the body, an Event
  with no payload, non-namespaced extensions, non-UTC timestamps, unknown
  `entity_type`, bad identifiers, and nested-object `delta` leaves.

## Adding cases

Any schema or vocabulary change MUST add both an `accept` and a `reject` fixture
here and register them in `manifest.json` (see `../CONTRIBUTING.md`).
