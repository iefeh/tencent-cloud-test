import { useState } from 'react';
import Image from 'next/image';
import myImg from 'img/astrark/school/mystery_circle.png';
import itemImg from 'img/astrark/school/mystery_item.png';
import closeImg from 'img/astrark/close.png';

export default function Mystery() {
  const [textVisible, setTextVisible] = useState(true);

  return (
    <div className="mystery absolute left-[4.75rem] bottom-[4.4375rem] flex items-center">
      <div
        className="flex justify-center items-center w-[6.125rem] h-[6.1875rem] relative z-10"
        onClick={() => setTextVisible(!textVisible)}
      >
        <Image className="animate-spin5" src={myImg} alt="" fill />
        <Image className="w-[3.0625rem] h-[2.625rem] z-10" src={itemImg} alt="" />
      </div>

      <div
        className={
          'text-bar font-decima text-sm text-[#7BB4F2] box-content relative overflow-hidden ' +
          (textVisible ? 'show' : '')
        }
      >
        <div
          className="text w-[36.5rem] px-11 py-[1.125rem] box-content border rounded-tr-[0.625rem] rounded-br-[0.625rem] border-l-0 relative"
          style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          The cycle of the mysterious object continues, bringing apocalyptic rebirths. The future of civilization hangs
          in the balance.
          <Image
            className="w-3 h-3 absolute right-[0.5625rem] top-[0.5625rem] cursor-pointer"
            src={closeImg}
            alt=""
            onClick={() => setTextVisible(false)}
          />
        </div>
      </div>
    </div>
  );
}
