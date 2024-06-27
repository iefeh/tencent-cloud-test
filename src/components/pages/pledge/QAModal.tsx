import { FC } from 'react';
import { Accordion, AccordionItem, Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';

interface Props {
  disclosure: Disclosure;
}

const rules = [
  {
    title:
      'A relatively long question, can this sentence be very long?A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content:
      'The answer can also be very, very long, and only those who know so long can see the style of this rendering. The answer can also be very, very long, and only those who know so long can see the style of this rendering.The answer can also be very, very long, and only those who know so long can see the style of this rendering.',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
  },
  {
    title: 'A relatively long question, can this sentence be very long?',
    content: '',
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
                <Accordion className="p-0 gap-1" variant="splitted">
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
