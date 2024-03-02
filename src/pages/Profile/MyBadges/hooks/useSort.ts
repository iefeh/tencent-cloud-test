import { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';

export default function useSort(options?: Sortable.Options) {
  const containerElRef = useRef<HTMLUListElement>(null);
  const baseOptions: Sortable.Options = {
    filter: '.empty-item',
  };
  const realOptions = Object.assign({}, baseOptions, options);

  function initSort() {
    if (!containerElRef.current) return;

    Sortable.create(containerElRef.current, realOptions);
  }

  useEffect(() => {
    initSort();
  }, []);

  return { containerElRef };
}
