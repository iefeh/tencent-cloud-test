import { NFTItem, queryDisplayNFTListAPI } from '@/http/services/mint';
import { useEffect, useState } from 'react';

export default function useDisplayAssets() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NFTItem[]>([]);

  async function queryData() {
    setLoading(true);
    const res = await queryDisplayNFTListAPI();
    setData(res || []);
    setLoading(false);
  }

  useEffect(() => {
    queryData();
  }, []);

  return { loading, data, queryData };
}
