import { FormEvent, useRef, useState } from 'react';

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

  function onKeyDown(e: KeyboardEvent, index: number, value: string) {
    if (value || e.code.toUpperCase() !== 'BACKSPACE') return;
    if (index > 0) inputRefs.current[index - 1]?.focus();
  }

  const onInput = (index: number) => (e: FormEvent<HTMLInputElement>) => {
    let newValue = (e.target as HTMLInputElement).value;
    newValue = newValue[newValue.length - 1] || '';
    const arr = codes.slice();
    if (newValue !== '' && !/[0-9]/.test(newValue)) {
      newValue = arr[index];
    }

    arr[index] = newValue;
    if (newValue && index < codes.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    inputRefs.current[index]!.value = arr[index] || '';
    setCodes(arr);
    const text = arr.join('');
    onChange?.(text);
    if (text.length >= length) onComplete?.(text);
  };

  function onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData?.getData('Text');
    if (!text || !/^[0-9]{6}$/.test(text)) return;

    const chars = text.split('');
    setCodes(chars);
    inputRefs.current[chars.length - 1]?.focus();
    onChange?.(text);
    onComplete?.(text);
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
            pattern="[0-9]"
            onKeyDown={(e) => onKeyDown(e as any, index, value)}
            onInput={onInput(index)}
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
