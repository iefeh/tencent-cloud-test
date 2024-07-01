import { FC } from 'react';
import { Accordion, AccordionItem, Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';

interface Props {
  disclosure: Disclosure;
}

const rules = [
  {
    title: '1. Why should I stake my assets?',
    content:
      'By staking assets, you will earn Staking Points (SP) over time. Our upcoming airdrop will distribute $MORE Tokens based on these points. Staking assets also grants unique rewards in future games.',
  },
  {
    title: '2. How do I stake assets?',
    content:
      'Choose your preferred pool and set the staking duration. Longer durations yield higher multipliers, resulting in more SP.',
  },
  {
    title: '3. How do I earn Staking Points?',
    content:
      'Simply choose your preferred pool and stake the corresponding assets. SP are generated and distributed per block. The more assets you have in a pool, the more SP you earn per block.',
  },
  {
    title: '4. How do I know how many Staking Points I can earn?',
    content:
      "When staking, the interface will display an estimated SP reward based on the asset amount and duration. This estimate is subject to change due to other users' activities in the same block.",
  },
  {
    title: '5. Can I participate in multiple pools at the same time?',
    content:
      'Yes, SP are calculated separately for each pool. By staking in multiple pools, you can earn rewards from each. Note that the benefits of spreading vs. concentrating your investments may vary.',
  },
  {
    title: '6. Are Staking Points the same as Moon Beams in the loyalty program?',
    content: 'No, Staking Points are different from Moon Beam. SP can only be earned by staking assets.',
  },
  {
    title: '7. If I have Moon Beam, do I still need to stake assets?',
    content: 'SP and Moon Beam do not conflict. It’s beneficial to earn both when possible.',
  },
  {
    title: '8. How do I withdraw assets?',
    content:
      'Assets available for withdrawal are shown in "Unlocked Staking." Immediate withdrawals are possible if no duration was set. Otherwise, assets appear in "Locked Staking" until the lock period ends.',
  },
  {
    title: '9. Do I need to manually claim rewards?',
    content: 'SP are automatically credited to your account, so manual claiming is unnecessary.',
  },
  {
    title: '10. How do I convert Staking Points into $MORE?',
    content: 'Stay updated with our announcements for details.',
  },
  {
    title: '11. What are the risks of staking my assets?',
    content:
      'We prioritize the security of user assets. Our contracts are audited and tested, and we use AAVE’s mature protocol without leverage to avoid liquidation risks. However, potential risks exist if AAVE is attacked or if there are vulnerabilities in related contracts.',
  },
];

const QAModal: FC<Props> = ({ disclosure }) => {
  return (
    <Modal
      isOpen={disclosure.isOpen}
      onOpenChange={disclosure.onOpenChange}
      classNames={{
        base: 'rounded-[1.875rem] max-w-[52.6875rem] bg-black',
        header:
          'h-[5.8125rem] flex items-center py-0 px-[1.875rem] bg-gradient-to-r from-[#D9A970] to-[#EFEBC5] text-black text-3xl font-semakin',
        body: 'pt-0 px-0 pb-8',
        closeButton: 'text-2xl text-black hover:bg-transparent active:bg-transparent right-6 top-6',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Frequently asked questions</ModalHeader>

            <ModalBody>
              <div className="max-h-[31.25rem] overflow-y-auto has-scroll-bar scrollbar-yellow">
                <Accordion className="p-0 gap-1" variant="splitted" selectionMode="multiple">
                  {rules.map((rule, index) => (
                    <AccordionItem
                      key={index}
                      classNames={{
                        base: '!p-0 !bg-transparent',
                        heading: 'bg-gradient-to-r from-[#241B12] to-[#000000] px-10',
                        title: 'text-[#EBDDB6]',
                        indicator: 'text-[#EBDDB6] text-lg',
                        content: 'pt-[1.375rem] px-10 pb-12 text-[#AEAEAE]',
                      }}
                      aria-label={rule.title}
                      title={rule.title}
                    >
                      {rule.content}
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default QAModal;
