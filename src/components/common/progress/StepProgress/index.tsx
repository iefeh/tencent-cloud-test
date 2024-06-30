import { cn } from '@nextui-org/react';
import { FC, FormEvent, useRef, useState } from 'react';
import styles from './index.module.scss';

interface Props {
  nodes: number | number[];
  value: number;
  onInput?: (val: number) => void;
}

const StepProgress: FC<Props> = ({ value, nodes, onInput }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const realNodes =
    typeof nodes === 'number'
      ? Array(nodes)
          .fill(0)
          .map((_, i) => i && (100 / (nodes - 1)) * i)
      : nodes;

  const period = 100 / (realNodes.length - 1);

  function onProgressInput(e: FormEvent<HTMLInputElement>) {
    const value = +e.currentTarget.value;
    let minDiff = 100;
    let node = 0;

    realNodes.forEach((rn) => {
      const diff = Math.abs(value - rn);
      if (diff > period) return;

      if (minDiff > diff) {
        minDiff = diff;
        node = rn;
      }
    });

    if (value === node) return;
    onInput?.(node);
  }

  if (typeof nodes === 'number' && (nodes < 2 || nodes % 1 !== 0)) return 'Invalids nodes';

  return (
    <div className="relative mx-[0.5625rem] pb-5">
      <div className={styles.progress}></div>

      <div className={styles.nodes}>
        {realNodes.map((node, index) => (
          <div
            className={styles.node}
            key={index}
            style={{ left: `${node}%` }}
            data-value={node.toFixed(0) + '%'}
            onClick={() => onInput?.(node)}
          ></div>
        ))}
      </div>

      <input
        ref={inputRef}
        value={value}
        className={cn([styles.progressInput])}
        type="range"
        onInput={onProgressInput}
      />
    </div>
  );
};

export default StepProgress;
