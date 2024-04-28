/**
 * 格式化用户昵称（超长省略）
 * @param val 需要被格式化的字符串
 */
export function formatUserName(val?: string) {
  val = val || '';
  if (val.length < 10) return val;
  return `${val.substring(0, 6)}...${val.substring(val.length - 4)}`;
}
