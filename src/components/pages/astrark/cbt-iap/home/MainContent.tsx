import S3Image from '@/components/common/medias/S3Image';
import { FC, useEffect, useState } from 'react';
import ShineButton from './ShineButton';
import RulesModal from './RulesModal';
import { useDisclosure } from '@nextui-org/react';
import QueryModal from './QueryModal';
import FAQModal from './FAQModal';
import { useRouter } from 'next/router';
import InnerQueryModal from './InnerQueryModal';

const MainContent: FC = () => {
  const rulesDisclosure = useDisclosure();
  const queryDisclosure = useDisclosure();
  const faqDisclosure = useDisclosure();
  const [isInner, setIsInner] = useState<boolean | null>(null);
  const route = useRouter();

  function checkIsInner() {
    setIsInner(route.pathname === '/AstrArk/cbt-iap/inner');
  }

  useEffect(() => {
    checkIsInner();
  }, []);

  const QMCom = isInner ? InnerQueryModal : QueryModal;

  return (
    <div className="relative translate-y-[10%] translate-x-[12%]">
      <div className="w-[58.25rem] aspect-[932/421] relative">
        <S3Image className="object-contain" src="/astrark/cbt-iap/slogan.png" fill />
      </div>

      <div className="flex justify-center items-center w-[66.25rem] h-[10.75rem]">
        <ShineButton size="lg" iconName="question" onPress={rulesDisclosure.onOpen}>
          Rules Explanation
        </ShineButton>

        <ShineButton size="md" iconName="arrow_right" onPress={() => {
          queryDisclosure.onOpen();
        }}>
          IAP Return Query
        </ShineButton>

        <ShineButton size="sm" iconName="question" onPress={faqDisclosure.onOpen}>
          FAQ
        </ShineButton>
      </div>

      <RulesModal disclosure={rulesDisclosure} />

      {isInner !== null && <QMCom disclosure={queryDisclosure} />}

      <FAQModal disclosure={faqDisclosure} />
    </div>
  );
};

export default MainContent;
