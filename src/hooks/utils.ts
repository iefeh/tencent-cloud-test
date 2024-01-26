/**
 * download file.
 * @param {string | Blob | File} item download source.
 * @param {string | undefined} filename file name.
 */
export async function downloadFile(item: string | Blob | File, filename?: string) {
  let url = '';
  if (typeof item === 'string') {
    url = await toDataURL(item);
  } else if (item instanceof Blob) {
    url = URL.createObjectURL(item);
  }

  const eleLink = document.createElement('a');
  eleLink.download = filename || 'file';
  eleLink.style.display = 'none';
  eleLink.href = url;
  document.body.appendChild(eleLink);
  eleLink.click();
  document.body.removeChild(eleLink);
}

function toDataURL(url: string) {
  return fetch(url)
    .then((response) => {
      return response.blob();
    })
    .then((blob) => {
      return URL.createObjectURL(blob);
    });
}


export function parseChainIdToHex(val: string): `0x${string}` {
  return `0x${parseInt(val).toString(16)}`;
}
