/**
 * download file.
 * @param {string | Blob | File} item download source.
 * @param {string | undefined} filename file name.
 */

export function parseChainIdToHex(val: string | number): `0x${string}` {
  return `0x${(+val).toString(16)}`;
}
