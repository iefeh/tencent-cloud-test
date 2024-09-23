import { MAX_DISPLAY_ASSETS } from '@/constant/nft';
import { queryDisplayNFTListAPI } from '@/http/services/astrark';
import type { NFTItem } from '@/http/services/mint';
import { useAAUserContext } from '@/store/AstrarkUser';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function useDisplayAssets() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NFTItem[]>(Array(MAX_DISPLAY_ASSETS).fill(null));
  const router = useRouter();
  const { token, setToken } = useAAUserContext();

  async function queryData() {
    setLoading(true);
    const res = await queryDisplayNFTListAPI();
    const list = res instanceof Array ? res || [] : [];
    if (list.length < MAX_DISPLAY_ASSETS) {
      list.push(...Array(MAX_DISPLAY_ASSETS - list.length).fill(null));
    }
    setData(list);
    setLoading(false);
  }

  useEffect(() => {
    if (!router.query.token) return;
    setToken(router.query.token as string);
  }, [router.query.token]);

  useEffect(() => {
    if (!token) return;
    const queryToken = router.query.token as string;
    if (!!queryToken && token !== queryToken) return;
    queryData();
  }, [token]);

  return { loading, data, queryData };
}
