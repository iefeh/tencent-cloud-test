import usePageQuery from '@/hooks/usePageQuery';
import { queryPurchaseRecordsAPI } from '@/http/services/astrark';

export default function usePurchaseList() {
  const { loading, total, data, pagi, setData, queryData, onPageChange } = usePageQuery({
    autoload: false,
    key: 'data',
    notFill: true,
    fn: queryPurchaseRecordsAPI,
    pageSize: 10,
  });

  return { loading, total, data, pagi, onPageChange, setData, queryData };
}
