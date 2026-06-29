// Runs the language-neutral conformance corpus: every accept case must validate,
// every reject case must fail. This is the executable definition of conformance.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildValidator, validateMessage, validateAgainst } from "../reference/validate.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CONF = join(HERE, "..", "conformance");
const manifest = JSON.parse(readFileSync(join(CONF, "manifest.json"), "utf8"));
const ajv = buildValidator();

for (const c of manifest.cases) {
  test(`conformance ${c.file} → ${c.expect}`, () => {
    const value = JSON.parse(readFileSync(join(CONF, c.file), "utf8"));
    const result = c.schema === "pcp-message"
      ? validateMessage(value, ajv)
      : validateAgainst(c.schema, value, ajv);
    const expectedValid = c.expect === "accept";
    assert.equal(
      result.valid,
      expectedValid,
      `${c.file}: expected ${c.expect} (${c.note})\nerrors: ${JSON.stringify(result.errors, null, 2)}`,
    );
  });
}
