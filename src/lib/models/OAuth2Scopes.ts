export enum OAuth2Scopes {
  UserInfo = "userinfo"
}

export const OAuth2ScopeAuth: {[key: string]: string[]} = {
  userinfo: ["View your nickname and avatar", "View your wallet address", "Interact on the blockchain with your wallet address, with your permission."]
}