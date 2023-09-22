// The entry file of your WebAssembly module.

export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function fastHexEncode(bytes: Uint8Array): string {
  const ascii_a: v128 = v128.splat<u8>(0x37);
  const ascii_zero = v128.splat<u8>(0x30);
  const and_4bits = v128.splat<u8>(0xf);
  const nines = v128.splat<u8>(9);

  const output = new Uint8Array(bytes.length * 2);
  const invec: v128 = v128.load(bytes.dataStart, 0, 16);

  const masked1: v128 = v128.and(invec, and_4bits);
  const masked2: v128 = v128.and(v128.shr<u8>(invec, 4), and_4bits);
  
  const cmpmask1 = v128.gt<u8>(masked1, nines);
  const cmpmask2 = v128.gt<u8>(masked2, nines);

  // wasm v128 does not have branch selects, we have to convert them to or-and-not constructs
  const masked1_r = v128.add<u8>(v128.or(v128.and(cmpmask1, ascii_a), v128.and(v128.not(cmpmask1), ascii_zero)), masked1);
  const masked2_r = v128.add<u8>(v128.or(v128.and(cmpmask2, ascii_a), v128.and(v128.not(cmpmask2), ascii_zero)), masked2);

  // interleave low bits
  const result1 = v128.shuffle<u8>(masked2_r, masked1_r, 0, 16, 1, 17, 2, 18, 3, 19, 4, 20, 5, 21, 6, 22, 7, 23);
  // interleave high bits
  const result2 = v128.shuffle<u8>(masked2_r, masked1_r, 8, 24, 9, 25, 10, 26, 11, 27, 12, 28, 13, 29, 14, 30, 15, 31);

  v128.store(output.dataStart, result1, 0, 16);
  v128.store(output.dataStart, result2, 16, 16);

  return String.UTF8.decode(output.buffer, true);
}
