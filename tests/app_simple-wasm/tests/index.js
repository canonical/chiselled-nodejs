import assert from "assert";
import { add, fastHexEncode } from "../build/debug.js";
assert.strictEqual(add(1, 2), 3);
assert.strictEqual(
  fastHexEncode(
    new Uint8Array([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 0xff, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf,
    ])
  ),
  "000102030405060708FF0A0B0C0D0E0F"
);
console.log("ok");
