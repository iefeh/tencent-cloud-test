import { useRouter } from 'next/router';

const whiteList = [
  '/email/captcha/quickfill',
  '/auth',
  '/auth/connect',
  '/oauth',
  '/AstrArk/assets',
  '/AstrArk/shop',
  '/AstrArk/cbt-iap/inner',
];

const noHeaderList = [
  '/email/captcha/quickfill',
  '/auth',
  '/auth/connect',
  '/oauth',
  '/AstrArk/assets',
  '/AstrArk/cbt-iap',
];

const noInitList = ['/email/captcha/quickfill', '/auth', '/auth/connect', '/AstrArk/assets', '/AstrArk/shop'];

const aaMobileList = ['/AstrArk/deleteAccount', '/AstrArk/assets', '/AstrArk/shop', '/AstrArk/cbt-iap/inner'];

export default function useCheckRouter() {
  const router = useRouter();

  const isInWhiteList = whiteList.includes(router.route);
  const hasNoHeader = noHeaderList.includes(router.route);
  const noNeedInit = noInitList.includes(router.route);
  const isAAMobile = aaMobileList.includes(router.route);

  return { isInWhiteList, hasNoHeader, noNeedInit, isAAMobile };
}
