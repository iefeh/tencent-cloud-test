import { FC } from 'react';

interface Props {
  label: string;
  value: string;
  unit: string | JSX.Element;
  append?: JSX.Element;
}

const InfoCardItem: FC<Props> = ({ label, value, unit, append }) => {
  return (
    <div className="flex justify-between items-center flex-nowrap gap-2">
      <div>
        <div>{label}</div>

        <div className="flex items-end gap-6 text-[#EBDDB6]">
          <div className="text-[2.5rem]">{isNaN(+value) ? '--' : value}</div>
          <div className="text-2xl leading-none">{unit}</div>
        </div>
      </div>

      {append && <div className="shrink-0">{append}</div>}
    </div>
  );
};

export default InfoCardItem;
