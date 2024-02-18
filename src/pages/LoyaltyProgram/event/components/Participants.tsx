import { queryEventParticipantsAPI } from '@/http/services/task';
import { throttle } from 'lodash';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Participants() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const queryParticipants = throttle(async () => {
    const id = router.query.id as string;
    if (!id) return;

    const params = {
      page_num: 1,
      page_size: 9,
      campaign_id: id,
    };

    try {
      const res = await queryEventParticipantsAPI(params);
      const list = res.participants || [];
      setItems(list);
      setTotal(res.total || 0);
    } catch (error) {}
  }, 500);

  useEffect(() => {
    queryParticipants();
  }, []);

  return (
    <div className="w-[28.125rem] mt-14">
      <div className="font-semakin text-2xl">Participants( {total})</div>

      <div className="overflow-hidden rounded-[0.625rem] border-1 border-basic-gray mt-7 flex">
        {items.map((item, index) => (
          <Image
            className="avatar bg-black border-2 border-black rounded-full [&+.avatar]:-ml-3 inline-block w-[3.75rem] h-[3.75rem]"
            key={index}
            src={item.src}
            alt=""
            width={60}
            height={60}
          />
        ))}
      </div>
    </div>
  );
}
