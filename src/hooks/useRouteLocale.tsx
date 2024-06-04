import { KEY_LOCALE, Locale } from '@/constant/locale';
import UserStore from '@/store/User';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function useRouteLocale(store: UserStore) {
  const router = useRouter();
  const { asPath } = router;

  const localeKey = 'locale-';
  const sections = asPath.replace(/\/+$/g, '').split('/');
  const lastSection = sections[sections.length - 1];

  useEffect(() => {
    const val = (localStorage.getItem(KEY_LOCALE) || '') as Locale;
    store.setLocale(val);
  }, []);

  if (!lastSection || !lastSection.startsWith(localeKey)) return;

  const locale = lastSection.substring(localeKey.length);
  store.setLocale(locale as Locale);

  sections.pop();
  const realPath = '/' + sections.join('/');
  router.replace(realPath);
}
