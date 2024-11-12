import { useEffect } from "react";
import useCheckRouter from "./useCheckRouter";
import { useStore } from "@/store";

export default function useUserInit() {
  const { noNeedInit } = useCheckRouter();
  const store = useStore();

  useEffect(() => {
    if (noNeedInit) return;
    store.init();
  }, []);
}