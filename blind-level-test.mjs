import assert from "node:assert";
import { blindLevel } from "./blind-level.mjs";

// zero -> RangeError
assert.throws(() => blindLevel(0, 0, 0), RangeError);
// negative -> RangeError
assert.throws(() => blindLevel(0, 100, -5), RangeError);
// fractional (non-safe-integer) -> RangeError
assert.throws(() => blindLevel(0, 100, 0.5), RangeError);

// valid boundaries: level 1 at start, cap at final level
const early = blindLevel(0, 0, 4);
assert.equal(early.level, 1);
assert.equal(early.bigBlind, 4);

// elapsed beyond max interval -> capped at final level (7)
const capped = blindLevel(0, 999999, 4);
assert.equal(capped.level, 7);
assert.equal(capped.bigBlind, 256);

console.log("PASS");
