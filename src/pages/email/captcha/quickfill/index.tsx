import { setQuickFillCode } from '@/hooks/usePostMessage';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Quickfill() {
  const router = useRouter();

  useEffect(() => {
    setQuickFillCode(router.query.code as string);
  }, []);

  return <div className="w-screen h-screen flex justify-center items-center">You can close the window.</div>;
}
