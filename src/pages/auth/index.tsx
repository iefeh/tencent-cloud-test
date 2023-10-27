import { KEY_AUTHORIZATION } from "@/constant/storage";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Auth() {
  const router = useRouter();

  useEffect(() => {
    const token = router.query.token as string;
    localStorage.setItem(KEY_AUTHORIZATION, token);
  }, []);

  return null;
}