import { MAX_DISPLAY_ASSETS } from '@/constant/nft';
import { NFTItem, queryDisplayNFTListAPI } from '@/http/services/mint';
import { useEffect, useState } from 'react';

export default function useDisplayAssets() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NFTItem[]>([]);

  async function queryData() {
    setLoading(true);
    const res = await queryDisplayNFTListAPI();
    const list = res || [];
    if (list.length < MAX_DISPLAY_ASSETS) {
      list.push(...Array(MAX_DISPLAY_ASSETS - list.length).fill(null));
    }
    setData(list);
    setLoading(false);
  }

  useEffect(() => {
    queryData();
  }, []);

  return { loading, data, queryData };
}
