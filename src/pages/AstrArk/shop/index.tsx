import Landscape from '@/components/common/screen/Landscape';
import AstrArkLayout from '@/components/layouts/AstrArkLayout';
import { observer } from 'mobx-react-lite';
import { NextPage } from 'next';

const DeleteAccountPage: NextPage & BasePage = () => {
  return <Landscape></Landscape>;
};

DeleteAccountPage.getLayout = AstrArkLayout;

export default observer(DeleteAccountPage);
