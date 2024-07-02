import { Input, InputProps } from '@nextui-org/react';
import { FC, useState } from 'react';
import StepProgress from '../../progress/StepProgress';
import BasicButton from '@/pages/components/common/BasicButton';

interface BaseProps extends InputProps {
  title: string;
  caption?: string | JSX.Element;
  appendLabel?: string;
  value?: string;
  total?: number;
}

interface ProcessTypeProps {
  nodeType: 'progress';
  nodes: number;
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

const StepInput: FC<Props> = ({
  title,
  caption,
  nodeType,
  nodes,
  appendLabel,
  total,
  value,
  onValueChange,
  ...inputProps
}) => {
  const [percent, setPercent] = useState(0);

  function onInputValueChange(val: string) {
    if (nodeType === 'progress') {
      val = val.replace(/[^0-9\.]/g, '').match(/^[0-9]+(\.[0-9]*)?/)?.[0] || '';
    } else {
      val = val.replace(/[^0-9]/g, '');
    }

    onValueChange?.(Math.min(+val, +(total || 0)).toString());
  }

  function onPercentChange(val: number) {
    onValueChange?.(((val / 100) * (total || 0)).toFixed(5).replace(/(\.[0-9]*[1-9])0*$/, '$1'));
    setPercent(val);
  }

  return (
    <div className="flex-1 font-semakin">
      <div className="flex justify-between items-center">
        <div className="text-2xl leading-7 text-basic-yellow">{title}</div>
        {caption}
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
        value={value}
        onValueChange={onInputValueChange}
        {...inputProps}
      />

      {nodeType === 'progress' && <StepProgress value={percent} nodes={nodes} onInput={onPercentChange} />}

      {nodeType === 'button' && (
        <div className="flex justify-between items-center flex-nowrap mt-5 gap-4">
          {nodes.map((node, index) => (
            <BasicButton
              key={index}
              className="text-[#9F9F9F] flex-1"
              label={node.label}
              active={node.value + '' === value}
              onClick={() => onValueChange?.(node.value.toString())}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StepInput;
