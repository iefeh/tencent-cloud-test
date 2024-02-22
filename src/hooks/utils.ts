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

/** 获取直线上的连续点坐标 */
export function getPointsOnLine(
  point1: number[],
  point2: number[],
  interval: number,
  includeStart?: boolean,
  includeEnd?: boolean,
) {
  // 计算两点之间的距离
  var distance = Math.sqrt(Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2));

  // 计算两点之间的单位向量
  var unitVector = [(point2[0] - point1[0]) / distance, (point2[1] - point1[1]) / distance];

  // 计算连线上的点
  var points = [];

  if (includeStart) {
    points.push(point1);
  }

  var currentDistance = interval;

  while (currentDistance < distance) {
    var x = point1[0] + unitVector[0] * currentDistance;
    var y = point1[1] + unitVector[1] * currentDistance;
    points.push([x, y]);
    currentDistance += interval;
  }

  if (includeEnd) {
    points.push(point2);
  }

  return points;
}

export function parseChainIdToHex(val: string): `0x${string}` {
  return `0x${parseInt(val).toString(16)}`;
}
