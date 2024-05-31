import { useUserContext } from '@/store/User';
import IframeDoc from '../components/common/IframeDoc';
import { observer } from 'mobx-react-lite';

function CookiesPolicy() {
  const { locale } = useUserContext();

  return (
    <div id="luxy" className="page-privacy-policy px-16 pt-40 pb-16">
      <IframeDoc src={`/html${locale ? '/' + locale : ''}/Cookies Policy.htm`} />
    </div>
  );
}

export default observer(CookiesPolicy);
