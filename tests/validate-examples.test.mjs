// Every example under examples/v1/ must validate as a PcpMessage.
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildValidator, validateMessage } from "../reference/validate.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const EXAMPLES = join(HERE, "..", "examples", "v1");
const ajv = buildValidator();

for (const file of readdirSync(EXAMPLES).filter((f) => f.endsWith(".json")).sort()) {
  test(`example ${file} is a valid PcpMessage`, () => {
    const obj = JSON.parse(readFileSync(join(EXAMPLES, file), "utf8"));
    const result = validateMessage(obj, ajv);
    assert.ok(result.valid, `expected valid, got errors:\n${JSON.stringify(result.errors, null, 2)}`);
  });
}
