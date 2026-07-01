# Licensing

DCP is dual-licensed so that the *implementation* and the *specification text*
each carry the license best suited to it.

| What | License | File |
|---|---|---|
| Source code, JSON schemas, reference validator, examples, conformance corpus, tests | Apache License 2.0 | `LICENSE` |
| Specification text (`SPEC.md`) and documentation (`docs/`) | CC BY 4.0 | `LICENSE-docs` |

See `NOTICE` for the summary that ships with the project.

## Why this split

- **Apache-2.0** for the machine-consumable parts gives implementers a permissive
  license with an explicit patent grant — important for a standard people build
  on commercially.
- **CC-BY-4.0** for the prose lets the specification be quoted, translated, and
  republished freely, with attribution — the right default for an open standard's
  text.

## Using DCP in your project

- You may implement DCP, ship the schemas, and build products on it under
  Apache-2.0; keep the `LICENSE`/`NOTICE` terms.
- You may quote or translate the spec under CC-BY-4.0 with attribution, e.g.:
  *"Development Coordination Protocol (DCP) specification, © 2026 The DCP authors,
  licensed under CC BY 4.0."*

## Contributions

By contributing you agree your contributions are licensed under these same terms
(Apache-2.0 for code/schemas, CC-BY-4.0 for spec/docs). A DCO sign-off
(`git commit -s`) is encouraged. See `CONTRIBUTING.md`.
