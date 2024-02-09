import { queryEventParticipantsAPI } from '@/http/services/task';
import { throttle } from 'lodash';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Participants() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);

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
      setItems(res.participants || []);
    } catch (error) {}
  }, 500);

  useEffect(() => {
    queryParticipants();
  }, []);

  return (
    <div className="w-[28.125rem] mt-14">
      <div className="font-semakin text-2xl">Participants</div>

      <div className="overflow-hidden rounded-[0.625rem] border-1 border-basic-gray mt-7 flex">
        {items.map((item, index) => (
          <Image key={index} src={item.src} alt="" width={64} height={64} />
        ))}
      </div>
    </div>
  );
}
