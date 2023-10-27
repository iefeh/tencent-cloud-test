import { KEY_AUTHORIZATION } from "@/constant/storage";
import { useEffect } from "react";

export default function Auth() {
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token') || '';
    localStorage.setItem(KEY_AUTHORIZATION, token);
  }, []);

  return null;
}