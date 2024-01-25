export const enum MintStatus {
  DEFAULT,
  CONNECTED,
  WRONG_NETWORK,
  CORRECTED_NETWORK,
  WRONG_WHITELISTED,
  WHITELISTED,
  WRONG_MINTED,
  MINTED,
  SOLD_OUT,
}

export const enum MintState {
  NotStarted,
  Pausing,
  GuaranteedRound,
  FCFS_Round,
  PublicRound,
  Ended
}
