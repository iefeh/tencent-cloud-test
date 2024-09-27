import { toast } from "react-toastify";

/**
 * 格式化用户昵称（超长省略）
 * @param val 需要被格式化的字符串
 */
export function formatUserName(val?: string) {
  val = val || '';
  if (val.length < 10) return val;
  return `${val.substring(0, 6)}...${val.substring(val.length - 4)}`;
}

/**
 * 格式化用户昵称（超长省略）
 * @param val 需要被格式化的字符串
 */
export function formatWallectAddress(val?: string, mask = '*', maskLen = 6) {
  val = val || '';
  if (val.length < 10) return val;
  return [val.substring(0, 6), Array(maskLen).fill(mask).join(''), val.substring(val.length - 4)].join('');
}

export async function copyText(text: string) {
  try {
    await window.navigator.clipboard.writeText(text || '');
    toast.success('Copied!');
  } catch (error: any) {
    toast.error(error?.message || error);
  }
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.src = src;
    img.style.display = 'none';

    img.onload = () => resolve(img);

    if (img.complete) resolve(img);
  });
}

export function to2Digit(val?: number | string) {
  return (val || 0).toString().padStart(2, '0');
}

export function sleep(time: number = 300) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function isHexZero(value: string) {
  return parseInt(value, 16) === 0;
}