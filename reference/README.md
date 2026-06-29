# PCP Reference Validator

A small Node + Ajv (JSON Schema 2020-12) reference implementation. **Tooling
only** — the PCP schemas are language-neutral; this validator is a convenience,
not a runtime dependency of PCP, and not the definition of conformance (that is
`../conformance/`).

## Install

```bash
npm install        # from the repository root
```

## CLI

```bash
# Validate one or more files as full PcpMessages (schema + message_type rule):
node reference/validate.mjs examples/v1/task.completed.json

# Validate a bare entity snapshot against a specific schema:
node reference/validate.mjs --schema task path/to/task.json
```

Exit code `0` if all inputs are valid, `1` if any fail, `2` on usage error.

## API

```js
import {
  buildValidator,       // → an Ajv instance with all v1 schemas registered by $id
  validateMessage,      // (message, ajv?) → { valid, errors }  (schema + cross-field rule)
  validateAgainst,      // (nameOrId, value, ajv?) → { valid, errors }
  checkMessageTypeConsistency, // (message) → errors[]  (message_type === entity_type.verb)
} from "./reference/validate.mjs";
```

## The one rule JSON Schema can't express

`message_type` must equal `<body.entity_type>.<body.verb>`. Pure JSON Schema
cannot check that cross-field equality, so `validateMessage` enforces it in code.
Any conformant implementation in any language must apply the same check (see
`../SPEC.md` §4.1 and §11).
