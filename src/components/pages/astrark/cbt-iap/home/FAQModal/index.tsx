import PageDesc from '@/components/common/PageDesc';
import S3Image from '@/components/common/medias/S3Image';
import { Accordion, AccordionItem, Modal, ModalBody, ModalContent } from '@nextui-org/react';
import { FC } from 'react';
import rules from './rules.json';

const FAQModal: FC<DisclosureProps> = ({ disclosure: { isOpen, onOpenChange } }) => {
  return (
    <Modal
      placement="center"
      isDismissable={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        wrapper: 'justify-start',
        base: 'w-1/2 max-w-[50%] h-screen !m-0 rounded-none bg-black overflow-visible',
        body: 'px-24 pt-28 pb-16 flex flex-col justify-center h-full overflow-hidden',
        closeButton:
          "[&>svg]:hidden w-[4.875rem] aspect-square !bg-transparent bg-[url('https://d3dhz6pjw7pz9d.cloudfront.net/icons/modal_fold.png')] bg-contain top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
      }}
      motionProps={{
        variants: {
          enter: {
            x: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          },
          exit: {
            x: -600,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn',
            },
          },
        },
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody>
              <PageDesc
                hasBelt
                className="items-start shrink-0"
                title={<div className="font-semakin text-5xl text-basic-yellow">FAQ</div>}
                subtitle={
                  <div className="text-2xl mt-4 text-[#EDEDED]">
                    Paid Marching Test with Data Wipe & IAP FAQ
                  </div>
                }
              />

              <Accordion
                className="p-0 gap-3 mt-11 flex-1 overflow-y-auto has-scroll-bar"
                variant="splitted"
                selectionMode="multiple"
              >
                {rules.map((rule, index) => (
                  <AccordionItem
                    key={index}
                    classNames={{
                      base: '!pl-5 !pr-8 !bg-basic-gray border border-basic-gray data-[open=true]:!bg-black data-[open=true]:border-basic-yellow',
                      indicator: 'text-[#EBDDB6] text-lg data-[open=true]:rotate-180',
                      heading: '[&>button]:items-start',
                      content: 'pt-0 pb-10 text-[#7B7B7B]',
                    }}
                    aria-label={rule.title}
                    title={
                      <div className="text-lg leading-5 flex">
                        <div className="text-basic-yellow text-base leading-none inline-block w-10 shrink-0">
                          Q{index + 1}
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: rule.title }}></div>
                      </div>
                    }
                    indicator={({ isOpen }) => (
                      <S3Image
                        className="w-5 aspect-square object-contain"
                        src={`/icons/${isOpen ? 'minus' : 'plus'}.png`}
                      />
                    )}
                  >
                    <div className="flex flex-nowrap">
                      <div className="shrink-0 w-10 text-basic-yellow text-base">A{index + 1}</div>
                      <div
                        className="flex-1 text-base leading-[1.875rem] [&>a]:cursor-pointer [&>a]:font-bold [&>a]:text-basic-yellow [&>a]:hover:underline"
                        dangerouslySetInnerHTML={{ __html: rule.content }}
                      ></div>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default FAQModal;
