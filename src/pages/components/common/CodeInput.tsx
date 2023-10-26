import { FormEvent, useRef, useState, MutableRefObject } from 'react';

interface Props {
  length?: number;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
}

export default function CodeInput(props: Props) {
  const { length = 6, onComplete, onChange } = props;
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null));
  const [codes, setCodes] = useState(Array(length).fill(''));
  const currentFocusIndex = useRef(-1);
  const isFull = useRef(false);

  function onFocus(index: number) {
    let targetIndex = Math.max(Math.min(index, length - 1), 0);
    const firstEI = codes.findIndex((code) => !code);
    if (firstEI > -1) {
      if (firstEI < targetIndex - 1) targetIndex = firstEI;
    } else {
      targetIndex = length - 1;
    }

    if (currentFocusIndex.current === targetIndex) return;
    currentFocusIndex.current = targetIndex;
    inputRefs.current[targetIndex]?.focus();
  }

  function onKeyUp(e: KeyboardEvent, index: number, value: string) {
    if (value || e.code.toUpperCase() !== 'BACKSPACE') return;
    if (isFull.current) {
      isFull.current = false;
      return;
    }
    onFocus(index - 1);
  }

  function onInput(e: FormEvent<HTMLInputElement>, index: number, value: string) {
    let newValue = (e.target as HTMLInputElement).value;
    newValue = newValue[newValue.length - 1] || '';
    const arr = codes.slice();
    if (newValue !== '' && !/[0-9]/.test(newValue)) {
      newValue = arr[index];
    }

    arr[index] = newValue;
    if (newValue !== '') {
      if (index < length - 1) {
        onFocus(index + 1);
      } else {
        isFull.current = true;
        onComplete?.(arr.join(''));
      }
    }
    inputRefs.current[index]!.value = arr[index] || '';
    setCodes(arr);
    onChange?.(arr.join(''));
  }

  function onPaste(e: ClipboardEvent) {
    const text = e.clipboardData?.getData('Text');
    if (!text) return;

    const chars = text.split('');
    const newCodes = codes.map((_, i) => (/[0-9]/.test(chars[i]) ? chars[i] : ''));
    setCodes(newCodes);
    const lastIndex = newCodes.findLastIndex((c) => !!c);
    setTimeout(() => onFocus(lastIndex), 500);
  }

  return (
    <>
      <span className="code-input inline-flex justify-between items-center w-full text-lg">
        {codes.map((value, index) => (
          <input
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            className="inline-block w-10 h-10 outline-none border-deep-yellow border-1 rounded text-center bg-basic-gray"
            key={index}
            type="text"
            value={value}
            onKeyUp={(e) => onKeyUp(e as any, index, value)}
            onInput={(e) => onInput(e, index, value)}
            onFocus={() => onFocus(index)}
            onBlur={() => {
              currentFocusIndex.current = -1;
            }}
            onPaste={(e) => onPaste(e as any)}
          />
        ))}
      </span>
    </>
  );
}
