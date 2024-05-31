import { useUserContext } from '@/store/User';
import IframeDoc from '../components/common/IframeDoc';
import { observer, } from 'mobx-react-lite';

function PrivacyPolicy() {
  const { locale } = useUserContext();

  return (
    <div id="luxy" className="page-privacy-policy px-16 pt-40 pb-16">
      <IframeDoc src={`/html${locale ? '/' + locale : ''}/PRIVACY POLICY.htm`} />
    </div>
  );
}

export default observer(PrivacyPolicy);
