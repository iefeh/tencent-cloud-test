import http from '../index';
import JSZip from 'jszip';

export async function getZipFiles(
  url: string,
  infinite = true,
  maxTimes = 10,
  currentTimes = 0,
): Promise<{ [key: string]: JSZip.JSZipObject } | null> {
  const res = await http.get(url, {
    responseType: 'arraybuffer',
  });

  if (res?.status !== 200) {
    if (!infinite || currentTimes >= maxTimes) return null;
    await new Promise((resolve) => setTimeout(resolve, 200));
    const nextRes = await getZipFiles(url, infinite, maxTimes, currentTimes + 1);
    return nextRes;
  }
  const zipData = await JSZip.loadAsync(res.data);
  return zipData.files;
}
