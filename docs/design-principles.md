# Design Principles

1. **Single responsibility.** DCP defines only the structure of project
   communication. It never does transport, trust, identity, routing, permissions,
   planning, scheduling, workflow enforcement, orchestration, or execution.
   *"DCP carries no trust. DCP describes project-state changes only."*

2. **Report, don't act.** Every field passes the discriminator test: does DCP
   define behaviour that *acts on* the field (computing, ordering, gating,
   routing), or does the field only *describe / report*? DCP only reports.
   `dependency_type: blocks` states a relationship; it does not order execution.
   `milestone.target_date` is intent; DCP derives no deadline. `status` values are
   a vocabulary; DCP enforces no transitions.

3. **Transport-neutral and independently validatable.** A DCP message is
   meaningful and checkable on its own, regardless of how it is carried. Moving
   between transports is a swap, not a rewrite.

4. **Language-neutral.** The protocol is JSON Schema 2020-12. Any language can
   produce, consume, and validate it. The Node validator is a convenience, not the
   definition.

5. **Strict core, namespaced growth.** The core is closed (`additionalProperties:
   false`). All extension happens through namespaced `extensions`, which are always
   optional and always ignorable.

6. **Backwards compatible by construction.** Within a major version, changes are
   additive and optional. Growable classifications are open tokens (so a new value
   never breaks an old validator); only structural sets (`entity_type`, `rel`) are
   closed.

7. **Untrusted by default.** Consumers treat every field as a claim, not a fact.
   Trust is the transport's job. The design avoids field names and structures that
   invite a false authenticated reading (hence `attributed_to`, not `actor`, and
   no `scheme:value` identity structure).

8. **Minimal (YAGNI).** Eight nouns, one event wrapper, a thin envelope. No field
   exists unless it is justifiable as descriptive project-coordination metadata.
