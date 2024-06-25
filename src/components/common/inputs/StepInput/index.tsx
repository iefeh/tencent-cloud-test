import { Input, InputProps } from '@nextui-org/react';
import { FC } from 'react';
import StepProgress from '../../process/StepProgress';

interface BaseProps extends InputProps {
  title: string;
  appendLabel?: string;
}

interface ProcessTypeProps {
  nodeType: 'process';
  nodes: number;
  total: number;
}

interface ButtonTypeNode {
  label: string;
  value: number | string;
}

interface ButtonTypeProps {
  nodeType: 'button';
  nodes: ButtonTypeNode[];
}

type Props = BaseProps & (ProcessTypeProps | ButtonTypeProps);

const StepInput: FC<Props> = ({ title, nodeType, nodes, appendLabel, ...inputProps }) => {
  return (
    <div className="flex-1 font-semakin">
      <div className="flex justify-between items-center">
        <div className="text-2xl leading-7 text-basic-yellow">{title}</div>
      </div>

      <Input
        className="w-full mt-5 bg-[url('https://moonveil-public.s3.ap-southeast-2.amazonaws.com/pledge/bg_input_add.png')] bg-[length:100%_100%] bg-no-repeat"
        classNames={{
          input: 'bg-transparent h-[4.625rem] text-[2.5rem] !text-[#FFFFFF96]',
          innerWrapper: 'bg-transparent',
          inputWrapper:
            'bg-transparent hover:bg-transparent group-data-[focus=true]:bg-transparent dark:bg-transparent dark:hover:bg-transparent dark:group-data-[focus=true]:bg-transparent h-[4.625rem]',
        }}
        endContent={appendLabel && <div className="pointer-events-none text-2xl leading-7 pr-5">{appendLabel}</div>}
        {...inputProps}
      />

      {nodeType === 'process' && <StepProgress nodes={nodes} />}
    </div>
  );
};

export default StepInput;
