import { enableStaticRendering } from "mobx-react-lite";
import UserStore from "./User";

enableStaticRendering(typeof window === "undefined");

let clientStore: UserStore;

const initStore = () => {
  const store = clientStore ?? new UserStore();

  if (typeof window === "undefined") return store;
  if (!clientStore) clientStore = store;
  return store;
};

export function useStore() {
  return initStore();
}
