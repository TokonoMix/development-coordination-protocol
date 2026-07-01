# Extensions

The DCP core never grows new top-level fields. When you need to attach
vendor-specific or experimental data, use the `extensions` object.

## Where extensions are allowed

On the envelope (`DcpMessage`), on the `Event`, and on every entity. Each is an
optional object.

## Rules

- Every key MUST match `^x-<vendor>$` (lowercase), e.g. `x-tokonomix`, `x-github`.
- Each extension value is an object (at most 20 properties). The `extensions`
  wrapper allows only `x-` keys (`additionalProperties: false` over the pattern).
- Extensions are **always optional** and **always ignorable**. There is no
  "must-understand" flag — a producer cannot emit a message a conformant consumer
  is forced to reject. A consumer that does not recognise an extension ignores it.
- Do **not** smuggle transport/trust/identity/routing data through extensions.
  Reserved-looking prefixes (`x-auth-*`, `x-signed-*`, `x-permission-*`,
  `x-agentixmesh-*`) carry **no** authority and must not be read as authenticated
  claims (see SECURITY.md).

## Example

```json
{
  "dcp_version": "1.0",
  "message_id": "msg_abc",
  "message_type": "project.snapshot",
  "issued_at": "2026-06-29T10:00:00Z",
  "extensions": { "x-tokonomix": { "council_run_id": "run_123" } },
  "body": {
    "event_id": "evt_abc",
    "entity_type": "project",
    "verb": "snapshot",
    "entity_id": "project_x",
    "entity": {
      "id": "project_x",
      "name": "Example",
      "status": "active",
      "extensions": { "x-github": { "repo": "org/example" } }
    }
  }
}
```

## When an extension should become core

If many independent vendors converge on the same extension and it is genuinely
descriptive project-coordination metadata, propose promoting it to an optional
core field via the process in `../GOVERNANCE.md`. Promotion is additive (a minor
version); the extension form keeps working.
