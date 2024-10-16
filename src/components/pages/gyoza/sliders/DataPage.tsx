import { FC, useState, } from "react";
import { GyozaTabsEnum } from '@/components/pages/gyoza/GyozaTabs';

import GyozaTabs from '@/components/pages/gyoza/GyozaTabs';
import TabContents from '@/components/pages/gyoza/TabContents';

const DataPage: FC = () => {
  const [tabkeys, setTabkeys] = useState<GyozaTabsEnum>(GyozaTabsEnum.Overview)

  return (
    <div className='pt-[5.5625rem] w-[87.5rem] mx-auto'>
      <GyozaTabs
        onSelectionChange={(key) => setTabkeys(key as GyozaTabsEnum)}
      ></GyozaTabs>

      <TabContents tabKey={tabkeys}></TabContents>

    </div>
  )
}

export default DataPage;