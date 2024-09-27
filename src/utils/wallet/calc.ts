import BN from 'bignumber.js';

export function fromWei(val?: number | string | bigint | BN, decimal: number | bigint = 18, digit = 5) {
  return BN((val || 0).toString())
    .dividedBy(BN(10).exponentiatedBy(BN(decimal.toString())))
    .toFixed(digit);
}

export function toWei(val?: string | number, decimal: number | bigint = 18) {
  return BN((val || 0).toString())
    .multipliedBy(BN(10).exponentiatedBy(BN(decimal.toString())))
    .integerValue();
}
