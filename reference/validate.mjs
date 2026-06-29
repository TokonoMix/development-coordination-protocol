// PCP reference validator (Apache-2.0).
//
// Tooling only — the PCP schemas are language-neutral JSON Schema 2020-12; this
// Node/Ajv validator is a convenience reference implementation, not a runtime
// dependency of PCP. It (1) validates a value against any PCP v1 schema by name
// or $id, (2) validates a full PcpMessage, and (3) enforces the one normative
// cross-field rule JSON Schema cannot express: message_type === "<entity_type>.<verb>".

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const HERE = dirname(fileURLToPath(import.meta.url));
const SCHEMA_DIR = join(HERE, "..", "schemas", "v1");
const BASE = "https://schemas.project-coordination-protocol.org/v1/";
export const MESSAGE_SCHEMA_ID = BASE + "pcp-message.schema.json";

function collectSchemaFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...collectSchemaFiles(full));
    else if (name.endsWith(".schema.json")) out.push(full);
  }
  return out;
}

/** Build an Ajv instance with every PCP v1 schema registered by its $id. */
export function buildValidator() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  for (const file of collectSchemaFiles(SCHEMA_DIR)) {
    ajv.addSchema(JSON.parse(readFileSync(file, "utf8")));
  }
  return ajv;
}

/** Resolve a schema name ("task") or full $id to its canonical $id. */
export function resolveSchemaId(nameOrId) {
  if (nameOrId.startsWith("http")) return nameOrId;
  const base = nameOrId.replace(/\.schema\.json$/, "").replace(/_/g, "-");
  return `${BASE}${base}.schema.json`;
}

/** Validate a value against a named/$id'd PCP schema. */
export function validateAgainst(nameOrId, value, ajv = buildValidator()) {
  const id = resolveSchemaId(nameOrId);
  const validate = ajv.getSchema(id);
  if (!validate) throw new Error(`Unknown PCP schema: ${nameOrId} (${id})`);
  const valid = validate(value);
  return { valid, errors: valid ? [] : (validate.errors || []) };
}

/** The normative cross-field rule: message_type must equal "<entity_type>.<verb>". */
export function checkMessageTypeConsistency(message) {
  const errors = [];
  if (message && typeof message === "object" && message.body && typeof message.body === "object") {
    const expected = `${message.body.entity_type}.${message.body.verb}`;
    if (message.message_type !== expected) {
      errors.push({
        instancePath: "/message_type",
        keyword: "pcp:messageTypeConsistency",
        message: `message_type "${message.message_type}" must equal "<entity_type>.<verb>" = "${expected}"`,
      });
    }
  }
  return errors;
}

/** Validate a full PcpMessage: schema + the cross-field consistency rule. */
export function validateMessage(message, ajv = buildValidator()) {
  const schemaResult = validateAgainst(MESSAGE_SCHEMA_ID, message, ajv);
  const crossErrors = checkMessageTypeConsistency(message);
  return {
    valid: schemaResult.valid && crossErrors.length === 0,
    errors: [...schemaResult.errors, ...crossErrors],
  };
}

// CLI: node reference/validate.mjs <file.json> [...more]
//      node reference/validate.mjs --schema task <file.json>
function main(argv) {
  const args = [...argv];
  let schemaName = null;
  if (args[0] === "--schema") {
    args.shift();
    schemaName = args.shift();
  }
  if (args.length === 0) {
    console.error("usage: validate.mjs [--schema <name>] <file.json> [...]");
    process.exit(2);
  }
  const ajv = buildValidator();
  let failures = 0;
  for (const file of args) {
    let value;
    try {
      value = JSON.parse(readFileSync(file, "utf8"));
    } catch (e) {
      console.error(`FAIL ${file} — not valid JSON: ${e.message}`);
      failures++;
      continue;
    }
    const result = schemaName
      ? validateAgainst(schemaName, value, ajv)
      : validateMessage(value, ajv);
    if (result.valid) {
      console.log(`PASS ${file}`);
    } else {
      failures++;
      console.error(`FAIL ${file}`);
      for (const err of result.errors) {
        console.error(`     ${err.instancePath || "/"} ${err.message}`);
      }
    }
  }
  process.exit(failures === 0 ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
