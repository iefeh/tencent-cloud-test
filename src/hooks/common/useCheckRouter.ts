import { useRouter } from 'next/router';

// 无loading页面
const whiteList = [
  '/email/captcha/quickfill',
  '/auth',
  '/auth/connect',
  '/auth/apple',
  '/oauth',
  '/AstrArk/deleteAccount',
  '/AstrArk/assets',
  '/AstrArk/shop',
  '/AstrArk/cbt-iap/inner',
];

// 无顶部导航-可被页面自定义布局覆盖
const noHeaderList = [
  '/email/captcha/quickfill',
  '/auth',
  '/auth/connect',
  '/auth/apple',
  '/oauth',
  '/AstrArk/assets',
  '/AstrArk/cbt-iap',
];

// 不初始化用户数据
const noInitList = [
  '/email/captcha/quickfill',
  '/auth',
  '/auth/connect',
  '/auth/apple',
  '/AstrArk/assets',
  '/AstrArk/shop',
];

// 是否AA游戏布局-主要用于rem响应计算
const aaMobileList = [
  '/AstrArk/deleteAccount',
  '/AstrArk/assets',
  '/AstrArk/shop',
  '/AstrArk/cbt-iap',
  '/AstrArk/cbt-iap/inner',
];

export default function useCheckRouter() {
  const router = useRouter();

  const isInWhiteList = whiteList.includes(router.route);
  const hasNoHeader = noHeaderList.includes(router.route);
  const noNeedInit = noInitList.includes(router.route);
  const isAAMobile = aaMobileList.includes(router.route);

  return { isInWhiteList, hasNoHeader, noNeedInit, isAAMobile };
}
