import { KEY_INVITE_CODE } from "@/constant/storage";
import { useRouter } from "next/router";

export default function useRouterInviteCode() {
  const router = useRouter();

  if (router.query.invite_code) {
    localStorage.setItem(KEY_INVITE_CODE, (router.query?.invite_code as string) || '');
  }

}