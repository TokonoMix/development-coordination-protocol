// Structural invariants every PCP v1 schema must hold, plus a functional check
// that the strict-core extension rule is actually enforced.
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { buildValidator, validateMessage } from "../reference/validate.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = join(HERE, "..", "schemas", "v1");
const DRAFT = "https://json-schema.org/draft/2020-12/schema";
const BASE = "https://schemas.project-coordination-protocol.org/v1/";

function allSchemaFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...allSchemaFiles(full));
    else if (name.endsWith(".schema.json")) out.push(full);
  }
  return out;
}

const files = allSchemaFiles(SCHEMA_DIR);

for (const file of files) {
  const schema = JSON.parse(readFileSync(file, "utf8"));
  test(`${file.replace(SCHEMA_DIR, "schemas/v1")} declares 2020-12 and a canonical $id`, () => {
    assert.equal(schema.$schema, DRAFT, "must declare JSON Schema 2020-12");
    assert.ok(typeof schema.$id === "string" && schema.$id.startsWith(BASE), "must have a canonical $id");
  });
}

// The strict-core object schemas must close additionalProperties.
const STRICT_CORE = [
  "pcp-message", "event",
  "project", "task", "dependency", "architecture-impact",
  "decision", "review-request", "finding", "milestone",
];
for (const name of STRICT_CORE) {
  test(`${name} has additionalProperties:false (strict core)`, () => {
    const schema = JSON.parse(readFileSync(join(SCHEMA_DIR, `${name}.schema.json`), "utf8"));
    assert.equal(schema.additionalProperties, false, `${name} core must be strict`);
  });
}

// Functional: a non-namespaced extension key must be rejected.
test("extensions: a non-x- key is rejected", () => {
  const ajv = buildValidator();
  const msg = {
    pcp_version: "1.0",
    message_id: "msg_lint01",
    message_type: "task.created",
    issued_at: "2026-06-29T10:00:00Z",
    extensions: { foo: {} },
    body: {
      event_id: "evt_lint01", entity_type: "task", verb: "created", entity_id: "task_x",
      entity: { id: "task_x", project_id: "project_x", title: "T", status: "todo" },
    },
  };
  assert.equal(validateMessage(msg, ajv).valid, false, "non-x- extension key must be rejected");
});

// Guard against silently-dropped/misspelled constraint keywords: every schema
// must compile under Ajv strict mode (which rejects unknown keywords, so a typo
// like "maxLenght" fails loudly instead of being ignored). The two stylistic
// allowances below are intentional, valid JSON Schema idioms used by the design:
//   - allowUnionTypes: delta leaf values are scalar-or-null (a union type)
//   - strictRequired:false: the Event "at least one of entity/delta/refs" anyOf
//     references properties declared in the sibling `properties` block
test("every schema strict-compiles (no unknown/typo constraint keywords)", () => {
  const ajv = new Ajv2020({ strict: true, allowUnionTypes: true, strictRequired: false, allErrors: true });
  addFormats(ajv);
  for (const file of files) ajv.addSchema(JSON.parse(readFileSync(file, "utf8")));
  for (const file of files) {
    const id = JSON.parse(readFileSync(file, "utf8")).$id;
    assert.doesNotThrow(() => ajv.getSchema(id), `strict compile failed for ${file}`);
  }
});

// Functional: a forbidden rel must be rejected (SRP guard).
test("refs: a routing/permission rel is rejected", () => {
  const ajv = buildValidator();
  const msg = {
    pcp_version: "1.0",
    message_id: "msg_lint02",
    message_type: "task.updated",
    issued_at: "2026-06-29T10:00:00Z",
    body: {
      event_id: "evt_lint02", entity_type: "task", verb: "updated", entity_id: "task_x",
      refs: [{ rel: "approved_by", ref: "user_x" }],
    },
  };
  assert.equal(validateMessage(msg, ajv).valid, false, "forbidden rel must be rejected");
});
