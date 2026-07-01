# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the protocol
follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- **Renamed** from "Project Coordination Protocol (PCP)" to **Development Coordination
  Protocol (DCP)** while still in draft, before the v1.0.0 freeze. This renames the
  wire-level identifiers (`DcpMessage`, `dcp_version`), the schema `$id` namespace
  (now `https://schemas.devcopro.org/v1/…`), and the repository. The protocol was briefly
  published under the PCP name on 2026-06-29; the old GitHub URL redirects.

## [1.0.0-draft] — 2026-06-29

Initial draft of the Development Coordination Protocol.

### Added

- Normative specification (`SPEC.md`).
- `DcpMessage` envelope and `Event` change-wrapper schemas.
- Eight entity schemas: Project, Task, Dependency, ArchitectureImpact, Decision,
  ReviewRequest, Finding, Milestone.
- Common schemas: identifier, UTC timestamp, reference, extensions.
- Controlled vocabularies for verbs and a closed `rel` vocabulary.
- Namespaced `extensions` model (strict core, optional growth).
- One example per entity/verb under `examples/v1/`.
- Language-neutral conformance corpus (`conformance/`) with accept/reject cases
  and `manifest.json`.
- Ajv 2020 reference validator (`reference/validate.mjs`).
- Tests: example validation, schema-lint invariants, conformance runner.
- Governance, contributing, security model, code of conduct, dual-license
  (Apache-2.0 for code/schemas, CC-BY-4.0 for spec/docs).

### Notes

- The schema `$id` host `schemas.devcopro.org` is a
  placeholder pending the v1.0 freeze; it implies no domain ownership.
